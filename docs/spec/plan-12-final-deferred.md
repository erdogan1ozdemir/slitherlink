# Plan 12 · Tüm deferred items — Diken + 6 tile + Hediye + Mum tick + Daily + 4. diyar

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Plan 11 sonrası kalan tüm deferred items'i bitir. Diken Sözleşmesi functional, 6 yeni constraint tile, Hediye Boncukları UI, Mum Modu puzzle-içi tick, Daily Challenge, gizli 4. diyar "Düğümün Ardı".

**Bağımlılık:** Plan 11.

**Tahmini süre:** 6-8 saat. Kapsamlı.

---

## Scope

**Phase A — Diken Sözleşmesi (Pact of Punishment):**
- 10 modifier (Daralma, Kör Pusula, Kırılgan İplik, Yankılı Boss, Çıplak Başlangıç, Sıkı Kontrol, Sönük Yıldız, Tek Kapı, Dolu Tabla, Çift Düğüm)
- Diken Sözleşmesi UI'da modifier toggle/rank seçimi
- Run start'ta aktif modifier'lar uygulanır
- Toplam İz puanı → koşu sonu reward multiplier

**Phase B — 6 yeni constraint tile:**
- İkiz Hücre (iki hücre aynı sayı)
- Donmuş Hücre (etrafına çizgi konmaz)
- 2 Konmaz (sayı 2 değil)
- Lanetli Hücre (loop kesin çevreler — 4 kenar)
- Yankı Hücresi (referans hücreyle aynı sayı, görsel link)
- Kayan Hücre (her N hamleden sonra komşuya atlar)

Generator/puzzle entegrasyonu + render

**Phase C — Hediye Boncukları (keepsakes) UI:**
- 8 keepsake (achievement-locked, kalıcı koleksiyon)
- Karakter ekranında "Boncuk Koleksiyonu" alt-bölümü
- Achievement unlock'larda keepsake auto-add

**Phase D — Mum Modu puzzle-içi tick:**
- Puzzle render esnasında her saniye `timeRemaining` -1
- Süre bittiyse puzzle-ortasında run end

**Phase E — Daily Challenge:**
- Bugünün date string'i = seed
- Tek deneme/gün
- Local leaderboard (en iyi 7 gün)
- Ana menüde "Günün Çemberi" kartı

**Phase F — Saklı 4. diyar "Düğümün Ardı":**
- 3 diyar tamamlanırsa açılır
- 7 floor, mixed pool, tüm constraint tile'lar aktif
- "Düğüm Ustası" boss
- Ek 3 achievement

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `src/rogue/thorns.js` | Create | 10 modifier + apply at run start + iz score |
| `src/rogue/tiles.js` | Modify | 6 yeni tile (toplam 7) |
| `src/rogue/keepsakes.js` | Create | 8 keepsake + auto-unlock on achievement |
| `src/rogue/daily.js` | Create | Daily seed gen + leaderboard |
| `src/rogue/realms.js` | Modify | "dugumun-ardi" realm entry |
| `src/rogue/achievements.js` | Modify | 3 D4 achievement + keepsake link |
| `index.html` | Modify | Diken UI render + thorns apply, Hediye UI, Mum tick, Daily kart, 4. realm unlock |
| `tests/core.test.js` | Modify | Yeni asserts |
| `docs/log/plan-12-progress.md` | Create | Progress |

---

## Görevler

### Task 1: Branch + log

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-12 -b plan-12-final-deferred
cd "../slitherlink-plan-12"
```

`docs/log/plan-12-progress.md`:
```markdown
# Plan 12 Progress
- [ ] Task 1: Branch + log
## Phase A — Diken
- [ ] Task 2: thorns.js (10 modifier + apply + iz score)
- [ ] Task 3: Diken Sözleşmesi UI + profile + run start apply
## Phase B — 6 tile
- [ ] Task 4: tiles.js genişlet (ikiz, donmuş, ikiKonmaz, lanetli, yanki, kayan)
- [ ] Task 5: Puzzle render integration (her tile için görsel/davranış)
## Phase C — Hediye Boncukları
- [ ] Task 6: keepsakes.js (8 keepsake + auto-unlock on ach)
- [ ] Task 7: Karakter UI keepsake bölümü
## Phase D — Mum tick
- [ ] Task 8: Puzzle render her saniye timeRemaining tick
## Phase E — Daily
- [ ] Task 9: daily.js (seed + local leaderboard)
- [ ] Task 10: Ana menü "Günün Çemberi" kartı + flow
## Phase F — 4. diyar
- [ ] Task 11: realms.js dugumun-ardi entry + unlock kuralı
- [ ] Task 12: D4 achievement (3 ach)
## Final
- [ ] Task 13: tests/core.test.js genişlet
- [ ] Task 14: Final + merge + push
```

Commit: `chore(plan-12): start — branch + log`

---

### Task 2: src/rogue/thorns.js

```javascript
// src/rogue/thorns.js — Diken Sözleşmesi (Pact of Punishment)

