import { saveBattleResult } from "./teamService"

// Battle simulation based on comparing stats
export const simulateBattle = (pokemon1, pokemon2, battleResult = null) => {
  if (battleResult) {
    // Format the battle result for saving to history
    const formattedResult = {
      pokemon1: {
        id: pokemon1.id,
        name: pokemon1.name,
        image: pokemon1.sprites.front_default,
        wins: battleResult.winner === pokemon1 ? 1 : 0,
      },
      pokemon2: {
        id: pokemon2.id,
        name: pokemon2.name,
        image: pokemon2.sprites.front_default,
        wins: battleResult.winner === pokemon2 ? 1 : 0,
      },
      winner: battleResult.winner
        ? {
            id: battleResult.winner.id,
            name: battleResult.winner.name,
          }
        : null,
      log: Array.isArray(battleResult.log) ? battleResult.log : [],
      battleLog: Array.isArray(battleResult.log)
        ? battleResult.log.map((entry) => ({
            message: entry.message,
            round: entry.round || 0,
            attacker: entry.attacker || null,
            damage: entry.damage || 0,
            winner: entry.winner || null,
          }))
        : [],
      date: new Date().toISOString(),
      battleType: "damage-based",
      rounds: battleResult.rounds || 0,
      winReason: battleResult.winReason || "unknown",
    }

    // Save battle result to json-server
    saveBattleResult(formattedResult)
    return formattedResult
  }

  // Legacy battle simulation for backward compatibility
  // Get the relevant stats for battle
  const hp1 = pokemon1.stats.find((stat) => stat.stat.name === "hp").base_stat
  const attack1 = pokemon1.stats.find((stat) => stat.stat.name === "attack").base_stat
  const speed1 = pokemon1.stats.find((stat) => stat.stat.name === "speed").base_stat

  const hp2 = pokemon2.stats.find((stat) => stat.stat.name === "hp").base_stat
  const attack2 = pokemon2.stats.find((stat) => stat.stat.name === "attack").base_stat
  const speed2 = pokemon2.stats.find((stat) => stat.stat.name === "speed").base_stat

  // Compare each stat to determine round winners
  const hpWinner = hp1 > hp2 ? pokemon1 : hp2 > hp1 ? pokemon2 : null
  const attackWinner = attack1 > attack2 ? pokemon1 : attack2 > attack1 ? pokemon2 : null
  const speedWinner = speed1 > speed2 ? pokemon1 : speed2 > speed1 ? pokemon2 : null

  // Count wins for each Pokémon
  let pokemon1Wins = 0
  let pokemon2Wins = 0

  if (hpWinner === pokemon1) pokemon1Wins++
  else if (hpWinner === pokemon2) pokemon2Wins++

  if (attackWinner === pokemon1) pokemon1Wins++
  else if (attackWinner === pokemon2) pokemon2Wins++

  if (speedWinner === pokemon1) pokemon1Wins++
  else if (speedWinner === pokemon2) pokemon2Wins++

  // Determine overall winner
  const winner = pokemon1Wins > pokemon2Wins ? pokemon1 : pokemon2Wins > pokemon1Wins ? pokemon2 : null

  // Create battle log
  const battleLog = [
    { stat: "HP", pokemon1: hp1, pokemon2: hp2, winner: hpWinner?.name || "Tie" },
    { stat: "Attack", pokemon1: attack1, pokemon2: attack2, winner: attackWinner?.name || "Tie" },
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
    battleType: "stat-comparison",
  }

  // Save battle result to json-server
  saveBattleResult(result)

  return result
}
