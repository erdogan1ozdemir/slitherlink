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
  "sessiz-gecit":{
    id:"sessiz-gecit",
    realm:"karanlik-igne",
    title:"Sessiz Geçit",
    body:"Karanlık İğne'yi ilk kez geçtin.",
    diary:"Mürekkep durdu. Kütüphaneci bir sayfa daha çevirdi, hiç bakmadı sana.",
    trigger:"realm_cleared:karanlik-igne",
    secret:false,
  },
  "kutuphaneci-uyurken":{
    id:"kutuphaneci-uyurken",
    realm:"karanlik-igne",
    title:"Kütüphaneci Uyurken",
    body:"Sessiz Kütüphaneci'yi yendin.",
    diary:"Kitap kapandı. Bir tüy düştü. Geçtin.",
    trigger:"boss_defeated:karanlik-igne",
    secret:false,
  },
  "murekkep-lekesi-ach":{
    id:"murekkep-lekesi-ach",
    realm:"karanlik-igne",
    title:"Mürekkep Lekesi",
    body:"Karanlık İğne'de bronz anahtar bulup kilitli sandık açtın.",
    diary:"Mürekkep parmağında kaldı. Anahtarın izi sayfada hâlâ duruyor.",
    trigger:"locked_chest_opened:karanlik-igne",
    secret:false,
  },
  "sayfanin-sonu":{
    id:"sayfanin-sonu",
    realm:"karanlik-igne",
    title:"Sayfanın Sonu",
    body:"Karanlık İğne'yi 15 dakika altında bitirdin.",
    diary:"Sayfanın sonu hızlıca geldi. Kütüphaneci kafasını kaldıracak vakti bile bulamadı.",
    trigger:"speed_clear:karanlik-igne:900",
    secret:false,
  },
  "yedi-mum":{
    id:"yedi-mum",
    realm:"karanlik-igne",
    title:"Yedi Mum",
    body:"Karanlık İğne'de tüm elite düğümleri geçtin.",
    diary:"Yedi mum yandı, yedisi de söndü. Her birinde bir ad bıraktın.",
    trigger:"all_elites_cleared:karanlik-igne",
    secret:false,
  },
  "tozsuz-gecit":{
    id:"tozsuz-gecit",
    realm:"karanlik-igne",
    title:"Tozsuz Geçit",
    body:"Karanlık İğne'yi hiç ipucu kullanmadan geçtin.",
    diary:"Hiç fısıltıya kulak vermedin. Sayfalar kendi sırasını söyledi.",
    trigger:"no_hint_clear:karanlik-igne",
    secret:false,
  },
  "yildiz-ipligi":{
    id:"yildiz-ipligi",
    realm:"yildiz-gecidi",
    title:"Yıldız İpliği",
    body:"Yıldız Geçidi'ni ilk kez geçtin.",
    diary:"Yıldız ipliği seninle döndü. Geceyi geçirdin.",
    trigger:"realm_cleared:yildiz-gecidi",
    secret:false,
  },
  "gece-cobani":{
    id:"gece-cobani",
    realm:"yildiz-gecidi",
    title:"Gece Çobanı",
    body:"Yıldız İplikçisi'ni yendin.",
    diary:"Yıldız İplikçisi ipliğini bıraktı. Üç aşamayı da geçtin.",
    trigger:"boss_defeated:yildiz-gecidi",
    secret:false,
  },
  "dusten-uyanma":{
    id:"dusten-uyanma",
    realm:"yildiz-gecidi",
    title:"Düşten Uyanma",
    body:"Yıldız Geçidi'ni 2 candan az kalmadan bitirdin.",
    diary:"Hiç düşmedin. Gece seni hatırlayacak.",
    trigger:"clear_with_lives:yildiz-gecidi:2",
    secret:false,
  },
  "tum-yildizlar":{
    id:"tum-yildizlar",
    realm:"yildiz-gecidi",
    title:"Tüm Yıldızlar",
    body:"Yıldız Geçidi'nde tüm relic'leri gördün.",
    diary:"Altı yıldız da seninle döndü.",
    trigger:"all_relics_seen_in_run:yildiz-gecidi",
    secret:false,
  },
  "ay-saati":{
    id:"ay-saati",
    realm:"yildiz-gecidi",
    title:"Ay Saati",
    body:"Yıldız Geçidi'ni tek koşuda bitirdin (yarıda bırakmadan).",
    diary:"Saat doğru ayarlandı. Ay başı eğdi.",
    trigger:"single_session_clear:yildiz-gecidi",
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
