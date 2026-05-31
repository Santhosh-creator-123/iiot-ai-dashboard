// Import MQTT library
const mqtt    = require('mqtt')

// Import our database model
const SensorReading = require('./models/SensorReading')

// This function is called from server.js
// It receives the Socket.io instance so it can
// push data to dashboard in real time
function startMQTTClient(io) {

    // Connect to Mosquitto broker running on your laptop
    const client = mqtt.connect(process.env.MQTT_BROKER)

    // ── When connected to broker ──────────────────────
    client.on('connect', () => {
        console.log('✅ Connected to MQTT broker')

        // Subscribe to the topic your Python simulator publishes to
        // This is like tuning your radio to a specific station
        client.subscribe('iiot/sensors', (err) => {
            if (!err) {
                console.log('📡 Subscribed to iiot/sensors topic')
            }
        })
    })

    // ── When a message arrives ────────────────────────
    // This fires every time Python simulator sends a reading
    client.on('message', async (topic, message) => {

        try {
            // message arrives as raw bytes — convert to string first
            // then parse JSON string into JavaScript object
            const data = JSON.parse(message.toString())

            console.log(`📥 Received from ${data.device_id}:`)
            console.log(`   🌡  Temp: ${data.temperature}°C`)
            console.log(`   ⚡ Power: ${data.power_watts}W`)
            console.log(`   🔔 Status: ${data.status}`)

            // ── Save to MongoDB ───────────────────────
            // Create new document using our schema
            const reading = new SensorReading({
                device_id:   data.device_id,
                temperature: data.temperature,
                humidity:    data.humidity,
                vibration:   data.vibration,
                power_watts: data.power_watts,
                status:      data.status,
                timestamp:   new Date(data.timestamp)
            })

            // Actually save it to database
            // await means "wait until saved before continuing"
            await reading.save()
            console.log('💾 Saved to MongoDB')

            // ── Push to dashboard via Socket.io ───────
            // io.emit sends to ALL connected dashboard users
            // 'sensorData' is the event name React will listen for
            io.emit('sensorData', data)
            console.log('📡 Pushed to dashboard via Socket.io')
            console.log('─'.repeat(45))

        } catch (error) {
            console.error('❌ Error processing message:', error.message)
        }
    })

    // ── If connection fails ───────────────────────────
    client.on('error', (error) => {
        console.error('❌ MQTT Error:', error.message)
    })
}

module.exports = { startMQTTClient }