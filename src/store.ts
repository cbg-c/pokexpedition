import { create } from 'zustand';

export type BaseStats = { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number; };
export type Pokemon = { id: string; baseId: number; pokedexId: number; name: string; type: string; tier: number; stats: BaseStats; hp: number; maxHp: number; position: number; status: 'idle' | 'attacking' | 'damaged'; copies: number; star: number; lastDamageTaken?: number | null; };

const RAW_DEX: (string | number)[][] = [
  [1,'Bulbasaur','grass',1,45,49,49,65,65,45],[2,'Ivysaur','grass',2,60,62,63,80,80,60],[3,'Venusaur','grass',3,80,82,83,100,100,80],
  [4,'Charmander','fire',1,39,52,43,60,50,65],[5,'Charmeleon','fire',2,58,64,58,80,65,80],[6,'Charizard','fire',3,78,84,78,109,85,100],
  [7,'Squirtle','water',1,44,48,65,50,64,43],[8,'Wartortle','water',2,59,63,80,65,80,58],[9,'Blastoise','water',3,79,83,100,85,105,78],
  [10,'Caterpie','bug',1,45,30,35,20,20,45],[11,'Metapod','bug',1,50,20,55,25,25,30],[12,'Butterfree','bug',2,60,45,50,90,80,70],
  [13,'Weedle','bug',1,40,35,30,20,20,50],[14,'Kakuna','bug',1,45,25,50,25,25,35],[15,'Beedrill','bug',2,65,90,40,45,80,75],
  [16,'Pidgey','normal',1,40,45,40,35,35,56],[17,'Pidgeotto','normal',2,63,60,55,50,50,71],[18,'Pidgeot','normal',3,83,80,75,70,70,101],
  [19,'Rattata','normal',1,30,56,35,25,35,72],[20,'Raticate','normal',2,55,81,60,50,70,97],
  [21,'Spearow','normal',1,40,60,30,31,31,70],[22,'Fearow','normal',2,65,90,65,61,61,100],
  [23,'Ekans','poison',1,35,60,44,40,54,55],[24,'Arbok','poison',2,60,85,69,65,79,80],
  [25,'Pikachu','electric',1,35,55,40,50,50,90],[26,'Raichu','electric',3,60,90,55,90,80,110],
  [27,'Sandshrew','ground',1,50,75,85,20,30,40],[28,'Sandslash','ground',2,75,100,110,45,55,65],
  [29,'Nidoran F','poison',1,55,47,52,40,40,41],[30,'Nidorina','poison',2,70,62,67,55,55,56],[31,'Nidoqueen','poison',3,90,92,87,75,85,76],
  [32,'Nidoran M','poison',1,46,57,40,40,40,50],[33,'Nidorino','poison',2,61,72,57,55,55,65],[34,'Nidoking','poison',3,81,102,77,85,75,85],
  [35,'Clefairy','fairy',1,55,45,48,60,65,35],[36,'Clefable','fairy',3,95,70,73,95,90,60],
  [37,'Vulpix','fire',1,38,41,40,50,65,65],[38,'Ninetales','fire',3,73,76,75,81,100,100],
  [39,'Jigglypuff','fairy',1,115,45,20,45,25,20],[40,'Wigglytuff','fairy',2,140,70,45,85,50,45],
  [41,'Zubat','poison',1,40,45,35,30,40,55],[42,'Golbat','poison',2,75,80,70,65,75,90],
  [43,'Oddish','grass',1,45,50,55,75,65,30],[44,'Gloom','grass',2,60,65,70,85,75,40],[45,'Vileplume','grass',3,75,80,85,110,90,50],
  [46,'Paras','bug',1,35,70,55,45,55,25],[47,'Parasect','bug',2,60,95,80,60,80,30],
  [48,'Venonat','bug',1,60,55,50,40,55,45],[49,'Venomoth','bug',2,70,65,60,90,75,90],
  [50,'Diglett','ground',1,10,55,25,35,45,95],[51,'Dugtrio','ground',2,35,100,50,50,70,120],
  [52,'Meowth','normal',1,40,45,35,40,40,90],[53,'Persian','normal',2,65,70,60,65,65,115],
  [54,'Psyduck','water',1,50,52,48,65,50,55],[55,'Golduck','water',2,80,82,78,95,80,85],
  [56,'Mankey','fighting',1,40,80,35,35,45,70],[57,'Primeape','fighting',2,65,105,60,60,70,95],
  [58,'Growlithe','fire',1,55,70,45,70,50,60],[59,'Arcanine','fire',3,90,110,80,100,80,95],
  [60,'Poliwag','water',1,40,50,40,40,40,90],[61,'Poliwhirl','water',2,65,65,65,50,50,90],[62,'Poliwrath','water',3,90,95,95,70,90,70],
  [63,'Abra','psychic',1,25,20,15,105,55,90],[64,'Kadabra','psychic',2,40,35,30,120,70,105],[65,'Alakazam','psychic',3,55,50,45,135,95,120],
  [66,'Machop','fighting',1,70,80,50,35,35,35],[67,'Machoke','fighting',2,80,100,70,50,60,45],[68,'Machamp','fighting',3,90,130,80,65,85,55],
  [69,'Bellsprout','grass',1,50,75,35,70,30,40],[70,'Weepinbell','grass',2,65,90,50,85,45,55],[71,'Victreebel','grass',3,80,105,65,100,70,70],
  [72,'Tentacool','water',1,40,40,35,50,100,70],[73,'Tentacruel','water',2,80,70,65,80,120,100],
  [74,'Geodude','rock',1,40,80,100,30,30,20],[75,'Graveler','rock',2,55,95,115,45,45,35],[76,'Golem','rock',3,80,120,130,55,65,45],
  [77,'Ponyta','fire',1,50,85,55,65,65,90],[78,'Rapidash','fire',2,65,100,70,80,80,105],
  [79,'Slowpoke','water',1,90,65,65,40,40,15],[80,'Slowbro','water',3,95,75,110,100,80,30],
  [81,'Magnemite','electric',1,25,35,70,95,55,45],[82,'Magneton','electric',2,50,60,95,120,70,70],
  [83,'Farfetchd','normal',1,52,90,55,58,62,60],
  [84,'Doduo','normal',1,35,85,45,35,35,75],[85,'Dodrio','normal',2,60,110,70,60,60,110],
  [86,'Seel','water',1,65,45,55,45,70,45],[87,'Dewgong','water',2,90,70,80,70,95,70],
  [88,'Grimer','poison',1,80,80,50,40,50,25],[89,'Muk','poison',2,105,105,75,65,100,50],
  [90,'Shellder','water',1,30,65,100,45,25,40],[91,'Cloyster','water',3,50,95,180,85,45,70],
  [92,'Gastly','ghost',1,30,35,30,100,35,80],[93,'Haunter','ghost',2,45,50,45,115,55,95],[94,'Gengar','ghost',3,60,65,60,130,75,110],
  [95,'Onix','rock',1,35,45,160,30,45,70],
  [96,'Drowzee','psychic',1,60,48,45,43,90,42],[97,'Hypno','psychic',2,85,73,70,73,115,67],
  [98,'Krabby','water',1,30,105,90,25,25,50],[99,'Kingler','water',2,55,130,115,50,50,75],
  [100,'Voltorb','electric',1,40,30,50,55,55,100],[101,'Electrode','electric',2,60,50,70,80,80,150],
  [102,'Exeggcute','grass',1,60,40,80,60,45,40],[103,'Exeggutor','grass',3,95,95,85,125,75,55],
  [104,'Cubone','ground',1,50,50,95,40,50,35],[105,'Marowak','ground',2,60,80,110,50,80,45],
  [106,'Hitmonlee','fighting',2,50,120,53,35,110,87],[107,'Hitmonchan','fighting',2,50,105,79,35,110,76],
  [108,'Lickitung','normal',1,90,55,75,60,75,30],
  [109,'Koffing','poison',1,40,65,95,60,45,35],[110,'Weezing','poison',2,65,90,120,85,70,60],
  [111,'Rhyhorn','ground',1,80,85,95,30,30,25],[112,'Rhydon','ground',3,105,130,120,45,45,40],
  [113,'Chansey','normal',2,250,5,5,35,105,50],
  [114,'Tangela','grass',1,65,55,115,100,40,60],
  [115,'Kangaskhan','normal',3,105,95,80,40,80,90],
  [116,'Horsea','water',1,30,40,70,70,25,60],[117,'Seadra','water',2,55,65,95,95,45,85],
  [118,'Goldeen','water',1,45,67,60,35,50,63],[119,'Seaking','water',2,80,92,65,65,80,68],
  [120,'Staryu','water',1,30,45,55,70,55,85],[121,'Starmie','water',3,60,75,85,100,85,115],
  [122,'Mr. Mime','psychic',2,40,45,65,100,120,90],
  [123,'Scyther','bug',2,70,110,80,55,80,105],
  [124,'Jynx','psychic',2,65,50,35,115,95,95],
  [125,'Electabuzz','electric',2,65,83,57,95,85,105],
  [126,'Magmar','fire',2,65,95,57,100,85,93],
  [127,'Pinsir','bug',2,65,125,100,55,70,85],
  [128,'Tauros','normal',3,75,100,95,40,70,110],
  [129,'Magikarp','water',1,20,10,55,15,20,80],[130,'Gyarados','water',3,95,125,79,60,100,81],
  [131,'Lapras','water',3,130,85,80,85,95,60],
  [132,'Ditto','normal',1,48,48,48,48,48,48],
  [133,'Eevee','normal',1,55,55,50,45,65,55],[134,'Vaporeon','water',3,130,65,60,110,95,65],[135,'Jolteon','electric',3,65,65,60,110,95,130],[136,'Flareon','fire',3,65,130,60,95,110,65],
  [137,'Porygon','normal',1,65,60,70,85,75,40],
  [138,'Omanyte','rock',1,35,40,100,90,55,35],[139,'Omastar','rock',2,70,60,125,115,70,55],
  [140,'Kabuto','rock',1,30,80,90,55,45,55],[141,'Kabutops','rock',2,60,115,105,65,70,80],
  [142,'Aerodactyl','rock',3,80,105,65,60,75,130],
  [143,'Snorlax','normal',4,160,110,65,65,110,30],
  [144,'Articuno','water',4,90,85,100,95,125,85],
  [145,'Zapdos','electric',4,90,90,85,125,90,100],
  [146,'Moltres','fire',4,90,100,90,125,85,90],
  [147,'Dratini','dragon',1,41,64,45,50,50,50],[148,'Dragonair','dragon',2,61,84,65,70,70,70],[149,'Dragonite','dragon',4,91,134,95,100,100,80],
  [150,'Mewtwo','psychic',4,106,110,90,154,90,130],
  [151,'Mew','psychic',4,100,100,100,100,100,100]
];

