import { useState, useEffect, useCallback } from "react"
import { simulateBattle } from "../services/battleService"
import { capitalizeFirstLetter, getPokemonImage } from "../services/pokemonService"
import StatBar from "./StatBar"
import "./BattleSimulator.css"

const BattleSimulator = ({ pokemon1, pokemon2 }) => {
  const [battleResult, setBattleResult] = useState(null)
  const [battleStarted, setBattleStarted] = useState(false)
  const [battleEnded, setBattleEnded] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const [pokemon1Health, setPokemon1Health] = useState(100)
  const [pokemon2Health, setPokemon2Health] = useState(100)
  const [battleLog, setBattleLog] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [maxRounds, setMaxRounds] = useState(10)
  const [attackingPokemon, setAttackingPokemon] = useState(null)

  // New state for turn-based battle
  const [currentTurn, setCurrentTurn] = useState(null) // 'player' or 'enemy'
  const [playerSkills, setPlayerSkills] = useState([])
  const [enemySkills, setEnemySkills] = useState([])
  const [playerDefendUses, setPlayerDefendUses] = useState(2)
  const [enemyDefendUses, setEnemyDefendUses] = useState(2)
  const [playerDefending, setPlayerDefending] = useState(false)
  const [enemyDefending, setEnemyDefending] = useState(false)
  const [waitingForAction, setWaitingForAction] = useState(false)
  const [playerEnergy, setPlayerEnergy] = useState(100)
  const [enemyEnergy, setEnemyEnergy] = useState(100)
  const [actionMessage, setActionMessage] = useState("")
  const [enemyActionInProgress, setEnemyActionInProgress] = useState(false)

  // Define addToBattleLog as a useCallback to prevent unnecessary re-renders
  const addToBattleLog = useCallback(
    (message) => {
      setBattleLog((prev) => [...prev, { message, round: currentRound }])
    },
    [currentRound],
  )

  // Define endBattle as a useCallback to prevent unnecessary re-renders
  const endBattle = useCallback(
    (winner, reason) => {
      setBattleEnded(true)
      setWaitingForAction(false)
      setEnemyActionInProgress(false)

      let resultMessage = ""
      if (winner) {
        resultMessage = `${capitalizeFirstLetter(winner.name)} wins by ${reason === "knockout" ? "knockout" : "having more HP"}!`
      } else {
        resultMessage = "The battle ends in a tie!"
      }

      addToBattleLog(resultMessage)

      const result = {
        winner: winner,
        loser: winner ? (winner === pokemon1 ? pokemon2 : pokemon1) : null,
        rounds: currentRound,
        log: [...battleLog, { message: resultMessage, round: currentRound }],
        winReason: reason,
      }

      setBattleResult(result)
      simulateBattle(pokemon1, pokemon2, result)
    },
    [pokemon1, pokemon2, currentRound, battleLog, addToBattleLog],
  )

  // Define calculateDamage as a useCallback to prevent unnecessary re-renders
  const calculateDamage = useCallback((attackPower, defenseValue, multiplier = 1, isDefending = false) => {
    // Base damage calculation
    const baseDamage = Math.max(5, attackPower - defenseValue / 2) * multiplier

    // Random factor (0.8 to 1.2)
    const randomFactor = 0.8 + Math.random() * 0.4

    // Critical hit chance (10%)
    const criticalHit = Math.random() < 0.1 ? 1.5 : 1

    // Calculate raw damage
    let damage = Math.floor(baseDamage * randomFactor * criticalHit)

    // Apply defense reduction if defending
    if (isDefending) {
      damage = Math.floor(damage * 0.5)
    }

    // Convert to percentage (max 30% per hit)
    return Math.min(30, damage)
  }, [])

  // Define executeEnemyTurn as a useCallback to prevent unnecessary re-renders
  const executeEnemyTurn = useCallback(() => {
    if (currentTurn !== "enemy" || battleEnded || enemyActionInProgress) {
      return
    }

    // Set flag to prevent multiple executions
    setEnemyActionInProgress(true)
    setAttackingPokemon(pokemon2)

    // AI decision making
    let actionType = "attack"
    let selectedSkill = null

    // 1. Check if low health - try to heal if possible
    if (pokemon2Health < 30) {
      const healingSkill = enemySkills.find(
        (skill) =>
          skill.healing > 0 &&
          skill.currentCooldown === 0 &&
          skill.remainingUses > 0 &&
          skill.energyCost <= enemyEnergy,
      )

      if (healingSkill) {
        actionType = "skill"
        selectedSkill = healingSkill
      }
    }

    // 2. If player is attacking with high damage, consider defending
    if (actionType === "attack" && enemyDefendUses > 0 && Math.random() < 0.3) {
      actionType = "defend"
    }

    // 3. Try to use a damage skill if available
    if (actionType === "attack") {
      const availableSkills = enemySkills.filter(
        (skill) =>
          skill.damage > 0 && skill.currentCooldown === 0 && skill.remainingUses > 0 && skill.energyCost <= enemyEnergy,
      )

      if (availableSkills.length > 0 && Math.random() < 0.7) {
        actionType = "skill"
        selectedSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)]
      }
    }

    let damage = 0
    let message = ""

    // Calculate base stats for damage
    const attackStat = pokemon2.stats.find((s) => s.stat.name === "attack").base_stat
    const spAttackStat = pokemon2.stats.find((s) => s.stat.name === "special-attack").base_stat
    const attackPower = Math.max(attackStat, spAttackStat)
    const defenseValue = pokemon1.stats.find((s) => s.stat.name === "defense").base_stat

    // Execute the chosen action
    switch (actionType) {
      case "attack":
        // Basic attack
        damage = calculateDamage(attackPower, defenseValue, 1, playerDefending)
        message = `${capitalizeFirstLetter(pokemon2.name)} attacks ${capitalizeFirstLetter(pokemon1.name)} for ${damage}% damage!`

        // Reduce player health
        setPokemon1Health((prevHealth) => Math.max(0, prevHealth - damage))

        // Regenerate some energy
        setEnemyEnergy((prevEnergy) => Math.min(100, prevEnergy + 10))
        break

      case "skill":
        // Skill attack
        if (!selectedSkill) {
          // Fallback to basic attack if no skill was selected
          damage = calculateDamage(attackPower, defenseValue, 1, playerDefending)
          message = `${capitalizeFirstLetter(pokemon2.name)} attacks ${capitalizeFirstLetter(pokemon1.name)} for ${damage}% damage!`

          // Reduce player health
          setPokemon1Health((prevHealth) => Math.max(0, prevHealth - damage))
          break
        }

        // Apply skill effects
        if (selectedSkill.damage > 0) {
          damage = calculateDamage(attackPower, defenseValue, selectedSkill.damage / 10, playerDefending)
          message = `${capitalizeFirstLetter(pokemon2.name)} uses ${selectedSkill.name} on ${capitalizeFirstLetter(pokemon1.name)} for ${damage}% damage!`

          // Reduce player health
          setPokemon1Health((prevHealth) => Math.max(0, prevHealth - damage))
        }

        if (selectedSkill.healing > 0) {
          const healAmount = selectedSkill.healing
          setPokemon2Health((prevHealth) => Math.min(100, prevHealth + healAmount))
          message = `${capitalizeFirstLetter(pokemon2.name)} uses ${selectedSkill.name} and recovers ${healAmount}% HP!`
        }

        if (selectedSkill.effect === "boost_damage") {
          message = `${capitalizeFirstLetter(pokemon2.name)} uses ${selectedSkill.name} and powers up!`
          // We would implement the boost effect here
        }

        // Update skill cooldown and uses
        setEnemySkills((prevSkills) =>
          prevSkills.map((s) =>
            s.name === selectedSkill.name
              ? {
                  ...s,
                  currentCooldown: s.cooldown,
                  remainingUses: s.remainingUses - 1,
                }
              : s,
          ),
        )

        // Consume energy
        setEnemyEnergy((prevEnergy) => prevEnergy - selectedSkill.energyCost)
        break

      case "defend":
        // Defend action
        setEnemyDefending(true)
        setEnemyDefendUses((prevUses) => prevUses - 1)
        message = `${capitalizeFirstLetter(pokemon2.name)} takes a defensive stance!`

        // Regenerate some energy
        setEnemyEnergy((prevEnergy) => Math.min(100, prevEnergy + 15))
        break
    }

    // Add to battle log
    addToBattleLog(message)

    // After a delay, check if battle ended and switch to player turn
    setTimeout(() => {
      // Check if battle ended due to player health reaching 0
      if (pokemon1Health - damage <= 0) {
        endBattle(pokemon2, "knockout")
        return
      }

      // Reset player defending status
      setPlayerDefending(false)
      setAttackingPokemon(null)

      // Increment round counter
      setCurrentRound((prevRound) => prevRound + 1)

      // Check max rounds
      if (currentRound >= maxRounds) {
        // Determine winner based on remaining HP
        if (pokemon1Health > pokemon2Health) {
          endBattle(pokemon1, "rounds")
        } else if (pokemon2Health > pokemon1Health) {
          endBattle(pokemon2, "rounds")
        } else {
          endBattle(null, "tie")
        }
        return
      }

      // Switch to player turn
      setCurrentTurn("player")
      setWaitingForAction(true)
      setEnemyActionInProgress(false)

      // Reduce cooldowns for enemy skills
      setEnemySkills((prevSkills) =>
        prevSkills.map((skill) => ({
          ...skill,
          currentCooldown: Math.max(0, skill.currentCooldown - 1),
        })),
      )
    }, 1500)
  }, [
    currentTurn,
    battleEnded,
    enemyActionInProgress,
    pokemon1,
    pokemon2,
    pokemon1Health,
    pokemon2Health,
    playerDefending,
    enemySkills,
    enemyEnergy,
    enemyDefendUses,
    currentRound,
    maxRounds,
    calculateDamage,
    addToBattleLog,
    endBattle,
  ])

  // Execute enemy turn when it's their turn
  useEffect(() => {
    if (currentTurn === "enemy" && !battleEnded && !enemyActionInProgress) {
      // Add a small delay before executing enemy turn
      const timer = setTimeout(() => {
        executeEnemyTurn()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [currentTurn, battleEnded, enemyActionInProgress, executeEnemyTurn])

  useEffect(() => {
    if (pokemon1 && pokemon2) {
      setPokemon1Health(100)
      setPokemon2Health(100)
      setBattleLog([])
      setBattleStarted(false)
      setBattleEnded(false)
      setBattleResult(null)
      setCurrentRound(0)
      setAttackingPokemon(null)
      setCurrentTurn(null)
      setWaitingForAction(false)
      setPlayerDefending(false)
      setEnemyDefending(false)
      setPlayerDefendUses(2)
      setEnemyDefendUses(2)
      setPlayerEnergy(100)
      setEnemyEnergy(100)
      setActionMessage("")
      setEnemyActionInProgress(false)

      // Generate skills based on Pokémon types and stats
      generateSkills()

      const favoriteBattles = JSON.parse(localStorage.getItem("favoriteBattles") || "[]")
      const isFav = favoriteBattles.some(
        (battle) => battle.pokemon1Id === pokemon1.id && battle.pokemon2Id === pokemon2.id,
      )
      setIsFavorite(isFav)
    }
  }, [pokemon1, pokemon2])

  const generateSkills = () => {
    if (!pokemon1 || !pokemon2) return

    // Generate player skills based on Pokémon type and stats
    const player1Skills = generatePokemonSkills(pokemon1)
    setPlayerSkills(player1Skills)

    // Generate enemy skills based on Pokémon type and stats
    const player2Skills = generatePokemonSkills(pokemon2)
    setEnemySkills(player2Skills)
  }

  const generatePokemonSkills = (pokemon) => {
    const skills = []
    const types = pokemon.types.map((t) => t.type.name)
    const attack = pokemon.stats.find((s) => s.stat.name === "attack").base_stat
    const spAttack = pokemon.stats.find((s) => s.stat.name === "special-attack").base_stat
    const defense = pokemon.stats.find((s) => s.stat.name === "defense").base_stat

    // Type-based skill
    types.forEach((type) => {
      const typeSkill = getTypeSkill(type, attack, spAttack)
      if (typeSkill) {
        skills.push({
          ...typeSkill,
          cooldown: 3,
          currentCooldown: 0,
          remainingUses: 3,
        })
      }
    })

    // Add a healing skill if defense is high
    if (defense > 70) {
      skills.push({
        name: "Recover",
        description: "Recover 20% of max HP",
        energyCost: 30,
        damage: 0,
        healing: 20,
        type: "normal",
        cooldown: 4,
        currentCooldown: 0,
        remainingUses: 2,
      })
    }

    // Add a stat boost skill
    skills.push({
      name: "Focus Energy",
      description: "Increase damage by 30% for 2 turns",
      energyCost: 25,
      damage: 0,
      effect: "boost_damage",
      effectValue: 1.3,
      effectDuration: 2,
      type: "normal",
      cooldown: 5,
      currentCooldown: 0,
      remainingUses: 2,
    })

    return skills
  }

  const getTypeSkill = (type, attack, spAttack) => {
    const isPhysical = attack > spAttack

    const typeSkills = {
      normal: {
        name: "Quick Attack",
        description: "A quick attack that never misses",
        energyCost: 15,
        damage: 15,
        type: "normal",
      },
      fire: {
        name: isPhysical ? "Fire Punch" : "Flamethrower",
        description: isPhysical ? "A fiery punch" : "A stream of intense fire",
        energyCost: 25,
        damage: 25,
        type: "fire",
      },
      water: {
        name: isPhysical ? "Aqua Tail" : "Water Pulse",
        description: isPhysical ? "A lashing tail attack" : "A pulsing blast of water",
        energyCost: 25,
        damage: 25,
        type: "water",
      },
      grass: {
        name: isPhysical ? "Razor Leaf" : "Energy Ball",
        description: isPhysical ? "Sharp leaves are launched" : "An energy sphere attack",
        energyCost: 25,
        damage: 25,
        type: "grass",
      },
      electric: {
        name: isPhysical ? "Thunder Punch" : "Thunderbolt",
        description: isPhysical ? "An electrified punch" : "A strong electric shock",
        energyCost: 25,
        damage: 25,
        type: "electric",
      },
      psychic: {
        name: "Psychic",
        description: "A powerful psychic blast",
        energyCost: 30,
        damage: 30,
        type: "psychic",
      },
      fighting: {
        name: "Close Combat",
        description: "A powerful fighting move with no regard for defense",
        energyCost: 35,
        damage: 35,
        type: "fighting",
      },
      rock: {
        name: "Rock Slide",
        description: "Large boulders are hurled at the opponent",
        energyCost: 30,
        damage: 30,
        type: "rock",
      },
      ground: {
        name: "Earthquake",
        description: "A powerful quake erupts under the enemy",
        energyCost: 35,
        damage: 35,
        type: "ground",
      },
      flying: {
        name: "Aerial Ace",
        description: "A quick flying attack that never misses",
        energyCost: 25,
        damage: 25,
        type: "flying",
      },
      bug: {
        name: "X-Scissor",
        description: "The user slashes at the target by crossing its scythes",
        energyCost: 25,
        damage: 25,
        type: "bug",
      },
      poison: {
        name: "Sludge Bomb",
        description: "Unsanitary sludge is hurled at the target",
        energyCost: 25,
        damage: 25,
        type: "poison",
      },
      dark: {
        name: "Dark Pulse",
        description: "The user releases a horrible aura imbued with dark thoughts",
        energyCost: 25,
        damage: 25,
        type: "dark",
      },
      ghost: {
        name: "Shadow Ball",
        description: "A shadowy blob is hurled at the target",
        energyCost: 25,
        damage: 25,
        type: "ghost",
      },
      steel: {
        name: "Iron Head",
        description: "The user slams the target with its steel-hard head",
        energyCost: 25,
        damage: 25,
        type: "steel",
      },
      ice: {
        name: "Ice Beam",
        description: "The target is struck with an icy-cold beam of energy",
        energyCost: 25,
        damage: 25,
        type: "ice",
      },
      dragon: {
        name: "Dragon Claw",
        description: "The user slashes the target with sharp claws",
        energyCost: 30,
        damage: 30,
        type: "dragon",
      },
      fairy: {
        name: "Moonblast",
        description: "Borrowing the power of the moon, the user attacks the target",
        energyCost: 30,
        damage: 30,
        type: "fairy",
      },
    }

    return typeSkills[type] || null
  }

  const toggleFavorite = () => {
    if (!pokemon1 || !pokemon2) return

    const favoriteBattles = JSON.parse(localStorage.getItem("favoriteBattles") || "[]")

    if (isFavorite) {
      const updatedFavorites = favoriteBattles.filter(
        (battle) => !(battle.pokemon1Id === pokemon1.id && battle.pokemon2Id === pokemon2.id),
      )
      localStorage.setItem("favoriteBattles", JSON.stringify(updatedFavorites))
    } else {
      favoriteBattles.push({
        pokemon1Id: pokemon1.id,
        pokemon1Name: pokemon1.name,
        pokemon2Id: pokemon2.id,
        pokemon2Name: pokemon2.name,
        date: new Date().toISOString(),
      })
      localStorage.setItem("favoriteBattles", JSON.stringify(favoriteBattles))
    }

    setIsFavorite(!isFavorite)
  }

  const startBattle = () => {
    if (!pokemon1 || !pokemon2) return

    setBattleStarted(true)
    setBattleEnded(false)
    setBattleResult(null)
    setCurrentRound(1)
    setPokemon1Health(100)
    setPokemon2Health(100)
    setBattleLog([])
    setPlayerDefending(false)
    setEnemyDefending(false)
    setPlayerDefendUses(2)
    setEnemyDefendUses(2)
    setPlayerEnergy(100)
    setEnemyEnergy(100)
    setActionMessage("")
    setEnemyActionInProgress(false)

    // Reset cooldowns
    setPlayerSkills(
      playerSkills.map((skill) => ({
        ...skill,
        currentCooldown: 0,
        remainingUses: skill.remainingUses,
      })),
    )

    setEnemySkills(
      enemySkills.map((skill) => ({
        ...skill,
        currentCooldown: 0,
        remainingUses: skill.remainingUses,
      })),
    )

    // Determine who goes first based on speed
    const pokemon1Speed = pokemon1.stats.find((stat) => stat.stat.name === "speed").base_stat
    const pokemon2Speed = pokemon2.stats.find((stat) => stat.stat.name === "speed").base_stat

    let firstTurn
    if (pokemon1Speed > pokemon2Speed) {
      firstTurn = "player"
      addToBattleLog(`${capitalizeFirstLetter(pokemon1.name)} is faster and goes first!`)
    } else if (pokemon2Speed > pokemon1Speed) {
      firstTurn = "enemy"
      addToBattleLog(`${capitalizeFirstLetter(pokemon2.name)} is faster and goes first!`)
    } else {
      // If speeds are equal, randomly decide
      firstTurn = Math.random() < 0.5 ? "player" : "enemy"
      addToBattleLog(
        `Both Pokémon have equal speed! ${
          firstTurn === "player" ? capitalizeFirstLetter(pokemon1.name) : capitalizeFirstLetter(pokemon2.name)
        } goes first!`,
      )
    }

    setCurrentTurn(firstTurn)
    setWaitingForAction(firstTurn === "player")
  }

  const executePlayerAction = (actionType, skill = null) => {
    if (!waitingForAction || currentTurn !== "player") return

    setWaitingForAction(false)
    setAttackingPokemon(pokemon1)

    let damage = 0
    let message = ""

    // Calculate base stats for damage
    const attackStat = pokemon1.stats.find((s) => s.stat.name === "attack").base_stat
    const spAttackStat = pokemon1.stats.find((s) => s.stat.name === "special-attack").base_stat
    const attackPower = Math.max(attackStat, spAttackStat)
    const defenseValue = pokemon2.stats.find((s) => s.stat.name === "defense").base_stat

    switch (actionType) {
      case "attack":
        // Basic attack
        damage = calculateDamage(attackPower, defenseValue, 1, enemyDefending)
        message = `${capitalizeFirstLetter(pokemon1.name)} attacks ${capitalizeFirstLetter(pokemon2.name)} for ${damage}% damage!`

        // Reduce enemy health
        setPokemon2Health(Math.max(0, pokemon2Health - damage))

        // Regenerate some energy
        setPlayerEnergy(Math.min(100, playerEnergy + 10))

        break

      case "skill":
        // Skill attack
        if (!skill) return

        // Check if enough energy
        if (playerEnergy < skill.energyCost) {
          setActionMessage("Not enough energy!")
          setWaitingForAction(true)
          return
        }

        // Check cooldown
        if (skill.currentCooldown > 0) {
          setActionMessage(`Skill is on cooldown for ${skill.currentCooldown} more turns!`)
          setWaitingForAction(true)
          return
        }

        // Check remaining uses
        if (skill.remainingUses <= 0) {
          setActionMessage("No uses remaining for this skill!")
          setWaitingForAction(true)
          return
        }

        // Apply skill effects
        if (skill.damage > 0) {
          damage = calculateDamage(attackPower, defenseValue, skill.damage / 10, enemyDefending)
          message = `${capitalizeFirstLetter(pokemon1.name)} uses ${skill.name} on ${capitalizeFirstLetter(
            pokemon2.name,
          )} for ${damage}% damage!`

          // Reduce enemy health
          setPokemon2Health(Math.max(0, pokemon2Health - damage))
        }

        if (skill.healing > 0) {
          const healAmount = skill.healing
          setPokemon1Health(Math.min(100, pokemon1Health + healAmount))
          message = `${capitalizeFirstLetter(pokemon1.name)} uses ${skill.name} and recovers ${healAmount}% HP!`
        }

        if (skill.effect === "boost_damage") {
          message = `${capitalizeFirstLetter(pokemon1.name)} uses ${skill.name} and powers up!`
          // We would implement the boost effect here
        }

        // Update skill cooldown and uses
        setPlayerSkills(
          playerSkills.map((s) =>
            s.name === skill.name
              ? {
                  ...s,
                  currentCooldown: s.cooldown,
                  remainingUses: s.remainingUses - 1,
                }
              : s,
          ),
        )

        // Consume energy
        setPlayerEnergy(playerEnergy - skill.energyCost)

        break

      case "defend":
        // Defend action
        if (playerDefendUses <= 0) {
          setActionMessage("No defend uses remaining!")
          setWaitingForAction(true)
          return
        }

        setPlayerDefending(true)
        setPlayerDefendUses(playerDefendUses - 1)
        message = `${capitalizeFirstLetter(pokemon1.name)} takes a defensive stance!`

        // Regenerate some energy
        setPlayerEnergy(Math.min(100, playerEnergy + 15))

        break
    }

    // Add to battle log
    addToBattleLog(message)

    // Check if battle ended
    if (pokemon2Health - damage <= 0) {
      endBattle(pokemon1, "knockout")
      return
    }

    // Reset enemy defending status
    setEnemyDefending(false)

    // After a delay, switch to enemy turn
    setTimeout(() => {
      setAttackingPokemon(null)
      setCurrentTurn("enemy")

      // Reduce cooldowns for player skills
      setPlayerSkills(
        playerSkills.map((skill) => ({
          ...skill,
          currentCooldown: Math.max(0, skill.currentCooldown - 1),
        })),
      )
    }, 1500)
  }

  const resetBattle = () => {
    setBattleStarted(false)
    setBattleEnded(false)
    setBattleResult(null)
    setCurrentRound(0)
    setPokemon1Health(100)
    setPokemon2Health(100)
    setBattleLog([])
    setAttackingPokemon(null)
    setCurrentTurn(null)
    setWaitingForAction(false)
    setPlayerDefending(false)
    setEnemyDefending(false)
    setPlayerDefendUses(2)
    setEnemyDefendUses(2)
    setPlayerEnergy(100)
    setEnemyEnergy(100)
    setActionMessage("")
    setEnemyActionInProgress(false)
  }

  if (!pokemon1 || !pokemon2) {
    return (
      <div className="battle-simulator-empty">
        <p>Select two Pokémon to battle!</p>
      </div>
    )
  }

  return (
    <div className="battle-simulator">
      <button className={`favorite-button ${isFavorite ? "active" : ""}`} onClick={toggleFavorite}>
        {isFavorite ? "★" : "☆"}
      </button>

      <div className="battle-arena">
        <div className={`pokemon-fighter ${attackingPokemon === pokemon1 ? "attacking" : ""}`}>
          <img src={getPokemonImage(pokemon1) || "/placeholder.svg"} alt={pokemon1.name} className="fighter-image" />
          <div className="fighter-name">{capitalizeFirstLetter(pokemon1.name)}</div>
          <div className="fighter-health-bar">
            <div className="health-bar-bg">
              <div
                className="health-bar-fill"
                style={{
                  width: `${pokemon1Health}%`,
                  backgroundColor: pokemon1Health > 50 ? "#78c850" : pokemon1Health > 20 ? "#f8d030" : "#f08030",
                }}
              ></div>
            </div>
            <div className="health-text">{pokemon1Health}%</div>
          </div>
          {battleStarted && (
            <div className="fighter-energy-bar">
              <div className="energy-bar-bg">
                <div
                  className="energy-bar-fill"
                  style={{
                    width: `${playerEnergy}%`,
                  }}
                ></div>
              </div>
              <div className="energy-text">Energy: {playerEnergy}</div>
            </div>
          )}
          {playerDefending && <div className="defending-badge">DEFENDING</div>}
        </div>

        <div className="battle-vs">VS</div>

        <div className={`pokemon-fighter ${attackingPokemon === pokemon2 ? "attacking" : ""}`}>
          <img src={getPokemonImage(pokemon2) || "/placeholder.svg"} alt={pokemon2.name} className="fighter-image" />
          <div className="fighter-name">{capitalizeFirstLetter(pokemon2.name)}</div>
          <div className="fighter-health-bar">
            <div className="health-bar-bg">
              <div
                className="health-bar-fill"
                style={{
                  width: `${pokemon2Health}%`,
                  backgroundColor: pokemon2Health > 50 ? "#78c850" : pokemon2Health > 20 ? "#f8d030" : "#f08030",
                }}
              ></div>
            </div>
            <div className="health-text">{pokemon2Health}%</div>
          </div>
          {battleStarted && (
            <div className="fighter-energy-bar">
              <div className="energy-bar-bg">
                <div
                  className="energy-bar-fill"
                  style={{
                    width: `${enemyEnergy}%`,
                  }}
                ></div>
              </div>
              <div className="energy-text">Energy: {enemyEnergy}</div>
            </div>
          )}
          {enemyDefending && <div className="defending-badge">DEFENDING</div>}
        </div>
      </div>

      {!battleStarted && (
        <div className="battle-controls">
          <button onClick={startBattle} className="battle-button">
            Start Battle!
          </button>
          <div className="battle-settings">
            <label>
              Max Rounds:
              <select value={maxRounds} onChange={(e) => setMaxRounds(Number(e.target.value))}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {battleStarted && !battleEnded && waitingForAction && (
        <div className="battle-actions">
          <h3 className="turn-indicator">Your Turn</h3>
          {actionMessage && <div className="action-message">{actionMessage}</div>}
          <div className="action-buttons">
            <button className="action-button attack-button" onClick={() => executePlayerAction("attack")}>
              Attack
            </button>
           
          </div>

          <div className="skills-container">
            <h4>Skills</h4>
            <div className="skills-list">
              {playerSkills.map((skill, index) => (
                <button
                  key={index}
                  className={`skill-button ${skill.type}-skill`}
                  onClick={() => executePlayerAction("skill", skill)}
                  disabled={skill.currentCooldown > 0 || skill.remainingUses <= 0 || skill.energyCost > playerEnergy}
                >
                  <div className="skill-name">{skill.name}</div>
                  <div className="skill-details">
                    <span className="skill-cost">Energy: {skill.energyCost}</span>
                    {skill.damage > 0 && <span className="skill-damage">Damage: {skill.damage}</span>}
                    {skill.healing > 0 && <span className="skill-healing">Heal: {skill.healing}%</span>}
                  </div>
                  {skill.currentCooldown > 0 && <div className="skill-cooldown">CD: {skill.currentCooldown}</div>}
                  {skill.remainingUses > 0 && <div className="skill-uses">Uses: {skill.remainingUses}</div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {battleStarted && !battleEnded && !waitingForAction && currentTurn === "enemy" && (
        <div className="enemy-turn-indicator">
          <h3>Enemy's Turn</h3>
          <div className="pokeball-loading"></div>
        </div>
      )}

      {battleStarted && (
        <div className="battle-log-container">
          <h3 className="battle-log-title">Battle Log (Round {currentRound})</h3>
          <div className="battle-log-entries">
            {battleLog.map((entry, index) => (
              <div key={index} className="battle-log-entry">
                {entry.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {battleEnded && battleResult && (
        <div className="battle-result">
          <h2 className="battle-result-title">
            {battleResult.winner ? `${capitalizeFirstLetter(battleResult.winner.name)} Wins!` : "It's a Tie!"}
            {battleResult.winReason === "knockout"
              ? " (Knockout!)"
              : battleResult.winReason === "rounds" && battleResult.winner
                ? " (Higher HP)"
                : ""}
          </h2>

          <div className="battle-stats-comparison">
            <div className="battle-stats-column">
              <h3>{capitalizeFirstLetter(pokemon1.name)}</h3>
              <p>Final HP: {pokemon1Health}%</p>
              {pokemon1.stats.slice(0, 3).map((stat) => (
                <StatBar key={stat.stat.name} statName={stat.stat.name} value={stat.base_stat} />
              ))}
            </div>

            <div className="battle-stats-column">
              <h3>{capitalizeFirstLetter(pokemon2.name)}</h3>
              <p>Final HP: {pokemon2Health}%</p>
              {pokemon2.stats.slice(0, 3).map((stat) => (
                <StatBar key={stat.stat.name} statName={stat.stat.name} value={stat.base_stat} />
              ))}
            </div>
          </div>

          <button onClick={resetBattle} className="battle-button">
            Battle Again
          </button>
        </div>
      )}
    </div>
  )
}

export default BattleSimulator
