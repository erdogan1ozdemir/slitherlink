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
  "karanlik-igne":{
    id:"karanlik-igne",
    name:"Karanlık İğne",
    intro:"tozlu kütüphane, mürekkep, sayfa, fısıltılar.",
    accent:"--accent",
    floors:5,
    floorConfig:[
      {sizes:[5,5],keep:0.75,nodes:["puzzle"],floorName:"Eşik"},
      {sizes:[6,6],keep:0.72,nodes:["puzzle","event","locked-chest"],floorName:"Toz Koridoru"},
      {sizes:[6,6],keep:0.68,nodes:["elite","chest","event"],floorName:"Kayıp Sayfalar"},
      {sizes:[7,7],keep:0.65,nodes:["rest","locked-chest","event"],floorName:"Mürekkep Havuzu"},
      {sizes:[7,7],keep:0.60,nodes:["boss"],floorName:"Sessiz Kütüphaneci"},
    ],
    relicPool:["murekkep-damlasi","sayfa-kosesi","bronz-anahtar","tuy-kalem","eski-mum","murekkep-lekesi"],
    eventPool:["kutuphanecinin-uykusu","kayip-mektup","murekkep-kuyusu","bos-koltuk","anahtar-cingirgi","toz-patikasi"],
    bossName:"Sessiz Kütüphaneci",
    bossIntro:"uyandırırsan zaman daralır. ipucu sayısı +1 sayar.",
    unlockedByDefault:false,
  },
  "yildiz-gecidi":{
    id:"yildiz-gecidi",
    name:"Yıldız Geçidi",
    intro:"gece, yıldız, ay, rüya. epik final.",
    accent:"--accent-cool",
    floors:5,
    floorConfig:[
      {sizes:[6,6],keep:0.65,nodes:["puzzle"],floorName:"Buzlu Pencere"},
      {sizes:[7,7],keep:0.60,nodes:["elite","event","chest"],floorName:"Kuyruklu Yıldız"},
      {sizes:[7,7],keep:0.55,nodes:["puzzle","elite","event"],floorName:"Düş Eşiği"},
      {sizes:[8,8],keep:0.52,nodes:["rest","chest","event"],floorName:"Ay Saati"},
      {sizes:[9,9],keep:0.50,nodes:["boss"],floorName:"Yıldız İplikçisi"},
    ],
    relicPool:["yildiz-tozu","ay-muhru","gece-pusulasi","kuyruklu-yildiz","dus-ipligi","yildizsayar"],
    eventPool:["sonmus-yildiz","ay-seni-taniyor","dus-parcasi","kar-tanesi","buzlu-cam","gece-patikasi"],
    bossName:"Yıldız İplikçisi",
    bossIntro:"yıldızlar arası ipliği tek hatayla koparır. üç aşama.",
    unlockedByDefault:false,
    bossMultiStage:3,
  },
  "dugumun-ardi":{
    id:"dugumun-ardi",
    name:"Düğümün Ardı",
    intro:"üç diyardan da geçen ipliğin sonu.",
    accent:"--accent",
    floors:7,
    floorConfig:[
      {sizes:[7,7],keep:0.55,nodes:["puzzle"],floorName:"Eşik"},
      {sizes:[7,7],keep:0.52,nodes:["puzzle","event","chest"],floorName:"Hatıra"},
      {sizes:[8,8],keep:0.50,nodes:["elite","event","chest"],floorName:"Yankı"},
      {sizes:[8,8],keep:0.48,nodes:["puzzle","chest","event"],floorName:"Sis"},
      {sizes:[9,9],keep:0.45,nodes:["rest","elite","event"],floorName:"Düğüm"},
      {sizes:[9,9],keep:0.42,nodes:["chest","event","puzzle"],floorName:"İpliğin Sonu"},
      {sizes:[10,10],keep:0.40,nodes:["boss"],floorName:"Düğüm Ustası"},
    ],
    relicPool:[
      "sogut-yapragi","kelebek-pulu","yun-tohumu","bahcivanin-eldiveni","aksam-mumu","ciyli-yun",
      "murekkep-damlasi","sayfa-kosesi","bronz-anahtar","tuy-kalem","eski-mum","murekkep-lekesi",
      "yildiz-tozu","ay-muhru","gece-pusulasi","kuyruklu-yildiz","dus-ipligi","yildizsayar"
    ],
    eventPool:[
      "yagmur-basladi","kelebek-yolu","eski-sandik","bahcivanin-notu","aksam-cayi","cayir-kedisi",
      "kutuphanecinin-uykusu","kayip-mektup","murekkep-kuyusu","bos-koltuk","anahtar-cingirgi","toz-patikasi",
      "sonmus-yildiz","ay-seni-taniyor","dus-parcasi","kar-tanesi","buzlu-cam","gece-patikasi"
    ],
    bossName:"Düğüm Ustası",
    bossIntro:"tüm ipleri çözer ya da kopararak biter.",
    unlockedByDefault:false,
    requiresAllRealmsCleared:true,
  },
};

export function getRealm(id){return REALMS[id];}
export function isRealmUnlocked(id, meta){
  const r=REALMS[id];
  if(!r)return false;
  if(r.unlockedByDefault)return true;
  return !!(meta&&meta.realms&&meta.realms[id]&&meta.realms[id].unlocked);
}
