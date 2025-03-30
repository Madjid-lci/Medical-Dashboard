from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

# Load trained model and preprocessing tools
MODEL_PATH = "referral_model_rf.pkl"
SCALER_PATH = "scaler_rf.pkl"
FEATURES_PATH = "feature_names_rf.pkl"

if not all(os.path.exists(p) for p in [MODEL_PATH, SCALER_PATH, FEATURES_PATH]):
    raise FileNotFoundError("Model or preprocessing files are missing. Train and save them first.")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
feature_names = joblib.load(FEATURES_PATH)

@app.route("/upload-csv", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    try:
        # Read the CSV file
        df = pd.read_csv(file)

        # Check for encounterId (if needed later)
        encounter_ids = df["encounterId"].tolist() if "encounterId" in df.columns else None

        # Ensure all required features exist
        missing_features = [col for col in feature_names if col not in df.columns]
        if missing_features:
            return jsonify({"error": f"Missing features in CSV: {missing_features}"}), 400

        # Replace 0s with NaN for selected columns
        zero_replace_cols = ['feed_vol', 'oxygen_flow_rate', 'resp_rate', 'bmi']
        for col in zero_replace_cols:
            if col in df.columns:
                df[col] = df[col].replace(0, np.nan)

        # Fill missing values with the median
        df.fillna(df.median(numeric_only=True), inplace=True)

        # Prepare the features for prediction
        df_features = df[feature_names]
        df_scaled = scaler.transform(df_features)

        # Generate predictions
        predictions = model.predict(df_scaled)

        # Replace or add the "referral" column with the predicted values
        if "referral" in df.columns:
            df.drop(columns=["referral"], inplace=True)
        df["referral"] = predictions

        # Count predicted referrals
        referred = int((predictions == 1).sum())
        not_referred = int((predictions == 0).sum())

        # Return the entire dataset (all rows) with updated predictions
        sample_data = df.to_dict(orient="records")

        return jsonify({
            "message": "✅ Predictions generated!",
            "referral_summary": {
                "referred": referred,
                "not_referred": not_referred
            },
            "sample_data": sample_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
