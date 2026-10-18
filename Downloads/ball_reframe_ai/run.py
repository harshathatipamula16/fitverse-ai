"""CLI entry point:  python run.py --video input/clip.mp4"""
import argparse
from pathlib import Path

from reframe_engine.docs_writer import write_performance_summary, write_readme
from reframe_engine.media_io import probe_video, validate_video
from reframe_engine.runner import run_pipeline
from reframe_engine.settings import Settings


def _size(txt):
    w, h = txt.lower().split("x")
    return int(w), int(h)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Detect, track, follow the ball with a 9:16 virtual camera.")
    ap.add_argument("--video", required=True)
    ap.add_argument("--tasks", type=int, nargs="+", default=[1, 2, 3])
    ap.add_argument("--model", default="yolo11s.pt", help="player detector weights")
    ap.add_argument("--tracker", default="bytetrack.yaml")
    ap.add_argument("--ball-model", default=None, help="optional separate (e.g. fine-tuned) ball weights")
    ap.add_argument("--ball-cls", type=int, default=32, help="class id of the ball in the ball model")
    ap.add_argument("--ball-conf", type=float, default=0.10)
    ap.add_argument("--ball-imgsz", type=int, default=1280)
    ap.add_argument("--ball-tiles", type=int, nargs=2, default=[1, 1], metavar=("COLS", "ROWS"),
                    help="sliced inference for tiny balls, e.g. --ball-tiles 2 1")
    ap.add_argument("--alpha", type=float, default=0.10, help="EMA alpha (0.05-0.15)")
    ap.add_argument("--causal", action="store_true", help="past-only EMA (live-style) instead of zero-lag offline")
    ap.add_argument("--camera-mode", default="vertical_9_16", choices=["vertical_9_16", "zoom_16_9"])
    ap.add_argument("--out-size", type=_size, default=None, help="vertical output size, e.g. 720x1280")
    ap.add_argument("--max-frames", type=int, default=None, help="quick test on the first N frames")
    ap.add_argument("--project-dir", default=str(Path(__file__).parent))
    a = ap.parse_args()

    s = Settings(input_video=a.video, project_dir=a.project_dir, model_name=a.model, tracker=a.tracker,
                 ball_model_name=a.ball_model, ball_cls=a.ball_cls, ball_conf=a.ball_conf, ball_imgsz=a.ball_imgsz,
                 ball_tiles=tuple(a.ball_tiles), ema_alpha=a.alpha,
                 smoothing="causal" if a.causal else "bidirectional",
                 camera_mode=a.camera_mode, virtual_out_size=a.out_size)
    info = probe_video(s.input_video)
    m = run_pipeline(s, tasks=a.tasks, max_frames=a.max_frames)
    vals = {k: validate_video(p, expected_frames=m["frames_processed"]) for k, p in m["outputs"].items()}
    write_performance_summary(s, info, m, vals, Path(s.project_dir) / "performance_summary.md")
    write_readme(s, info, m, Path(s.project_dir) / "README.md")
    print({k: v["passed"] for k, v in vals.items()})
