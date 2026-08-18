// State Management & Core Game Logic
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Types ---
export type BaseStats = { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number; };
export type Pokemon = { id: string; baseId: number; pokedexId: number; name: string; types: string[]; tier: number; stats: BaseStats; hp: number; maxHp: number; position: number; status: 'idle' | 'attacking' | 'damaged'; copies: number; star: number; lastDamageTaken?: number | null; isShiny: boolean; };

// --- Database (Minified for line reduction) ---
// Format: [baseId, name, types, tier, hp, atk, def, spa, spd, spe]
const RAW_DEX: (string | number)[][] = [
  [1,'Bulbasaur','grass,poison',1,45,49,49,65,65,45],[2,'Ivysaur','grass,poison',2,60,62,63,80,80,60],[3,'Venusaur','grass,poison',3,80,82,83,100,100,80],
  [4,'Charmander','fire',1,39,52,43,60,50,65],[5,'Charmeleon','fire',2,58,64,58,80,65,80],[6,'Charizard','fire,flying',3,78,84,78,109,85,100],
  [7,'Squirtle','water',1,44,48,65,50,64,43],[8,'Wartortle','water',2,59,63,80,65,80,58],[9,'Blastoise','water',3,79,83,100,85,105,78],
  [10,'Caterpie','bug',1,45,30,35,20,20,45],[11,'Metapod','bug',1,50,20,55,25,25,30],[12,'Butterfree','bug,flying',2,60,45,50,90,80,70],
  [13,'Weedle','bug,poison',1,40,35,30,20,20,50],[14,'Kakuna','bug,poison',1,45,25,50,25,25,35],[15,'Beedrill','bug,poison',2,65,90,40,45,80,75],
  [16,'Pidgey','normal,flying',1,40,45,40,35,35,56],[17,'Pidgeotto','normal,flying',2,63,60,55,50,50,71],[18,'Pidgeot','normal,flying',3,83,80,75,70,70,101],
  [19,'Rattata','normal',1,30,56,35,25,35,72],[20,'Raticate','normal',2,55,81,60,50,70,97],
  [21,'Spearow','normal,flying',1,40,60,30,31,31,70],[22,'Fearow','normal,flying',2,65,90,65,61,61,100],
  [23,'Ekans','poison',1,35,60,44,40,54,55],[24,'Arbok','poison',2,60,85,69,65,79,80],
  [25,'Pikachu','electric',1,35,55,40,50,50,90],[26,'Raichu','electric',3,60,90,55,90,80,110],
  [27,'Sandshrew','ground',1,50,75,85,20,30,40],[28,'Sandslash','ground',2,75,100,110,45,55,65],
  [29,'Nidoran F','poison',1,55,47,52,40,40,41],[30,'Nidorina','poison',2,70,62,67,55,55,56],[31,'Nidoqueen','poison,ground',3,90,92,87,75,85,76],
  [32,'Nidoran M','poison',1,46,57,40,40,40,50],[33,'Nidorino','poison',2,61,72,57,55,55,65],[34,'Nidoking','poison,ground',3,81,102,77,85,75,85],
  [35,'Clefairy','fairy',1,55,45,48,60,65,35],[36,'Clefable','fairy',3,95,70,73,95,90,60],
  [37,'Vulpix','fire',1,38,41,40,50,65,65],[38,'Ninetales','fire',3,73,76,75,81,100,100],
  [39,'Jigglypuff','normal,fairy',1,115,45,20,45,25,20],[40,'Wigglytuff','normal,fairy',2,140,70,45,85,50,45],
  [41,'Zubat','poison,flying',1,40,45,35,30,40,55],[42,'Golbat','poison,flying',2,75,80,70,65,75,90],
  [43,'Oddish','grass,poison',1,45,50,55,75,65,30],[44,'Gloom','grass,poison',2,60,65,70,85,75,40],[45,'Vileplume','grass,poison',3,75,80,85,110,90,50],
  [46,'Paras','bug,grass',1,35,70,55,45,55,25],[47,'Parasect','bug,grass',2,60,95,80,60,80,30],
  [48,'Venonat','bug,poison',1,60,55,50,40,55,45],[49,'Venomoth','bug,poison',2,70,65,60,90,75,90],
  [50,'Diglett','ground',1,10,55,25,35,45,95],[51,'Dugtrio','ground',2,35,100,50,50,70,120],
  [52,'Meowth','normal',1,40,45,35,40,40,90],[53,'Persian','normal',2,65,70,60,65,65,115],
  [54,'Psyduck','water',1,50,52,48,65,50,55],[55,'Golduck','water',2,80,82,78,95,80,85],
  [56,'Mankey','fighting',1,40,80,35,35,45,70],[57,'Primeape','fighting',2,65,105,60,60,70,95],
  [58,'Growlithe','fire',1,55,70,45,70,50,60],[59,'Arcanine','fire',3,90,110,80,100,80,95],
  [60,'Poliwag','water',1,40,50,40,40,40,90],[61,'Poliwhirl','water',2,65,65,65,50,50,90],[62,'Poliwrath','water,fighting',3,90,95,95,70,90,70],
  [63,'Abra','psychic',1,25,20,15,105,55,90],[64,'Kadabra','psychic',2,40,35,30,120,70,105],[65,'Alakazam','psychic',3,55,50,45,135,95,120],
  [66,'Machop','fighting',1,70,80,50,35,35,35],[67,'Machoke','fighting',2,80,100,70,50,60,45],[68,'Machamp','fighting',3,90,130,80,65,85,55],
  [69,'Bellsprout','grass,poison',1,50,75,35,70,30,40],[70,'Weepinbell','grass,poison',2,65,90,50,85,45,55],[71,'Victreebel','grass,poison',3,80,105,65,100,70,70],
  [72,'Tentacool','water,poison',1,40,40,35,50,100,70],[73,'Tentacruel','water,poison',2,80,70,65,80,120,100],
  [74,'Geodude','rock,ground',1,40,80,100,30,30,20],[75,'Graveler','rock,ground',2,55,95,115,45,45,35],[76,'Golem','rock,ground',3,80,120,130,55,65,45],
  [77,'Ponyta','fire',1,50,85,55,65,65,90],[78,'Rapidash','fire',2,65,100,70,80,80,105],
  [79,'Slowpoke','water,psychic',1,90,65,65,40,40,15],[80,'Slowbro','water,psychic',3,95,75,110,100,80,30],
  [81,'Magnemite','electric,steel',1,25,35,70,95,55,45],[82,'Magneton','electric,steel',2,50,60,95,120,70,70],
  [83,'Farfetchd','normal,flying',1,52,90,55,58,62,60],
  [84,'Doduo','normal,flying',1,35,85,45,35,35,75],[85,'Dodrio','normal,flying',2,60,110,70,60,60,110],
  [86,'Seel','water',1,65,45,55,45,70,45],[87,'Dewgong','water,ice',2,90,70,80,70,95,70],
  [88,'Grimer','poison',1,80,80,50,40,50,25],[89,'Muk','poison',2,105,105,75,65,100,50],
  [90,'Shellder','water',1,30,65,100,45,25,40],[91,'Cloyster','water,ice',3,50,95,180,85,45,70],
  [92,'Gastly','ghost,poison',1,30,35,30,100,35,80],[93,'Haunter','ghost,poison',2,45,50,45,115,55,95],[94,'Gengar','ghost,poison',3,60,65,60,130,75,110],
  [95,'Onix','rock,ground',1,35,45,160,30,45,70],
  [96,'Drowzee','psychic',1,60,48,45,43,90,42],[97,'Hypno','psychic',2,85,73,70,73,115,67],
  [98,'Krabby','water',1,30,105,90,25,25,50],[99,'Kingler','water',2,55,130,115,50,50,75],
  [100,'Voltorb','electric',1,40,30,50,55,55,100],[101,'Electrode','electric',2,60,50,70,80,80,150],
  [102,'Exeggcute','grass,psychic',1,60,40,80,60,45,40],[103,'Exeggutor','grass,psychic',3,95,95,85,125,75,55],
  [104,'Cubone','ground',1,50,50,95,40,50,35],[105,'Marowak','ground',2,60,80,110,50,80,45],
  [106,'Hitmonlee','fighting',2,50,120,53,35,110,87],[107,'Hitmonchan','fighting',2,50,105,79,35,110,76],
  [108,'Lickitung','normal',1,90,55,75,60,75,30],
  [109,'Koffing','poison',1,40,65,95,60,45,35],[110,'Weezing','poison',2,65,90,120,85,70,60],
  [111,'Rhyhorn','ground,rock',1,80,85,95,30,30,25],[112,'Rhydon','ground,rock',3,105,130,120,45,45,40],
  [113,'Chansey','normal',2,250,5,5,35,105,50],
  [114,'Tangela','grass',1,65,55,115,100,40,60],
  [115,'Kangaskhan','normal',3,105,95,80,40,80,90],
  [116,'Horsea','water',1,30,40,70,70,25,60],[117,'Seadra','water',2,55,65,95,95,45,85],
  [118,'Goldeen','water',1,45,67,60,35,50,63],[119,'Seaking','water',2,80,92,65,65,80,68],
  [120,'Staryu','water',1,30,45,55,70,55,85],[121,'Starmie','water,psychic',3,60,75,85,100,85,115],
  [122,'Mr. Mime','psychic',2,40,45,65,100,120,90],
  [123,'Scyther','bug,flying',2,70,110,80,55,80,105],
  [124,'Jynx','ice,psychic',2,65,50,35,115,95,95],
  [125,'Electabuzz','electric',2,65,83,57,95,85,105],
  [126,'Magmar','fire',2,65,95,57,100,85,93],
  [127,'Pinsir','bug',2,65,125,100,55,70,85],
  [128,'Tauros','normal',3,75,100,95,40,70,110],
  [129,'Magikarp','water',1,20,10,55,15,20,80],[130,'Gyarados','water,flying',3,95,125,79,60,100,81],
  [131,'Lapras','water,ice',3,130,85,80,85,95,60],
  [132,'Ditto','normal',1,48,48,48,48,48,48],
  [133,'Eevee','normal',1,55,55,50,45,65,55],[134,'Vaporeon','water',3,130,65,60,110,95,65],[135,'Jolteon','electric',3,65,65,60,110,95,130],[136,'Flareon','fire',3,65,130,60,95,110,65],
  [137,'Porygon','normal',1,65,60,70,85,75,40],
  [138,'Omanyte','rock,water',1,35,40,100,90,55,35],[139,'Omastar','rock,water',2,70,60,125,115,70,55],
  [140,'Kabuto','rock,water',1,30,80,90,55,45,55],[141,'Kabutops','rock,water',2,60,115,105,65,70,80],
  [142,'Aerodactyl','rock,flying',3,80,105,65,60,75,130],
  [143,'Snorlax','normal',4,160,110,65,65,110,30],
  [144,'Articuno','ice,flying',4,90,85,100,95,125,85],
  [145,'Zapdos','electric,flying',4,90,90,85,125,90,100],
  [146,'Moltres','fire,flying',4,90,100,90,125,85,90],
  [147,'Dratini','dragon',1,41,64,45,50,50,50],[148,'Dragonair','dragon',2,61,84,65,70,70,70],[149,'Dragonite','dragon,flying',4,91,134,95,100,100,80],
  [150,'Mewtwo','psychic',4,106,110,90,154,90,130],
  [151,'Mew','psychic',4,100,100,100,100,100,100]
];

