"""Two-stage pipeline.
Stage A (detect):  every frame is read once -> player detections + tracker IDs, low-threshold ball candidates.
Stage B (analyse): ball trajectory (offline DP), footpoints, Center of Action, ball-following camera path.
Stage C (render):  every frame is read again -> Task 1 / Task 2 / Task 3 videos.
Two passes are needed because the ball trajectory and the zero-lag camera use FUTURE frames (offline only);
use smoothing='causal' for a live-style, past-only camera. No frame is ever skipped."""
import csv
import json
import time
from collections import Counter, deque
from pathlib import Path

import cv2
import numpy as np

from . import overlay as viz
from .ball_camera import BallCamera
from .ball_tracker import DETECTED, INTERPOLATED, LOST, PREDICTED, filter_candidates, penalize_static, solve_trajectory
from .detector import Detector
from .media_io import VideoSink, probe_video
from .spatial import ActionCenter, TrackQuality, TrailBook, foot_point

CAM_STATES = (DETECTED, INTERPOLATED, PREDICTED)     # ball states the camera is allowed to follow
COA_STATES = (DETECTED, INTERPOLATED)                # predicted (coasting) positions are too uncertain for the CoA


def run_pipeline(s, tasks=(1, 2, 3), max_frames=None, verbose=True, detector=None):
    tasks = set(tasks)
    if 3 in tasks:
        tasks |= {1, 2}
    if 2 in tasks:
        tasks.add(1)

    out_dir = s.output_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "samples").mkdir(exist_ok=True)
    src = Path(s.input_video).resolve()
    if out_dir.resolve() in src.parents:
        raise ValueError("Input video must not be inside the outputs folder (never process an annotated output).")

    info = probe_video(s.input_video)
    W, H, fps, n_expected = info["width"], info["height"], info["fps"], info["frame_count"]
    total = min(n_expected, max_frames) if max_frames else n_expected
    detector = detector or Detector(s)             # injectable for tests; default = fresh model + tracker state

    # ======================================================== Stage A: detect
    persons_all, balls_all = [], []
    t_player = t_ball = 0.0
    cap = cv2.VideoCapture(s.input_video)
    t_start = time.perf_counter()
    while len(persons_all) < total:
        ok, frame = cap.read()
        if not ok:
            break
        t0 = time.perf_counter()
        persons_all.append(detector.track_players(frame))
        t1 = time.perf_counter()
        balls_all.append(detector.find_balls(frame))
        t_ball += time.perf_counter() - t1
        t_player += t1 - t0
        if verbose and len(persons_all) % 100 == 0:
            print(f"  [detect] {len(persons_all)}/{total} frames")
    cap.release()
    n = len(persons_all)
    t_detect = time.perf_counter() - t_start

    # ======================================================== Stage B: analyse
    foot_lists = [[foot_point(p.box) for p in ps] for ps in persons_all]
    medians = [ActionCenter.player_median(fl) for fl in foot_lists]
    cands = [filter_candidates(balls_all[i], persons_all[i], medians[i], W, H, s) for i in range(n)]
    n_static = penalize_static(cands, s)
    traj = solve_trajectory(cands, W, s)

    coa_tr, stats = ActionCenter(s), TrackQuality(W)
    coa_list, coa_modes = [], Counter()
    focus = np.full((n, 2), np.nan)
    for i in range(n):
        bp = traj[i]
        ball_for_coa = (bp.x, bp.y) if (bp and bp.state in COA_STATES) else None
        coa, mode = coa_tr.update(i, ball_for_coa, foot_lists[i])
        coa_list.append((coa, mode))
        coa_modes[mode] += 1
        foot_by_id = {p.track_id: foot_point(p.box) for p in persons_all[i] if p.track_id is not None}
        stats.update(i, foot_by_id, len(persons_all[i]))
        if bp and bp.state in CAM_STATES:                 # camera follows the BALL...
            focus[i] = (bp.x, bp.y)
        elif coa is not None:                             # ...and only falls back to the players' CoA without one
            focus[i] = coa
    cam = BallCamera(W, H, s) if 3 in tasks else None
    rects, raw_cx, smooth_cx = cam.plan(focus) if cam else (None, None, None)

    # ======================================================== Stage C: render
    paths = {"task1": out_dir / "01_tracking.mp4"}
    sinks = {"task1": VideoSink(paths["task1"], fps, (W, H))}
    if 2 in tasks:
        paths["task2"] = out_dir / "02_analytics.mp4"
        sinks["task2"] = VideoSink(paths["task2"], fps, (W, H))
    if 3 in tasks:
        paths["crop_overlay"] = out_dir / "03_ball_cam_overlay.mp4"
        paths["virtual"] = out_dir / "03_ball_cam_vertical.mp4"
        sinks["crop_overlay"] = VideoSink(paths["crop_overlay"], fps, (W, H))
        sinks["virtual"] = VideoSink(paths["virtual"], fps, cam.out_size)

    trails = TrailBook(s.trail_len, s.trail_max_gap, s.trail_prune_after)
    ball_trail = deque(maxlen=s.trail_len)
    frame_times = deque(maxlen=s.fps_window)
    sample_idx = {n // 4, n // 2, (3 * n) // 4}
    cap = cv2.VideoCapture(s.input_video)
    t_render0 = time.perf_counter()
    try:
        for i in range(n):
            t_frame = time.perf_counter()
            ok, frame = cap.read()
            if not ok:
                break
            persons, bp = persons_all[i], traj[i]
            coa, mode = coa_list[i]

            f1 = frame.copy()                                  # Task 1: raw detections at the assignment threshold
            for p in persons:
                viz.draw_person(f1, p)
            for b in balls_all[i]:
                if b.conf >= s.conf:
                    viz.draw_ball(f1, b)
            sinks["task1"].write(f1)

            if 2 in tasks:
                foot_by_id = {p.track_id: foot_point(p.box) for p in persons if p.track_id is not None}
                trails.update(i, foot_by_id)
                f2 = frame.copy()
                for tid in trails.visible_ids(i):
                    viz.draw_trail(f2, trails.segments(tid), viz.id_color(tid))
                for p in persons:
                    viz.draw_person(f2, p, show_conf=False)
                    c = viz.id_color(p.track_id) if p.track_id is not None else (170, 170, 170)
                    viz.draw_footpoint(f2, foot_point(p.box), c)
                if bp is not None:
                    ball_trail.append((bp.x, bp.y, bp.state))
                else:
                    ball_trail.clear()
                viz.draw_ball_trail(f2, list(ball_trail))
                if bp is not None:
                    viz.draw_tracked_ball(f2, bp)
                if coa is not None:
                    viz.draw_coa(f2, coa, mode)
                proc_fps = (len(frame_times) / sum(frame_times)) if frame_times else None
                viz.draw_hud(f2, proc_fps, len(persons), mode, i, n, bp.state if bp else LOST)
                sinks["task2"].write(f2)

            if 3 in tasks:
                f3 = f2.copy()
                viz.draw_crop_rect(f3, rects[i])
                sinks["crop_overlay"].write(f3)
                vc = cam.crop(frame, rects[i])                 # crop from the CLEAN frame
                sinks["virtual"].write(vc)

            if i in sample_idx:
                top = max(tasks)
                cv2.imwrite(str(out_dir / "samples" / f"frame_{i:05d}_task{top}.jpg"),
                            f2 if 2 in tasks else f1, [cv2.IMWRITE_JPEG_QUALITY, s.jpg_quality])
                if 3 in tasks:
                    cv2.imwrite(str(out_dir / "samples" / f"frame_{i:05d}_vertical.jpg"), vc)
            frame_times.append(time.perf_counter() - t_frame)
            if verbose and (i + 1) % 100 == 0:
                print(f"  [render] {i + 1}/{n} frames")
    finally:
        cap.release()
        t_enc0 = time.perf_counter()
        encoders = {}
        for k, sk in sinks.items():
            sk.close()
            encoders[k] = sk.encoder
        t_encode = time.perf_counter() - t_enc0
    t_render = time.perf_counter() - t_render0

    # ======================================================== logs + metrics
    state_counts = Counter((b.state if b else LOST) for b in traj)
    rows = []
    for i in range(n):
        bp, (coa, mode) = traj[i], coa_list[i]
        rows.append({
            "frame": i, "n_players": len(persons_all[i]), "n_ball_raw": len(balls_all[i]),
            "ball_state": bp.state if bp else LOST,
            "ball_x": None if bp is None else round(bp.x, 1), "ball_y": None if bp is None else round(bp.y, 1),
            "ball_conf": None if bp is None else round(bp.conf, 3),
            "coa_x": None if coa is None else round(coa[0], 1), "coa_y": None if coa is None else round(coa[1], 1),
            "coa_mode": mode, "focus_x": None if np.isnan(focus[i, 0]) else round(float(focus[i, 0]), 1),
            "crop_x1": None if rects is None else rects[i][0],
        })
    with open(out_dir / "frame_log.csv", "w", newline="") as fh:
        wr = csv.DictWriter(fh, fieldnames=list(rows[0].keys()) if rows else ["frame"])
        wr.writeheader()
        wr.writerows(rows)

    metrics = {
        "tasks_run": sorted(tasks), "model": s.model_name, "ball_model": s.ball_model_name or s.model_name,
        "tracker": s.tracker, "conf": s.conf, "imgsz": s.imgsz,
        "ball_conf": s.ball_conf, "ball_imgsz": s.ball_imgsz, "ball_tiles": list(s.ball_tiles),
        "device": detector.device,
        "frames_expected": n_expected, "frames_processed": n,
        "all_frames_processed": n == total and (max_frames is None),
        "source_fps": fps, "resolution": f"{W}x{H}",
        "detect_stage_time_s": t_detect, "render_stage_time_s": t_render, "encode_time_s": t_encode,
        "player_track_fps": n / t_player if t_player else 0.0,
        "ball_detect_fps": n / t_ball if t_ball else 0.0,
        "end_to_end_fps": n / (t_detect + t_render) if (t_detect + t_render) else 0.0,
        "encoders": encoders, "outputs": {k: str(v) for k, v in paths.items()},
        "ball_state_counts": dict(state_counts),
        "frames_with_raw_ball_candidate": int(sum(1 for b in balls_all if b)),
        "frames_with_detected_ball_in_track": int(state_counts.get(DETECTED, 0)),
        "static_candidates_penalised": n_static,
        "ball_covered_frames_pct": 100.0 * (n - state_counts.get(LOST, 0)) / n if n else 0.0,
        "coa_mode_counts": dict(coa_modes),
        "frames_without_coa": int(sum(1 for r in rows if r["coa_x"] is None)),
        "track_stats": stats.summary(),
        "suspected_switch_events": stats.suspected_pairs[:20],
    }
    if cam is not None:
        x1 = np.array([r[0] for r in rects], dtype=float)
        inside = [bool(r[0] <= traj[i].x < r[2]) for i, r in enumerate(rects) if traj[i] and traj[i].state in CAM_STATES]
        det_inside = [bool(r[0] <= traj[i].x < r[2]) for i, r in enumerate(rects) if traj[i] and traj[i].state == DETECTED]
        jerk = lambda a: float(np.mean(np.abs(np.diff(a, 2)))) if len(a) > 2 else 0.0
        metrics["ball_camera"] = {
            "mode": s.camera_mode, "smoothing": s.smoothing, "alpha": s.ema_alpha,
            "crop_size": [cam.cw, cam.ch], "output_size": list(cam.out_size),
            "ball_in_crop_pct_all_tracked": 100.0 * float(np.mean(inside)) if inside else None,
            "ball_in_crop_pct_detected_only": 100.0 * float(np.mean(det_inside)) if det_inside else None,
            "raw_target_jerk_px": jerk(raw_cx), "smoothed_crop_jerk_px": jerk(x1),
            "max_pan_px_per_frame": float(np.abs(np.diff(x1)).max()) if len(x1) > 1 else 0.0,
        }
    (out_dir / "metrics.json").write_text(json.dumps(metrics, indent=2))
    if verbose:
        print(f"Done: {n}/{total} frames | end-to-end {metrics['end_to_end_fps']:.1f} FPS | "
              f"players {metrics['player_track_fps']:.1f} FPS | ball pass {metrics['ball_detect_fps']:.1f} FPS | "
              f"ball covered {metrics['ball_covered_frames_pct']:.0f}% ({dict(state_counts)})")
    return metrics
