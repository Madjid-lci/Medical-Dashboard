<<<<<<< HEAD
from flask import Flask, request, jsonify
import pandas as pd
import os
import numpy as np  # ✅ Import NumPy to handle NaN values
from flask_cors import CORS  

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

# ✅ Set MAX CONTENT LENGTH to 50MB
MAX_FILE_SIZE_MB = 50  
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE_MB * 1024 * 1024  

print(f"🚀 Flask Server Starting... MAX FILE SIZE: {app.config['MAX_CONTENT_LENGTH']} bytes")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ✅ Initialize `patients_data` as an empty list at the beginning
patients_data = []  

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": f"Uploaded file is too large. Max size is {MAX_FILE_SIZE_MB}MB."}), 413

@app.before_request
def log_request_info():
    print(f"🔍 Incoming Request: {request.method} {request.path} | Content Length: {request.content_length}")

@app.route("/upload-csv", methods=["POST"])
def upload_csv():
    global patients_data  # ✅ Use global variable

    if "file" not in request.files:
        print("⚠️ No file uploaded!")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        print("⚠️ No selected file!")
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        df = pd.read_csv(file_path)
        print(f"✅ CSV File '{file.filename}' Loaded Successfully! Rows: {len(df)}")

        # ✅ Convert NaN values to `None` to avoid JSON issues
        df = df.replace({np.nan: None})

        # ✅ Store patient data globally
        patients_data = df.to_dict(orient="records")

        return jsonify({"message": "File uploaded successfully", "total_patients": len(patients_data)}), 200

    except pd.errors.EmptyDataError:
        return jsonify({"error": "Uploaded CSV file is empty"}), 400
    except pd.errors.ParserError:
        return jsonify({"error": "Error parsing CSV file"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/patients", methods=["GET"])
def get_patients():
    global patients_data  # ✅ Make sure this is defined

    if not patients_data:
        print("⚠️ No patient data available!")
        return jsonify({"error": "No data available"}), 404  

    print(f"✅ Returning {len(patients_data)} patients data")
    return jsonify({"patients": patients_data})

if __name__ == "__main__":
    print("🚀 Backend Server is Running on http://0.0.0.0:4000...")
    app.run(debug=True, host="0.0.0.0", port=4000)
=======
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Flask Backend is Running!"

if __name__ == "__main__":
    app.run(debug=True, port=5005)
>>>>>>> 7f723e411d014c6d60a8a9c84788385934b6e8b8
