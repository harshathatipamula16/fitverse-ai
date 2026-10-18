"""Central settings. Every tunable value lives here so the README can describe it exactly."""
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple


@dataclass
class Settings:
    # ---- paths ---------------------------------------------------------------
    input_video: str = "input/clip.mp4"
    project_dir: str = "."

    # ---- Task 1: player detection + tracking ---------------------------------
    model_name: str = "yolo11s.pt"        # pretrained COCO weights (yolov8n/s, yolo11n/s allowed)
    tracker: str = "bytetrack.yaml"       # or "botsort.yaml"
    conf: float = 0.35                    # assignment threshold for persons (and ball in the Task 1 video)
    person_cls: int = 0
    imgsz: int = 960
    device: str = "auto"

    # ---- ball detector (separate low-threshold, high-resolution pass) -------
    ball_model_name: Optional[str] = None  # None = same weights as players; or your own fine-tuned ball model
    ball_cls: int = 32                     # COCO 'sports ball'; change if your custom model uses another id
    ball_conf: float = 0.10                # LOW on purpose: the tracker, not the threshold, rejects false positives
    ball_imgsz: int = 1280                 # small ball -> upscale more than the player pass
    ball_tiles: Tuple[int, int] = (1, 1)   # (cols, rows) sliced inference, e.g. (2, 1) helps tiny balls
    tile_overlap: float = 0.20
    ball_nms_iou: float = 0.50
    ball_top_k: int = 8                    # keep the K best candidates per frame (bounds DP cost)

    # ---- ball candidate filters ----------------------------------------------
    ball_max_area_frac: float = 0.01
    ball_min_side: float = 2.0
    ball_aspect_range: Tuple[float, float] = (0.5, 2.0)
    ball_max_dist_frac: float = 0.50       # of frame diagonal, measured from the player median
    head_zone_frac: float = 0.20           # top 20% of a person box = "head zone"
    head_penalty: float = 0.5              # score multiplier for candidates sitting on a head

    # recurring-at-the-same-pixel detections are usually fixed false positives (logo, spot, cone)
    static_cell_px: float = 6.0
    static_min_hits: int = 8
    static_frac: float = 0.03              # ...hits >= max(static_min_hits, static_frac * n_frames)
    static_penalty: float = 0.25           # score multiplier for such candidates (not a hard delete)

    # ---- ball trajectory (offline dynamic programming) -----------------------
    ball_vmax_frac: float = 0.08           # max ball speed, fraction of frame width per frame
    ball_max_gap: int = 12                 # frames a ball may be missed and still be linked/interpolated
    ball_reset_penalty: float = 0.60       # cost of starting a new, unlinked segment
    ball_gap_penalty: float = 0.03         # cost per missed frame inside a link
    ball_dist_penalty: float = 0.80        # cost for large jumps inside a link
    ball_coast_frames: int = 8             # extrapolate this many frames past a segment end
    ball_coast_decay: float = 0.85

    # ---- Task 2: analytics ---------------------------------------------------
    trail_len: int = 25
    trail_max_gap: int = 5
    trail_prune_after: int = 150
    w_ball: float = 3.0
    w_players: float = 1.0
    coa_hold_frames: int = 15

    # ---- Task 3: ball-following virtual camera -------------------------------
    camera_mode: str = "vertical_9_16"     # or "zoom_16_9"
    vertical_aspect: Tuple[int, int] = (9, 16)
    zoom_factor: float = 0.5
    ema_alpha: float = 0.10                # assignment recommends 0.05 - 0.15
    smoothing: str = "bidirectional"       # "bidirectional" (zero lag, offline) or "causal" (plain EMA, live-style)
    max_pan_frac: float = 0.015            # max camera pan per frame, fraction of frame width
    virtual_out_size: Optional[Tuple[int, int]] = None   # None = native crop size, e.g. (720, 1280)

    # ---- HUD / misc ----------------------------------------------------------
    fps_window: int = 30
    jpg_quality: int = 90

    @property
    def output_dir(self) -> Path:
        return Path(self.project_dir) / "outputs"

    @property
    def player_classes(self):
        return [self.person_cls]