export const THORNS=[
  {id:"daralma",name:"Daralma",desc:"Her floor süre limiti -10s/-20s/-30s",ranks:3,minRank:0,maxRank:3,
   apply:(run,rank)=>{run.thorns_daralma=rank*10;}},
  {id:"kor-pusula",name:"Kör Pusula",desc:"Branching map gösterilmez (sadece next 1 node)",ranks:1,minRank:0,maxRank:1,
   apply:(run,rank)=>{if(rank)run.thorns_korPusula=true;}},
  {id:"kirilgan-iplik",name:"Kırılgan İplik",desc:"Relic havuzundan 1/2 seçim çıkar",ranks:2,minRank:0,maxRank:2,
   apply:(run,rank)=>{run.thorns_kirilganIplik=rank;}},
  {id:"yankili-boss",name:"Yankılı Boss",desc:"Boss'ta constraint tile %50/%100 fazla",ranks:2,minRank:0,maxRank:2,
   apply:(run,rank)=>{run.thorns_yankiliBoss=rank*0.5;}},
  {id:"ciplak-baslangic",name:"Çıplak Başlangıç",desc:"Permanent starter slot bu koşuda boş",ranks:1,minRank:0,maxRank:1,
   apply:(run,rank)=>{if(rank)run.thorns_ciplak=true;}},
  {id:"siki-kontrol",name:"Sıkı Kontrol",desc:"Hata başına -1/-2/-3 can",ranks:3,minRank:0,maxRank:3,
   apply:(run,rank)=>{run.thorns_sikiKontrol=rank;}},
  {id:"sonuk-yildiz",name:"Sönük Yıldız",desc:"Hint kullanırsan boss güçlenir",ranks:1,minRank:0,maxRank:1,
   apply:(run,rank)=>{if(rank)run.thorns_sonukYildiz=true;}},
  {id:"tek-kapi",name:"Tek Kapı",desc:"Koşu sonu seçim opsiyonu yok",ranks:1,minRank:0,maxRank:1,
   apply:(run,rank)=>{if(rank)run.thorns_tekKapi=true;}},
  {id:"dolu-tabla",name:"Dolu Tabla",desc:"+1/+2 ekstra elite düğüm",ranks:2,minRank:0,maxRank:2,
   apply:(run,rank)=>{run.thorns_doluTabla=rank;}},
  {id:"cift-dugum",name:"Çift Düğüm",desc:"Boss çift / üçlü stage",ranks:2,minRank:0,maxRank:2,
   apply:(run,rank)=>{run.thorns_ciftDugum=rank;}},
];

export function getThorn(id){return THORNS.find(t=>t.id===id);}
export function totalIzScore(profile){
  if(!profile)return 0;
  let iz=0;
  for(const t of THORNS){
    iz+=(profile[t.id]||0);
  }
  return iz;
}

/** Apply all profile thorns to a run. */
export function applyThornsToRun(run,profile){
  if(!profile)return run;
  for(const t of THORNS){
    const rank=profile[t.id]||0;
    if(rank>0)t.apply(run,rank);
  }
  return run;
}