export const POKEMON_DB: Pokemon[] = RAW_DEX.map(p => ({ id: p[0].toString(), baseId: p[0] as number, pokedexId: p[0] as number, name: p[1] as string, type: p[2] as string, tier: p[3] as number, stats: { hp: p[4] as number, attack: p[5] as number, defense: p[6] as number, spAtk: p[7] as number, spDef: p[8] as number, speed: p[9] as number }, hp: p[4] as number, maxHp: p[4] as number, position: 0, status: 'idle', copies: 1, star: 1 }));

const NAMES: Record<number, string> = {}; POKEMON_DB.forEach(p => NAMES[p.baseId] = p.name);

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

const TYPES: Record<string, Record<string, number>> = {
  fire: { grass: 2, water: 0.5, fire: 0.5, dragon: 0.5, rock: 0.5, bug: 2 }, water: { fire: 2, grass: 0.5, water: 0.5, dragon: 0.5, rock: 2, ground: 2 },
  grass: { water: 2, fire: 0.5, grass: 0.5, dragon: 0.5, ground: 2, rock: 2, bug: 0.5, poison: 0.5 }, psychic: { psychic: 0.5, fighting: 2, poison: 2 }, 
  ghost: { psychic: 2, ghost: 2, normal: 0 }, normal: { ghost: 0, rock: 0.5 }, dragon: { dragon: 2 }, electric: { water: 2, ground: 0, grass: 0.5, dragon: 0.5 },
  ground: { fire: 2, electric: 2, grass: 0.5, bug: 0.5, rock: 2, poison: 2 }, rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5 },
  bug: { grass: 2, psychic: 2, fire: 0.5, fighting: 0.5, flying: 0.5, ghost: 0.5 }, poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5 },
  fighting: { normal: 2, rock: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, ghost: 0 }
};
const getMult = (a: string, d: string) => TYPES[a]?.[d] ?? 1;
export const getCost = (tier: number) => tier === 4 ? 12 : tier === 3 ? 8 : tier === 2 ? 5 : 3;

const MAX_STAGE = 20;

// TFT Odds: Generates shop, heavily weighting Pokémon you already own
const generateShop = (stage: number, currentTeam: Pokemon[] = []) => Array.from({ length: 5 }, () => {
  const pool = POKEMON_DB.filter(p => p.tier <= (stage >= 10 ? 4 : stage >= 5 ? 3 : stage >= 2 ? 2 : 1) && p.baseId !== 150 && p.baseId !== 151);
  if (stage >= 15 && Math.random() > 0.95) return POKEMON_DB.find(p => p.baseId === 150)!; 

  const teamBaseIds = new Set(currentTeam.map(p => p.baseId));
  // Add 4 extra entries into the raffle for any Pokemon currently on your team
  const biasedPool = pool.flatMap(p => teamBaseIds.has(p.baseId) ? [p, p, p, p, p] : [p]);
  
  return biasedPool[Math.floor(Math.random() * biasedPool.length)];
});

// Enemies do NOT get the biased pool
const generateEnemies = (stage: number) => {
  if (stage === MAX_STAGE) return [{ ...POKEMON_DB.find(p=>p.baseId===150)!, id: 'boss', hp: 800, maxHp: 800, position: 0, status: 'idle' as const, copies: 9, star: 3 }];
  return Array.from({ length: Math.min(6, Math.ceil(stage / 3)) }, (_, i) => {
    const base = generateShop(stage, [])[0]; 
    const isStage2 = stage > 5 && Math.random() > 0.5;
    const dexId = isStage2 ? getEvo(base.baseId, 1)[0] : base.baseId;
    const scale = isStage2 ? 1.5 : 1 + (stage * 0.1);
    const scaledHp = Math.floor(base.stats.hp * scale);
    return { ...base, pokedexId: dexId, name: NAMES[dexId] || base.name, stats: { ...base.stats, speed: Math.floor(base.stats.speed * scale) }, id: `e-${Date.now()}-${i}`, hp: scaledHp, maxHp: scaledHp, position: i, status: 'idle' as const, copies: isStage2 ? 3 : 1, star: isStage2 ? 2 : 1 };
  });
};

interface GameState {
  hasSelectedStarter: boolean; playerTeam: Pokemon[]; enemyTeam: Pokemon[]; shopItems: (Pokemon | null)[];
  gold: number; stage: number; isBattling: boolean; combatText: string;
  selectStarter: (id: number) => void; startBattle: () => void; gameTick: () => Promise<void>; refreshShop: () => void; buyPokemon: (i: number) => void; swapSlots: (i1: number, i2: number) => void; resetGame: () => void; sellPokemon: (pos: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  hasSelectedStarter: false, playerTeam: [], enemyTeam: generateEnemies(1), shopItems: generateShop(1, []), gold: 12, stage: 1, isBattling: false, combatText: "",

  selectStarter: (id) => set({
    hasSelectedStarter: true,
    playerTeam: [{ ...POKEMON_DB.find(p=>p.baseId===id)!, id: 'p1', position: 0, status: 'idle', copies: 1, star: 1 }],
    gold: 12,
    shopItems: generateShop(1, [{ ...POKEMON_DB.find(p=>p.baseId===id)!, id: 'p1', position: 0, status: 'idle', copies: 1, star: 1 } as Pokemon])
  }),

  resetGame: () => set({ hasSelectedStarter: false, playerTeam: [], enemyTeam: generateEnemies(1), shopItems: generateShop(1, []), gold: 12, stage: 1, isBattling: false, combatText: "" }),

  startBattle: () => set({ isBattling: true, combatText: "" }),
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
    const totalCost = getCost(p.tier) * p.copies;
    const sellValue = Math.max(1, Math.floor(totalCost * 0.7));
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
    await new Promise(r => setTimeout(r, 50));

    let txt = "";
    const applyDmg = (atk: Pokemon, def: Pokemon) => {
      atk.status = 'attacking'; def.status = 'damaged';
      const mult = getMult(atk.type, def.type);
      if (mult > 1) txt = "Super Effective!"; else if (mult < 1) txt = "Not very effective..."; else txt = "";
      const isSp = atk.stats.spAtk > atk.stats.attack;
      const dmg = Math.max(1, (((isSp ? atk.stats.spAtk : atk.stats.attack) - ((isSp ? def.stats.spDef : def.stats.defense) * 0.4)) * mult) | 0);
      def.hp = Math.max(0, def.hp - dmg); def.lastDamageTaken = dmg;
    };

    if (p1.stats.speed >= e1.stats.speed) { applyDmg(p1, e1); if (e1.hp > 0) applyDmg(e1, p1); } 
    else { applyDmg(e1, p1); if (p1.hp > 0) applyDmg(p1, e1); }

    set({ playerTeam: pTeam, enemyTeam: eTeam, combatText: txt });
    await new Promise(r => setTimeout(r, 800));

    if (eTeam.every(e => e.hp <= 0)) {
      if (state.stage === MAX_STAGE) { alert("🏆 CHAMPION DEFEATED!"); set({ isBattling: false }); return; }
      const goldReward = 5 + state.stage; 
      set(s => ({ enemyTeam: generateEnemies(s.stage + 1), playerTeam: pTeam.map(p => ({ ...p, hp: p.maxHp, status: 'idle', lastDamageTaken: null })), shopItems: generateShop(s.stage + 1, pTeam), gold: s.gold + goldReward, stage: s.stage + 1, isBattling: false, combatText: "" }));
    } else if (pTeam.every(p => p.hp <= 0)) {
      alert(`Run Lost to Stage ${state.stage}! Restarting...`); get().resetGame();
    }
  },

  buyPokemon: (index) => set((s) => {
    const base = s.shopItems[index]; if (!base) return s;
    const cost = getCost(base.tier); if (s.gold < cost) return s;
    
    const existing = s.playerTeam.find(p => p.baseId === base.baseId);
    const newShop = [...s.shopItems]; newShop[index] = null;

    if (existing) {
      if (existing.copies >= 9) return s; 
      const pTeam = s.playerTeam.map(p => {
        if (p.id === existing.id) {
          const copies = p.copies + 1;
          let star = p.star, dexId = p.pokedexId;
          const evos = getEvo(p.baseId, 1);
          if (copies >= 3 && copies < 9) { star = 2; dexId = evos[0]; } 
          if (copies >= 9) { star = 3; dexId = evos[1]; } 
          const scale = star === 3 ? 2.5 : star === 2 ? 1.5 : 1;
          return { ...p, copies, star, pokedexId: dexId, name: NAMES[dexId] || p.name, maxHp: Math.floor(base.stats.hp * scale), hp: Math.floor(base.stats.hp * scale), stats: { attack: Math.floor(base.stats.attack*scale), defense: Math.floor(base.stats.defense*scale), spAtk: Math.floor(base.stats.spAtk*scale), spDef: Math.floor(base.stats.spDef*scale), speed: Math.floor(base.stats.speed*scale) } };
        }
        return p;
      });
      return { gold: s.gold - cost, shopItems: newShop, playerTeam: pTeam };
    }

    if (s.playerTeam.length >= 6) return s;
    const position = [0,1,2,3,4,5].find(i => !s.playerTeam.some(p => p.position === i)) ?? 0;
    return { gold: s.gold - cost, shopItems: newShop, playerTeam: [...s.playerTeam, { ...base, id: Date.now().toString(), hp: base.stats.hp, maxHp: base.stats.hp, position, status: 'idle', copies: 1, star: 1 }] };
  })
}));

export const getSpriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
