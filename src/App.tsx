import { useEffect } from 'react';
import { useGameStore, getSpriteUrl } from './store';
import './App.css';

// A sub-component to render an individual Pokemon sprite on the grid
function PokemonSprite({ pokemon, isEnemy }: { pokemon: any; isEnemy?: boolean }) {
  const spriteUrl = getSpriteUrl(pokemon.pokedexId);
  const healthPercentage = (pokemon.hp / pokemon.maxHp) * 100;

  return (
    <div
      key={pokemon.id}
      className={`sprite-container ${isEnemy ? 'enemy-sprite' : ''} ${pokemon.status}`}
      style={{ gridArea: `slot-${pokemon.position}` }} // Positions the sprite on the grid
    >
      <img src={spriteUrl} alt={pokemon.name} className="pixel-sprite" />
      <div className="hp-bar-bg">
        <div className="hp-bar-fill" style={{ width: `${healthPercentage}%` }} />
      </div>
    </div>
  );
}

function App() {
  const { playerTeam, enemyTeam, gold, isBattling, startBattle, gameTick, buyPokemon } = useGameStore();

  // The visual game loop (triggered every 1 second)
  useEffect(() => {
    let interval: number;
    if (isBattling) {
      // Need a short delay so the visual 'reset' happens before the next attack
      interval = setInterval(() => {
        gameTick();
      }, 1200); 
    }
    return () => clearInterval(interval);
  }, [isBattling, gameTick]);

  return (
    <div className="game-wrapper">
      <header>
        <h1>Kanto Expeditions</h1>
        <div className="stats">
          <p>Gold: {gold} 🪙</p>
          <button className="support-btn" onClick={() => alert('Support the creator at Ko-Fi/Patreon link!')}>
            ☕ Support
          </button>
        </div>
      </header>

      <main className="battle-area">
        {/* The Combat Grid: Defined in CSS (a 3x4 grid) */}
        <div className="combat-grid">
          {/* Player Team Sprites */}
          {playerTeam.map(p => (
            <PokemonSprite key={p.id} pokemon={p} />
          ))}

          {/* Enemy Team Sprites */}
          {enemyTeam.map(e => (
            <PokemonSprite key={e.id} pokemon={e} isEnemy />
          ))}
        </div>

        <div className="controls-overlay">
          {!isBattling && playerTeam.some(p => p.hp > 0) && (
            <button onClick={startBattle} className="battle-btn">⚔️ Start Expedition</button>
          )}
        </div>
      </main>

      <footer className="shop">
        <h2>Shop (10 🪙 each)</h2>
        <div className="shop-buttons">
          <button disabled={gold < 10} onClick={() => buyPokemon(4, 'Charmander', 39, 12)}>Buy Charmander</button>
          <button disabled={gold < 10} onClick={() => buyPokemon(7, 'Squirtle', 44, 9)}>Buy Squirtle</button>
          <button disabled={gold < 10} onClick={() => buyPokemon(25, 'Pikachu', 35, 15)}>Buy Pikachu</button>
        </div>
      </footer>
    </div>
  );
}

export default App;
