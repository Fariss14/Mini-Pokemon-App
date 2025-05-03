import { createContext, useState, useEffect, useContext } from "react"
import { fetchPokemonList, fetchPokemonDetails } from "../services/pokemonService"
import { getTeam, saveTeam, getEnemyTeam, saveEnemyTeam } from "../services/teamService"

const PokemonContext = createContext()

export const usePokemon = () => useContext(PokemonContext)

export const PokemonProvider = ({ children }) => {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [team, setTeam] = useState([])
  const [enemyTeam, setEnemyTeam] = useState([])
  const [totalPokemonCount, setTotalPokemonCount] = useState(898) // Set a fixed number for total Pokémon count
  const [favorites, setFavorites] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [activeTypeFilter, setActiveTypeFilter] = useState(null)

  const limit = 15

  useEffect(() => {
    const loadPokemonList = async () => {
      try {
        setLoading(true)
        const offset = (currentPage - 1) * limit
        const data = await fetchPokemonList(offset, limit)
        setPokemonList(data.results)
        setTotalPages(Math.ceil(data.count / limit))
        setTotalPokemonCount(data.count)
      } catch (err) {
        setError("Failed to load Pokémon list")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPokemonList()
  }, [currentPage])

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamData = await getTeam()
        setTeam(teamData)

        const enemyTeamData = await getEnemyTeam()
        setEnemyTeam(enemyTeamData)
      } catch (err) {
        console.error("Failed to load teams:", err)
      }
    }

    loadTeams()

    // Load favorites from localStorage
    const storedFavorites = JSON.parse(localStorage.getItem("favoritePokemon") || "[]")
    setFavorites(storedFavorites)
  }, [])

  const searchPokemon = async (term) => {
    if (!term.trim()) {
      setCurrentPage(1)
      return
    }

    try {
      setLoading(true)
      const pokemon = await fetchPokemonDetails(term.toLowerCase())
      setPokemonList([{ name: pokemon.name, url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/` }])
      setTotalPages(1)
    } catch (err) {
      setError(`No Pokémon found with name or ID: ${term}`)
      setPokemonList([])
    } finally {
      setLoading(false)
    }
  }

  const addToTeam = async (pokemon) => {
    if (team.length >= 6) {
      return { success: false, message: "Team is already full (max 6 Pokémon)" }
    }

    if (team.some((p) => p.id === pokemon.id)) {
      return { success: false, message: "This Pokémon is already in your team" }
    }

    try {
      const newTeam = [...team, pokemon]
      await saveTeam(newTeam)
      setTeam(newTeam)
      return { success: true, message: `${pokemon.name} added to your team!` }
    } catch (err) {
      console.error("Failed to add to team:", err)
      return { success: false, message: "Failed to add to team" }
    }
  }

  const addToEnemyTeam = async (pokemon) => {
    if (enemyTeam.length >= 6) {
      return { success: false, message: "Enemy team is already full (max 6 Pokémon)" }
    }

    if (enemyTeam.some((p) => p.id === pokemon.id)) {
      return { success: false, message: "This Pokémon is already in enemy team" }
    }

    try {
      const newEnemyTeam = [...enemyTeam, pokemon]
      await saveEnemyTeam(newEnemyTeam)
      setEnemyTeam(newEnemyTeam)
      return { success: true, message: `${pokemon.name} added to enemy team!` }
    } catch (err) {
      console.error("Failed to add to enemy team:", err)
      return { success: false, message: "Failed to add to enemy team" }
    }
  }

  const removeFromTeam = async (pokemonId) => {
    try {
      const newTeam = team.filter((p) => p.id !== pokemonId)
      await saveTeam(newTeam)
      setTeam(newTeam)
      return { success: true, message: "Pokémon removed from your team!" }
    } catch (err) {
      console.error("Failed to remove from team:", err)
      return { success: false, message: "Failed to remove from team" }
    }
  }

  const removeFromEnemyTeam = async (pokemonId) => {
    try {
      const newEnemyTeam = enemyTeam.filter((p) => p.id !== pokemonId)
      await saveEnemyTeam(newEnemyTeam)
      setEnemyTeam(newEnemyTeam)
      return { success: true, message: "Pokémon removed from enemy team!" }
    } catch (err) {
      console.error("Failed to remove from enemy team:", err)
      return { success: false, message: "Failed to remove from enemy team" }
    }
  }

  const randomizeTeam = async () => {
    try {
      setLoading(true)
      // Clear current team
      await saveTeam([])
      setTeam([])

      // Get 6 random Pokémon
      const randomTeam = []
      for (let i = 0; i < 6; i++) {
        // Generate a random ID between 1 and 898 (total number of Pokémon in the API)
        const randomId = Math.floor(Math.random() * 898) + 1
        try {
          const pokemon = await fetchPokemonDetails(randomId)
          randomTeam.push(pokemon)
        } catch (error) {
          console.error(`Failed to fetch Pokémon with ID ${randomId}:`, error)
          // Try another random ID if this one fails
          i--
        }
      }

      await saveTeam(randomTeam)
      setTeam(randomTeam)
      setLoading(false)
      return { success: true, message: "Team randomized successfully!" }
    } catch (err) {
      setLoading(false)
      console.error("Failed to randomize team:", err)
      return { success: false, message: "Failed to randomize team" }
    }
  }

  const randomizeEnemyTeam = async () => {
    try {
      setLoading(true)
      // Clear current enemy team
      await saveEnemyTeam([])
      setEnemyTeam([])

      // Get 6 random Pokémon
      const randomTeam = []
      for (let i = 0; i < 6; i++) {
        // Generate a random ID between 1 and 898 (total number of Pokémon in the API)
        const randomId = Math.floor(Math.random() * 898) + 1
        try {
          const pokemon = await fetchPokemonDetails(randomId)
          randomTeam.push(pokemon)
        } catch (error) {
          console.error(`Failed to fetch Pokémon with ID ${randomId}:`, error)
          // Try another random ID if this one fails
          i--
        }
      }

      await saveEnemyTeam(randomTeam)
      setEnemyTeam(randomTeam)
      setLoading(false)
      return { success: true, message: "Enemy team randomized successfully!" }
    } catch (err) {
      setLoading(false)
      console.error("Failed to randomize enemy team:", err)
      return { success: false, message: "Failed to randomize enemy team" }
    }
  }

  const toggleFavorite = (pokemonId) => {
    const isFavorite = favorites.includes(pokemonId)
    let updatedFavorites

    if (isFavorite) {
      updatedFavorites = favorites.filter((id) => id !== pokemonId)
    } else {
      updatedFavorites = [...favorites, pokemonId]
    }

    setFavorites(updatedFavorites)
    localStorage.setItem("favoritePokemon", JSON.stringify(updatedFavorites))

    return { success: true, message: isFavorite ? "Removed from favorites" : "Added to favorites" }
  }

  const isFavorite = (pokemonId) => {
    return favorites.includes(pokemonId)
  }

  const toggleShowFavoritesOnly = () => {
    setShowFavoritesOnly(!showFavoritesOnly)
  }

  const setTypeFilter = (type) => {
    setActiveTypeFilter(type === activeTypeFilter ? null : type)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setCurrentPage(1)
    setError(null)

    // Reload the Pokemon list when search is cleared
    const loadPokemonList = async () => {
      try {
        setLoading(true)
        const offset = 0
        const data = await fetchPokemonList(offset, limit)
        setPokemonList(data.results)
        setTotalPages(Math.ceil(data.count / limit))
      } catch (err) {
        setError("Failed to load Pokémon list")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPokemonList()
  }

  const value = {
    pokemonList,
    loading,
    error,
    currentPage,
    totalPages,
    searchTerm,
    team,
    enemyTeam,
    favorites,
    showFavoritesOnly,
    activeTypeFilter,
    setCurrentPage,
    setSearchTerm,
    searchPokemon,
    clearSearch,
    addToTeam,
    addToEnemyTeam,
    removeFromTeam,
    removeFromEnemyTeam,
    randomizeTeam,
    randomizeEnemyTeam,
    toggleFavorite,
    isFavorite,
    toggleShowFavoritesOnly,
    setTypeFilter,
  }

  return <PokemonContext.Provider value={value}>{children}</PokemonContext.Provider>
}
