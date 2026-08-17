import { create } from 'zustand';

export type Pokemon = {
  id: string;
  pokedexId: number;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  position: number;
  status: 'idle' | 'attacking' | 'damaged';
  type: string; // Added for styling
};

export const SHOP_ROSTER = [
  { pokedexId: 4, name: 'Charmander', hp: 39, attack: 12, type: 'fire' },
  { pokedexId: 7, name: 'Squirtle', hp: 44, attack: 9, type: 'water' },
  { pokedexId: 25, name: 'Pikachu', hp: 35, attack: 15, type: 'electric' },
  { pokedexId: 43, name: 'Oddish', hp: 45, attack: 10, type: 'grass' },
  { pokedexId: 74, name: 'Geodude', hp: 40, attack: 16, type: 'rock' },
  { pokedexId: 39, name: 'Jigglypuff', hp: 55, attack: 6, type: 'fairy' },
];

interface GameState {
  playerTeam: Pokemon[];
  enemyTeam: Pokemon[];
  gold: number;
  stage: number;
  isBattling: boolean;
  startBattle: () => void;
  gameTick: () => void;
  buyPokemon: (pokedexId: number, name: string, hp: number, attack: number, type: string) => void;
}

const getSpriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

export const useGameStore = create<GameState>((set) => ({
  playerTeam: [
    { id: 'p1', pokedexId: 1, name: 'Bulbasaur', hp: 45, maxHp: 45, attack: 10, position: 1, status: 'idle', type: 'grass' },
  ],
  enemyTeam: [
    { id: 'e1', pokedexId: 16, name: 'Pidgey', hp: 40, maxHp: 40, attack: 8, position: 7, status: 'idle', type: 'normal' },
  ],
  gold: 60,
  stage: 1,
  isBattling: false,

  startBattle: () => set({ isBattling: true }),

  gameTick: () => {
    set((state) => {
      if (!state.isBattling) return state;

      const playerTeamReset = state.playerTeam.map(p => ({ ...p, status: 'idle' as const }));
      const enemyTeamReset = state.enemyTeam.map(e => ({ ...e, status: 'idle' as const }));

      const activePlayer = playerTeamReset.find(p => p.hp > 0);
      const activeEnemy = enemyTeamReset.find(e => e.hp > 0);

      if (activePlayer && activeEnemy) {
        activePlayer.status = 'attacking';
        activeEnemy.status = 'damaged';
        activeEnemy.hp = Math.max(0, activeEnemy.hp - activePlayer.attack);

        if (activeEnemy.hp > 0) {
          activeEnemy.status = 'attacking';
          activePlayer.status = 'damaged';
          activePlayer.hp = Math.max(0, activePlayer.hp - activeEnemy.attack);
        }
      }

      const allPlayerDead = playerTeamReset.every(p => p.hp <= 0);
      const allEnemyDead = enemyTeamReset.every(e => e.hp <= 0);

      if (allEnemyDead) {
        return {
          // Scale enemy slightly by stage
          enemyTeam: [{ id: Date.now().toString(), pokedexId: 19, name: 'Rattata', hp: 40 + (state.stage * 10), maxHp: 40 + (state.stage * 10), attack: 8 + state.stage, position: 7, status: 'idle', type: 'normal' }],
          playerTeam: playerTeamReset.map(p => ({ ...p, hp: p.maxHp, status: 'idle' })),
          gold: state.gold + 10,
          stage: state.stage + 1,
          isBattling: false
        };
      }

      if (allPlayerDead) {
        alert(`Run Lost on Stage ${state.stage}! Refresh to restart.`);
        return { isBattling: false, playerTeam: playerTeamReset, enemyTeam: enemyTeamReset };
      }

      return { playerTeam: playerTeamReset, enemyTeam: enemyTeamReset };
    });
  },

  buyPokemon: (pokedexId, name, hp, attack, type) => set((state) => {
    if (state.gold >= 10 && state.playerTeam.length < 6) {
      const occupiedPositions = state.playerTeam.map(p => p.position);
      let newPosition = 0;
      for (let i = 0; i < 6; i++) {
        if (!occupiedPositions.includes(i)) {
          newPosition = i;
          break;
        }
      }

      return {
        gold: state.gold - 10,
        playerTeam: [...state.playerTeam, {
          id: Date.now().toString(),
          pokedexId, name, hp, maxHp: hp, attack, position: newPosition, status: 'idle', type
        }]
      };
    }
    return state;
  })
}));

export { getSpriteUrl };
