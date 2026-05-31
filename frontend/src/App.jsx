import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Navbar from './components/Navbar'
import SensorCard from './components/SensorCard'
import LiveChart from './components/LiveChart'
import AlertFeed from './components/AlertFeed'

// Connect to your Node.js backend
// This creates a permanent WebSocket connection
const socket = io('http://localhost:5000')

function App() {

  // ── State variables ───────────────────────────────
  // React re-renders whenever these change

  // Is Socket.io connected to backend?
  const [connected, setConnected]       = useState(false)

  // Latest single sensor reading — for metric cards
  const [latest, setLatest]             = useState(null)

  // Last 50 readings — for charts
  const [history, setHistory]           = useState([])

  // Only anomaly readings — for alert feed
  const [alerts, setAlerts]             = useState([])

  // ── Socket.io events ──────────────────────────────
  useEffect(() => {

    // When connected to backend
    socket.on('connect', () => {
      console.log('✅ Connected to backend')
      setConnected(true)
    })

    // When disconnected
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from backend')
      setConnected(false)
    })

    // When new sensor data arrives — this fires every 2 seconds
    socket.on('sensorData', (data) => {
      console.log('📥 New data:', data)

      // Update latest reading for metric cards
      setLatest(data)

      // Add to history for charts — keep only last 50 readings
      // ...prev means "keep all previous items"
      setHistory(prev => {
        const updated = [...prev, data]
        return updated.slice(-50)  // only last 50
      })

      // If anomaly — add to alerts list
      if (data.status === 'ANOMALY') {
        setAlerts(prev => [data, ...prev].slice(0, 20))
        // newest first, keep max 20
      }
    })

    // Cleanup — remove listeners when component unmounts
    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('sensorData')
    }
  }, [])

  // ── Render ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Top navbar */}
      <Navbar connected={connected} />

      {/* Main content */}
      <div className="p-6 flex flex-col gap-6">

        {/* Waiting for first data */}
        {!latest && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">📡</div>
            <p className="text-xl">Waiting for sensor data...</p>
            <p className="text-sm mt-2">
              Make sure Python simulator and Node.js server are running
            </p>
          </div>
        )}

        {/* Show dashboard once data arrives */}
        {latest && (
          <>
            {/* Metric cards — 4 in a row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SensorCard
                title="Temperature"
                value={latest.temperature}
                unit="°C"
                icon="🌡️"
                status={latest.status}
              />
              <SensorCard
                title="Humidity"
                value={latest.humidity}
                unit="%"
                icon="💧"
                status={latest.status}
              />
              <SensorCard
                title="Vibration"
                value={latest.vibration}
                unit="g"
                icon="📳"
                status={latest.status}
              />
              <SensorCard
                title="Power"
                value={latest.power_watts}
                unit="W"
                icon="⚡"
                status={latest.status}
              />
            </div>

            {/* Charts + Alerts row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Temperature chart — takes 2/3 width */}
              <div className="md:col-span-2">
                <LiveChart
                  data={history}
                  dataKey="temperature"
                  color="#ff6b6b"
                  unit="°C"
                  label="Live Temperature"
                />
              </div>

              {/* Alert feed — takes 1/3 width */}
              <AlertFeed alerts={alerts} />

            </div>

            {/* Power chart — full width */}
            <LiveChart
              data={history}
              dataKey="power_watts"
              color="#4ecdc4"
              unit="W"
              label="Live Power Consumption"
            />

          </>
        )}
      </div>
    </div>
  )
}

export default App