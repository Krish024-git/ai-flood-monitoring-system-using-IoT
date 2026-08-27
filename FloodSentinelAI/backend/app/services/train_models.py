import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
try:
    from xgboost import XGBClassifier
except ImportError:
    XGBClassifier = None

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))


def generate_synthetic_data(samples=2500):
    np.random.seed(42)
    
    # Generate random features
    water_level = np.random.uniform(5.0, 250.0, samples)  # cm
    flow_rate = np.random.uniform(2.0, 120.0, samples)   # lpm
    rainfall = np.random.uniform(0.0, 80.0, samples)     # mm/hr
    temperature = np.random.uniform(18.0, 42.0, samples) # C
    humidity = np.random.uniform(40.0, 100.0, samples)   # %
    
    # Create target variable based on physical rules + random noise
    # Critical condition: Water Level > 180cm, Flow > 90lpm, Rain > 50mm
    # Safe condition: Water < 80cm, Flow < 40lpm, Rain < 15mm
    risk_score_base = (
        (water_level * 0.40) + 
        (flow_rate * 0.25) + 
        (rainfall * 0.35) + 
        ((humidity - 50) * 0.1)
    )
    noise = np.random.normal(0, 8, samples)
    risk_score = np.clip(risk_score_base + noise, 0, 100)
    
    # Classify severity
    # 0: Safe (Score < 35)
    # 1: Warning (Score 35 to 60)
    # 2: Danger (Score 60 to 80)
    # 3: Critical (Score >= 80)
    severity = np.zeros(samples, dtype=int)
    severity[risk_score >= 35] = 1
    severity[risk_score >= 60] = 2
    severity[risk_score >= 80] = 3
    
    df = pd.DataFrame({
        "water_level_cm": water_level,
        "flow_rate_lpm": flow_rate,
        "rainfall_mm": rainfall,
        "temperature": temperature,
        "humidity": humidity,
        "risk_score": risk_score,
        "severity": severity
    })
    return df


def train_and_evaluate():
    print("Generating synthetic sensor training dataset...")
    df = generate_synthetic_data()
    
    # Engineering features
    # 1. Hydraulic stress product = water_level * flow_rate
    df["hydraulic_stress"] = df["water_level_cm"] * df["flow_rate_lpm"]
    # 2. Precipitation ratio = rainfall * humidity / 100
    df["precipitation_ratio"] = df["rainfall_mm"] * (df["humidity"] / 100.0)
    
    X = df[["water_level_cm", "flow_rate_lpm", "rainfall_mm", "temperature", "humidity", "hydraulic_stress", "precipitation_ratio"]]
    y = df["severity"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("\n--- Training Random Forest Classifier ---")
    rf_param_grid = {
        "n_estimators": [50, 100, 150],
        "max_depth": [5, 10, None],
        "min_samples_split": [2, 5]
    }
    rf_grid = GridSearchCV(RandomForestClassifier(random_state=42), rf_param_grid, cv=3, scoring="accuracy")
    rf_grid.fit(X_train, y_train)
    rf_best = rf_grid.best_estimator_
    
    rf_preds = rf_best.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    rf_prec, rf_rec, rf_f1, _ = precision_recall_fscore_support(y_test, rf_preds, average="macro")
    
    print(f"Best RF Params: {rf_grid.best_params_}")
    print(f"Random Forest Accuracy:  {rf_acc:.4f}")
    print(f"Random Forest Precision: {rf_prec:.4f}")
    print(f"Random Forest Recall:    {rf_rec:.4f}")
    print(f"Random Forest F1-Score:  {rf_f1:.4f}")
    
    xgb_best = None
    xgb_acc = 0.0
    if XGBClassifier is not None:
        print("\n--- Training XGBoost Classifier ---")
        xgb = XGBClassifier(eval_metric="mlogloss", random_state=42)
        xgb.fit(X_train, y_train)
        xgb_preds = xgb.predict(X_test)
        xgb_acc = accuracy_score(y_test, xgb_preds)
        xgb_prec, xgb_rec, xgb_f1, _ = precision_recall_fscore_support(y_test, xgb_preds, average="macro")
        print(f"XGBoost Accuracy:  {xgb_acc:.4f}")
        print(f"XGBoost Precision: {xgb_prec:.4f}")
        print(f"XGBoost Recall:    {xgb_rec:.4f}")
        print(f"XGBoost F1-Score:  {xgb_f1:.4f}")
        xgb_best = xgb
    else:
        print("\n[Warning] xgboost is not installed. Skipping XGBoost model training.")
    
    # Model comparison & select best model
    if xgb_best is not None and xgb_acc > rf_acc:
        print("\nXGBoost outperformed Random Forest. Saving XGBoost model...")
        best_model = xgb_best
        model_type = "XGBoost"
    else:
        print("\nSaving Random Forest model (Default/Best)...")
        best_model = rf_best
        model_type = "RandomForest"
        
    # Evaluate and display Confusion Matrix of the chosen model
    best_preds = best_model.predict(X_test)
    cm = confusion_matrix(y_test, best_preds)
    print("\nConfusion Matrix:")
    print("Columns: Predicted (Safe, Warning, Danger, Critical)")
    print("Rows: Actual (Safe, Warning, Danger, Critical)")
    print(cm)
    
    # Save best model to disk
    model_path = os.path.join(MODEL_DIR, "best_model.joblib")
    metadata = {
        "model": best_model,
        "model_type": model_type,
        "features": list(X.columns),
        "accuracy": float(accuracy_score(y_test, best_preds))
    }
    joblib.dump(metadata, model_path)
    print(f"\nSaved best model metadata to: {model_path}")
    return metadata


if __name__ == "__main__":
    train_and_evaluate()
