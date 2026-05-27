# Plan 15 · Kural uyumu + uniqueness + UI polish + reset

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Kullanıcı testinden gelen kritik kural-ihlali bug'larını çöz. Sıfırla buton taşı+confirm, real-time overflow prevention, **broken constraint tile'ları disable et** (puzzle invalid yapıyorlar), tek-çözüm uniqueness check, hücre kapanınca soluklaşma toggle, kuralları Nasıl Oynanır'a ekle, SW v4 reset.

**Bağımlılık:** Plan 14.

**Tahmini süre:** 4-5 saat.

---

## Problem Tespiti

Kullanıcı feedback + PDF ve resmi Slitherlink kuralları:
- Her ipucu rakamı = etrafındaki link sayısı (0, 1, 2, **veya 3** — **4 değil**)
- Boş kareler herhangi sayıda link içerebilir
- Çözüm tek kapalı loop, çakışma yok, dallanma yok

**Tespit edilen kritik bug:** Plan 12'de eklenen constraint tile'ların hepsi `applyTiles` içinde clue'yu **post-hoc değiştiriyor** (solH/solV önceden hesaplandığı için bu invalid puzzle üretiyor):

| Tile | Sorun |
|------|-------|
| **Lanetli** | clue=4 set ediyor (klasik Slitherlink'te 4 yok — 4 edge = mini loop = invalid) |
| **İkiz** | İki cell'in clue'sunu eşitler — solH/solV ile uyumsuz |
| **Donmuş** | clue=-1 set eder ama solH/solV'da o cell'in line'ları var |
| **2 Konmaz** | clue=2 olan cell'i 1 veya 3'e çevirir — solH/solV ile uyumsuz |
| **Yankı, Kayan** | Aynı mantık problemi |
| **Sis** | ✓ Zararsız (sadece clue'yu gizler, value aynı) |

---

## Phase A — Critical UI Fixes

### A.1 Sıfırla buton topbar'a + confirm

Mevcut bottom controls: `↶ ↷ ↺ ✓ İpucu` — sıfırla butonu İpucu ve check'in yanında, yanlışlıkla basılıyor.

**Fix:** Sıfırla butonunu **topbar'a taşı** (Yeni `✦` yanına `↺` ikonu). Bottom controls: `↶ ↷ ✓ İpucu`.

`index.html` topbar (`s-game`):
```html
<div class="topbar">
  <button class="iconbtn" data-back aria-label="Geri">‹</button>
  <div class="ttl" id="gameTitle">Bulmaca</div>
  <button class="iconbtn" id="gameResetBtn" aria-label="Sıfırla">↺</button>
  <button class="iconbtn" id="gameNewBtn" aria-label="Yeni">✦</button>
  <button class="iconbtn" id="gameSettings" aria-label="Ayarlar">⚙</button>
</div>
```

Bottom controls'tan `resetBtn`'i kaldır:
```html
<div class="controls">
  <button class="btn-ghost" id="undoBtn" aria-label="Geri al">↶</button>
  <button class="btn-ghost" id="redoBtn" aria-label="İleri al">↷</button>
  <button class="btn-ghost" id="checkBtn" aria-label="Kontrol Et">✓</button>
  <button class="btn-ghost hidden" id="hintBtn" aria-label="İpucu al">💡 İpucu</button>
</div>
```

Event handler — Sıfırla'ya confirm:
```javascript
$("gameResetBtn").addEventListener("click",()=>{
  if(!confirm("Tahta sıfırlansın mı? Yapılan tüm hamleler silinecek."))return;
  resetBoard();
});
```

Mevcut `$("resetBtn")` handler ve `applyHintVisibility`/`applyUndoVisibility` kontrol et — `resetBtn` ID artık `gameResetBtn`'e değişti.

### A.2 Real-time overflow prevention

**Problem:** Kullanıcı bir clue=3 hücresinin etrafına 4. çizgi ekleyebiliyor (kural ihlali, ama UI engellemiyordu).

**Fix:** `toggle()` fonksiyonunda boş→çizgi geçişi öncesi, bu eylem bir clue'yu aşacaksa engelle.

```javascript
function toggle(k,r,c){
  if(solved)return;
  const arr=k==="h"?hState:vState;
  const cur=arr[r][c];
  const next=(cur+1)%3; // boş→çizgi→çarpı→boş
  // Overflow prevention: yeni state line ise, bu satır/sütun komşu cell'lerden herhangi birinin clue'unu aşar mı?
  if(next===1){
    const cellsTouched=k==="h"
      ? [[r-1,c],[r,c]] // h-edge r,c → cells (r-1,c) ve (r,c)
      : [[r,c-1],[r,c]]; // v-edge r,c → cells (r,c-1) ve (r,c)
    for(const [tr,tc] of cellsTouched){
      if(tr<0||tr>=P.R||tc<0||tc>=P.C)continue;
      const clue=P.clue[tr][tc];
      if(clue<0)continue;
      // Geçici olarak ekle, count
      arr[r][c]=1;
      const lc=lineCount(tr,tc);
      arr[r][c]=cur; // restore
      if(lc>clue){
        // Block this transition
        buzz([8,30,8]); // feedback
        return;
      }
    }
  }
  // Devam — normal toggle
  undoStack.push(snapshotState());
  if(undoStack.length>200)undoStack.shift();
  redoStack=[];
  arr[r][c]=next;
  if(settings.autoX){
    if(k==="h"){applyAutoXAround(r,c);applyAutoXAround(r,c+1);}
    else{applyAutoXAround(r,c);applyAutoXAround(r+1,c);}
    applyCornerAutoX();
  }
  buzz(8);render();autosave();checkWin();
}
```

Bu, overflow eylemini sessizce engeller ve titreşim verir.

**Alternatif (kullanıcı tercihine göre):** Settings'e yeni toggle: "Kural ihlalini engelle" (default ON). Off ise overflow'a izin ver.

DEFAULT_SETTINGS'e ekle:
```javascript
preventOverflow:true,
```

TOGGLE_DEFS'e:
```javascript
{k:"preventOverflow", t:"Kural ihlali engelle", d:"Bir hücrenin clue'unu aşacak çizgi konulamaz"},
```

`toggle()` içinde overflow check yalnızca `settings.preventOverflow` true ise yapılır.

### A.3 SW v4 cache bump + one-time reset (v4 flag)

`service-worker.js`:
```javascript
const VERSION = 'slitherlink-shell-v4';
```

`index.html` boot script'te:
```javascript
const RESET_FLAG="cember:reset:v4";
if(!localStorage.getItem(RESET_FLAG)){
  const toRemove=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k&&k.startsWith("cember:"))toRemove.push(k);
  }
  toRemove.forEach(k=>localStorage.removeItem(k));
  if(typeof indexedDB!=="undefined"){
    try{indexedDB.deleteDatabase("cember-db");}catch(e){}
  }
  localStorage.setItem(RESET_FLAG,"done");
}
```

---

## Phase B — Generator Fix (kural uyumu)

### B.1 Broken constraint tiles disable

`src/rogue/tiles.js` `applyTiles` fonksiyonunda yalnızca `sis` tile'ı uygula:

```javascript
export function applyTiles(puzzle,realmId,rng,density=0.18){
  if(!puzzle.tiles)puzzle.tiles={};
  const pool=REALM_TILE_POOL[realmId]||[];
  // Yalnızca solver-uyumlu tile'lar (v1.5: sadece Sis)
  const SAFE_TILES=["sis"];
  const filteredPool=pool.filter(t=>SAFE_TILES.includes(t));
  if(!filteredPool.length)return puzzle;
  for(let r=0;r<puzzle.R;r++)for(let c=0;c<puzzle.C;c++){
    if(puzzle.clue[r][c]<0)continue;
    if(rng()<density){
      const type=filteredPool[(rng()*filteredPool.length)|0];
      puzzle.tiles[r+","+c]={type,revealed:false};
    }
  }
  return puzzle;
}
```

Bu, mevcut TILE_TYPES kayıtlarını bozmaz (data hâlâ var), sadece üretim sırasında uygulanmaz. Diğer tile'ları gelecekte solver-aware yeniden uygulayacağız (Plan 16+).

### B.2 Tek çözüm uniqueness check (yeni feature)

Yeni dosya `src/core/solver.js` — basit Slitherlink solver:

```javascript
// src/core/solver.js — Minimal Slitherlink solver for uniqueness check

/**
 * Counts the number of solutions for a puzzle, up to maxSolutions.
 * Returns the count. Used to verify uniqueness during generation.
 *
 * Uses constraint propagation + backtracking with timeout.
 *
 * @param {object} puzzle — {R, C, clue}
 * @param {number} maxSolutions — stop search after this many found
 * @param {number} timeoutMs — max wall-clock time
 * @returns {number} solution count (capped at maxSolutions)
 */
export function countSolutions(puzzle, maxSolutions=2, timeoutMs=2000){
  const R=puzzle.R, C=puzzle.C;
  const start=Date.now();
  let found=0;

  const hState=Array.from({length:R+1},()=>Array(C).fill(0));
  const vState=Array.from({length:R},()=>Array(C+1).fill(0));

  function lineCount(r,c){
    return (hState[r][c]===1)+(hState[r+1][c]===1)+(vState[r][c]===1)+(vState[r][c+1]===1);
  }
  function crossCount(r,c){
    return (hState[r][c]===2)+(hState[r+1][c]===2)+(vState[r][c]===2)+(vState[r][c+1]===2);
  }

  function checkClueConstraints(){
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      const clue=puzzle.clue[r][c];
      if(clue<0)continue;
      const lines=lineCount(r,c);
      const crosses=crossCount(r,c);
      if(lines>clue)return false;
      if(4-crosses<clue)return false;
    }
    return true;
  }

  function checkVertexConstraints(){
    for(let r=0;r<=R;r++)for(let c=0;c<=C;c++){
      let deg=0;
      if(c>0&&hState[r][c-1]===1)deg++;
      if(c<C&&hState[r][c]===1)deg++;
      if(r>0&&vState[r-1][c]===1)deg++;
      if(r<R&&vState[r][c]===1)deg++;
      if(deg>2)return false;
    }
    return true;
  }

  function isComplete(){
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(hState[r][c]===0)return false;
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(vState[r][c]===0)return false;
    return true;
  }

  function isValidLoop(){
    // Validate single closed loop
    const deg=Array.from({length:R+1},()=>Array(C+1).fill(0));
    let edges=0;
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(hState[r][c]===1){deg[r][c]++;deg[r][c+1]++;edges++;}
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(vState[r][c]===1){deg[r][c]++;deg[r+1][c]++;edges++;}
    if(!edges)return false;
    for(let r=0;r<=R;r++)for(let c=0;c<=C;c++)if(deg[r][c]!==0&&deg[r][c]!==2)return false;
    let start=null;
    for(let r=0;r<=R&&!start;r++)for(let c=0;c<=C&&!start;c++)if(deg[r][c]===2)start=[r,c];
    if(!start)return false;
    let count2=0;
    for(let r=0;r<=R;r++)for(let c=0;c<=C;c++)if(deg[r][c]===2)count2++;
    const seen=Array.from({length:R+1},()=>Array(C+1).fill(false));
    const stack=[start];seen[start[0]][start[1]]=true;let visited=0;
    while(stack.length){
      const [r,c]=stack.pop();visited++;
      if(c<C&&hState[r][c]===1&&!seen[r][c+1]){seen[r][c+1]=true;stack.push([r,c+1]);}
      if(c>0&&hState[r][c-1]===1&&!seen[r][c-1]){seen[r][c-1]=true;stack.push([r,c-1]);}
      if(r<R&&vState[r][c]===1&&!seen[r+1][c]){seen[r+1][c]=true;stack.push([r+1,c]);}
      if(r>0&&vState[r-1][c]===1&&!seen[r-1][c]){seen[r-1][c]=true;stack.push([r-1,c]);}
    }
    return visited===count2;
  }

  function findNextEdge(){
    // Most-constrained heuristic: edge near most-constrained clue
    let best=null,bestScore=-1;
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      const clue=puzzle.clue[r][c];
      if(clue<0)continue;
      const lines=lineCount(r,c);
      const crosses=crossCount(r,c);
      const decided=lines+crosses;
      if(decided===4)continue;
      const score=clue===0||clue===3?3:(clue===1||clue===2?2:1);
      if(score>bestScore){
        // Find an undecided edge
        if(hState[r][c]===0)return ["h",r,c,best=[r,c],bestScore=score][0]&&{k:"h",r,c};
        if(hState[r+1][c]===0)return {k:"h",r:r+1,c};
        if(vState[r][c]===0)return {k:"v",r,c};
        if(vState[r][c+1]===0)return {k:"v",r,c:c+1};
      }
    }
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(hState[r][c]===0)return {k:"h",r,c};
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(vState[r][c]===0)return {k:"v",r,c};
    return null;
  }

  function backtrack(){
    if(found>=maxSolutions)return;
    if(Date.now()-start>timeoutMs){found=maxSolutions;return;} // timeout = assume not unique
    if(!checkClueConstraints())return;
    if(!checkVertexConstraints())return;
    if(isComplete()){
      // Full check including loop validity
      for(let r=0;r<R;r++)for(let c=0;c<C;c++){
        if(puzzle.clue[r][c]<0)continue;
        if(lineCount(r,c)!==puzzle.clue[r][c])return;
      }
      if(isValidLoop())found++;
      return;
    }
    const e=findNextEdge();
    if(!e)return;
    const arr=e.k==="h"?hState:vState;
    arr[e.r][e.c]=1;backtrack();
    if(found>=maxSolutions)return;
    arr[e.r][e.c]=2;backtrack();
    arr[e.r][e.c]=0;
  }

  backtrack();
  return found;
}
```

`src/core/generator.js`'i güncelle: `makePuzzle` parametre kabul etsin `{checkUnique, maxAttempts}`. Eğer checkUnique true ise:
1. Tüm clue'ları al
2. Tek tek deneyerek "kaldırılabilir mi (unique kalır mı)" kontrol et
3. Çoklu çözüm üretirse o clue'yu kaldırma

Pragmatic basitleştirme: Mevcut clue removal aşamasından ÖNCE çağrı `countSolutions(puzzle, 2)`. Eğer 1 ise unique, OK. Eğer >1 ise daha az clue çıkar (density floor 60%).

`makePuzzle` end'te:
```javascript
if(options?.checkUnique){
  let attempts=0;
  let solCount=countSolutions({R,C,clue},2,1500);
  while(solCount>1&&attempts<3){
    // Add back a random clue
    const candidates=[];
    for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(clue[r][c]<0)candidates.push([r,c]);
    if(!candidates.length)break;
    const[ar,ac]=candidates[(rng()*candidates.length)|0];
    clue[ar][ac]=hE[ar][ac]+hE[ar+1][ac]+vE[ar][ac]+vE[ar][ac+1];
    attempts++;
    solCount=countSolutions({R,C,clue},2,1500);
  }
}
```

`setupFree` veya rogue puzzle generation'da `checkUnique:true` geçir (eğer settings'te `uniquePuzzle` true ise).

### B.3 Settings: "Tek çözüm garantili" toggle

DEFAULT_SETTINGS'e:
```javascript
uniquePuzzle:true,
```

TOGGLE_DEFS'e:
```javascript
{k:"uniquePuzzle", t:"Tek çözüm garantili", d:"Yeni bulmacalar tek çözümlü oluşturulur (üretim biraz uzayabilir)"},
```

`startFree` ve `handleRogueNode` puzzle generation'da:
```javascript
const puzzle=makePuzzle(size,size,keep,rng,{checkUnique:settings.uniquePuzzle});
```

Default ON. Kullanıcı uniqueness istemiyorsa kapatabilir (daha az clue + multiple solution kabul).

---

## Phase C — Fade UX

### C.1 Yeni toggle: "Hücre kapanınca soluklaştır"

DEFAULT_SETTINGS'e ekle:
```javascript
fadeDecided:false,
```

TOGGLE_DEFS'e ekle (mevcut `fade`'in yanına):
```javascript
{k:"fadeDecided", t:"Hücre kapanınca soluklaştır", d:"4 kenarı da çizilen/çarpılan hücre soluklaşır (clue tatmin etmese de)"},
```

