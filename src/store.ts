import { create } from 'zustand';

export type BaseStats = { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number; };
export type Pokemon = { id: string; pokedexId: number; name: string; type: string; tier: number; stats: BaseStats; hp: number; maxHp: number; position: number; status: 'idle' | 'attacking' | 'damaged'; };

// Add as many Kanto Pokemon here as you want. The shop generator scales dynamically based on their "tier".
export const POKEMON_DB = [
  // Tier 1 (Weak/Early)
  { pokedexId: 16, name: 'Pidgey', type: 'normal', tier: 1, stats: { hp: 40, attack: 45, defense: 40, spAtk: 35, spDef: 35, speed: 56 } },
  { pokedexId: 1, name: 'Bulbasaur', type: 'grass', tier: 1, stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 } },
  { pokedexId: 4, name: 'Charmander', type: 'fire', tier: 1, stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 } },
  { pokedexId: 7, name: 'Squirtle', type: 'water', tier: 1, stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 } },
  // Tier 2 (Mid-Game)
  { pokedexId: 25, name: 'Pikachu', type: 'electric', tier: 2, stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 } },
  { pokedexId: 64, name: 'Kadabra', type: 'psychic', tier: 2, stats: { hp: 40, attack: 35, defense: 30, spAtk: 120, spDef: 70, speed: 105 } },
  { pokedexId: 93, name: 'Haunter', type: 'ghost', tier: 2, stats: { hp: 45, attack: 50, defense: 45, spAtk: 115, spDef: 55, speed: 95 } },
  // Tier 3 (Strong/Late)
  { pokedexId: 3, name: 'Venusaur', type: 'grass', tier: 3, stats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 } },
  { pokedexId: 6, name: 'Charizard', type: 'fire', tier: 3, stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 } },
  { pokedexId: 9, name: 'Blastoise', type: 'water', tier: 3, stats: { hp: 79, attack: 83, defense: 100, spAtk: 85, spDef: 105, speed: 78 } },
  { pokedexId: 143, name: 'Snorlax', type: 'normal', tier: 3, stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 } },
  // Tier 4 (Legendary/Bosses)
  { pokedexId: 65, name: 'Alakazam', type: 'psychic', tier: 4, stats: { hp: 55, attack: 50, defense: 45, spAtk: 135, spDef: 95, speed: 120 } },
  { pokedexId: 149, name: 'Dragonite', type: 'dragon', tier: 4, stats: { hp: 91, attack: 134, defense: 95, spAtk: 100, spDef: 100, speed: 80 } },
  { pokedexId: 150, name: 'Mewtwo', type: 'psychic', tier: 4, stats: { hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130 } },
];

const MAX_STAGE = 20;

// Dynamic Weighted Rarity: Better stats become more common as stage goes up
const generateShop = (stage: number) => {
  return Array.from({ length: 5 }, () => {
    const pool = POKEMON_DB.filter(p => {
      const chance = Math.random() * 100;
      if (p.tier === 1) return chance < Math.max(10, 100 - (stage * 5)); // Common early, rare late
      if (p.tier === 2) return stage >= 3 && chance < Math.min(80, 20 + (stage * 4)); // Peaks mid
      if (p.tier === 3) return stage >= 8 && chance < Math.min(60, (stage - 7) * 5); // Unlocks late
      if (p.tier === 4) return stage >= 15 && chance < Math.min(30, (stage - 14) * 5); // Legendary
      return false;
    });
    // Fallback to a Tier 1 if pool is empty
    const finalPool = pool.length > 0 ? pool : POKEMON_DB.filter(p => p.tier === 1);
    return finalPool[Math.floor(Math.random() * finalPool.length)];
  });
};

const generateEnemies = (stage: number) => {
  // Stage 20: Elite Four Final Boss
  if (stage === MAX_STAGE) {
    const bosses = ['Dragonite', 'Alakazam', 'Mewtwo', 'Charizard'];
    return bosses.map((name, i) => {
      const base = POKEMON_DB.find(p => p.name === name)!;
      return { ...base, id: `boss-${i}`, hp: base.stats.hp * 3, maxHp: base.stats.hp * 3, position: 6 + i, status: 'idle' as const };
    });
  }
  
  // Normal Stages
  return Array.from({ length: Math.min(4, Math.ceil(stage / 4) || 1) }, (_, i) => {
    const shopOptions = generateShop(stage); // Use shop logic to generate enemy strength
    const base = shopOptions[Math.floor(Math.random() * shopOptions.length)];
    const scaledHp = Math.floor(base.stats.hp * (1 + stage * 0.15));
    return { ...base, id: `e-${Date.now()}-${i}`, hp: scaledHp, maxHp: scaledHp, position: 6 + i, status: 'idle' as const };
  });
};

const executeAttacks = (attackers: Pokemon[], defenders: Pokemon[]) => {
  attackers.filter(a => a.hp > 0).forEach(a => {
    const target = defenders.find(d => d.hp > 0);
    if (!target) return;
    a.status = 'attacking'; target.status = 'damaged';
    const isSp = a.stats.spAtk > a.stats.attack;
    const dmg = Math.max(1, (isSp ? a.stats.spAtk : a.stats.attack) - ((isSp ? target.stats.spDef : target.stats.defense) * 0.4) | 0);
    target.hp = Math.max(0, target.hp - dmg);
  });
};

interface GameState {
  playerTeam: Pokemon[]; enemyTeam: Pokemon[]; shopItems: typeof POKEMON_DB;
  gold: number; stage: number; isBattling: boolean;
  startBattle: () => void; gameTick: () => void; refreshShop: () => void; buyPokemon: (p: typeof POKEMON_DB[0]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  playerTeam: [{ id: 'p1', ...POKEMON_DB[1], hp: POKEMON_DB[1].stats.hp, maxHp: POKEMON_DB[1].stats.hp, position: 1, status: 'idle' }],
  enemyTeam: generateEnemies(1), shopItems: generateShop(1), gold: 20, stage: 1, isBattling: false,

  startBattle: () => set({ isBattling: true }),
  refreshShop: () => set(s => s.gold >= 2 ? { gold: s.gold - 2, shopItems: generateShop(s.stage) } : s),
  
  gameTick: () => set((state) => {
    if (!state.isBattling) return state;
    const [pTeam, eTeam] = [state.playerTeam.map(p => ({ ...p, status: 'idle' as const })), state.enemyTeam.map(e => ({ ...e, status: 'idle' as const }))];

    executeAttacks(pTeam, eTeam); executeAttacks(eTeam, pTeam);

    if (eTeam.every(e => e.hp <= 0)) {
      if (state.stage === MAX_STAGE) {
        alert("CHAMPION DEFEATED! You beat the Kanto Expeditions!");
        return { isBattling: false }; // Game Win State
      }
      return { enemyTeam: generateEnemies(state.stage + 1), playerTeam: pTeam.map(p => ({ ...p, hp: p.maxHp, status: 'idle' })), shopItems: generateShop(state.stage + 1), gold: state.gold + 10, stage: state.stage + 1, isBattling: false };
    }
    
    if (pTeam.every(p => p.hp <= 0)) { alert(`Run Lost to Stage ${state.stage}! Refresh to restart.`); return { isBattling: false, playerTeam: pTeam, enemyTeam: eTeam }; }

    return { playerTeam: pTeam, enemyTeam: eTeam };
  }),

  buyPokemon: (base) => set((s) => {
    if (s.gold < 10 || s.playerTeam.length >= 6) return s;
    const position = [0,1,2,3,4,5].find(i => !s.playerTeam.some(p => p.position === i)) ?? 0;
    return { gold: s.gold - 10, playerTeam: [...s.playerTeam, { ...base, id: Date.now().toString(), hp: base.stats.hp, maxHp: base.stats.hp, position, status: 'idle' }] };
  })
}));

export const getSpriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