/** Reward multiplier from iz score. */
export function rewardMultiplier(iz){
  if(iz<=2)return 1.0;
  if(iz<=5)return 1.5;
  if(iz<=10)return 2.0;
  return 2.5;
}
```

Commit: `feat(rogue): thorns.js — 10 Diken Sözleşmesi modifier + iz score + reward mult`

---

### Task 3: Diken UI + profile + run start apply

`renderDiken` placeholder'ını değiştir:

```javascript
function renderDiken(){
  const profile=meta.thornsContract?.profiles?.[0]||{};
  const iz=thornsIzScore(profile);
  const mult=thornsRewardMult(iz);
  const html=`
    <div style="text-align:center;padding:16px 0 12px;">
      <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:var(--accent);">toplam iz</div>
      <div style="font-family:var(--font-serif);font-size:32px;font-weight:500;color:var(--ink);margin-top:2px;">${iz}</div>
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--muted);letter-spacing:.12em;margin-top:4px;">ödül çarpanı ×${mult.toFixed(1)}</div>
    </div>
    <p style="text-align:center;font-family:var(--font-serif);font-style:italic;color:var(--ink-dim);font-size:13px;padding:0 18px 8px;line-height:1.5;">
      kendi zorluğunu seç. her iz, koşu sonunda daha çok ödül.
    </p>
    <div style="display:flex;flex-direction:column;gap:10px;padding:8px 4px;">
      ${THORNS.map(t=>{
        const rank=profile[t.id]||0;
        return `
          <div style="background:${rank>0?'var(--panel-2)':'var(--panel)'};border:1px solid ${rank>0?'var(--accent)':'var(--hairline)'};border-radius:14px;padding:12px 14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="flex:1;">
                <div style="font-family:var(--font-serif);font-weight:600;font-size:14.5px;color:var(--ink);">${t.name}</div>
                <div style="color:var(--muted);font-size:12px;margin-top:2px;font-family:var(--font-serif);font-style:italic;">${t.desc}</div>
              </div>
              <div style="display:flex;gap:4px;align-items:center;">
                <button class="opt" data-thorn-dec="${t.id}" ${rank<=0?'disabled':''} style="background:var(--panel);border:1px solid var(--hairline);color:var(--ink);width:30px;height:30px;padding:0;font-family:var(--font-serif);font-size:16px;">−</button>
                <span style="font-family:var(--font-mono);font-size:13px;color:var(--accent);min-width:24px;text-align:center;">${rank}/${t.maxRank}</span>
                <button class="opt" data-thorn-inc="${t.id}" ${rank>=t.maxRank?'disabled':''} style="background:var(--panel);border:1px solid var(--hairline);color:var(--ink);width:30px;height:30px;padding:0;font-family:var(--font-serif);font-size:16px;">+</button>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
  $("dikenContent").innerHTML=html;
  $("dikenContent").querySelectorAll("[data-thorn-inc],[data-thorn-dec]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const inc=btn.hasAttribute("data-thorn-inc");
      const id=inc?btn.dataset.thornInc:btn.dataset.thornDec;
      if(!meta.thornsContract)meta.thornsContract={profiles:[{}]};
      if(!meta.thornsContract.profiles||!meta.thornsContract.profiles.length)meta.thornsContract.profiles=[{}];
      const p=meta.thornsContract.profiles[0];
      const t=getThorn(id);
      const cur=p[id]||0;
      const next=Math.max(t.minRank,Math.min(t.maxRank,cur+(inc?1:-1)));
      p[id]=next;
      saveMeta();
      renderDiken();
    });
  });
}
```

`startRogueRun` içinde activeRun yaratıldıktan sonra (talent/charm/neow effects'in yanına):
```javascript
const profile=meta.thornsContract?.profiles?.[0];
if(profile){applyThornsToRun(activeRun,profile);activeRun.izScore=thornsIzScore(profile);}
```

Win callback'inde boss yenince currencies'e mult uygulanır:
```javascript
const izMult=thornsRewardMult(run.izScore||0);
meta.currencies.thread+=Math.floor(extraThread*izMult);
```

Imports:
```javascript
import {THORNS, getThorn, totalIzScore as thornsIzScore, applyThornsToRun, rewardMultiplier as thornsRewardMult} from "./src/rogue/thorns.js";
```

Commit: `feat(rogue): Diken Sözleşmesi UI + profile + run start apply + reward mult`

---

### Task 4: tiles.js — 6 yeni tile

`src/rogue/tiles.js` TILE_TYPES'i genişlet:

```javascript
export const TILE_TYPES={
  "sis":{id:"sis",name:"Sis",desc:"Sayı gizli — tıkla 3s reveal.",realms:["karanlik-igne","yildiz-gecidi"]},
  "ikiz":{id:"ikiz",name:"İkiz",desc:"İki hücre aynı sayıyı taşır.",realms:["sogut-esigi","yildiz-gecidi"]},
  "donmus":{id:"donmus",name:"Donmuş",desc:"Etrafına çizgi konmaz.",realms:["karanlik-igne","yildiz-gecidi"]},
  "iki-konmaz":{id:"iki-konmaz",name:"2 Konmaz",desc:"Sayı 2 olamaz.",realms:["karanlik-igne","yildiz-gecidi"]},
  "lanetli":{id:"lanetli",name:"Lanetli",desc:"Loop bu hücreyi tam çevreler (4 kenar).",realms:["yildiz-gecidi"]},
  "yanki":{id:"yanki",name:"Yankı",desc:"Referans hücreyle aynı sayı.",realms:["yildiz-gecidi"]},
  "kayan":{id:"kayan",name:"Kayan",desc:"Her 5 hamlede komşu boş hücreye atlar.",realms:["yildiz-gecidi"]},
};

