# Plan 17 · Uniqueness rewrite + Node preview + Orphan fix + Bugs

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Kullanıcı testinden + code review'dan çıkan kritik sorunları çöz. (1) Çoklu-çözüm bug'ını **kökten** düzelt (propagating solver + dig generation = uniqueness garantili). (2) Rogue node'a tıklayınca önce preview göster (ne verdiğini yaz), "Başla" deyince başla. (3) Harita orphan node bug'ı (%93 koşu). (4) Diğer code review bug'ları.

**Bağımlılık:** Plan 16.

**Tahmini süre:** 5-6 saat.

---

## Code review özeti (referans)

| Kod | Sorun | Plan'da |
|-----|-------|---------|
| K1+K2 | Solver propagation yok → timeout → uniqueness fiilen çalışmıyor (%27 puzzle çoklu) | Phase A+B |
| K3 | Harita %93 orphan node | Phase D |
| K4 | loseLife hiç çağrılmıyor; yardım metni yalan söylüyor | Phase E.5 (metin hizalama) |
| Ö1 | Daily, freeCur slot'unu eziyor (yanlış key) | Phase E.1 |
| Ö3 | Multi-stage boss solve count şişiyor | Phase E.2 |
| M1 | bestFloor/timesEntered hiç güncellenmiyor | Phase E.3 |
| M2 | META_DEFAULTS'ta dugumun-ardi yok | Phase E.4 |
| M3 | Neow "Aç Tilki" canı 0'a indirebilir | Phase E.6 |

---

## Phase A — Solver rewrite (propagation)

`src/core/solver.js` dosyasını TAMAMEN değiştir. Constraint propagation + trail-based backtracking.