export const POKEMON_DB: Pokemon[] = RAW_DEX.map(p => ({ 
  id: p[0].toString(), baseId: p[0] as number, pokedexId: p[0] as number, name: p[1] as string, 
  types: (p[2] as string).split(','), tier: p[3] as number, 
  stats: { hp: p[4] as number, attack: p[5] as number, defense: p[6] as number, spAtk: p[7] as number, spDef: p[8] as number, speed: p[9] as number }, 
  hp: p[4] as number, maxHp: p[4] as number, position: 0, status: 'idle', copies: 1, star: 1, isShiny: false 
}));

const NAMES: Record<number, string> = {}; POKEMON_DB.forEach(p => NAMES[p.baseId] = p.name);

// --- Evolution Logic ---
export const THREE_STAGE_BASE_IDS = new Set([1, 4, 7, 10, 13, 16, 29, 32, 43, 60, 63, 66, 69, 74, 92, 147]);
export const SINGLE_STAGE_BASE_IDS = new Set([83, 95, 106, 107, 108, 113, 114, 115, 122, 123, 124, 125, 126, 127, 128, 131, 132, 137, 142, 143, 144, 145, 146, 150, 151]);

export const getMaxCopies = (baseId: number) => THREE_STAGE_BASE_IDS.has(baseId) ? 6 : 3;

