import torch
import cv2
import numpy as np
from ultralytics import YOLO
import torchreid

print("CUDA:", torch.cuda.is_available())

yolo = YOLO("models/yolo11m.pt")
print("YOLO loaded")

extractor = torchreid.utils.FeatureExtractor(
    model_name='osnet_x1_0',
    model_path='models/osnet_x1_0_msmt17.pth',
    device='cuda'
)

print("ReID loaded")