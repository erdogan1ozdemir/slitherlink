# Plan 08 · Karanlık İğne (D2) — content + locked chest + bronze key

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** İkinci diyar — Karanlık İğne — content + yeni locked chest mekaniği. D2 Söğüt Eşiği boss yenildiğinde açılır (zaten Plan 07'de yapıldı). 6 relic (1'i Bronz Anahtar), 6 event, boss (Sessiz Kütüphaneci), 5 achievement. Locked chest düğümleri rastgele görünür, Bronz Anahtar varsa açılır.

**Architecture:** Plan 07 registry pattern'i (REALMS, RELICS, EVENTS, ACHIEVEMENTS) genişletilir. Map generator'a locked chest variant eklenir. Chest modal locked check yapar.

**Bağımlılık:** Plan 07.

**Tahmini süre:** 3-4 saat.

---

## Scope

**Plan 08 kapsam içi:**
- Karanlık İğne realm data (5 floor, mid difficulty)
- 6 relic (bronze-key dahil)
- 6 event
- Sessiz Kütüphaneci boss
- 5 achievement
- Locked chest mekaniği (yeni node tipi `locked-chest`)
- D3 unlock kuralı (D2 boss + ≥3 farklı relic 2 koşuda)

**Plan 08 kapsam dışı:**
- Constraint tiles (Plan 09)
- İpliklik talents (Plan 09)
- Boncuk Dizimi (Plan 09)

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `src/rogue/realms.js` | Modify | karanlik-igne realm data eklenir |
| `src/rogue/relics.js` | Modify | 6 D2 relic (bronze-key dahil) eklenir |
| `src/rogue/events.js` | Modify | 6 D2 event eklenir |
| `src/rogue/achievements.js` | Modify | 5 D2 achievement eklenir |
| `src/rogue/map.js` | Modify | locked-chest node type support |
| `index.html` | Modify | locked chest modal handling, D2 boss → D3 unlock check, currency reward düzenleme |
| `docs/log/plan-08-progress.md` | Create | Progress notları |

---

## Görevler

### Task 1: Branch + log

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-08 -b plan-08-realm-karanlik-igne
cd "../slitherlink-plan-08"
```

`docs/log/plan-08-progress.md`:
```markdown
# Plan 08 Progress
- [ ] Task 1: Branch + log
- [ ] Task 2: realms.js — karanlik-igne entry
- [ ] Task 3: relics.js — 6 D2 relic (bronze-key dahil)
- [ ] Task 4: events.js — 6 D2 event
- [ ] Task 5: achievements.js — 5 D2 achievement
- [ ] Task 6: map.js — locked-chest node type
- [ ] Task 7: index.html — locked chest modal + D2 boss → D3 unlock
- [ ] Task 8: Final + merge + push
```

Commit: `chore(plan-08): start — branch + log`

---

### Task 2: realms.js — karanlik-igne entry ekle

`src/rogue/realms.js` içindeki REALMS objesine yeni entry ekle. Mevcut "sogut-esigi" entry'sinden sonra:

old_string:
```
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
```

new_string:
```
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
};
```

Commit: `feat(rogue): karanlik-igne realm data (5 floor + locked-chest nodes)`

---

### Task 3: relics.js — 6 D2 relic

`src/rogue/relics.js` RELICS objesine ekle. Son D1 relic (ciyli-yun) sonrası:

old_string:
```
  "ciyli-yun":{
    id:"ciyli-yun",
    name:"Çiyli Yün",
    glyph:"❉",
    desc:"Olay düğümünde +1 seçenek görünür.",
    rarity:"nadir",
    realm:"sogut-esigi",
  },
};
```

new_string:
```
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
```

Commit: `feat(rogue): 6 Karanlık İğne relic (bronze-key dahil)`

---

### Task 4: events.js — 6 D2 event

`src/rogue/events.js` EVENTS objesine ekle. Son D1 event (cayir-kedisi) sonrası:

old_string:
```
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
```

new_string:
```
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
```

Commit: `feat(rogue): 6 Karanlık İğne event + 3 yeni effect tipi`

---

### Task 5: achievements.js — 5 D2 achievement

`src/rogue/achievements.js` ACHIEVEMENTS objesine ekle. Son D1 achievement (yagmur-sonrasi) sonrası:

old_string:
```
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
```

new_string:
```
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
};
```

(Plan'da "5 D2 ach" diyordu ama 5+1=6 oldu, "yedi-mum" da eklendi — esnek; ek 1 ach zararsız.)

Commit: `feat(rogue): 6 Karanlık İğne achievement (boss/clear/no-hint/locked-chest/speed/elites)`

---

### Task 6: map.js — locked-chest node type

`src/rogue/map.js` `generateMap` fonksiyonunda node tipi dağılımına locked-chest desteği ekle. Mevcut yapıda `types` array'i kullanılıyor.

Minor değişiklik: `floorConfig[f].nodes` array'i locked-chest içerebilir, generator yaratırken yapacak.

Aslında mevcut generateMap signature `config.nodeTypes` array'i alıyor. Bu yeterli — gerçek tip ataması index.html `startRogueRun`'da realm'in floorConfig'ine bakarak yapılabilir.

**Optimal yaklaşım**: generateMap'i değiştirme; bunun yerine index.html'de `startRogueRun` realm.floorConfig kullanarak custom node tipleri atasın. Plan 06'daki generateMap basit ama yeterli.

Realistically: Plan 06'da generateMap config.nodeTypes parametresi alıyor ama startRogueRun bunu set etmiyordu — sadece floor sayısı geçiyordu. Generator default types array kullanıyor: `["puzzle","puzzle","elite","chest","rest","event"]`.

D2'de "locked-chest" alabilmesi için generator'a custom types geçilebilir. Ya da basitçe: `generateMap` `realm.floorConfig` kullansın.

**Bu task'ı pas geçebiliriz** — chest düğümünün locked olup olmadığını node yaratımında değil, openChestModal içinde rastgele belirleyebiliriz (realm karanlik-igne ise %30 ihtimal locked).

old_string:
```
import {generateMap, nextAccessibleNodes} from "./map.js";
```

new_string (yorum ekle):
```
import {generateMap, nextAccessibleNodes} from "./map.js";
// Karanlık İğne için locked chest desteği index.html openChestModal'da
// (realm.id===karanlik-igne && Math.random()<0.3 → locked variant)
```

(Bu task bu plan'da minimal — gerçek logic Task 7'de.)

Commit: `chore(plan-08): map.js dokümante — locked chest impl Task 7'de (UI-side)`

