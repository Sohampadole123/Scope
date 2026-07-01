"""Quick verification test for all 8 audit fixes - outputs to file."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np

results = []

def test(name, condition, detail=""):
    if condition:
        results.append(f"PASS: {name}")
    else:
        results.append(f"FAIL: {name} -- {detail}")

# Test 1: Imports
try:
    from core.kalman import KalmanFilter8
    from core.detector import PersonDetector, Detection
    from core.reid_encoder import ReIDEncoder
    from core.tracker import SingleCameraTracker, TrackEvent, Track, TrackState
    from core.global_matcher import GlobalMatcher, MatchResult, GlobalIdentity
    from core.stream_manager import StreamManager, CameraConfig
    from core.orchestrator import Orchestrator
    test("All modules import", True)
except Exception as e:
    test("All modules import", False, str(e))

# Test 2: Kalman updated_bbox
k = KalmanFilter8((10,20,110,220))
k.predict()
k.update((12,22,112,222))
b = k.updated_bbox()
test("Kalman updated_bbox", b is not None and len(b) == 4, f"got {b}")

# Test 3: Thresholds
gm = GlobalMatcher()
test("gallery_thr=0.60", gm.gallery_thr == 0.60, f"got {gm.gallery_thr}")
test("registered_thr=0.70", gm.registered_thr == 0.70, f"got {gm.registered_thr}")

# Test 4: finalize_all quality gate
tracker = SingleCameraTracker('test', frame_w=640, frame_h=480)
det = Detection(bbox=(100,100,200,200), confidence=0.25)
track = tracker._create_track(det, None, 0.0)
for i in range(6):
    track.age += 1
    track.update_confidence(0.25)
events = tracker.finalize_all(10.0)
test("finalize_all quality gate", len(events) == 0, f"got {len(events)} events")

# Test 5: Appearance guard
import inspect
src = inspect.getsource(SingleCameraTracker.update)
check1_section = src.split("Check 1")[1].split("Check 2")[0]
test("Appearance guard active_ids", "for tid in self.active_ids:" in check1_section,
     "did not find 'for tid in self.active_ids:' in Check1")

# Test 6: Time plausibility
gm2 = GlobalMatcher()
ident = GlobalIdentity(global_id=1, prototype=np.zeros(512, dtype=np.float32),
                       display_name='Test', last_seen_time=50.0, last_seen_camera='cam1')
r1 = gm2._time_plausible(ident, 'cam1', 50.0)
test("time_plausible dt=0 -> False", r1 == False, f"got {r1}")
r2 = gm2._time_plausible(ident, 'cam1', 52.0)
test("time_plausible dt=2 -> True", r2 == True, f"got {r2}")
r3 = gm2._time_plausible(ident, 'cam1', 49.0)
test("time_plausible dt<0 -> True", r3 == True, f"got {r3}")

# Test 7: Gallery exclusion
gm3 = GlobalMatcher()
emb1 = np.random.randn(512).astype(np.float32)
emb1 /= np.linalg.norm(emb1)
gm3._create_new_identity(emb1, 'cam1', 0.0, phase=1)
result_excl = gm3._match_gallery(emb1, 'cam2', 10.0, phase=2, exclude_gid=1)
test("Gallery exclusion", result_excl is None or result_excl.global_id != 1,
     f"got gid={result_excl.global_id if result_excl else 'None'}")

# Test 8: Orchestrator source checks
src_orch = inspect.getsource(Orchestrator.__init__)
# Verify default thresholds exist in fallback chain
test("Orch registered_thr=0.70",
     ('registration_threshold", 0.70' in src_orch) or ('registered_threshold", 0.70' in src_orch),
     "could not find 0.70 fallback")

test("Orch gallery_thr=0.60",
     ('match_threshold", 0.60' in src_orch) or ('gallery_threshold", 0.60' in src_orch),
     "could not find 0.60 fallback")

merge_part = src_orch[src_orch.index("merge_sim_thr"):][:80]
test("Orch merge_sim=0.60", "0.60" in merge_part, f"found: {merge_part[:50]}")

qual_part = src_orch[src_orch.index("quality_threshold"):][:80]
test("Orch quality_thr=0.50", "0.50" in qual_part, f"found: {qual_part[:50]}")

lost_part = src_orch[src_orch.index("lost_buffer_sec"):][:80]
test("Orch lost_buffer=5.0", "5.0" in lost_part, f"found: {lost_part[:50]}")

# Test 9: Phase 2 correction syncs
src_ev = inspect.getsource(Orchestrator._process_events)
has_correction_branch = "result.global_id != current_gid" in src_ev
has_sync_call = "tracker.set_global_id(" in src_ev
test("Phase2 correction set_global_id",
     has_correction_branch and has_sync_call,
     "missing correction branch or set_global_id call")

# Test 10: TRACK_ACTIVATED uses pooled
src_upd = inspect.getsource(SingleCameraTracker.update)
test("TRACK_ACTIVATED pooled_embedding", "track.pooled_embedding if track.pooled_embedding" in src_upd)

# Write results
with open("test_results.txt", "w") as f:
    for r in results:
        f.write(r + "\n")
    p = sum(1 for r in results if r.startswith("PASS"))
    t = len(results)
    f.write(f"\n{p}/{t} passed\n")
    
print(f"{sum(1 for r in results if r.startswith('PASS'))}/{len(results)} passed")
for r in results:
    if r.startswith("FAIL"):
        print(r)
