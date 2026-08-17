import { useEffect, useState } from 'react';
import { useGameStore, getSpriteUrl, getCost } from './store';
import './App.css';

const PokemonSlot = ({ pos, p, isEnemy, isActive, onDragStart, onDrop }: { pos: number; p: any; isEnemy?: boolean; isActive?: boolean; onDragStart?: (pos: number) => void; onDrop?: (pos: number) => void }) => {
  const starClass = p?.star === 3 ? 'star-gold' : p?.star === 2 ? 'star-silver' : 'star-bronze';
  const targetCopies = p?.star === 1 ? 3 : 6;

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
            {p.star === 3 ? '★ MAX' : `★ ${p.copies}/${targetCopies}`}
          </div>

          <div className="field-type-badges">
            {p.types.map((t: string) => (
              <div key={t} className={`field-type-badge bg-type-${t}`}>{t.substring(0, 3).toUpperCase()}</div>
            ))}
          </div>
          
          {p.isShiny && <div className="shiny-sparkle">✨</div>}
          <img src={getSpriteUrl(p.pokedexId, p.isShiny)} alt={p.name} className="pixel-sprite" draggable="false" />
          <div className="hp-bar-bg"><div className="hp-bar-fill" style={{ width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%` }} /></div>

          <div className="pokemon-tooltip">
            <h4>{p.isShiny ? '✨' : ''} {p.name}</h4>
            <div className="tooltip-types">
              {p.types.map((t: string) => <span key={t} className={`tooltip-type bg-type-${t}`}>{t}</span>)}
            </div>
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
  const { hasSelectedStarter, isGameOver, selectStarter, playerTeam, enemyTeam, shopItems, gold, stage, isBattling, combatText, startBattle, gameTick, buyPokemon, refreshShop, swapSlots, resetGame, sellPokemon, shopFrozen, toggleFreeze, pokedex, highScore } = useGameStore();
  const [draggedPos, setDraggedPos] = useState<number | null>(null);
  const [showPokedex, setShowPokedex] = useState<boolean>(false);

  useEffect(() => {
    if (!isBattling) return;
    const interval = setInterval(gameTick, 1400); 
    return () => clearInterval(interval);
  }, [isBattling, gameTick]);

  const activePlayer = playerTeam.slice().sort((a,b) => a.position - b.position).find(p => p.hp > 0);
  const activeEnemy = enemyTeam.slice().sort((a,b) => a.position - b.position).find(e => e.hp > 0);

  return (
    <div className="game-wrapper">
      
      {/* POKEDEX MODAL */}
      {showPokedex && (
        <div className="modal-overlay" onClick={() => setShowPokedex(false)}>
          <div className="modal-box pokedex-modal" onClick={e => e.stopPropagation()}>
            <div className="pokedex-header">
              <h2>Pokédex</h2>
              <button className="close-btn" onClick={() => setShowPokedex(false)}>X</button>
            </div>
            <div className="pokedex-grid">
              {Array.from({ length: 151 }, (_, i) => i + 1).map(id => {
                const entry = pokedex[id];
                return (
                  <div key={id} className={`pokedex-entry ${entry ? '' : 'unseen'} ${entry?.shiny ? 'shiny-entry' : ''}`}>
                    {entry?.shiny && <div className="shiny-sparkle">✨</div>}
                    <img src={getSpriteUrl(id, entry?.shiny)} alt={`Pokemon ${id}`} draggable="false" />
                    <span>#{id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!hasSelectedStarter && !isGameOver && !showPokedex && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Choose Your Starter</h2>
            <div className="starter-options">
              <div className="starter-card" onClick={() => selectStarter(1)}><img src={getSpriteUrl(1)} alt="Bulbasaur" /><h3 className="bg-type-grass">Bulbasaur</h3></div>
              <div className="starter-card" onClick={() => selectStarter(4)}><img src={getSpriteUrl(4)} alt="Charmander" /><h3 className="bg-type-fire">Charmander</h3></div>
              <div className="starter-card" onClick={() => selectStarter(7)}><img src={getSpriteUrl(7)} alt="Squirtle" /><h3 className="bg-type-water">Squirtle</h3></div>
            </div>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="modal-overlay">
          <div className="modal-box game-over-box">
            <h2>Run Lost!</h2>
            <p>You made it to Stage {stage}.</p>
            <button className="battle-btn" onClick={resetGame}>Restart Expedition</button>
          </div>
        </div>
      )}

      <header className="main-header">
        <div className="title-group">
          <h1>Kanto Expeditions</h1>
          <button className="restart-btn" onClick={resetGame}>Restart</button>
          <button className="pokedex-btn" onClick={() => setShowPokedex(true)}>📖 Pokédex</button>
        </div>
        <div className="header-info">
          <button className="support-btn">☕ Support</button>
        </div>
      </header>

      <main className="battle-area">
        <div className="stadium-art">
          <div className="stadium-line"></div>
          <div className="stadium-circle"><div className="stadium-inner-circle"></div></div>
        </div>

        <div className="battle-area-top">
          <div className="stage-tracker">
            <h3>Stage {stage} / 20 {stage === 20 && "🏆 ELITE FOUR 🏆"}</h3>
            <div className="high-score-text">Furthest Reached: Stage {highScore}</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(stage / 20) * 100}%` }} /></div>
          </div>
        </div>

        {combatText && <div className="combat-text">{combatText}</div>}
        
        <div className="battle-area-middle">
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
        </div>

        <div className="battle-area-bottom">
          <h2 className="field-label player-label">YOUR PARTY</h2>
          <div className="massive-gold-display">Gold: {gold} 🪙</div>
          <h2 className="field-label enemy-label">OPPONENT</h2>
        </div>

        <div className="controls-overlay">
          {!isBattling && playerTeam.some(p => p.hp > 0) && <button onClick={startBattle} className="battle-btn">⚔️ Start Expedition</button>}
        </div>
      </main>

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
              const cost = getCost(base.tier) * base.copies;
              const isOwned = playerTeam.some(p => p.baseId === base.baseId);
              const canAfford = gold >= cost;
              
              return (
                <div 
                  key={`${base.id}-${index}`} 
                  className={`shop-card tier-${base.tier} ${isOwned ? 'shop-card-owned' : ''} ${!canAfford ? 'disabled-card' : 'purchasable'} ${base.isShiny ? 'shop-card-shiny' : ''}`}
                  onClick={() => { if (canAfford) buyPokemon(index); }}
                >
                  <div className="tier-ribbon">Tier {base.tier}</div>
                  <div className="shop-type-badges">
                    {base.types.map((t: string) => <div key={t} className={`type-badge bg-type-${t}`}>{t.toUpperCase()}</div>)}
                  </div>
                  {base.isShiny && <div className="shiny-sparkle" style={{top: -5, left: 40}}>✨</div>}
                  <h3 className="shop-pokemon-name">{base.name}</h3>
                  <div className="card-image-bg"><img src={getSpriteUrl(base.pokedexId, base.isShiny)} alt={base.name} draggable="false" /></div>
                  <div className="card-stats-grid">
                    <span title="Attack">Atk {base.stats.attack}</span><span title="Sp. Atk">Sp.A {base.stats.spAtk}</span>
                    <span title="Defense">Def {base.stats.defense}</span><span title="Sp. Def">Sp.D {base.stats.spDef}</span>
                    <span title="Speed">Spd {base.stats.speed}</span><span title="HP">HP {base.stats.hp}</span>
                  </div>
                  <button className="buy-btn">Buy ({cost} 🪙)</button>
                </div>
              );
            })}
          </div>
          
          <div className="pokemart-actions">
            <button className={`freeze-btn ${shopFrozen ? 'frozen-active' : ''}`} onClick={toggleFreeze}>
              <span style={{ fontSize: '1.5rem', marginBottom: '10px' }}>❄️</span>
              {shopFrozen ? 'Frozen' : 'Freeze'}
            </button>
            <button className="refresh-btn-large" onClick={refreshShop} disabled={gold < 2}>
              <span style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</span>
              Refresh<br/><br/>(2 🪙)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
