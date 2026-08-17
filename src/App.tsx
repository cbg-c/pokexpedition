import { useEffect } from 'react';
import { useGameStore, getSpriteUrl } from './store';
import './App.css';

const PokemonSprite = ({ p, isEnemy }: { p: any; isEnemy?: boolean }) => (
  <div key={p.id} className={`sprite-container ${isEnemy ? 'enemy-sprite' : ''} ${p.status}`} style={{ gridArea: `slot-${p.position}` }}>
    <img src={getSpriteUrl(p.pokedexId)} alt={p.name} className="pixel-sprite" />
    <div className="hp-bar-bg"><div className="hp-bar-fill" style={{ width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%` }} /></div>
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
        <div className="stage-tracker">
          <h3>Stage {stage} / 20 {stage === 20 && "🏆 ELITE FOUR 🏆"}</h3>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${(stage / 20) * 100}%` }} /></div>
        </div>
        
        <div className="combat-grid">
          {playerTeam.map(p => p.hp > 0 && <PokemonSprite key={p.id} p={p} />)}
          {enemyTeam.map(e => e.hp > 0 && <PokemonSprite key={e.id} p={e} isEnemy />)}
        </div>

        <div className="field-labels"><h2 className="player-label">PLAYER</h2><h2 className="enemy-label">OPPONENT</h2></div>

        <div className="controls-overlay">
          {!isBattling && playerTeam.some(p => p.hp > 0) && <button onClick={startBattle} className="battle-btn">⚔️ Start Expedition</button>}
        </div>
      </main>

      <footer className="pokemart">
        <div className="pokemart-header">
          <h2>POKÉMART <span className="cost-tag">(10 🪙)</span></h2>
          <button className="refresh-btn" onClick={refreshShop} disabled={gold < 2}>🔄 Refresh (2 🪙)</button>
        </div>
        <div className="shop-cards">
          {shopItems.map((poke, index) => {
            if (!poke) return <div key={`sold-${index}`} className="shop-card sold-out"><p>SOLD OUT</p></div>;
            return (
              <div key={`${poke.pokedexId}-${index}`} className={`shop-card type-${poke.type} tier-${poke.tier}`}>
                <div className="card-image-bg"><img src={getSpriteUrl(poke.pokedexId)} alt={poke.name} /></div>
                <h3>{poke.name}</h3>
                <div className="card-stats-grid">
                  <span title="Attack">Atk {poke.stats.attack}</span><span title="Sp. Atk">Sp.A {poke.stats.spAtk}</span>
                  <span title="Defense">Def {poke.stats.defense}</span><span title="Sp. Def">Sp.D {poke.stats.spDef}</span>
                  <span title="Speed">Spd {poke.stats.speed}</span><span title="HP">HP {poke.stats.hp}</span>
                </div>
                <button disabled={gold < 10 || playerTeam.length >= 6} onClick={() => buyPokemon(index)} className="buy-btn">Buy</button>
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

export default App;import { useEffect } from 'react';
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
        {/* Dynamic Stage Tracker */}
        <div className="stage-tracker">
          <h3>Stage {stage} / 20 {stage === 20 && "🏆 ELITE FOUR 🏆"}</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(stage / 20) * 100}%` }} />
          </div>
        </div>
        
        <div className="combat-grid">
          {playerTeam.map(p => <PokemonSprite key={p.id} p={p} />)}
          {enemyTeam.map(e => <PokemonSprite key={e.id} p={e} isEnemy />)}
        </div>

        <div className="field-labels"><h2 className="player-label">PLAYER</h2><h2 className="enemy-label">OPPONENT</h2></div>

        {/* Centered Start Button */}
        <div className="controls-overlay">
          {!isBattling && playerTeam.some(p => p.hp > 0) && <button onClick={startBattle} className="battle-btn">⚔️ Start Expedition</button>}
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
              {/* Abbreviated Stat Text Layout */}
              <div className="card-stats-grid">
                <span title="Attack">Atk {poke.stats.attack}</span><span title="Sp. Atk">Sp.A {poke.stats.spAtk}</span>
                <span title="Defense">Def {poke.stats.defense}</span><span title="Sp. Def">Sp.D {poke.stats.spDef}</span>
                <span title="Speed">Spd {poke.stats.speed}</span><span title="HP">HP {poke.stats.hp}</span>
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
