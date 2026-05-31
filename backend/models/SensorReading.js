// We import mongoose — our MongoDB helper library
const mongoose = require('mongoose')

// This is the SCHEMA — it defines exactly what shape
// one sensor reading looks like in the database
// Think of it like designing a form with fixed fields
const SensorReadingSchema = new mongoose.Schema({

    device_id: {
        type: String,
        required: true
        // Which device sent this? "ESP32-FACTORY-01"
        // Required means MongoDB will reject data without this field
    },

    temperature: {
        type: Number,
        required: true
        // Must be a number — MongoDB rejects strings here
    },

    humidity: {
        type: Number,
        required: true
    },

    vibration: {
        type: Number,
        required: true
    },

    power_watts: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['NORMAL', 'ANOMALY'],
        // enum means only these two values allowed
        // MongoDB rejects anything else — data integrity!
        default: 'NORMAL'
    },

    timestamp: {
        type: Date,
        default: Date.now
        // If no timestamp provided, use current time automatically
    }

})

// This creates the actual MongoDB collection called "sensorreadings"
// and exports it so other files can use it
module.exports = mongoose.model('SensorReading', SensorReadingSchema)