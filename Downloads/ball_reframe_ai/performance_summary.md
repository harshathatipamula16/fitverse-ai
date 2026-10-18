# Performance Summary

**Player model:** `yolo11s.pt` (pretrained, no training) | **Tracker:** `bytetrack.yaml` via `model.track(persist=True)`  
**Ball model:** `yolo11s.pt` | conf >= 0.1 | imgsz 1280 | tiles [1, 1]  
**Player threshold:** 0.35 (persons) | **Hardware:** CPU only (Intel64 Family 6 Model 142 Stepping 9, GenuineIntel) (torch device `cpu`)

## Source video
768x432, 40.4 s, 25.00 FPS, 1009 frames

## Measured speed (tasks run: [1, 2, 3])
| Measurement | Value |
|---|---|
| Frames processed | 1009 / 1009 (no frame skipping: True) |
| Detect stage (player track + ball pass) | 1570.08 s |
| Render stage (analytics + drawing + frame writing) | 38.65 s |
| **End-to-end FPS** (both stages, excl. final H.264 re-encode) | **0.63** |
| Player detect + track only | 1.75 FPS |
| Ball detection pass only | 1.02 FPS |
| Final H.264 re-encode | 0.10 s |

*FPS here is processing speed, independent of the source video's playback FPS (25.00).*

## Ball tracking result
| Ball state | Frames | Share |
|---|---|---|
| detected | 541 | 53.6% |
| lost | 265 | 26.3% |
| predicted | 111 | 11.0% |
| interpolated | 92 | 9.1% |

- Frames with any raw ball candidate (conf >= 0.1): 621 of 1009
- Frames covered by the final ball track (detected + interpolated + predicted): 73.7%
- Static false-positive candidates down-weighted: 192

## Ball camera (vertical_9_16, smoothing `bidirectional`, alpha 0.1)
- Crop [242, 432] -> output [720, 1280]
- Tracked ball inside the crop: 92.9% of tracked frames; 94.3% of frames where the ball was actually *detected*
- Jitter (mean |2nd difference| of x, px): raw target 13.81 -> smoothed crop 0.92; max pan 12.0 px/frame

## Output validation (every frame read back)
| Output | Readable frames | Resolution | FPS | MB | Result |
|---|---|---|---|---|---|
| task1 | 1009 | 768x432 | 25.00 | 26.9 | PASS |
| task2 | 1009 | 768x432 | 25.00 | 28.5 | PASS |
| crop_overlay | 1009 | 768x432 | 25.00 | 31.7 | PASS |
| virtual | 1009 | 720x1280 | 25.00 | 20.8 | PASS |

## Player tracking observations (automatic, no ground truth)
- Unique person IDs: 121 | short-lived IDs (< 25 frames): 38
- Suspected ID switches (heuristic only): 26
- Mean / max players per frame: 11.9 / 17
- CoA modes: {'ball+players': 633, 'players median': 376} | frames without CoA: 0
