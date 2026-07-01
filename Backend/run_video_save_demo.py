"""
Single-video save demo.

Flow:
  Video file (from ./videos) -> Detector -> ReID -> Tracker -> Display + saved output video

Changes vs run_demo:
  - Reads exactly one input video from ./videos (or CLI override path)
  - Saves annotated output to ./outputs
  - Restricted-region risk logic removed
  - WhatsApp alert sending removed (risk logs remain)
"""
import sys
import os
import time
import json
from datetime import datetime
import csv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cv2
import numpy as np
import yaml

try:
    import mediapipe as mp
except Exception:
    mp = None

from core.detector import PersonDetector
from core.reid_encoder import ReIDEncoder
from core.tracker import SingleCameraTracker
from core.behavior_risk import RiskAnalyzer


def _normalize_embedding(emb):
    if emb is None:
        return None
    vec = np.asarray(emb, dtype=np.float32).reshape(-1)
    norm = float(np.linalg.norm(vec))
    if norm <= 1e-8:
        return None
    return vec / norm


def _match_or_create_identity(
    embedding,
    global_db,
    next_global_id,
    threshold=0.62,
    margin_gate=0.05,
    keep_last=12,
    now_ts=0.0,
    reentry_window_sec=120.0,
    recent_boost_window_sec=20.0,
    recent_threshold=0.58,
    recent_margin_gate=0.03,
    blocked_gids=None,
):
    blocked = set(blocked_gids or [])
    scored_candidates = []
    for gid, data in global_db.items():
        if gid in blocked:
            continue
        embs = data.get("embeddings", [])
        if not embs:
            continue
        last_seen = float(data.get("last_seen", 0.0))
        if now_ts > 0 and last_seen > 0 and (now_ts - last_seen) > reentry_window_sec:
            continue
        sims = [float(np.dot(embedding, e)) for e in embs]
        max_sim = max(sims)
        mean_sim = float(np.mean(sims))
        score = 0.7 * max_sim + 0.3 * mean_sim
        scored_candidates.append((gid, score))

    scored_candidates.sort(key=lambda x: x[1], reverse=True)
    best_gid = scored_candidates[0][0] if scored_candidates else None
    best_score = scored_candidates[0][1] if scored_candidates else -1.0
    second_score = scored_candidates[1][1] if len(scored_candidates) > 1 else -1.0
    margin = best_score - second_score if second_score >= 0 else 1.0

    accept = False
    if best_gid is not None:
        best_last_seen = float(global_db.get(best_gid, {}).get("last_seen", 0.0))
        is_recent = now_ts > 0 and best_last_seen > 0 and (now_ts - best_last_seen) <= recent_boost_window_sec
        thr = recent_threshold if is_recent else threshold
        mg = recent_margin_gate if is_recent else margin_gate
        accept = best_score >= thr and margin >= mg

    if accept:
        embs = global_db[best_gid].setdefault("embeddings", [])
        embs.append(embedding.copy())
        if len(embs) > keep_last:
            del embs[:-keep_last]
        global_db[best_gid]["last_seen"] = now_ts
        return best_gid, best_score, next_global_id, False

    gid = next_global_id
    next_global_id += 1
    global_db[gid] = {"embeddings": [embedding.copy()], "last_seen": now_ts}
    return gid, 0.0, next_global_id, True


LABEL_COLORS = {
    "SUSPICIOUS_MOTION": (0, 0, 255),   # red
    "INTERACTION": (0, 165, 255),       # orange
    "NEW_ENTRY": (255, 120, 0),         # blue-ish
    "ISOLATED": (0, 255, 255),          # yellow
    "HIGH_DENSITY": (200, 0, 200),      # purple
    "NORMAL": (0, 200, 0),              # green
    "EXIT": (180, 180, 180),            # gray
}


def load_system_config(config_yaml: str = "config/config.yaml") -> dict:
    if not os.path.exists(config_yaml):
        return {}
    with open(config_yaml, "r") as f:
        data = yaml.safe_load(f) or {}
    return data if isinstance(data, dict) else {}