```javascript
// src/core/solver.js — Propagating Slitherlink solver for uniqueness checking

/**
 * Counts solutions up to maxSolutions. Uses constraint propagation to fixpoint
 * before branching, with trail-based undo. Timeout → returns maxSolutions
 * (conservative: "assume not unique").
 *
 * Edge encoding: 0=unknown, 1=line, 2=cross.
 *   h[r][c]: r in 0..R, c in 0..C-1
 *   v[r][c]: r in 0..R-1, c in 0..C
 */
export function countSolutions(puzzle, maxSolutions=2, timeoutMs=2000){
  const R=puzzle.R, C=puzzle.C, clue=puzzle.clue;
  const deadline=Date.now()+timeoutMs;
  let found=0, timedOut=false;

  const h=Array.from({length:R+1},()=>Array(C).fill(0));
  const v=Array.from({length:R},()=>Array(C+1).fill(0));
  const trail=[];

  function cellLines(r,c){return (h[r][c]===1)+(h[r+1][c]===1)+(v[r][c]===1)+(v[r][c+1]===1);}
  function cellCross(r,c){return (h[r][c]===2)+(h[r+1][c]===2)+(v[r][c]===2)+(v[r][c+1]===2);}
  function vDeg(r,c){
    let d=0;
    if(c>0&&h[r][c-1]===1)d++;
    if(c<C&&h[r][c]===1)d++;
    if(r>0&&v[r-1][c]===1)d++;
    if(r<R&&v[r][c]===1)d++;
    return d;
  }
  function vUnknown(r,c){
    let u=0;
    if(c>0&&h[r][c-1]===0)u++;
    if(c<C&&h[r][c]===0)u++;
    if(r>0&&v[r-1][c]===0)u++;
    if(r<R&&v[r][c]===0)u++;
    return u;
  }
  function mark(){return trail.length;}
  function undo(to){while(trail.length>to){const[k,r,c]=trail.pop();(k==="h"?h:v)[r][c]=0;}}
  function setCellUnknowns(r,c,val){
    let any=false;
    if(h[r][c]===0){h[r][c]=val;trail.push(["h",r,c]);any=true;}
    if(h[r+1][c]===0){h[r+1][c]=val;trail.push(["h",r+1,c]);any=true;}
    if(v[r][c]===0){v[r][c]=val;trail.push(["v",r,c]);any=true;}
    if(v[r][c+1]===0){v[r][c+1]=val;trail.push(["v",r,c+1]);any=true;}
    return any;
  }
  function setVertexUnknowns(r,c,val){
    let any=false;
    if(c>0&&h[r][c-1]===0){h[r][c-1]=val;trail.push(["h",r,c-1]);any=true;}
    if(c<C&&h[r][c]===0){h[r][c]=val;trail.push(["h",r,c]);any=true;}
    if(r>0&&v[r-1][c]===0){v[r-1][c]=val;trail.push(["v",r-1,c]);any=true;}
    if(r<R&&v[r][c]===0){v[r][c]=val;trail.push(["v",r,c]);any=true;}
    return any;
  }

  function propagate(){
    let changed=true;
    while(changed){
      changed=false;
      if(Date.now()>deadline){timedOut=true;return false;}
      // Cell rules
      for(let r=0;r<R;r++)for(let c=0;c<C;c++){
        const cl=clue[r][c]; if(cl<0)continue;
        const ln=cellLines(r,c), cr=cellCross(r,c), unk=4-ln-cr;
        if(ln>cl)return false;
        if(ln+unk<cl)return false;
        if(unk===0)continue;
        if(ln===cl){ if(setCellUnknowns(r,c,2))changed=true; }
        else if(ln+unk===cl){ if(setCellUnknowns(r,c,1))changed=true; }
      }
      // Vertex rules
      for(let r=0;r<=R;r++)for(let c=0;c<=C;c++){
        const d=vDeg(r,c), u=vUnknown(r,c);
        if(d>2)return false;
        if(d===2&&u>0){ if(setVertexUnknowns(r,c,2))changed=true; }
        else if(d===1&&u===0)return false;
        else if(d===1&&u===1){ if(setVertexUnknowns(r,c,1))changed=true; }
        else if(d===0&&u===1){ if(setVertexUnknowns(r,c,2))changed=true; }
      }
    }
    return true;
  }

  function pickEdge(){
    let best=null,bestU=99;
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      if(clue[r][c]<0)continue;
      const ln=cellLines(r,c),cr=cellCross(r,c),unk=4-ln-cr;
      if(unk===0)continue;
      if(unk<bestU){
        bestU=unk;
        if(h[r][c]===0)best=["h",r,c];
        else if(h[r+1][c]===0)best=["h",r+1,c];
        else if(v[r][c]===0)best=["v",r,c];
        else if(v[r][c+1]===0)best=["v",r,c+1];
      }
    }
    if(best)return best;
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(h[r][c]===0)return ["h",r,c];
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(v[r][c]===0)return ["v",r,c];
    return null;
  }

  function isComplete(){
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(h[r][c]===0)return false;
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(v[r][c]===0)return false;
    return true;
  }

  function validLoop(){
    const deg=Array.from({length:R+1},()=>Array(C+1).fill(0));
    let edges=0;
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(h[r][c]===1){deg[r][c]++;deg[r][c+1]++;edges++;}
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(v[r][c]===1){deg[r][c]++;deg[r+1][c]++;edges++;}
    if(!edges)return false;
    let start=null,count2=0;
    for(let r=0;r<=R;r++)for(let c=0;c<=C;c++){
      if(deg[r][c]!==0&&deg[r][c]!==2)return false;
      if(deg[r][c]===2){count2++;if(!start)start=[r,c];}
    }
    if(!start)return false;
    const seen=Array.from({length:R+1},()=>Array(C+1).fill(false));
    const st=[start];seen[start[0]][start[1]]=true;let vis=0;
    while(st.length){
      const[r,c]=st.pop();vis++;
      if(c<C&&h[r][c]===1&&!seen[r][c+1]){seen[r][c+1]=true;st.push([r,c+1]);}
      if(c>0&&h[r][c-1]===1&&!seen[r][c-1]){seen[r][c-1]=true;st.push([r,c-1]);}
      if(r<R&&v[r][c]===1&&!seen[r+1][c]){seen[r+1][c]=true;st.push([r+1,c]);}
      if(r>0&&v[r-1][c]===1&&!seen[r-1][c]){seen[r-1][c]=true;st.push([r-1,c]);}
    }
    return vis===count2;
  }

  function search(){
    if(found>=maxSolutions||timedOut)return;
    if(Date.now()>deadline){timedOut=true;return;}
    const m=mark();
    if(!propagate()){undo(m);return;}
    if(isComplete()){
      if(validLoop())found++;
      undo(m);return;
    }
    const e=pickEdge();
    if(!e){undo(m);return;}
    const[k,r,c]=e;
    const mb=mark();
    (k==="h"?h:v)[r][c]=1;trail.push([k,r,c]);
    search();
    undo(mb);
    if(found<maxSolutions&&!timedOut){
      (k==="h"?h:v)[r][c]=2;trail.push([k,r,c]);
      search();
      undo(mb);
    }
    undo(m);
  }

  search();
  return timedOut?maxSolutions:found;
}
```

