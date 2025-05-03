import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { usePokemon } from "../context/PokemonContext"
import { getPokemonImage, formatPokemonId, capitalizeFirstLetter } from "../services/pokemonService"
import BattleSimulator from "../components/BattleSimulator"
import StatComparisonBattle from "../components/StatComparisonBattle"
import "./Battle.css"

const Battle = () => {
  const { team, enemyTeam, removeFromEnemyTeam, loading } = usePokemon()
  const [selectedPokemon1, setSelectedPokemon1] = useState(null)
  const [selectedPokemon2, setSelectedPokemon2] = useState(null)
  const [message, setMessage] = useState(null)
  const [battleMode, setBattleMode] = useState("damage") // "damage" or "stats"

  useEffect(() => {
    // Auto-select first Pokémon from team if available
    if (team.length > 0 && !selectedPokemon1) {
      setSelectedPokemon1(team[0])
    }

    // Auto-select first Pokémon from enemy team if available
    if (enemyTeam.length > 0 && !selectedPokemon2) {
      setSelectedPokemon2(enemyTeam[0])
    }
  }, [team, enemyTeam, selectedPokemon1, selectedPokemon2])

  const handleSelectPokemon = (pokemon, slot) => {
    if (slot === 1) {
      setSelectedPokemon1(pokemon)
    } else {
      setSelectedPokemon2(pokemon)
    }
  }

  const handleRemoveFromEnemyTeam = async (pokemonId) => {
    const result = await removeFromEnemyTeam(pokemonId)
    setMessage(result.message)

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const handleBattleModeChange = (mode) => {
    setBattleMode(mode)
  }

  return (
    <div className="container">
      <h1 className="page-title">Battle Arena</h1>

      {message && <div className="message success-message">{message}</div>}

      <div className="battle-selection">
        <div className="battle-selection-column">
          <h2 className="selection-title">Your Team</h2>

          {team.length === 0 ? (
            <div className="empty-selection">
              <p>Your team is empty!</p>
              <Link to="/" className="btn btn-primary">
                Add Pokémon to your team
              </Link>
            </div>
          ) : (
            <div className="pokemon-selection-grid">
              {team.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className={`pokemon-selection-card ${selectedPokemon1?.id === pokemon.id ? "selected" : ""}`}
                  onClick={() => handleSelectPokemon(pokemon, 1)}
                >
                  <img
                    src={getPokemonImage(pokemon) || "/placeholder.svg"}
                    alt={pokemon.name}
                    className="selection-card-image pixel-art"
                  />
                  <div className="selection-card-info">
                    <div className="selection-card-id">{formatPokemonId(pokemon.id)}</div>
                    <div className="selection-card-name">{capitalizeFirstLetter(pokemon.name)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="battle-selection-column">
          <div className="enemy-team-header">
            <h2 className="selection-title">Enemy Team</h2>
          </div>

          {enemyTeam.length === 0 ? (
            <div className="empty-selection">
              <p>Enemy team is empty!</p>
              <p>Add enemies from the Pokédex.</p>
            </div>
          ) : (
            <div className="pokemon-selection-grid">
              {enemyTeam.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className={`pokemon-selection-card enemy-card ${selectedPokemon2?.id === pokemon.id ? "selected" : ""}`}
                  onClick={() => handleSelectPokemon(pokemon, 2)}
                >
                  <button
                    className="remove-enemy-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFromEnemyTeam(pokemon.id)
                    }}
                  >
                    ×
                  </button>
                  <img
                    src={getPokemonImage(pokemon) || "/placeholder.svg"}
                    alt={pokemon.name}
                    className="selection-card-image pixel-art"
                  />
                  <div className="selection-card-info">
                    <div className="selection-card-id">{formatPokemonId(pokemon.id)}</div>
                    <div className="selection-card-name">{capitalizeFirstLetter(pokemon.name)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="battle-mode-selector">
        <h3>Battle Mode</h3>
        <div className="battle-mode-options">
          <button
            className={`battle-mode-btn ${battleMode === "stats" ? "active" : ""}`}
            onClick={() => handleBattleModeChange("stats")}
          >
            Stat Comparison
          </button>
          <button
            className={`battle-mode-btn ${battleMode === "damage" ? "active" : ""}`}
            onClick={() => handleBattleModeChange("damage")}
          >
            Damage-Based Battle
          </button>
        </div>
      </div>

      {battleMode === "stats" ? (
        <StatComparisonBattle pokemon1={selectedPokemon1} pokemon2={selectedPokemon2} />
      ) : (
        <BattleSimulator pokemon1={selectedPokemon1} pokemon2={selectedPokemon2} />
      )}
    </div>
  )
}

export default Battle
