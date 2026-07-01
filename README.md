# S.C.O.P.E.
## Smart Cross-camera Observation and Person Evaluation

S.C.O.P.E. is an AI-based multi-camera surveillance and monitoring system designed for real-time person detection, tracking, cross-camera re-identification, and intelligent alert generation.

The project focuses on transforming traditional CCTV systems from passive recording tools into intelligent real-time surveillance systems capable of assisting security personnel proactively.

Inspired by a real theft incident in Chenab Hostel at IIT Ropar, the system was developed to address a major limitation of existing surveillance infrastructure: the absence of intelligent correlation and continuous tracking across multiple cameras.

---

# Features

- Real-time person detection using YOLOv11m
- Cross-camera identity tracking and re-identification
- Multi-stage cascade tracking pipeline
- Kalman Filter based motion prediction
- Event-driven real-time alert generation
- Real-time dashboard synchronization using Socket.IO
- Suspicious activity and dwell-time monitoring
- RTSP and multi-camera stream support
- Centralized monitoring dashboard
- Modular and scalable architecture

---

# Tech Stack

## Backend
- Python
- PyTorch
- OpenCV
- Ultralytics YOLO
- TorchReID (OSNet)
- NumPy
- SciPy
- Flask
- Socket.IO

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Socket.IO Client

---

# System Architecture

```text
Camera Feed
     ↓
YOLOv11m Person Detection
     ↓
Feature Encoding (OSNet)
     ↓
Kalman Filter + Multi-Stage Tracking
     ↓
Cross-Camera Re-Identification
     ↓
Event Generation
     ↓
Real-Time Dashboard + Alerts
```

---

# Core Pipeline

## 1. Person Detection

The system uses YOLOv11m for real-time person detection. A dual-confidence strategy is employed to preserve identities during temporary occlusions and low-confidence detection periods.

---

## 2. Motion Prediction

A Kalman Filter predicts object positions across frames, helping maintain tracking continuity during temporary detection loss.

---

## 3. Multi-Stage Cascade Tracking

The tracking pipeline uses a multi-stage cascade assignment strategy to prevent unstable detections from disrupting existing identities.

This improves:
- Identity stability
- Occlusion handling
- Track continuity
- Re-identification consistency

---

## 4. Cross-Camera Re-Identification

Each detected individual is encoded into a 512-dimensional embedding vector using OSNet.

Cross-camera matching is performed through:
- Vectorized similarity search
- Margin-based filtering
- Transit-time validation

This allows the system to maintain a global identity across multiple camera feeds.

---

## 5. Event-Driven Architecture

Instead of sending raw tracking data continuously, the system emits meaningful events such as:

- TRACK_ACTIVATED
- PERSON_REIDENTIFIED
- ALERT_TRIGGERED
- TRACK_TERMINATED

Each event contains:
- Identity information
- Camera source
- Timestamp
- Contextual metadata

---

## 6. Real-Time Dashboard

The centralized dashboard enables security personnel to:

- Monitor live feeds
- Track individuals across cameras
- Visualize movement paths
- Access event logs
- Receive real-time alerts

The frontend remains synchronized using persistent Socket.IO connections.

---

# Key Optimizations

## Manhattan Distance Pre-Gate

A lightweight L1 distance filter eliminates spatially unlikely track-detection pairs before expensive computations.

```math
d_{L1}(x, y) = |x_1 - y_1| + |x_2 - y_2|
```

---

## Min-Heap Based Embedding Pool

Each identity maintains a bounded set of high-confidence embeddings using a min-heap structure to improve robustness against noisy samples.

```text
Insertion Complexity = O(log k)
```

---

## Vectorized Gallery Matching

Identity matching is executed using vectorized matrix operations instead of sequential loops, significantly improving runtime performance.

---

## Dual Buffer Structure

A deque and hash-map based dual buffer structure enables:
- Constant-time insertion
- Fast retrieval
- Efficient identity revival
- Ordered eviction

```text
O(1) Operations
```

---

## Multi-Stage Cascade Assignment

The assignment problem is decomposed into multiple stages to prioritize stable tracks and reduce identity fragmentation.

```text
O(max(T, D)^3)
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/248Vansh/SCOPE.git
cd SCOPE
```

---

## Create Virtual Environment

```bash
python -m venv venv
```

---

## Activate Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Running the System

## Backend

```bash
python -m core.orchestrator
```

---

## Frontend

```bash
npm install
npm run dev
```

---

# Configuration

Configuration files:

```text
config/config.yaml
config/cameras.yaml
```

These files manage:
- Camera streams
- Detection thresholds
- Tracking parameters
- Re-identification settings
- Runtime behavior

---

# Use Cases

- Campus Security
- Hostel Surveillance
- Smart Public Monitoring
- Railway Stations
- Institutional Safety
- Smart Surveillance Networks

---

# Challenges

The system may face reduced performance under:
- Poor lighting conditions
- Heavy crowd density
- Severe occlusions
- Similar appearances among individuals
- Network instability
- Power interruptions

---

# Privacy and Ethical Considerations

The system is designed with awareness of privacy and ethical concerns associated with surveillance technologies.

Key considerations include:
- Secure data handling
- Controlled access mechanisms
- Transparent usage policies
- Responsible deployment practices

Balancing security and privacy remains a critical objective.

---

# Future Scope

- Face recognition integration
- Edge-device deployment
- Distributed multi-node processing
- Behavioral anomaly detection
- Privacy-preserving AI mechanisms
- Scalable city-wide surveillance integration

---

# Project Motivation

The project was inspired by a real theft incident in Chenab Hostel at IIT Ropar, where existing CCTV infrastructure failed to provide actionable intelligence despite continuous recording.

While cameras captured footage, there was:
- No cross-camera identity continuity
- No real-time alert generation
- No automated tracking
- No intelligent event correlation

S.C.O.P.E. was developed to bridge this gap by enabling intelligent, real-time surveillance capable of assisting security personnel proactively rather than reactively.

---

# License

This project is intended for academic and research purposes only.
