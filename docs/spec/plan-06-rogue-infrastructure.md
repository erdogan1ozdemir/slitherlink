# Plan 06 · Rogue Infrastructure (Yuva + Karakter + İpliklik + Diken + engine + stub realm)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Rogue modunu kilitten aç. Yuva (hub), Karakter ekranı, İpliklik (empty shell), Diken Sözleşmesi (empty shell), Rogue run engine, branching map, stub realm — uçtan uca oynanabilir.

**Architecture:** Yeni modüller `src/rogue/`. UI ekranları index.html'de (state monolitik kalır, Plan 05 felsefesi). Stub realm: 1 puzzle node + 1 boss node + 0 relic (minimum). Plan 07+'da gerçek diyar içerikleri.

**Tech Stack:** Vanilla ES modules. `src/core/` import edilir.

**Bağımlılık:** Plan 05 tamamlanmış.

**Tahmini süre:** 5-7 saat.

---

## Scope (v1 minimum)

**Plan 06 v1 — Minimum viable rogue:**
- ✅ Rogue Modu kart kilidi kalkar
- ✅ Yuva ekranı (mini Jedi + 3 realm card + stats chip + 4 button)
- ✅ Stub realm: tıklayınca map → puzzle → boss → win/lose
- ✅ Run engine (state machine + autosave)
- ✅ Branching map generator (basit: 3 floor × 2 node)
- ✅ Karakter ekranı (Jedi avatar + stats)
- ✅ İpliklik shell ("yakında" placeholder)
- ✅ Diken Sözleşmesi shell ("yakında" placeholder)

**Plan 06 dışı (Plan 07+):**
- Gerçek diyar içerikleri (Söğüt Eşiği vb.)
- Yuva Fısıltısı (Neow start choice)
- Pusula Yıldızı progression
- Achievement triggers
- Constraint tiles
- İpliklik talent gerçek fonksiyonu
- Diken Sözleşmesi modifier'ları gerçek

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `src/rogue/engine.js` | Create | Run state machine (start, step, win, lose, save/load) |
| `src/rogue/map.js` | Create | Branching map generator (deterministic seed) |
| `src/rogue/stub-realm.js` | Create | Minimum realm data (1 puzzle floor + 1 boss) |
| `index.html` | Modify | Yuva/Karakter/İpliklik/Diken HTML + JS event binding; Rogue kart unlock |
| `docs/log/plan-06-progress.md` | Create | Progress notları |

---

## Görevler

### Task 1: Branch + dir + progress log

- [ ] Worktree:
  ```bash
  cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
  git worktree add ../slitherlink-plan-06 -b plan-06-rogue-infrastructure
  cd "../slitherlink-plan-06"
  mkdir -p src/rogue
  ```
- [ ] `docs/log/plan-06-progress.md` oluştur ve kısa checklist yaz
- [ ] Commit: `chore(plan-06): start — branch + log + src/rogue/ dir`

---

### Task 2: src/rogue/map.js — branching map generator