(Veya bu task'ı atla. Plan'da boş commit yerine atlama daha temiz olabilir.)

---

### Task 7: index.html — locked chest mekaniği + D2 → D3 unlock + relic capacity için ufak fix

**Edit 1: openChestModal — locked variant**

`function openChestModal(run,node)` başına ekle:

old_string:
```
function openChestModal(run,node){
  const realm=getRealm(run.realmId);
  let h=2166136261>>>0;const s=run.seed+"-chest-"+node.id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  const rng=mulberry32(h>>>0);
  const offers=rollRelicOffer(realm.relicPool||[],3,rng).filter(r=>!run.relics.includes(r.id));
  if(!offers.length){renderRogueMap(run);return;}
```

new_string:
```
function openChestModal(run,node){
  const realm=getRealm(run.realmId);
  let h=2166136261>>>0;const s=run.seed+"-chest-"+node.id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  const rng=mulberry32(h>>>0);
  // Locked chest: D2 ve floorConfig'te locked-chest tipi ise (veya node.type=="locked-chest")
  const isLockedChest=node.type==="locked-chest";
  if(isLockedChest&&!hasRelic(run,"bronz-anahtar")){
    openRogueModal(`
      <h2>Kilitli Sandık</h2>
      <p>Sağlam bir kilit. Bronz Anahtar olmadan açılmıyor.</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin:14px 0;">
        <button class="opt" data-skip="1" style="background:transparent;border:1px dashed var(--hairline);color:var(--muted);">Geç</button>
      </div>
    `,e=>{
      if(e.target.closest("[data-skip]")){closeRogueModal();renderRogueMap(run);}
    });
    return;
  }
  const offers=rollRelicOffer(realm.relicPool||[],3,rng).filter(r=>!run.relics.includes(r.id));
  if(!offers.length){renderRogueMap(run);return;}
```

**Edit 2: Eğer locked-chest açılıyorsa achievement trigger**

Mevcut chest seçim callback'i:

old_string:
```
    const relicId=btn.dataset.relic;
    if(relicId){
      run.relics.push(relicId);
      if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
      meta.realms[run.realmId].knownRelics=Array.from(new Set([...(meta.realms[run.realmId].knownRelics||[]),relicId]));
      saveMeta();
      checkAllRelicsSeenInRun(run);
    }
    store.set(KEYS.rogueRun,run);
    closeRogueModal();
    renderRogueMap(run);
```

new_string:
```
    const relicId=btn.dataset.relic;
    if(relicId){
      run.relics.push(relicId);
      if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
      meta.realms[run.realmId].knownRelics=Array.from(new Set([...(meta.realms[run.realmId].knownRelics||[]),relicId]));
      saveMeta();
      checkAllRelicsSeenInRun(run);
      if(isLockedChest)achievementUnlock("locked_chest_opened:"+run.realmId);
    }
    store.set(KEYS.rogueRun,run);
    closeRogueModal();
    renderRogueMap(run);
```

