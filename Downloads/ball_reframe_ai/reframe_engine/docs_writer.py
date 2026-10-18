"""Generates performance_summary.md and README.md from MEASURED values (nothing hand-typed)."""
import platform
import shutil
from pathlib import Path


def hardware_string():
    try:
        import torch
        if torch.cuda.is_available():
            return f"GPU: {torch.cuda.get_device_name(0)} (CUDA {torch.version.cuda})"
    except Exception:
        pass
    return f"CPU only ({platform.processor() or platform.machine()})"


def _short_life_key(ts):
    ks = [k for k in ts if k.startswith("short_lived")]
    return ts[ks[0]] if ks else "n/a"


def write_performance_summary(s, info, m, validations, path):
    i, ts, bc = info, m.get("track_stats") or {}, m.get("ball_camera") or {}
    rows = "\n".join(f"| {k} | {v['frames_readable']} | {v['width']}x{v['height']} | {v['fps']:.2f} | "
                     f"{v['size_mb']:.1f} | {'PASS' if v['passed'] else 'FAIL'} |" for k, v in validations.items())
    sc = m["ball_state_counts"]
    n = m["frames_processed"]
    text = f"""# Performance Summary

**Player model:** `{m['model']}` (pretrained, no training) | **Tracker:** `{m['tracker']}` via `model.track(persist=True)`  
**Ball model:** `{m['ball_model']}` | conf >= {m['ball_conf']} | imgsz {m['ball_imgsz']} | tiles {m['ball_tiles']}  
**Player threshold:** {m['conf']} (persons) | **Hardware:** {hardware_string()} (torch device `{m['device']}`)

## Source video
{i['width']}x{i['height']}, {i['duration_s']:.1f} s, {i['fps']:.2f} FPS, {i['frame_count']} frames

## Measured speed (tasks run: {m['tasks_run']})
| Measurement | Value |
|---|---|
| Frames processed | {n} / {m['frames_expected']} (no frame skipping: {m['all_frames_processed']}) |
| Detect stage (player track + ball pass) | {m['detect_stage_time_s']:.2f} s |
| Render stage (analytics + drawing + frame writing) | {m['render_stage_time_s']:.2f} s |
| **End-to-end FPS** (both stages, excl. final H.264 re-encode) | **{m['end_to_end_fps']:.2f}** |
| Player detect + track only | {m['player_track_fps']:.2f} FPS |
| Ball detection pass only | {m['ball_detect_fps']:.2f} FPS |
| Final H.264 re-encode | {m['encode_time_s']:.2f} s |

*FPS here is processing speed, independent of the source video's playback FPS ({i['fps']:.2f}).*

## Ball tracking result
| Ball state | Frames | Share |
|---|---|---|
""" + "\n".join(f"| {k} | {v} | {100 * v / n:.1f}% |" for k, v in sorted(sc.items(), key=lambda kv: -kv[1])) + f"""

- Frames with any raw ball candidate (conf >= {m['ball_conf']}): {m['frames_with_raw_ball_candidate']} of {n}
- Frames covered by the final ball track (detected + interpolated + predicted): {m['ball_covered_frames_pct']:.1f}%
- Static false-positive candidates down-weighted: {m['static_candidates_penalised']}

## Ball camera ({bc.get('mode')}, smoothing `{bc.get('smoothing')}`, alpha {bc.get('alpha')})
- Crop {bc.get('crop_size')} -> output {bc.get('output_size')}
- Tracked ball inside the crop: {bc.get('ball_in_crop_pct_all_tracked', 0) or 0:.1f}% of tracked frames; {bc.get('ball_in_crop_pct_detected_only', 0) or 0:.1f}% of frames where the ball was actually *detected*
- Jitter (mean |2nd difference| of x, px): raw target {bc.get('raw_target_jerk_px', 0):.2f} -> smoothed crop {bc.get('smoothed_crop_jerk_px', 0):.2f}; max pan {bc.get('max_pan_px_per_frame', 0):.1f} px/frame

## Output validation (every frame read back)
| Output | Readable frames | Resolution | FPS | MB | Result |
|---|---|---|---|---|---|
{rows}

## Player tracking observations (automatic, no ground truth)
- Unique person IDs: {ts.get('unique_person_ids', 'n/a')} | short-lived IDs (< 25 frames): {_short_life_key(ts)}
- Suspected ID switches (heuristic only): {ts.get('suspected_id_switches_heuristic', 'n/a')}
- Mean / max players per frame: {ts.get('mean_players_per_frame', 0):.1f} / {ts.get('max_players_in_frame', 'n/a')}
- CoA modes: {m['coa_mode_counts']} | frames without CoA: {m['frames_without_coa']}
"""
    Path(path).write_text(text)
    return text


