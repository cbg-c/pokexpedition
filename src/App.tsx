import { useEffect, useState } from 'react';
import { useGameStore, getSpriteUrl } from './store';
import './App.css';

const PokemonSlot = ({ p, isEnemy, isActive, isSelected, onClick }: { p: any; isEnemy?: boolean; isActive?: boolean; isSelected?: boolean; onClick?: () => void }) => {
  if (!p) return <div className="party-slot empty-slot" />;

  const starClass = p.star === 3 ? 'star-gold' : p.star === 2 ? 'star-silver' : 'star-bronze';
  const targetCopies = p.star === 1 ? 3 : 9;

  return (
    <div className={`party-slot ${isEnemy ? 'enemy-slot' : 'player-slot'} ${isActive ? 'active-fighter' : ''} ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className={`sprite-container ${p.status}`}>
        <div className={`star-rating ${starClass}`}>
          {p.star === 3 ? '⭐ MAX' : `⭐ ${p.copies}/${targetCopies}`}
        </div>
        <img src={getSpriteUrl(p.pokedexId)} alt={p.name} className="pixel-sprite" />
        <div className="hp-bar-bg"><div className="hp-bar-fill" style={{ width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%` }} /></div>
        
        {/* Hover Tooltip Menu */}
        <div className="pokemon-tooltip">
          <h4>{p.name} <span className={`tooltip-type type-${p.type}`}>{p.type}</span></h4>
          <div className="tooltip-stats">
            <span>Atk {p.stats.attack}</span><span>Sp.A {p.stats.spAtk}</span>
            <span>Def {p.stats.defense}</span><span>Sp.D {p.stats.spDef}</span>
            <span>Spd {p.stats.speed}</span><span>HP {p.hp}/{p.maxHp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { playerTeam, enemyTeam, shopItems, gold, stage, isBattling, combatText, startBattle, gameTick, buyPokemon, refreshShop, swapSlots } = useGameStore();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  useEffect(() => {
    if (!isBattling) return;
    const interval = setInterval(gameTick, 1400); 
    return () => clearInterval(interval);
  }, [isBattling, gameTick]);

  const handleSlotClick = (pos: number) => {
    if (isBattling) return;
    if (selectedSlot === null) setSelectedSlot(pos);
    else { swapSlots(selectedSlot, pos); setSelectedSlot(null); }
  };

  const activePlayer = playerTeam.slice().sort((a,b) => a.position - b.position).find(p => p.hp > 0);
  const activeEnemy = enemyTeam.slice().sort((a,b) => a.position - b.position).find(e => e.hp > 0);

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

        {combatText && <div className="combat-text">{combatText}</div>}
        
        <div className="party-lines-container">
          <div className="party-line player-line">
            {[0,1,2,3,4,5].map(pos => {
              const p = playerTeam.find(p => p.position === pos);
              return <PokemonSlot key={`p-${pos}`} p={p} isActive={p?.id === activePlayer?.id} isSelected={selectedSlot === pos} onClick={() => handleSlotClick(pos)} />;
            })}
          </div>
          <div className="party-line enemy-line">
            {[0,1,2,3,4,5].map(pos => {
              const e = enemyTeam.find(e => e.position === pos);
              return <PokemonSlot key={`e-${pos}`} p={e} isEnemy isActive={e?.id === activeEnemy?.id} />;
            })}
          </div>
        </div>

        <div className="field-labels"><h2 className="player-label">YOUR PARTY</h2><h2 className="enemy-label">OPPONENT</h2></div>

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
          {shopItems.map((base, index) => {
            if (!base) return <div key={`sold-${index}`} className="shop-card sold-out"><p>SOLD OUT</p></div>;
            const name = ['Bulbasaur','Charmander','Squirtle','Pidgey','Abra','Gastly','Dratini','Snorlax'].find(n => n.startsWith(base.type.charAt(0).toUpperCase())) || "Pokemon"; 
            return (
              <div key={`${base.id}-${index}`} className={`shop-card type-${base.type} tier-${base.tier}`}>
                <div className="type-badge">{base.type.toUpperCase()}</div>
                <div className="card-image-bg"><img src={getSpriteUrl(base.id)} alt={base.type} /></div>
                <div className="card-stats-grid">
                  <span title="Attack">Atk {base.stats.attack}</span><span title="Sp. Atk">Sp.A {base.stats.spAtk}</span>
                  <span title="Defense">Def {base.stats.defense}</span><span title="Sp. Def">Sp.D {base.stats.spDef}</span>
                  <span title="Speed">Spd {base.stats.speed}</span><span title="HP">HP {base.stats.hp}</span>
                </div>
                <button disabled={gold < 10} onClick={() => buyPokemon(index)} className="buy-btn">Buy</button>
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

export default App;
