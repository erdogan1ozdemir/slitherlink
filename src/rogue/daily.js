// src/rogue/daily.js — Daily challenge: bugünün tohumu + local leaderboard (son 7 gün)

const LB_KEY="cember:daily:leaderboard";

/** Bugünün tohumu — UTC tabanlı, deterministik. */
export function todaySeed(){
  const d=new Date();
  const y=d.getUTCFullYear();
  const m=(d.getUTCMonth()+1).toString().padStart(2,"0");
  const day=d.getUTCDate().toString().padStart(2,"0");
  return `daily-${y}-${m}-${day}`;
}

/** Bugünün tarih string'i (YYYY-MM-DD). */
export function todayDate(){return todaySeed().slice(6);}

/** Bugün oynandı mı? */
export function hasPlayedToday(store){
  const lb=store.get(LB_KEY,{entries:[]});
  if(!lb||!lb.entries)return false;
  return !!lb.entries.find(e=>e.date===todayDate());
}

/** Sonucu kaydet — aynı tarih varsa üzerine yazar, son 7 günü tutar. */
export function recordResult(store,{date,time,solves,realmId,success}){
  let lb=store.get(LB_KEY,{entries:[]});
  if(!lb||!lb.entries)lb={entries:[]};
  // Replace if same date
  lb.entries=lb.entries.filter(e=>e.date!==date);
  lb.entries.push({date,time,solves,realmId,success,recordedAt:Date.now()});
  // Son 7 günü tut (en yeni başta)
  lb.entries=lb.entries.sort((a,b)=>a.date<b.date?1:-1).slice(0,7);
  store.set(LB_KEY,lb);
  return lb;
}

/** Leaderboard döndür. */
export function getLeaderboard(store){
  return store.get(LB_KEY,{entries:[]});
}
