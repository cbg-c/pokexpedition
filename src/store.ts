import { create } from 'zustand';

export type BaseStats = { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number; };
export type Pokemon = { id: string; baseId: number; pokedexId: number; name: string; type: string; tier: number; stats: BaseStats; hp: number; maxHp: number; position: number; status: 'idle' | 'attacking' | 'damaged'; copies: number; star: number; };

// Dictionary for Name Lookups
const NAMES: Record<number, string> = { 1:'Bulbasaur', 2:'Ivysaur', 3:'Venusaur', 4:'Charmander', 5:'Charmeleon', 6:'Charizard', 7:'Squirtle', 8:'Wartortle', 9:'Blastoise', 16:'Pidgey', 17:'Pidgeotto', 18:'Pidgeot', 63:'Abra', 64:'Kadabra', 65:'Alakazam', 92:'Gastly', 93:'Haunter', 94:'Gengar', 147:'Dratini', 148:'Dragonair', 149:'Dragonite', 143:'Snorlax', 150:'Mewtwo' };

// Base DB (Evolutions are automatically fetched via EVOS map)
export const POKEMON_DB = [
  { id: 1, type: 'grass', tier: 1, stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 } },
  { id: 4, type: 'fire', tier: 1, stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 } },
  { id: 7, type: 'water', tier: 1, stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 } },
  { id: 16, type: 'normal', tier: 1, stats: { hp: 40, attack: 45, defense: 40, spAtk: 35, spDef: 35, speed: 56 } },
  { id: 63, type: 'psychic', tier: 2, stats: { hp: 25, attack: 20, defense: 15, spAtk: 105, spDef: 55, speed: 90 } },
  { id: 92, type: 'ghost', tier: 2, stats: { hp: 30, attack: 35, defense: 30, spAtk: 100, spDef: 35, speed: 80 } },
  { id: 147, type: 'dragon', tier: 3, stats: { hp: 41, attack: 64, defense: 45, spAtk: 50, spDef: 50, speed: 50 } },
  { id: 143, type: 'normal', tier: 4, stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 } }
];

const EVOS: Record<number, [number, number]> = { 1:[2,3], 4:[5,6], 7:[8,9], 16:[17,18], 63:[64,65], 92:[93,94], 147:[148,149], 143:[143,143] };

// Type Effectiveness Matrix
const TYPES: Record<string, Record<string, number>> = {
  fire: { grass: 2, water: 0.5, fire: 0.5, dragon: 0.5 }, water: { fire: 2, grass: 0.5, water: 0.5, dragon: 0.5 },
  grass: { water: 2, fire: 0.5, grass: 0.5, dragon: 0.5 }, psychic: { psychic: 0.5, ghost: 0.5 }, 
  ghost: { psychic: 2, ghost: 2, normal: 0 }, normal: { ghost: 0 }, dragon: { dragon: 2 }
};
const getMult = (a: string, d: string) => TYPES[a]?.[d] ?? 1;

const MAX_STAGE = 20;
const generateShop = (stage: number) => Array.from({ length: 5 }, () => {
  const pool = POKEMON_DB.filter(p => p.tier <= (stage >= 10 ? 4 : stage >= 5 ? 3 : stage >= 2 ? 2 : 1));
  return pool[Math.floor(Math.random() * pool.length)];
});

const generateEnemies = (stage: number) => {
  if (stage === MAX_STAGE) return [{ id: 'boss', baseId: 150, pokedexId: 150, name: 'Mewtwo', type: 'psychic', tier: 4, stats: { hp: 500, attack: 150, defense: 100, spAtk: 200, spDef: 100, speed: 150 }, hp: 500, maxHp: 500, position: 0, status: 'idle' as const, copies: 10, star: 3 }];
  return Array.from({ length: Math.min(6, Math.ceil(stage / 3)) }, (_, i) => {
    const base = generateShop(stage)[0];
    const isStage2 = stage > 5 && Math.random() > 0.5;
    const dexId = isStage2 ? EVOS[base.id][0] : base.id;
    const scale = isStage2 ? 1.5 : 1 + (stage * 0.1);
    const scaledHp = Math.floor(base.stats.hp * scale);
    return { baseId: base.id, pokedexId: dexId, name: NAMES[dexId], type: base.type, tier: base.tier, stats: { ...base.stats, speed: base.stats.speed * scale }, id: `e-${Date.now()}-${i}`, hp: scaledHp, maxHp: scaledHp, position: i, status: 'idle' as const, copies: isStage2 ? 5 : 1, star: isStage2 ? 2 : 1 };
  });
};

