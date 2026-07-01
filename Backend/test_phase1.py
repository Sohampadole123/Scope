"""Quick verification of all Phase 1 core modules."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np

# === Test 1: Imports ===
from core.kalman import KalmanFilter8, bbox_iou, bbox_center, bbox_area, clamp_bbox
from core.detector import Detection
from core.tracker import SingleCameraTracker, Track, TrackState, TrackEvent, LostBuffer
print("[OK] All imports successful")

# === Test 2: Kalman Filter ===
kf = KalmanFilter8((100, 200, 150, 400))
cx, cy = kf.predicted_center()
assert 120 < cx < 130, f"KF center x wrong: {cx}"
assert 290 < cy < 310, f"KF center y wrong: {cy}"
kf.predict()
kf.update((105, 205, 155, 405))
d = kf.mahalanobis((110, 210, 160, 410))
assert d < 50, f"Mahalanobis too high: {d}"
bbox = kf.predicted_bbox()
assert len(bbox) == 4
print(f"[OK] KalmanFilter8: center=({cx:.1f},{cy:.1f}), mahal={d:.2f}")

# === Test 3: Geometry ===
assert abs(bbox_iou((0,0,10,10), (5,5,15,15)) - 0.1428) < 0.01
assert bbox_iou((0,0,10,10), (20,20,30,30)) == 0.0
assert bbox_center((0,0,10,10)) == (5.0, 5.0)
assert bbox_area((0,0,10,10)) == 100.0
assert clamp_bbox(-5, -5, 1000, 1000, 100, 100) == (0.0, 0.0, 99.0, 99.0)
print("[OK] Geometry helpers: IOU, center, area, clamp")

# === Test 4: Track ===
track = Track(1, (100, 200, 150, 400), 'cam1', 0.0)
assert track.state == TrackState.TENTATIVE
track.update_confidence(0.8)
track.update_confidence(0.9)
assert abs(track.avg_confidence - 0.85) < 0.01
emb = np.random.randn(512).astype(np.float32)
emb /= np.linalg.norm(emb)
track.add_embedding(emb, 0.8)
assert track.pooled_embedding is not None
assert track.pooled_embedding.shape == (512,)
norm = np.linalg.norm(track.pooled_embedding)
assert abs(norm - 1.0) < 0.01, f"Pooled emb not unit norm: {norm}"
print(f"[OK] Track: avg_conf={track.avg_confidence:.2f}, emb_norm={norm:.4f}")

# === Test 5: LostBuffer ===
buf = LostBuffer(max_lost_sec=2.0)
t1 = Track(10, (0,0,10,10), 'cam1', 0.0)
t2 = Track(11, (20,20,30,30), 'cam1', 0.5)
buf.add(t1, 1.0)
buf.add(t2, 1.5)
assert len(buf) == 2
exp = buf.evict_expired(3.5)
assert len(exp) >= 1
print(f"[OK] LostBuffer: {len(exp)} expired, {len(buf)} remaining")

# === Test 6: Detection ===
det = Detection(bbox=(100, 200, 150, 400), confidence=0.85)
assert det.center() == (125.0, 300.0)
assert det.area() == 50 * 200
print("[OK] Detection: center, area correct")

# === Test 7: Tracker init + simulated update ===
tracker = SingleCameraTracker('cam1', frame_w=640, frame_h=480)
det1 = Detection(bbox=(100, 100, 200, 300), confidence=0.90)
det2 = Detection(bbox=(300, 100, 400, 300), confidence=0.85)
emb1 = np.random.randn(512).astype(np.float32); emb1 /= np.linalg.norm(emb1)
emb2 = np.random.randn(512).astype(np.float32); emb2 /= np.linalg.norm(emb2)

# Frame 1: two detections → two tentative tracks
events = tracker.update([det1, det2], [], {0: emb1, 1: emb2}, 0.033)
assert len(tracker.tracks) == 2, f"Expected 2 tracks, got {len(tracker.tracks)}"
assert len(tracker.tentative_ids) == 2
print(f"[OK] Frame 1: {len(tracker.tracks)} tentative tracks")

# Frames 2-3: same detections → promote to active after 3 hits (n_confirm=3)
for frame_ts in [0.066, 0.100]:
    events = tracker.update([det1, det2], [], {0: emb1, 1: emb2}, frame_ts)

assert len(tracker.active_ids) == 2, f"Expected 2 active, got {len(tracker.active_ids)}"
assert len(tracker.tentative_ids) == 0
activated = [e for e in events if e.type == "TRACK_ACTIVATED"]
assert len(activated) == 2, f"Expected 2 activation events, got {len(activated)}"
print(f"[OK] Frame 3: {len(tracker.active_ids)} active tracks, {len(activated)} activation events")

# Frames 6-18: no detections → tracks should go lost after max_miss=10
for i in range(14):
    events = tracker.update([], [], {}, 0.200 + i * 0.033)

# Check that tracks went to lost buffer (not active anymore)
assert len(tracker.active_ids) == 0, f"Expected 0 active, got {len(tracker.active_ids)}"
assert len(tracker.lost_buffer) == 2, f"Expected 2 in lost buffer, got {len(tracker.lost_buffer)}"
print(f"[OK] Frame 18: {len(tracker.active_ids)} active, {len(tracker.lost_buffer)} in lost buffer")

print()
print("=" * 50)
print("  ALL PHASE 1 TESTS PASSED ✓")
print("=" * 50)
