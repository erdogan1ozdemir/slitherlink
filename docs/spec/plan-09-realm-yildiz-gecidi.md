# Plan 09 · Yıldız Geçidi (D3) + Mum Modu + UX polish (stage clarity + button audit + resume)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Üçüncü diyar + Mum Modu time-pressure mekaniği + Rogue UX revizyonu (floor labels, GİRİŞ/BİTİŞ markers, button audit, resume Rogue pill home'da, mid-puzzle save).

**Bağımlılık:** Plan 08.

**Tahmini süre:** 5-6 saat.

---

## Scope

**Phase A — UX polish (acil sorunlar):**
- Yuva ⚙ butonu orphan: settings sheet'i aç
- Rogue Map'te floor labels: "1 · Pervaz", "2 · Çayır"... + "GİRİŞ" (floor 0) + "BİTİŞ ☠" (boss floor)
- Sequential lock görsel netleştirilsin (kilitli floor'lar daha sönük)
- Home Rogue Modu kartında aktif koşu varsa "Devam et · diyar adı" pill'i
- Game puzzle ekranındaki "Yeni" butonu rogue mode'da gizlensin (yeni puzzle = run'ı bozar)
- Game ekranı back butonu rogue'da Map'e döndüğünde puzzle progress autosave (`run.midPuzzle` field'ı)
- Aynı düğüme tekrar girince puzzle state restore
- "Yedek Kodu" ve "Nasıl Oynanır" Yuva settings'inden de erişilebilir olsun

**Phase B — Yıldız Geçidi D3 content:**
- Realm registry entry
- 6 relic
- 6 event
- 3-stage boss (Yıldız İplikçisi)
- 5 achievement
- D3 unlock zaten Plan 08'de kuruldu (D2 boss + ≥3 farklı relic)

**Phase C — Mum Modu (time pressure):**
- Settings'e yeni toggle: "Mum Modu (Rogue)" — default OFF
- Açıkken Rogue koşu başında 10 dakika başlangıç süresi
- Her floor geçince +90s
- Her node tipi süre tüketir: puzzle=60s, elite=120s, rest=0, event=30s, chest=0, boss=0 (puzzle süresi devam eder)
- Süre biterse koşu son bulur (kazanılan İplik korunur)
- Rogue map HUD'unda mum görseli + kalan dakika

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `src/rogue/realms.js` | Modify | yildiz-gecidi entry |
| `src/rogue/relics.js` | Modify | 6 D3 relic |
| `src/rogue/events.js` | Modify | 6 D3 event |
| `src/rogue/achievements.js` | Modify | 5 D3 achievement |
| `index.html` | Modify | Yuva ⚙ handler, floor labels, Mum Modu, mid-puzzle save, resume pill, button audit |
| `docs/log/plan-09-progress.md` | Create | Progress notları |

---

## Görevler

### Task 1: Branch + log

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-09 -b plan-09-realm-yildiz-gecidi
cd "../slitherlink-plan-09"
```

`docs/log/plan-09-progress.md`:
```markdown
# Plan 09 Progress
- [ ] Task 1: Branch + log
## Phase A - UX polish
- [ ] Task 2: Yuva ⚙ handler + Yuva settings buttons
- [ ] Task 3: Rogue Map floor labels (GİRİŞ / BİTİŞ + isim)
- [ ] Task 4: Home Rogue Modu kartına resume pill
- [ ] Task 5: Game "Yeni" butonu rogue'da gizle + mid-puzzle save/resume
## Phase B - D3 content
- [ ] Task 6: realms.js — yildiz-gecidi
- [ ] Task 7: relics.js — 6 D3 relic
- [ ] Task 8: events.js — 6 D3 event
- [ ] Task 9: achievements.js — 5 D3 achievement + multi-stage boss
- [ ] Task 10: Boss callback — D3 boss multi-stage handling
## Phase C - Mum Modu
- [ ] Task 11: Settings'e mumModu toggle
- [ ] Task 12: Rogue HUD mum + timer + node cost
- [ ] Task 13: Timer tick + run end on timeout
## Finalize
- [ ] Task 14: Final + merge + push
```

Commit: `chore(plan-09): start — branch + log`

---

### Task 2: Yuva ⚙ orphan fix + Yuva ek butonlar

`yuvaSettings` butonu HTML'de var ama handler yok.

**Edit 1 — Event handler ekle.** Mevcut event binding bloğunda `setupYuvaListeners()` çağrısı yakınında:

```javascript
$("yuvaSettings")?.addEventListener("click",()=>{renderToggles();$("settingsOverlay").classList.add("show");});
```

(Sonra eklenmesi gereken konum: setupYuvaListeners() çağrısının altına veya init bloğuna.)

**Edit 2 — Yuva content'e ek butonlar:** "Nasıl Oynanır" ve "Yedek" Yuva'dan da erişilebilir olsun. `renderYuva` sonunda 3 nav button'ından sonra ekstra 2 button:

Mevcut renderYuva'nın button bloğunun sonuna (3 nav butondan sonra ekstra):

```html
      <button class="opt" data-yuva-nav="how" style="background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);text-align:left;padding:14px 18px;">
        <span style="float:right;color:var(--muted);">›</span>
        <b style="font-family:var(--font-serif);font-weight:600;display:block;color:var(--ink);">Nasıl Oynanır</b>
        <span style="font-family:var(--font-body);font-weight:400;font-size:12px;color:var(--muted);">Kurallar + Rogue detay</span>
      </button>
```

Ve listener'a yeni case:
```javascript
      else if(where==="how"){openHow();}
```

(openHow zaten Plan 02'de tanımlanmış.)

Commit: `fix(rogue-ui): Yuva ⚙ handler + 'Nasıl Oynanır' shortcut`

---

### Task 3: Rogue Map floor labels (GİRİŞ / BİTİŞ + isim)

`renderRogueMap` içindeki SVG'ye floor etiketleri ekle. Her floor'ın sol tarafına dikey etiket: "1 · Pervaz" veya "GİRİŞ".

Mevcut SVG render bloğunda, nodes loop'undan sonra floor labels ekle:

```javascript
// Floor labels (sol kenarda)
const floorLabels=run.mapGraph.nodes.reduce((acc,n)=>{
  if(!acc[n.floor]){
    const fc=realm.floorConfig&&realm.floorConfig[n.floor];
    const isStart=n.floor===0;
    const isEnd=n.floor===run.mapGraph.floors-1;
    const name=fc&&fc.floorName||"";
    const tag=isStart?"GİRİŞ":(isEnd?"BİTİŞ":(""+(n.floor+1)));
    acc[n.floor]={floor:n.floor,tag,name};
  }
  return acc;
},{});
const labelsHtml=Object.values(floorLabels).map(l=>{
  const y=cy(l.floor);
  return `
    <text x="14" y="${y-4}" font-family="var(--font-mono)" font-size="8" fill="${l.tag==='GİRİŞ'||l.tag==='BİTİŞ'?'var(--accent)':'var(--muted)'}" letter-spacing="2">${l.tag}</text>
    <text x="14" y="${y+8}" font-family="var(--font-serif)" font-size="10" font-style="italic" fill="var(--ink-dim)">${l.name}</text>
  `;
}).join("");
```

Bu HTML'i SVG'nin sonuna (`</svg>` öncesi) ekle.

Edit aslında: mevcut `${run.mapGraph.nodes.map(n=>{...}).join("")}` bloğunun **sonuna** + svg `</svg>` öncesi ekle. Implementer dikkatli yerleştirmeli.

Ayrıca: realmin renk yansıması — boss floor'da glyph daha parlak (zaten current node halkası var, yeterli).

**Sequential lock görsel netleştir:** floor 0 dışındaki tüm floor'lar şu an ulaşılana kadar non-accessible. Tüm non-accessible non-visited node'lar `opacity:0.45` ile gösterilsin (mevcut zaten muted stroke kullanıyor — opacity ekleyerek netleştir).

Mevcut node render'da `opacity` parametresi yoksa, içerdeki `<g>` element'ine `opacity` ekle:

```html
<g data-node-id="..." style="cursor:..." opacity="${(isCur||isVis||isAcc)?1:0.4}">
```

Commit: `feat(rogue-ui): map floor labels (GİRİŞ/BİTİŞ + isim) + locked node opacity`

---

### Task 4: Home Rogue Modu kart resume pill

`renderHome` cards array'inde rogue card'a resume detection ekle.

old_string:
```javascript
    {id:"rogue",emo:"☠",h:"Rogue Modu",p:"Yuva'na git, bir diyar seç"},
```

new_string:
```javascript
    {id:"rogue",emo:"☠",h:"Rogue Modu",p:rogueResume?"yarım koşu bekliyor":"Yuva'na git, bir diyar seç",resume:rogueResume},
```

`rogueResume` değişkenini renderHome başında define et:

old_string:
```javascript
  const freeResume=loadResume(KEYS.freeCur), jrnResume=loadResume(KEYS.jrnCur);
```

new_string:
```javascript
  const freeResume=loadResume(KEYS.freeCur), jrnResume=loadResume(KEYS.jrnCur);
  const rogueRunRaw=store.get(KEYS.rogueRun,null);
  const rogueResume=rogueRunRaw&&!rogueRunRaw.ended?rogueRunRaw:null;
```

Pill UI mevcut `.resume-pill` zaten render ediliyor — card'da `${c.resume?...}` template'i var.

Commit: `feat(home): Rogue Modu kartına 'devam et' pill'i (aktif koşu varsa)`

---

### Task 5: Game ekranı rogue'da "Yeni" gizle + mid-puzzle save/resume

**Edit 1 — applyHintVisibility/applyUndoVisibility yanına applyNewBtnVisibility:**

```javascript
function applyNewBtnVisibility(){
  const isRogue=ctx.mode==="rogue";
  $("newBtn").classList.toggle("hidden",isRogue);
}
```

Ve startGame'de çağır:
```javascript
applyHintVisibility();applyUndoVisibility();applyNewBtnVisibility();render();startTimer();showScreen("s-game");
```

**Edit 2 — Mid-puzzle autosave:**

`autosave()` fonksiyonu rogue mode için run.midPuzzle güncelliyor olmalı:

old_string:
```javascript
function snapshot(){return {puzzle:P,ctx,hState,vState,hints,elapsed};}
function autosave(){if(solved)return;store.set(ctx.mode==="journey"?KEYS.jrnCur:KEYS.freeCur,snapshot());}
```

new_string:
```javascript
function snapshot(){return {puzzle:P,ctx,hState,vState,hints,elapsed};}
function autosave(){
  if(solved)return;
  if(ctx.mode==="rogue"){
    const run=store.get(KEYS.rogueRun,null);
    if(run){run.midPuzzle=snapshot();store.set(KEYS.rogueRun,run);}
  }else{
    store.set(ctx.mode==="journey"?KEYS.jrnCur:KEYS.freeCur,snapshot());
  }
}
```

**Edit 3 — handleRogueNode mid-puzzle resume:**

`handleRogueNode` puzzle node'da, eğer run.midPuzzle varsa ve aynı node'sa onu restore et:

Önce mevcut bağlamı bul. `if(node.type==="puzzle"||...){` bloğunda:

old_string:
```javascript
  if(node.type==="puzzle"||node.type==="elite"||node.type==="boss"){
    // Start a puzzle in rogue context
    const realm=getRealm(run.realmId);
    const floorCfg=realm.floorConfig&&realm.floorConfig[node.floor];
    const size=floorCfg?floorCfg.sizes[0]:5;
    const keep=floorCfg?floorCfg.keep:0.75;
    const rng=mulberry32(hashSeed(run.seed+"-"+nodeId));
    startGame(makePuzzle(size,size,keep,rng),{mode:"rogue",realmId:run.realmId,nodeId,runRef:true});
  }
```

new_string:
```javascript
  if(node.type==="puzzle"||node.type==="elite"||node.type==="boss"){
    // Resume mid-puzzle if same node
    if(run.midPuzzle&&run.midPuzzle.ctx&&run.midPuzzle.ctx.nodeId===nodeId){
      startGame(run.midPuzzle.puzzle,run.midPuzzle.ctx,run.midPuzzle);
      return;
    }
    // Start a fresh puzzle in rogue context
    const realm=getRealm(run.realmId);
    const floorCfg=realm.floorConfig&&realm.floorConfig[node.floor];
    const size=floorCfg?floorCfg.sizes[0]:5;
    const keep=floorCfg?floorCfg.keep:0.75;
    const rng=mulberry32(hashSeed(run.seed+"-"+nodeId));
    startGame(makePuzzle(size,size,keep,rng),{mode:"rogue",realmId:run.realmId,nodeId,runRef:true});
  }
```

**Edit 4 — Puzzle win → midPuzzle clear:**

win() fonksiyonundaki rogue branch'inde:

old_string (en sonda store.set rogue run satırı):
```javascript
      saveMeta();
      store.set(KEYS.rogueRun,run);
    }
  }
```

new_string:
```javascript
      run.midPuzzle=null; // puzzle cleared
      saveMeta();
      store.set(KEYS.rogueRun,run);
    }
  }
```

Commit: `feat(rogue): mid-puzzle autosave/resume + 'Yeni' button rogue'da gizli`

---

### Task 6: realms.js — yildiz-gecidi entry

REALMS'e ekle (karanlik-igne'den sonra):

