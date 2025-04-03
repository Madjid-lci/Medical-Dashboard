import pandas as pd  # For data manipulation
import numpy as np  # For numerical operations and handling NaN values
from sklearn.model_selection import train_test_split  # To split data into training and testing sets
from sklearn.ensemble import RandomForestClassifier  # The machine learning model
from sklearn.preprocessing import StandardScaler  # For feature scaling
from sklearn.metrics import accuracy_score, classification_report  # To evaluate model performance
import joblib  # To save and load model artifacts
import os  # For file system operations

# 1. Load the dataset from CSV
file_path = "Feeding Dashboard data.csv"
if not os.path.exists(file_path):
    raise FileNotFoundError(f"Error: '{file_path}' not found. Please ensure the CSV is in the correct directory.")

df = pd.read_csv(file_path)

# 2. Replace 0s with NaN for selected features if 0 is not a valid value
zero_replace_cols = ['feed_vol', 'oxygen_flow_rate', 'resp_rate', 'bmi']
for col in zero_replace_cols:
    if col in df.columns:
        df[col] = df[col].replace(0, np.nan)

# 3. Fill missing values with the median (numeric columns only)
df.fillna(df.median(numeric_only=True), inplace=True)

# 4. Separate features and target; ensure 'referral' column exists
if "referral" not in df.columns:
    raise ValueError("Error: 'referral' column missing in CSV. Ensure the dataset contains the target variable.")

# For training, drop 'referral' and 'encounterId' (if available) from features
X = df.drop(columns=['referral', 'encounterId'], errors='ignore')
y = df['referral'].astype(int)  # Convert target to integer (0/1)

# Save feature names for later use in production
feature_names = X.columns.tolist()

# 5. Scale the features using StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 6. Split data into training and testing sets (20% test, stratified by target)
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# 7. Train the RandomForest model with 100 trees
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 8. Evaluate the model on the test set and print accuracy and detailed report
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(classification_report(y_test, y_pred))

# 9. Predict for all patients using the trained model and update the 'referral' column
predictions = model.predict(scaler.transform(X))
df['referral'] = predictions  # Replace actual referral values with model predictions

if 'encounterId' in df.columns:
    print("\nSample predictions:")
    print(df[['encounterId', 'referral']].head())

# 10. Write the entire DataFrame (with updated referral values) to a new CSV file
output_csv = "feeding_predictions_rf.csv"
df.to_csv(output_csv, index=False)
print(f"Predictions saved to: {output_csv}")

# 11. Save the trained model, scaler, and feature names for production use
joblib.dump(model, "referral_model_rf.pkl")
joblib.dump(scaler, "scaler_rf.pkl")
joblib.dump(feature_names, "feature_names_rf.pkl")
print("Model, scaler, and feature names saved.")