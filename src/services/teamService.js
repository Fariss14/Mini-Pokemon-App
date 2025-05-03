const API_URL = "http://localhost:3001"

export const getTeam = async () => {
  try {
    const response = await fetch(`${API_URL}/teamData`)
    if (!response.ok) {
      console.error("Failed to fetch team data, status:", response.status)
      // If the endpoint doesn't exist yet, create it
      if (response.status === 404) {
        await saveTeam([])
        return []
      }
      return []
    }
    const data = await response.json()
    return data.pokemon || []
  } catch (error) {
    console.error("Error fetching team:", error)
    // Create the team data structure if it doesn't exist
    try {
      await saveTeam([])
    } catch (err) {
      console.error("Failed to create team data:", err)
    }
    return []
  }
}

export const saveTeam = async (team) => {
  try {
    // Use PUT to update the entire teamData object
    const response = await fetch(`${API_URL}/teamData`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pokemon: team }),
    })

    if (!response.ok) {
      // If the endpoint doesn't exist, create it with POST
      if (response.status === 404) {
        const postResponse = await fetch(`${API_URL}/teamData`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pokemon: team }),
        })

        if (!postResponse.ok) {
          throw new Error("Failed to create team data")
        }
        return await postResponse.json()
      }

      console.error("Failed to save team, server responded with:", response.status)
      throw new Error("Failed to save team")
    }
    return await response.json()
  } catch (error) {
    console.error("Error saving team:", error)
    throw error
  }
}

export const getEnemyTeam = async () => {
  try {
    const response = await fetch(`${API_URL}/enemyTeamData`)
    if (!response.ok) {
      // If the endpoint doesn't exist yet, return an empty array
      if (response.status === 404) {
        // Create the enemy team data structure
        await saveEnemyTeam([])
        return []
      }
      console.error("Failed to fetch enemy team data, status:", response.status)
      return []
    }
    const data = await response.json()
    return data.pokemon || []
  } catch (error) {
    console.error("Error fetching enemy team:", error)
    // Create the enemy team data structure if it doesn't exist
    try {
      await saveEnemyTeam([])
    } catch (err) {
      console.error("Failed to create enemy team data:", err)
    }
    return []
  }
}

export const saveEnemyTeam = async (team) => {
  try {
    // Use PUT to update the entire enemyTeamData object
    const response = await fetch(`${API_URL}/enemyTeamData`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pokemon: team }),
    })

    if (!response.ok) {
      // If the endpoint doesn't exist, create it with POST
      if (response.status === 404) {
        const postResponse = await fetch(`${API_URL}/enemyTeamData`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pokemon: team }),
        })

        if (!postResponse.ok) {
          throw new Error("Failed to create enemy team data")
        }
        return await postResponse.json()
      }

      console.error("Failed to save enemy team, server responded with:", response.status)
      throw new Error("Failed to save enemy team")
    }
    return await response.json()
  } catch (error) {
    console.error("Error saving enemy team:", error)
    throw error
  }
}

export const getBattleHistory = async () => {
  try {
    const response = await fetch(`${API_URL}/battles`)
    if (!response.ok) {
      // If the endpoint doesn't exist yet, create it
      if (response.status === 404) {
        await fetch(`${API_URL}/battles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([]),
        })
        return []
      }
      console.error("Failed to fetch battle history, status:", response.status)
      return []
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching battle history:", error)
    return []
  }
}

export const saveBattleResult = async (battleData) => {
  try {
    const response = await fetch(`${API_URL}/battles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...battleData,
        date: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.error("Failed to save battle result, status:", response.status)
      throw new Error("Failed to save battle result")
    }
    return await response.json()
  } catch (error) {
    console.error("Error saving battle result:", error)
    throw error
  }
}

export const deleteBattle = async (battleId) => {
  try {
    const response = await fetch(`${API_URL}/battles/${battleId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      console.error("Failed to delete battle, status:", response.status)
      throw new Error("Failed to delete battle")
    }
    return true
  } catch (error) {
    console.error("Error deleting battle:", error)
    throw error
  }
}
