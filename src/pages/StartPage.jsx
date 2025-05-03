import { useNavigate } from "react-router-dom"
import "./StartPage.css"

const StartPage = () => {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate("/home")
  }

  return (
    <div className="start-page">
      <div className="arcade-frame">
        <div className="crt-overlay" />

        <div className="logo-section">
          <img src="/pokeball.png" alt="PokéBattle Logo" className="logo-icon" />
          <h1 className="game-title">PokéBattle</h1>
        </div>

        <div className="arcade-screen">
          <p className="intro-text">
            Welcome to PokéBattle! Build your team, battle with your favorite Pokémon, and become the ultimate Pokémon
            Master!
          </p>

          <ul className="feature-panel">
            <li className="feature-entry">🔍 Browse the Pokédex</li>
            <li className="feature-entry">👥 Build your dream team</li>
            <li className="feature-entry">⚔️ Battle with different modes</li>
            <li className="feature-entry">📊 Track your battle history</li>
          </ul>

          <button onClick={handleStart} className="start-game-button">
            START ADVENTURE
          </button>
        </div>

        <div className="floating-pokemon">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
            alt="Pikachu"
            className="floating-img pikachu"
          />
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
            alt="Charmander"
            className="floating-img charmander"
          />
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
            alt="Squirtle"
            className="floating-img squirtle"
          />
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
            alt="Bulbasaur"
            className="floating-img bulbasaur"
          />
        </div>
      </div>
    </div>
  )
}

export default StartPage
