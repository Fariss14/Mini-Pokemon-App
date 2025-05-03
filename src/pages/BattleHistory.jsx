import { useState, useEffect } from "react"
import { getBattleHistory, deleteBattle } from "../services/teamService"
import { capitalizeFirstLetter } from "../services/pokemonService"
import "./BattleHistory.css"

const BattleHistory = () => {
  const [battles, setBattles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteMessage, setDeleteMessage] = useState(null)

  useEffect(() => {
    loadBattleHistory()
  }, [])

  const loadBattleHistory = async () => {
    try {
      setLoading(true)
      const history = await getBattleHistory()
      // Sort by date, newest first
      const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date))
      setBattles(sortedHistory)
    } catch (err) {
      setError("Failed to load battle history")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBattle = async (battleId) => {
    try {
      await deleteBattle(battleId)
      setBattles(battles.filter((battle) => battle.id !== battleId))
      setDeleteMessage("Battle deleted successfully!")

      // Clear message after 3 seconds
      setTimeout(() => {
        setDeleteMessage(null)
      }, 3000)
    } catch (err) {
      setError("Failed to delete battle")
      console.error(err)

      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null)
      }, 3000)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const renderBattleLog = (battle) => {
    if (battle.battleType === "damage-based") {
      return (
        <div className="battle-log">
          <h3 className="battle-log-title">Battle Log</h3>
          <div className="battle-log-entries">
            {battle.log && battle.log.length > 0 ? (
              battle.log.map((entry, logIndex) => (
                <div key={logIndex} className="battle-log-entry">
                  {entry.message}
                </div>
              ))
            ) : battle.battleLog && battle.battleLog.length > 0 ? (
              battle.battleLog.map((log, logIndex) => (
                <div key={logIndex} className="battle-log-entry">
                  {log.message ||
                    (log.attacker
                      ? `${capitalizeFirstLetter(log.attacker)} attacks for ${log.damage || 0}% damage`
                      : log.winner
                        ? `${capitalizeFirstLetter(log.winner)} wins this round`
                        : "Round completed")}
                </div>
              ))
            ) : (
              <div className="battle-log-entry">No detailed battle log available</div>
            )}
          </div>
          <div className="battle-summary">
            <p>Battle Type: Damage-based</p>
            <p>Rounds: {battle.rounds || "N/A"}</p>
            <p>
              Win Reason:{" "}
              {battle.winReason === "knockout" ? "Knockout" : battle.winReason === "rounds" ? "Higher HP" : "Tie"}
            </p>
          </div>
        </div>
      )
    } else {
      return (
        <div className="battle-log">
          <h3 className="battle-log-title">Battle Log</h3>
          <table className="battle-log-table">
            <thead>
              <tr>
                <th>Stat</th>
                <th>{capitalizeFirstLetter(battle.pokemon1.name)}</th>
                <th>{capitalizeFirstLetter(battle.pokemon2.name)}</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {battle.battleLog.map((log, logIndex) => (
                <tr key={logIndex}>
                  <td>{log.stat}</td>
                  <td>{log.pokemon1}</td>
                  <td>{log.pokemon2}</td>
                  <td>{capitalizeFirstLetter(log.winner)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="container">
        <h1 className="page-title">Battle History</h1>
        <div className="loading">
          <div className="pokeball-loading"></div>
          <p>Loading battle history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <h1 className="page-title">Battle History</h1>
        <div className="error">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="page-title">Battle History</h1>

      {deleteMessage && <div className="message success-message">{deleteMessage}</div>}

      {battles.length === 0 ? (
        <div className="empty-history">
          <p>No battles recorded yet. Go to the Battle Arena to start battling!</p>
        </div>
      ) : (
        <div className="battle-history-list">
          {battles.map((battle, index) => (
            <div key={index} className="battle-history-card">
              <div className="battle-history-header">
                <div className="battle-date">{formatDate(battle.date)}</div>
                <div className="battle-result">
                  {battle.winner ? `${capitalizeFirstLetter(battle.winner.name)} Wins!` : "It's a Tie!"}
                </div>
                <button
                  className="delete-battle-btn"
                  onClick={() => handleDeleteBattle(battle.id)}
                  aria-label="Delete battle"
                >
                  ×
                </button>
              </div>

              <div className="battle-opponents">
                <div className="battle-opponent">
                  <img
                    src={battle.pokemon1.image || "/placeholder.svg"}
                    alt={battle.pokemon1.name}
                    className="opponent-image pixel-art"
                  />
                  <div className="opponent-info">
                    <div className="opponent-name">{capitalizeFirstLetter(battle.pokemon1.name)}</div>
                    <div className="opponent-wins">Rounds won: {battle.pokemon1.wins}</div>
                  </div>
                </div>

                <div className="battle-vs">VS</div>

                <div className="battle-opponent">
                  <img
                    src={battle.pokemon2.image || "/placeholder.svg"}
                    alt={battle.pokemon2.name}
                    className="opponent-image pixel-art"
                  />
                  <div className="opponent-info">
                    <div className="opponent-name">{capitalizeFirstLetter(battle.pokemon2.name)}</div>
                    <div className="opponent-wins">Rounds won: {battle.pokemon2.wins}</div>
                  </div>
                </div>
              </div>

              {renderBattleLog(battle)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BattleHistory
