// src/rogue/keepsakes.js — Hediye Boncukları (achievement-locked collectibles)

export const KEEPSAKES={
  "akşam-isigi":{id:"akşam-isigi",name:"Akşam Tüyü",desc:"Söğüt Eşiği'nde ilk geçişin anısı.",achievement:"aksam-isigi"},
  "sessiz-gecit":{id:"sessiz-gecit",name:"Mürekkep Damlası",desc:"Karanlık İğne'den.",achievement:"sessiz-gecit"},
  "yildiz-ipligi":{id:"yildiz-ipligi",name:"Yıldız Kumaşı",desc:"Yıldız Geçidi'nden.",achievement:"yildiz-ipligi"},
  "uc-diyar":{id:"uc-diyar",name:"Üç Yolun Birleşimi",desc:"Üç diyarı da geçtin.",achievement:"uc-diyar"},
  "uc-patron":{id:"uc-patron",name:"Üç Sessizlik",desc:"Üç patronu yendin.",achievement:"uc-patron"},
  "sessiz-dost":{id:"sessiz-dost",name:"Pati Tüyü",desc:"7 günlük yoldaş.",achievement:"sessiz-dost"},
  "ev-sahibi":{id:"ev-sahibi",name:"Yuva Mührü",desc:"Yuva'na bir armağan koydun.",achievement:"ev-sahibi"},
  "yedinci-yıldız":{id:"yedinci-yıldız",name:"Yedinci Yıldız",desc:"Düğümün Ardı'nı geçtin.",achievement:"dugumun-ardi-cleared"},
};

export function getKeepsake(id){return KEEPSAKES[id];}

export function allUnlockedKeepsakes(meta){
  if(!meta||!meta.achievements)return [];
  return Object.values(KEEPSAKES).filter(k=>meta.achievements[k.achievement]);
}

/** Called after any achievement unlock — adds keepsakes to discovered list. Mutates meta. */
export function checkAutoUnlock(meta){
  if(!meta)return;
  if(!meta.keepsakes)meta.keepsakes={discovered:[]};
  if(!meta.keepsakes.discovered)meta.keepsakes.discovered=[];
  if(!meta.achievements)meta.achievements={};
  for(const k of Object.values(KEEPSAKES)){
    if(meta.achievements[k.achievement]&&!meta.keepsakes.discovered.includes(k.id)){
      meta.keepsakes.discovered.push(k.id);
    }
  }
}