```javascript
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
```

Commit: `feat(rogue): yildiz-gecidi realm data (5 floor + multi-stage boss flag)`

---

### Task 7: relics.js — 6 D3 relic

```javascript
  "yildiz-tozu":{
    id:"yildiz-tozu",
    name:"Yıldız Tozu",
    glyph:"✦",
    desc:"1 ipucu 2 sayar (hint sayacında).",
    rarity:"sik",
    realm:"yildiz-gecidi",
  },
  "ay-muhru":{
    id:"ay-muhru",
    name:"Ay Mührü",
    glyph:"☾",
    desc:"Bir kez tam geri al (mevcut puzzle).",
    rarity:"nadir",
    realm:"yildiz-gecidi",
  },
  "gece-pusulasi":{
    id:"gece-pusulasi",
    name:"Gece Pusulası",
    glyph:"✧",
    desc:"Koşu başında tüm harita görünür.",
    rarity:"nadir",
    realm:"yildiz-gecidi",
  },
  "kuyruklu-yildiz":{
    id:"kuyruklu-yildiz",
    name:"Kuyruklu Yıldız",
    glyph:"☄",
    desc:"Yarıda bırakılan koşudan kayıpsız çıkış.",
    rarity:"sik",
    realm:"yildiz-gecidi",
  },
  "dus-ipligi":{
    id:"dus-ipligi",
    name:"Düş İpliği",
    glyph:"❀",
    desc:"+5 dakika bonus süre (Mum Modu'nda).",
    rarity:"sik",
    realm:"yildiz-gecidi",
  },
  "yildizsayar":{
    id:"yildizsayar",
    name:"Yıldızsayar",
    glyph:"※",
    desc:"Sayıların yanında olasılık işareti.",
    rarity:"sik",
    realm:"yildiz-gecidi",
  },
```

