"""Task 3: ball-following virtual camera (fixed-size crop, smoothed centre, speed limit, boundary clamping)."""
from typing import List, Tuple

import cv2
import numpy as np


def ema(x: np.ndarray, alpha: float) -> np.ndarray:
    """x_smooth[t] = alpha * x[t] + (1 - alpha) * x_smooth[t-1]"""
    out = np.empty_like(x, dtype=np.float64)
    out[0] = x[0]
    for i in range(1, len(x)):
        out[i] = alpha * x[i] + (1.0 - alpha) * out[i - 1]
    return out


def ema_bidirectional(x: np.ndarray, alpha: float) -> np.ndarray:
    """Forward EMA lags behind, backward EMA leads ahead; their average has no net lag (offline only)."""
    return 0.5 * (ema(x, alpha) + ema(x[::-1], alpha)[::-1])


def limit_speed(x: np.ndarray, max_step: float) -> np.ndarray:
    out = x.copy()
    for i in range(1, len(out)):
        out[i] = out[i - 1] + float(np.clip(out[i] - out[i - 1], -max_step, max_step))
    return out


def fill_nan(a: np.ndarray, default: float) -> np.ndarray:
    a = a.astype(np.float64).copy()
    idx = np.where(~np.isnan(a))[0]
    if len(idx) == 0:
        return np.full_like(a, default)
    a[: idx[0]] = a[idx[0]]
    for i in range(idx[0] + 1, len(a)):
        if np.isnan(a[i]):
            a[i] = a[i - 1]
    return a


class BallCamera:
    def __init__(self, frame_w, frame_h, s):
        self.W, self.H, self.s = frame_w, frame_h, s
        self.mode = s.camera_mode
        if self.mode == "vertical_9_16":
            ch = frame_h
            cw = int(round(ch * s.vertical_aspect[0] / s.vertical_aspect[1]))
        elif self.mode == "zoom_16_9":
            cw, ch = int(round(frame_w * s.zoom_factor)), int(round(frame_h * s.zoom_factor))
        else:
            raise ValueError(f"Unknown camera_mode {self.mode}")
        self.cw = max(2, min(cw, frame_w) // 2 * 2)       # even sizes for H.264
        self.ch = max(2, min(ch, frame_h) // 2 * 2)
        self.out_size = tuple(s.virtual_out_size) if s.virtual_out_size else (self.cw, self.ch)

    def plan(self, focus_xy: np.ndarray) -> Tuple[List[Tuple[int, int, int, int]], np.ndarray, np.ndarray]:
        """focus_xy: (n, 2) array, NaN where nothing is known. Returns (rects, raw_cx, smooth_cx)."""
        s = self.s
        fx = fill_nan(focus_xy[:, 0], self.W / 2)
        fy = fill_nan(focus_xy[:, 1], self.H / 2)
        # clamp the TARGET centre first so smoothing state can never wind up outside the valid range
        tx = np.clip(fx, self.cw / 2, self.W - self.cw / 2)
        ty = np.clip(fy, self.ch / 2, self.H - self.ch / 2)
        smooth = ema_bidirectional if s.smoothing == "bidirectional" else ema
        sx = limit_speed(smooth(tx, s.ema_alpha), s.max_pan_frac * self.W)
        sy = limit_speed(smooth(ty, s.ema_alpha), s.max_pan_frac * self.W) if self.mode == "zoom_16_9" else ty
        rects = []
        for cx, cy in zip(sx, sy):
            x1 = int(np.clip(round(cx - self.cw / 2), 0, self.W - self.cw))
            y1 = 0 if self.mode == "vertical_9_16" else int(np.clip(round(cy - self.ch / 2), 0, self.H - self.ch))
            rects.append((x1, y1, x1 + self.cw, y1 + self.ch))
        return rects, tx, sx

    def crop(self, frame, rect):
        x1, y1, x2, y2 = rect
        c = frame[y1:y2, x1:x2]
        if (c.shape[1], c.shape[0]) != self.out_size:
            c = cv2.resize(c, self.out_size, interpolation=cv2.INTER_CUBIC)   # same aspect -> pure scaling
        return c