const REALM_TILE_POOL={
  "sogut-esigi":["ikiz"],
  "karanlik-igne":["sis","donmus","iki-konmaz"],
  "yildiz-gecidi":["sis","ikiz","donmus","iki-konmaz","lanetli","yanki","kayan"],
  "dugumun-ardi":["sis","ikiz","donmus","iki-konmaz","lanetli","yanki","kayan"],
};

export function applyTiles(puzzle,realmId,rng,density=0.18){
  if(!puzzle.tiles)puzzle.tiles={};
  const pool=REALM_TILE_POOL[realmId]||[];
  if(!pool.length)return puzzle;
  for(let r=0;r<puzzle.R;r++)for(let c=0;c<puzzle.C;c++){
    if(puzzle.clue[r][c]<0)continue;
    if(rng()<density){
      const type=pool[(rng()*pool.length)|0];
      puzzle.tiles[r+","+c]={type,revealed:false};
      // Tile-specific data setup
      if(type==="iki-konmaz"&&puzzle.clue[r][c]===2){
        puzzle.clue[r][c]=rng()<0.5?1:3;
      }else if(type==="lanetli"){
        puzzle.clue[r][c]=4; // 4 kenar (loop tamamen çevreler)
      }else if(type==="donmus"){
        puzzle.clue[r][c]=-1; // sayı kaldırılır, sadece kısıt
      }
    }
  }
  // İkiz pairing
  const ikizCells=[];
  for(const k in puzzle.tiles){
    if(puzzle.tiles[k].type==="ikiz")ikizCells.push(k);
  }
  for(let i=0;i+1<ikizCells.length;i+=2){
    puzzle.tiles[ikizCells[i]].pair=ikizCells[i+1];
    puzzle.tiles[ikizCells[i+1]].pair=ikizCells[i];
    // Match clue
    const k2=ikizCells[i+1];
    const [r1,c1]=ikizCells[i].split(",").map(Number);
    const [r2,c2]=k2.split(",").map(Number);
    if(puzzle.clue[r1][c1]>=0&&puzzle.clue[r2][c2]<0)puzzle.clue[r2][c2]=puzzle.clue[r1][c1];
    else if(puzzle.clue[r2][c2]>=0&&puzzle.clue[r1][c1]<0)puzzle.clue[r1][c1]=puzzle.clue[r2][c2];
  }
  // Yanki pairing
  const yankiCells=[];
  for(const k in puzzle.tiles){if(puzzle.tiles[k].type==="yanki")yankiCells.push(k);}
  for(let i=0;i+1<yankiCells.length;i+=2){
    puzzle.tiles[yankiCells[i]].pair=yankiCells[i+1];
    puzzle.tiles[yankiCells[i+1]].pair=yankiCells[i];
  }
  // Kayan: orijinal pozisyonu sakla
  for(const k in puzzle.tiles){
    if(puzzle.tiles[k].type==="kayan"){
      puzzle.tiles[k].movesUntilShift=5;
    }
  }
  return puzzle;
}

export function isTileRevealed(puzzle,r,c){
  const t=puzzle.tiles&&puzzle.tiles[r+","+c];
  return !t||t.revealed||t.type!=="sis";
}

