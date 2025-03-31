from flask import Flask, request, jsonify  # Import Flask framework and helpers for requests/responses
import pandas as pd  # For CSV file handling and data manipulation
import joblib  # For loading pre-trained model and preprocessing objects
import os  # For file system operations
from flask_cors import CORS  # To enable Cross-Origin Resource Sharing
import numpy as np  # For numerical operations and handling NaN values

app = Flask(__name__)  # Initialize the Flask app
CORS(app)  # Enable CORS for all routes

# Define file paths for the trained model and preprocessing tools
MODEL_PATH = "referral_model_rf.pkl"
SCALER_PATH = "scaler_rf.pkl"
FEATURES_PATH = "feature_names_rf.pkl"

# Ensure all required files exist; if not, raise an error
if not all(os.path.exists(p) for p in [MODEL_PATH, SCALER_PATH, FEATURES_PATH]):
    raise FileNotFoundError("Model or preprocessing files are missing. Train and save them first.")

# Load the trained model, scaler, and list of feature names
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
feature_names = joblib.load(FEATURES_PATH)

@app.route("/upload-csv", methods=["POST"])
def upload_csv():
    # Check if a file part exists in the incoming request
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    try:
        # Read the CSV file into a DataFrame
        df = pd.read_csv(file)

        # Optionally, store encounter IDs if the column exists
        encounter_ids = df["encounterId"].tolist() if "encounterId" in df.columns else None

        # Ensure all required features exist in the CSV
        missing_features = [col for col in feature_names if col not in df.columns]
        if missing_features:
            return jsonify({"error": f"Missing features in CSV: {missing_features}"}), 400

        # Replace 0s with NaN in specific columns to avoid skewing predictions
        zero_replace_cols = ['feed_vol', 'oxygen_flow_rate', 'resp_rate', 'bmi']
        for col in zero_replace_cols:
            if col in df.columns:
                df[col] = df[col].replace(0, np.nan)

        # Fill missing numeric values with the median of each column
        df.fillna(df.median(numeric_only=True), inplace=True)

        # Select features for prediction based on the loaded feature names
        df_features = df[feature_names]
        # Scale the features using the pre-loaded scaler
        df_scaled = scaler.transform(df_features)

        # Generate predictions using the pre-trained model
        predictions = model.predict(df_scaled)

        # Remove any existing "referral" column and add predictions as the new "referral" column
        if "referral" in df.columns:
            df.drop(columns=["referral"], inplace=True)
        df["referral"] = predictions

        # Count the number of referred and not referred patients based on predictions
        referred = int((predictions == 1).sum())
        not_referred = int((predictions == 0).sum())

        # Convert the updated DataFrame to a list of dictionaries for JSON response
        sample_data = df.to_dict(orient="records")

        # Return a JSON response with a success message, referral summary, and sample data
        return jsonify({
            "message": "✅ Predictions generated!",
            "referral_summary": {
                "referred": referred,
                "not_referred": not_referred
            },
            "sample_data": sample_data
        })

    except Exception as e:
        # If any exception occurs, return an error message with a 500 status code
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)  # Run the app in debug mode