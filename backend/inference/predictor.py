import tensorflow as tf

from backend.config import (
    MODEL_PATH,
    THRESHOLD,
    CLASS_NAMES
)

from backend.preprocessing.preprocess import (
    preprocess_image
)


print("Loading DenseNet121...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("Model loaded successfully.")


def predict_image(image_bytes):

    image = preprocess_image(
        image_bytes
    )

    probability = model.predict(
        image,
        verbose=0
    )[0][0]

    probability = float(
        probability
    )

    predicted_class = int(
        probability >= THRESHOLD
    )

    return {
        "class_id": predicted_class,
        "class_name": CLASS_NAMES[
            predicted_class
        ],
        "pneumonia_probability": probability,
        "threshold": THRESHOLD
    }