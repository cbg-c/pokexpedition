import { useEffect } from 'react';
import { useGameStore, getSpriteUrl } from './store';
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
  const { playerTeam, enemyTeam, shopItems, gold, stage, isBattling, startBattle, gameTick, buyPokemon, refreshShop } = useGameStore();

  useEffect(() => {
    let interval: number;
    if (isBattling) {
      interval = setInterval(() => { gameTick(); }, 1200); 
    }
    return () => clearInterval(interval);
  }, [isBattling, gameTick]);

  return (
    <div className="game-wrapper">
      <header className="main-header">
        <h1>Kanto Expeditions</h1>
        <div className="stats">
          <p>Gold: {gold} 🪙</p>
          <button className="support-btn" onClick={() => alert('Support the creator!')}>☕ Support</button>
        </div>
      </header>

      <main className="battle-area">
        <div className="stage-indicator">
          <div className="pokeball-icon">🔴</div>
          <div>
            <h3>Stage {stage}</h3>
            <div className="stage-bar"><div className="stage-fill" style={{ width: `${(stage % 10) * 10}%` }}></div></div>
          </div>
        </div>

        <div className="combat-grid">
          {playerTeam.map(p => <PokemonSprite key={p.id} pokemon={p} />)}
          {enemyTeam.map(e => <PokemonSprite key={e.id} pokemon={e} isEnemy />)}
        </div>

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
          <h2>POKÉMART <span className="cost-tag">(10 🪙 each)</span></h2>
          <button className="refresh-btn" onClick={refreshShop} disabled={gold < 2}>
            🔄 Refresh (2 🪙)
          </button>
        </div>
        
        <div className="shop-cards">
          {shopItems.map((poke, index) => (
            <div key={`${poke.pokedexId}-${index}`} className={`shop-card type-${poke.type} tier-${poke.tier}`}>
              <div className="card-image-bg">
                <img src={getSpriteUrl(poke.pokedexId)} alt={poke.name} />
              </div>
              <h3>{poke.name}</h3>
              
              {/* Detailed 6-Stat Grid */}
              <div className="card-stats-grid">
                <span title="Attack">🗡️ {poke.stats.attack}</span>
                <span title="Sp. Attack">🪄 {poke.stats.spAtk}</span>
                <span title="Defense">🛡️ {poke.stats.defense}</span>
                <span title="Sp. Defense">✨ {poke.stats.spDef}</span>
                <span title="Speed">👟 {poke.stats.speed}</span>
                <span title="HP">❤️ {poke.stats.hp}</span>
              </div>

              <button 
                disabled={gold < 10 || playerTeam.length >= 6} 
                onClick={() => buyPokemon(poke)}
                className="buy-btn"
              >
                Buy (10 🪙)
              </button>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;
