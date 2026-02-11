from flask import Flask, render_template, request
import os
from datetime import datetime
from skin_cancer_binary.main import SkinCancerDetector
from skin_cancer_multi.main import SkinCancerPredictor

app = Flask(__name__)

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize the binary detector (cancer vs non-cancer)
binary_detector = SkinCancerDetector("skin_cancer_binary/skin_cancer_detector_model.h5")

# Initialize the multi-class predictor (specific cancer types)
multiclass_predictor = SkinCancerPredictor()

@app.route("/", methods=["GET", "POST"])
@app.route("/upload", methods=["POST"])
def index():
    if request.method == "POST":
        file = request.files.get("image")

        if file:
            file_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(file_path)

            # Stage 1: Binary detection (Cancer vs Non-Cancer)
            print("\n=== Stage 1: Binary Detection ===")
            binary_result = binary_detector.predict(file_path)
            print(f"Binary Result: {binary_result}")
            
            # Parse binary result
            is_cancer = "Cancer" in binary_result and "Non_Cancer" not in binary_result
            binary_confidence = float(binary_result.split("(")[1].split("%")[0])
            
            # Get current timestamp
            timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")
            
            # Prepare image path for template (relative to static folder)
            # UPLOAD_FOLDER is "static/uploads", so we want "uploads/filename"
            # os.path.join might use backslashes on Windows, so we normalize for URL
            relative_image_path = f"uploads/{file.filename}"
            
            # Stage 2: If cancer detected, run multi-class classification
            if is_cancer:
                print("\n=== Stage 2: Multi-Class Classification ===")
                multiclass_result = multiclass_predictor.predict(file_path, verbose=True)
                
                return render_template(
                    "result.html",
                    binary_result="Cancer Detected",
                    binary_confidence=f"{binary_confidence:.2f}%",
                    prediction=multiclass_result['class_name'],
                    confidence=f"{multiclass_result['confidence']:.2f}%",
                    image_path=relative_image_path,
                    timestamp=timestamp,
                    is_cancer=True
                )
            else:
                # No cancer detected
                return render_template(
                    "result.html",
                    binary_result="No Cancer Detected",
                    binary_confidence=f"{binary_confidence:.2f}%",
                    prediction="Benign / Non-Cancerous",
                    confidence=f"{binary_confidence:.2f}%",
                    image_path=relative_image_path,
                    timestamp=timestamp,
                    is_cancer=False
                )

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
