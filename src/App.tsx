import { useEffect, useState } from 'react';
import { useGameStore, getSpriteUrl, getCost, getSellValue, Pokemon, REGIONS, getMaxCopies } from './store';
import './App.css';

const PokeCoin = () => <div className="pokecoin" title="Pokecoin" />;

const SpriteDisplay = ({ id, isShiny, forceAnimated = false, noHover = false }: { id: number, isShiny: boolean, forceAnimated?: boolean, noHover?: boolean }) => {
  const [hover, setHover] = useState(false);
  const animated = forceAnimated || (!noHover && hover);
  return (
    <img 
      src={getSpriteUrl(id, isShiny, animated)} 
      alt="" 
      className="pixel-sprite" 
      draggable="false"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    />
  );
};

const PokemonSlot = ({ pos, p, isEnemy, isActive, onDragStart, onDrop }: { pos: number; p: any; isEnemy?: boolean; isActive?: boolean; onDragStart?: (p: Pokemon) => void; onDrop?: (pos: number) => void }) => {
  const starClass = p?.star === 3 ? 'star-gold' : p?.star === 2 ? 'star-silver' : 'star-bronze';
  const maxCopies = p ? getMaxCopies(p.baseId) : 3;
  const sellValue = p ? getSellValue(p.tier, p.copies) : 0;

  return (
    <div 
      className={`party-slot ${isEnemy ? 'enemy-slot' : 'player-slot'} ${isActive ? 'active-fighter' : ''} ${!p ? 'empty-slot' : ''}`}
      draggable={!!p && !isEnemy}
      onDragStart={() => p && !isEnemy && onDragStart && onDragStart(p)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); if (!isEnemy && onDrop) onDrop(pos); }}
    >
      {p && (
        <>
          <div className={`star-rating ${starClass}`}>
            ★ {p.star === 3 || p.copies >= maxCopies ? 'Lv. MAX' : `Lv. ${p.copies}/${maxCopies}`}
          </div>
          <div className="field-type-badges">
            {p.types.map((t: string) => (
              <div key={t} className={`field-type-badge bg-type-${t}`}>{t.substring(0, 3).toUpperCase()}</div>
            ))}
          </div>

          <div className={`sprite-container ${p.status}`}>
            {p.lastDamageTaken != null && p.lastDamageTaken > 0 && <div className="damage-text">-{p.lastDamageTaken}</div>}
            {p.isShiny && <div className="shiny-sparkle">SHINY</div>}
            
            <SpriteDisplay id={p.pokedexId} isShiny={p.isShiny} forceAnimated={true} />
            <div className="hp-bar-bg"><div className="hp-bar-fill" style={{ width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%` }} /></div>

            <div className="pokemon-tooltip">
              <h4>{p.name}</h4>
              <div className="tooltip-types">
                {p.types.map((t: string) => <span key={t} className={`tooltip-type bg-type-${t}`}>{t}</span>)}
              </div>
              <div className="tooltip-stats">
                <span>Atk {p.stats.attack}</span><span>Sp.A {p.stats.spAtk}</span>
                <span>Def {p.stats.defense}</span><span>Sp.D {p.stats.spDef}</span>
                <span>Spd {p.stats.speed}</span><span>HP {p.hp}/{p.maxHp}</span>
              </div>
              {!isEnemy && <div className="tooltip-sell">Sell Value: {sellValue} <PokeCoin /></div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function App() {
  const { currentRegion, clearedRegions, setRegion, returnToMenu, hasSelectedStarter, isGameOver, selectStarter, playerTeam, enemyTeam, shopItems, gold, stage, isBattling, isFastForwarding, combatText, startBattle, toggleFastForward, gameTick, buyPokemon, refreshShop, swapSlots, resetGame, sellPokemon, shopFrozen, toggleFreeze, pokedex, highScores } = useGameStore();
  const [draggedPokemon, setDraggedPokemon] = useState<Pokemon | null>(null);
  const [showPokedex, setShowPokedex] = useState<boolean>(false);
  const [dexView, setDexView] = useState<'normal' | 'shiny'>('normal');

  useEffect(() => {
    if (!isBattling) return;
    const interval = setInterval(gameTick, isFastForwarding ? 466 : 1400); 
    return () => clearInterval(interval);
  }, [isBattling, isFastForwarding, gameTick]);

  if (!currentRegion) {
    return (
      <div className="game-wrapper landing-wrapper">
        <div className="landing-box">
          <h1 className="landing-title">Expeditions</h1>
          <div className="region-grid">
            {REGIONS.map((r, i) => {
              const isUnlocked = i === 0 || clearedRegions.includes(REGIONS[i-1]);
              return (
                <div key={r} className={`region-card ${!isUnlocked ? 'locked' : ''}`} onClick={() => isUnlocked && setRegion(r)}>
                  <h2>{r}</h2>
                  <div className="region-best-text">Best: Stage {highScores[r] || 1} / 20</div>
                  {!isUnlocked && <span className="locked-text">(LOCKED)</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const activePlayer = playerTeam.slice().sort((a,b) => a.position - b.position).find(p => p.hp > 0);
  const activeEnemy = enemyTeam.slice().sort((a,b) => a.position - b.position).find(e => e.hp > 0);
  const currentBest = highScores[currentRegion] || 1;

  return (
    <div className={`game-wrapper ${isFastForwarding ? 'fast-forward' : ''}`}>
      
      {showPokedex && (
        <div className="modal-overlay" onClick={() => setShowPokedex(false)}>
          <div className="modal-box pokedex-modal" onClick={e => e.stopPropagation()}>
            <div className="pokedex-header">
              <h2>Pokedex</h2>
              <button className="close-btn" onClick={() => setShowPokedex(false)}>X</button>
            </div>
            <div className="pokedex-tabs">
              <button className={`tab-btn ${dexView === 'normal' ? 'active' : ''}`} onClick={() => setDexView('normal')}>Normal</button>
              <button className={`tab-btn ${dexView === 'shiny' ? 'active' : ''}`} onClick={() => setDexView('shiny')}>Shiny</button>
            </div>
            <div className="pokedex-grid">
              {Array.from({ length: 151 }, (_, i) => i + 1).map(id => {
                const entry = pokedex[id];
                const isVisible = dexView === 'shiny' ? entry?.shiny : entry?.seen;
                
                return (
                  <div key={id} className={`pokedex-entry ${!isVisible ? 'unseen' : ''} ${isVisible && dexView === 'shiny' ? 'shiny-entry' : ''}`}>
                    {isVisible && dexView === 'shiny' && <div className="shiny-sparkle">SHINY</div>}
                    {isVisible ? (
                      <SpriteDisplay id={id} isShiny={dexView === 'shiny'} noHover={true} />
                    ) : (
                      <div className="unseen-placeholder">?</div>
                    )}
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
              <div className="starter-card" onClick={() => selectStarter(1)}><SpriteDisplay id={1} isShiny={false} /><h3 className="bg-type-grass">Bulbasaur</h3></div>
              <div className="starter-card" onClick={() => selectStarter(4)}><SpriteDisplay id={4} isShiny={false} /><h3 className="bg-type-fire">Charmander</h3></div>
              <div className="starter-card" onClick={() => selectStarter(7)}><SpriteDisplay id={7} isShiny={false} /><h3 className="bg-type-water">Squirtle</h3></div>
            </div>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="modal-overlay">
          <div className="modal-box game-over-box">
            <h2>{stage === 20 && enemyTeam.every(e => e.hp <= 0) ? "[ CHAMPION DEFEATED ]" : "[ RUN LOST ]"}</h2>
            <p>You made it to Stage {stage}.</p>
            <div className="game-over-actions">
              <button className="battle-btn" onClick={resetGame}>Restart {currentRegion}</button>
              <button className="battle-btn alt-btn" onClick={returnToMenu}>Main Menu</button>
            </div>
          </div>
        </div>
      )}

      <header className="main-header">
        <div className="title-group">
          <h1>{currentRegion} Expeditions</h1>
          <button className="restart-btn" onClick={resetGame}>RESTART</button>
          <button className="pokedex-btn" onClick={() => setShowPokedex(true)}>POKEDEX</button>
          <button className="pokedex-btn alt-btn" onClick={returnToMenu}>MENU</button>
        </div>
        <div className="header-info">
          <button className="support-btn">Support</button>
        </div>
      </header>

      <main className="battle-area">
        <div className="stadium-art">
          <div className="stadium-line"></div>
          <div className="stadium-circle"><div className="stadium-inner-circle"></div></div>
        </div>

        <div className="battle-area-top">
          <div className="stage-tracker">
            <h3>Stage {stage} / 20 {stage === 20 && "[ ELITE FOUR ]"}</h3>
            <div className="high-score-text">Furthest Reached: Stage {currentBest}</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(stage / 20) * 100}%` }} /></div>
          </div>
        </div>

        {combatText && <div className="combat-text">{combatText}</div>}
        
        <div className="battle-area-middle">
          <div className="party-lines-container">
            <div className="field-labels-top">
              <div className="player-label-group">
                <h2 className="field-label">YOUR PARTY</h2>
                <span className="rearrange-hint">(Drag to rearrange)</span>
              </div>
              <h2 className="field-label">OPPONENT</h2>
            </div>
            
            <div className="party-line player-line">
              {[0,1,2,3,4,5].map(pos => {
                const p = playerTeam.find(p => p.position === pos);
                return <PokemonSlot key={`p-${pos}`} pos={pos} p={p} isActive={p?.id === activePlayer?.id} 
                          onDragStart={(draggedPoke) => setDraggedPokemon(draggedPoke)} onDrop={(targetPos) => { if (draggedPokemon !== null) swapSlots(draggedPokemon.position, targetPos); setDraggedPokemon(null); }} />;
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
          <div className="massive-gold-display">Gold: {gold} <PokeCoin /></div>
        </div>

        <div className="controls-overlay">
          {!isBattling && playerTeam.some(p => p.hp > 0) && <button onClick={startBattle} className="battle-btn">Start Expedition</button>}
          <button onClick={toggleFastForward} className={`battle-btn skip-btn ${isFastForwarding ? 'active' : ''}`}>
            Fast Forward: {isFastForwarding ? 'ON' : 'OFF'}
          </button>
        </div>
      </main>

      <footer 
        className="pokemart"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (draggedPokemon !== null) sellPokemon(draggedPokemon.position); setDraggedPokemon(null); }}
      >
        {draggedPokemon && (
          <div className="sell-zone-overlay">
            Drop to Sell (+{getSellValue(draggedPokemon.tier, draggedPokemon.copies)} <PokeCoin />)
          </div>
        )}

        <div className="pokemart-header">
          <h2>POKEMART</h2>
        </div>
        
        <div className="shop-layout">
          <div className="shop-cards">
            {shopItems.map((base, index) => {
              if (!base) return <div key={`sold-${index}`} className="shop-card sold-out"><p>SOLD OUT</p></div>;
              const cost = getCost(base.tier) * base.copies;
              const isOwned = playerTeam.some(p => p.baseId === base.baseId);
              const canAfford = gold >= cost;
              const isCaught = pokedex[base.pokedexId]?.seen;
              
              return (
                <div 
                  key={`${base.id}-${index}`} 
                  className={`shop-card tier-${base.tier} ${isOwned ? 'shop-card-owned' : ''} ${!canAfford ? 'disabled-card' : 'purchasable'}`}
                  onClick={() => { if (canAfford) buyPokemon(index); }}
                >
                  <div className="shop-card-header">
                    <div className="tier-ribbon">Tier {base.tier}</div>
                    {isCaught && <div className="caught-icon" title="Caught" />}
                    <div className="shop-type-badges">
                      {base.types.map((t: string) => <div key={t} className={`type-badge bg-type-${t}`}>{t.toUpperCase()}</div>)}
                    </div>
                  </div>
                  
                  <div className="card-image-bg">
                    {base.isShiny && <div className="shiny-sparkle-card">SHINY</div>}
                    {isOwned && <div className="upgrade-badge">UPGRADE!</div>}
                    <SpriteDisplay id={base.pokedexId} isShiny={base.isShiny} />
                  </div>

                  <h3 className="shop-pokemon-name">{base.name}</h3>

                  <div className="card-stats-grid">
                    <span title="Attack">Atk {base.stats.attack}</span><span title="Sp. Atk">Sp.A {base.stats.spAtk}</span>
                    <span title="Defense">Def {base.stats.defense}</span><span title="Sp. Def">Sp.D {base.stats.spDef}</span>
                    <span title="Speed">Spd {base.stats.speed}</span><span title="HP">HP {base.stats.hp}</span>
                  </div>
                  <button className="buy-btn">Buy ({cost} <PokeCoin />)</button>
                </div>
              );
            })}
          </div>
          
          <div className="pokemart-actions">
            <button className={`action-btn freeze-btn ${shopFrozen ? 'frozen-active' : ''}`} onClick={toggleFreeze}>
              <div className="custom-icon freeze-icon" />
              <span>FREEZE</span>
            </button>
            <button className="action-btn refresh-btn-large" onClick={refreshShop} disabled={gold < 2}>
              <div className="custom-icon refresh-icon" />
              <span>REFRESH (2 <PokeCoin />)</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
