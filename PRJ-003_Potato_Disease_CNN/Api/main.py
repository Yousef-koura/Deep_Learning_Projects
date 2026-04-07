from fastapi import FastAPI, UploadFile, File
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

model = tf.keras.models.load_model(r"D:\download_99\Dreams\Ai_Roadmap\DL_Projects\PRJ-003_Potato_Disease_CNN\saved_model\v1_acc99.keras")
class_names = ['Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy']

@app.get("/ping")
async def ping():
    return "hello i am a live"

# function to convert image to numpy array
def read_file_as_image(data):
    image = np.array(Image.open(BytesIO(data)))
    return image


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image = read_file_as_image(await file.read())  # read the image
    image_batch = np.expand_dims(image, 0)

    prediction = model.predict(image_batch)                     # --> [0.8, 0.9, 0.2]
    predicted_class = class_names[np.argmax(prediction[0])]     # --> takes the max value and get its class name
    confidence = np.max(prediction[0])

    return {
        "class": predicted_class,
        "confidence": float(confidence)
    }

    

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)