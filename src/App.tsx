import { useEffect } from 'react';
import { useGameStore } from './store';
import './App.css';

function App() {
  const { playerTeam, enemyTeam, gold, isBattling, startBattle, attackTick, buyPokemon } = useGameStore();

  // The Game Loop
  useEffect(() => {
    let interval: number;
    if (isBattling) {
      interval = setInterval(() => {
        attackTick();
      }, 1000); // Attacks happen every 1 second
    }
    return () => clearInterval(interval);
  }, [isBattling, attackTick]);

  return (
    <div className="game-container">
      <header>
        <h1>Kanto Expeditions</h1>
        <p>Gold: {gold} 🪙</p>
        <button className="support-btn" onClick={() => alert('Link to Ko-Fi/Patreon here!')}>
          ☕ Support Creator
        </button>
      </header>

      <main className="battlefield">
        <div className="team player-team">
          <h2>Your Team</h2>
          {playerTeam.map(p => (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              <p>HP: {p.hp}/{p.maxHp}</p>
              <p>ATK: {p.attack}</p>
            </div>
          ))}
        </div>

        <div className="controls">
          {!isBattling ? (
            <button onClick={startBattle} className="battle-btn">⚔️ Start Battle</button>
          ) : (
            <p className="battling-text">Battling...</p>
          )}
        </div>

        <div className="team enemy-team">
          <h2>Enemy</h2>
          {enemyTeam.map(e => (
            <div key={e.id} className="card enemy-card">
              <h3>{e.name}</h3>
              <p>HP: {e.hp}/{e.maxHp}</p>
              <p>ATK: {e.attack}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="shop">
        <h2>Shop (10 🪙 each)</h2>
        <button disabled={gold < 10} onClick={() => buyPokemon('Charmander', 39, 12)}>Buy Charmander</button>
        <button disabled={gold < 10} onClick={() => buyPokemon('Squirtle', 44, 9)}>Buy Squirtle</button>
      </footer>
    </div>
  );
}

export default App;
