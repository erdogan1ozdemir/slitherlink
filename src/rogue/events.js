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
  "kutuphanecinin-uykusu":{
    id:"kutuphanecinin-uykusu",
    title:"Kütüphanecinin Uykusu",
    text:"Sessiz Kütüphaneci sandalyesinde uyumuş. Yanından geçmek için iki seçenek var.",
    choices:[
      {tone:"safe",text:"Sessizce geç",result:"hiçbir şey olmaz",effect:{type:"none"}},
      {tone:"risk",text:"Çantasını karıştır",result:"%50 ihtimal +1 relic / %50 -1 can",effect:{type:"chance-relic-or-damage",chance:0.5}},
    ],
    realm:"karanlik-igne",
  },
  "kayip-mektup":{
    id:"kayip-mektup",
    title:"Kayıp Mektup",
    text:"Bir kitabın arasında yarım kalmış bir mektup. 'Sevdiğim, bilirim ki...'",
    choices:[
      {tone:"safe",text:"Oku ve kapat",result:"+3 iplik",effect:{type:"thread",amount:3}},
      {tone:"pass",text:"Yerine bırak",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"karanlik-igne",
  },
  "murekkep-kuyusu":{
    id:"murekkep-kuyusu",
    title:"Mürekkep Kuyusu",
    text:"Eski bir kuyu, içinde koyu mürekkep titriyor. Yansımanda biri var.",
    choices:[
      {tone:"risk",text:"Eğil ve bak",result:"-1 can ama nadir relic şansı",effect:{type:"damage-then-relic",damage:1}},
      {tone:"pass",text:"Geç",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"karanlik-igne",
  },
  "bos-koltuk":{
    id:"bos-koltuk",
    title:"Boş Koltuk",
    text:"Üstünde örtü, yastığında tüy basılmış. Birisi yeni kalkmış gibi.",
    choices:[
      {tone:"safe",text:"Otur ve dinlen",result:"+1 can",effect:{type:"heal",amount:1}},
      {tone:"pass",text:"Geç",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"karanlik-igne",
  },
  "anahtar-cingirgi":{
    id:"anahtar-cingirgi",
    title:"Anahtar Çıngırağı",
    text:"Uzaktan tıkırdayan bir anahtar sesi. Yaklaşır mı, uzaklaşır mı?",
    choices:[
      {tone:"safe",text:"Takip et",result:"%70 ihtimal bronz anahtar",effect:{type:"chance-specific-relic",chance:0.7,relicId:"bronz-anahtar"}},
      {tone:"pass",text:"Geç",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"karanlik-igne",
  },
  "toz-patikasi":{
    id:"toz-patikasi",
    title:"Toz Patikası",
    text:"Yerde minik pati izleri — kediden olmalı. Patika bir yere gidiyor.",
    choices:[
      {tone:"safe",text:"İzleri takip et",result:"+2 iplik",effect:{type:"thread",amount:2}},
      {tone:"safe",text:"Pati izini sev",result:"+1 boncuk",effect:{type:"bead",amount:1}},
      {tone:"pass",text:"Geç",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"karanlik-igne",
  },
};

export function getEvent(id){return EVENTS[id];}
export function rollEvent(pool, rng){
  if(!pool||!pool.length)return null;
  return EVENTS[pool[(rng()*pool.length)|0]];
}
