# 🥔 PotatoScan — AI Potato Disease Detector

A full-stack deep learning web application that detects potato leaf diseases from images using a Convolutional Neural Network (CNN), served via a FastAPI backend and a React frontend.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Model](#model)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Frontend](#frontend)
- [How It Works](#how-it-works)

---

## Overview

PotatoScan can classify potato leaf images into three categories:

| Class | Description |
|---|---|
| 🟠 Early Blight | Fungal disease — apply copper-based fungicide |
| 🔴 Late Blight | Highly contagious — destroy infected plants immediately |
| 🟢 Healthy | No disease detected |

The model achieves **99% accuracy** on the test set.

---

## Project Structure

```
PRJ-003_Potato_Disease_CNN/
│
├── main.py                         # FastAPI backend server
│
├── Notebooks
|   └── model.ipyb
|
├── saved_model/
│   └── v1_acc99.keras              # Trained CNN model (99% accuracy)
|
└── APi
|   └── app.py
│
└── Frontend/                       # React web application
    ├── public/
    ├── src/
    │   ├── App.js                  # Main React component
    │   └── index.js
    ├── package.json
    └── node_modules/
```

---

## Model

- **Architecture:** Convolutional Neural Network (CNN)
- **Framework:** TensorFlow / Keras
- **Accuracy:** 99% on test set
- **Input:** Potato leaf image (any resolution — resized automatically)
- **Output:** Class label + confidence score
- **Classes:** `Early_blight`, `Late_blight`, `Healthy`
- **Saved format:** `.keras` (TensorFlow SavedModel format)

### Prediction Pipeline

```
Image Upload → NumPy Array → Add Batch Dimension → Model Predict → Class + Confidence
  (PIL)         (H,W,C)         (1,H,W,C)            (softmax)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Deep Learning | TensorFlow / Keras |
| Backend API | FastAPI + Uvicorn |
| Frontend | React.js |
| HTTP Client | Axios |
| Image Processing | Pillow (PIL) |
| Python Environment | Conda (DeepLearning_env) |

---

## Getting Started

### Prerequisites

- Python 3.x with Conda
- Node.js (LTS) + npm
- The trained model file at `saved_model/v1_acc99.keras`

### 1. Clone / Navigate to the Project

```bash
cd D:\download_99\Dreams\Ai_Roadmap\DL_Projects\PRJ-003_Potato_Disease_CNN
```

### 2. Activate Python Environment

```bash
conda activate DeepLearning_env
```

### 3. Install Python Dependencies

```bash
pip install fastapi uvicorn numpy pillow tensorflow
```

### 4. Start the FastAPI Backend

```bash
python main.py
```

API will be running at: `http://localhost:8000`

### 5. Install Frontend Dependencies

```bash
cd Frontend
npm install
```

### 6. Start the React Frontend

```bash
npm start
```

App will open at: `http://localhost:3000`

> ⚠️ Both servers must be running at the same time in separate terminals.

---

## API Reference

### `GET /ping`

Health check endpoint.

**Response:**
```
"API is working"
```

---

### `POST /predict`

Upload an image and get a disease prediction.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | image file | JPG or PNG of a potato leaf |

**Response:**
```json
{
  "disease": "Early_blight",
  "confidence": 0.9742
}
```

**Example with curl:**
```bash
curl -X POST "http://localhost:8000/predict" \
     -F "file=@leaf.jpg"
```

---

## Frontend

The React frontend (`Frontend/src/App.js`) provides:

- **Drag & drop** image upload zone
- **Live image preview** before analysis
- **Color-coded results** — orange for Early Blight, red for Late Blight, green for Healthy
- **Confidence bar** showing model certainty
- **Treatment recommendations** for each disease
- **Disease guide** cards at the bottom of the page

### Key Frontend Files

| File | Purpose |
|---|---|
| `src/App.js` | Main component — all UI logic and API calls |
| `src/index.css` | Global styles + spinner animation |
| `package.json` | Dependencies (React, Axios) |

### Running in Development

```bash
cd Frontend
npm start        # starts on http://localhost:3000
```

---

## How It Works

```
User uploads leaf image
        ↓
React creates FormData and sends POST to localhost:8000/predict
        ↓
FastAPI receives image → converts to NumPy array via Pillow
        ↓
Adds batch dimension: (H,W,C) → (1,H,W,C)
        ↓
CNN model runs prediction → softmax output for 3 classes
        ↓
Returns { disease: "...", confidence: 0.xx }
        ↓
React displays color-coded result + recommendation
```

### CORS

The backend allows requests from `http://localhost:3000` via FastAPI's `CORSMiddleware`. This is required because React (port 3000) and FastAPI (port 8000) run on different ports, which browsers treat as different origins.

---

## Backend Code (`main.py`)

```python
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model(r"saved_model/v1_acc99.keras")
class_names = ['Early_blight', 'Late_blight', 'Healthy']

@app.get("/ping")
async def ping():
    return "API is working"

def read_file_as_image(data):
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    image_batch = np.expand_dims(image, 0)
    prediction = model.predict(image_batch)
    predicted_class = class_names[np.argmax(prediction[0])]
    confidence = float(np.max(prediction[0]))
    return {"disease": predicted_class, "confidence": confidence}

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)
```

---

## Notes

- The model path in `main.py` should be updated if you move the project folder
- For production deployment, change `allow_origins` in CORS to your real domain
- Do not run `npm audit fix --force` — it can break Create React App dependencies

---

*Built with FastAPI · TensorFlow · React*