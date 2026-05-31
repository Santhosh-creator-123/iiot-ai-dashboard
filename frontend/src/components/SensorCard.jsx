// SensorCard receives 4 props (inputs) from parent:
// - title: "Temperature"
// - value: "34.4"
// - unit: "°C"
// - status: "NORMAL" or "ANOMALY"

function SensorCard({ title, value, unit, icon, status }) {

  // Color changes based on status
  // NORMAL = green, ANOMALY = red, default = yellow
  const statusColor = {
    NORMAL:  'border-green-500 bg-green-500/10',
    ANOMALY: 'border-red-500 bg-red-500/10',
  }[status] || 'border-yellow-500 bg-yellow-500/10'

  const valueColor = {
    NORMAL:  'text-green-400',
    ANOMALY: 'text-red-400',
  }[status] || 'text-yellow-400'

  return (
    <div className={`border-2 rounded-xl p-5 flex flex-col gap-2 ${statusColor}`}>
      
      {/* Card title row */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Main value */}
      <div className={`text-3xl font-bold ${valueColor}`}>
        {value}
        <span className="text-lg font-normal text-gray-400 ml-1">{unit}</span>
      </div>

      {/* Status badge */}
      <div className={`text-xs font-semibold px-2 py-1 rounded-full w-fit
        ${status === 'ANOMALY' 
          ? 'bg-red-500/20 text-red-400' 
          : 'bg-green-500/20 text-green-400'}`}>
        {status === 'ANOMALY' ? '🚨 ANOMALY' : '✅ NORMAL'}
      </div>

    </div>
  )
}

export default SensorCard