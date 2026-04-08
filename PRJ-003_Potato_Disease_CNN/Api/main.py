# SIMPLEST VERSION with minimal comments
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
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your trained model
model = tf.keras.models.load_model(r"D:\download_99\Dreams\Ai_Roadmap\DL_Projects\PRJ-003_Potato_Disease_CNN\saved_model\v1_acc99.keras")

# Disease names in order
class_names = ['Early_blight', 'Late_blight', 'Healthy']

# Test endpoint
@app.get("/ping")
async def ping():
    return "API is working"

# Convert image to numpy array
def read_file_as_image(data):
    image = np.array(Image.open(BytesIO(data)))
    return image

# Prediction endpoint
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Convert image → predict → get result
    image = read_file_as_image(await file.read())   # it converts image to numpy array with a shape ex.(h,w,channel)
    image_batch = np.expand_dims(image, 0)          # it adds extra dimension ex (batch,h,w,channel)
    prediction = model.predict(image_batch)
    
    # Get best guess and confidence
    predicted_class = class_names[np.argmax(prediction[0])]
    confidence = float(np.max(prediction[0]))
    
    return {"disease": predicted_class, "confidence": confidence}

# Start the server
if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)