`updateClueStates` içinde fadeDecided kontrolü:
```javascript
function updateClueStates(){
  boardEl.querySelectorAll("text.clue").forEach(t=>{
    const r=+t.dataset.r,c=+t.dataset.c,n=P.clue[r][c],lc=lineCount(r,c);
    t.classList.remove("done","err","decided");
    const mode=settings.autoCheckMode||"mistakes-only";
    let isErr=false;
    if(mode==="live"||mode==="mistakes-only"){
      isErr=(lc>n)||(decided(r,c)&&lc!==n);
    }
    if(settings.errors&&isErr)t.classList.add("err");
    else if(settings.fade&&lc===n)t.classList.add("done");
    else if(settings.fadeDecided&&decided(r,c))t.classList.add("decided");
  });
}
```

CSS:
```css
.clue.decided{fill:var(--ink);opacity:.22;}
```

(Aynı `.done` görünümü, farklı tetik.)

Mevcut `fade` toggle korunur, `fadeDecided` ek olarak eklenir. Kullanıcı ikisini de açıp kapatabilir.

---

## Phase D — Kuralları Nasıl Oynanır'a ekle

`index.html` HOW_CONTENT.rules güncelle — resmi kurallarla genişlet:

```javascript
rules:`
  <h3>Slitherlink Kuralları</h3>
  <p class="quote">Tek ve kapalı bir çember çiz. İplikten kaybolma.</p>
  <h4>Temel kurallar (Resmi)</h4>
  <ul>
    <li>Noktalardan oluşan ızgaranın kenarlarına çizgi çekersin.</li>
    <li>Hücredeki sayı, o hücrenin etrafındaki çizgi adedini söyler — <b>0, 1, 2 veya 3</b> olabilir.</li>
    <li><b>4 değeri yoktur</b> — bir hücrenin tüm 4 kenarı çizili olursa o cell kapalı bir mini-loop oluşturur, kural ihlali.</li>
    <li>Boş hücreler (rakamsız) herhangi sayıda kenarla çevrelenebilir.</li>
    <li>Tüm çizgili kenarlar <b>tek ve kapalı</b> bir döngü oluşturmalı.</li>
    <li>Çizgiler kesişemez, dallanamaz (her köşe noktasında <b>0 veya 2 çizgi</b> olabilir).</li>
  </ul>
  <h4>Üç durum</h4>
  <p>Bir kenara dokun → <b>boş</b> → <b>çizgi</b> → <b>çarpı</b> → boş. Çarpı senin "burada kesin çizgi yok" notun.</p>
  <h4>Yardımcılar</h4>
  <ul>
    <li><b>Otomatik çarpı:</b> Bir rakamın çizgi sayısı dolduğunda kalan kenarlar otomatik çarpılanır.</li>
    <li><b>Köşe otomasyonu:</b> Bir köşede 2 çizgi varsa, kalan kenarlar otomatik çarpılanır.</li>
    <li><b>Kontrol et (✓):</b> Hatalı kenarları 3 saniye kırmızı gösterir, çözümü açıklamaz.</li>
    <li><b>Kural ihlali engelle:</b> Bir sayıyı aşacak çizgi konmaz (Ayarlar'dan kapatılabilir).</li>
  </ul>
  <h4>Kazanma</h4>
  <p>Tüm gösterilen sayılar tatmin olduğunda + tüm çizgili kenarlar tek bir kapalı döngü oluşturduğunda kazandın.</p>
  <p style="margin-top:14px;font-size:11px;color:var(--muted);font-style:italic;">Klasik Slitherlink (Conceptis) resmi kurallarına uyumlu.</p>
`,
```

---

## Phase E — Generator Notice + Kural farkındalığı

Boss puzzle'larında veya constraint tile içeren puzzle'larda, ilk başlatmada bir kez bilgi göster:

`handleRogueNode` puzzle branch'inde, eğer tiles uygulanacaksa ve `meta.constraintNoticeShown` false ise:
```javascript
if(!meta.constraintNoticeShown && filteredPool.length){
  alert("Bu diyarda 'Sis' kısıt hücresi var — sayı geçici olarak gizlenir, dokununca açılır. Bu kısıt klasik Slitherlink kuralı dışında ek bir mekanik.");
  meta.constraintNoticeShown=true;
  saveMeta();
}
```

(v1.5'te sadece Sis aktif olduğu için tek satır yeterli.)

---

## Görevler

### Task 1: Branch + log
```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-15 -b plan-15-rules-uniqueness
cd "../slitherlink-plan-15"
```

`docs/log/plan-15-progress.md`:
```markdown
# Plan 15 Progress
## Phase A — UI fixes
- [ ] Task 1: Branch + log
- [ ] Task 2: SW v4 + reset flag bump
- [ ] Task 3: Sıfırla buton topbar + confirm + controls güncelle
- [ ] Task 4: Real-time overflow prevention + toggle
## Phase B — Generator
- [ ] Task 5: tiles.js — broken constraint tile'ları disable (sadece Sis)
- [ ] Task 6: src/core/solver.js (countSolutions)
- [ ] Task 7: generator.js — checkUnique opsiyon + uniquePuzzle setting
## Phase C — Fade UX
- [ ] Task 8: fadeDecided toggle + updateClueStates
## Phase D — Documentation
- [ ] Task 9: HOW_CONTENT.rules güncelle (resmi kurallar)
## Phase E — Awareness
- [ ] Task 10: Constraint notice (ilk kez gösterim)
## Final
- [ ] Task 11: tests genişlet
- [ ] Task 12: Final + merge + push
```

### Tasks 2-12

Spec'teki phase'leri sırayla uygula. Her bağımsız fix kendi commit'i.

### Task 12: Final

Roadmap'e satır ekle:
```
| 15 — Kural uyumu + uniqueness + reset | ✓ tamamlandı | <SHA> |
```

Branch push + main merge + push.

---

## Self-Review

- ✅ Sıfırla buton topbar + confirm (Phase A.1)
- ✅ Real-time overflow prevention (Phase A.2)
- ✅ SW v4 reset (Phase A.3)
- ✅ Broken tile disable (Phase B.1)
- ✅ Uniqueness solver (Phase B.2)
- ✅ uniquePuzzle setting (Phase B.3)
- ✅ fadeDecided toggle (Phase C.1)
- ✅ Resmi kurallar Nasıl Oynanır'da (Phase D.1)
- ✅ Constraint notice (Phase E.1)

**Önerilen dispatch:** İki phase'de — Dispatch 1: A+B (UI fixes + generator), Dispatch 2: C+D+E + final.
