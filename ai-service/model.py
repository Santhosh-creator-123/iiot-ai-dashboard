# model.py — The AI brain
# This file contains the Isolation Forest model
# that learns what normal sensor data looks like
# and detects anomalies automatically

import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    
    def __init__(self):
        # Create Isolation Forest model
        # contamination = expected % of anomalies in data
        # 0.1 means "expect about 10% anomalies"
        # random_state = 42 means results are reproducible
        self.model = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100  # 100 decision trees — more = more accurate
        )
        
        # Track if model has been trained yet
        self.is_trained = False
        
        # Store incoming readings for training
        # We need at least 50 readings before training
        self.training_buffer = []
        
        # Minimum readings needed before AI starts working
        self.MIN_TRAINING_SAMPLES = 50
        
        print("🤖 AI Anomaly Detector initialized")
        print(f"⏳ Collecting {self.MIN_TRAINING_SAMPLES} readings before AI activates...")

    def add_reading(self, temperature, humidity, vibration, power_watts):
        """
        Add a new sensor reading.
        First 50 readings = training data (learning normal behavior)
        After 50 = AI starts predicting
        """
        
        # Convert reading to feature array
        # AI sees each reading as 4 numbers
        features = [temperature, humidity, vibration, power_watts]
        
        # Add to training buffer
        self.training_buffer.append(features)
        
        # Once we have enough data, train the model
        if not self.is_trained and len(self.training_buffer) >= self.MIN_TRAINING_SAMPLES:
            self._train()
        
        return features

    def _train(self):
        """
        Train the Isolation Forest on collected normal data.
        This happens automatically after MIN_TRAINING_SAMPLES readings.
        """
        print(f"\n🧠 Training AI model on {len(self.training_buffer)} readings...")
        
        # Convert list to numpy array — format scikit-learn needs
        X = np.array(self.training_buffer)
        
        # FIT = learn what normal looks like
        self.model.fit(X)
        
        self.is_trained = True
        print("✅ AI model trained! Anomaly detection is now ACTIVE")
        print("🔍 Watching for unusual patterns...\n")

    def predict(self, temperature, humidity, vibration, power_watts):
        """
        Predict if a reading is normal or anomaly.
        Returns dict with status and confidence score.
        """
        
        # If not enough data yet — use simple threshold rules
        # as fallback until AI is ready
        if not self.is_trained:
            remaining = self.MIN_TRAINING_SAMPLES - len(self.training_buffer)
            
            # Simple fallback rule while AI is learning
            if temperature > 70 or vibration > 2.0 or power_watts > 400:
                return {
                    "status": "ANOMALY",
                    "method": "threshold",  # tells us which method was used
                    "score": -1.0,
                    "message": f"Threshold rule triggered (AI training: {remaining} more readings needed)"
                }
            return {
                "status": "NORMAL",
                "method": "threshold",
                "score": 1.0,
                "message": f"AI training in progress — {remaining} more readings needed"
            }
        
        # AI is trained — use Isolation Forest
        features = np.array([[temperature, humidity, vibration, power_watts]])
        
        # predict() returns:
        # +1 = normal (inlier)
        # -1 = anomaly (outlier)
        prediction = self.model.predict(features)[0]
        
        # decision_function() returns anomaly score
        # More negative = more anomalous
        score = self.model.decision_function(features)[0]
        
        if prediction == -1:
            print(f"🚨 ANOMALY DETECTED! Score: {score:.3f}")
            print(f"   Temp:{temperature}°C Vibration:{vibration}g Power:{power_watts}W")
            return {
                "status": "ANOMALY",
                "method": "isolation_forest",
                "score": float(score),
                "message": f"AI detected unusual pattern (score: {score:.3f})"
            }
        else:
            return {
                "status": "NORMAL", 
                "method": "isolation_forest",
                "score": float(score),
                "message": "All parameters within normal range"
            }

    def get_stats(self):
        """Return current model statistics"""
        return {
            "is_trained": self.is_trained,
            "readings_collected": len(self.training_buffer),
            "min_samples_needed": self.MIN_TRAINING_SAMPLES,
            "training_progress": f"{min(len(self.training_buffer), self.MIN_TRAINING_SAMPLES)}/{self.MIN_TRAINING_SAMPLES}"
        }


# Create ONE instance — shared across all API requests
# This is important — same model instance for everyone
detector = AnomalyDetector()