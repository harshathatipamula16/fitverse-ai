"""All drawing code (kept separate from detection / tracking / camera logic)."""
import colorsys

import cv2
import numpy as np

FONT = cv2.FONT_HERSHEY_SIMPLEX


def id_color(tid):
    """Stable, well-separated colour per Track ID (BGR)."""
    h = (tid * 0.61803398875) % 1.0
    r, g, b = colorsys.hsv_to_rgb(h, 0.85, 1.0)
    return int(b * 255), int(g * 255), int(r * 255)


def _label(img, text, x, y, color, scale=0.5):
    (tw, th), bl = cv2.getTextSize(text, FONT, scale, 1)
    y0 = max(th + 4, y)
    cv2.rectangle(img, (x, y0 - th - 4), (x + tw + 4, y0 + bl - 2), color, -1)
    cv2.putText(img, text, (x + 2, y0 - 3), FONT, scale, (0, 0, 0), 1, cv2.LINE_AA)


def draw_person(img, det, show_conf=True):
    x1, y1, x2, y2 = [int(v) for v in det.box]
    if det.track_id is None:
        color, txt = (170, 170, 170), f"person {det.conf:.2f}" if show_conf else "person"
    else:
        color = id_color(det.track_id)
        txt = f"ID {det.track_id}" + (f" {det.conf:.2f}" if show_conf else "")
    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
    _label(img, txt, x1, y1, color)


def draw_ball(img, det):
    x1, y1, x2, y2 = [int(v) for v in det.box]
    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 255), 2)
    _label(img, f"ball {det.conf:.2f}" + (f" #{det.track_id}" if det.track_id is not None else ""),
           x1, y1, (0, 255, 255))


def draw_footpoint(img, xy, color):
    p = (int(xy[0]), int(xy[1]))
    cv2.circle(img, p, 5, (0, 0, 0), -1, cv2.LINE_AA)
    cv2.circle(img, p, 3, color, -1, cv2.LINE_AA)


def draw_trail(img, segments, color):
    """Polyline whose thickness grows toward the newest point (oldest = thin tail)."""
    for seg in segments:
        n = len(seg)
        for i in range(1, n):
            th = 1 + int(3 * i / max(n - 1, 1))
            cv2.line(img, tuple(seg[i - 1]), tuple(seg[i]), color, th, cv2.LINE_AA)


def draw_coa(img, xy, mode):
    x, y = int(xy[0]), int(xy[1])
    col = (255, 0, 255) if "held" not in mode else (180, 100, 180)
    cv2.circle(img, (x, y), 26, (0, 0, 0), 5, cv2.LINE_AA)
    cv2.circle(img, (x, y), 26, col, 2, cv2.LINE_AA)
    cv2.circle(img, (x, y), 4, col, -1, cv2.LINE_AA)
    for dx, dy in [(-42, 0), (14, 0), (0, -42), (0, 14)]:
        p1 = (x + dx, y + dy)
        p2 = (x + dx + (28 if dx else 0), y + dy + (28 if dy else 0))
        cv2.line(img, p1, p2, (0, 0, 0), 4, cv2.LINE_AA)
        cv2.line(img, p1, p2, col, 2, cv2.LINE_AA)
    _label(img, "CoA", x + 30, y - 30, col, 0.5)


def draw_hud(img, proc_fps, n_players, coa_mode, frame_idx, total_frames, ball_state="lost"):
    lines = [
        "FPS (processing): " + ("--" if proc_fps is None else f"{proc_fps:.1f}"),
        f"Active players: {n_players}",
        f"Ball: {ball_state}",
        f"CoA: {coa_mode}",
        f"Frame {frame_idx + 1}/{total_frames}",
    ]
    pad, lh = 10, 24
    w = 290
    h = pad * 2 + lh * len(lines)
    overlay = img.copy()
    cv2.rectangle(overlay, (10, 10), (10 + w, 10 + h), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.6, img, 0.4, 0, img)
    for i, t in enumerate(lines):
        cv2.putText(img, t, (10 + pad, 10 + pad + 17 + i * lh), FONT, 0.6, (255, 255, 255), 1, cv2.LINE_AA)


BALL_COLORS = {"detected": (0, 255, 255), "interpolated": (0, 165, 255), "predicted": (200, 200, 200)}


def draw_ball_trail(img, pts):
    """pts: list of (x, y, state) oldest -> newest."""
    for i in range(1, len(pts)):
        th = 1 + int(2 * i / max(len(pts) - 1, 1))
        cv2.line(img, (int(pts[i - 1][0]), int(pts[i - 1][1])), (int(pts[i][0]), int(pts[i][1])),
                 BALL_COLORS[pts[i][2]], th, cv2.LINE_AA)


def draw_tracked_ball(img, bp):
    """Filled dot = detected, ring = interpolated / predicted (the ball is estimated, not seen)."""
    p = (int(bp.x), int(bp.y))
    col = BALL_COLORS[bp.state]
    cv2.circle(img, p, 9, (0, 0, 0), 3, cv2.LINE_AA)
    if bp.state == "detected":
        cv2.circle(img, p, 6, col, -1, cv2.LINE_AA)
    else:
        cv2.circle(img, p, 9, col, 2, cv2.LINE_AA)
    _label(img, f"BALL ({bp.state})", p[0] + 12, p[1] - 10, col, 0.45)


def draw_crop_rect(img, rect, label="Ball camera"):
    """White box + dark outline: readable on grass, unlike green."""
    x1, y1, x2, y2 = rect
    cv2.rectangle(img, (x1, y1), (x2 - 1, y2 - 1), (0, 0, 0), 5)
    cv2.rectangle(img, (x1, y1), (x2 - 1, y2 - 1), (255, 255, 255), 3)
    _label(img, label, x1 + 6, y1 + 26, (255, 255, 255), 0.6)