```javascript
// src/rogue/map.js — Branching map generator for rogue runs

import {mulberry32} from "../core/rng.js";

/**
 * Generates a branching map for a rogue run.
 * Structure: F floors, each floor has 1-3 nodes. Last floor = boss (single node).
 * Edges: each node connects to 1-2 nodes on the next floor (nearest by column).
 *
 * @param {string} seed — string for hashSeed
 * @param {object} config — {floors:5, maxWidth:3, nodeTypes:['puzzle','elite','chest','rest','event']}
 * @returns {object} { nodes: [{id, floor, col, type}], edges: [[fromId, toId]] }
 */
export function generateMap(seed, config={}){
  const F=config.floors||5;
  const W=config.maxWidth||3;
  const types=config.nodeTypes||["puzzle","puzzle","elite","chest","rest","event"];
  // Hash seed → rng
  let h=2166136261>>>0;
  for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}
  const rng=mulberry32(h>>>0);

  const nodes=[];
  const idOf=(f,c)=>`${f}-${c}`;
  for(let f=0;f<F;f++){
    if(f===F-1){
      // Boss floor — single node at center
      nodes.push({id:idOf(f,Math.floor(W/2)),floor:f,col:Math.floor(W/2),type:"boss"});
    }else if(f===0){
      // Start — single node
      nodes.push({id:idOf(0,Math.floor(W/2)),floor:0,col:Math.floor(W/2),type:"puzzle"});
    }else{
      // Middle floor — 2-3 nodes
      const width=2+(rng()<0.5?1:0);
      const cols=[];
      if(width===2){cols.push(0,W-1);}
      else{cols.push(0,Math.floor(W/2),W-1);}
      for(const c of cols){
        const t=types[(rng()*types.length)|0];
        nodes.push({id:idOf(f,c),floor:f,col:c,type:t});
      }
    }
  }

  // Edges: each non-last node connects to 1-2 nearest next-floor nodes
  const edges=[];
  for(let f=0;f<F-1;f++){
    const cur=nodes.filter(n=>n.floor===f);
    const nxt=nodes.filter(n=>n.floor===f+1);
    for(const c of cur){
      const sorted=nxt.slice().sort((a,b)=>Math.abs(a.col-c.col)-Math.abs(b.col-c.col));
      edges.push([c.id,sorted[0].id]);
      if(sorted.length>1&&rng()>0.4){
        edges.push([c.id,sorted[1].id]);
      }
    }
  }

  return {nodes,edges,floors:F,maxWidth:W};
}

/**
 * Returns the list of nodes reachable from a given visited path.
 */
export function nextAccessibleNodes(map, currentNodeId){
  return map.edges.filter(([from])=>from===currentNodeId).map(([_,to])=>to);
}
```

Commit: `feat(rogue): map.js — branching map generator (seedable)`

---

### Task 3: src/rogue/engine.js — run state machine

```javascript
// src/rogue/engine.js — Rogue run state machine

import {generateMap, nextAccessibleNodes} from "./map.js";

const DEFAULTS={
  lives:3,
  floors:5,
};

/**
 * Starts a new rogue run.
 */
export function startRun({realmId, seed, config={}}){
  const cfg={...DEFAULTS,...config};
  const map=generateMap(seed,{floors:cfg.floors,maxWidth:3});
  const startNode=map.nodes.find(n=>n.floor===0);
  return {
    realmId,
    seed,
    startedAt:Date.now(),
    floor:0,
    currentNodeId:startNode.id,
    lives:{current:cfg.lives,max:cfg.lives},
    relics:[],
    mapGraph:map,
    visited:[startNode.id],
    rngState:0,
    elapsedInRun:0,
    midPuzzle:null,
    ended:false,
    endReason:null,
  };
}

/**
 * Move to a node (must be in accessible set).
 */
export function moveTo(run, nodeId){
  const accessible=nextAccessibleNodes(run.mapGraph,run.currentNodeId);
  if(!accessible.includes(nodeId))throw new Error("Node not accessible: "+nodeId);
  const node=run.mapGraph.nodes.find(n=>n.id===nodeId);
  run.currentNodeId=nodeId;
  run.floor=node.floor;
  run.visited.push(nodeId);
  run.midPuzzle=null;
  return run;
}

/**
 * Apply a hit (lose 1 life). Returns updated run; sets ended if lives=0.
 */
export function loseLife(run){
  run.lives.current=Math.max(0,run.lives.current-1);
  if(run.lives.current===0){
    run.ended=true;
    run.endReason="no-lives";
  }
  return run;
}

/**
 * Mark run as won (boss defeated).
 */
export function winRun(run){
  run.ended=true;
  run.endReason="cleared";
  return run;
}

/**
 * Get current node object.
 */
export function currentNode(run){
  return run.mapGraph.nodes.find(n=>n.id===run.currentNodeId);
}
```

Commit: `feat(rogue): engine.js — run state machine (start/move/lose/win)`

---

### Task 4: src/rogue/stub-realm.js — minimal realm data

