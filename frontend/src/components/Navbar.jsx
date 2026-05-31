import { useState, useEffect } from 'react'

// connected = true/false — is Socket.io connected to backend?
function Navbar({ connected }) {

  // Live clock state
  const [time, setTime] = useState(new Date())

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    // Cleanup — stop timer when component unmounts
    return () => clearInterval(timer)
  }, [])

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        
        {/* Left — Project name */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏭</span>
          <div>
            <h1 className="text-white font-bold text-lg">
              IIoT AI Dashboard
            </h1>
            <p className="text-gray-400 text-xs">
              ESP32-FACTORY-01 · Real-time monitoring
            </p>
          </div>
        </div>

        {/* Right — Connection status + clock */}
        <div className="flex items-center gap-4">
          
          {/* Live clock */}
          <span className="text-gray-400 text-sm font-mono">
            {time.toLocaleTimeString()}
          </span>

          {/* Connection status dot */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}/>
            <span className={`text-sm font-medium ${
              connected ? 'text-green-400' : 'text-red-400'
            }`}>
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar