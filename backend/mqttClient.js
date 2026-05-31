// Import MQTT library
const mqtt = require('mqtt')

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

            // ── Call Python AI service ────────────────
            // Every sensor reading gets sent to AI for analysis
            // AI returns NORMAL or ANOMALY based on learned patterns
            try {
                const aiResponse = await fetch('http://localhost:8000/detect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        device_id:   data.device_id,
                        temperature: data.temperature,
                        humidity:    data.humidity,
                        vibration:   data.vibration,
                        power_watts: data.power_watts,
                        timestamp:   data.timestamp
                    })
                })

                const aiResult = await aiResponse.json()

                console.log(`🤖 AI says: ${aiResult.status} (${aiResult.method})`)
                console.log(`   📊 Score: ${aiResult.score}`)
                console.log(`   💬 ${aiResult.message}`)

                // ── If AI detected anomaly ────────────
                // Override the simulator's status with AI's decision
                // AI is smarter than hardcoded rules
                if (aiResult.status === 'ANOMALY') {

                    // Update data object with AI result
                    // This is what gets sent to dashboard
                    data.status     = 'ANOMALY'
                    data.ai_score   = aiResult.score
                    data.ai_message = aiResult.message
                    data.ai_method  = aiResult.method

                    // Update the MongoDB record we just saved
                    // Set status to ANOMALY and store AI score
                    await reading.updateOne({
                        $set: {
                            status:     'ANOMALY',
                            ai_score:   aiResult.score,
                            ai_message: aiResult.message
                        }
                    })

                    console.log('🚨 ANOMALY confirmed by AI!')
                    console.log('   Dashboard alert triggered!')

                } else {
                    // AI says normal — add score to data anyway
                    // Dashboard can use this for confidence display
                    data.ai_score   = aiResult.score
                    data.ai_message = aiResult.message
                    data.ai_method  = aiResult.method
                }

            } catch (aiError) {
                // If AI service is down — don't crash Node.js!
                // Just log warning and continue without AI
                // Dashboard still gets data, just without AI analysis
                console.log('⚠️  AI service not responding — continuing without AI')
                console.log('   Start AI service: cd ai-service && python main.py')
            }

            // ── Push to dashboard via Socket.io ───────
            // io.emit sends to ALL connected dashboard users
            // 'sensorData' is the event name React will listen for
            // data now includes AI result if service was available
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