Commit: `feat(solver): constraint propagation + trail backtracking — uniqueness check 50-100x hızlandı`

---

## Phase B — Generator dig rewrite

`src/core/generator.js`'i değiştir. Loop generation'ı iç fonksiyona al, `checkUnique` ile dig algoritması.

```javascript
// src/core/generator.js — Slitherlink puzzle generator (unique-solution via dig)
import {countSolutions} from "./solver.js";

export function makePuzzle(R,C,keepRatio,rng,options){
  rng=rng||Math.random;
  options=options||{};
  const inb=(r,c)=>r>=0&&r<R&&c>=0&&c<C;

  function generateLoop(){
    const filled=Array.from({length:R},()=>Array(C).fill(false));
    filled[(R/2)|0][(C/2)|0]=true;
    const cnt=()=>{let n=0;for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(filled[r][c])n++;return n;};
    function regionConnected(){let s=null;for(let r=0;r<R&&!s;r++)for(let c=0;c<C&&!s;c++)if(filled[r][c])s=[r,c];if(!s)return false;const seen=Array.from({length:R},()=>Array(C).fill(false));const st=[s];seen[s[0]][s[1]]=true;let k=0;while(st.length){const[r,c]=st.pop();k++;for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(inb(nr,nc)&&filled[nr][nc]&&!seen[nr][nc]){seen[nr][nc]=true;st.push([nr,nc]);}}}return k===cnt();}
    function complementConnected(){const seen=Array.from({length:R},()=>Array(C).fill(false));const st=[];for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(!filled[r][c]&&(r===0||r===R-1||c===0||c===C-1)&&!seen[r][c]){seen[r][c]=true;st.push([r,c]);}while(st.length){const[r,c]=st.pop();for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(inb(nr,nc)&&!filled[nr][nc]&&!seen[nr][nc]){seen[nr][nc]=true;st.push([nr,nc]);}}}for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(!filled[r][c]&&!seen[r][c])return false;return true;}
    const total=R*C, iters=R*C*40;
    for(let i=0;i<iters;i++){const r=(rng()*R)|0,c=(rng()*C)|0,prev=filled[r][c];filled[r][c]=!prev;const nf=cnt();let ok=nf>=1&&nf<=total-1;if(ok)ok=regionConnected()&&complementConnected();if(!ok)filled[r][c]=prev;}
    const f=(r,c)=>inb(r,c)?filled[r][c]:false;
    const hE=Array.from({length:R+1},()=>Array(C).fill(0));
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)hE[r][c]=(f(r-1,c)!==f(r,c))?1:0;
    const vE=Array.from({length:R},()=>Array(C+1).fill(0));
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)vE[r][c]=(f(r,c-1)!==f(r,c))?1:0;
    const clue=Array.from({length:R},()=>Array(C).fill(-1));
    for(let r=0;r<R;r++)for(let c=0;c<C;c++)clue[r][c]=hE[r][c]+hE[r+1][c]+vE[r][c]+vE[r][c+1];
    return {hE,vE,clue};
  }

  // Fast path: legacy random removal (no uniqueness guarantee)
  if(!options.checkUnique){
    const {hE,vE,clue}=generateLoop();
    for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(rng()>keepRatio)clue[r][c]=-1;
    return {R,C,solH:hE,solV:vE,clue};
  }

  // Unique path: generate loop with unique full-clue set, then dig.
  const verifyMs=options.verifyMs||1200;
  const checkMs=options.checkMs||500;
  const digMs=options.digMs||4000;
  const maxLoops=options.maxLoops||5;

  let chosen=null;
  for(let attempt=0;attempt<maxLoops;attempt++){
    const lp=generateLoop();
    const fu=countSolutions({R,C,clue:lp.clue},2,verifyMs);
    if(fu===1){ chosen=lp; break; }
    if(!chosen)chosen=lp; // fallback: keep first even if not verified-unique
  }
  const {hE,vE,clue}=chosen;

  // Dig: start from full clues, remove while uniqueness preserved.
  // Each removal kept ONLY if countSolutions==1 afterwards → result is guaranteed unique
  // (or as-dense-as-the-verified-base if base wasn't verified unique).
  const targetRemovals=Math.floor(R*C*(1-keepRatio));
  const cells=[];
  for(let r=0;r<R;r++)for(let c=0;c<C;c++)cells.push([r,c]);
  for(let i=cells.length-1;i>0;i--){const j=(rng()*(i+1))|0;const t=cells[i];cells[i]=cells[j];cells[j]=t;}
  let removed=0;
  const deadline=Date.now()+digMs;
  for(const[r,c] of cells){
    if(removed>=targetRemovals)break;
    if(Date.now()>deadline)break;
    const saved=clue[r][c];
    if(saved<0)continue;
    clue[r][c]=-1;
    const n=countSolutions({R,C,clue},2,checkMs);
    if(n===1){removed++;} else {clue[r][c]=saved;}
  }
  return {R,C,solH:hE,solV:vE,clue};
}
```

