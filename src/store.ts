import { create } from 'zustand';

// --- 1. THE DATA MODELS ---
export type BaseStats = { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number; };

export type Pokemon = {
  id: string;
  pokedexId: number;
  name: string;
  type: string;
  tier: number;
  stats: BaseStats;
  hp: number; // Current HP in battle
  maxHp: number;
  position: number;
  status: 'idle' | 'attacking' | 'damaged';
};

// --- 2. THE KANTO DATABASE (Tiers 1 to 4) ---
export const POKEMON_DB = [
  // Tier 1 (Stages 1+)
  { pokedexId: 1, name: 'Bulbasaur', type: 'grass', tier: 1, stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 } },
  { pokedexId: 4, name: 'Charmander', type: 'fire', tier: 1, stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 } },
  { pokedexId: 7, name: 'Squirtle', type: 'water', tier: 1, stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 } },
  { pokedexId: 16, name: 'Pidgey', type: 'normal', tier: 1, stats: { hp: 40, attack: 45, defense: 40, spAtk: 35, spDef: 35, speed: 56 } },
  // Tier 2 (Stages 4+)
  { pokedexId: 2, name: 'Ivysaur', type: 'grass', tier: 2, stats: { hp: 60, attack: 62, defense: 63, spAtk: 80, spDef: 80, speed: 60 } },
  { pokedexId: 5, name: 'Charmeleon', type: 'fire', tier: 2, stats: { hp: 58, attack: 64, defense: 58, spAtk: 80, spDef: 65, speed: 80 } },
  { pokedexId: 8, name: 'Wartortle', type: 'water', tier: 2, stats: { hp: 59, attack: 63, defense: 80, spAtk: 65, spDef: 80, speed: 58 } },
  { pokedexId: 25, name: 'Pikachu', type: 'electric', tier: 2, stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 } },
  // Tier 3 (Stages 7+)
  { pokedexId: 3, name: 'Venusaur', type: 'grass', tier: 3, stats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 } },
  { pokedexId: 6, name: 'Charizard', type: 'fire', tier: 3, stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 } },
  { pokedexId: 9, name: 'Blastoise', type: 'water', tier: 3, stats: { hp: 79, attack: 83, defense: 100, spAtk: 85, spDef: 105, speed: 78 } },
  { pokedexId: 143, name: 'Snorlax', type: 'normal', tier: 3, stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 } },
  // Tier 4: Legendaries (Stages 10+)
  { pokedexId: 144, name: 'Articuno', type: 'water', tier: 4, stats: { hp: 90, attack: 85, defense: 100, spAtk: 95, spDef: 125, speed: 85 } },
  { pokedexId: 145, name: 'Zapdos', type: 'electric', tier: 4, stats: { hp: 90, attack: 90, defense: 85, spAtk: 125, spDef: 90, speed: 100 } },
  { pokedexId: 146, name: 'Moltres', type: 'fire', tier: 4, stats: { hp: 90, attack: 100, defense: 90, spAtk: 125, spDef: 85, speed: 90 } },
  { pokedexId: 150, name: 'Mewtwo', type: 'psychic', tier: 4, stats: { hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130 } },
];

// --- 3. GENERATORS ---
const getShopPool = (stage: number) => {
  let maxTier = 1;
  if (stage >= 4) maxTier = 2;
  if (stage >= 7) maxTier = 3;
  if (stage >= 10) maxTier = 4;
  return POKEMON_DB.filter(p => p.tier <= maxTier);
};

const generateShop = (stage: number) => {
  const pool = getShopPool(stage);
  // Generate 5 random options
  return Array.from({ length: 5 }).map(() => pool[Math.floor(Math.random() * pool.length)]);
};

const generateEnemyTeam = (stage: number) => {
  const pool = getShopPool(stage);
  const enemyCount = Math.min(3, Math.ceil(stage / 3) || 1); // Up to 3 enemies based on stage
  
  return Array.from({ length: enemyCount }).map((_, i) => {
    const base = pool[Math.floor(Math.random() * pool.length)];
    const hpScale = 1 + (stage * 0.15); // Enemies get 15% more HP per stage
    return {
      id: `e-${Date.now()}-${i}`,
      ...base,
      hp: Math.floor(base.stats.hp * hpScale),
      maxHp: Math.floor(base.stats.hp * hpScale),
      position: 7 + i, // Spawns them in slots 7, 8, and 9
      status: 'idle' as const
    };
  });
};

