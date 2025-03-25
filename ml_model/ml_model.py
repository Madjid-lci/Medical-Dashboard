import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
import joblib
import xgboost as xgb
import os

# Load the dataset
file_path = "Feeding Dashboard data.csv"

if not os.path.exists(file_path):
    raise FileNotFoundError(f"❌ Error: '{file_path}' not found. Please ensure the CSV is in the correct directory.")

df = pd.read_csv(file_path)

# Drop 'encounterId' since it's just an identifier
df = df.drop(columns=["encounterId"], errors="ignore")

# Separate features and target variable
if "referral" not in df.columns:
    raise ValueError("❌ Error: 'referral' column missing in CSV. Ensure the dataset contains the target variable.")

X = df.drop(columns=["referral"], errors="ignore")
y = df["referral"]

# Step 1: Feature Selection Using Random Forest
feature_selector = RandomForestClassifier(n_estimators=100, random_state=42)
feature_selector.fit(X.fillna(0), y)
feature_importances = pd.Series(feature_selector.feature_importances_, index=X.columns)

# Select top 4 features
selected_features = feature_importances.nlargest(4).index.tolist()
X = X[selected_features]

# Step 2: Handle Missing Values Using KNN Imputer
imputer = KNNImputer(n_neighbors=5)
X_imputed = imputer.fit_transform(X)

# Step 3: Split Data into Training and Testing Sets
X_train, X_test, y_train, y_test = train_test_split(X_imputed, y, test_size=0.3, random_state=42, stratify=y)

# Step 4: Scale the Features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Step 5: Train an XGBoost Model
xgb_version = xgb.__version__

model = XGBClassifier(
    n_estimators=100, 
    max_depth=4, 
    learning_rate=0.05, 
    scale_pos_weight=4,  
    random_state=42,
    objective="binary:logistic",
    eval_metric="logloss",
    use_label_encoder=False
)

# Handle XGBoost version differences
if xgb_version < "2.0":
    model.fit(
        X_train_scaled, y_train,
        eval_set=[(X_test_scaled, y_test)],
        early_stopping_rounds=10,
        verbose=True
    )
else:
    model.fit(
        X_train_scaled, y_train,
        eval_set=[(X_test_scaled, y_test)],
        verbose=True
    )  # No early stopping for XGBoost 2.0+

# Step 6: Save the trained model, scaler, and imputer
joblib.dump(model, "referral_model_xgb.pkl")
joblib.dump(scaler, "scaler_xgb.pkl")
joblib.dump(imputer, "knn_imputer.pkl")
joblib.dump(selected_features, "selected_features.pkl")  # Save selected features

# Step 7: Evaluate Model Performance
train_accuracy = model.score(X_train_scaled, y_train)
test_accuracy = model.score(X_test_scaled, y_test)

print(f"✅ Training Accuracy: {train_accuracy:.4f}")
print(f"✅ Test Accuracy: {test_accuracy:.4f}")
print("✅ Model and preprocessing files saved successfully!")