Commit: `feat(rogue): 6 Yıldız Geçidi relic`

---

### Task 8: events.js — 6 D3 event

```javascript
  "sonmus-yildiz":{
    id:"sonmus-yildiz",
    title:"Sönmüş Yıldız",
    text:"Bir yıldız boşluğa kaymış. Yerine ne ekersen artık o.",
    choices:[
      {tone:"safe",text:"Bir relic ek",result:"rastgele relic",effect:{type:"relic-offer",count:1}},
      {tone:"safe",text:"Bir can yenile",result:"+1 can",effect:{type:"heal",amount:1}},
      {tone:"pass",text:"Boş bırak",result:"hiçbir şey",effect:{type:"none"}},
    ],
    realm:"yildiz-gecidi",
  },
  "ay-seni-taniyor":{
    id:"ay-seni-taniyor",
    title:"Ay Seni Tanıyor",
    text:"Ay seni daha önce görmüş gibi bakıyor. Selam vermek istersin.",
    choices:[
      {tone:"safe",text:"Selam ver",result:"+1 boncuk",effect:{type:"bead",amount:1}},
      {tone:"pass",text:"Geç",result:"hiçbir şey",effect:{type:"none"}},
    ],
    realm:"yildiz-gecidi",
  },
  "dus-parcasi":{
    id:"dus-parcasi",
    title:"Düş Parçası",
    text:"Yere düşmüş, yarı saydam bir parça. Tutmak istersen elin titreyecek.",
    choices:[
      {tone:"risk",text:"Tut",result:"%60 +nadir relic / %40 -1 can",effect:{type:"chance-relic-or-damage",chance:0.6}},
      {tone:"pass",text:"Bırak",result:"hiçbir şey",effect:{type:"none"}},
    ],
    realm:"yildiz-gecidi",
  },
  "kar-tanesi":{
    id:"kar-tanesi",
    title:"Kar Tanesi",
    text:"Tek bir kar tanesi yavaşça düşüyor. Avucuna alırsan eridiğini hissedeceksin.",
    choices:[
      {tone:"safe",text:"Avucuna al",result:"+2 yıldız tozu",effect:{type:"stardust",amount:2}},
      {tone:"pass",text:"Geçmesini bekle",result:"hiçbir şey",effect:{type:"none"}},
    ],
    realm:"yildiz-gecidi",
  },
  "buzlu-cam":{
    id:"buzlu-cam",
    title:"Buzlu Cam",
    text:"Cama vurursan ne göstereceğini bilmiyorsun.",
    choices:[
      {tone:"risk",text:"Vur",result:"%50 +3 boncuk / %50 -1 can",effect:{type:"chance-bead-or-damage",chance:0.5,beadAmount:3}},
      {tone:"safe",text:"Sadece bak",result:"+1 iplik",effect:{type:"thread",amount:1}},
    ],
    realm:"yildiz-gecidi",
  },
  "gece-patikasi":{
    id:"gece-patikasi",
    title:"Gece Patikası",
    text:"Ay altında uzanan parıltılı bir patika. Pati izleri seninkilerden farklı — belki de aynı.",
    choices:[
      {tone:"safe",text:"İzleri takip et",result:"+3 iplik",effect:{type:"thread",amount:3}},
      {tone:"safe",text:"Kendi izini bırak",result:"+1 boncuk",effect:{type:"bead",amount:1}},
    ],
    realm:"yildiz-gecidi",
  },
```

