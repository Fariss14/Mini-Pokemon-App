import { useState, useEffect } from "react"
import { usePokemon } from "../context/PokemonContext"
import PokemonCard from "./PokemonCard"
import "./PokemonList.css"

const PokemonList = () => {
  const {
    pokemonList,
    loading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    searchPokemon,
    clearSearch,
  } = usePokemon()

  const [filteredPokemon, setFilteredPokemon] = useState([])

  // Load Pokemon details for filtering and sorting
  useEffect(() => {
    if (pokemonList.length > 0) {
      setFilteredPokemon(pokemonList)
    }
  }, [pokemonList])

  const handleSearch = (e) => {
    e.preventDefault()
    searchPokemon(searchTerm)
  }

  const handleClearSearch = () => {
    clearSearch()
  }

  return (
    <div className="pokemon-list-container">
      <div className="search-and-filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or ID..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
          {searchTerm && (
            <button type="button" onClick={handleClearSearch} className="clear-button">
              Clear
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="loading">
          <div className="pokeball-loading"></div>
          <p>Loading Pokémon...</p>
        </div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
          <button onClick={handleClearSearch} className="btn btn-primary">
            Back to All Pokémon
          </button>
        </div>
      ) : (
        <>
          <div className="pokemon-grid">
            {filteredPokemon.map((pokemon) => (
              <PokemonCard key={pokemon.name} pokemon={pokemon} url={pokemon.url} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PokemonList
