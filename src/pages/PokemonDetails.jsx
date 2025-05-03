import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePokemon } from "../context/PokemonContext"
import {
  fetchPokemonDetails,
  fetchPokemonSpecies,
  getPokemonImage,
  formatPokemonId,
  capitalizeFirstLetter,
} from "../services/pokemonService"
import StatBar from "../components/StatBar"
import "./PokemonDetails.css"

const PokemonDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToTeam, team } = usePokemon()
  const [pokemon, setPokemon] = useState(null)
  const [species, setSpecies] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const isInTeam = pokemon && team.some((p) => p.id === pokemon.id)

  useEffect(() => {
    const loadPokemonDetails = async () => {
      try {
        setLoading(true)
        const pokemonData = await fetchPokemonDetails(id)
        setPokemon(pokemonData)

        // Fetch species data for additional info
        const speciesData = await fetchPokemonSpecies(id)
        setSpecies(speciesData)
      } catch (err) {
        setError(`Failed to load Pokémon details`)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPokemonDetails()
  }, [id])

  const handleAddToTeam = async () => {
    if (!pokemon) return

    const result = await addToTeam(pokemon)
    setMessage(result.message)

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="pokeball-loading"></div>
          <p>Loading Pokémon details...</p>
        </div>
      </div>
    )
  }

  if (error || !pokemon) {
    return (
      <div className="container">
        <div className="error">
          <p>{error || "Failed to load Pokémon details"}</p>
          <button onClick={handleGoBack} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Get English flavor text
  const flavorText = species?.flavor_text_entries
    ?.find((entry) => entry.language.name === "en")
    ?.flavor_text.replace(/\f/g, " ")

  return (
    <div className="container">
      <button onClick={handleGoBack} className="back-button">
        ← Back
      </button>

      {message && (
        <div
          className={`message ${message.includes("already") || message.includes("full") ? "error-message" : "success-message"}`}
        >
          {message}
        </div>
      )}

      <div className="pokemon-details-card">
        <div className="pokemon-details-header">
          <div className="pokemon-details-id-name">
            <span className="pokemon-details-id">{formatPokemonId(pokemon.id)}</span>
            <h1 className="pokemon-details-name">{capitalizeFirstLetter(pokemon.name)}</h1>
          </div>

          {!isInTeam ? (
            <button onClick={handleAddToTeam} className="add-to-team-button" disabled={team.length >= 6}>
              {team.length >= 6 ? "Team Full" : "Add to Team"}
            </button>
          ) : (
            <span className="in-team-badge">In Team</span>
          )}
        </div>

        <div className="pokemon-details-content">
          <div className="pokemon-details-image-container">
            <img
              src={getPokemonImage(pokemon) || "/placeholder.svg"}
              alt={pokemon.name}
              className="pokemon-details-image pixel-art"
            />

            <div className="pokemon-details-types">
              {pokemon.types.map((type) => (
                <span key={type.type.name} className={`type-badge type-${type.type.name}`}>
                  {type.type.name}
                </span>
              ))}
            </div>

            <div className="pokemon-details-physical">
              <div className="physical-stat">
                <span className="physical-label">Height</span>
                <span className="physical-value">{pokemon.height / 10} m</span>
              </div>
              <div className="physical-stat">
                <span className="physical-label">Weight</span>
                <span className="physical-value">{pokemon.weight / 10} kg</span>
              </div>
            </div>
          </div>

          <div className="pokemon-details-info">
            {flavorText && <div className="pokemon-flavor-text">{flavorText}</div>}

            <div className="pokemon-details-section">
              <h3 className="section-title">Abilities</h3>
              <div className="abilities-list">
                {pokemon.abilities.map((ability) => (
                  <div key={ability.ability.name} className="ability-item">
                    <span className="ability-name">
                      {capitalizeFirstLetter(ability.ability.name.replace("-", " "))}
                    </span>
                    {ability.is_hidden && <span className="hidden-ability">(Hidden)</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="pokemon-details-section">
              <h3 className="section-title">Base Stats</h3>
              <div className="stats-list">
                {pokemon.stats.map((stat) => (
                  <StatBar key={stat.stat.name} statName={stat.stat.name} value={stat.base_stat} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PokemonDetails
