import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { usePokemon } from "../context/PokemonContext"
import {
  fetchPokemonDetails,
  getPokemonImage,
  formatPokemonId,
  capitalizeFirstLetter,
} from "../services/pokemonService"
import "./Favorites.css"

const Favorites = () => {
  const { favorites, toggleFavorite } = usePokemon()
  const [favoritePokemon, setFavoritePokemon] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [typeFilter, setTypeFilter] = useState("")
  const [filteredPokemon, setFilteredPokemon] = useState([])

  useEffect(() => {
    const loadFavoritePokemon = async () => {
      if (favorites.length === 0) {
        setFavoritePokemon([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const pokemonPromises = favorites.map((id) => fetchPokemonDetails(id))
        const pokemonData = await Promise.all(pokemonPromises)
        setFavoritePokemon(pokemonData)
      } catch (err) {
        setError("Failed to load favorite Pokémon")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadFavoritePokemon()
  }, [favorites])

  useEffect(() => {
    // Apply type filter only
    let filtered = [...favoritePokemon]

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter((pokemon) => pokemon.types.some((type) => type.type.name === typeFilter))
    }

    setFilteredPokemon(filtered)
  }, [favoritePokemon, typeFilter])

  const handleRemoveFavorite = (pokemonId) => {
    toggleFavorite(pokemonId)
  }

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value)
  }

  return (
    <div className="container">
      <h1 className="page-title">My Favorite Pokémon</h1>

      <div className="filters-container">
        <div className="filters-title">
        </div>
        <div className="filters-content">
          <div className="filter-group">
            <div className="filter-group-title">Filter by Type</div>
            <select value={typeFilter} onChange={handleTypeFilterChange} className="filter-select">
              <option value="">All Types</option>
              <option value="normal">Normal</option>
              <option value="fire">Fire</option>
              <option value="water">Water</option>
              <option value="grass">Grass</option>
              <option value="electric">Electric</option>
              <option value="ice">Ice</option>
              <option value="fighting">Fighting</option>
              <option value="poison">Poison</option>
              <option value="ground">Ground</option>
              <option value="flying">Flying</option>
              <option value="psychic">Psychic</option>
              <option value="bug">Bug</option>
              <option value="rock">Rock</option>
              <option value="ghost">Ghost</option>
              <option value="dragon">Dragon</option>
              <option value="dark">Dark</option>
              <option value="steel">Steel</option>
              <option value="fairy">Fairy</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="pokeball-loading"></div>
          <p>Loading favorite Pokémon...</p>
        </div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
        </div>
      ) : favoritePokemon.length === 0 ? (
        <div className="empty-favorites">
          <p>You don't have any favorite Pokémon yet!</p>
          <p>Browse the Pokédex and click the star icon to add Pokémon to your favorites.</p>
          <Link to="/" className="btn btn-primary">
            Browse Pokédex
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {filteredPokemon.map((pokemon) => (
            <div key={pokemon.id} className="favorite-card">
              <div className="favorite-card-header">
                <span className="favorite-card-id">{formatPokemonId(pokemon.id)}</span>
                <button onClick={() => handleRemoveFavorite(pokemon.id)} className="remove-button">
                  ×
                </button>
              </div>

              <Link to={`/pokemon/${pokemon.id}`} className="favorite-card-content">
                <div className="favorite-card-image-container">
                  <img
                    src={getPokemonImage(pokemon) || "/placeholder.svg"}
                    alt={pokemon.name}
                    className="favorite-card-image pixel-art"
                  />
                </div>

                <h3 className="favorite-card-name">{capitalizeFirstLetter(pokemon.name)}</h3>

                <div className="favorite-card-types">
                  {pokemon.types.map((type) => (
                    <span key={type.type.name} className={`type-badge type-${type.type.name}`}>
                      {type.type.name}
                    </span>
                  ))}
                </div>

                <div className="favorite-card-stats">
                  {pokemon.stats.slice(0, 3).map((stat) => (
                    <div key={stat.stat.name} className="favorite-stat">
                      <span className="favorite-stat-name">{stat.stat.name.charAt(0).toUpperCase()}</span>
                      <span className="favorite-stat-value">{stat.base_stat}</span>
                    </div>
                  ))}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites
