import { create } from 'zustand';

// Defines the core data for a single Pokemon
export type Pokemon = {
  id: string;
  pokedexId: number; // New: Used for sprite URL
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  position: number; // New: 0-5 (Player bench), 6-11 (Enemy bench)
  status: 'idle' | 'attacking' | 'damaged'; // New: Drives CSS animations
};

interface GameState {
  playerTeam: Pokemon[];
  enemyTeam: Pokemon[];
  gold: number;
  isBattling: boolean;
  startBattle: () => void;
  gameTick: () => void; // Combines attackLogic
  buyPokemon: (pokedexId: number, name: string, hp: number, attack: number) => void;
}

// Utility to generate sprite URLs (using publicly available showdown sprites)
const getSpriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

export const useGameStore = create<GameState>((set) => ({
  playerTeam: [
    { id: 'p1', pokedexId: 1, name: 'Bulbasaur', hp: 45, maxHp: 45, attack: 10, position: 1, status: 'idle' },
  ],
  enemyTeam: [
    { id: 'e1', pokedexId: 19, name: 'Rattata', hp: 30, maxHp: 30, attack: 5, position: 7, status: 'idle' },
  ],
  gold: 0,
  isBattling: false,

  startBattle: () => set({ isBattling: true }),

  // The main combat loop that handles animations and damage
  gameTick: () => {
    set((state) => {
      if (!state.isBattling) return state;

      // Reset statuses from previous tick
      const playerTeamReset = state.playerTeam.map(p => ({ ...p, status: 'idle' }));
      const enemyTeamReset = state.enemyTeam.map(e => ({ ...e, status: 'idle' }));

      // Combat logic
      const activePlayer = playerTeamReset.find(p => p.hp > 0);
      const activeEnemy = enemyTeamReset.find(e => e.hp > 0);

      // Trigger animations and apply damage
      if (activePlayer && activeEnemy) {
        // Player attacks enemy
        activePlayer.status = 'attacking';
        activeEnemy.status = 'damaged';
        activeEnemy.hp = Math.max(0, activeEnemy.hp - activePlayer.attack);

        // Enemy attacks player (if still alive)
        if (activeEnemy.hp > 0) {
          activeEnemy.status = 'attacking';
          activePlayer.status = 'damaged';
          activePlayer.hp = Math.max(0, activePlayer.hp - activeEnemy.attack);
        }
      }

      // Check win/loss conditions
      const allPlayerDead = playerTeamReset.every(p => p.hp <= 0);
      const allEnemyDead = enemyTeamReset.every(e => e.hp <= 0);

      if (allEnemyDead) {
        return {
          enemyTeam: [{ id: Date.now().toString(), pokedexId: 16, name: 'Pidgey', hp: 40, maxHp: 40, attack: 8, position: 7, status: 'idle' }],
          playerTeam: playerTeamReset.map(p => ({ ...p, hp: p.maxHp, status: 'idle' })),
          gold: state.gold + 10,
          isBattling: false
        };
      }

      if (allPlayerDead) {
        alert("Run Lost! Refresh to restart.");
        return { isBattling: false, playerTeam: playerTeamReset, enemyTeam: enemyTeamReset };
      }

      return { playerTeam: playerTeamReset, enemyTeam: enemyTeamReset };
    });
  },

  buyPokemon: (pokedexId, name, hp, attack) => set((state) => {
    if (state.gold >= 10 && state.playerTeam.length < 6) {
      // Find the first empty spot on the bench (0-5)
      const occupiedPositions = state.playerTeam.map(p => p.position);
      let newPosition = 0;
      for (let i = 0; i < 6; i++) {
        if (!occupiedPositions.includes(i)) {
          newPosition = i;
          break;
        }
      }

      const newPokemon: Pokemon = {
        id: Date.now().toString(),
        pokedexId,
        name,
        hp,
        maxHp: hp,
        attack,
        position: newPosition,
        status: 'idle'
      };
      return {
        gold: state.gold - 10,
        playerTeam: [...state.playerTeam, newPokemon]
      };
    }
    return state;
  })
}));

// Provide access to sprite URLs outside the store if needed
export { getSpriteUrl };
