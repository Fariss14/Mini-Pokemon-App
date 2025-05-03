import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { PokemonProvider } from "./context/PokemonContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import PokemonDetails from "./pages/PokemonDetails"
import Team from "./pages/Team"
import EnemyTeam from "./pages/EnemyTeam"
import Battle from "./pages/Battle"
import BattleHistory from "./pages/BattleHistory"
import Favorites from "./pages/Favorites"
import StartPage from "./pages/StartPage"
import "./App.css"

function App() {
  return (
    <PokemonProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </Router>
    </PokemonProvider>
  )
}

function MainApp() {
  return (
    <div className="app-container">
      <div className="background-animation">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="floating-pokeball"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${15 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/pokemon/:id" element={<PokemonDetails />} />
          <Route path="/team" element={<Team />} />
          <Route path="/enemy-team" element={<EnemyTeam />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/history" element={<BattleHistory />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