def write_readme(s, info, m, path, observed_notes=""):
    bc = m.get("ball_camera", {})
    text = f"""# Ball-Following Sports Auto-Reframe (Computer Vision Assessment)

Detects and tracks players, **tracks the ball through occlusions**, computes spatial analytics, and drives a
9:16 virtual camera that **follows the ball** (falls back to the players' Center of Action only when the ball is unknown).
Only pretrained weights are used - nothing is trained.

## Install
Python 3.9+. `pip install -r requirements.txt` (ffmpeg is optional but recommended: outputs are re-encoded to H.264).
Colab: runtime -> T4 GPU, `!pip install ultralytics lapx`.

## Run
```
python run.py --video input/clip.mp4                       # all tasks, vertical 9:16 ball camera
python run.py --video input/clip.mp4 --out-size 720x1280   # upscale the vertical feed
python run.py --video input/clip.mp4 --ball-tiles 2 1      # sliced inference, helps tiny balls (slower)
python run.py --video input/clip.mp4 --ball-model my_ball.pt --ball-cls 0   # your own fine-tuned ball weights
python run.py --video input/clip.mp4 --causal              # past-only EMA (live-style camera)
python run.py --video input/clip.mp4 --max-frames 120      # quick smoke test
```

## Pipeline
1. **Detect stage** (each frame once): players via `model.track(persist=True)` (`{m['tracker']}`, persons only, conf >= {m['conf']});
   ball via a *separate* low-threshold ({m['ball_conf']}), higher-resolution ({m['ball_imgsz']}) pass.
2. **Analyse stage:** ball trajectory, footpoints, Center of Action, camera path.
3. **Render stage** (frames read again): `01_tracking.mp4`, `02_analytics.mp4`, `03_ball_cam_overlay.mp4`, `03_ball_cam_vertical.mp4`.

## Task 1 - detection and tracking
Persons and the ball only (COCO classes 0 and 32). `01_tracking.mp4` shows boxes, labels, confidence and persistent Track IDs
for detections at the assignment threshold ({m['conf']}). Each run builds new model objects, so tracker state starts clean.

## Task 2 - footpoints, trails, Center of Action, HUD
- Footpoint = bottom-centre of the person box `(x_center, y2)`; per-ID `deque(maxlen={s.trail_len})` -> trails of different players are never joined.
- **Center of Action:** if the ball position is known (detected or interpolated):
  `CoA = ({s.w_ball}*ball + {s.w_players}*median(player footpoints)) / ({s.w_ball}+{s.w_players})`; otherwise the player median; last CoA held up to {s.coa_hold_frames} frames if nothing is valid.
- HUD: processing FPS, active players, ball state, CoA mode, frame counter. Yellow dot = ball detected, orange ring = interpolated, grey ring = predicted.

## Ball tracking (why it works better than a per-frame threshold)
A COCO detector sees a broadcast ball as a few blurry pixels, so a threshold of 0.35-0.5 drops almost every true detection.
Instead:
1. **Keep weak candidates** (conf >= {s.ball_conf}) and remove junk: wrong size/aspect, far from the players, down-weight candidates on a player's head.
2. **Down-weight static candidates** that keep reappearing at the same pixel (logos, line marks) - a real ball moves in a panning shot.
3. **Dynamic programming over time:** the best chain of candidates with plausible speed (<= {s.ball_vmax_frac:.0%} of frame width per frame, gaps up to {s.ball_max_gap} frames) wins.
   Isolated, unlinked detections must be strong to be accepted, so random false positives rarely survive.
4. **Interpolate** short gaps (ball hidden behind a player) and **coast** {s.ball_coast_frames} frames past segment ends with decaying velocity.

## Task 3 - ball-following vertical camera
- Crop {bc.get('crop_size')} (full height, 9:16) centred horizontally on the ball; output {bc.get('output_size')}. Mode `{s.camera_mode}` (`zoom_16_9` also available).
- **Smoothing** (`{s.smoothing}`): EMA `x_smooth[t] = alpha*x_raw[t] + (1-alpha)*x_smooth[t-1]`, alpha = {s.ema_alpha}.
  `bidirectional` averages a forward and a backward EMA so the camera does not lag behind the ball (offline only); `--causal` uses the plain forward EMA.
  A speed limit of {s.max_pan_frac:.1%} of the frame width per frame stops sudden whips.
- **Clamping:** the target centre is clipped to `[crop_w/2, W-crop_w/2]` before smoothing and the final rectangle is clipped to the frame.
- **Fallback:** while the ball is unknown (beyond the coasting window) the camera follows the players' Center of Action and the smoothing blends the transition.
- Measured: ball inside the crop {bc.get('ball_in_crop_pct_all_tracked', 0) or 0:.1f}% of tracked frames.

## Outputs
| File | Content |
|---|---|
| `outputs/01_tracking.mp4` | boxes, labels, confidence, Track IDs |
| `outputs/02_analytics.mp4` | + footpoints, trails, tracked ball + trail, CoA marker, HUD |
| `outputs/03_ball_cam_overlay.mp4` | Task 2 view + stabilized ball-camera rectangle |
| `outputs/03_ball_cam_vertical.mp4` | cropped, stabilized vertical feed |
| `outputs/frame_log.csv`, `metrics.json` | per-frame ball / CoA / crop log, run metrics |

Videos over 25 MB: upload to Google Drive/YouTube and link here: `<ADD LINK>`

## Results
See `performance_summary.md` (hardware: {hardware_string()}).

## Known limitations & future improvements
{observed_notes or "<Add after watching the videos: ID switches, missed ball, fast pans, referees detected as players.>"}

- A generic COCO ball detector is weak on small broadcast balls; `--ball-tiles`, a bigger ball model or fine-tuned ball weights are the biggest accuracy levers.
- Interpolated / predicted ball positions are estimates; during long occlusions the camera relies on them or on the player CoA.
- Offline two-pass design uses future frames (zero-lag camera); a live system must use `--causal` and accepts some lag.
- A ball resting at the same pixel for a long time (fixed camera, set piece) is treated like a static false positive and down-weighted.
- Tracker IDs can swap during occlusions (see the heuristic count in `performance_summary.md`); BoT-SORT with camera-motion compensation or ReID would help on fast pans.
- Referees / ball boys are detected as `person` (no COCO "player" class); a pitch mask or team-colour filter would remove them.
- Footpoints are in image pixels; a homography to field coordinates would remove perspective effects.
"""
    Path(path).write_text(text)
    return text


def make_zip(project_dir, zip_base):
    project_dir = Path(project_dir)
    return shutil.make_archive(str(zip_base), "zip", root_dir=project_dir.parent, base_dir=project_dir.name)
