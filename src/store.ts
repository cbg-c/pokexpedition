import { create } from 'zustand';

export type BaseStats = { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number; };
export type Pokemon = { id: string; pokedexId: number; name: string; type: string; tier: number; stats: BaseStats; hp: number; maxHp: number; position: number; status: 'idle' | 'attacking' | 'damaged'; };

export const POKEMON_DB = [
  { pokedexId: 16, name: 'Pidgey', type: 'normal', tier: 1, stats: { hp: 40, attack: 45, defense: 40, spAtk: 35, spDef: 35, speed: 56 } },
  { pokedexId: 1, name: 'Bulbasaur', type: 'grass', tier: 1, stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 } },
  { pokedexId: 4, name: 'Charmander', type: 'fire', tier: 1, stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 } },
  { pokedexId: 7, name: 'Squirtle', type: 'water', tier: 1, stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 } },
  { pokedexId: 25, name: 'Pikachu', type: 'electric', tier: 2, stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 } },
  { pokedexId: 64, name: 'Kadabra', type: 'psychic', tier: 2, stats: { hp: 40, attack: 35, defense: 30, spAtk: 120, spDef: 70, speed: 105 } },
  { pokedexId: 93, name: 'Haunter', type: 'ghost', tier: 2, stats: { hp: 45, attack: 50, defense: 45, spAtk: 115, spDef: 55, speed: 95 } },
  { pokedexId: 3, name: 'Venusaur', type: 'grass', tier: 3, stats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 } },
  { pokedexId: 6, name: 'Charizard', type: 'fire', tier: 3, stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 } },
  { pokedexId: 9, name: 'Blastoise', type: 'water', tier: 3, stats: { hp: 79, attack: 83, defense: 100, spAtk: 85, spDef: 105, speed: 78 } },
  { pokedexId: 143, name: 'Snorlax', type: 'normal', tier: 3, stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 } },
  { pokedexId: 65, name: 'Alakazam', type: 'psychic', tier: 4, stats: { hp: 55, attack: 50, defense: 45, spAtk: 135, spDef: 95, speed: 120 } },
  { pokedexId: 149, name: 'Dragonite', type: 'dragon', tier: 4, stats: { hp: 91, attack: 134, defense: 95, spAtk: 100, spDef: 100, speed: 80 } },
  { pokedexId: 150, name: 'Mewtwo', type: 'psychic', tier: 4, stats: { hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130 } },
];

const MAX_STAGE = 20;

const generateShop = (stage: number) => Array.from({ length: 5 }, () => {
  const pool = POKEMON_DB.filter(p => {
    const chance = Math.random() * 100;
    if (p.tier === 1) return chance < Math.max(10, 100 - (stage * 5));
    if (p.tier === 2) return stage >= 3 && chance < Math.min(80, 20 + (stage * 4));
    if (p.tier === 3) return stage >= 8 && chance < Math.min(60, (stage - 7) * 5);
    if (p.tier === 4) return stage >= 15 && chance < Math.min(30, (stage - 14) * 5);
    return false;
  });
  const finalPool = pool.length > 0 ? pool : POKEMON_DB.filter(p => p.tier === 1);
  return finalPool[Math.floor(Math.random() * finalPool.length)];
});

const generateEnemies = (stage: number) => {
  if (stage === MAX_STAGE) return ['Dragonite', 'Alakazam', 'Mewtwo', 'Charizard'].map((n, i) => {
    const base = POKEMON_DB.find(p => p.name === n)!;
    return { ...base, id: `boss-${i}`, hp: base.stats.hp * 3, maxHp: base.stats.hp * 3, position: 6 + i, status: 'idle' as const };
  });
  return Array.from({ length: Math.min(4, Math.ceil(stage / 4) || 1) }, (_, i) => {
    const base = generateShop(stage)[0]; 
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
  playerTeam: Pokemon[]; enemyTeam: Pokemon[]; shopItems: (typeof POKEMON_DB[0] | null)[];
  gold: number; stage: number; isBattling: boolean;
  startBattle: () => void; gameTick: () => Promise<void>; refreshShop: () => void; buyPokemon: (index: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerTeam: [{ id: 'p1', ...POKEMON_DB[1], hp: POKEMON_DB[1].stats.hp, maxHp: POKEMON_DB[1].stats.hp, position: 1, status: 'idle' }],
  enemyTeam: generateEnemies(1), shopItems: generateShop(1), gold: 20, stage: 1, isBattling: false,

  startBattle: () => set({ isBattling: true }),
  refreshShop: () => set(s => s.gold >= 2 ? { gold: s.gold - 2, shopItems: generateShop(s.stage) } : s),
  
  gameTick: async () => {
    const state = get();
    if (!state.isBattling) return;

    // 1. Force reset CSS animations for a split second
    set({
      playerTeam: state.playerTeam.map(p => ({ ...p, status: 'idle' })),
      enemyTeam: state.enemyTeam.map(e => ({ ...e, status: 'idle' }))
    });
    await new Promise(r => setTimeout(r, 50));

    // 2. Apply Attacks & Trigger Animations
    const pTeam = get().playerTeam.map(p => ({ ...p }));
    const eTeam = get().enemyTeam.map(e => ({ ...e }));
    executeAttacks(pTeam, eTeam); executeAttacks(eTeam, pTeam);
    set({ playerTeam: pTeam, enemyTeam: eTeam });

    // 3. Wait for the violent animations to visually finish before removing dead Pokémon
    await new Promise(r => setTimeout(r, 800));

    const eDead = eTeam.every(e => e.hp <= 0);
    const pDead = pTeam.every(p => p.hp <= 0);

    if (eDead) {
      if (state.stage === MAX_STAGE) { alert("🏆 CHAMPION DEFEATED! You beat Kanto!"); set({ isBattling: false }); return; }
      set(s => ({ enemyTeam: generateEnemies(s.stage + 1), playerTeam: pTeam.map(p => ({ ...p, hp: p.maxHp, status: 'idle' })), shopItems: generateShop(s.stage + 1), gold: s.gold + 10, stage: s.stage + 1, isBattling: false }));
    } else if (pDead) {
      alert(`Run Lost to Stage ${state.stage}! Refresh to restart.`); set({ isBattling: false, playerTeam: pTeam, enemyTeam: eTeam });
    }
  },

  buyPokemon: (index) => set((s) => {
    const poke = s.shopItems[index];
    if (!poke || s.gold < 10 || s.playerTeam.length >= 6) return s;
    const position = [0,1,2,3,4,5].find(i => !s.playerTeam.some(p => p.position === i)) ?? 0;
    const newShop = [...s.shopItems];
    newShop[index] = null; // Mark slot as sold out
    return { gold: s.gold - 10, shopItems: newShop, playerTeam: [...s.playerTeam, { ...poke, id: Date.now().toString(), hp: poke.stats.hp, maxHp: poke.stats.hp, position, status: 'idle' }] };
  })
}));

export const getSpriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
