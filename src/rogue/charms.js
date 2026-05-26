// src/rogue/charms.js — Boncuk Dizimi (Hollow Knight Charms)

export const CHARMS={
  "sogut-yapragi-charm":{
    id:"sogut-yapragi-charm",
    name:"Söğüt Yaprağı",
    glyph:"❦",
    desc:"Koşu başında +1 hint.",
    cost:3, // bead
    effect:{type:"bonus-hint",amount:1},
  },
  "yun-yumagi":{
    id:"yun-yumagi",
    name:"Yün Yumağı",
    glyph:"●",
    desc:"Rest düğümlerinde +1 ekstra can.",
    cost:5,
    effect:{type:"rest-bonus-heal",amount:1},
  },
  "kelebek-kanadi":{
    id:"kelebek-kanadi",
    name:"Kelebek Kanadı",
    glyph:"✿",
    desc:"Event'lerde +1 seçenek.",
    cost:5,
    effect:{type:"event-extra-choice",amount:1},
  },
  "ay-muhru-charm":{
    id:"ay-muhru-charm",
    name:"Ay Mührü",
    glyph:"☾",
    desc:"Koşuda 1 ekstra geri al hakkı.",
    cost:7,
    effect:{type:"bonus-undo",amount:1},
  },
  "gece-pusulasi-charm":{
    id:"gece-pusulasi-charm",
    name:"Gece Pusulası",
    glyph:"✧",
    desc:"Koşu başında harita önceden görünür.",
    cost:8,
    effect:{type:"map-preview"},
  },
  "pati-izi":{
    id:"pati-izi",
    name:"Pati İzi",
    glyph:"❀",
    desc:"Visited node'lardan +1 iplik.",
    cost:4,
    effect:{type:"visited-thread",amount:1},
  },
};

export function getCharm(id){return CHARMS[id];}
export function isUnlocked(meta,id){return !!(meta?.charms?.unlocked||[]).includes(id);}
export function isEquipped(meta,id){return !!(meta?.charms?.equipped||[]).includes(id);}
export function canAfford(meta,id){const c=CHARMS[id];return c&&meta.currencies.bead>=c.cost;}
export function purchase(meta,id){
  const c=CHARMS[id];
  if(!c||isUnlocked(meta,id)||!canAfford(meta,id))return false;
  if(!meta.charms)meta.charms={unlocked:[],equipped:[]};
  if(!meta.charms.unlocked)meta.charms.unlocked=[];
  meta.charms.unlocked.push(id);
  meta.currencies.bead-=c.cost;
  return true;
}
export function equip(meta,id,maxSlots=3){
  if(!isUnlocked(meta,id))return false;
  if(!meta.charms)meta.charms={unlocked:[],equipped:[]};
  if(!meta.charms.equipped)meta.charms.equipped=[];
  if(meta.charms.equipped.includes(id))return false;
  if(meta.charms.equipped.length>=maxSlots)return false;
  meta.charms.equipped.push(id);
  return true;
}
export function unequip(meta,id){
  if(!meta.charms||!meta.charms.equipped)return false;
  meta.charms.equipped=meta.charms.equipped.filter(c=>c!==id);
  return true;
}

export function aggregateEffects(meta){
  const eff={bonusHint:0,restBonusHeal:0,eventExtraChoice:0,bonusUndo:0,mapPreview:false,visitedThread:0};
  const equipped=meta?.charms?.equipped||[];
  for(const id of equipped){
    const c=CHARMS[id];
    if(!c)continue;
    const e=c.effect;
    if(e.type==="bonus-hint")eff.bonusHint+=e.amount;
    else if(e.type==="rest-bonus-heal")eff.restBonusHeal+=e.amount;
    else if(e.type==="event-extra-choice")eff.eventExtraChoice+=e.amount;
    else if(e.type==="bonus-undo")eff.bonusUndo+=e.amount;
    else if(e.type==="map-preview")eff.mapPreview=true;
    else if(e.type==="visited-thread")eff.visitedThread+=e.amount;
  }
  return eff;
}