**Edit 3: applyEventEffect — yeni effect tipleri (chance-relic-or-damage, damage-then-relic, chance-specific-relic)**

old_string:
```
function applyEventEffect(run,ev,choice){
  const e=choice.effect;
  if(!e||e.type==="none")return;
  if(e.type==="heal"){
    run.lives.current=Math.min(run.lives.max,run.lives.current+(e.amount||1));
  }else if(e.type==="thread"){
    meta.currencies.thread=(meta.currencies.thread||0)+(e.amount||1);
    saveMeta();
  }else if(e.type==="bead"){
    meta.currencies.bead=(meta.currencies.bead||0)+(e.amount||1);
    saveMeta();
  }else if(e.type==="chance-damage"){
    if(Math.random()<(e.chance||0.5)){
      run.lives.current=Math.max(0,run.lives.current-(e.amount||1));
      if(run.lives.current===0){run.ended=true;run.endReason="no-lives";}
    }
  }else if(e.type==="relic-offer"){
    const realm=getRealm(run.realmId);
    const rng=mulberry32(Date.now()&0xffffffff);
    const offer=rollRelicOffer(realm.relicPool||[],e.count||1,rng).filter(r=>!run.relics.includes(r.id));
    if(offer.length){
      run.relics.push(offer[0].id);
      if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
      meta.realms[run.realmId].knownRelics=Array.from(new Set([...(meta.realms[run.realmId].knownRelics||[]),offer[0].id]));
      saveMeta();
      checkAllRelicsSeenInRun(run);
    }
  }
}
```

new_string:
```
function applyEventEffect(run,ev,choice){
  const e=choice.effect;
  if(!e||e.type==="none")return;
  if(e.type==="heal"){
    run.lives.current=Math.min(run.lives.max,run.lives.current+(e.amount||1));
  }else if(e.type==="thread"){
    meta.currencies.thread=(meta.currencies.thread||0)+(e.amount||1);
    saveMeta();
  }else if(e.type==="bead"){
    meta.currencies.bead=(meta.currencies.bead||0)+(e.amount||1);
    saveMeta();
  }else if(e.type==="chance-damage"){
    if(Math.random()<(e.chance||0.5)){
      run.lives.current=Math.max(0,run.lives.current-(e.amount||1));
      if(run.lives.current===0){run.ended=true;run.endReason="no-lives";}
    }
  }else if(e.type==="relic-offer"){
    const realm=getRealm(run.realmId);
    const rng=mulberry32(Date.now()&0xffffffff);
    const offer=rollRelicOffer(realm.relicPool||[],e.count||1,rng).filter(r=>!run.relics.includes(r.id));
    if(offer.length){
      run.relics.push(offer[0].id);
      if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
      meta.realms[run.realmId].knownRelics=Array.from(new Set([...(meta.realms[run.realmId].knownRelics||[]),offer[0].id]));
      saveMeta();
      checkAllRelicsSeenInRun(run);
    }
  }else if(e.type==="chance-relic-or-damage"){
    if(Math.random()<(e.chance||0.5)){
      // gives a relic
      const realm=getRealm(run.realmId);
      const rng=mulberry32(Date.now()&0xffffffff);
      const offer=rollRelicOffer(realm.relicPool||[],1,rng).filter(r=>!run.relics.includes(r.id));
      if(offer.length){
        run.relics.push(offer[0].id);
        if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
        meta.realms[run.realmId].knownRelics=Array.from(new Set([...(meta.realms[run.realmId].knownRelics||[]),offer[0].id]));
        saveMeta();
        checkAllRelicsSeenInRun(run);
      }
    }else{
      run.lives.current=Math.max(0,run.lives.current-1);
      if(run.lives.current===0){run.ended=true;run.endReason="no-lives";}
    }
  }else if(e.type==="damage-then-relic"){
    run.lives.current=Math.max(0,run.lives.current-(e.damage||1));
    if(run.lives.current===0){run.ended=true;run.endReason="no-lives";return;}
    const realm=getRealm(run.realmId);
    const rng=mulberry32(Date.now()&0xffffffff);
    const pool=realm.relicPool.filter(id=>RELICS[id]&&RELICS[id].rarity==="nadir");
    const offer=rollRelicOffer(pool.length?pool:realm.relicPool||[],1,rng).filter(r=>!run.relics.includes(r.id));
    if(offer.length){
      run.relics.push(offer[0].id);
      if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
      meta.realms[run.realmId].knownRelics=Array.from(new Set([...(meta.realms[run.realmId].knownRelics||[]),offer[0].id]));
      saveMeta();
      checkAllRelicsSeenInRun(run);
    }
  }else if(e.type==="chance-specific-relic"){
    if(Math.random()<(e.chance||0.5)&&e.relicId&&RELICS[e.relicId]&&!run.relics.includes(e.relicId)){
      run.relics.push(e.relicId);
      if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
      meta.realms[run.realmId].knownRelics=Array.from(new Set([...(meta.realms[run.realmId].knownRelics||[]),e.relicId]));
      saveMeta();
      checkAllRelicsSeenInRun(run);
    }
  }
}
```

