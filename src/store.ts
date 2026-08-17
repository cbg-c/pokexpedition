import { create } from 'zustand';

export type BaseStats = { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number; };
export type Pokemon = { id: string; pokedexId: number; name: string; type: string; tier: number; stats: BaseStats; hp: number; maxHp: number; position: number; status: 'idle' | 'attacking' | 'damaged'; };

export const POKEMON_DB = [
  { pokedexId: 1, name: 'Bulbasaur', type: 'grass', tier: 1, stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 } },
  { pokedexId: 4, name: 'Charmander', type: 'fire', tier: 1, stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 } },
  { pokedexId: 7, name: 'Squirtle', type: 'water', tier: 1, stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 } },
  { pokedexId: 16, name: 'Pidgey', type: 'normal', tier: 1, stats: { hp: 40, attack: 45, defense: 40, spAtk: 35, spDef: 35, speed: 56 } },
  { pokedexId: 2, name: 'Ivysaur', type: 'grass', tier: 2, stats: { hp: 60, attack: 62, defense: 63, spAtk: 80, spDef: 80, speed: 60 } },
  { pokedexId: 25, name: 'Pikachu', type: 'electric', tier: 2, stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 } },
  { pokedexId: 3, name: 'Venusaur', type: 'grass', tier: 3, stats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 } },
  { pokedexId: 143, name: 'Snorlax', type: 'normal', tier: 3, stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 } },
  { pokedexId: 150, name: 'Mewtwo', type: 'psychic', tier: 4, stats: { hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130 } },
];

const getShopPool = (stage: number) => POKEMON_DB.filter(p => p.tier <= (stage >= 10 ? 4 : stage >= 7 ? 3 : stage >= 4 ? 2 : 1));
const generateShop = (stage: number) => Array.from({ length: 5 }, () => getShopPool(stage)[Math.floor(Math.random() * getShopPool(stage).length)]);
const generateEnemies = (stage: number) => Array.from({ length: Math.min(3, Math.ceil(stage / 3) || 1) }, (_, i) => {
  const base = getShopPool(stage)[Math.floor(Math.random() * getShopPool(stage).length)];
  const scaledHp = Math.floor(base.stats.hp * (1 + stage * 0.15));
  return { ...base, id: `e-${Date.now()}-${i}`, hp: scaledHp, maxHp: scaledHp, position: 7 + i, status: 'idle' as const };
});

// Reusable combat math
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
  playerTeam: [{ id: 'p1', ...POKEMON_DB[0], hp: POKEMON_DB[0].stats.hp, maxHp: POKEMON_DB[0].stats.hp, position: 1, status: 'idle' }],
  enemyTeam: generateEnemies(1), shopItems: generateShop(1), gold: 20, stage: 1, isBattling: false,

  startBattle: () => set({ isBattling: true }),
  refreshShop: () => set(s => s.gold >= 2 ? { gold: s.gold - 2, shopItems: generateShop(s.stage) } : s),
  
  gameTick: () => set((state) => {
    if (!state.isBattling) return state;
    const [pTeam, eTeam] = [state.playerTeam.map(p => ({ ...p, status: 'idle' as const })), state.enemyTeam.map(e => ({ ...e, status: 'idle' as const }))];

    executeAttacks(pTeam, eTeam);
    executeAttacks(eTeam, pTeam);

    if (eTeam.every(e => e.hp <= 0)) return { enemyTeam: generateEnemies(state.stage + 1), playerTeam: pTeam.map(p => ({ ...p, hp: p.maxHp, status: 'idle' })), shopItems: generateShop(state.stage + 1), gold: state.gold + 10, stage: state.stage + 1, isBattling: false };
    if (pTeam.every(p => p.hp <= 0)) { alert(`Run Lost (Stage ${state.stage})! Refresh.`); return { isBattling: false, playerTeam: pTeam, enemyTeam: eTeam }; }

    return { playerTeam: pTeam, enemyTeam: eTeam };
  }),

  buyPokemon: (base) => set((s) => {
    if (s.gold < 10 || s.playerTeam.length >= 6) return s;
    const position = [0,1,2,3,4,5].find(i => !s.playerTeam.some(p => p.position === i)) ?? 0;
    return { gold: s.gold - 10, playerTeam: [...s.playerTeam, { ...base, id: Date.now().toString(), hp: base.stats.hp, maxHp: base.stats.hp, position, status: 'idle' }] };
  })
}));

export const getSpriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
