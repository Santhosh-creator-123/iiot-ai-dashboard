# 🏭 IIoT AI Dashboard

> Real-time Industrial IoT monitoring dashboard with AI-powered anomaly detection

![Tech Stack](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MQTT](https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

---

## 📌 Project Overview

A full-stack Industrial IoT monitoring system that:
- Simulates multiple industrial sensors via MQTT protocol
- Detects anomalies in real-time using Machine Learning (Isolation Forest)
- Displays live sensor data on an interactive React dashboard
- Stores all data in MongoDB for historical analysis

Built as a complete end-to-end IoT + AI system from sensor to dashboard.

---

## 🏗️ Architecture

```
[Python Sensor Simulator]
        ↓ MQTT (HiveMQ Broker)
[Node.js Backend] ←→ [MongoDB Database]
        ↓ REST API
[FastAPI AI Service] ← Isolation Forest Model
        ↓
[React Frontend Dashboard]
```

---

## 📁 Folder Structure

```
iiot-ai-dashboard/
├── simulator/          # Python MQTT sensor data simulator
│   ├── simulator.py    # Publishes sensor data to MQTT broker
│   └── requirements.txt
│
├── ai-service/         # Python FastAPI anomaly detection service
│   ├── main.py         # FastAPI endpoints
│   ├── model.py        # Isolation Forest ML model
│   └── requirements.txt
│
├── backend/            # Node.js Express backend
│   ├── server.js       # Main server + MQTT subscriber
│   ├── routes/         # API routes
│   └── models/         # MongoDB schemas
│
└── frontend/           # React dashboard
    ├── src/
    │   ├── components/ # Sensor cards, charts, alerts
    │   └── pages/      # Dashboard pages
    └── package.json
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite + Tailwind CSS + Recharts |
| **Backend** | Node.js + Express.js |
| **AI Service** | Python FastAPI + scikit-learn |
| **Database** | MongoDB + Mongoose |
| **IoT Protocol** | MQTT (HiveMQ Cloud Broker) |
| **ML Model** | Isolation Forest (anomaly detection) |
| **Simulator** | Python + paho-mqtt |

---

## 🚀 Features

- ✅ **Real-time sensor monitoring** — live data updates every second
- ✅ **AI anomaly detection** — Isolation Forest flags unusual sensor readings
- ✅ **Multi-sensor support** — temperature, pressure, humidity, vibration
- ✅ **Alert system** — instant notifications when anomalies detected
- ✅ **Historical charts** — recharts-powered time-series visualization
- ✅ **MQTT pipeline** — full publish/subscribe IoT communication
- ✅ **REST API** — FastAPI microservice for ML predictions

---

## 🛠️ Setup & Installation

### Prerequisites
```
Node.js >= 16
Python >= 3.9
MongoDB (local or Atlas)
HiveMQ account (free tier works)
```

### 1. Clone the repo
```bash
git clone https://github.com/Santhosh-creator-123/iiot-ai-dashboard.git
cd iiot-ai-dashboard
```

### 2. Start the AI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the Backend
```bash
cd backend
npm install
# Create .env file with your MongoDB URI and MQTT credentials
npm run dev
```

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Run the Sensor Simulator
```bash
cd simulator
pip install -r requirements.txt
python simulator.py
```

---

## 🔧 Environment Variables

### backend/.env
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
MQTT_BROKER=your_hivemq_broker_url
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password
```

### frontend/.env
```env
VITE_API_URL=http://localhost:5000
```

---

## 📊 ML Model Details

**Algorithm:** Isolation Forest (unsupervised anomaly detection)

**Why Isolation Forest?**
- Works without labeled anomaly data
- Efficient on high-dimensional sensor data
- Low false positive rate
- Real-time prediction capability

**Features used:**
- Sensor value (temperature/pressure/humidity/vibration)
- Rate of change
- Rolling mean deviation
- Timestamp features

---

## 👨‍💻 Author

**Santhosh Mendi** — Full Stack & IoT Developer
- 🌐 Portfolio: [your-portfolio-url]
- 💼 Fiverr: [fiverr.com/santhuu_](https://fiverr.com/santhuu_)
- 🐙 GitHub: [Santhosh-creator-123](https://github.com/Santhosh-creator-123)

---

## 📄 License

MIT License — feel free to use this project for learning purposes.
