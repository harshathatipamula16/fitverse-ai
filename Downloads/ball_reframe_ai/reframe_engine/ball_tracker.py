"""Offline ball trajectory.

A COCO ball detector on a wide broadcast shot is weak: the ball is a few pixels, motion-blurred, often hidden.
A single-frame confidence threshold therefore throws away almost every true detection. Instead we:
  1. keep LOW-confidence candidates (and filter obvious junk: size, aspect, distance from players, heads),
  2. link candidates over time with dynamic programming (best physically-plausible chain wins),
  3. interpolate short gaps and coast briefly past segment ends.
Because the clip is processed offline we can look at future frames, which a live system could not.
"""
from dataclasses import dataclass
from typing import List, Optional, Tuple

import numpy as np

DETECTED, INTERPOLATED, PREDICTED, LOST = "detected", "interpolated", "predicted", "lost"


@dataclass
class Cand:
    x: float
    y: float
    score: float      # detector confidence, possibly down-weighted (head zone)
    w: float
    h: float


@dataclass
class BallPoint:
    x: float
    y: float
    state: str        # detected | interpolated | predicted
    conf: float       # detector confidence for 'detected', 0 otherwise


def filter_candidates(dets, persons, player_median, W, H, s) -> List[Cand]:
    """Remove implausible ball candidates and down-weight those sitting on a player's head."""
    diag = float(np.hypot(W, H))
    out: List[Cand] = []
    for d in dets:
        x1, y1, x2, y2 = d.box
        w, h = x2 - x1, y2 - y1
        if w <= 0 or h <= 0 or min(w, h) < s.ball_min_side:
            continue
        if (w * h) / (W * H) > s.ball_max_area_frac:
            continue
        if not (s.ball_aspect_range[0] <= w / h <= s.ball_aspect_range[1]):
            continue
        cx, cy = (x1 + x2) / 2.0, (y1 + y2) / 2.0
        if not (0 <= cx < W and 0 <= cy < H):
            continue
        if player_median is not None and np.hypot(cx - player_median[0], cy - player_median[1]) > s.ball_max_dist_frac * diag:
            continue
        score = d.conf
        for p in persons:
            px1, py1, px2, py2 = p.box
            if px1 <= cx <= px2 and py1 <= cy <= py1 + s.head_zone_frac * (py2 - py1):
                score *= s.head_penalty
                break
        out.append(Cand(cx, cy, score, w, h))
    out.sort(key=lambda c: -c.score)
    return out[: s.ball_top_k]


def penalize_static(frames: List[List[Cand]], s) -> int:
    """Down-weight candidates that keep reappearing at (almost) the same pixel. In a panning broadcast a real
    ball keeps moving in the image, while logos, line marks and cones stay put. Returns #penalised candidates."""
    cell = s.static_cell_px
    counts: dict = {}
    for fr in frames:
        seen = set()
        for c in fr:
            seen.add((int(c.x // cell), int(c.y // cell)))
        for k in seen:                                   # at most one hit per frame and cell
            counts[k] = counts.get(k, 0) + 1
    thr = max(s.static_min_hits, s.static_frac * len(frames))
    n_pen = 0
    for fr in frames:
        for c in fr:
            cx, cy = int(c.x // cell), int(c.y // cell)
            hits = max(counts.get((cx + dx, cy + dy), 0) for dx in (-1, 0, 1) for dy in (-1, 0, 1))
            if hits >= thr:
                c.score *= s.static_penalty
                n_pen += 1
    return n_pen


def solve_trajectory(frames: List[List[Cand]], W: int, s) -> List[Optional[BallPoint]]:
    """frames[t] = filtered candidates of frame t. Returns one Optional[BallPoint] per frame (None = lost)."""
    n = len(frames)
    G = s.ball_max_gap
    vmax = s.ball_vmax_frac * W
    S: List[List[float]] = [[] for _ in range(n)]
    B: List[List[Tuple[Optional[Tuple[int, int]], bool]]] = [[] for _ in range(n)]
    best_val, best_ref = 0.0, None          # running best chain end over frames < t (0 = empty chain)

    for t in range(n):
        for c in frames[t]:
            v_best = best_val - s.ball_reset_penalty          # option 1: start a new segment
            ref, reset = best_ref, True
            for g in range(1, G + 1):                          # option 2: link to a recent candidate
                tj = t - g
                if tj < 0:
                    break
                lim = vmax * g
                for kj, cj in enumerate(frames[tj]):
                    d = float(np.hypot(c.x - cj.x, c.y - cj.y))
                    if d > lim:
                        continue
                    v = S[tj][kj] - s.ball_gap_penalty * (g - 1) - s.ball_dist_penalty * d / lim
                    if v > v_best:
                        v_best, ref, reset = v, (tj, kj), False
            S[t].append(c.score + v_best)
            B[t].append((ref, reset))
        for k, val in enumerate(S[t]):                         # update the running best AFTER frame t
            if val > best_val:
                best_val, best_ref = val, (t, k)

    out: List[Optional[BallPoint]] = [None] * n
    if best_ref is None:
        return out

    chain, reset_into = [best_ref], []          # backtrack; reset_into[i] -> edge chain[i] <- previous is a reset
    cur = best_ref
    while True:
        ref, reset = B[cur[0]][cur[1]]
        reset_into.append(reset)
        if ref is None:
            break
        chain.append(ref)
        cur = ref
    chain.reverse()
    reset_into.reverse()                         # reset_into[i] is True if chain[i] starts a new segment

    pts = [(t, frames[t][k]) for t, k in chain]
    for t, c in pts:
        out[t] = BallPoint(c.x, c.y, DETECTED, c.score)

    def velocity(i: int, forward: bool) -> Tuple[float, float]:
        """Per-frame velocity from the chain neighbours of node i, only if linked (not across a reset)."""
        j = i + 1 if forward else i - 1
        if j < 0 or j >= len(pts):
            return 0.0, 0.0
        linked = (not reset_into[j]) if forward else (not reset_into[i])
        if not linked:
            return 0.0, 0.0
        (ta, ca), (tb, cb) = pts[min(i, j)], pts[max(i, j)]
        dt = max(tb - ta, 1)
        return (cb.x - ca.x) / dt, (cb.y - ca.y) / dt

    # interpolate linked gaps
    for i in range(1, len(pts)):
        (ta, ca), (tb, cb) = pts[i - 1], pts[i]
        if not reset_into[i] and tb - ta > 1:
            for t in range(ta + 1, tb):
                a = (t - ta) / (tb - ta)
                out[t] = BallPoint(ca.x + a * (cb.x - ca.x), ca.y + a * (cb.y - ca.y), INTERPOLATED, 0.0)

    # coast past the end of every segment (forward) and before its start (backward), short and decaying
    for i, (t0, c0) in enumerate(pts):
        seg_end = (i == len(pts) - 1) or reset_into[i + 1]
        seg_start = (i == 0) or reset_into[i]
        for flag, fwd in ((seg_end, True), (seg_start, False)):
            if not flag:
                continue
            # forward coast uses the motion INTO the node (previous neighbour); backward coast uses the
            # motion OUT of it (next neighbour). Both are forward-in-time velocities.
            vx, vy = velocity(i, not fwd)
            x, y, step = c0.x, c0.y, 1 if fwd else -1
            for k in range(1, s.ball_coast_frames + 1):
                t = t0 + step * k
                if t < 0 or t >= n or out[t] is not None:
                    break
                decay = s.ball_coast_decay ** k
                x += step * vx * decay
                y += step * vy * decay
                out[t] = BallPoint(x, y, PREDICTED, 0.0)
    return out
