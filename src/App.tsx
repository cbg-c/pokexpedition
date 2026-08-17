import { useEffect } from 'react';
import { useGameStore, getSpriteUrl } from './store';
import './App.css';

const PokemonSprite = ({ p, isEnemy }: { p: any; isEnemy?: boolean }) => (
  <div key={p.id} className={`sprite-container ${isEnemy ? 'enemy-sprite' : ''} ${p.status}`} style={{ gridArea: `slot-${p.position}` }}>
    <img src={getSpriteUrl(p.pokedexId)} alt={p.name} className="pixel-sprite" />
    <div className="hp-bar-bg"><div className="hp-bar-fill" style={{ width: `${(p.hp / p.maxHp) * 100}%` }} /></div>
  </div>
);

function App() {
  const { playerTeam, enemyTeam, shopItems, gold, stage, isBattling, startBattle, gameTick, buyPokemon, refreshShop } = useGameStore();

  useEffect(() => {
    if (!isBattling) return;
    const interval = setInterval(gameTick, 1200); 
    return () => clearInterval(interval);
  }, [isBattling, gameTick]);

  return (
    <div className="game-wrapper">
      <header className="main-header">
        <h1>Kanto Expeditions</h1>
        <div className="stats"><p>Gold: {gold} 🪙</p><button className="support-btn">☕ Support</button></div>
      </header>

      <main className="battle-area">
        <div className="stage-indicator">🔴<h3>Stage {stage}</h3></div>
        
        <div className="combat-grid">
          {playerTeam.map(p => <PokemonSprite key={p.id} p={p} />)}
          {enemyTeam.map(e => <PokemonSprite key={e.id} p={e} isEnemy />)}
        </div>

        <div className="field-labels"><h2 className="player-label">PLAYER</h2><h2 className="enemy-label">OPPONENT</h2></div>

        <div className="controls-overlay">
          {!isBattling && playerTeam.some(p => p.hp > 0) && <button onClick={startBattle} className="battle-btn">⚔️ Start</button>}
        </div>
      </main>

      <footer className="pokemart">
        <div className="pokemart-header">
          <h2>POKÉMART <span className="cost-tag">(10 🪙)</span></h2>
          <button className="refresh-btn" onClick={refreshShop} disabled={gold < 2}>🔄 Refresh (2 🪙)</button>
        </div>
        <div className="shop-cards">
          {shopItems.map((poke, i) => (
            <div key={`${poke.pokedexId}-${i}`} className={`shop-card type-${poke.type} tier-${poke.tier}`}>
              <div className="card-image-bg"><img src={getSpriteUrl(poke.pokedexId)} alt={poke.name} /></div>
              <h3>{poke.name}</h3>
              <div className="card-stats-grid">
                <span title="Attack">🗡️ {poke.stats.attack}</span><span title="Sp. Atk">🪄 {poke.stats.spAtk}</span>
                <span title="Defense">🛡️ {poke.stats.defense}</span><span title="Sp. Def">✨ {poke.stats.spDef}</span>
                <span title="Speed">👟 {poke.stats.speed}</span><span title="HP">❤️ {poke.stats.hp}</span>
              </div>
              <button disabled={gold < 10 || playerTeam.length >= 6} onClick={() => buyPokemon(poke)} className="buy-btn">Buy</button>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;
