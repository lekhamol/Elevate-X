"""
===================================================================================
ELEVATOR SAFETY DIGITAL TWIN - AI/ML PREDICTIVE MAINTENANCE ANOMALY DETECTOR
===================================================================================
Framework: Python 3.x + Scikit-Learn + Requests + Pandas + NumPy
Purpose  : Extracts real-time time-series telemetry from Spring Boot backend,
           trains an unsupervised Isolation Forest model, computes anomaly scores,
           and synchronizes predictive analytics back to the Digital Twin.
===================================================================================
"""

import requests
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import time

BACKEND_API_BASE = "http://localhost:8080/api/ml"

def fetch_telemetry_dataset():
    """Fetch recent time-series telemetry vectors from Spring Boot backend."""
    try:
        url = f"{BACKEND_API_BASE}/telemetry-dataset?elevatorId=ELV-01&limit=100"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f" Successfully fetched {len(data)} telemetry samples from Spring Boot REST API.")
            return data
        else:
            print(f" Failed to fetch dataset. HTTP Status: {response.status_code}")
            return []
    except Exception as e:
        print(f" Error connecting to Spring Boot backend: {e}")
        return []

def train_and_predict_anomalies(data):
    """Train Isolation Forest model on temperature, vibration, and current draw."""
    if not data or len(data) < 5:
        print(" Insufficient data points for ML model training.")
        return []

    # Convert JSON list to Pandas DataFrame
    df = pd.DataFrame(data)

    # Feature matrix extraction
    feature_cols = ['temperatureCelsius', 'vibrationMs2', 'motorCurrentAmps']
    X = df[feature_cols].fillna(0).values

    # Train Isolation Forest Anomaly Detector
    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    model.fit(X)

    # Compute decision function scores and outlier binary labels
    scores = model.decision_function(X) # Higher = normal, Lower = anomaly
    predictions = model.predict(X)       # -1 for anomaly, 1 for normal

    # Format predictions payload
    results = []
    for idx, row in df.iterrows():
        # Normalize score between 0.0 (normal) and 1.0 (highly anomalous)
        anomaly_score = float(np.clip(0.5 - (scores[idx] / 2.0), 0.0, 1.0))
        is_anomaly = bool(predictions[idx] == -1)

        results.append({
            "readingId": int(row['id']),
            "score": round(anomaly_score, 4),
            "isAnomaly": is_anomaly
        })

    print(f" ML Anomaly Inference completed. Detected {sum(1 for r in results if r['isAnomaly'])} anomalies.")
    return results

def push_predictions_to_backend(predictions):
    """Synchronize ML predictive maintenance scores back to Digital Twin."""
    if not predictions:
        return
    try:
        url = f"{BACKEND_API_BASE}/anomaly-predictions"
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, data=json.dumps(predictions), headers=headers, timeout=5)
        if response.status_code == 200:
            print(" Anomaly prediction scores successfully pushed to Digital Twin dashboard!")
        else:
            print(f" Failed to push predictions. Status: {response.status_code}")
    except Exception as e:
        print(f" Error pushing predictions to backend: {e}")

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 ELEVATOR DIGITAL TWIN - SCIKIT-LEARN ANOMALY DETECTION MODULE")
    print("=" * 70)

    # Execute single training & prediction cycle
    dataset = fetch_telemetry_dataset()
    if dataset:
        preds = train_and_predict_anomalies(dataset)
        push_predictions_to_backend(preds)
