# PulmoScan AI

AI-powered pneumonia detection from chest X-ray images using Deep Learning.

PulmoScan AI uses a fine-tuned DenseNet121 convolutional neural network to classify chest X-ray images as:

- Normal
- Pneumonia

The project includes a Flask inference API and a Next.js frontend.

## Features

- Chest X-ray pneumonia classification
- DenseNet121 transfer learning
- Configurable prediction threshold
- REST API for inference
- Grad-CAM explainability support
- Next.js web interface
- Production-oriented backend structure
- Model inference through Flask API

## Tech Stack

### Deep Learning
- TensorFlow
- Keras
- DenseNet121
- Transfer Learning
- Grad-CAM

### Backend
- Python
- Flask
- Flask-CORS
- Gunicorn

### Frontend
- Next.js
- React
- TypeScript

## Model

The classification model is based on DenseNet121 with the following architecture:

Input `(224 × 224 × 3)`
→ DenseNet121
→ Global Average Pooling
→ Dense(256, ReLU)
→ Dropout(0.3)
→ Dense(1, Sigmoid)

Prediction threshold:

```text
0.35