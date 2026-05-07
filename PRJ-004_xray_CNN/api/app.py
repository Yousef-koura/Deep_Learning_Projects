import uvicorn
import onnx
import onnxruntime as ort
import numpy as np
from PIL import Image
from io import BytesIO
from torchvision import transforms
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from config import Config

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Chest X-Ray Classifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model ────────────────────────────────────────────────────────────────
session = ort.InferenceSession("PRJ-004_xray_CNN/models/model_v3_resnet18.onnx")
print("✅ ONNX model loaded successfully")

# ── Transform ─────────────────────────────────────────────────────────────────
transform = transforms.Compose([
    transforms.Resize(Config.IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def read_file_as_image(data: bytes) -> np.ndarray:
    image  = Image.open(BytesIO(data)).convert("RGB")
    tensor = transform(image)
    tensor = torch.as_tensor(tensor).unsqueeze(0)  # IDE now knows it's a tensor
    return tensor.numpy()

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/ping")
async def ping():
    return {"message": "API is working"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG supported")

    data       = await file.read()
    image      = read_file_as_image(data)

    output     = session.run(["output"], {"input": image})[0]
    confidence = float(1 / (1 + np.exp(-output[0][0])))
    pred       = int(confidence > 0.5)

    return {
        "label":      "Pneumonia" if pred == 1 else "Normal",
        "confidence": round(confidence if pred == 1 else 1 - confidence, 4)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)