const getEvo = (baseId: number, level: number) => {
  if (baseId === 133) return level === 1 ? 134 : 135; 
  let e1 = baseId, e2 = baseId;
  const p1 = POKEMON_DB.find(p => p.baseId === baseId + 1);
  if (p1 && p1.tier > POKEMON_DB.find(p=>p.baseId===baseId)!.tier) {
    e1 = p1.baseId; e2 = p1.baseId;
    const p2 = POKEMON_DB.find(p => p.baseId === baseId + 2);
    if (p2 && p2.tier > p1.tier) e2 = p2.baseId;
  }
  return [e1, e2];
};

const applyStageEvolution = (p: Pokemon, stage: number, isShiny: boolean): Pokemon => {
  const is3Stage = THREE_STAGE_BASE_IDS.has(p.baseId);
  const isSingle = SINGLE_STAGE_BASE_IDS.has(p.baseId);

  let dexId = p.baseId;
  let star = 1;
  let copies = 1;
  let scale = 1.0;

  if (is3Stage) {
    if (stage >= 12) { dexId = getEvo(p.baseId, 2)[1]; star = 3; copies = 6; scale = 2.8; }
    else if (stage >= 9) { dexId = getEvo(p.baseId, 1)[0]; star = 2; copies = 3; scale = 1.5; }
  } else if (isSingle) {
    if (stage >= 12) { star = 3; copies = 3; scale = 2.8; }
    else if (stage >= 9) { star = 2; copies = 2; scale = 1.5; }
  } else {
    if (stage >= 9) { dexId = getEvo(p.baseId, 1)[0]; star = 3; copies = 3; scale = 2.8; }
  }
  
  return {
    ...p, pokedexId: dexId, name: NAMES[dexId] || p.name, star, copies, isShiny,
    maxHp: Math.floor(p.stats.hp * scale), hp: Math.floor(p.stats.hp * scale),
    stats: {
      ...p.stats, attack: Math.floor(p.stats.attack * scale), defense: Math.floor(p.stats.defense * scale),
      spAtk: Math.floor(p.stats.spAtk * scale), spDef: Math.floor(p.stats.spDef * scale), speed: Math.floor(p.stats.speed * scale)
    }
  };
};