export function revealTile(puzzle,r,c){
  const t=puzzle.tiles&&puzzle.tiles[r+","+c];
  if(t&&t.type==="sis"){t.revealed=true;return true;}
  return false;
}

/** Tick "Kayan" tiles — called after each edge toggle in puzzle */
export function tickKayanTiles(puzzle,rng){
  if(!puzzle.tiles)return false;
  let moved=false;
  for(const k in puzzle.tiles){
    const t=puzzle.tiles[k];
    if(t.type!=="kayan")continue;
    t.movesUntilShift=Math.max(0,(t.movesUntilShift||5)-1);
    if(t.movesUntilShift===0){
      const [r,c]=k.split(",").map(Number);
      // Find an empty neighbor cell
      const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(([dr,dc])=>[r+dr,c+dc])
        .filter(([nr,nc])=>nr>=0&&nr<puzzle.R&&nc>=0&&nc<puzzle.C&&!puzzle.tiles[nr+","+nc]);
      if(opts.length){
        const [nr,nc]=opts[(rng()*opts.length)|0];
        delete puzzle.tiles[k];
        puzzle.tiles[nr+","+nc]={type:"kayan",movesUntilShift:5};
        // also move clue
        if(puzzle.clue[r][c]>=0){puzzle.clue[nr][nc]=puzzle.clue[r][c];puzzle.clue[r][c]=-1;}
        moved=true;
      }else{
        t.movesUntilShift=5; // reset if no empty neighbor
      }
    }
  }
  return moved;
}
```

Commit: `feat(rogue): tiles.js — 6 yeni constraint tile (İkiz, Donmuş, 2 Konmaz, Lanetli, Yankı, Kayan)`

---

### Task 5: Puzzle render integration — tile görselleştirme

Mevcut `render()` fonksiyonunda clue text rendering kısmını genişlet. Önce Read ile bağlam al.

`render` içindeki clue loop:
```javascript
for(let r=0;r<g.R;r++)for(let c=0;c<g.C;c++){
  if(P.clue[r][c]<0&&!(P.tiles&&P.tiles[r+","+c]))continue;
  const tile=P.tiles&&P.tiles[r+","+c];
  const clue=P.clue[r][c];
  const t=document.createElementNS(NS,"text");
  t.setAttribute("x",dx(c)+g.S/2);t.setAttribute("y",dy(r)+g.S/2+1);
  t.setAttribute("class","clue");
  t.setAttribute("font-size",g.S*0.42);
  let textContent=clue>=0?clue:"";
  let extraClass="";
  if(tile){
    if(tile.type==="sis"&&!tile.revealed){textContent="?";extraClass="sis-hidden";}
    else if(tile.type==="donmus"){textContent="❄";extraClass="tile-donmus";}
    else if(tile.type==="iki-konmaz"){extraClass="tile-iki-konmaz";}
    else if(tile.type==="lanetli"){extraClass="tile-lanetli";}
    else if(tile.type==="ikiz"){extraClass="tile-ikiz";}
    else if(tile.type==="yanki"){extraClass="tile-yanki";}
    else if(tile.type==="kayan"){extraClass="tile-kayan";}
  }
  if(extraClass)t.setAttribute("class","clue "+extraClass);
  t.textContent=textContent;
  t.dataset.r=r;t.dataset.c=c;
  if(tile&&tile.type==="sis"&&!tile.revealed){
    t.style.cursor="pointer";
    t.addEventListener("click",e=>{
      e.stopPropagation();
      tile.revealed=true;render();
      setTimeout(()=>{if(P.tiles&&P.tiles[r+","+c]){P.tiles[r+","+c].revealed=false;render();}},3000);
    });
  }
  boardEl.appendChild(t);
}
```

CSS:
```css
.clue.sis-hidden{fill:var(--accent);font-style:italic;opacity:.7;}
.clue.tile-donmus{fill:#99A3B0;font-style:normal;}
.clue.tile-iki-konmaz{fill:var(--ink);font-style:italic;text-decoration:line-through;opacity:.85;}
.clue.tile-lanetli{fill:var(--bad);font-weight:700;}
.clue.tile-ikiz{fill:var(--accent-warm);}
.clue.tile-yanki{fill:var(--accent-cool);font-style:italic;}
.clue.tile-kayan{fill:var(--good);}
```

Toggle() içinde kayan tick:
```javascript
function toggle(k,r,c){
  ...
  if(P.tiles){
    tickKayanTiles(P,Math.random);
  }
  ...
}
```

Lanetli check (checkWin'de): clue===4 ise tüm 4 kenar olmalı (validateLoop zaten lineCount kontrolü yapıyor — clue 4 ise 4 kenar lazım).

Commit: `feat(rogue): puzzle render integration — 6 tile görsel + kayan tick + sis reveal`

---

### Task 6: src/rogue/keepsakes.js

```javascript
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
  return Object.values(KEEPSAKES).filter(k=>meta.achievements[k.achievement]);
}
export function checkAutoUnlock(meta){
  // Called after any achievement unlock — adds keepsake to discovered list
  if(!meta.keepsakes)meta.keepsakes={discovered:[]};
  if(!meta.keepsakes.discovered)meta.keepsakes.discovered=[];
  for(const k of Object.values(KEEPSAKES)){
    if(meta.achievements[k.achievement]&&!meta.keepsakes.discovered.includes(k.id)){
      meta.keepsakes.discovered.push(k.id);
    }
  }
}
```

Commit: `feat(rogue): keepsakes.js — 8 Hediye Boncuğu + auto-unlock`

---

### Task 7: Karakter UI keepsake bölümü + emit hook'unda auto-unlock

renderKarakter'a yeni section ekle (charm slots'un altına):

```javascript
const unlockedKeepsakes=allUnlockedKeepsakes(meta);
const keepsakesHtml=`
  <div style="margin-top:18px;padding:0 4px;">
    <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;">hediye boncukları · ${unlockedKeepsakes.length}/${Object.keys(KEEPSAKES).length}</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${Object.values(KEEPSAKES).map(k=>{
        const owned=unlockedKeepsakes.find(u=>u.id===k.id);
        return `
          <div style="flex:1;min-width:30%;background:${owned?'var(--panel-2)':'var(--panel)'};border:1px solid ${owned?'var(--accent)':'var(--hairline)'};border-radius:10px;padding:10px 8px;text-align:center;${owned?'':'opacity:.45;'}">
            <div style="color:${owned?'var(--accent)':'var(--muted)'};font-family:var(--font-serif);font-size:20px;">✦</div>
            <div style="font-family:var(--font-serif);font-weight:600;font-size:11px;color:var(--ink);margin-top:4px;line-height:1.2;">${owned?k.name:"····"}</div>
          </div>
        `;
      }).join("")}
    </div>
  </div>
`;
```

`achievementUnlock` fonksiyonuna keepsake auto-check ekle:
```javascript
function achievementUnlock(triggerId){
  const ach=emitAchievement(triggerId,meta,a=>{showAchievementToast(a);});
  if(ach){
    checkKeepsakeUnlock(meta);
    saveMeta();
  }
}
```

Imports:
```javascript
import {KEEPSAKES, allUnlockedKeepsakes, checkAutoUnlock as checkKeepsakeUnlock} from "./src/rogue/keepsakes.js";
```

Commit: `feat(rogue-ui): Karakter Hediye Boncukları + auto-unlock on achievement`

---

### Task 8: Mum Modu puzzle-içi tick

`startTimer` fonksiyonunda eğer rogue + candleMode aktifse her saniye run.timeRemaining -1:

```javascript
function startTimer(){
  timerBase=Date.now()-elapsed*1000;
  stopTimer();
  timerId=setInterval(()=>{
    elapsed=((Date.now()-timerBase)/1000)|0;
    $("timer").textContent=fmt(elapsed);
    // Mum modu puzzle tick
    if(ctx.mode==="rogue"){
      const run=store.get(KEYS.rogueRun,null);
      if(run&&run.candleMode&&run.timeRemaining>0){
        run.timeRemaining=Math.max(0,run.timeRemaining-1);
        if(run.timeRemaining%5===0)store.set(KEYS.rogueRun,run); // throttle saves
        if(run.timeRemaining<=0){
          run.ended=true;run.endReason="timeout";
          store.set(KEYS.rogueRun,run);
          stopTimer();
          alert("Mum söndü. Koşu bitti.");
          renderRogueMap(run);showScreen("s-rogue-map");
        }
      }
    }
  },500);
  $("timer").textContent=fmt(elapsed);
}
```

Commit: `feat(rogue): Mum Modu puzzle-içi tick — her saniye -1, süre bitince koşu son`

---

### Task 9: src/rogue/daily.js

```javascript
// src/rogue/daily.js — Daily challenge

