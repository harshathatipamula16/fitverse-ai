"""Spatial analytics: footpoints, per-ID trails, Center of Action, tracking statistics."""
from collections import deque
from typing import Dict, List, Tuple

import numpy as np


def foot_point(box) -> Tuple[float, float]:
    """Bottom-centre of a box. Feet touch the ground, so this is steadier than the box centre."""
    x1, y1, x2, y2 = box
    return (x1 + x2) / 2.0, float(y2)


class TrailBook:
    """One bounded deque per Track ID -> trails of different players can never be joined."""

    def __init__(self, maxlen=25, max_gap=5, prune_after=150):
        self.maxlen, self.max_gap, self.prune_after = maxlen, max_gap, prune_after
        self.trails: Dict[int, deque] = {}
        self.last_seen: Dict[int, int] = {}

    def update(self, frame_idx: int, foot_points: Dict[int, Tuple[float, float]]):
        for tid, (x, y) in foot_points.items():
            self.trails.setdefault(tid, deque(maxlen=self.maxlen)).append((frame_idx, x, y))
            self.last_seen[tid] = frame_idx
        for tid in [t for t, f in self.last_seen.items() if frame_idx - f > self.prune_after]:
            self.trails.pop(tid, None)
            self.last_seen.pop(tid, None)

    def visible_ids(self, frame_idx: int) -> List[int]:
        return [t for t, f in self.last_seen.items() if frame_idx - f <= self.max_gap]

    def segments(self, tid: int) -> List[np.ndarray]:
        pts = self.trails.get(tid)
        if not pts:
            return []
        segs, cur, prev_f = [], [], None
        for f, x, y in pts:
            if prev_f is not None and f - prev_f > self.max_gap:
                segs.append(np.array(cur, dtype=np.int32))
                cur = []
            cur.append((x, y))
            prev_f = f
        segs.append(np.array(cur, dtype=np.int32))
        return segs


class ActionCenter:
    """CoA = (w_ball*ball + w_players*median(player footpoints)) / (w_ball + w_players) when a ball position is
    available; player median otherwise; ball alone if no players; last CoA held briefly if nothing is valid."""

    def __init__(self, s):
        self.s = s
        self.last = None
        self.last_frame = None

    @staticmethod
    def player_median(foot_list):
        if not foot_list:
            return None
        a = np.asarray(foot_list, dtype=np.float64)
        return float(np.median(a[:, 0])), float(np.median(a[:, 1]))

    def update(self, frame_idx, ball_xy, foot_list):
        s = self.s
        pm = self.player_median(foot_list)
        if ball_xy is not None and pm is not None:
            wb, wp = s.w_ball, s.w_players
            xy = ((wb * ball_xy[0] + wp * pm[0]) / (wb + wp), (wb * ball_xy[1] + wp * pm[1]) / (wb + wp))
            mode = "ball+players"
        elif ball_xy is not None:
            xy, mode = ball_xy, "ball only"
        elif pm is not None:
            xy, mode = pm, "players median"
        else:
            if self.last is not None and frame_idx - self.last_frame <= s.coa_hold_frames:
                return self.last, "held (no data)"
            return None, "none"
        self.last, self.last_frame = xy, frame_idx
        return xy, mode


class TrackQuality:
    """Ground-truth-free proxies for tracking quality. 'suspected ID switches' is a HEURISTIC:
    a brand-new ID appears within `radius` px of an ID that vanished in the last `window` frames."""

    def __init__(self, frame_w, window=15, radius_frac=0.04, min_life=25):
        self.window, self.radius, self.min_life = window, radius_frac * frame_w, min_life
        self.first: Dict[int, int] = {}
        self.last: Dict[int, int] = {}
        self.count: Dict[int, int] = {}
        self.last_xy: Dict[int, Tuple[float, float]] = {}
        self.suspected = 0
        self.suspected_pairs: List[Tuple[int, int, int]] = []
        self.frames_without_players = 0
        self.player_counts: List[int] = []

    def update(self, frame_idx, foot_by_id, n_players):
        self.player_counts.append(n_players)
        if n_players == 0:
            self.frames_without_players += 1
        for tid, xy in foot_by_id.items():
            if tid not in self.first:
                for old, f in self.last.items():
                    if old in foot_by_id or not (1 <= frame_idx - f <= self.window):
                        continue
                    ox, oy = self.last_xy[old]
                    if np.hypot(xy[0] - ox, xy[1] - oy) <= self.radius:
                        self.suspected += 1
                        self.suspected_pairs.append((frame_idx, old, tid))
                        break
                self.first[tid] = frame_idx
            self.last[tid] = frame_idx
            self.last_xy[tid] = xy
            self.count[tid] = self.count.get(tid, 0) + 1

    def summary(self):
        pc = self.player_counts or [0]
        return {
            "unique_person_ids": len(self.first),
            "short_lived_ids_lt_%d_frames" % self.min_life: sum(1 for c in self.count.values() if c < self.min_life),
            "suspected_id_switches_heuristic": self.suspected,
            "frames_without_players": self.frames_without_players,
            "mean_players_per_frame": float(np.mean(pc)),
            "max_players_in_frame": int(np.max(pc)),
        }
