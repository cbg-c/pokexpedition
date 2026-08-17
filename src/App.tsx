import { useEffect } from 'react';
import { useGameStore, getSpriteUrl, SHOP_ROSTER } from './store';
import './App.css';

function PokemonSprite({ pokemon, isEnemy }: { pokemon: any; isEnemy?: boolean }) {
  const spriteUrl = getSpriteUrl(pokemon.pokedexId);
  const healthPercentage = (pokemon.hp / pokemon.maxHp) * 100;

  return (
    <div
      key={pokemon.id}
      className={`sprite-container ${isEnemy ? 'enemy-sprite' : ''} ${pokemon.status}`}
      style={{ gridArea: `slot-${pokemon.position}` }}
    >
      <img src={spriteUrl} alt={pokemon.name} className="pixel-sprite" />
      <div className="hp-bar-bg">
        <div className="hp-bar-fill" style={{ width: `${healthPercentage}%` }} />
      </div>
    </div>
  );
}

function App() {
  const { playerTeam, enemyTeam, gold, stage, isBattling, startBattle, gameTick, buyPokemon } = useGameStore();

  useEffect(() => {
    let interval: number;
    if (isBattling) {
      interval = setInterval(() => {
        gameTick();
      }, 1200); 
    }
    return () => clearInterval(interval);
  }, [isBattling, gameTick]);

  return (
    <div className="game-wrapper">
      <header className="main-header">
        <h1>Kanto Expeditions</h1>
        <div className="stats">
          <p>Gold: {gold} 🪙</p>
          <button className="support-btn" onClick={() => alert('Support the creator!')}>
            ☕ Support
          </button>
        </div>
      </header>

      <main className="battle-area">
        {/* Stage Indicator Top Center */}
        <div className="stage-indicator">
          <div className="pokeball-icon">🔴</div>
          <div>
            <h3>Stage {stage}</h3>
            <div className="stage-bar"><div className="stage-fill" style={{ width: `${(stage % 10) * 10}%` }}></div></div>
          </div>
        </div>

        {/* Combat Grid */}
        <div className="combat-grid">
          {playerTeam.map(p => <PokemonSprite key={p.id} pokemon={p} />)}
          {enemyTeam.map(e => <PokemonSprite key={e.id} pokemon={e} isEnemy />)}
        </div>

        {/* Field Labels */}
        <div className="field-labels">
          <h2 className="player-label">PLAYER'S FIELD</h2>
          <h2 className="enemy-label">OPPONENT'S FIELD</h2>
        </div>

        <div className="controls-overlay">
          {!isBattling && playerTeam.some(p => p.hp > 0) && (
            <button onClick={startBattle} className="battle-btn">⚔️ Start Expedition</button>
          )}
        </div>
      </main>

      <footer className="pokemart">
        <div className="pokemart-header">
          <h2>POKÉMART: KANTO ROSTER <span className="cost-tag">(10 🪙 each)</span></h2>
        </div>
        
        <div className="shop-cards">
          {SHOP_ROSTER.map(poke => (
            <div key={poke.pokedexId} className={`shop-card type-${poke.type}`}>
              <div className="card-image-bg">
                <img src={getSpriteUrl(poke.pokedexId)} alt={poke.name} />
              </div>
              <h3>{poke.name}</h3>
              <div className="card-stats">
                <span>⚔️ {poke.attack}</span>
                <span>❤️ {poke.hp}</span>
              </div>
              <button 
                disabled={gold < 10} 
                onClick={() => buyPokemon(poke.pokedexId, poke.name, poke.hp, poke.attack, poke.type)}
                className="buy-btn"
              >
                $10 BUY
              </button>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;
