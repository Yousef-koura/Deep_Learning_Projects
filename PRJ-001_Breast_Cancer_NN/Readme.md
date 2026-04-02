# 🧠 Breast Cancer Classification — Neural Network

A deep learning project that classifies breast cancer tumors as **Malignant** or **Benign** using a fully connected neural network built with TensorFlow/Keras, trained on the Breast Cancer Wisconsin dataset. The model achieves high accuracy through proper regularization, standardization, and a clean binary classification pipeline.

---

## 🔄 Workflow

| Step | Description |
|------|-------------|
| 📥 Load Data | Load Breast Cancer Wisconsin dataset from `sklearn.datasets` |
| 🔍 Explore Data | Check shape, info, class distribution, and descriptive statistics |
| ✂️ Split Data | Stratified train/test split (80/20) to preserve class ratio |
| ⚖️ Standardize | Apply `StandardScaler` — fit on train, transform on test |
| 🏗️ Build Model | Sequential neural network with 3 Dense layers + Dropout |
| 🎯 Train Model | Train for 35 epochs with 10% validation split |
| 📈 Visualize | Plot accuracy and loss curves for train vs validation |
| 🧪 Evaluate | Measure test loss and accuracy on held-out test set |
| 🔮 Predict | Feed new patient data and classify as Malignant or Benign |

---

## 🛠️ Tech Stack
![Python](https://img.shields.io/badge/Python-3.x-blue)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-ML-orange)
![Pandas](https://img.shields.io/badge/Pandas-Data-green)
![NumPy](https://img.shields.io/badge/NumPy-Numerical-lightblue)
![Matplotlib](https://img.shields.io/badge/Matplotlib-Visualization-purple)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange)
![Keras](https://img.shields.io/badge/Keras-Deep%20Learning-red)
---

## 🤖 How the Model Works

The model is a **feedforward neural network** (also called MLP — Multi-Layer Perceptron). Think of it like a series of filters: each layer learns to detect patterns in the data, and the final layer decides whether the tumor is malignant or benign.

- **ReLU activation** in hidden layers → learns non-linear patterns
- **Dropout** → randomly disables neurons during training to prevent overfitting
- **Sigmoid activation** in output → squashes output to a probability between 0 and 1
- **Binary Crossentropy** → correct loss function for binary classification tasks

```python
model = keras.Sequential([
    keras.layers.Input(shape=(x.shape[1],)),          # 30 input features
    keras.layers.Dense(30, activation='relu'),         # hidden layer 1
    keras.layers.Dropout(0.3),                         # regularization
    keras.layers.Dense(15, activation='relu'),         # hidden layer 2
    keras.layers.Dropout(0.2),                         # regularization
    keras.layers.Dense(15, activation='relu'),         # hidden layer 3
    keras.layers.Dense(1,  activation='sigmoid')       # output: P(benign)
])

model.compile(
    optimizer = 'adam',
    loss      = 'binary_crossentropy',
    metrics   = ['accuracy']
)
```

> Output probability **≥ 0.5** → Benign | Output probability **< 0.5** → Malignant
---

## 📁 Project Structure

```
breast-cancer-nn/
│
├── breast_cancer_classification.py   # Full pipeline script
├── README.md                         # Project documentation
└── requirements.txt                  # Python dependencies
```

---

## 📊 Results

| Metric | Score |
|--------|-------|
| Training Accuracy | 98% |
| Validation Accuracy | 97% |
| Test Accuracy | 95.6% |
| Test Loss | 0.1157 |
