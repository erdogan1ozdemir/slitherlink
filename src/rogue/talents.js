// src/rogue/talents.js — İpliklik (Mirror of Night) — kalıcı pasifler

export const TALENTS={
  "dur-dengesi":{
    id:"dur-dengesi",
    name:"Dur Dengesi",
    desc:"Koşu başında +1 can.",
    cost:10,
    effect:{type:"bonus-life",amount:1},
  },
  "sezgi":{
    id:"sezgi",
    name:"Sezgi",
    desc:"İlk hint ücretsiz (zaman cezası yok).",
    cost:15,
    effect:{type:"first-hint-free"},
  },
  "yun-avantaji":{
    id:"yun-avantaji",
    name:"Yün Avantajı",
    desc:"Sandık'ta +1 seçenek (3 yerine 4).",
    cost:20,
    effect:{type:"chest-extra-offer",amount:1},
  },
  "sessiz-tabaka":{
    id:"sessiz-tabaka",
    name:"Sessiz Tabaka",
    desc:"Rest düğümlerinde +1 can yenilenir (toplam +2).",
    cost:25,
    effect:{type:"rest-bonus-heal",amount:1},
  },
  "sabir-pusulasi":{
    id:"sabir-pusulasi",
    name:"Sabır Pusulası",
    desc:"Koşu başında bir extra hint hakkı.",
    cost:30,
    effect:{type:"bonus-hint",amount:1},
  },
  "yildiz-olcusu":{
    id:"yildiz-olcusu",
    name:"Yıldız Ölçüsü",
    desc:"Boss yenince +5 ekstra iplik.",
    cost:40,
    effect:{type:"boss-bonus-thread",amount:5},
  },
};

export function getTalent(id){return TALENTS[id];}
export function isUnlocked(meta,id){return !!(meta?.loomHall?.unlockedTalents||[]).includes(id);}
export function canAfford(meta,id){const t=TALENTS[id];return t&&meta.currencies.thread>=t.cost;}
export function purchase(meta,id){
  const t=TALENTS[id];
  if(!t)return false;
  if(isUnlocked(meta,id))return false;
  if(!canAfford(meta,id))return false;
  if(!meta.loomHall)meta.loomHall={unlockedTalents:[],activeTalents:{}};
  if(!meta.loomHall.unlockedTalents)meta.loomHall.unlockedTalents=[];
  meta.loomHall.unlockedTalents.push(id);
  meta.currencies.thread-=t.cost;
  return true;
}

/** Compute aggregate effects from all unlocked talents — used at run start. */
export function aggregateEffects(meta){
  const eff={
    bonusLife:0,
    bonusHint:0,
    firstHintFree:false,
    chestExtraOffer:0,
    restBonusHeal:0,
    bossBonusThread:0,
  };
  const unlocked=meta?.loomHall?.unlockedTalents||[];
  for(const id of unlocked){
    const t=TALENTS[id];
    if(!t)continue;
    const e=t.effect;
    if(e.type==="bonus-life")eff.bonusLife+=e.amount;
    else if(e.type==="bonus-hint")eff.bonusHint+=e.amount;
    else if(e.type==="first-hint-free")eff.firstHintFree=true;
    else if(e.type==="chest-extra-offer")eff.chestExtraOffer+=e.amount;
    else if(e.type==="rest-bonus-heal")eff.restBonusHeal+=e.amount;
    else if(e.type==="boss-bonus-thread")eff.bossBonusThread+=e.amount;
  }
  return eff;
}