// --- 4. STATE STORE ---
interface GameState {
  playerTeam: Pokemon[];
  enemyTeam: Pokemon[];
  shopItems: typeof POKEMON_DB;
  gold: number;
  stage: number;
  isBattling: boolean;
  startBattle: () => void;
  gameTick: () => void;
  buyPokemon: (p: typeof POKEMON_DB[0]) => void;
  refreshShop: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerTeam: [{
    id: 'p1', ...POKEMON_DB[0], hp: POKEMON_DB[0].stats.hp, maxHp: POKEMON_DB[0].stats.hp, position: 1, status: 'idle'
  }],
  enemyTeam: generateEnemyTeam(1),
  shopItems: generateShop(1),
  gold: 20,
  stage: 1,
  isBattling: false,

  startBattle: () => set({ isBattling: true }),

  refreshShop: () => set((state) => {
    if (state.gold >= 2) {
      return { gold: state.gold - 2, shopItems: generateShop(state.stage) };
    }
    return state;
  }),

  gameTick: () => {
    set((state) => {
      if (!state.isBattling) return state;

      const pTeam = state.playerTeam.map(p => ({ ...p, status: 'idle' as const }));
      const eTeam = state.enemyTeam.map(e => ({ ...e, status: 'idle' as const }));

      // All ALIVE players attack the first ALIVE enemy
      pTeam.filter(p => p.hp > 0).forEach(p => {
        const target = eTeam.find(e => e.hp > 0);
        if (target) {
          p.status = 'attacking';
          target.status = 'damaged';
          const isSp = p.stats.spAtk > p.stats.attack;
          const offense = isSp ? p.stats.spAtk : p.stats.attack;
          const defense = isSp ? target.stats.spDef : target.stats.defense;
          const dmg = Math.max(1, Math.floor(offense - (defense * 0.4)));
          target.hp = Math.max(0, target.hp - dmg);
        }
      });

      // All ALIVE enemies attack the first ALIVE player
      eTeam.filter(e => e.hp > 0).forEach(e => {
        const target = pTeam.find(p => p.hp > 0);
        if (target) {
          e.status = 'attacking';
          target.status = 'damaged';
          const isSp = e.stats.spAtk > e.stats.attack;
          const offense = isSp ? e.stats.spAtk : e.stats.attack;
          const defense = isSp ? target.stats.spDef : target.stats.defense;
          const dmg = Math.max(1, Math.floor(offense - (defense * 0.4)));
          target.hp = Math.max(0, target.hp - dmg);
        }
      });

      const allPlayerDead = pTeam.every(p => p.hp <= 0);
      const allEnemyDead = eTeam.every(e => e.hp <= 0);

      if (allEnemyDead) {
        const nextStage = state.stage + 1;
        return {
          enemyTeam: generateEnemyTeam(nextStage),
          playerTeam: pTeam.map(p => ({ ...p, hp: p.maxHp, status: 'idle' })),
          shopItems: generateShop(nextStage), // Auto-refresh shop for free on win
          gold: state.gold + 10,
          stage: nextStage,
          isBattling: false
        };
      }

      if (allPlayerDead) {
        alert(`Run Lost on Stage ${state.stage}! Refresh to restart.`);
        return { isBattling: false, playerTeam: pTeam, enemyTeam: eTeam };
      }

      return { playerTeam: pTeam, enemyTeam: eTeam };
    });
  },

  buyPokemon: (basePokemon) => set((state) => {
    if (state.gold >= 10 && state.playerTeam.length < 6) {
      const occupiedPositions = state.playerTeam.map(p => p.position);
      let newPosition = 0;
      for (let i = 0; i < 6; i++) {
        if (!occupiedPositions.includes(i)) { newPosition = i; break; }
      }
      return {
        gold: state.gold - 10,
        playerTeam: [...state.playerTeam, {
          id: Date.now().toString(),
          ...basePokemon,
          hp: basePokemon.stats.hp,
          maxHp: basePokemon.stats.hp,
          position: newPosition,
          status: 'idle'
        }]
      };
    }
    return state;
  })
}));

export const getSpriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
