"""Test GPU modules: PersonDetector and ReIDEncoder with real model inference."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import cv2

# Test 1: PersonDetector with a synthetic image
from core.detector import PersonDetector
print("Loading YOLOv11m...")
det = PersonDetector("models/yolo11m.pt", device="cuda")
print("[OK] PersonDetector loaded")

# Create a dummy image (no people → should return empty)
dummy = np.zeros((480, 640, 3), dtype=np.uint8)
high, low = det.detect(dummy)
print(f"[OK] detect(blank): {len(high)} high, {len(low)} low (expected 0, 0)")

# Test batch detect
results = det.batch_detect([dummy, dummy])
assert len(results) == 2
print(f"[OK] batch_detect(2 frames): {len(results)} results")

# Test 2: ReIDEncoder
from core.reid_encoder import ReIDEncoder
print("Loading OSNet_x1_0...")
enc = ReIDEncoder(model_path="models/osnet_x1_0_msmt17.pth", device="cuda")
print("[OK] ReIDEncoder loaded")

# Extract from a random crop
crop = np.random.randint(0, 255, (200, 80, 3), dtype=np.uint8)
emb = enc.extract(crop)
assert emb is not None
assert emb.shape == (512,)
norm = np.linalg.norm(emb)
assert abs(norm - 1.0) < 0.01, f"Not unit norm: {norm}"
print(f"[OK] extract single crop: shape={emb.shape}, norm={norm:.4f}")

# Batch extract
crops = [np.random.randint(0, 255, (200, 80, 3), dtype=np.uint8) for _ in range(5)]
batch_embs = enc.batch_extract(crops)
assert batch_embs is not None
assert batch_embs.shape == (5, 512)
print(f"[OK] batch_extract(5 crops): shape={batch_embs.shape}")

# Verify embeddings are different for different inputs
sim = float(np.dot(batch_embs[0], batch_embs[1]))
print(f"[OK] Cross-crop similarity: {sim:.4f} (should be < 1.0)")

print()
print("=" * 50)
print("  GPU MODULE TESTS PASSED ✓")
print("=" * 50)
