// alerts is an array of anomaly readings passed from App.jsx
function AlertFeed({ alerts }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🚨</span>
        <h2 className="text-white font-semibold text-lg">Anomaly Alerts</h2>
        {/* Badge showing count */}
        <span className="ml-auto bg-red-500/20 text-red-400 text-xs 
          px-2 py-1 rounded-full font-semibold">
          {alerts.length} alerts
        </span>
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        
        {/* If no alerts yet */}
        {alerts.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">
            ✅ No anomalies detected yet
          </div>
        )}

        {/* Map through each alert and show it */}
        {alerts.map((alert, index) => (
          <div key={index} 
            className="bg-red-500/10 border border-red-500/30 
              rounded-lg p-3 flex flex-col gap-1">
            
            <div className="flex items-center justify-between">
              <span className="text-red-400 font-semibold text-sm">
                🚨 {alert.device_id}
              </span>
              <span className="text-gray-500 text-xs">
                {/* Format timestamp nicely */}
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-gray-300 text-xs flex gap-3">
              <span>🌡️ {alert.temperature}°C</span>
              <span>⚡ {alert.power_watts}W</span>
              <span>📳 {alert.vibration}g</span>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}

export default AlertFeed