// --- Type Effectiveness ---
const TYPES: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};
const getMult = (atkType: string, defType: string) => TYPES[atkType]?.[defType] ?? 1;

export const getCost = (tier: number) => tier === 4 ? 12 : tier === 3 ? 8 : tier === 2 ? 5 : 3;
export const getSellValue = (tier: number, copies: number) => Math.max(1, Math.floor((getCost(tier) * copies) * 0.7));

export const REGIONS = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos'];
const MAX_STAGE = 20;

// --- Generators ---
const generateShop = (stage: number, currentTeam: Pokemon[] = [], allowShiny: boolean = true) => Array.from({ length: 5 }, () => {
  const maxedBaseIds = new Set(currentTeam.filter(p => p.copies >= getMaxCopies(p.baseId)).map(p => p.baseId));
  const pool = POKEMON_DB.filter(p => 
    p.baseId === p.pokedexId && 
    p.tier <= (stage >= 10 ? 4 : stage >= 5 ? 3 : stage >= 2 ? 2 : 1) && 
    p.baseId !== 150 && p.baseId !== 151 && 
    !maxedBaseIds.has(p.baseId)
  );
  if (pool.length === 0) return null;

  const isShiny = allowShiny && Math.random() < 0.0075; 

  if (stage >= 15 && Math.random() > 0.95 && !maxedBaseIds.has(150)) return applyStageEvolution(POKEMON_DB.find(p => p.baseId === 150)!, stage, isShiny); 
  
  const teamBaseIds = new Set(currentTeam.map(p => p.baseId));
  const biasedPool = pool.flatMap(p => teamBaseIds.has(p.baseId) ? [p,p,p,p,p,p,p,p,p,p] : [p]);
  const picked = biasedPool[Math.floor(Math.random() * biasedPool.length)];
  return applyStageEvolution(picked, stage, isShiny);
});

