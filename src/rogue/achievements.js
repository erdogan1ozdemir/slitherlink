// src/rogue/achievements.js — Achievement registry + engine

export const ACHIEVEMENTS={
  "aksam-isigi":{
    id:"aksam-isigi",
    realm:"sogut-esigi",
    title:"Akşam Işığı",
    body:"Söğüt Eşiği'ni ilk kez geçtin.",
    diary:"Akşam ışığı düştü. Yün Bekçisi başını öne eğdi, geçtin. Bir kapı açıldı.",
    trigger:"realm_cleared:sogut-esigi",
    secret:false,
  },
  "yun-bekcinin-selami":{
    id:"yun-bekcinin-selami",
    realm:"sogut-esigi",
    title:"Yün Bekçisinin Selamı",
    body:"Yün Bekçisi'ni yendin.",
    diary:"Yün Bekçisi sessizce başını eğdi. İpliği selamladı.",
    trigger:"boss_defeated:sogut-esigi",
    secret:false,
  },
  "tek-soluk":{
    id:"tek-soluk",
    realm:"sogut-esigi",
    title:"Tek Soluk",
    body:"Söğüt Eşiği'ni hiç ipucu kullanmadan geçtin.",
    diary:"Hiç fısıltı duymadın. Yalnız ipliğin sesi vardı.",
    trigger:"no_hint_clear:sogut-esigi",
    secret:false,
  },
  "cayiri-tani":{
    id:"cayiri-tani",
    realm:"sogut-esigi",
    title:"Çayırı Tanı",
    body:"Tek koşuda Söğüt Eşiği'nin tüm relic'lerini gördün.",
    diary:"Çayırın her ucunu öğrendin. Bahçıvan başını salladı.",
    trigger:"all_relics_seen_in_run:sogut-esigi",
    secret:false,
  },
  "yagmur-sonrasi":{
    id:"yagmur-sonrasi",
    realm:"sogut-esigi",
    title:"Yağmur Sonrası",
    body:"Yağmur olayında sığındın ve koşuyu tamamladın.",
    diary:"Yağmur dindi, çayır parladı. Tek bir damla bile boş düşmedi.",
    trigger:"event_chain:sogut-esigi:yagmur-shelter-and-clear",
    secret:false,
  },
};

/** Engine — emit/check pattern.
 *  Trigger string formats:
 *   - realm_cleared:<id>
 *   - boss_defeated:<id>
 *   - no_hint_clear:<id>
 *   - all_relics_seen_in_run:<id>
 *   - event_chain:<id>:<chainId>
 */
export function emit(triggerId, meta, onUnlock){
  if(meta.achievements[triggerId])return false; // not the achievement id but trigger
  for(const ach of Object.values(ACHIEVEMENTS)){
    if(ach.trigger!==triggerId)continue;
    if(meta.achievements[ach.id])continue;
    meta.achievements[ach.id]={unlockedAt:Date.now()};
    meta.jediDiary.unshift({achievementId:ach.id,unlockedAt:Date.now(),text:ach.diary});
    if(onUnlock)onUnlock(ach);
    return ach;
  }
  return false;
}

export function getAchievement(id){return ACHIEVEMENTS[id];}
export function unlockedCount(meta){return Object.keys(meta.achievements||{}).length;}
export function totalCount(){return Object.keys(ACHIEVEMENTS).length;}
