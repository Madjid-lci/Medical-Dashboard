from flask import Flask, request, jsonify  # Import Flask essentials
import pandas as pd  # For CSV data handling
import os  # For file system operations
import numpy as np  # Handle numerical operations and NaN values
from flask_cors import CORS  # Enable Cross-Origin Resource Sharing

app = Flask(__name__)  # Create Flask app instance
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow CORS for all routes and origins

MAX_FILE_SIZE_MB = 50  # Max file size in MB
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE_MB * 1024 * 1024  # Set max content length in bytes

print(f"Flask Server Starting... MAX FILE SIZE: {app.config['MAX_CONTENT_LENGTH']} bytes")

UPLOAD_FOLDER = "uploads"  # Folder for file uploads
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure upload folder exists

patients_data = []  # Global list to store patient records

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": f"Uploaded file is too large. Max size is {MAX_FILE_SIZE_MB}MB."}), 413  # Error for oversized files

@app.before_request
def log_request_info():
    print(f"Incoming Request: {request.method} {request.path} | Content Length: {request.content_length}")  # Log request info

@app.route("/upload-csv", methods=["POST"])
def upload_csv():
    global patients_data  # Use global patient data list

    if "file" not in request.files:
        print("No file uploaded!")
        return jsonify({"error": "No file uploaded"}), 400  # Error if no file part

    file = request.files["file"]
    if file.filename == "":
        print("No selected file!")
        return jsonify({"error": "No selected file"}), 400  # Error if file not selected

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)  # Define file path
    file.save(file_path)  # Save uploaded file

    try:
        df = pd.read_csv(file_path)  # Load CSV into DataFrame
        print(f"CSV File '{file.filename}' Loaded Successfully! Rows: {len(df)}")
        df = df.replace({np.nan: None})  # Replace NaN with None
        patients_data = df.to_dict(orient="records")  # Update global patient data list

        return jsonify({"message": "File uploaded successfully", "total_patients": len(patients_data)}), 200

    except pd.errors.EmptyDataError:
        return jsonify({"error": "Uploaded CSV file is empty"}), 400
    except pd.errors.ParserError:
        return jsonify({"error": "Error parsing CSV file"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/patients", methods=["GET"])
def get_patients():
    global patients_data  # Access global patient data

    if not patients_data:
        print("No patient data available!")
        return jsonify({"error": "No data available"}), 404  # Error if no data found

    print(f"Returning {len(patients_data)} patients data")
    return jsonify({"patients": patients_data})  # Return patient records

if __name__ == "__main__":
    print("Backend Server is Running on http://0.0.0.0:4000...")
    app.run(debug=True, host="0.0.0.0", port=4000)  # Start server