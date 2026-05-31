# main.py — FastAPI server
# This is the AI microservice that Node.js calls
# Every time a sensor reading arrives, Node.js
# sends it here and gets back NORMAL or ANOMALY

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import our AI detector
from model import detector

# Create FastAPI app
app = FastAPI(
    title="IIoT AI Anomaly Detection Service",
    description="Isolation Forest based anomaly detection for sensor data",
    version="1.0.0"
)

# Allow Node.js backend to call this service
# CORS = Cross Origin Resource Sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Data model ────────────────────────────────────
# Pydantic validates incoming data automatically
# If Node.js sends wrong format — FastAPI rejects it
class SensorReading(BaseModel):
    device_id:   str
    temperature: float
    humidity:    float
    vibration:   float
    power_watts: float
    timestamp:   str

# ── Endpoints ─────────────────────────────────────

@app.get("/")
def root():
    """Health check — is service running?"""
    return {
        "service": "IIoT AI Anomaly Detection",
        "status": "running",
        "model_stats": detector.get_stats()
    }

@app.post("/detect")
def detect_anomaly(reading: SensorReading):
    """
    Main endpoint — Node.js calls this for every sensor reading.
    
    Receives: sensor reading JSON
    Returns:  {status, method, score, message}
    
    Example input:
    {
        "device_id": "ESP32-FACTORY-01",
        "temperature": 34.4,
        "humidity": 42.1,
        "vibration": 0.389,
        "power_watts": 205.7,
        "timestamp": "2026-05-31T08:01:29"
    }
    
    Example output:
    {
        "status": "NORMAL",
        "method": "isolation_forest",
        "score": 0.142,
        "message": "All parameters within normal range"
    }
    """
    
    # Add reading to training buffer
    # (builds up training data automatically)
    detector.add_reading(
        reading.temperature,
        reading.humidity,
        reading.vibration,
        reading.power_watts
    )
    
    # Get AI prediction
    result = detector.predict(
        reading.temperature,
        reading.humidity,
        reading.vibration,
        reading.power_watts
    )
    
    # Log to terminal
    status_emoji = "🚨" if result["status"] == "ANOMALY" else "✅"
    print(f"{status_emoji} [{reading.device_id}] "
          f"Temp:{reading.temperature}°C "
          f"→ {result['status']} "
          f"(method: {result['method']})")
    
    return result

@app.get("/stats")
def get_stats():
    """
    Returns current AI model statistics.
    How many readings collected, is model trained, etc.
    """
    return detector.get_stats()

@app.delete("/reset")
def reset_model():
    """
    Reset the AI model — start learning from scratch.
    Useful when switching to a new machine or environment.
    """
    detector.training_buffer = []
    detector.is_trained = False
    return {"message": "AI model reset. Collecting new training data..."}

# ── Start server ──────────────────────────────────
if __name__ == "__main__":
    print("🚀 Starting IIoT AI Anomaly Detection Service...")
    print("📡 Listening on http://localhost:8000")
    print("📖 API docs at http://localhost:8000/docs\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )