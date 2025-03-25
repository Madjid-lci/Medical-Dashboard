from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained model and preprocessing tools
MODEL_PATH = "referral_model_xgb.pkl"
SCALER_PATH = "scaler_xgb.pkl"
IMPUTER_PATH = "knn_imputer.pkl"
FEATURES_PATH = "selected_features.pkl"

if not all(os.path.exists(p) for p in [MODEL_PATH, SCALER_PATH, IMPUTER_PATH, FEATURES_PATH]):
    raise FileNotFoundError("Model or preprocessing files are missing. Train and save them first.")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
imputer = joblib.load(IMPUTER_PATH)
selected_features = joblib.load(FEATURES_PATH)

@app.route("/upload-csv", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    try:
        df = pd.read_csv(file)

        if "encounterId" in df.columns:
            encounter_ids = df["encounterId"]
        else:
            encounter_ids = None

        df = df.drop(columns=["referral"], errors="ignore")

        missing_features = [col for col in selected_features if col not in df.columns]
        if missing_features:
            return jsonify({"error": f"Missing features in CSV: {missing_features}"}), 400

        df = df[selected_features]

        df_imputed = imputer.transform(df)
        df_scaled = scaler.transform(df_imputed)
        predictions = model.predict(df_scaled)

        final_df = pd.DataFrame(df, columns=selected_features)
        if encounter_ids is not None:
            final_df.insert(0, "encounterId", encounter_ids)
        final_df.insert(1, "referral_prediction", predictions)

        return jsonify({"message": "✅ Predictions generated!", "predictions": predictions.tolist()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