```javascript
// src/rogue/stub-realm.js — Minimal placeholder realm; Plan 07'de gerçek diyar gelecek

export const STUB_REALM={
  id:"stub-diyar",
  name:"Deneme Diyarı",
  intro:"Bu bir geçici deneme diyarıdır. Gerçek diyarlar yakında.",
  accent:"#A89B8B",
  floors:3,
  defaultPuzzleSize:5,
  defaultPuzzleKeep:0.75,
  bossPuzzleSize:6,
  bossPuzzleKeep:0.65,
};
```

Commit: `feat(rogue): stub-realm.js — minimum realm placeholder`

---

### Task 5: index.html — Rogue kart kilidi kalkar + Yuva HTML

**Edit 1: Rogue kart unlock**

`renderHome` cards array'inde:

old_string:
```
    {id:"rogue",emo:"☠",h:"Rogue Modu",p:"Yakında — canlar, eşyalar, rastgele kat",locked:true},
```

new_string:
```
    {id:"rogue",emo:"☠",h:"Rogue Modu",p:"Yuva'na git, bir diyar seç"},
```

**Edit 2: Home cards listener — rogue handler**

Mevcut `$("homeCards").addEventListener` bloğunda rogue handler `return` ediyordu. Şimdi Yuva'ya geçsin:

old_string:
```
  if(id==="rogue")return;
```

new_string:
```
  if(id==="rogue"){renderYuva();showScreen("s-yuva");return;}
```

**Edit 3: Yeni screen'ler ekle (game screen'in altına)**

`<section class="screen" id="s-game">` blok kapanışından sonra yeni screen'ler ekle:

```html
  <!-- YUVA (Rogue hub) -->
  <section class="screen" id="s-yuva">
    <div class="topbar"><button class="iconbtn" data-back>‹</button><div class="ttl">Yuva</div>
      <button class="iconbtn" id="yuvaSettings">⚙</button></div>
    <div class="scroll">
      <div id="yuvaContent"></div>
    </div>
  </section>

  <!-- KARAKTER -->
  <section class="screen" id="s-karakter">
    <div class="topbar"><button class="iconbtn" data-back>‹</button><div class="ttl">Karakter</div></div>
    <div class="scroll"><div id="karakterContent"></div></div>
  </section>

  <!-- IPLIKLIK -->
  <section class="screen" id="s-ipliklik">
    <div class="topbar"><button class="iconbtn" data-back>‹</button><div class="ttl">İpliklik</div></div>
    <div class="scroll"><div id="ipliklikContent"></div></div>
  </section>

  <!-- DIKEN SOZLESMESI -->
  <section class="screen" id="s-diken">
    <div class="topbar"><button class="iconbtn" data-back>‹</button><div class="ttl">Diken Sözleşmesi</div></div>
    <div class="scroll"><div id="dikenContent"></div></div>
  </section>

  <!-- ROGUE MAP -->
  <section class="screen" id="s-rogue-map">
    <div class="topbar"><button class="iconbtn" data-back>‹</button><div class="ttl" id="rogueMapTitle">Koşu</div></div>
    <div class="scroll"><div id="rogueMapContent"></div></div>
  </section>
```

**Edit 4: data-back handler for yuva — back to home**

Mevcut `data-back` listener (line ~885 civarı) tüm geri butonları için `renderHome` çağırıyor. Yuva için de çalışır. Karakter/İpliklik/Diken/RogueMap için back button basıldığında Yuva'ya dönmeli. Bu özel davranış için `data-back` listener'ını override edilebilir bir yapıya çeviriyoruz:

old_string:
```
document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>{renderHome();showScreen("s-home");}));
```

new_string:
```
document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",e=>{
  const screen=e.target.closest(".screen");
  if(screen&&["s-karakter","s-ipliklik","s-diken","s-rogue-map"].includes(screen.id)){
    renderYuva();showScreen("s-yuva");
  }else{
    renderHome();showScreen("s-home");
  }
}));
```

Commit: `feat(rogue-ui): Rogue kart kilidi açıldı + Yuva/Karakter/İpliklik/Diken/Map screen'leri`

---

### Task 6: index.html — Yuva render + module import

**Edit 1: Script bloğunun başına rogue import'ları ekle**

Mevcut script imports (Plan 05'ten):
```javascript
import {hashSeed, mulberry32} from "./src/core/rng.js";
import {makePuzzle} from "./src/core/generator.js";
import {lineCount as _lineCount, decided as _decided, validateLoop} from "./src/core/checker.js";
```

Bu satırların altına ekle:
```javascript
import {startRun, moveTo, loseLife, winRun, currentNode as rogueCurrentNode} from "./src/rogue/engine.js";
import {generateMap, nextAccessibleNodes} from "./src/rogue/map.js";
import {STUB_REALM} from "./src/rogue/stub-realm.js";
```

**Edit 2: renderYuva fonksiyonu ekle**

`renderHome` fonksiyonundan SONRA yeni fonksiyonlar ekle. Önce `function renderHome` blokunu bul (Read), sonra Edit'le onun kapanışından sonraya yeni fonksiyonlar enjekte et:

```javascript
function renderYuva(){
  const realms=[
    {id:STUB_REALM.id,name:STUB_REALM.name,intro:STUB_REALM.intro,unlocked:true,accent:"--accent-warm"},
    {id:"sogut-esigi",name:"Söğüt Eşiği",intro:"Yakında — Plan 07'de gelecek",unlocked:false,accent:"--accent-warm"},
    {id:"karanlik-igne",name:"Karanlık İğne",intro:"Yakında — Plan 08'de gelecek",unlocked:false,accent:"--accent"},
  ];
  const activeRun=store.get(KEYS.rogueRun||"cember:rogue:run",null);
  const totalRuns=meta.totalStats.runs;
  const totalSolves=meta.totalStats.solves;
  const html=`
    <div style="text-align:center;padding:18px 0 4px;">
      <svg width="80" height="60" viewBox="0 0 80 60" style="display:inline-block;">
        <!-- Jedi silueti (oturmuş, kuyruk kıvrık) -->
        <ellipse cx="40" cy="46" rx="20" ry="8" fill="var(--panel)"/>
        <path d="M28 46 Q26 30 32 22 Q36 18 42 20 Q48 22 50 30 Q52 38 50 46 Z" fill="none" stroke="var(--accent)" stroke-width="1.2"/>
        <path d="M28 24 L32 18 L34 22 Z M50 24 L54 18 L52 22 Z" fill="none" stroke="var(--accent)" stroke-width="1"/>
        <circle cx="36" cy="28" r="1" fill="var(--accent)"/>
        <circle cx="44" cy="28" r="1" fill="var(--accent)"/>
        <path d="M58 44 Q66 38 64 30" fill="none" stroke="var(--accent)" stroke-width="1.2" opacity=".6"/>
      </svg>
      <div style="font-family:var(--font-serif);font-style:italic;font-size:14px;color:var(--ink-dim);margin-top:6px;">
        ${activeRun?"koşu yarıda kaldı":"yeni bir iplik bekler"}
      </div>
    </div>
    <div class="cards" style="margin-top:18px;">
      ${realms.map(r=>`
        <div class="card ${r.unlocked?'':'locked'}" data-realm="${r.id}" data-unlocked="${r.unlocked}">
          <div class="emo" style="color:var(${r.accent});">◇</div>
          <div class="meta">
            <h3>${r.name}</h3>
            <p>${r.intro}</p>
          </div>
          <div class="go">${r.unlocked?'›':'◌'}</div>
        </div>
      `).join("")}
    </div>
    <div style="text-align:center;font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);padding:18px 0 14px;">
      ${totalRuns} koşu · ${totalSolves} çözüm
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;padding:0 4px;">
      <button class="opt" data-yuva-nav="karakter" style="background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);text-align:left;padding:14px 18px;">
        <span style="float:right;color:var(--muted);">›</span>
        <b style="font-family:var(--font-serif);font-weight:600;display:block;color:var(--ink);">Karakter</b>
        <span style="font-family:var(--font-body);font-weight:400;font-size:12px;color:var(--muted);">Jedi'nin kartı</span>
      </button>
      <button class="opt" data-yuva-nav="ipliklik" style="background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);text-align:left;padding:14px 18px;">
        <span style="float:right;color:var(--muted);">›</span>
        <b style="font-family:var(--font-serif);font-weight:600;display:block;color:var(--ink);">İpliklik</b>
        <span style="font-family:var(--font-body);font-weight:400;font-size:12px;color:var(--muted);">Kalıcı geliştirmeler</span>
      </button>
      <button class="opt" data-yuva-nav="diken" style="background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);text-align:left;padding:14px 18px;">
        <span style="float:right;color:var(--muted);">›</span>
        <b style="font-family:var(--font-serif);font-weight:600;display:block;color:var(--ink);">Diken Sözleşmesi</b>
        <span style="font-family:var(--font-body);font-weight:400;font-size:12px;color:var(--muted);">Zorluk modifier'ları</span>
      </button>
    </div>
  `;
  $("yuvaContent").innerHTML=html;
}

function renderKarakter(){
  const stats=meta.totalStats;
  const html=`
    <div style="text-align:center;padding:24px 0 18px;">
      <svg width="120" height="100" viewBox="0 0 120 100">
        <!-- Daha detaylı Jedi avatarı -->
        <ellipse cx="60" cy="80" rx="30" ry="10" fill="var(--panel)"/>
        <path d="M40 78 Q36 50 46 38 Q54 32 60 34 Q66 32 74 38 Q84 50 80 78 Z" fill="var(--panel-2)" stroke="var(--accent)" stroke-width="1.4"/>
        <path d="M40 40 L46 28 L50 38 Z M80 40 L74 28 L70 38 Z" fill="var(--panel-2)" stroke="var(--accent)" stroke-width="1.2"/>
        <circle cx="52" cy="50" r="2" fill="var(--accent)"/>
        <circle cx="68" cy="50" r="2" fill="var(--accent)"/>
        <path d="M58 56 L60 60 L62 56" fill="none" stroke="var(--accent)" stroke-width="1"/>
        <!-- bıyıklar -->
        <line x1="40" y1="56" x2="52" y2="56" stroke="var(--accent)" stroke-width=".8" opacity=".5"/>
        <line x1="68" y1="56" x2="80" y2="56" stroke="var(--accent)" stroke-width=".8" opacity=".5"/>
        <!-- kuyruk -->
        <path d="M88 76 Q104 64 98 48" fill="none" stroke="var(--accent)" stroke-width="1.4" opacity=".7"/>
      </svg>
      <div style="font-family:var(--font-serif);font-style:italic;font-size:15px;color:var(--ink-dim);margin-top:10px;line-height:1.5;">
        Jedi<br><span style="font-size:12px;color:var(--muted);">Norveç orman kedisi · dişi · sessiz ortağın</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 4px;">
      ${[
        ["Toplam koşu", stats.runs],
        ["Çözüm", stats.solves],
        ["Toplam süre", Math.floor(stats.time/60)+"dk"],
        ["İpucu", stats.hintsUsed],
        ["İplik", meta.currencies.thread],
        ["Boncuk", meta.currencies.bead],
      ].map(([k,v])=>`
        <div style="background:var(--panel);border:1px solid var(--hairline);border-radius:14px;padding:14px;text-align:center;">
          <div style="font-family:var(--font-serif);font-weight:500;font-size:24px;color:var(--ink);">${v}</div>
          <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-top:4px;">${k}</div>
        </div>
      `).join("")}
    </div>
  `;
  $("karakterContent").innerHTML=html;
}

function renderIpliklik(){
  $("ipliklikContent").innerHTML=`
    <div style="text-align:center;padding:48px 24px;">
      <div style="font-family:var(--font-serif);font-style:italic;color:var(--accent);font-size:18px;margin-bottom:8px;">İpliklik</div>
      <p style="font-family:var(--font-serif);font-style:italic;color:var(--ink-dim);line-height:1.6;">
        koşulardan kazanılan iplik burada<br>kalıcı yetenekler olarak örülür.
      </p>
      <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:18px;">
        Yakında — Plan 07
      </div>
    </div>
  `;
}

function renderDiken(){
  $("dikenContent").innerHTML=`
    <div style="text-align:center;padding:48px 24px;">
      <div style="font-family:var(--font-serif);font-style:italic;color:var(--accent);font-size:18px;margin-bottom:8px;">Diken Sözleşmesi</div>
      <p style="font-family:var(--font-serif);font-style:italic;color:var(--ink-dim);line-height:1.6;">
        kendi zorluğunu seç.<br>her iz, koşu sonunda daha çok ödül.
      </p>
      <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:18px;">
        Yakında — Plan 09
      </div>
    </div>
  `;
}

// Yuva navigation handler
function setupYuvaListeners(){
  $("yuvaContent").addEventListener("click",e=>{
    const realmCard=e.target.closest("[data-realm]");
    if(realmCard){
      if(realmCard.dataset.unlocked==="false")return;
      const realmId=realmCard.dataset.realm;
      startRogueRun(realmId);
      return;
    }
    const navBtn=e.target.closest("[data-yuva-nav]");
    if(navBtn){
      const where=navBtn.dataset.yuvaNav;
      if(where==="karakter"){renderKarakter();showScreen("s-karakter");}
      else if(where==="ipliklik"){renderIpliklik();showScreen("s-ipliklik");}
      else if(where==="diken"){renderDiken();showScreen("s-diken");}
    }
  });
}
setupYuvaListeners();
```

**Edit 3: KEYS.rogueRun ekle**

KEYS tanımına ekle:

old_string:
```
const KEYS={settings:"cember:settings",freeCur:"cember:free:current",
  jrnProg:"cember:journey:progress",jrnCur:"cember:journey:current",stats:"cember:stats",meta:"cember:meta"};
```

new_string:
```
const KEYS={settings:"cember:settings",freeCur:"cember:free:current",
  jrnProg:"cember:journey:progress",jrnCur:"cember:journey:current",stats:"cember:stats",meta:"cember:meta",rogueRun:"cember:rogue:run"};
```

Commit: `feat(rogue-ui): Yuva + Karakter + İpliklik + Diken render fonksiyonları`

---

### Task 7: index.html — startRogueRun + rogue map render + node click → puzzle

```javascript
function startRogueRun(realmId){
  let activeRun=store.get(KEYS.rogueRun,null);
  if(!activeRun||activeRun.realmId!==realmId||activeRun.ended){
    const seed="rogue-"+realmId+"-"+Date.now();
    activeRun=startRun({realmId,seed,config:{floors:STUB_REALM.floors}});
    store.set(KEYS.rogueRun,activeRun);
    meta.totalStats.runs=(meta.totalStats.runs||0)+1;saveMeta();
  }
  renderRogueMap(activeRun);
  showScreen("s-rogue-map");
}

function renderRogueMap(run){
  const realm=STUB_REALM; // future: realm registry lookup
  const W=380,H=420;
  const cx=c=>40+c*((W-80)/2);
  const cy=f=>40+f*((H-80)/(run.mapGraph.floors-1));
  const accessible=new Set(nextAccessibleNodes(run.mapGraph,run.currentNodeId));
  const visited=new Set(run.visited);
  const current=run.currentNodeId;

  const glyph={puzzle:"◇",elite:"☆",chest:"⬚",rest:"◐",event:"?",boss:"☠"};

  const livesHtml=`<span style="color:var(--bad);">${"♥".repeat(run.lives.current)}</span><span style="color:var(--faint);">${"♥".repeat(run.lives.max-run.lives.current)}</span>`;

  const svg=`
    <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;">
      ${run.mapGraph.edges.map(([a,b])=>{
        const na=run.mapGraph.nodes.find(n=>n.id===a);
        const nb=run.mapGraph.nodes.find(n=>n.id===b);
        return `<line x1="${cx(na.col)}" y1="${cy(na.floor)}" x2="${cx(nb.col)}" y2="${cy(nb.floor)}" stroke="var(--hairline-2)" stroke-width="1" stroke-dasharray="3 4"/>`;
      }).join("")}
      ${run.mapGraph.nodes.map(n=>{
        const isCur=n.id===current,isVis=visited.has(n.id),isAcc=accessible.has(n.id);
        const fill=isCur?"var(--ink)":(isVis?"var(--panel-2)":"var(--bg)");
        const stroke=isCur?"var(--accent)":(isAcc?"var(--accent)":"var(--hairline-2)");
        const txt=isCur?"var(--bg)":(isVis||isAcc?"var(--accent)":"var(--muted)");
        return `
          ${isCur?`<circle cx="${cx(n.col)}" cy="${cy(n.floor)}" r="22" fill="none" stroke="var(--accent)" stroke-opacity=".25" stroke-width="6"/>`:""}
          <g data-node-id="${n.id}" data-accessible="${isAcc&&!isCur?"1":"0"}" style="cursor:${isAcc&&!isCur?"pointer":"default"};">
            <circle cx="${cx(n.col)}" cy="${cy(n.floor)}" r="16" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
            <text x="${cx(n.col)}" y="${cy(n.floor)+1}" text-anchor="middle" dominant-baseline="central" font-family="var(--font-serif)" font-size="14" font-weight="600" fill="${txt}">${glyph[n.type]||"?"}</text>
          </g>
        `;
      }).join("")}
    </svg>
  `;

  $("rogueMapTitle").textContent=realm.name;
  $("rogueMapContent").innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0 16px;">
      <div>${livesHtml}</div>
      <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);">KAT ${run.floor+1}/${run.mapGraph.floors}</div>
      <div style="font-family:var(--font-mono);font-size:12px;color:var(--accent);">◇ ${run.relics.length}</div>
    </div>
    <div style="background:var(--panel);border:1px solid var(--hairline);border-radius:18px;padding:14px;">
      ${svg}
    </div>
    ${run.ended?`
      <div style="text-align:center;padding:20px;">
        <div style="font-family:var(--font-serif);font-style:italic;font-size:18px;color:var(--accent);">
          ${run.endReason==="cleared"?"İplik tamamlandı":"İplik koptu"}
        </div>
        <button class="bigbtn" id="rogueNewBtn" style="margin-top:14px;">Yeni Koşu</button>
      </div>
    `:""}
  `;
  // Bind node clicks
  $("rogueMapContent").querySelectorAll("[data-node-id]").forEach(g=>{
    g.addEventListener("click",()=>{
      if(g.dataset.accessible!=="1")return;
      handleRogueNode(g.dataset.nodeId);
    });
  });
  const newBtn=$("rogueNewBtn");
  if(newBtn)newBtn.addEventListener("click",()=>{store.del(KEYS.rogueRun);renderYuva();showScreen("s-yuva");});
}

function handleRogueNode(nodeId){
  let run=store.get(KEYS.rogueRun,null);
  if(!run||run.ended)return;
  run=moveTo(run,nodeId);
  store.set(KEYS.rogueRun,run);
  const node=rogueCurrentNode(run);
  if(node.type==="puzzle"||node.type==="elite"||node.type==="boss"){
    // Start a puzzle in rogue context
    const size=node.type==="boss"?STUB_REALM.bossPuzzleSize:STUB_REALM.defaultPuzzleSize;
    const keep=node.type==="boss"?STUB_REALM.bossPuzzleKeep:STUB_REALM.defaultPuzzleKeep;
    const rng=mulberry32(hashSeed(run.seed+"-"+nodeId));
    startGame(makePuzzle(size,size,keep,rng),{mode:"rogue",realmId:run.realmId,nodeId,runRef:true});
  }else{
    // Stub: non-puzzle nodes auto-pass for v1
    renderRogueMap(run);
  }
}
```

**Edit — startGame'in `win` callback'i rogue mode'da farklı davransın**

`function win()` içine rogue handling ekle:

old_string:
```
function win(){solved=true;stopTimer();buzz([16,40,24]);
  if(ctx.mode==="journey"){const p=journeyProgress();p.unlocked=Math.max(p.unlocked,ctx.levelIndex+1);
    const bt=p.times[ctx.levelIndex];if(bt==null||elapsed<bt)p.times[ctx.levelIndex]=elapsed;store.set(KEYS.jrnProg,p);store.del(KEYS.jrnCur);}
  else store.del(KEYS.freeCur);
```

new_string:
```
function win(){solved=true;stopTimer();buzz([16,40,24]);
  meta.totalStats.solves=(meta.totalStats.solves||0)+1;saveMeta();
  if(ctx.mode==="journey"){const p=journeyProgress();p.unlocked=Math.max(p.unlocked,ctx.levelIndex+1);
    const bt=p.times[ctx.levelIndex];if(bt==null||elapsed<bt)p.times[ctx.levelIndex]=elapsed;store.set(KEYS.jrnProg,p);store.del(KEYS.jrnCur);}
  else if(ctx.mode==="rogue"){
    let run=store.get(KEYS.rogueRun,null);
    if(run){
      const node=run.mapGraph.nodes.find(n=>n.id===ctx.nodeId);
      if(node&&node.type==="boss"){winRun(run);meta.currencies.bead=(meta.currencies.bead||0)+1;}
      meta.currencies.thread=(meta.currencies.thread||0)+(node&&node.type==="elite"?5:3);
      saveMeta();
      store.set(KEYS.rogueRun,run);
    }
  }
  else store.del(KEYS.freeCur);
```

**Edit — Win modal Devam butonu rogue'da Yuva yerine map'e dönsün**

`$("winNext").addEventListener("click",...)`:

old_string:
```
$("winNext").addEventListener("click",()=>{$("winOverlay").classList.remove("show");if(ctx.mode==="journey")startJourney(ctx.levelIndex+1);else startFree();});
```

new_string:
```
$("winNext").addEventListener("click",()=>{
  $("winOverlay").classList.remove("show");
  if(ctx.mode==="journey"){startJourney(ctx.levelIndex+1);}
  else if(ctx.mode==="rogue"){
    const run=store.get(KEYS.rogueRun,null);
    if(run){renderRogueMap(run);showScreen("s-rogue-map");}
  }
  else startFree();
});
```

Commit: `feat(rogue-engine): startRogueRun + map render + node click → puzzle + win callback`

---

### Task 8: Smoke test + final + merge + push

- [ ] **Step 8.1:** Manuel test instruction (progress log'a)

  ```
  Test:
  1. python3 -m http.server 8000 (proje root)
  2. http://localhost:8000/ aç
  3. Ana menü → "Rogue Modu" tıkla → Yuva
  4. Yuva'da Jedi silueti + 3 realm card görünür (Deneme Diyarı açık)
  5. Karakter butonu → Jedi avatarı + 6 stat
  6. İpliklik / Diken → "Yakında" placeholder
  7. Deneme Diyarı kartına tıkla → koşu başlar, harita görünür
  8. Erişilebilir bir düğüme tıkla → puzzle açılır
  9. Puzzle'ı çöz → Win modal → "Devam" → map'e dön
  10. Boss düğümüne git ve çöz → koşu sonu modal
  11. "Yeni Koşu" → koşu silinir, Yuva'ya döner
  ```

- [ ] **Step 8.2:** Progress log final + roadmap update (`06 — Rogue infrastructure | ✓ tamamlandı | <SHA>`)
- [ ] **Step 8.3:** Commit `docs(plan-06): final progress + roadmap`
- [ ] **Step 8.4:** Branch push + main merge + main push

---

## Self-Review

**Spec coverage:** ✅ Rogue kart unlock, ✅ Yuva, ✅ Karakter, ✅ İpliklik/Diken shells, ✅ Run engine, ✅ Map generator, ✅ Stub realm, ✅ Node click → puzzle, ✅ Win callback handles rogue.

**Plan 06 v1 scope sınırı:**
- Achievement engine: SKIP (Plan 09'da meta achievements ile gelir)
- Yuva Fısıltısı (Neow): SKIP (Plan 07'de)
- Pusula Yıldızı: SKIP (Plan 07/08'de)
- Constraint tiles: SKIP (Plan 07+'da)

**Önerilen dispatch:** Tek dispatch — 8 task ~10-12 commit. Tek subagent'a.