Yeni effect tipleri: `stardust`, `chance-bead-or-damage`. applyEventEffect'e ekle (Task 10'da).

Commit: `feat(rogue): 6 Yıldız Geçidi event + 2 yeni effect tipi (stardust, chance-bead-or-damage)`

---

### Task 9: achievements.js — 5 D3 achievement

```javascript
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
```

Commit: `feat(rogue): 5 Yıldız Geçidi achievement`

---

### Task 10: index.html — D3 boss multi-stage + win callback ek triggers + yeni effect tipleri

**Edit 1 — applyEventEffect'e stardust + chance-bead-or-damage ekle:**

mevcut applyEventEffect chain'ine ek branch'ler:
```javascript
}else if(e.type==="stardust"){
  meta.currencies.stardust=(meta.currencies.stardust||0)+(e.amount||1);
  saveMeta();
}else if(e.type==="chance-bead-or-damage"){
  if(Math.random()<(e.chance||0.5)){
    meta.currencies.bead=(meta.currencies.bead||0)+(e.beadAmount||1);
    saveMeta();
  }else{
    run.lives.current=Math.max(0,run.lives.current-1);
    if(run.lives.current===0){run.ended=true;run.endReason="no-lives";}
  }
}
```

**Edit 2 — Win callback'inde D3 ek triggers + D2 → D3 unlock + multi-stage boss handling:**