const LB_KEY="cember:daily:leaderboard";

export function todaySeed(){
  const d=new Date();
  return `daily-${d.getUTCFullYear()}-${(d.getUTCMonth()+1).toString().padStart(2,"0")}-${d.getUTCDate().toString().padStart(2,"0")}`;
}

export function todayDate(){return todaySeed().slice(6);}

export function hasPlayedToday(store){
  const lb=store.get(LB_KEY,{entries:[]});
  return !!lb.entries.find(e=>e.date===todayDate());
}

export function recordResult(store,{date,time,solves,realmId,success}){
  const lb=store.get(LB_KEY,{entries:[]});
  if(!lb.entries)lb.entries=[];
  // Replace if same date
  lb.entries=lb.entries.filter(e=>e.date!==date);
  lb.entries.push({date,time,solves,realmId,success,recordedAt:Date.now()});
  lb.entries=lb.entries.sort((a,b)=>a.date<b.date?1:-1).slice(0,7); // last 7 days
  store.set(LB_KEY,lb);
  return lb;
}

export function getLeaderboard(store){
  return store.get(LB_KEY,{entries:[]});
}
```

Commit: `feat(rogue): daily.js — todaySeed + leaderboard (local 7-day)`

---

### Task 10: Ana menü "Günün Çemberi" kartı + flow

`renderHome` cards array'ine yeni kart ekle (rogue'dan sonra):

```javascript
const dailyPlayed=todayHasPlayed(store);
cards.push({
  id:"daily",emo:"☀",h:"Günün Çemberi",
  p:dailyPlayed?"bugün oynadın · yarın yeni":"Bugünün özel bulmacası",
  badge:dailyPlayed?"bitirildi":null,
});
```

Click handler:
```javascript
if(id==="daily"){
  if(todayHasPlayed(store)){
    showDailyLeaderboard();
    return;
  }
  const seed=todaySeed();
  const rng=mulberry32(hashSeed(seed));
  startGame(makePuzzle(7,7,0.7,rng),{mode:"daily",seed,date:todayDate()});
}
```

Win callback'inde daily branch:
```javascript
else if(ctx.mode==="daily"){
  recordDaily(store,{date:ctx.date,time:elapsed,solves:1,realmId:null,success:true});
}
```

`showDailyLeaderboard`:
```javascript
function showDailyLeaderboard(){
  const lb=getDailyLB(store);
  const html=`
    <h2>Günün Çemberi</h2>
    <p>Son 7 günün geçmişi.</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin:14px 0;">
      ${lb.entries.length?lb.entries.map(e=>`
        <div style="background:var(--panel);border:1px solid var(--hairline);border-radius:10px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--accent);">${e.date}</span>
          <span style="font-family:var(--font-mono);font-size:13px;color:var(--ink);">${fmt(e.time)}</span>
          <span style="font-family:var(--font-mono);font-size:11px;color:${e.success?'var(--good)':'var(--bad)'};">${e.success?'✓':'×'}</span>
        </div>
      `).join(""):'<p style="color:var(--muted);font-style:italic;text-align:center;">Henüz kayıt yok.</p>'}
    </div>
  `;
  openRogueModal(html,e=>{if(e.target.tagName==="BUTTON")closeRogueModal();});
}
```

Imports:
```javascript
import {todaySeed,todayDate,hasPlayedToday as todayHasPlayed,recordResult as recordDaily,getLeaderboard as getDailyLB} from "./src/rogue/daily.js";
```

Commit: `feat(rogue): Günün Çemberi — ana menü kartı + daily flow + local leaderboard`

---

### Task 11: 4. realm "Düğümün Ardı" + unlock kuralı

`realms.js`'e ekle:

```javascript
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
```

`isRealmUnlocked` veya init kodu unlock kontrolü:

`win()` callback'inde 3 realm cleared sonrası:
```javascript
if(clearedCount>=3){
  if(!meta.realms["dugumun-ardi"])meta.realms["dugumun-ardi"]={};
  meta.realms["dugumun-ardi"].unlocked=true;
}
```

`renderYuva` realm ID listesine ekle:
```javascript
const realmIds=["sogut-esigi","karanlik-igne","yildiz-gecidi","dugumun-ardi"];
```

Commit: `feat(rogue): 4. diyar Düğümün Ardı — 7 floor + tüm relic/event pool + unlock kuralı`

---

### Task 12: D4 achievement (3 ach)

`achievements.js`'e ekle:

```javascript
  "dugumun-ardi-cleared":{
    id:"dugumun-ardi-cleared",realm:"dugumun-ardi",
    title:"Düğümün Sonu",
    body:"Düğümün Ardı'nı tamamladın.",
    diary:"Tüm iplikler döndü. Düğüm çözüldü. Sen başladın.",
    trigger:"realm_cleared:dugumun-ardi",secret:false,
  },
  "dugum-ustasi":{
    id:"dugum-ustasi",realm:"dugumun-ardi",
    title:"Düğüm Ustası",
    body:"Düğüm Ustası'nı yendin.",
    diary:"Düğüm Ustası başını eğdi. Sen ona ipliği uzattın.",
    trigger:"boss_defeated:dugumun-ardi",secret:false,
  },
  "iplgin-sonu":{
    id:"iplgin-sonu",realm:null,
    title:"İpliğin Sonu",
    body:"Tüm 4 diyarı geçtin.",
    diary:"İpliğin sonu yokmuş. Yeni biri başlar.",
    trigger:"realms_cleared_four",secret:false,
  },
