import tensorflow as tf

from backend.config import IMG_SIZE


def preprocess_image(image_bytes):

    image = tf.image.decode_image(
        image_bytes,
        channels=1,
        expand_animations=False
    )

    image = tf.cast(
        image,
        tf.float32
    )

    image = tf.image.resize(
        image,
        IMG_SIZE
    )

    image = image / 255.0

    image = tf.image.grayscale_to_rgb(
        image
    )

    image = tf.expand_dims(
        image,
        axis=0
    )

    return image