**Garanti:** dig yalnızca `countSolutions===1` ise clue çıkarır → sonuç tek-çözümlü (countSolutions doğru olduğu sürece, review onayladı). Timeout olursa daha yoğun ama yine tek-çözüm puzzle döner.

Commit: `feat(generator): dig algoritması — tam clue'dan başla, tekil kalırken çıkar (uniqueness garantili)`

---

## Phase C — Node preview modal (kullanıcı isteği 1)

`index.html`'de `handleRogueNode`'u preview + enter olarak böl.

**Edit 1:** `handleRogueNode` fonksiyonunu şu şekilde değiştir (mevcut gövdeyi `enterRogueNode`'a taşı, başına preview ekle). Mevcut `handleRogueNode(nodeId){...}` bul, başına preview wrapper:

```javascript
function handleRogueNode(nodeId){
  const run=store.get(KEYS.rogueRun,null);
  if(!run||run.ended)return;
  const node=run.mapGraph.nodes.find(n=>n.id===nodeId);
  if(!node)return;
  showNodePreview(run,node,()=>enterRogueNode(nodeId));
}

function showNodePreview(run,node,onStart){
  const realm=getRealm(run.realmId)||REALMS["stub-diyar"];
  const glyph={puzzle:"◇",elite:"☆",chest:"⬚","locked-chest":"⚿",rest:"◐",event:"?",boss:"☠"};
  const fc=realm.floorConfig&&realm.floorConfig[node.floor];
  const size=fc?fc.sizes[0]:5;
  let title="",desc="",btn="Başla",extra="";
  if(node.type==="puzzle"){title="Bulmaca";desc=`${size}×${size} bulmaca. Çözersen +3 İplik ve relic şansı.`;btn="Başla";}
  else if(node.type==="elite"){title="Elit Bulmaca";desc=`${size}×${size} zor bulmaca. Çözersen +5 İplik ve daha iyi relic.`;btn="Başla";}
  else if(node.type==="chest"){title="Sandık";desc="Bulmaca yok. Üç relic'ten birini seç.";btn="Aç";}
  else if(node.type==="locked-chest"){title="Kilitli Sandık";desc=hasRelic(run,"bronz-anahtar")?"Bronz Anahtarın var — açabilirsin.":"Bronz Anahtar gerekir; yoksa geçilir.";btn="Aç";}
  else if(node.type==="rest"){const heal=1+(run.restBonusHeal||0);title="Dinlenme";desc=`+${heal} can yenilenir.`;btn="Dinlen";}
  else if(node.type==="event"){title="Olay";desc="Bir karar — risk ya da ödül.";btn="Gör";}
  else if(node.type==="boss"){title=realm.bossName||"Patron";desc=realm.bossIntro||"Kat sonu büyük bulmaca.";btn="Karşılaş";if(realm.bossMultiStage&&realm.bossMultiStage>1)extra=`<div style="text-align:center;font-family:var(--font-mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-top:4px;">${realm.bossMultiStage} aşama</div>`;}
  const isBoss=node.type==="boss";
  const html=`
    <div style="text-align:center;padding:6px 0 2px;">
      <div style="font-family:var(--font-serif);font-size:42px;color:${isBoss?'var(--bad)':'var(--accent)'};line-height:1;">${glyph[node.type]||"?"}</div>
    </div>
    <h2 style="text-align:center;">${title}</h2>
    <p style="text-align:center;font-family:var(--font-serif);font-style:italic;color:var(--ink-dim);line-height:1.5;font-size:14.5px;">${desc}</p>
    ${extra}
    <div class="row" style="margin-top:16px;">
      <button class="btn-ghost" data-node-cancel="1">Vazgeç</button>
      <button class="btn-primary" data-node-go="1" style="border:none;">${btn}</button>
    </div>
  `;
  openRogueModal(html,e=>{
    if(e.target.closest("[data-node-cancel]")){closeRogueModal();}
    else if(e.target.closest("[data-node-go]")){closeRogueModal();onStart();}
  });
}
```

**Edit 2:** Mevcut `handleRogueNode` gövdesini (puzzle/chest/event/rest/boss logic) `enterRogueNode(nodeId)` adıyla yeniden adlandır. **Plan 16'da eklenen boss-intro pre-check'ini KALDIR** (artık showNodePreview boss'u da kapsıyor). `enterRogueNode` direkt puzzle setup / chest / event / rest yapsın.

`enterRogueNode` içinde `bossIntroShown` referanslarını temizle (artık gereksiz).

Commit: `feat(rogue): node preview modal — tıklayınca ne verdiğini gösterir, Başla deyince başlar`

---

## Phase D — Orphan node fix (K3)

`src/rogue/map.js` `generateMap` fonksiyonunda, edge generation tamamlandıktan SONRA bir "her node'un gelen kenarı olsun" pass'i ekle.

`generateMap`'in edges üretiminden sonra, `return {nodes,edges,...}` öncesi:

```javascript
  // Orphan fix: her node (floor 0 hariç) en az bir önceki-kat node'undan erişilebilsin
  for(let f=1;f<F;f++){
    const cur=nodes.filter(n=>n.floor===f);
    const prev=nodes.filter(n=>n.floor===f-1);
    for(const node of cur){
      const hasIncoming=edges.some(([a,b])=>b===node.id);
      if(!hasIncoming&&prev.length){
        let best=prev[0],bestD=Infinity;
        for(const p of prev){const d=Math.abs(p.col-node.col);if(d<bestD){bestD=d;best=p;}}
        edges.push([best.id,node.id]);
      }
    }
  }
  // Dead-end fix: her node (son floor hariç) en az bir sonraki-kat node'una bağlansın
  for(let f=0;f<F-1;f++){
    const cur=nodes.filter(n=>n.floor===f);
    const nxt=nodes.filter(n=>n.floor===f+1);
    for(const node of cur){
      const hasOutgoing=edges.some(([a,b])=>a===node.id);
      if(!hasOutgoing&&nxt.length){
        let best=nxt[0],bestD=Infinity;
        for(const p of nxt){const d=Math.abs(p.col-node.col);if(d<bestD){bestD=d;best=p;}}
        edges.push([node.id,best.id]);
      }
    }
  }
```

**Not:** `F` = floor sayısı (`config.floors`). map.js'te değişken adı farklıysa (örn `FLOORS.length` veya `floors`), ona uyarla. Subagent map.js'i okuyup doğru değişkeni kullansın.

Commit: `fix(rogue): orphan + dead-end node fix — her node bir önceki kattan erişilebilir, her node ilerler`

---

## Phase E — Bug fixes

### E.1 Daily key bug (Ö1)

`KEYS`'e ekle: `dailyCur:"cember:daily:current"`.

`autosave()` fonksiyonunda daily mode için ayrı key:
```javascript
function autosave(){
  if(solved)return;
  if(ctx.mode==="rogue"){
    const run=store.get(KEYS.rogueRun,null);
    if(run){run.midPuzzle=snapshot();store.set(KEYS.rogueRun,run);}
  }else if(ctx.mode==="daily"){
    store.set(KEYS.dailyCur,snapshot());
  }else{
    store.set(ctx.mode==="journey"?KEYS.jrnCur:KEYS.freeCur,snapshot());
  }
}
```

`win()` daily dalında snapshot temizle:
```javascript
else if(ctx.mode==="daily"){
  recordDaily(store,{date:ctx.date,time:elapsed,solves:1,realmId:null,success:true});
  store.del(KEYS.dailyCur);
}
```

(Mevcut `else store.del(KEYS.freeCur)` daily için çalışmıyordu — bu düzeltir.)

Commit: `fix(daily): ayrı dailyCur key — free-play resume slot artık ezilmiyor`

### E.2 Multi-stage boss solve count (Ö3)

`win()` rogue dalında `meta.totalStats.solves` artışını multi-stage ara aşamalarda yapma. Mevcut multi-stage handling early-return ediyor; `solves++` ve thread reward'ı **sadece final aşamada VEYA non-boss'ta** olsun.

`win()` başında genel `meta.totalStats.solves++` varsa, onu rogue multi-stage erken-return'den SONRAYA taşı. Subagent mevcut win() akışını okuyup: multi-stage ara aşama `return`'den önce solves++ ÇALIŞMASIN. Pratik: solves++ ve thread'i boss-final + normal-node yoluna koy.

Commit: `fix(rogue): multi-stage boss tek 'solve' sayılır (ara aşamalar şişirmiyor)`

### E.3 bestFloor + timesEntered (M1)

`startRogueRun`'da koşu başlarken:
```javascript
if(!meta.realms[realmId])meta.realms[realmId]={};
meta.realms[realmId].timesEntered=(meta.realms[realmId].timesEntered||0)+1;
saveMeta();
```

`enterRogueNode` (veya moveTo sonrası, floor değişince) bestFloor güncelle:
```javascript
// node geçişi sonrası
const rm=meta.realms[run.realmId];
if(rm){rm.bestFloor=Math.max(rm.bestFloor||0,run.floor);saveMeta();}
```

Commit: `fix(rogue): bestFloor + timesEntered güncelleniyor (Karakter ekranı doğru)`

### E.4 META_DEFAULTS dugumun-ardi (M2)

`META_DEFAULTS.realms`'e ekle:
```javascript
"dugumun-ardi":{unlocked:false,timesEntered:0,timesCleared:0,bestFloor:0,bestTime:null,defeatedBosses:0,seenEvents:[],knownRelics:[],compassStars:0,unlockedConstraintTiles:[]},
```

Commit: `fix(meta): META_DEFAULTS'a dugumun-ardi realm eklendi`

### E.5 Yardım metni hizalama (K4)

Can mekaniği şu an sadece event + Mum Modu ile azalıyor (puzzle hatası can götürmüyor). HOW_CONTENT.rogue'daki "Başta 3 can. Her hata 1 can götürür." satırını gerçekle hizala:

old: `<li>Başta <b>3 can</b>. Her hata 1 can götürür. Canlar biterse koşu son bulur (geri dönüş yok).</li>`

new: `<li>Başta <b>3 can</b>. Canlar olaylardaki riskli seçimlerden ve Mum Modu süresi dolunca azalır. Canlar biterse koşu son bulur.</li>`

Commit: `fix(help): rogue can mekaniği açıklaması gerçek davranışla hizalandı`

### E.6 Neow "Aç Tilki" can clamp (M3)

`src/rogue/neow.js` `applyBlessing` trade dalında:
```javascript
else if(e.type==="trade"){
  run.lives.max=Math.max(1,run.lives.max-e.cost.life);
  run.lives.current=Math.max(1,run.lives.current-e.cost.life);
  run.relicTierBonus=(run.relicTierBonus||0)+(e.gain.relicTier||0);
}
```

Commit: `fix(neow): 'Aç Tilki' canı en az 1'de tutar`

### E.7 SW v5 + reset flag

`service-worker.js`: `VERSION='slitherlink-shell-v5'`.
`index.html` boot reset: `RESET_FLAG="cember:reset:v5"`.

Commit: `chore(pwa): SW v5 + reset flag (yeni generator ile temiz başlangıç)`

---

## Phase F — Tests + Final

### F.1 Uniqueness acceptance test

`tests/core.test.js`'e ekle (browser harness):
```javascript
test("dig generator produces unique puzzles (10x 6x6)",()=>{
  let bad=0;
  for(let s=0;s<10;s++){
    const p=makePuzzle(6,6,0.6,mulberry32(hashSeed("uniq"+s)),{checkUnique:true,digMs:3000,checkMs:500,verifyMs:1500});
    if(countSolutions(p,2,3000)!==1)bad++;
  }
  eq(bad,0);
});
```

### F.2 Final + merge + push

Roadmap satırı: `17 — Uniqueness rewrite + node preview + orphan fix + bugs | ✓ tamamlandı | <SHA>`.
Branch push + main merge + push.

---

## Self-Review

- ✅ Solver propagation (Phase A)
- ✅ Generator dig — uniqueness garantili (Phase B)
- ✅ Node preview modal (Phase C)
- ✅ Orphan + dead-end fix (Phase D)
- ✅ Daily key, solve count, bestFloor, defaults, help, neow clamp (Phase E)
- ✅ SW v5 reset
- ✅ Uniqueness acceptance test (Phase F)

## Önerilen dispatch

- **Dispatch 1:** Phase A + B (solver + generator) — KRİTİK, ağır node-test ile doğrula
- **Dispatch 2:** Phase C + D (preview modal + orphan)
- **Dispatch 3:** Phase E + F (bug fixes + tests + merge)

### Phase A+B acceptance (Dispatch 1 zorunlu doğrulama)

Subagent şu node testini koşmalı (proje kökünde) ve **non-unique=0** raporlamalı:
```bash
cat > _uniqtest.mjs << 'EOF'
import {makePuzzle} from "./src/core/generator.js";
import {countSolutions} from "./src/core/solver.js";
import {mulberry32,hashSeed} from "./src/core/rng.js";
let bad=0,times=[];
for(let s=0;s<20;s++){
  const t0=Date.now();
  const p=makePuzzle(7,7,0.6,mulberry32(hashSeed("u"+s)),{checkUnique:true});
  times.push(Date.now()-t0);
  const n=countSolutions(p,2,4000);
  if(n!==1){bad++;console.log("seed",s,"→",n,"çözüm");}
}
console.log("non-unique:",bad,"/20  | gen avg ms:",Math.round(times.reduce((a,b)=>a+b,0)/times.length));
EOF
node ./_uniqtest.mjs; rm _uniqtest.mjs
```
Beklenen: `non-unique: 0/20`. Eğer >0 ise solver/generator'da hata var, düzelt.
