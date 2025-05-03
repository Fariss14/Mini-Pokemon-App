import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { usePokemon } from "../context/PokemonContext"
import {
  fetchPokemonDetails,
  getPokemonImage,
  formatPokemonId,
  capitalizeFirstLetter,
} from "../services/pokemonService"
import "./PokemonCard.css"

const PokemonCard = ({ pokemon, url }) => {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [visible, setVisible] = useState(true)
  const { addToTeam, addToEnemyTeam, team, enemyTeam, toggleFavorite, isFavorite } = usePokemon()

  useEffect(() => {
    const loadPokemonDetails = async () => {
      try {
        setLoading(true)
        // Extract ID from URL
        const id = url.split("/").filter(Boolean).pop()
        const data = await fetchPokemonDetails(id)
        setDetails(data)
      } catch (err) {
        setError(`Failed to load details for ${pokemon.name}`)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPokemonDetails()
  }, [pokemon, url])

  // Apply type filter
  useEffect(() => {
    if (details) {
      setVisible(true)
    }
  }, [details])

  const handleAddToTeam = async (e) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Stop event bubbling

    if (!details) return

    const result = await addToTeam(details)
    setMessage(result.message)

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const handleAddToEnemyTeam = async (e) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Stop event bubbling

    if (!details) return

    const result = await addToEnemyTeam(details)
    setMessage(result.message)

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Stop event bubbling

    if (!details) return

    const result = toggleFavorite(details.id)
    setMessage(result.message)

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const isInTeam = details && team.some((p) => p.id === details.id)
  const isInEnemyTeam = details && enemyTeam.some((p) => p.id === details.id)
  const isFav = details && isFavorite(details.id)

  if (loading) {
    return (
      <div className="pokemon-card loading">
        <div className="pokeball-loading"></div>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="pokemon-card error">
        <p>{error || `Failed to load ${pokemon.name}`}</p>
      </div>
    )
  }

  if (!visible) {
    return null
  }

  return (
    <div className="pokemon-card-container">
      {message && (
        <div
          className={`card-message ${message.includes("already") || message.includes("full") ? "error-message" : "success-message"}`}
        >
          {message}
        </div>
      )}

      <button
        className={`favorite-button ${isFav ? "active" : ""}`}
        onClick={handleToggleFavorite}
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        {isFav ? "★" : "☆"}
      </button>

      <Link to={`/pokemon/${details.id}`} className="pokemon-card-link">
        <div className="pokemon-card">
          <div className="pokemon-card-image-container">
            <img
              src={getPokemonImage(details) || "/placeholder.png"}
              alt={details.name}
              className="pokemon-card-image pixel-art"
            />
          </div>
          <div className="pokemon-card-info">
            <div className="pokemon-card-id">{formatPokemonId(details.id)}</div>
            <h3 className="pokemon-card-name">{capitalizeFirstLetter(details.name)}</h3>
            <div className="pokemon-card-types">
              {details.types.map((type) => (
                <span key={type.type.name} className={`type-badge type-${type.type.name}`}>
                  {type.type.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>

      <div className="pokemon-card-actions">
        <button
          onClick={handleAddToTeam}
          className={`card-action-btn ${isInTeam ? "in-team" : ""}`}
          disabled={isInTeam || team.length >= 6}
        >
          {isInTeam ? "In Team" : team.length >= 6 ? "Team Full" : "Add to Team"}
        </button>

        <button
          onClick={handleAddToEnemyTeam}
          className={`card-action-btn enemy-btn ${isInEnemyTeam ? "in-team" : ""}`}
          disabled={isInEnemyTeam || enemyTeam.length >= 6}
        >
          {isInEnemyTeam ? "In Enemy Team" : enemyTeam.length >= 6 ? "Team Full" : "Add to Enemy"}
        </button>
      </div>
    </div>
  )
}

export default PokemonCard
