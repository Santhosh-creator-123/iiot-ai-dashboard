// Import Recharts components
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

// data = array of last 50 sensor readings
// dataKey = which field to chart ("temperature", "power_watts" etc)
// color = line color
// unit = "°C", "W" etc
// label = chart title
function LiveChart({ data, dataKey, color, unit, label }) {

  // Format timestamp for X axis — show only time HH:MM:SS
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  // Custom tooltip that appears when hovering chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 border border-gray-600 
          rounded-lg p-2 text-sm">
          <p className="text-white font-semibold">
            {payload[0].value}{unit}
          </p>
          <p className="text-gray-400 text-xs">
            {formatTime(payload[0].payload.timestamp)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      
      {/* Chart title */}
      <h2 className="text-white font-semibold text-lg mb-4">
        📈 {label}
      </h2>

      {/* ResponsiveContainer makes chart fill its parent width */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          
          {/* Grid lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          
          {/* X axis — timestamps */}
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatTime}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            interval="preserveStartEnd"
          />
          
          {/* Y axis — values */}
          <YAxis 
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            unit={unit}
          />
          
          {/* Tooltip on hover */}
          <Tooltip content={<CustomTooltip />} />
          
          {/* The actual line */}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}        // no dots on each point — cleaner look
            isAnimationActive={false}  // disable animation for real-time
          />

          {/* Warning line at 60°C for temperature */}
          {dataKey === 'temperature' && (
            <ReferenceLine 
              y={60} 
              stroke="#EF4444" 
              strokeDasharray="5 5"
              label={{ value: 'Alert threshold', fill: '#EF4444', fontSize: 11 }}
            />
          )}

        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LiveChart