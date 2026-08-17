import { create } from 'zustand';

export type Pokemon = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
};

interface GameState {
  playerTeam: Pokemon[];
  enemyTeam: Pokemon[];
  gold: number;
  isBattling: boolean;
  startBattle: () => void;
  attackTick: () => void;
  buyPokemon: (name: string, hp: number, attack: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerTeam: [{ id: 'p1', name: 'Bulbasaur', hp: 45, maxHp: 45, attack: 10 }],
  enemyTeam: [{ id: 'e1', name: 'Rattata', hp: 30, maxHp: 30, attack: 5 }],
  gold: 0,
  isBattling: false,

  startBattle: () => set({ isBattling: true }),

  attackTick: () => {
    set((state) => {
      if (!state.isBattling) return state;

      const newEnemies = [...state.enemyTeam];
      const newPlayer = [...state.playerTeam];

      // Simple Auto-Attack Logic: First alive player hits first alive enemy
      const activePlayer = newPlayer.find(p => p.hp > 0);
      const activeEnemy = newEnemies.find(e => e.hp > 0);

      if (activePlayer && activeEnemy) {
        activeEnemy.hp -= activePlayer.attack;
        if (activeEnemy.hp > 0) {
          activePlayer.hp -= activeEnemy.attack;
        }
      }

      // Check win/loss
      const playerDead = newPlayer.every(p => p.hp <= 0);
      const enemyDead = newEnemies.every(e => e.hp <= 0);

      if (enemyDead) {
        return { 
          enemyTeam: [{ id: Date.now().toString(), name: 'Pidgey', hp: 40, maxHp: 40, attack: 8 }], // Spawn next enemy
          playerTeam: newPlayer.map(p => ({ ...p, hp: p.maxHp })), // Heal player
          gold: state.gold + 10,
          isBattling: false 
        };
      }
      
      if (playerDead) {
        alert("Game Over! Refresh to restart.");
        return { isBattling: false };
      }

      return { playerTeam: newPlayer, enemyTeam: newEnemies };
    });
  },

  buyPokemon: (name, hp, attack) => set((state) => {
    if (state.gold >= 10 && state.playerTeam.length < 3) {
      return {
        gold: state.gold - 10,
        playerTeam: [...state.playerTeam, { id: Date.now().toString(), name, hp, maxHp: hp, attack }]
      };
    }
    return state;
  })
}));
