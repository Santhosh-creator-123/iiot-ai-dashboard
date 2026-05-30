import paho.mqtt.client as mqtt
import json
import time
import random
import math

# ── MQTT broker config ──────────────────────────────
BROKER = "localhost"
PORT   = 1883
TOPIC  = "iiot/sensors"

# ── Connect to broker ───────────────────────────────
client = mqtt.Client(client_id="sensor-simulator")
client.connect(BROKER, PORT)
print("✅ Connected to MQTT broker")
print("📡 Sending sensor data every 2 seconds... Press Ctrl+C to stop\n")

# ── Counter for simulating gradual anomalies ────────
counter = 0

def generate_sensor_data(counter):
    # Normal temperature: 25–40°C
    # Every 30 readings simulate overheating anomaly
    if counter % 30 == 0 and counter != 0:
        temperature = round(random.uniform(75, 90), 2)  # anomaly!
        status = "ANOMALY"
    else:
        temperature = round(random.uniform(25, 42), 2)  # normal
        status = "NORMAL"

    # Vibration: normal 0.1–0.5g, anomaly above 2g
    if counter % 45 == 0 and counter != 0:
        vibration = round(random.uniform(2.5, 4.0), 3)  # anomaly!
    else:
        vibration = round(random.uniform(0.1, 0.5), 3)  # normal

    # Humidity: 40–70% normal
    humidity = round(random.uniform(40, 70), 1)

    # Power: 200–250W normal, spike at anomaly
    if status == "ANOMALY":
        power = round(random.uniform(400, 500), 1)
    else:
        power = round(random.uniform(200, 250), 1)

    # Build the JSON message
    data = {
        "device_id":   "ESP32-FACTORY-01",
        "timestamp":   time.strftime("%Y-%m-%dT%H:%M:%S"),
        "temperature": temperature,
        "humidity":    humidity,
        "vibration":   vibration,
        "power_watts": power,
        "status":      status
    }
    return data

# ── Main loop ───────────────────────────────────────
try:
    while True:
        sensor_data = generate_sensor_data(counter)
        message     = json.dumps(sensor_data)

        client.publish(TOPIC, message)

        # Pretty print to terminal
        print(f"[{sensor_data['timestamp']}] 📤 Published:")
        print(f"   🌡  Temp     : {sensor_data['temperature']}°C")
        print(f"   💧 Humidity  : {sensor_data['humidity']}%")
        print(f"   📳 Vibration : {sensor_data['vibration']}g")
        print(f"   ⚡ Power     : {sensor_data['power_watts']}W")
        print(f"   🔔 Status    : {sensor_data['status']}")
        print(f"   {'🚨 ANOMALY DETECTED!' if sensor_data['status'] == 'ANOMALY' else '✅ All normal'}")
        print("-" * 45)

        counter += 1
        time.sleep(2)

except KeyboardInterrupt:
    print("\n🛑 Simulator stopped.")
    client.disconnect()