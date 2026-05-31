// Express router — handles all sensor-related API endpoints
const express = require('express')
const router  = express.Router()

// Import our SensorReading model to query MongoDB
const SensorReading = require('../models/SensorReading')

// ── ENDPOINT 1 ───────────────────────────────────────
// GET /api/sensors/latest
// Dashboard calls this to get the most recent reading
// Example: fetch('http://localhost:5000/api/sensors/latest')
router.get('/latest', async (req, res) => {
    try {
        // Find one reading, sorted by timestamp descending
        // -1 means newest first
        const latest = await SensorReading
            .findOne()
            .sort({ timestamp: -1 })

        if (!latest) {
            return res.status(404).json({ 
                message: 'No sensor data yet' 
            })
        }

        // Send the reading back as JSON
        res.json(latest)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// ── ENDPOINT 2 ───────────────────────────────────────
// GET /api/sensors/history?limit=100
// Dashboard calls this to get historical data for charts
// Example: fetch('http://localhost:5000/api/sensors/history?limit=50')
router.get('/history', async (req, res) => {
    try {
        // ?limit=100 comes from URL — default to 100 if not provided
        const limit = parseInt(req.query.limit) || 100

        const readings = await SensorReading
            .find()                      // get all readings
            .sort({ timestamp: -1 })     // newest first
            .limit(limit)                // only N readings
            .select('-__v')              // hide internal MongoDB field

        res.json(readings)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// ── ENDPOINT 3 ───────────────────────────────────────
// GET /api/sensors/anomalies
// Dashboard calls this to show only anomaly alerts
router.get('/anomalies', async (req, res) => {
    try {
        const anomalies = await SensorReading
            .find({ status: 'ANOMALY' })  // only anomaly readings
            .sort({ timestamp: -1 })
            .limit(50)

        res.json(anomalies)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router