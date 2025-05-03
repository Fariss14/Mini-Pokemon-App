import PokemonList from "../components/PokemonList"

const Home = () => {
  return (
    <div className="container">
      <h1 className="page-title">Pokédex</h1>
      <p className="page-description">Browse through the Pokémon, view their details, and add them to your team!</p>
      <PokemonList />
    </div>
  )
}

export default Home
