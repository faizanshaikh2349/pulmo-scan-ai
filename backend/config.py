from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


MODEL_PATH = (
    BASE_DIR
    / "model"
    / "densenet121_pneumonia.keras"
)


IMG_SIZE = (224, 224)

THRESHOLD = 0.35


CLASS_NAMES = {
    0: "Normal",
    1: "Pneumonia"
}