// src/rogue/realms.js — Realm registry; Plan 07 = sogut-esigi + stub

export const REALMS={
  "stub-diyar":{
    id:"stub-diyar",
    name:"Deneme Diyarı",
    intro:"Geçici test diyarı.",
    accent:"--accent",
    floors:3,
    floorConfig:[
      {sizes:[4,4],keep:0.85,nodes:["puzzle"]},
      {sizes:[5,5],keep:0.75,nodes:["puzzle","event"]},
      {sizes:[5,5],keep:0.70,nodes:["boss"]},
    ],
    relicPool:[],
    eventPool:[],
    bossName:"Deneme Bekçisi",
    unlockedByDefault:true,
  },
  "sogut-esigi":{
    id:"sogut-esigi",
    name:"Söğüt Eşiği",
    intro:"akşam ışığı, çayır, eski sandık. ilk macera.",
    accent:"--accent-warm",
    floors:5,
    floorConfig:[
      {sizes:[4,4],keep:0.85,nodes:["puzzle"],floorName:"Pervaz"},
      {sizes:[5,5],keep:0.80,nodes:["puzzle","event","chest"],floorName:"Çayır"},
      {sizes:[5,5],keep:0.75,nodes:["puzzle","chest","event"],floorName:"Söğüt Altı"},
      {sizes:[6,6],keep:0.72,nodes:["rest","puzzle"],floorName:"Eski Sandık"},
      {sizes:[6,6],keep:0.68,nodes:["boss"],floorName:"Akşam Işığı"},
    ],
    relicPool:["sogut-yapragi","kelebek-pulu","yun-tohumu","bahcivanin-eldiveni","aksam-mumu","ciyli-yun"],
    eventPool:["yagmur-basladi","kelebek-yolu","eski-sandik","bahcivanin-notu","aksam-cayi","cayir-kedisi"],
    bossName:"Yün Bekçisi",
    bossIntro:"sessiz, hata bağışlayıcı — ama tekrarlanan hata patrona güç verir.",
    unlockedByDefault:true,
  },
};

export function getRealm(id){return REALMS[id];}
export function isRealmUnlocked(id, meta){
  const r=REALMS[id];
  if(!r)return false;
  if(r.unlockedByDefault)return true;
  return !!(meta&&meta.realms&&meta.realms[id]&&meta.realms[id].unlocked);
}