const generateEnemies = (stage: number) => {
  if (stage === MAX_STAGE) return [{ ...POKEMON_DB.find(p=>p.baseId===150)!, id: 'boss', hp: 800, maxHp: 800, position: 0, status: 'idle' as const, copies: 6, star: 3, isShiny: false }];
  return Array.from({ length: Math.min(6, Math.ceil(stage / 3)) }, (_, i) => {
    const base = generateShop(stage, [], false)[0]; 
    if(!base) return { ...POKEMON_DB[0], id: `e-${Date.now()}-${i}`, position: i };
    const scaledHp = Math.floor(base.maxHp * (1 + (stage * 0.05)));
    return { ...base, id: `e-${Date.now()}-${i}`, hp: scaledHp, maxHp: scaledHp, position: i, status: 'idle' as const };
  });
};

// --- Zustand Store ---
interface GameState {
  currentRegion: string | null; clearedRegions: string[];
  hasSelectedStarter: boolean; isGameOver: boolean; playerTeam: Pokemon[]; enemyTeam: Pokemon[]; shopItems: (Pokemon | null)[];
  gold: number; stage: number; isBattling: boolean; combatText: string; shopFrozen: boolean;
  pokedex: Record<number, { seen: boolean, shiny: boolean }>; highScores: Record<string, number>;
  isFastForwarding: boolean;
  setRegion: (r: string) => void; returnToMenu: () => void;
  selectStarter: (id: number) => void; startBattle: () => void; toggleFastForward: () => void; gameTick: () => Promise<void>; refreshShop: () => void; buyPokemon: (i: number) => void; swapSlots: (i1: number, i2: number) => void; resetGame: () => void; sellPokemon: (pos: number) => void; toggleFreeze: () => void; registerPokedex: (dexId: number, isShiny: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentRegion: null, clearedRegions: [],
      hasSelectedStarter: false, isGameOver: false, playerTeam: [], enemyTeam: generateEnemies(1), shopItems: generateShop(1, []), gold: 12, stage: 1, isBattling: false, combatText: "", shopFrozen: false, pokedex: {}, highScores: { Kanto: 1 },
      isFastForwarding: false,

      setRegion: (r) => set({ currentRegion: r, hasSelectedStarter: false, isGameOver: false, gold: 12, stage: 1, playerTeam: [], enemyTeam: generateEnemies(1), shopItems: generateShop(1, []), shopFrozen: false, combatText: '' }),
      returnToMenu: () => set({ currentRegion: null }),

      registerPokedex: (dexId, isShiny) => set(s => {
        const entry = s.pokedex[dexId] || { seen: false, shiny: false };
        return { pokedex: { ...s.pokedex, [dexId]: { seen: true, shiny: entry.shiny || isShiny } } };
      }),

      selectStarter: (id) => {
        const isShiny = Math.random() < 0.0075;
        get().registerPokedex(id, isShiny);
        set({
          hasSelectedStarter: true,
          playerTeam: [{ ...POKEMON_DB.find(p=>p.baseId===id)!, id: 'p1', position: 0, status: 'idle', copies: 1, star: 1, isShiny }],
          gold: 12,
          shopItems: generateShop(1, [{ ...POKEMON_DB.find(p=>p.baseId===id)!, id: 'p1', position: 0, status: 'idle', copies: 1, star: 1, isShiny } as Pokemon])
        });
      },

      resetGame: () => set({ hasSelectedStarter: false, isGameOver: false, playerTeam: [], enemyTeam: generateEnemies(1), shopItems: generateShop(1, []), gold: 12, stage: 1, isBattling: false, combatText: "", shopFrozen: false }),

      toggleFreeze: () => set(s => ({ shopFrozen: !s.shopFrozen })),
      startBattle: () => set({ isBattling: true, combatText: "" }),
      toggleFastForward: () => set(s => ({ isFastForwarding: !s.isFastForwarding })),

      refreshShop: () => set(s => s.gold >= 2 ? { gold: s.gold - 2, shopItems: generateShop(s.stage, s.playerTeam) } : s),
      
      swapSlots: (i1, i2) => set(s => {
        if (s.isBattling) return s;
        const pTeam = [...s.playerTeam];
        const p1 = pTeam.find(p => p.position === i1); const p2 = pTeam.find(p => p.position === i2);
        if (p1) p1.position = i2; if (p2) p2.position = i1;
        return { playerTeam: pTeam };
      }),

      sellPokemon: (pos) => set(s => {
        if (s.isBattling) return s;
        const pIndex = s.playerTeam.findIndex(p => p.position === pos);
        if (pIndex === -1) return s;
        const p = s.playerTeam[pIndex];
        const sellValue = getSellValue(p.tier, p.copies);
        const newTeam = [...s.playerTeam]; newTeam.splice(pIndex, 1);
        return { playerTeam: newTeam, gold: s.gold + sellValue };
      }),
      
      gameTick: async () => {
        const state = get(); if (!state.isBattling) return;
        const pTeam = [...state.playerTeam].sort((a, b) => a.position - b.position);
        const eTeam = [...state.enemyTeam].sort((a, b) => a.position - b.position);

        const p1 = pTeam.find(p => p.hp > 0); const e1 = eTeam.find(e => e.hp > 0);
        if (!p1 || !e1) return;

        set({ playerTeam: pTeam.map(p => ({ ...p, status: 'idle', lastDamageTaken: null })), enemyTeam: eTeam.map(e => ({ ...e, status: 'idle', lastDamageTaken: null })) });
        
        const speedMult = get().isFastForwarding ? 0.33 : 1;
        await new Promise(r => setTimeout(r, 50 * speedMult));
        if (!get().isBattling) return; 

        let txt = "";
        const applyDmg = (atk: Pokemon, def: Pokemon) => {
          if (def.hp <= 0 || atk.hp <= 0) return; // Strict safety check
          atk.status = 'attacking'; def.status = 'damaged';
          const mult = def.types.reduce((acc, t) => acc * getMult(atk.types[0], t), 1);
          if (mult > 1) txt = "Super Effective!"; else if (mult < 1 && mult > 0) txt = "Not very effective..."; else if (mult === 0) txt = "No effect!"; else txt = "";
          
          const isSp = atk.stats.spAtk > atk.stats.attack;
          // Math.max(1, ...) ensures even immunities or highly defensive targets take at least 1 damage, preventing infinite loops
          const dmg = Math.max(1, (((isSp ? atk.stats.spAtk : atk.stats.attack) - ((isSp ? def.stats.spDef : def.stats.defense) * 0.4)) * mult) | 0);
          
          def.hp = Math.max(0, def.hp - dmg); def.lastDamageTaken = dmg;
        };

        if (p1.stats.speed >= e1.stats.speed) { applyDmg(p1, e1); if (e1.hp > 0) applyDmg(e1, p1); } 
        else { applyDmg(e1, p1); if (p1.hp > 0) applyDmg(p1, e1); }

        set({ playerTeam: pTeam, enemyTeam: eTeam, combatText: txt });
        await new Promise(r => setTimeout(r, 800 * speedMult));
        if (!get().isBattling) return; 

        if (eTeam.every(e => e.hp <= 0)) {
          const curReg = state.currentRegion || 'Kanto';
          const updatedHigh = Math.max(state.highScores?.[curReg] || 1, state.stage);
          const newHighScores = { ...state.highScores, [curReg]: updatedHigh };

          if (state.stage === MAX_STAGE) { 
            const nextCleared = [...state.clearedRegions];
            if (state.currentRegion && !nextCleared.includes(state.currentRegion)) nextCleared.push(state.currentRegion);
            set({ isBattling: false, isGameOver: true, clearedRegions: nextCleared, highScores: newHighScores }); 
            return; 
          }
          const goldReward = 5 + state.stage; 
          const nextStage = state.stage + 1;
          const nextShop = state.shopFrozen ? state.shopItems : generateShop(nextStage, pTeam);
          set(s => ({ 
            enemyTeam: generateEnemies(nextStage), 
            playerTeam: pTeam.map(p => ({ ...p, hp: p.maxHp, status: 'idle', lastDamageTaken: null })), 
            shopItems: nextShop, gold: s.gold + goldReward, stage: nextStage, isBattling: false, combatText: "", shopFrozen: false,
            highScores: { ...s.highScores, [curReg]: Math.max(s.highScores?.[curReg] || 1, nextStage) }
          }));
        } else if (pTeam.every(p => p.hp <= 0)) {
          set({ isBattling: false, isGameOver: true });
        }
      },

      buyPokemon: (index) => set((s) => {
        const base = s.shopItems[index]; if (!base) return s;
        const cost = getCost(base.tier) * base.copies; if (s.gold < cost) return s; 
        
        const existing = s.playerTeam.find(p => p.baseId === base.baseId);
        const newShop = [...s.shopItems]; newShop[index] = null;
        const maxCopies = getMaxCopies(base.baseId);

        if (existing) {
          if (existing.copies >= maxCopies) return s; 
          const pTeam = s.playerTeam.map(p => {
            if (p.id === existing.id) {
              const copies = Math.min(maxCopies, p.copies + base.copies);
              let star = 1;
              let dexId = p.baseId;
              const is3Stage = THREE_STAGE_BASE_IDS.has(p.baseId);
              const isSingle = SINGLE_STAGE_BASE_IDS.has(p.baseId);
              const evos = getEvo(p.baseId, 1);

              if (is3Stage) {
                if (copies >= 6) { star = 3; dexId = evos[1]; }
                else if (copies >= 3) { star = 2; dexId = evos[0]; }
              } else if (isSingle) {
                if (copies >= 3) { star = 3; }
                else if (copies >= 2) { star = 2; }
              } else {
                if (copies >= 3) { star = 3; dexId = evos[0]; }
              }
              
              const isShiny = p.isShiny || base.isShiny; 
              get().registerPokedex(dexId, isShiny);

              const baseDb = POKEMON_DB.find(b => b.baseId === p.baseId)!;
              const scale = star === 3 ? 2.8 : star === 2 ? 1.5 : 1;
              
              return { 
                ...p, copies, star, pokedexId: dexId, name: NAMES[dexId] || p.name, isShiny, 
                maxHp: Math.floor(baseDb.hp * scale), hp: Math.floor(baseDb.hp * scale), 
                stats: { 
                  attack: Math.floor(baseDb.stats.attack * scale), defense: Math.floor(baseDb.stats.defense * scale), 
                  spAtk: Math.floor(baseDb.stats.spAtk * scale), spDef: Math.floor(baseDb.stats.spDef * scale), 
                  speed: Math.floor(baseDb.stats.speed * scale) 
                } 
              };
            }
            return p;
          });
          return { gold: s.gold - cost, shopItems: newShop, playerTeam: pTeam };
        }

        if (s.playerTeam.length >= 6) return s;
        get().registerPokedex(base.pokedexId, base.isShiny);
        const position = [0,1,2,3,4,5].find(i => !s.playerTeam.some(p => p.position === i)) ?? 0;
        return { gold: s.gold - cost, shopItems: newShop, playerTeam: [...s.playerTeam, { ...base, id: Date.now().toString(), position, status: 'idle' }] };
      })
    }),
    {
      name: 'kanto-expeditions-storage',
      partialize: (state) => ({ pokedex: state.pokedex, highScores: state.highScores, clearedRegions: state.clearedRegions, isFastForwarding: state.isFastForwarding })
    }
  )
);

export const getSpriteUrl = (id: number, isShiny: boolean = false, animated: boolean = true) => {
  if (animated) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${isShiny ? 'shiny/' : ''}${id}.gif`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? 'shiny/' : ''}${id}.png`;
};
