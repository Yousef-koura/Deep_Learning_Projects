# 🫁 PneumoScan — Chest X-Ray Pneumonia Classifier

> End-to-end deep learning system for binary classification of chest X-rays into **Normal** vs **Pneumonia**, deployed as a live REST API with a React frontend.

---

## Overview

This project covers the full ML lifecycle — from raw image data to a deployed web application. Three models were trained and compared, with the best achieving **85.1% accuracy** and **89.3% F1 score** on the held-out test set.

---

## Results — Model Comparison

| Model | Accuracy | F1 Score | Normal Recall | Pneumonia Recall |
|---|---|---|---|---|
| Custom CNN (baseline) | 75.2% | 83.3% | 35% | 99% |
| ResNet-18 + pos_weight | **85.1%** | **89.3%** | **61%** | **100%** |
| ResNet-18 + WeightedSampler | 80.1% | 86.3% | 47% | 100% |

**Winner: ResNet-18 + pos_weight** — best overall accuracy, F1, and Normal recall.

> Normal recall is the most critical metric in a medical context. A false negative (predicting Normal when the patient has Pneumonia) is far more dangerous than a false positive.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Model Training | PyTorch, torchvision |
| Architecture | ResNet-18 (Transfer Learning) |
| Model Export | ONNX |
| Backend API | FastAPI, ONNX Runtime |
| Frontend | React.js |
| Data | Chest X-Ray Images (Kaggle) — 5,216 images |

---

## Project Structure

```
PRJ-004_xray_CNN/
├── config.py                  # Global config (device, image size, hyperparams)
├── models/
│   └── model_v3_resnet18.onnx # Exported ONNX model
├── notebooks/
│   ├── 01_custom_cnn.ipynb    # Baseline CNN — no imbalance handling
│   ├── 02_resnet18_posweight.ipynb   # ResNet-18 + pos_weight (best)
│   └── 03_resnet18_sampler.ipynb     # ResNet-18 + WeightedRandomSampler
├── api/
│   └── main.py                # FastAPI inference server
└── frontend/
    └── src/
        └── App.jsx            # React UI
```

---

## Key Techniques

**Transfer Learning** — ResNet-18 pretrained on ImageNet. All convolutional layers frozen conceptually; only the final FC layer replaced with `Linear(512, 1)` for binary output.

**Class Imbalance Handling** — The dataset has ~3x more Pneumonia samples than Normal. Two strategies were tested:
- `BCEWithLogitsLoss(pos_weight=...)` — penalizes misclassification of the minority class more heavily in the loss function
- `WeightedRandomSampler` — oversamples the minority class at the data loader level

**Early Stopping** — Training halts when validation loss stops improving for `patience` epochs, and the best weights are restored automatically.

**LR Scheduling** — `ReduceLROnPlateau` halves the learning rate when validation loss plateaus.

**Data Augmentation** — Random horizontal flip, rotation (±15°), and color jitter applied to training data only.

---

## Setup & Running

### 1. Install dependencies

```bash
pip install torch torchvision fastapi uvicorn onnxruntime python-multipart pillow
```

### 2. Run the API

```bash
cd api
uvicorn main:app --reload
```

API will be live at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### 3. Run the frontend

```bash
cd frontend
npm install
npm start
```

Frontend will open at `http://localhost:3000`

---

## API Endpoints

### `GET /ping`
Health check.
```json
{ "message": "API is working" }
```

### `POST /predict`
Upload a chest X-ray image and receive a diagnosis.

**Request:** `multipart/form-data` with field `file` (JPEG or PNG)

**Response:**
```json
{
  "label": "Pneumonia",
  "confidence": 0.9312
}
```

---

## Dataset

[Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia) — Kaggle

| Split | Normal | Pneumonia | Total |
|---|---|---|---|
| Train (80%) | 1,073 | 3,099 | 4,172 |
| Validation (20%) | 268 | 775 | 1,043 |
| Test | 234 | 390 | 624 |

---

## Training Config

```python
IMAGE_SIZE  = (224, 224)
BATCH_SIZE  = 32
LR          = 1e-4
NUM_EPOCHS  = 30
PATIENCE    = 5      # early stopping
IN_CHANNELS = 3      # RGB
NUM_CLASSES = 1      # binary output
```

---

## Disclaimer

> This project is for **research and educational purposes only**. It is not intended for clinical use or medical diagnosis.

---

## Author

**Yousef** — Mechatronics Engineering Graduate | Machine Learning Engineer  
[LinkedIn](#) · [GitHub](#)