def _resolve_single_video(videos_dir: str) -> str:
    os.makedirs(videos_dir, exist_ok=True)
    video_files = [
        os.path.join(videos_dir, f)
        for f in sorted(os.listdir(videos_dir))
        if os.path.isfile(os.path.join(videos_dir, f))
        and os.path.splitext(f.lower())[1] in {".mp4", ".avi", ".mov", ".mkv", ".webm"}
    ]
    if len(video_files) == 0:
        raise FileNotFoundError(f"No video found in '{videos_dir}'. Put one file and rerun.")
    if len(video_files) > 1:
        raise RuntimeError(f"Multiple videos found in '{videos_dir}'. Keep only one file.")
    return video_files[0]


def main():
    camera_id = "cam1"
    videos_dir = "videos"
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)

    try:
        camera_source = sys.argv[1] if len(sys.argv) > 1 else _resolve_single_video(videos_dir)
    except Exception as exc:
        print(f"ERROR: {exc}")
        return

    cfg = load_system_config()
    det_cfg = cfg.get("detection", {})
    reid_cfg = cfg.get("reid", {})
    trk_cfg = cfg.get("tracker", {})
    sys_cfg = cfg.get("system", {})
    risk_cfg = cfg.get("risk", {})
    device = sys_cfg.get("device", "cuda")

    print("=" * 60)
    print("  VIDEO SAVE DEMO")
    print("=" * 60)
    print(f"  Source: {camera_source}")
    print("  Controls: Q/ESC=Quit, S=Screenshot")
    print("=" * 60)

    detector = PersonDetector(
        model_path=det_cfg.get("model_path", "models/yolo11m.pt"),
        device=device,
        high_conf=det_cfg.get("high_conf", 0.40),
        low_conf=det_cfg.get("low_conf", 0.10),
        min_area=det_cfg.get("min_area", 400),
    )
    encoder = ReIDEncoder(
        model_path=reid_cfg.get("model_path", "models/osnet_x1_0_msmt17.pth"),
        device=device,
    )

    cap = cv2.VideoCapture(camera_source)
    if not cap.isOpened():
        print(f"ERROR: Cannot open source: {camera_source}")
        return

    frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0

    source_name = os.path.splitext(os.path.basename(str(camera_source)))[0]
    output_path = os.path.join(output_dir, f"{source_name}_tracked_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4")
    writer = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (frame_w, frame_h))
    if not writer.isOpened():
        print("ERROR: Failed to open output video writer.")
        cap.release()
        return

    tracker = SingleCameraTracker(
        camera_id=camera_id,
        frame_w=frame_w,
        frame_h=frame_h,
        n_confirm=trk_cfg.get("n_confirm", 3),
        tentative_max_miss=trk_cfg.get("tentative_max_miss", 3),
        max_miss=trk_cfg.get("max_miss", 20),
        lost_buffer_sec=trk_cfg.get("lost_buffer_sec", 15.0),
        gate_dist_px=trk_cfg.get("gate_dist_px", 200),
        mahal_gate=trk_cfg.get("mahal_gate", 9.48),
        cost_thr_high=trk_cfg.get("cost_thr_high", trk_cfg.get("cost_threshold_high", 0.65)),
        cost_thr_low=trk_cfg.get("cost_thr_low", trk_cfg.get("cost_threshold_low", 0.70)),
        weights_normal=tuple(trk_cfg.get("weights_normal", (0.50, 0.40, 0.10))),
        weights_crowd=tuple(trk_cfg.get("weights_crowd", (0.30, 0.45, 0.25))),
        crowd_overlap_min=trk_cfg.get("crowd_overlap_min", 0.10),
        crowd_score_thr=trk_cfg.get("crowd_score_thr", 0.08),
        sim_thr_live=trk_cfg.get("sim_thr_live", trk_cfg.get("sim_threshold_live", 0.45)),
        sim_thr_lost=trk_cfg.get("sim_thr_lost", trk_cfg.get("sim_threshold_lost", 0.35)),
        embedding_pool_k=trk_cfg.get("embedding_pool_k", 5),
        dup_iou_thr=trk_cfg.get("dup_iou_thr", 0.50),
        merge_sim_thr=trk_cfg.get("merge_sim_thr", 0.60),
        min_export_frames=trk_cfg.get("min_export_frames", 5),
        quality_threshold=trk_cfg.get("quality_threshold", 0.60),
    )

    frame_count = 0
    start_time = time.time()
    fps_display = 0.0
    global_db = {}
    next_global_id = 1
    local_to_global = {}
    alerted_global_ids = set()
    global_match_threshold = 0.62
    global_margin_gate = 0.05
    reentry_window_sec = 120.0

    risk_engine = RiskAnalyzer(
        frame_width=frame_w,
        frame_height=frame_h,
        fps=fps,
        window_size=int(risk_cfg.get("window_size", 20)),
        min_switch_frames=int(risk_cfg.get("min_switch_frames", 6)),
        new_entry_seconds=float(risk_cfg.get("new_entry_seconds", 2.0)),
        # Use stricter defaults to suppress false suspicious spikes.
        suspicious_enter_speed=float(risk_cfg.get("suspicious_enter_speed", 420.0)),
        suspicious_exit_speed=float(risk_cfg.get("suspicious_exit_speed", 320.0)),
        suspicious_min_frames=int(risk_cfg.get("suspicious_min_frames", 12)),
        isolation_distance_px=float(risk_cfg.get("isolation_distance_px", 260.0)),
        isolation_enter_frames=int(risk_cfg.get("isolation_enter_frames", 12)),
        isolation_exit_frames=int(risk_cfg.get("isolation_exit_frames", 6)),
        density_enter=float(risk_cfg.get("density_enter", 5e-6)),
        density_exit=float(risk_cfg.get("density_exit", 3.5e-6)),
        density_hold_frames=int(risk_cfg.get("density_hold_frames", 12)),
        interaction_distance_px=float(risk_cfg.get("interaction_distance_px", 120.0)),
        interaction_hold_frames=int(risk_cfg.get("interaction_hold_frames", 12)),
    )
    suspicious_confidence_min = float(risk_cfg.get("suspicious_confidence_min", 0.95))

    log_path = os.path.join("logs", "events.csv")
    frame_out_path = os.path.join("logs", "frame_risk_output.jsonl")
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    if not os.path.exists(log_path):
        with open(log_path, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(["timestamp", "camera_id", "global_id", "local_track_id", "event", "risk", "details"])

    while True:
        ret, frame = cap.read()
        if not ret:
            print("\n📹 Video ended.")
            break

        frame_count += 1
        timestamp = time.time() - start_time
        high_dets, low_dets = detector.detect(frame)

        embeddings = {}
        if high_dets:
            crops, valid_indices = [], []
            for i, det in enumerate(high_dets):
                x1, y1, x2, y2 = [int(v) for v in det.bbox]
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(frame_w, x2), min(frame_h, y2)
                if x2 > x1 + 2 and y2 > y1 + 2:
                    crops.append(frame[y1:y2, x1:x2])
                    valid_indices.append(i)
            if crops:
                batch_embs = encoder.batch_extract(crops)
                if batch_embs is not None:
                    for j, idx in enumerate(valid_indices):
                        if j < len(batch_embs):
                            embeddings[idx] = batch_embs[j]

        events = tracker.update(high_dets, low_dets, embeddings, timestamp)
        for ev in events:
            if ev.type == "TRACK_ACTIVATED":
                normalized = _normalize_embedding(ev.embedding)
                if normalized is None:
                    continue
                active_track_ids = {t.track_id for t in tracker.get_active_tracks()}
                blocked_gids = {g for tid, g in local_to_global.items() if tid != ev.track_id and tid in active_track_ids}
                gid, score, next_global_id, is_new = _match_or_create_identity(
                    normalized, global_db, next_global_id,
                    threshold=global_match_threshold, margin_gate=global_margin_gate,
                    keep_last=12, now_ts=timestamp, reentry_window_sec=reentry_window_sec, blocked_gids=blocked_gids
                )
                local_to_global[ev.track_id] = gid
                tracker.set_global_id(ev.track_id, gid, f"Person #{gid}")
            elif ev.type == "TRACK_ENDED":
                local_to_global.pop(ev.track_id, None)

        active_tracks = tracker.get_active_tracks()
        risk_inputs = [{"id": t.track_id, "bbox": [float(v) for v in t.bbox]} for t in active_tracks]
        risk_result = risk_engine.update(frame_idx=frame_count, tracks=risk_inputs)
        track_risk_map = {item["id"]: item for item in risk_result["tracks"]}

        # Extra strict post-filter: keep suspicious labels only for high-confidence cases.
        for item in risk_result["tracks"]:
            if item["label"] == "SUSPICIOUS_MOTION" and float(item["confidence"]) < suspicious_confidence_min:
                item["label"] = "NORMAL"

        for item in risk_result["tracks"]:
            gid = local_to_global.get(item["id"])
            if gid is None:
                continue
            if item["label"] == "SUSPICIOUS_MOTION" and gid not in alerted_global_ids:
                alerted_global_ids.add(gid)
                with open(log_path, "a", newline="", encoding="utf-8") as f:
                    csv.writer(f).writerow([
                        datetime.now().isoformat(timespec="seconds"),
                        camera_id,
                        gid,
                        item["id"],
                        "RISK_ALERT",
                        f"{item['confidence']:.2f}",
                        item["label"],
                    ])

        frame_payload = {
            "frame": frame_count,
            "scene_status": risk_result["scene_status"],
            "scene_density": round(float(risk_result["scene_density"]), 8),
            "tracks": risk_result["tracks"],
            "exits": risk_result["exits"],
        }
        with open(frame_out_path, "a", encoding="utf-8") as jf:
            jf.write(json.dumps(frame_payload) + "\n")

        annotated = frame.copy()
        for t in active_tracks:
            item = track_risk_map.get(t.track_id)
            if item is None:
                continue
            gid = local_to_global.get(t.track_id, t.track_id)
            label = item["label"]
            speed = item["speed"]
            conf = item["confidence"]
            color = LABEL_COLORS.get(label, LABEL_COLORS["NORMAL"])
            x1, y1, x2, y2 = [int(v) for v in t.bbox]
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            caption = f"ID:{gid} {label} v:{speed:.1f} c:{conf:.2f}"
            cv2.putText(annotated, caption, (x1 + 2, max(14, y1 - 8)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.48, color, 2)
            if item["interaction_with"]:
                relation = ",".join(str(v) for v in item["interaction_with"])
                cv2.putText(annotated, f"with:{relation}", (x1 + 2, min(frame_h - 8, y2 + 16)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 200, 255), 2)

        if frame_count % 10 == 0:
            elapsed = time.time() - start_time
            fps_display = frame_count / elapsed if elapsed > 0 else 0.0
        hud_lines = [
            f"FPS: {fps_display:.1f}",
            f"Frame: {frame_count}",
            f"Persons: {len(active_tracks)}",
            f"Detections: H={len(high_dets)} L={len(low_dets)}",
            f"Scene: {risk_result['scene_status']}",
        ]
        for i, line in enumerate(hud_lines):
            cv2.putText(annotated, line, (10, 25 + i * 22), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 2)

        writer.write(annotated)
        cv2.imshow("Video Save Demo", annotated)
        key = cv2.waitKey(1) & 0xFF
        if key in (ord("q"), ord("Q"), 27):
            break
        if key in (ord("s"), ord("S")):
            fname = f"screenshot_{frame_count}.jpg"
            cv2.imwrite(fname, annotated)
            print(f"  📸 Screenshot saved: {fname}")

    cap.release()
    writer.release()
    cv2.destroyAllWindows()
    elapsed = time.time() - start_time
    print("\n" + "=" * 60)
    print("  Session Summary")
    print("=" * 60)
    print(f"  Duration:     {elapsed:.1f}s")
    print(f"  Frames:       {frame_count}")
    print(f"  Avg FPS:      {frame_count / elapsed:.1f}" if elapsed > 0 else "  Avg FPS: N/A")
    print(f"  Total tracks: {tracker._next_id}")
    print(f"  Output video: {output_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