Mevcut win() rogue dalında D2→D3 unlock kısmı vardı:

```javascript
}else if(run.realmId==="karanlik-igne"){
  // D3 koşulu: D2 boss + farklı koşularda ≥3 farklı relic
  const knownInD2=(meta.realms["karanlik-igne"]?.knownRelics||[]).length;
  if(knownInD2>=3){
    if(!meta.realms["yildiz-gecidi"])meta.realms["yildiz-gecidi"]={};
    meta.realms["yildiz-gecidi"].unlocked=true;
  }
}
```

Bunu D3 için de genişlet (achievement triggers):

```javascript
}else if(run.realmId==="yildiz-gecidi"){
  if(run.lives.current>=2){achievementUnlock("clear_with_lives:yildiz-gecidi:2");}
  if(!run.wasResumed){achievementUnlock("single_session_clear:yildiz-gecidi");}
}
```

(`run.wasResumed` field'ı — runtime'da set edilir. Resume'dan açıldıysa true. v1: pas geç, sadece `single_session_clear` koşulunu basit tut.)

**Edit 3 — Multi-stage boss handling:**

Yıldız İplikçisi boss puzzle yenilince, eğer realm.bossMultiStage>1 ise yeni puzzle başlat aynı node'da. Win callback'inde:

```javascript
const realm=getRealm(run.realmId);
if(realm.bossMultiStage&&realm.bossMultiStage>1){
  // Stage track
  if(!run.bossStage)run.bossStage=1;
  if(run.bossStage<realm.bossMultiStage){
    run.bossStage++;
    store.set(KEYS.rogueRun,run);
    // Yeni stage puzzle başlat — boss küçük artarak zorlaşır
    const cfg=realm.floorConfig[node.floor];
    const stageRng=mulberry32(hashSeed(run.seed+"-"+ctx.nodeId+"-stage"+run.bossStage));
    setTimeout(()=>{
      $("winOverlay").classList.remove("show");
      startGame(makePuzzle(cfg.sizes[0]+run.bossStage-1,cfg.sizes[0]+run.bossStage-1,cfg.keep-0.05*run.bossStage,stageRng),{mode:"rogue",realmId:run.realmId,nodeId:ctx.nodeId,runRef:true,bossStage:run.bossStage});
    },1200);
    return; // Don't run normal boss-defeat path yet
  }
  // Final stage cleared — fall through to normal boss handling
  run.bossStage=null;
}
```

Bu blok `if(node&&node.type==="boss"){` bloğunun en başına eklenmeli.

Implementasyon notu: bu kod karmaşık. Implementer dikkatli yerleştirmeli — `if(node&&node.type==="boss"){` mevcut bloğunun başına insertelink, `return` ile early exit.

Commit: `feat(rogue): D3 multi-stage boss + clear_with_lives ach + 2 yeni effect tipi`

---

### Task 11: Settings'e mumModu toggle

DEFAULT_SETTINGS'e:
```javascript
const DEFAULT_SETTINGS={hints:true,fade:true,errors:true,haptics:true,autoX:true,autoCheckMode:"mistakes-only",undoButtons:true,mumModu:false};
```

TOGGLE_DEFS'e:
```javascript
{k:"mumModu", t:"Mum Modu (Rogue)", d:"Rogue koşusunda süre baskısı: 10dk + her kat +90s"},
```

Commit: `feat(settings): mumModu toggle (Rogue time pressure)`

---

### Task 12: Rogue HUD mum + timer + node süre maliyeti

`startRogueRun` içinde Mum Modu aktifse run'a timeRemaining field'ı ekle:

```javascript
if(settings.mumModu){
  activeRun.candleMode=true;
  activeRun.timeRemaining=600; // 10 minutes in seconds
}
```

`moveTo` çağrısı sonrası (handleRogueNode'da node geçtiğinde), node tipine göre süre düşür:

```javascript
if(run.candleMode){
  const costs={puzzle:60,elite:120,rest:0,event:30,chest:0,"locked-chest":0,boss:0};
  run.timeRemaining=Math.max(0,run.timeRemaining-(costs[node.type]||0));
  // floor change bonus
  if(node.floor>previousFloor)run.timeRemaining+=90;
  if(run.timeRemaining<=0){run.ended=true;run.endReason="timeout";}
}
```

`renderRogueMap` HUD'unda Mum Modu işareti:

```javascript
${run.candleMode?`<div style="font-family:var(--font-mono);font-size:11px;color:var(--bad);">🕯 ${Math.floor(run.timeRemaining/60)}:${(run.timeRemaining%60).toString().padStart(2,"0")}</div>`:""}
```

(HUD satırında diğer chip'lerin yanına ekle.)

Commit: `feat(rogue): Mum Modu — HUD timer + node süre maliyeti + timeout end`

---

### Task 13: Timer tick (puzzle içinde de mum eridiğini göster)

Bu opsiyonel. Eğer çok zaman yiyorsa SKIP. Plan'a göre puzzle süresi `elapsed` ile zaten ölçülüyor; rogue puzzle'da elapsed sona ekstra mum maliyeti ekleyebiliriz ama complexity artar.

v1: puzzle süresi mum modu'na dahil değil — node geçişlerinden düşülüyor zaten.

Empty commit veya skip:
```bash
git commit --allow-empty -m "chore(plan-09): mum modu timer tick puzzle-içi SKIP (v1.x'e ertelendi)"
```

---

### Task 14: Final + merge + push

- [ ] Progress log final + roadmap (`09 — Yıldız Geçidi (D3) | ✓ tamamlandı | <SHA>`)
- [ ] Commit + branch push + main merge + push

---

## Self-Review

**Spec coverage:**
- ✅ Phase A: Yuva ⚙, floor labels, resume pill, mid-puzzle save, "Yeni" hide
- ✅ Phase B: D3 realm + 6 relic + 6 event + boss + 5 ach
- ✅ Phase C: Mum Modu toggle + HUD + node cost + timeout
- ✅ Multi-stage boss handling

**Önerilen dispatch:**
- **Dispatch 1:** Phase A (Task 1-5, UX polish)
- **Dispatch 2:** Phase B (Task 6-10, D3 content)
- **Dispatch 3:** Phase C + finalize (Task 11-14)
