import { useState } from "react"
import { Link } from "react-router-dom"
import { usePokemon } from "../context/PokemonContext"
import { getPokemonImage, formatPokemonId, capitalizeFirstLetter } from "../services/pokemonService"
import "./Team.css"

const EnemyTeam = () => {
  const { enemyTeam, removeFromEnemyTeam, randomizeEnemyTeam, loading } = usePokemon()
  const [message, setMessage] = useState(null)

  const handleRemoveFromTeam = async (pokemonId) => {
    const result = await removeFromEnemyTeam(pokemonId)
    setMessage(result.message)

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const handleRandomizeTeam = async () => {
    const result = await randomizeEnemyTeam()
    setMessage(result.message)

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  return (
    <div className="container">
      <h1 className="page-title">Enemy Team</h1>

      {message && <div className="message success-message">{message}</div>}

      <div className="team-actions-top">
        <button onClick={handleRandomizeTeam} className="randomize-button" disabled={loading}>
          {loading ? "Loading..." : "Randomize Enemy Team"}
        </button>
      </div>

      {enemyTeam.length === 0 ? (
        <div className="empty-team">
          <p>Enemy team is empty! Add some Pokémon from the Pokédex or use the randomize button.</p>
          <Link to="/home" className="btn btn-primary">
            Browse Pokédex
          </Link>
        </div>
      ) : (
        <>
          <div className="team-stats">
            <p>{enemyTeam.length} of 6 Pokémon in enemy team</p>
          </div>

          <div className="team-grid">
            {enemyTeam.map((pokemon) => (
              <div key={pokemon.id} className="team-card enemy-team-card">
                <div className="team-card-header">
                  <span className="team-card-id">{formatPokemonId(pokemon.id)}</span>
                  <button onClick={() => handleRemoveFromTeam(pokemon.id)} className="remove-button">
                    ×
                  </button>
                </div>

                <Link to={`/pokemon/${pokemon.id}`} className="team-card-content">
                  <div className="team-card-image-container">
                    <img
                      src={getPokemonImage(pokemon) || "/placeholder.svg"}
                      alt={pokemon.name}
                      className="team-card-image pixel-art"
                    />
                  </div>

                  <h3 className="team-card-name">{capitalizeFirstLetter(pokemon.name)}</h3>

                  <div className="team-card-types">
                    {pokemon.types.map((type) => (
                      <span key={type.type.name} className={`type-badge type-${type.type.name}`}>
                        {type.type.name}
                      </span>
                    ))}
                  </div>

                  <div className="team-card-stats">
                    {pokemon.stats.slice(0, 3).map((stat) => (
                      <div key={stat.stat.name} className="team-stat">
                        <span className="team-stat-name">{stat.stat.name.charAt(0).toUpperCase()}</span>
                        <span className="team-stat-value">{stat.base_stat}</span>
                      </div>
                    ))}
                  </div>
                </Link>
              </div>
            ))}

            {/* Empty slots - now clickable to Pokedex */}
            {Array.from({ length: Math.max(0, 6 - enemyTeam.length) }).map((_, index) => (
              <Link key={`empty-${index}`} to="/home" className="empty-slot-link">
                <div className="team-card empty-slot">
                  <div className="empty-slot-content">
                    <div className="empty-slot-plus">+</div>
                    <p>Add Pokémon</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {enemyTeam.length >= 1 && (
            <div className="team-actions">
              <Link to="/battle" className="battle-link enemy-battle-link">
                Battle against this team!
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EnemyTeam
