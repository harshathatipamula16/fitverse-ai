# Ball-Following Sports Auto-Reframe (Computer Vision Assessment)

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
1. **Detect stage** (each frame once): players via `model.track(persist=True)` (`bytetrack.yaml`, persons only, conf >= 0.35);
   ball via a *separate* low-threshold (0.1), higher-resolution (1280) pass.
2. **Analyse stage:** ball trajectory, footpoints, Center of Action, camera path.
3. **Render stage** (frames read again): `01_tracking.mp4`, `02_analytics.mp4`, `03_ball_cam_overlay.mp4`, `03_ball_cam_vertical.mp4`.

## Task 1 - detection and tracking
Persons and the ball only (COCO classes 0 and 32). `01_tracking.mp4` shows boxes, labels, confidence and persistent Track IDs
for detections at the assignment threshold (0.35). Each run builds new model objects, so tracker state starts clean.

## Task 2 - footpoints, trails, Center of Action, HUD
- Footpoint = bottom-centre of the person box `(x_center, y2)`; per-ID `deque(maxlen=25)` -> trails of different players are never joined.
- **Center of Action:** if the ball position is known (detected or interpolated):
  `CoA = (3.0*ball + 1.0*median(player footpoints)) / (3.0+1.0)`; otherwise the player median; last CoA held up to 15 frames if nothing is valid.
- HUD: processing FPS, active players, ball state, CoA mode, frame counter. Yellow dot = ball detected, orange ring = interpolated, grey ring = predicted.

## Ball tracking (why it works better than a per-frame threshold)
A COCO detector sees a broadcast ball as a few blurry pixels, so a threshold of 0.35-0.5 drops almost every true detection.
Instead:
1. **Keep weak candidates** (conf >= 0.1) and remove junk: wrong size/aspect, far from the players, down-weight candidates on a player's head.
2. **Down-weight static candidates** that keep reappearing at the same pixel (logos, line marks) - a real ball moves in a panning shot.
3. **Dynamic programming over time:** the best chain of candidates with plausible speed (<= 8% of frame width per frame, gaps up to 12 frames) wins.
   Isolated, unlinked detections must be strong to be accepted, so random false positives rarely survive.
4. **Interpolate** short gaps (ball hidden behind a player) and **coast** 8 frames past segment ends with decaying velocity.

## Task 3 - ball-following vertical camera
- Crop [242, 432] (full height, 9:16) centred horizontally on the ball; output [720, 1280]. Mode `vertical_9_16` (`zoom_16_9` also available).
- **Smoothing** (`bidirectional`): EMA `x_smooth[t] = alpha*x_raw[t] + (1-alpha)*x_smooth[t-1]`, alpha = 0.1.
  `bidirectional` averages a forward and a backward EMA so the camera does not lag behind the ball (offline only); `--causal` uses the plain forward EMA.
  A speed limit of 1.5% of the frame width per frame stops sudden whips.
- **Clamping:** the target centre is clipped to `[crop_w/2, W-crop_w/2]` before smoothing and the final rectangle is clipped to the frame.
- **Fallback:** while the ball is unknown (beyond the coasting window) the camera follows the players' Center of Action and the smoothing blends the transition.
- Measured: ball inside the crop 92.9% of tracked frames.

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
See `performance_summary.md` (hardware: CPU only (Intel64 Family 6 Model 142 Stepping 9, GenuineIntel)).

## Known limitations & future improvements
<Add after watching the videos: ID switches, missed ball, fast pans, referees detected as players.>

- A generic COCO ball detector is weak on small broadcast balls; `--ball-tiles`, a bigger ball model or fine-tuned ball weights are the biggest accuracy levers.
- Interpolated / predicted ball positions are estimates; during long occlusions the camera relies on them or on the player CoA.
- Offline two-pass design uses future frames (zero-lag camera); a live system must use `--causal` and accepts some lag.
- A ball resting at the same pixel for a long time (fixed camera, set piece) is treated like a static false positive and down-weighted.
- Tracker IDs can swap during occlusions (see the heuristic count in `performance_summary.md`); BoT-SORT with camera-motion compensation or ReID would help on fast pans.
- Referees / ball boys are detected as `person` (no COCO "player" class); a pitch mask or team-colour filter would remove them.
- Footpoints are in image pixels; a homography to field coordinates would remove perspective effects.
