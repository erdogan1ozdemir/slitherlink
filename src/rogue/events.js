// src/rogue/events.js — Event registry + choice resolution

export const EVENTS={
  "yagmur-basladi":{
    id:"yagmur-basladi",
    title:"Yağmur Başladı",
    text:"İnce bir yağmur düşüyor çayıra. Bir söğüt altına sığınmak yorgunluğu alır ama yol uzar.",
    choices:[
      {tone:"safe",text:"Sığın ve bekle",result:"+1 can",effect:{type:"heal",amount:1}},
      {tone:"risk",text:"Islak çayırı geç",result:"%50 ihtimal -1 can",effect:{type:"chance-damage",chance:0.5,amount:1}},
      {tone:"pass",text:"Görmezden gel",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"sogut-esigi",
  },
  "kelebek-yolu":{
    id:"kelebek-yolu",
    title:"Kelebek Yolu",
    text:"Bir kelebek senden önde uçuyor. Takip edersen ne göstereceğini bilmiyorsun.",
    choices:[
      {tone:"safe",text:"Takip et",result:"olası iplik bonusu",effect:{type:"thread",amount:3}},
      {tone:"pass",text:"Kendi yoluna git",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"sogut-esigi",
  },
  "eski-sandik":{
    id:"eski-sandik",
    title:"Eski Bir Sandık",
    text:"Çayırın kenarında küçük bir tahta sandık. Açmak biraz zorlama gerektirir.",
    choices:[
      {tone:"safe",text:"Aç",result:"rastgele relic",effect:{type:"relic-offer",count:1}},
      {tone:"pass",text:"Geç",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"sogut-esigi",
  },
  "bahcivanin-notu":{
    id:"bahcivanin-notu",
    title:"Bahçıvanın Notu",
    text:"Tahtaya çakılmış bir not: 'Söğüt yapraklarına dikkat.' Anlamını çözmen biraz zaman alır.",
    choices:[
      {tone:"safe",text:"Yapraklara dikkat et",result:"+2 iplik",effect:{type:"thread",amount:2}},
      {tone:"pass",text:"Görmezden gel",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"sogut-esigi",
  },
  "aksam-cayi":{
    id:"aksam-cayi",
    title:"Akşam Çayı",
    text:"Eski bir kupa, hâlâ ılık çay. Birisi yeni gitmiş gibi.",
    choices:[
      {tone:"safe",text:"İç",result:"+1 can",effect:{type:"heal",amount:1}},
      {tone:"risk",text:"Garip kokuyor, geç",result:"+3 iplik bonusu",effect:{type:"thread",amount:3}},
    ],
    realm:"sogut-esigi",
  },
  "cayir-kedisi":{
    id:"cayir-kedisi",
    title:"Çayır Kedisi",
    text:"Uzakta kıvrılmış bir kedi. Tüyü taupe rengi, sakin gözleri. Sana baktı.",
    choices:[
      {tone:"safe",text:"Yaklaş ve sev",result:"+1 boncuk + 'Jedi'yi Gör' tetiklenir",effect:{type:"bead",amount:1,trigger:"jedi-secret"}},
      {tone:"pass",text:"Dokunma, yoluna git",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"sogut-esigi",
  },
};

export function getEvent(id){return EVENTS[id];}
export function rollEvent(pool, rng){
  if(!pool||!pool.length)return null;
  return EVENTS[pool[(rng()*pool.length)|0]];
}