```

Win callback'inde 4 realms cleared:
```javascript
if(clearedCount>=4)achievementUnlock("realms_cleared_four");
```

Commit: `feat(rogue): 3 yeni D4 achievement (Düğümün Sonu, Düğüm Ustası, İpliğin Sonu)`

---

### Task 13: tests/core.test.js genişlet

```javascript
import {THORNS, totalIzScore, rewardMultiplier} from "../src/rogue/thorns.js";
import {KEEPSAKES, allUnlockedKeepsakes, checkAutoUnlock} from "../src/rogue/keepsakes.js";
import {todaySeed, todayDate, hasPlayedToday, recordResult, getLeaderboard} from "../src/rogue/daily.js";

test("thorns 10 modifier",()=>eq(THORNS.length,10));
test("iz score sums ranks",()=>{eq(totalIzScore({"daralma":2,"kor-pusula":1}),3);});
test("reward multiplier tiers",()=>{eq(rewardMultiplier(0),1.0);eq(rewardMultiplier(3),1.5);eq(rewardMultiplier(7),2.0);eq(rewardMultiplier(11),2.5);});
test("keepsakes 8",()=>eq(Object.keys(KEEPSAKES).length,8));
test("keepsake autoUnlock adds to discovered",()=>{
  const m={achievements:{"aksam-isigi":{}},keepsakes:{discovered:[]}};
  checkAutoUnlock(m);
  assert(m.keepsakes.discovered.includes("akşam-isigi"));
});
test("today seed format",()=>{assert(todaySeed().startsWith("daily-"));eq(todayDate().length,10);});
```

Commit: `test(core): thorns + keepsakes + daily smoke asserts`

---

### Task 14: Final + merge + push

- [ ] Progress log final
- [ ] Roadmap güncelle: Plan 12 satırı
- [ ] Commit + branch push + main merge + push

---

## Self-Review

**Spec coverage:**
- ✅ Diken Sözleşmesi (10 modifier + UI + apply + iz score)
- ✅ 6 yeni constraint tile + render integration
- ✅ Hediye Boncukları (8 keepsake + auto-unlock + UI)
- ✅ Mum Modu puzzle-içi tick
- ✅ Daily Challenge (seed + leaderboard local)
- ✅ Saklı 4. diyar (7 floor + tüm pool + 3 ach)

**Önerilen dispatch:** Phase'lere böl
- **Dispatch 1:** Phase A + B (Diken + tiles)
- **Dispatch 2:** Phase C + D + E + F + finalize (Hediye + Mum + Daily + 4. diyar)

Veya tek dispatch — büyük ama tamamlanabilir.
