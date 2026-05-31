// ── Load environment variables from .env file ─────
// Must be first line — loads MONGO_URI, PORT etc
require('dotenv').config()

// ── Import libraries ──────────────────────────────
const express   = require('express')
const mongoose  = require('mongoose')
const cors      = require('cors')
const http      = require('http')      // built into Node.js — no install needed
const { Server} = require('socket.io')

// ── Import our own files ──────────────────────────
const sensorRoutes         = require('./routes/sensors')
const { startMQTTClient }  = require('./mqttClient')

// ── Create Express app ────────────────────────────
const app = express()

// ── Middleware ────────────────────────────────────
// Middleware = functions that run on every request

// cors: allows React (port 3000) to call this server (port 5000)
// Without this, browser blocks the request for security
app.use(cors())

// express.json: automatically converts incoming JSON to JS object
// Without this, req.body would be undefined
app.use(express.json())

// ── Routes ────────────────────────────────────────
// All sensor API endpoints start with /api/sensors
// Example: /api/sensors/latest, /api/sensors/history
app.use('/api/sensors', sensorRoutes)

// ── Health check endpoint ─────────────────────────
// Open browser: http://localhost:5000/
// If you see the message, server is running
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 IIoT AI Dashboard Backend is running!',
        status: 'ok'
    })
})

// ── Create HTTP server from Express app ──────────
// We need this because Socket.io attaches to HTTP server
// not directly to Express app
const server = http.createServer(app)

// ── Create Socket.io instance ─────────────────────
// Attach it to HTTP server
// cors allows React frontend to connect
const io = new Server(server, {
    cors: {
        origin: '*',    // allow all origins for development
        methods: ['GET', 'POST']
    }
})

// ── Socket.io connection event ────────────────────
// Fires every time a new browser/dashboard connects
io.on('connection', (socket) => {
    console.log(`🖥️  Dashboard connected: ${socket.id}`)

    // Fires when dashboard disconnects (browser closed)
    socket.on('disconnect', () => {
        console.log(`👋 Dashboard disconnected: ${socket.id}`)
    })
})

// ── Connect to MongoDB ────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas')

        // ── Start MQTT client ─────────────────────
        // Only start after MongoDB is ready
        // Because MQTT handler needs to save to DB
        startMQTTClient(io)

        // ── Start HTTP server ─────────────────────
        const PORT = process.env.PORT || 5000
        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`)
            console.log('⏳ Waiting for sensor data...\n')
        })
    })
    .catch((error) => {
        console.error('❌ MongoDB connection failed:', error.message)
        console.log('💡 Check your MONGO_URI in .env file')
    })