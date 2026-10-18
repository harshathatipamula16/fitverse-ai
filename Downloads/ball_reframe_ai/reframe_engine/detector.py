"""Two independent YOLO passes: (1) players with tracking, (2) ball with a low threshold / high resolution.
Two separate model objects are used on purpose: Ultralytics attaches tracker callbacks to a model after
`track()`, so mixing `track()` and `predict()` on one instance corrupts the tracker state."""
from dataclasses import dataclass
from typing import List, Optional, Tuple

import numpy as np


@dataclass
class Detection:
    box: Tuple[float, float, float, float]   # x1, y1, x2, y2
    conf: float
    cls_id: int
    track_id: Optional[int] = None


def resolve_device(pref="auto"):
    import torch
    if pref != "auto":
        return pref
    return "cuda:0" if torch.cuda.is_available() else "cpu"


def parse_results(result, cls_wanted) -> List[Detection]:
    """One Ultralytics Results object -> list of Detection for a single class id. Safe for empty frames."""
    out: List[Detection] = []
    boxes = getattr(result, "boxes", None)
    if boxes is None or len(boxes) == 0:
        return out
    xyxy = boxes.xyxy.cpu().numpy()
    conf = boxes.conf.cpu().numpy()
    cls = boxes.cls.cpu().numpy().astype(int)
    ids = None if boxes.id is None else boxes.id.cpu().numpy().astype(int)
    for i in range(len(xyxy)):
        if int(cls[i]) != cls_wanted:
            continue
        out.append(Detection(tuple(float(v) for v in xyxy[i]), float(conf[i]), int(cls[i]),
                             int(ids[i]) if ids is not None else None))
    return out


def nms(dets: List[Detection], iou_thr: float) -> List[Detection]:
    """Greedy NMS (used to merge the overlapping tiles of sliced inference)."""
    dets = sorted(dets, key=lambda d: -d.conf)
    keep: List[Detection] = []
    for d in dets:
        ax1, ay1, ax2, ay2 = d.box
        ok = True
        for k in keep:
            bx1, by1, bx2, by2 = k.box
            iw, ih = min(ax2, bx2) - max(ax1, bx1), min(ay2, by2) - max(ay1, by1)
            if iw <= 0 or ih <= 0:
                continue
            inter = iw * ih
            union = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
            if union > 0 and inter / union > iou_thr:
                ok = False
                break
        if ok:
            keep.append(d)
    return keep


class Detector:
    """Create a NEW Detector for every run so tracker state starts clean."""

    def __init__(self, s):
        from ultralytics import YOLO
        self.s = s
        self.device = resolve_device(s.device)
        self.player_model = YOLO(s.model_name)
        self.ball_model = YOLO(s.ball_model_name or s.model_name)   # always its own instance

    # ---------------------------------------------------------------- players
    def track_players(self, frame) -> List[Detection]:
        s = self.s
        r = self.player_model.track(frame, persist=True, tracker=s.tracker, conf=s.conf,
                                    classes=s.player_classes, imgsz=s.imgsz, device=self.device,
                                    verbose=False)[0]
        return parse_results(r, s.person_cls)

    # ---------------------------------------------------------------- ball
    def find_balls(self, frame) -> List[Detection]:
        """All ball candidates with conf >= ball_conf (low). Optional sliced inference for tiny balls."""
        s = self.s
        cols, rows = s.ball_tiles
        kw = dict(conf=s.ball_conf, classes=[s.ball_cls], imgsz=s.ball_imgsz, device=self.device, verbose=False)
        if (cols, rows) == (1, 1):
            return parse_results(self.ball_model.predict(frame, **kw)[0], s.ball_cls)

        H, W = frame.shape[:2]
        tw = int(round(W / cols * (1 + s.tile_overlap)))
        th = int(round(H / rows * (1 + s.tile_overlap)))
        tw, th = min(tw, W), min(th, H)
        sx = (W - tw) / (cols - 1) if cols > 1 else 0.0
        sy = (H - th) / (rows - 1) if rows > 1 else 0.0
        tiles, offs = [], []
        for r_ in range(rows):
            for c_ in range(cols):
                x0, y0 = int(round(c_ * sx)), int(round(r_ * sy))
                tiles.append(np.ascontiguousarray(frame[y0:y0 + th, x0:x0 + tw]))
                offs.append((x0, y0))
        merged: List[Detection] = []
        for res, (x0, y0) in zip(self.ball_model.predict(tiles, **kw), offs):
            for d in parse_results(res, s.ball_cls):
                x1, y1, x2, y2 = d.box
                merged.append(Detection((x1 + x0, y1 + y0, x2 + x0, y2 + y0), d.conf, d.cls_id))
        return nms(merged, s.ball_nms_iou)
