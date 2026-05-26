// src/rogue/relics.js — Relic registry + effect application

export const RELICS={
  "sogut-yapragi":{
    id:"sogut-yapragi",
    name:"Söğüt Yaprağı",
    glyph:"❦",
    desc:"İlk hata cezasız.",
    rarity:"sik",
    realm:"sogut-esigi",
  },
  "kelebek-pulu":{
    id:"kelebek-pulu",
    name:"Kelebek Pulu",
    glyph:"✿",
    desc:"Koşuda +1 ipucu hakkı.",
    rarity:"sik",
    realm:"sogut-esigi",
  },
  "yun-tohumu":{
    id:"yun-tohumu",
    name:"Yün Tohumu",
    glyph:"●",
    desc:"Dinlenme düğümünde +1 can yenilenir.",
    rarity:"sik",
    realm:"sogut-esigi",
  },
  "bahcivanin-eldiveni":{
    id:"bahcivanin-eldiveni",
    name:"Bahçıvanın Eldiveni",
    glyph:"☘",
    desc:"Çarpı işaretleri daha okunaklı.",
    rarity:"sik",
    realm:"sogut-esigi",
  },
  "aksam-mumu":{
    id:"aksam-mumu",
    name:"Akşam Mumu",
    glyph:"♦",
    desc:"Sonraki kattaki düğüm tiplerini önceden gösterir.",
    rarity:"nadir",
    realm:"sogut-esigi",
  },
  "ciyli-yun":{
    id:"ciyli-yun",
    name:"Çiyli Yün",
    glyph:"❉",
    desc:"Olay düğümünde +1 seçenek görünür.",
    rarity:"nadir",
    realm:"sogut-esigi",
  },
  "murekkep-damlasi":{
    id:"murekkep-damlasi",
    name:"Mürekkep Damlası",
    glyph:"●",
    desc:"İpucu kullanımında zaman cezası yok.",
    rarity:"sik",
    realm:"karanlik-igne",
  },
  "sayfa-kosesi":{
    id:"sayfa-kosesi",
    name:"Sayfa Köşesi",
    glyph:"⌐",
    desc:"Koşu başına 1 düğümü geri alabilirsin.",
    rarity:"sik",
    realm:"karanlik-igne",
  },
  "bronz-anahtar":{
    id:"bronz-anahtar",
    name:"Bronz Anahtar",
    glyph:"⚿",
    desc:"Kilitli sandıkları açar.",
    rarity:"sik",
    realm:"karanlik-igne",
  },
  "tuy-kalem":{
    id:"tuy-kalem",
    name:"Tüy Kalem",
    glyph:"✒",
    desc:"İpucu sayacı yarıya iner.",
    rarity:"sik",
    realm:"karanlik-igne",
  },
  "eski-mum":{
    id:"eski-mum",
    name:"Eski Mum",
    glyph:"◊",
    desc:"Sonraki kat düğümlerini detaylı gösterir.",
    rarity:"nadir",
    realm:"karanlik-igne",
  },
  "murekkep-lekesi":{
    id:"murekkep-lekesi",
    name:"Mürekkep Lekesi",
    glyph:"◉",
    desc:"Boss savaşında +1 can buffer.",
    rarity:"nadir",
    realm:"karanlik-igne",
  },
};

export function getRelic(id){return RELICS[id];}

/** Run start için bir relic gerekli — random pick (rng) ile. */
export function rollRelicOffer(pool, count, rng){
  const available=pool.slice();
  const chosen=[];
  for(let i=0;i<count&&available.length;i++){
    const idx=(rng()*available.length)|0;
    chosen.push(available.splice(idx,1)[0]);
  }
  return chosen.map(id=>RELICS[id]).filter(Boolean);
}

/** Effect helpers — Plan 07 v1 minimum:
 *  - sogut-yapragi: ilk hata cezasız (lives consumption blocked once)
 *  - kelebek-pulu: hint count visible in HUD; +1 free hint
 *  - bahcivanin-eldiveni: CSS class to game board (.relic-bahcivan)
 *  - Diğerleri: data-only (Plan 09'da effect engine ile bağlanacak)
 */
export function hasRelic(run, relicId){
  return !!(run&&run.relics&&run.relics.includes(relicId));
}
