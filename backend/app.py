from flask import (
    Flask,
    request,
    jsonify
)

from flask_cors import CORS

from backend.inference.predictor import (
    predict_image
)


app = Flask(__name__)

CORS(app)


@app.get("/")
def home():

    return {
        "status": "online",
        "service": "PulmoScan AI",
        "model": "DenseNet121"
    }


@app.post("/predict")
def predict():

    if "file" not in request.files:

        return jsonify({
            "error": "No image file provided"
        }), 400

    file = request.files["file"]

    if file.filename == "":

        return jsonify({
            "error": "Empty filename"
        }), 400

    try:

        image_bytes = file.read()

        result = predict_image(
            image_bytes
        )

        return jsonify(result)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )