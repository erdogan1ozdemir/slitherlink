# Plan 14 · Rogue Mode Overhaul — Sequential lock + map layout + more content

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Rogue mode'da kritik bug'ı düzelt (puzzle çözmeden ilerleme), map görselini overhaul et (Manhattan path + üst üste binme yok + dynamic spacing), tüm realm'lerde floor/node sayısını arttır, boss zorluğunu artır.

**Bağımlılık:** Plan 13.

**Tahmini süre:** 4-5 saat.

---

## Phase A — CRITICAL Bug Fix: Sequential lock

### A.1 Problem

Mevcut `handleRogueNode(nodeId)` puzzle/elite/boss node'larına tıklanınca **moveTo'yu hemen çağırıyor**:

```javascript
function handleRogueNode(nodeId){
  let run=store.get(KEYS.rogueRun,null);
  if(!run||run.ended)return;
  run=moveTo(run,nodeId);  // ← advances IMMEDIATELY
  ...
  startGame(puzzle, ctx);
}
```

Kullanıcı puzzle'ı yarıda bırakıp map'e dönerse, `currentNodeId` zaten ilerlemiş — sonraki kat node'ları accessible olur. Yani **puzzle'ı çözmeden geçebiliyor**.

### A.2 Fix

`pendingNodeId` field'i ekle. Puzzle node'larda moveTo yapmadan önce pendingNodeId set et, **moveTo'yu win()'e kadar erteleme**:

```javascript
function handleRogueNode(nodeId){
  let run=store.get(KEYS.rogueRun,null);
  if(!run||run.ended)return;
  const node=run.mapGraph.nodes.find(n=>n.id===nodeId);
  if(!node)return;

  if(node.type==="puzzle"||node.type==="elite"||node.type==="boss"){
    // Bekletme: moveTo yok, sadece pending olarak işaretle
    // Eğer aynı node ile midPuzzle varsa resume; farklı node ise midPuzzle clear
    if(run.pendingNodeId&&run.pendingNodeId!==nodeId){
      run.midPuzzle=null;
    }
    run.pendingNodeId=nodeId;
    store.set(KEYS.rogueRun,run);
    if(run.midPuzzle&&run.midPuzzle.ctx&&run.midPuzzle.ctx.nodeId===nodeId){
      startGame(run.midPuzzle.puzzle,run.midPuzzle.ctx,run.midPuzzle);
      return;
    }
    const realm=getRealm(run.realmId);
    const floorCfg=realm.floorConfig&&realm.floorConfig[node.floor];
    const size=floorCfg?floorCfg.sizes[0]:5;
    const keep=floorCfg?floorCfg.keep:0.75;
    const rng=mulberry32(hashSeed(run.seed+"-"+nodeId));
    const puzzle=makePuzzle(size,size,keep,rng);
    applyTiles(puzzle,run.realmId,mulberry32(hashSeed(run.seed+"-"+nodeId+"-tiles")),0.22);
    startGame(puzzle,{mode:"rogue",realmId:run.realmId,nodeId,runRef:true});
  }
  else if(node.type==="chest"||node.type==="locked-chest"){
    run=moveTo(run,nodeId);
    store.set(KEYS.rogueRun,run);
    openChestModal(run,node);
  }
  else if(node.type==="event"){
    run=moveTo(run,nodeId);
    store.set(KEYS.rogueRun,run);
    openEventModal(run,node);
  }
  else if(node.type==="rest"){
    run=moveTo(run,nodeId);
    const heal=1+(run.restBonusHeal||0);
    run.lives.current=Math.min(run.lives.max,run.lives.current+heal);
    store.set(KEYS.rogueRun,run);
    renderRogueMap(run);
  }
  else{
    run=moveTo(run,nodeId);
    store.set(KEYS.rogueRun,run);
    renderRogueMap(run);
  }
}
```

`win()` rogue branch'inde, mevcut multi-stage handling'in YANINA: aynı node'a moveTo'yu çağır:

```javascript
else if(ctx.mode==="rogue"){
  let run=store.get(KEYS.rogueRun,null);
  if(run){
    const node=run.mapGraph.nodes.find(n=>n.id===ctx.nodeId);
    // Multi-stage handling (mevcut) — return early if more stages
    ...
    // YENİ: puzzle gerçekten win — şimdi moveTo
    if(run.pendingNodeId===ctx.nodeId&&run.currentNodeId!==ctx.nodeId){
      try{
        run=moveTo(run,ctx.nodeId);
      }catch(e){console.warn("moveTo failed",e);}
      run.pendingNodeId=null;
    }
    // ...mevcut rewards
  }
}
```

`engine.js`'te `moveTo` already throws if not accessible. Puzzle node'lar accessible olduğundan win'de moveTo başarılı olur.

**Visual indicator:** Map'te `pendingNodeId` varsa o node'un üstüne hafif "⌛" işareti ya da kesik halka.

```javascript
const isPending=run.pendingNodeId===n.id;
// SVG node template'inde:
${isPending?`<circle cx="${cx(n.col)}" cy="${cy(n.floor)}" r="24" fill="none" stroke="var(--bad)" stroke-opacity=".4" stroke-width="2" stroke-dasharray="4 3"/>`:""}
```

---

## Phase B — Map Layout Overhaul

### B.1 Manhattan path routing

Mevcut diagonal lines yerine right-angled (Manhattan) path'ler:

```javascript
${run.mapGraph.edges.map(([a,b])=>{
  const na=run.mapGraph.nodes.find(n=>n.id===a);
  const nb=run.mapGraph.nodes.find(n=>n.id===b);
  const x1=cx(na.col),y1=cy(na.floor)+18,x2=cx(nb.col),y2=cy(nb.floor)-18;
  const visited=visitedSet.has(a)&&visitedSet.has(b);
  const stroke=visited?"var(--accent)":"var(--hairline-2)";
  const opacity=visited?"0.5":"1";
  if(na.col===nb.col){
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="${visited?'0':'3 4'}" opacity="${opacity}"/>`;
  }
  const midY=(y1+y2)/2;
  return `<path d="M ${x1} ${y1} V ${midY} H ${x2} V ${y2}" stroke="${stroke}" stroke-width="1.2" fill="none" stroke-dasharray="${visited?'0':'3 4'}" opacity="${opacity}"/>`;
}).join("")}
```

(`+18` ve `-18` node circle boundary'sine path bağlanma için.)

### B.2 Dynamic SVG height + spacing

Mevcut `H=540` sabit. Floor sayısı arttıkça scrunch oluyor.

```javascript
const W=360;
const floorSpacing=90;  // px per floor
const H=80+floorSpacing*(run.mapGraph.floors-1);
const cy=f=>50+f*floorSpacing;
```

cx için dinamik width (3-4 cols için):
```javascript
const COLS=run.mapGraph.maxWidth||3;
const cx=c=>50+c*((W-100)/(COLS-1||1));
```

### B.3 Floor labels — separate column, no overlap

Etiketleri sol köşede ayrı bir sütunda:

```javascript
const labelsHtml=Object.values(floorLabels).map(l=>{
  const y=cy(l.floor);
  return `
    <text x="22" y="${y-5}" font-family="var(--font-mono)" font-size="9" fill="${l.tag==='GİRİŞ'||l.tag==='BİTİŞ'?'var(--accent)':'var(--muted)'}" letter-spacing="1.5" text-anchor="middle">${l.tag}</text>
    <text x="22" y="${y+8}" font-family="var(--font-serif)" font-size="9" font-style="italic" fill="var(--ink-dim)" text-anchor="middle">${(l.name||"").slice(0,10)}</text>
  `;
}).join("");
```

Node'lar `cx(c)`'den başlasın, label sütununun (max x=44) sağında.

```javascript
const cx=c=>56+c*((W-72)/(COLS-1||1));
```

### B.4 Larger node circles (touch target)

`r=16` → `r=20`. Touch target r=26 → r=32. Glyph font 14 → 16.

```javascript
<circle cx="${cx(n.col)}" cy="${cy(n.floor)}" r="32" fill="transparent" stroke="none" pointer-events="all"/>
<circle cx="${cx(n.col)}" cy="${cy(n.floor)}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="1.2" pointer-events="none"/>
<text x="${cx(n.col)}" y="${cy(n.floor)+1}" text-anchor="middle" dominant-baseline="central" font-family="var(--font-serif)" font-size="16" font-weight="600" fill="${txt}" pointer-events="none">${glyph[n.type]||"?"}</text>
```

Visited halkası r=24 → r=28.

---

## Phase C — More Content per Run

### C.1 Floor count increase

`realms.js`:
- **Söğüt Eşiği (D1):** 5 → **6 floors**
- **Karanlık İğne (D2):** 5 → **8 floors**
- **Yıldız Geçidi (D3):** 5 → **10 floors**
- **Düğümün Ardı (D4):** 7 → **12 floors**

floorConfig listelerini buna göre genişlet. Mevcut isimleri koruyup yenilerini ekle.

**D1 (6 floor):**
```javascript
floorConfig:[
  {sizes:[4,4],keep:0.85,nodes:["puzzle"],floorName:"Pervaz"},
  {sizes:[5,5],keep:0.80,nodes:["puzzle","event","chest"],floorName:"Çayır"},
  {sizes:[5,5],keep:0.78,nodes:["puzzle","chest","event"],floorName:"Söğüt Altı"},
  {sizes:[6,6],keep:0.75,nodes:["elite","event","chest"],floorName:"Eski Sandık"},
  {sizes:[6,6],keep:0.72,nodes:["rest","puzzle","event"],floorName:"Bahçıvanın Yolu"},
  {sizes:[7,7],keep:0.68,nodes:["boss"],floorName:"Akşam Işığı"},
],
```

**D2 (8 floor):**
```javascript
floorConfig:[
  {sizes:[5,5],keep:0.75,nodes:["puzzle"],floorName:"Eşik"},
  {sizes:[6,6],keep:0.72,nodes:["puzzle","event","locked-chest"],floorName:"Toz Koridoru"},
  {sizes:[6,6],keep:0.70,nodes:["elite","chest","event"],floorName:"Kayıp Sayfalar"},
  {sizes:[7,7],keep:0.68,nodes:["puzzle","event","chest"],floorName:"Eski Yazıt"},
  {sizes:[7,7],keep:0.65,nodes:["rest","locked-chest","event"],floorName:"Mürekkep Havuzu"},
  {sizes:[7,7],keep:0.63,nodes:["elite","event","puzzle"],floorName:"Boş Kütüphane"},
  {sizes:[8,8],keep:0.60,nodes:["chest","event","rest"],floorName:"Sessiz Galeri"},
  {sizes:[8,8],keep:0.58,nodes:["boss"],floorName:"Sessiz Kütüphaneci"},
],
```

**D3 (10 floor):**
```javascript
floorConfig:[
  {sizes:[6,6],keep:0.65,nodes:["puzzle"],floorName:"Buzlu Pencere"},
  {sizes:[7,7],keep:0.62,nodes:["elite","event","chest"],floorName:"Kuyruklu Yıldız"},
  {sizes:[7,7],keep:0.60,nodes:["puzzle","elite","event"],floorName:"Düş Eşiği"},
  {sizes:[7,7],keep:0.58,nodes:["chest","event","rest"],floorName:"Sis Dağı"},
  {sizes:[8,8],keep:0.55,nodes:["elite","puzzle","chest"],floorName:"Ay Saati"},
  {sizes:[8,8],keep:0.52,nodes:["event","rest","chest"],floorName:"Buz Saraylar"},
  {sizes:[8,8],keep:0.50,nodes:["puzzle","elite","event"],floorName:"Yıldız Bahçesi"},
  {sizes:[9,9],keep:0.48,nodes:["chest","rest","puzzle"],floorName:"Gece Kıyısı"},
  {sizes:[9,9],keep:0.46,nodes:["elite","event","chest"],floorName:"Yıldız Tarlası"},
  {sizes:[10,10],keep:0.45,nodes:["boss"],floorName:"Yıldız İplikçisi"},
],
```

**D4 (12 floor):**
```javascript
floorConfig:[
  {sizes:[7,7],keep:0.55,nodes:["puzzle"],floorName:"Eşik"},
  {sizes:[7,7],keep:0.52,nodes:["puzzle","event","chest"],floorName:"Hatıra"},
  {sizes:[8,8],keep:0.50,nodes:["elite","event","chest"],floorName:"Yankı"},
  {sizes:[8,8],keep:0.48,nodes:["puzzle","chest","event"],floorName:"Sis"},
  {sizes:[8,8],keep:0.47,nodes:["elite","event","rest"],floorName:"Düğüm Bahçesi"},
  {sizes:[9,9],keep:0.45,nodes:["rest","elite","event"],floorName:"Düğüm"},
  {sizes:[9,9],keep:0.44,nodes:["chest","elite","puzzle"],floorName:"Ardı"},
  {sizes:[9,9],keep:0.42,nodes:["chest","event","puzzle"],floorName:"İpliğin Sonu"},
  {sizes:[10,10],keep:0.41,nodes:["puzzle","elite","event"],floorName:"Patika Sonu"},
  {sizes:[10,10],keep:0.40,nodes:["rest","chest","event"],floorName:"Düğüm Eşiği"},
  {sizes:[11,11],keep:0.40,nodes:["elite","puzzle","event"],floorName:"İpliğin Kuyusu"},
  {sizes:[12,12],keep:0.38,nodes:["boss"],floorName:"Düğüm Ustası"},
],
```

### C.2 More nodes per floor

`map.js` generateMap'i:

```javascript
const W=config.maxWidth||4;
...
}else if(f===0){
  nodes.push({id:idOf(0,Math.floor(W/2)),floor:0,col:Math.floor(W/2),type:"puzzle"});
}else{
  const minWidth=2;
  const width=Math.min(W,minWidth+((rng()*(W-minWidth+1))|0)); // 2..W
  const cols=[];
  const usedCols=new Set();
  while(cols.length<width){
    const c=(rng()*W)|0;
    if(!usedCols.has(c)){usedCols.add(c);cols.push(c);}
  }
  cols.sort((a,b)=>a-b);
  for(const c of cols){
    let preferredType=null;
    const floorCfg=config.floorConfig&&config.floorConfig[f];
    if(floorCfg&&floorCfg.nodes&&floorCfg.nodes.length){
      preferredType=floorCfg.nodes[(rng()*floorCfg.nodes.length)|0];
    }else{
      preferredType=types[(rng()*types.length)|0];
    }
    nodes.push({id:idOf(f,c),floor:f,col:c,type:preferredType});
  }
}
```

`maxWidth=4` default, floorConfig'ten okur.

`startRogueRun`'da realm.floorConfig'i generateMap config'ine geçir:
```javascript
activeRun=startRun({realmId,seed,config:{floors:realm.floors,maxWidth:4,floorConfig:realm.floorConfig}});
```

`engine.js startRun` config'i map.js'e geçirir:
```javascript
const map=generateMap(seed,{floors:cfg.floors,maxWidth:cfg.maxWidth||3,floorConfig:cfg.floorConfig});
```

### C.3 Boss difficulty scaling

D2 ve D3 boss'larında zorluk:
- D2 boss: size 7→8, keep 0.60→0.55
- D3 boss: size 9→10, keep 0.50→0.45 (3-stage zaten var)
- D4 boss: size 10→12, keep 0.40→0.36, **bossMultiStage:4** ekle

`realms.js`'te D3 zaten `bossMultiStage:3`. D4'e ekle:
```javascript
"dugumun-ardi":{
  ...
  bossMultiStage:4,
},
```

`win()` callback multi-stage handling D4'te de çalışır (zaten realm.bossMultiStage'i okuyor).

### C.4 Constraint tile density per realm

`tiles.js applyTiles` density artırılsın realm bazlı:

`handleRogueNode` puzzle bloğunda:
```javascript
const realm=getRealm(run.realmId);
const tileDensity=({
  "sogut-esigi":0.15,
  "karanlik-igne":0.22,
  "yildiz-gecidi":0.30,
  "dugumun-ardi":0.35,
})[run.realmId]||0.22;
const isBoss=node.type==="boss";
const finalDensity=isBoss?tileDensity*1.5:tileDensity;
applyTiles(puzzle,run.realmId,mulberry32(hashSeed(run.seed+"-"+nodeId+"-tiles")),finalDensity);
```

---

## Phase D — Visual Polish

### D.1 Visited path opacity

Visited edges parlak (accent), unvisited dashed (hairline).

### D.2 Node hover/active states

CSS:
```css
[data-node-id][data-accessible="1"]:hover circle:not([pointer-events="none"]){opacity:.85;}
```

### D.3 Pending indicator (Phase A.2'de zaten var)

---

## Görevler

### Task 1: Branch + log

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-14 -b plan-14-rogue-overhaul
cd "../slitherlink-plan-14"
```

`docs/log/plan-14-progress.md`:
```markdown
# Plan 14 Progress
## Phase A — CRITICAL
- [ ] Task 1: Branch + log
- [ ] Task 2: Sequential lock fix (pendingNodeId pattern)
## Phase B — Map layout
- [ ] Task 3: Manhattan edge routing + dynamic SVG height + larger nodes
- [ ] Task 4: Floor labels separate column + no overlap
## Phase C — More content
- [ ] Task 5: realms.js floor counts (D1:6, D2:8, D3:10, D4:12) + isimler
- [ ] Task 6: map.js generateMap node distribution genişletme
- [ ] Task 7: Boss difficulty scaling + D4 multi-stage
- [ ] Task 8: Constraint tile density per realm
## Final
- [ ] Task 9: Final + merge + push
```

Commit: `chore(plan-14): start — branch + log`

### Tasks 2-8

Spec'teki bölümleri sırayla uygula. Her bağımsız fix kendi commit'i.

### Task 9: Final + merge + push

Roadmap güncelle: `14 — Rogue overhaul (sequential lock + map + more content) | ✓ tamamlandı | <SHA>`.

---

## Self-Review

- ✅ Sequential lock (pendingNodeId, win-deferred moveTo)
- ✅ Manhattan path routing
- ✅ Dynamic SVG height
- ✅ Floor labels no overlap
- ✅ Larger touch targets
- ✅ Floor counts 6/8/10/12
- ✅ More nodes per floor (up to 4)
- ✅ Boss difficulty scaling
- ✅ Constraint tile density per realm

**Önerilen dispatch:** Tek dispatch, 9 task. Plan A öncelikli — kritik bug.
