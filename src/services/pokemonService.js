const BASE_URL = "https://pokeapi.co/api/v2"

export const fetchPokemonList = async (offset = 0, limit = 20) => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`)
    if (!response.ok) throw new Error("Failed to fetch Pokémon list")
    return await response.json()
  } catch (error) {
    console.error("Error fetching Pokémon list:", error)
    throw error
  }
}

export const fetchPokemonDetails = async (nameOrId) => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`)
    if (!response.ok) throw new Error(`Failed to fetch details for ${nameOrId}`)
    return await response.json()
  } catch (error) {
    console.error(`Error fetching details for ${nameOrId}:`, error)
    throw error
  }
}

export const fetchPokemonSpecies = async (nameOrId) => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon-species/${nameOrId}`)
    if (!response.ok) throw new Error(`Failed to fetch species for ${nameOrId}`)
    return await response.json()
  } catch (error) {
    console.error(`Error fetching species for ${nameOrId}:`, error)
    throw error
  }
}

export const getTypeColor = (type) => {
  const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    electric: "#F8D030",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
  }

  return typeColors[type] || "#777777"
}

export const getPokemonImage = (pokemon) => {
  if (!pokemon) return null

  // Try to get official artwork first
  if (pokemon.sprites?.other?.["official-artwork"]?.front_default) {
    return pokemon.sprites.other["official-artwork"].front_default
  }

  // Fallback to regular sprite
  return pokemon.sprites?.front_default || null
}

export const formatPokemonId = (id) => {
  return `#${String(id).padStart(3, "0")}`
}

export const capitalizeFirstLetter = (string) => {
  if (!string) return ""
  return string.charAt(0).toUpperCase() + string.slice(1)
}
