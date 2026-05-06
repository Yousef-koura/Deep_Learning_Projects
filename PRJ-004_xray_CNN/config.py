import random
import numpy as np
import torch


class Config:
    DATA_DIR    = r"D:\download_99\Dreams\Ai_Roadmap\DL_Projects\PRJ-004_xray_CNN\data"
    IMAGE_SIZE  = (224, 224)
    BATCH_SIZE  = 32
    NUM_EPOCHS  = 15
    LR          = 1e-4
    PATIENCE    = 5
    NUM_WORKERS = 0
    DEVICE      = "cuda" if torch.cuda.is_available() else "cpu"
    SEED        = 42
    IN_CHANNELS = 1  # grayscale
    NUM_CLASSES = 1  # binary BCE
    PATIENCE    = 3


