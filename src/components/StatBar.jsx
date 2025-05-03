import "./StatBar.css"

const StatBar = ({ statName, value, maxValue = 255 }) => {
  const percentage = Math.min((value / maxValue) * 100, 100)

  // Determine color based on stat value
  let barColor = "var(--danger)"
  if (percentage > 75) {
    barColor = "var(--success)"
  } else if (percentage > 50) {
    barColor = "var(--warning)"
  } else if (percentage > 25) {
    barColor = "var(--info)"
  }

  return (
    <div className="stat-bar-container">
      <div className="stat-bar-label">
        <span className="stat-name">{statName}</span>
        <span className="stat-value">{value}</span>
      </div>
      <div className="stat-bar-background">
        <div
          className="stat-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        ></div>
      </div>
    </div>
  )
}

export default StatBar