interface GameState {
  playerTeam: Pokemon[]; enemyTeam: Pokemon[]; shopItems: (typeof POKEMON_DB[0] | null)[];
  gold: number; stage: number; isBattling: boolean; combatText: string;
  startBattle: () => void; gameTick: () => Promise<void>; refreshShop: () => void; buyPokemon: (i: number) => void; swapSlots: (i1: number, i2: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerTeam: [{ id: 'p1', baseId: 4, pokedexId: 4, name: 'Charmander', type: 'fire', tier: 1, stats: POKEMON_DB[1].stats, hp: POKEMON_DB[1].stats.hp, maxHp: POKEMON_DB[1].stats.hp, position: 0, status: 'idle', copies: 1, star: 1 }],
  enemyTeam: generateEnemies(1), shopItems: generateShop(1), gold: 20, stage: 1, isBattling: false, combatText: "",

  startBattle: () => set({ isBattling: true, combatText: "" }),
  refreshShop: () => set(s => s.gold >= 2 ? { gold: s.gold - 2, shopItems: generateShop(s.stage) } : s),
  swapSlots: (i1, i2) => set(s => {
    if (s.isBattling) return s;
    const pTeam = [...s.playerTeam];
    const p1 = pTeam.find(p => p.position === i1); const p2 = pTeam.find(p => p.position === i2);
    if (p1) p1.position = i2; if (p2) p2.position = i1;
    return { playerTeam: pTeam };
  }),
  
  gameTick: async () => {
    const state = get(); if (!state.isBattling) return;
    const pTeam = [...state.playerTeam].sort((a, b) => a.position - b.position);
    const eTeam = [...state.enemyTeam].sort((a, b) => a.position - b.position);

    // 1v1 Party Combat: Find first alive in lineup
    const p1 = pTeam.find(p => p.hp > 0); const e1 = eTeam.find(e => e.hp > 0);
    if (!p1 || !e1) return;

    set({ playerTeam: pTeam.map(p => ({ ...p, status: 'idle' })), enemyTeam: eTeam.map(e => ({ ...e, status: 'idle' })) });
    await new Promise(r => setTimeout(r, 50));

    let txt = "";
    const applyDmg = (atk: Pokemon, def: Pokemon) => {
      atk.status = 'attacking'; def.status = 'damaged';
      const mult = getMult(atk.type, def.type);
      if (mult > 1) txt = "Super Effective!"; if (mult < 1) txt = "Not very effective...";
      const isSp = atk.stats.spAtk > atk.stats.attack;
      const dmg = Math.max(1, (((isSp ? atk.stats.spAtk : atk.stats.attack) - ((isSp ? def.stats.spDef : def.stats.defense) * 0.4)) * mult) | 0);
      def.hp = Math.max(0, def.hp - dmg);
    };

    // Speed dictates who attacks first
    if (p1.stats.speed >= e1.stats.speed) { applyDmg(p1, e1); if (e1.hp > 0) applyDmg(e1, p1); } 
    else { applyDmg(e1, p1); if (p1.hp > 0) applyDmg(p1, e1); }

    set({ playerTeam: pTeam, enemyTeam: eTeam, combatText: txt });
    await new Promise(r => setTimeout(r, 800));

    if (eTeam.every(e => e.hp <= 0)) {
      if (state.stage === MAX_STAGE) { alert("🏆 CHAMPION DEFEATED!"); set({ isBattling: false }); return; }
      set(s => ({ enemyTeam: generateEnemies(s.stage + 1), playerTeam: pTeam.map(p => ({ ...p, hp: p.maxHp, status: 'idle' })), shopItems: generateShop(s.stage + 1), gold: s.gold + 10, stage: s.stage + 1, isBattling: false, combatText: "" }));
    } else if (pTeam.every(p => p.hp <= 0)) {
      alert(`Run Lost to Stage ${state.stage}! Refresh to restart.`); set({ isBattling: false });
    }
  },

  buyPokemon: (index) => set((s) => {
    const base = s.shopItems[index]; if (!base || s.gold < 10) return s;
    const existing = s.playerTeam.find(p => p.baseId === base.id);
    const newShop = [...s.shopItems]; newShop[index] = null;

    // EVOLUTION / MERGE LOGIC (5 copies = ⭐2, 10 copies = ⭐3)
    if (existing) {
      if (existing.copies >= 10) return s; // Maxed out
      const pTeam = s.playerTeam.map(p => {
        if (p.id === existing.id) {
          const copies = p.copies + 1;
          let star = p.star, dexId = p.pokedexId;
          if (copies === 5) { star = 2; dexId = EVOS[p.baseId][0]; }
          if (copies === 10) { star = 3; dexId = EVOS[p.baseId][1]; }
          const scale = star === 3 ? 2.5 : star === 2 ? 1.5 : 1;
          return { ...p, copies, star, pokedexId: dexId, name: NAMES[dexId], maxHp: Math.floor(base.stats.hp * scale), hp: Math.floor(base.stats.hp * scale), stats: { attack: base.stats.attack*scale, defense: base.stats.defense*scale, spAtk: base.stats.spAtk*scale, spDef: base.stats.spDef*scale, speed: base.stats.speed*scale } };
        }
        return p;
      });
      return { gold: s.gold - 10, shopItems: newShop, playerTeam: pTeam };
    }

    if (s.playerTeam.length >= 6) return s;
    const position = [0,1,2,3,4,5].find(i => !s.playerTeam.some(p => p.position === i)) ?? 0;
    return { gold: s.gold - 10, shopItems: newShop, playerTeam: [...s.playerTeam, { baseId: base.id, pokedexId: base.id, name: NAMES[base.id], type: base.type, tier: base.tier, stats: base.stats, id: Date.now().toString(), hp: base.stats.hp, maxHp: base.stats.hp, position, status: 'idle', copies: 1, star: 1 }] };
  })
}));

export const getSpriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
