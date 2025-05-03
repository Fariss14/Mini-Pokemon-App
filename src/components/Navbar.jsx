import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { usePokemon } from "../context/PokemonContext"
import "./Navbar.css"

const Navbar = () => {
  const { team, enemyTeam, favorites } = usePokemon()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-logo" onClick={closeMenu}>
          <img src="/pokeball.png" alt="Pokéball" className="navbar-logo-img" />
          <span>PokéBattle</span>
        </Link>

        <div className="navbar-burger" onClick={toggleMenu}>
          <div className={`burger-line ${menuOpen ? "open" : ""}`}></div>
          <div className={`burger-line ${menuOpen ? "open" : ""}`}></div>
          <div className={`burger-line ${menuOpen ? "open" : ""}`}></div>
        </div>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link
            to="/home"
            className={`navbar-link ${location.pathname === "/home" ? "active" : ""}`}
            onClick={closeMenu}
          >
            Pokédex
          </Link>
          <Link
            to="/team"
            className={`navbar-link ${location.pathname === "/team" ? "active" : ""}`}
            onClick={closeMenu}
          >
            Team
            {team.length > 0 && <span className="team-count">{team.length}</span>}
          </Link>
          <Link
            to="/enemy-team"
            className={`navbar-link ${location.pathname === "/enemy-team" ? "active" : ""}`}
            onClick={closeMenu}
          >
            Enemy
            {enemyTeam.length > 0 && <span className="enemy-count">{enemyTeam.length}</span>}
          </Link>
          <Link
            to="/battle"
            className={`navbar-link ${location.pathname === "/battle" ? "active" : ""}`}
            onClick={closeMenu}
          >
            Battle
          </Link>
          <Link
            to="/history"
            className={`navbar-link ${location.pathname === "/history" ? "active" : ""}`}
            onClick={closeMenu}
          >
            History
          </Link>
          <Link
            to="/favorites"
            className={`navbar-link ${location.pathname === "/favorites" ? "active" : ""}`}
            onClick={closeMenu}
          >
            Favorites
            {favorites.length > 0 && <span className="favorites-count">{favorites.length}</span>}
          </Link>
        </div>
      </div>

      {menuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
    </nav>
  )
}

export default Navbar