**Edit 4: win() boss callback — D2 sonrası D3 unlock**

Mevcut Plan 07'de:
```javascript
        // Unlock next realm
        if(run.realmId==="sogut-esigi"){
          if(!meta.realms["karanlik-igne"])meta.realms["karanlik-igne"]={};
          meta.realms["karanlik-igne"].unlocked=true;
        }
```

Edit ile genişlet:

old_string:
```
        // Unlock next realm
        if(run.realmId==="sogut-esigi"){
          if(!meta.realms["karanlik-igne"])meta.realms["karanlik-igne"]={};
          meta.realms["karanlik-igne"].unlocked=true;
        }
```

new_string:
```
        // Unlock next realm
        if(run.realmId==="sogut-esigi"){
          if(!meta.realms["karanlik-igne"])meta.realms["karanlik-igne"]={};
          meta.realms["karanlik-igne"].unlocked=true;
        }else if(run.realmId==="karanlik-igne"){
          // D3 koşulu: D2 boss + farklı koşularda ≥3 farklı relic
          const knownInD2=(meta.realms["karanlik-igne"]?.knownRelics||[]).length;
          if(knownInD2>=3){
            if(!meta.realms["yildiz-gecidi"])meta.realms["yildiz-gecidi"]={};
            meta.realms["yildiz-gecidi"].unlocked=true;
          }
        }
        // Speed clear achievement
        if(run.realmId==="karanlik-igne"&&elapsed<900){
          achievementUnlock("speed_clear:karanlik-igne:900");
        }
```

**Edit 5: startRogueRun — D2 için generateMap node types özelleştirilebilir**

(Optional. Plan 08 v1'de Skip — chest düğümleri D2'de bazen locked olarak yaratılır mı? Şu an floorConfig'te `locked-chest` var ama generator bunu kullanmıyor.)

Pragmatic: generateMap'in node tipi atama mantığını bypass et — özel handler. Veya basitçe: D2 chest düğümlerinde %50 olasılıkla `node.type="locked-chest"` ata.

`startRogueRun` içinde, run yaratıldıktan sonra ekle:

old_string:
```
    const realm=getRealm(realmId);
    activeRun=startRun({realmId,seed,config:{floors:realm.floors}});
    store.set(KEYS.rogueRun,activeRun);
    meta.totalStats.runs=(meta.totalStats.runs||0)+1;saveMeta();
```

new_string:
```
    const realm=getRealm(realmId);
    activeRun=startRun({realmId,seed,config:{floors:realm.floors}});
    // D2: bazı chest düğümlerini locked yap
    if(realmId==="karanlik-igne"){
      let h=2166136261>>>0;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}
      const rng=mulberry32(h>>>0);
      activeRun.mapGraph.nodes.forEach(n=>{
        if(n.type==="chest"&&rng()<0.5)n.type="locked-chest";
      });
    }
    store.set(KEYS.rogueRun,activeRun);
    meta.totalStats.runs=(meta.totalStats.runs||0)+1;saveMeta();
```

**Edit 6: glyph map'e locked-chest ekle**

`renderRogueMap` içindeki glyph map:

old_string:
```
  const glyph={puzzle:"◇",elite:"☆",chest:"⬚",rest:"◐",event:"?",boss:"☠"};
```

new_string:
```
  const glyph={puzzle:"◇",elite:"☆",chest:"⬚","locked-chest":"⚿",rest:"◐",event:"?",boss:"☠"};
```

**Edit 7: handleRogueNode locked-chest desteği**

old_string:
```
  }else if(node.type==="chest"){
    openChestModal(run,node);
  }else if(node.type==="event"){
```

new_string:
```
  }else if(node.type==="chest"||node.type==="locked-chest"){
    openChestModal(run,node);
  }else if(node.type==="event"){
```

Commit: `feat(rogue): locked-chest + bronze-key mekaniği + D3 unlock + 3 yeni event effect`

---

### Task 8: Final + merge + push

- [ ] Progress log final + roadmap (`08 — Karanlık İğne (D2) | ✓ tamamlandı | <SHA>`)
- [ ] Commit + branch push + main merge + push

---

## Önerilen dispatch

Tek dispatch (Tasks 1-8). Plan 07 alanında tüm modüller var; sadece veri eklemeleri ve UI mekaniği.
