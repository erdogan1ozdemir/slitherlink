// src/rogue/neow.js — Yuva Fısıltısı (Slay the Spire Neow)

export const NEOW_BLESSINGS=[
  {id:"tok-karin",name:"Tok Karın",desc:"+1 başlangıç canı.",effect:{type:"bonus-life",amount:1}},
  {id:"ac-tilki",name:"Aç Tilki",desc:"-1 can ama relic'ler 1 tier yüksek.",effect:{type:"trade",cost:{life:1},gain:{relicTier:1}}},
  {id:"sut-tabagi",name:"Süt Tabağı",desc:"Koşu içi iplik 2x.",effect:{type:"thread-mult",amount:2}},
  {id:"sakli-hediye",name:"Saklı Hediye",desc:"Bir gizli sandık.",effect:{type:"bonus-chest",amount:1}},
  {id:"yun-aksami",name:"Yün Akşamı",desc:"Rest düğümlerinde +1 ekstra can.",effect:{type:"rest-bonus-heal",amount:1}},
  {id:"yildiz-eseri",name:"Yıldız Eseri",desc:"İlk relic kesin nadir.",effect:{type:"first-relic-rare"}},
  {id:"sessiz-baslangic",name:"Sessiz Başlangıç",desc:"+3 iplik.",effect:{type:"thread",amount:3}},
  {id:"siyah-yün",name:"Siyah Yün",desc:"Patron savaşında +1 can buffer.",effect:{type:"boss-life-buffer",amount:1}},
];

export function rollBlessings(rng,count=3){
  const shuffled=NEOW_BLESSINGS.slice();
  for(let i=shuffled.length-1;i>0;i--){
    const j=(rng()*(i+1))|0;
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  return shuffled.slice(0,count);
}

export function applyBlessing(run,meta,blessing){
  const e=blessing.effect;
  if(!e)return;
  if(e.type==="bonus-life"){run.lives.max+=e.amount;run.lives.current+=e.amount;}
  else if(e.type==="trade"){
    run.lives.max=Math.max(1,run.lives.max-e.cost.life);
    run.lives.current=Math.max(1,run.lives.current-e.cost.life);
    run.relicTierBonus=(run.relicTierBonus||0)+(e.gain.relicTier||0);
  }
  else if(e.type==="thread-mult")run.threadMultiplier=(run.threadMultiplier||1)*e.amount;
  else if(e.type==="bonus-chest")run.bonusChests=(run.bonusChests||0)+e.amount;
  else if(e.type==="rest-bonus-heal")run.restBonusHeal=(run.restBonusHeal||0)+e.amount;
  else if(e.type==="first-relic-rare")run.firstRelicRare=true;
  else if(e.type==="thread")meta.currencies.thread=(meta.currencies.thread||0)+e.amount;
  else if(e.type==="boss-life-buffer")run.bossLifeBuffer=(run.bossLifeBuffer||0)+e.amount;
  run.neowBlessing=blessing.id;
}
