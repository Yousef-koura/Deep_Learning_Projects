from fastapi import FastAPI, UploadFile, File
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Correct path for Docker (Linux)
model = tf.keras.models.load_model("/app/saved_model/v1_acc99.keras")

class_names = ['Early_blight', 'Late_blight', 'Healthy']

@app.get("/ping")
async def ping():
    return "API is working"

def read_file_as_image(data):
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image     = read_file_as_image(await file.read())
    image_batch = np.expand_dims(image, 0)
    prediction  = model.predict(image_batch)

    predicted_class = class_names[np.argmax(prediction[0])]
    confidence      = float(np.max(prediction[0]))

    return {"disease": predicted_class, "confidence": confidence}

if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=8000)