import { useState, useEffect } from "react"
import { capitalizeFirstLetter, getPokemonImage } from "../services/pokemonService"
import { saveBattleResult } from "../services/teamService"
import StatBar from "./StatBar"
import "./StatComparisonBattle.css"

const StatComparisonBattle = ({ pokemon1, pokemon2 }) => {
  const [battleResult, setBattleResult] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [visibleStats, setVisibleStats] = useState([])
  const [battleStarted, setBattleStarted] = useState(false)
  const [battleLog, setBattleLog] = useState([])
  const [currentStat, setCurrentStat] = useState(null)
  const [attackingPokemon, setAttackingPokemon] = useState(null)

  useEffect(() => {
    // Reset battle state when Pokémon change
    if (pokemon1 && pokemon2) {
      setBattleLog([])
      setBattleStarted(false)
      setBattleResult(null)
      setVisibleStats([])
      setIsComparing(false)
      setCurrentStat(null)
      setAttackingPokemon(null)

      // Check if this battle is in favorites
      const favoriteBattles = JSON.parse(localStorage.getItem("favoriteBattles") || "[]")
      const isFav = favoriteBattles.some(
        (battle) => battle.pokemon1Id === pokemon1.id && battle.pokemon2Id === pokemon2.id,
      )
      setIsFavorite(isFav)
    }
  }, [pokemon1, pokemon2])

  const toggleFavorite = () => {
    if (!pokemon1 || !pokemon2) return

    const favoriteBattles = JSON.parse(localStorage.getItem("favoriteBattles") || "[]")

    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favoriteBattles.filter(
        (battle) => !(battle.pokemon1Id === pokemon1.id && battle.pokemon2Id === pokemon2.id),
      )
      localStorage.setItem("favoriteBattles", JSON.stringify(updatedFavorites))
    } else {
      // Add to favorites
      favoriteBattles.push({
        pokemon1Id: pokemon1.id,
        pokemon1Name: pokemon1.name,
        pokemon2Id: pokemon2.id,
        pokemon2Name: pokemon2.name,
        date: new Date().toISOString(),
      })
      localStorage.setItem("favoriteBattles", JSON.stringify(favoriteBattles))
    }

    setIsFavorite(!isFavorite)
  }

  const startBattle = () => {
    if (!pokemon1 || !pokemon2) return

    setBattleStarted(true)
    setIsComparing(true)
    setVisibleStats([])
    setBattleLog([])
    setBattleResult(null)

    // Get the relevant stats for battle
    const hp1 = pokemon1.stats.find((stat) => stat.stat.name === "hp").base_stat
    const attack1 = pokemon1.stats.find((stat) => stat.stat.name === "attack").base_stat
    const defense1 = pokemon1.stats.find((stat) => stat.stat.name === "defense").base_stat
    const speed1 = pokemon1.stats.find((stat) => stat.stat.name === "speed").base_stat

    const hp2 = pokemon2.stats.find((stat) => stat.stat.name === "hp").base_stat
    const attack2 = pokemon2.stats.find((stat) => stat.stat.name === "attack").base_stat
    const defense2 = pokemon2.stats.find((stat) => stat.stat.name === "defense").base_stat
    const speed2 = pokemon2.stats.find((stat) => stat.stat.name === "speed").base_stat

    // Compare each stat to determine round winners
    const hpWinner = hp1 > hp2 ? pokemon1 : hp2 > hp1 ? pokemon2 : null
    const attackWinner = attack1 > attack2 ? pokemon1 : attack2 > attack1 ? pokemon2 : null
    const defenseWinner = defense1 > defense2 ? pokemon1 : defense2 > defense1 ? pokemon2 : null
    const speedWinner = speed1 > speed2 ? pokemon1 : speed2 > speed1 ? pokemon2 : null

    // Count wins for each Pokémon
    let pokemon1Wins = 0
    let pokemon2Wins = 0

    if (hpWinner === pokemon1) pokemon1Wins++
    else if (hpWinner === pokemon2) pokemon2Wins++

    if (attackWinner === pokemon1) pokemon1Wins++
    else if (attackWinner === pokemon2) pokemon2Wins++

    if (defenseWinner === pokemon1) pokemon1Wins++
    else if (defenseWinner === pokemon2) pokemon2Wins++

    if (speedWinner === pokemon1) pokemon1Wins++
    else if (speedWinner === pokemon2) pokemon2Wins++

    // Determine overall winner
    const winner = pokemon1Wins > pokemon2Wins ? pokemon1 : pokemon2Wins > pokemon1Wins ? pokemon2 : null

    // Create battle log
    const battleLog = [
      { stat: "HP", pokemon1: hp1, pokemon2: hp2, winner: hpWinner?.name || "Tie" },
      { stat: "Attack", pokemon1: attack1, pokemon2: attack2, winner: attackWinner?.name || "Tie" },
      { stat: "Defense", pokemon1: defense1, pokemon2: defense2, winner: defenseWinner?.name || "Tie" },
      { stat: "Speed", pokemon1: speed1, pokemon2: speed2, winner: speedWinner?.name || "Tie" },
    ]

    // Create battle result
    const result = {
      pokemon1: {
        id: pokemon1.id,
        name: pokemon1.name,
        image: pokemon1.sprites.front_default,
        wins: pokemon1Wins,
      },
      pokemon2: {
        id: pokemon2.id,
        name: pokemon2.name,
        image: pokemon2.sprites.front_default,
        wins: pokemon2Wins,
      },
      winner: winner
        ? {
            id: winner.id,
            name: winner.name,
          }
        : null,
      battleLog,
      date: new Date().toISOString(),
    }

    // Gradually reveal stats with delays and show battle log
    compareNextStat(0, battleLog, result)
  }

  const compareNextStat = (index, battleLog, finalResult) => {
    if (index >= battleLog.length) {
      // All stats compared, show the final result
      setIsComparing(false)
      setBattleResult(finalResult)

      // Save battle result
      saveBattleResult(finalResult)
      return
    }

    const currentStatData = battleLog[index]
    setCurrentStat(currentStatData.stat)

    // Set attacking Pokemon for animation
    if (currentStatData.winner !== "Tie") {
      setAttackingPokemon(currentStatData.winner === pokemon1.name ? pokemon1 : pokemon2)
    } else {
      setAttackingPokemon(null)
    }

    // Add to visible stats
    setVisibleStats((prev) => [...prev, currentStatData.stat])

    // Add to battle log
    const logMessage = `Comparing ${currentStatData.stat}: ${capitalizeFirstLetter(pokemon1.name)} (${currentStatData.pokemon1}) vs ${capitalizeFirstLetter(pokemon2.name)} (${currentStatData.pokemon2}) - ${currentStatData.winner === "Tie" ? "It's a tie!" : `${capitalizeFirstLetter(currentStatData.winner)} wins!`}`

    setBattleLog((prev) => [...prev, logMessage])

    // Move to next stat after delay
    setTimeout(() => {
      setAttackingPokemon(null)
      setTimeout(() => {
        compareNextStat(index + 1, battleLog, finalResult)
      }, 500)
    }, 1500)
  }

  const resetBattle = () => {
    setBattleStarted(false)
    setBattleResult(null)
    setVisibleStats([])
    setIsComparing(false)
    setBattleLog([])
    setCurrentStat(null)
    setAttackingPokemon(null)
  }

  if (!pokemon1 || !pokemon2) {
    return (
      <div className="stat-battle-empty">
        <p>Select two Pokémon to battle!</p>
      </div>
    )
  }

  return (
    <div className="stat-battle-container">
      <button className={`favorite-button ${isFavorite ? "active" : ""}`} onClick={toggleFavorite}>
        {isFavorite ? "★" : "☆"}
      </button>

      <div className="stat-battle-arena">
        <div className={`pokemon-fighter ${attackingPokemon === pokemon1 ? "attacking" : ""}`}>
          <img src={getPokemonImage(pokemon1) || "/placeholder.svg"} alt={pokemon1.name} className="fighter-image" />
          <div className="fighter-name">{capitalizeFirstLetter(pokemon1.name)}</div>
        </div>

        <div className="battle-vs">VS</div>

        <div className={`pokemon-fighter ${attackingPokemon === pokemon2 ? "attacking" : ""}`}>
          <img src={getPokemonImage(pokemon2) || "/placeholder.svg"} alt={pokemon2.name} className="fighter-image" />
          <div className="fighter-name">{capitalizeFirstLetter(pokemon2.name)}</div>
        </div>
      </div>

      {!battleStarted ? (
        <button onClick={startBattle} className="battle-button">
          Start Battle
        </button>
      ) : isComparing ? (
        <>
          <div className="current-comparison">
            <h3>Comparing: {currentStat}</h3>
          </div>
          <div className="battle-log-container">
            <h3 className="battle-log-title">Battle Log</h3>
            <div className="battle-log-entries">
              {battleLog.map((entry, index) => (
                <div key={index} className="battle-log-entry">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : battleResult ? (
        <div className="stat-battle-result">
          <h2 className="battle-result-title">
            {battleResult.winner ? `${capitalizeFirstLetter(battleResult.winner.name)} Wins!` : "It's a Tie!"}
          </h2>

          <div className="stat-comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Stat</th>
                  <th>{capitalizeFirstLetter(pokemon1.name)}</th>
                  <th>{capitalizeFirstLetter(pokemon2.name)}</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody>
                {battleResult.battleLog.map((log, index) => (
                  <tr key={index} className={log.winner === "Tie" ? "tie-row" : ""}>
                    <td>{log.stat}</td>
                    <td className={log.winner === pokemon1.name ? "winner-cell" : ""}>{log.pokemon1}</td>
                    <td className={log.winner === pokemon2.name ? "winner-cell" : ""}>{log.pokemon2}</td>
                    <td>{capitalizeFirstLetter(log.winner)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total Wins</td>
                  <td>{battleResult.pokemon1.wins}</td>
                  <td>{battleResult.pokemon2.wins}</td>
                  <td>{battleResult.winner ? capitalizeFirstLetter(battleResult.winner.name) : "Tie"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="battle-stats-comparison">
            <div className="battle-stats-column">
              <h3>{capitalizeFirstLetter(pokemon1.name)}</h3>
              {pokemon1.stats.map((stat) => (
                <StatBar key={stat.stat.name} statName={stat.stat.name} value={stat.base_stat} />
              ))}
            </div>

            <div className="battle-stats-column">
              <h3>{capitalizeFirstLetter(pokemon2.name)}</h3>
              {pokemon2.stats.map((stat) => (
                <StatBar key={stat.stat.name} statName={stat.stat.name} value={stat.base_stat} />
              ))}
            </div>
          </div>

          <button onClick={resetBattle} className="battle-button">
            Battle Again
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default StatComparisonBattle
