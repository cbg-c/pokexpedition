import { useEffect, useState } from 'react';
import { useGameStore, getSpriteUrl, getCost } from './store';
import './App.css';

const PokemonSlot = ({ pos, p, isEnemy, isActive, onDragStart, onDrop }: { pos: number; p: any; isEnemy?: boolean; isActive?: boolean; onDragStart?: (pos: number) => void; onDrop?: (pos: number) => void }) => {
  const starClass = p?.star === 3 ? 'star-gold' : p?.star === 2 ? 'star-silver' : 'star-bronze';
  const targetCopies = p?.star === 1 ? 3 : 9;

  return (
    <div 
      className={`party-slot ${isEnemy ? 'enemy-slot' : 'player-slot'} ${isActive ? 'active-fighter' : ''} ${!p ? 'empty-slot' : ''}`}
      draggable={!!p && !isEnemy}
      onDragStart={() => p && !isEnemy && onDragStart && onDragStart(pos)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); if (!isEnemy && onDrop) onDrop(pos); }}
    >
      {p && (
        <div className={`sprite-container ${p.status}`}>
          {p.lastDamageTaken != null && p.lastDamageTaken > 0 && <div className="damage-text">-{p.lastDamageTaken}</div>}
          
          <div className={`star-rating ${starClass}`}>
            {p.star === 3 ? '⭐ MAX' : `⭐ ${p.copies}/${targetCopies}`}
          </div>
          
          <img src={getSpriteUrl(p.pokedexId)} alt={p.name} className="pixel-sprite" draggable="false" />
          <div className="hp-bar-bg"><div className="hp-bar-fill" style={{ width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%` }} /></div>

          {/* Automatic Hover Tooltip */}
          <div className="pokemon-tooltip">
            <h4>{p.name} <span className={`tooltip-type bg-type-${p.type}`}>{p.type}</span></h4>
            <div className="tooltip-stats">
              <span>Atk {p.stats.attack}</span><span>Sp.A {p.stats.spAtk}</span>
              <span>Def {p.stats.defense}</span><span>Sp.D {p.stats.spDef}</span>
              <span>Spd {p.stats.speed}</span><span>HP {p.hp}/{p.maxHp}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const { hasSelectedStarter, selectStarter, playerTeam, enemyTeam, shopItems, gold, stage, isBattling, combatText, startBattle, gameTick, buyPokemon, refreshShop, swapSlots, resetGame, sellPokemon } = useGameStore();
  
  // Drag State for rearranging and selling
  const [draggedPos, setDraggedPos] = useState<number | null>(null);

  useEffect(() => {
    if (!isBattling) return;
    const interval = setInterval(gameTick, 1400); 
    return () => clearInterval(interval);
  }, [isBattling, gameTick]);

  const activePlayer = playerTeam.slice().sort((a,b) => a.position - b.position).find(p => p.hp > 0);
  const activeEnemy = enemyTeam.slice().sort((a,b) => a.position - b.position).find(e => e.hp > 0);

  return (
    <div className="game-wrapper">
      {!hasSelectedStarter && (
        <div className="starter-modal-overlay">
          <div className="starter-modal">
            <h2>Choose Your Starter</h2>
            <div className="starter-options">
              <div className="starter-card" onClick={() => selectStarter(1)}><img src={getSpriteUrl(1)} alt="Bulbasaur" /><h3 className="bg-type-grass">Bulbasaur</h3></div>
              <div className="starter-card" onClick={() => selectStarter(4)}><img src={getSpriteUrl(4)} alt="Charmander" /><h3 className="bg-type-fire">Charmander</h3></div>
              <div className="starter-card" onClick={() => selectStarter(7)}><img src={getSpriteUrl(7)} alt="Squirtle" /><h3 className="bg-type-water">Squirtle</h3></div>
            </div>
          </div>
        </div>
      )}

      <header className="main-header">
        <div className="title-group">
          <h1>Kanto Expeditions</h1>
          <button className="restart-btn" onClick={resetGame}>🔄 Restart</button>
        </div>
        <div className="header-gold">Gold: {gold} 🪙</div>
        <div className="stats"><button className="support-btn">☕ Support</button></div>
      </header>

      <main className="battle-area">
        <div className="stage-tracker">
          <h3>Stage {stage} / 20 {stage === 20 && "🏆 ELITE FOUR 🏆"}</h3>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${(stage / 20) * 100}%` }} /></div>
        </div>

        {combatText && <div className="combat-text">{combatText}</div>}
        
        <div className="party-lines-container">
          <div className="party-line player-line">
            {[0,1,2,3,4,5].map(pos => {
              const p = playerTeam.find(p => p.position === pos);
              return <PokemonSlot key={`p-${pos}`} pos={pos} p={p} isActive={p?.id === activePlayer?.id} 
                        onDragStart={(p) => setDraggedPos(p)} onDrop={(targetPos) => { if (draggedPos !== null) swapSlots(draggedPos, targetPos); setDraggedPos(null); }} />;
            })}
          </div>
          <div className="party-line enemy-line">
            {[0,1,2,3,4,5].map(pos => {
              const e = enemyTeam.find(e => e.position === pos);
              return <PokemonSlot key={`e-${pos}`} pos={pos} p={e} isEnemy isActive={e?.id === activeEnemy?.id} />;
            })}
          </div>
        </div>

        {/* Labels Moved Outward */}
        <h2 className="field-label player-label">YOUR PARTY</h2>
        <h2 className="field-label enemy-label">OPPONENT</h2>

        <div className="controls-overlay">
          {!isBattling && playerTeam.some(p => p.hp > 0) && <button onClick={startBattle} className="battle-btn">⚔️ Start Expedition</button>}
        </div>
      </main>

      {/* Pokemart Doubles as the "Sell Zone" when dragging */}
      <footer 
        className={`pokemart ${draggedPos !== null ? 'sell-zone' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (draggedPos !== null) sellPokemon(draggedPos); setDraggedPos(null); }}
      >
        <div className="pokemart-header">
          <h2>POKÉMART</h2>
        </div>
        
        <div className="shop-layout">
          <div className="shop-cards">
            {shopItems.map((base, index) => {
              if (!base) return <div key={`sold-${index}`} className="shop-card sold-out"><p>SOLD OUT</p></div>;
              const cost = getCost(base.tier);
              return (
                <div key={`${base.id}-${index}`} className={`shop-card tier-${base.tier}`}>
                  <div className="tier-ribbon">Tier {base.tier}</div>
                  <div className={`type-badge bg-type-${base.type}`}>{base.type.toUpperCase()}</div>
                  <div className="card-image-bg"><img src={getSpriteUrl(base.baseId)} alt={base.name} /></div>
                  <div className="card-stats-grid">
                    <span title="Attack">Atk {base.stats.attack}</span><span title="Sp. Atk">Sp.A {base.stats.spAtk}</span>
                    <span title="Defense">Def {base.stats.defense}</span><span title="Sp. Def">Sp.D {base.stats.spDef}</span>
                    <span title="Speed">Spd {base.stats.speed}</span><span title="HP">HP {base.stats.hp}</span>
                  </div>
                  <button disabled={gold < cost} onClick={() => buyPokemon(index)} className="buy-btn">Buy ({cost} 🪙)</button>
                </div>
              );
            })}
          </div>
          
          <button className="refresh-btn-large" onClick={refreshShop} disabled={gold < 2}>
            <span style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</span>
            Refresh<br/><br/>(2 🪙)
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
