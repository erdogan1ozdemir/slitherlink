# Plan 05 · Modular refactor (soft — pure logic ayrımı + test harness)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** index.html'in pure logic katmanını (RNG + generator + checker) `src/core/` modüllerine ayır. UI ve state monolitik kalır (risk azaltma). Test harness eklenir. Plan 06 (Rogue infrastructure) bu temel üzerine yeni modülleri ekleyebilir.

**Architecture:** `<script type="module">` ile yüklenen `src/core/*.js`. Modüller ES module export; index.html bootstrap'te import edip `window`'a expose eder (mevcut inline kodla geriye dönük uyum için). Tests: `tests/test-runner.html` minimal harness (no framework).

**Tech Stack:** Vanilla ES modules. Yerelde `python3 -m http.server` veya benzeri gerekli (file:// modüller çalışmaz).

**Bağımlılık:** Plan 04 tamamlanmış.

**Tahmini süre:** 2-3 saat.

**Yaklaşım — minimal risk:**
- Sadece pure functions çıkarılır (DOM yok, state yok)
- UI / state / event handlers index.html'de kalır
- Modüller named export + window.X = X line ile çift erişim
- Test: pure functions için 3-5 smoke assert

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `src/core/rng.js` | Create | `hashSeed`, `mulberry32` (pure) |
| `src/core/generator.js` | Create | `makePuzzle(R,C,keepRatio,rng)` (pure) |
| `src/core/checker.js` | Create | `lineCount`, `decided`, `validateLoop` (pure) |
| `index.html` | Modify | Pure logic kaldırıldı, `<script type="module">` ile import |
| `tests/test-runner.html` | Create | Minimal test harness — browser'da açılır |
| `tests/core.test.js` | Create | RNG + generator + checker smoke tests |
| `docs/log/plan-05-progress.md` | Create | Progress notları |

> Not: `index.html` boyutu azalır ama UI/state hâlâ orada. Plan 06'da yeni UI modüller eklenecek.

---

## Görevler

### Task 1: Branch + progress log

- [ ] Worktree:
  ```bash
  cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
  git worktree add ../slitherlink-plan-05 -b plan-05-modular-refactor
  cd "../slitherlink-plan-05"
  mkdir -p src/core tests
  ```
- [ ] `docs/log/plan-05-progress.md`:
  ```markdown
  # Plan 05 Progress
  - [ ] Task 1: Branch + log + dirs
  - [ ] Task 2: src/core/rng.js
  - [ ] Task 3: src/core/generator.js
  - [ ] Task 4: src/core/checker.js
  - [ ] Task 5: index.html type=module + import + cleanup
  - [ ] Task 6: tests/test-runner.html + tests/core.test.js
  - [ ] Task 7: Final + merge + push
  ```
- [ ] Commit: `chore(plan-05): start — branch + log + dir scaffolding`

---

### Task 2: src/core/rng.js

`index.html` içinde `hashSeed` ve `mulberry32` fonksiyonlarını bul (yaklaşık line 280-282 civarı). Tam metnini al, `src/core/rng.js`'e taşı:

```javascript
// src/core/rng.js — Seedable deterministic RNG
export function hashSeed(s){
  let h=2166136261>>>0;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return h>>>0;
}
export function mulberry32(a){
  return function(){
    a|=0;
    a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296;
  };
}
```

Commit: `feat(core): rng.js — hashSeed + mulberry32 (pure)`

---

### Task 3: src/core/generator.js

`makePuzzle` fonksiyonunun tamamını taşı (yaklaşık line 290-310 civarı). Pure, dependency: yok.

```javascript
// src/core/generator.js — Slitherlink puzzle generator (single-loop guaranteed)
export function makePuzzle(R,C,keepRatio,rng){
  rng=rng||Math.random;
  const filled=Array.from({length:R},()=>Array(C).fill(false));
  filled[(R/2)|0][(C/2)|0]=true;
  const inb=(r,c)=>r>=0&&r<R&&c>=0&&c<C;
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
  for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(rng()>keepRatio)clue[r][c]=-1;
  return {R,C,solH:hE,solV:vE,clue};
}
```

Commit: `feat(core): generator.js — makePuzzle (pure, single-loop guaranteed)`

---

### Task 4: src/core/checker.js

`lineCount`, `decided`, ve `checkWin` mantığının validate kısmını taşı. Win callback (UI çağrısı) main'de kalır.

```javascript
// src/core/checker.js — Slitherlink win-condition validators (pure)

export function lineCount(hState,vState,r,c){
  return (hState[r][c]===1)+(hState[r+1][c]===1)+(vState[r][c]===1)+(vState[r][c+1]===1);
}

export function decided(hState,vState,r,c){
  return [hState[r][c],hState[r+1][c],vState[r][c],vState[r][c+1]].every(s=>s!==0);
}

/**
 * Returns true if hState/vState forms a single closed loop satisfying all clues.
 */
export function validateLoop(puzzle,hState,vState){
  const R=puzzle.R,C=puzzle.C;
  for(let r=0;r<R;r++)for(let c=0;c<C;c++){
    if(puzzle.clue[r][c]<0)continue;
    if(lineCount(hState,vState,r,c)!==puzzle.clue[r][c])return false;
  }
  const deg=Array.from({length:R+1},()=>Array(C+1).fill(0));
  let edges=0;
  for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(hState[r][c]===1){deg[r][c]++;deg[r][c+1]++;edges++;}
  for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(vState[r][c]===1){deg[r][c]++;deg[r+1][c]++;edges++;}
  if(!edges)return false;
  for(let r=0;r<=R;r++)for(let c=0;c<=C;c++)if(deg[r][c]!==0&&deg[r][c]!==2)return false;
  let s=null,td2=0;
  for(let r=0;r<=R;r++)for(let c=0;c<=C;c++)if(deg[r][c]===2){td2++;if(!s)s=[r,c];}
  const seen=Array.from({length:R+1},()=>Array(C+1).fill(false));
  const st=[s];seen[s[0]][s[1]]=true;let v=0;
  while(st.length){
    const[r,c]=st.pop();v++;
    if(c<C&&hState[r][c]===1&&!seen[r][c+1]){seen[r][c+1]=true;st.push([r,c+1]);}
    if(c>0&&hState[r][c-1]===1&&!seen[r][c-1]){seen[r][c-1]=true;st.push([r,c-1]);}
    if(r<R&&vState[r][c]===1&&!seen[r+1][c]){seen[r+1][c]=true;st.push([r+1,c]);}
    if(r>0&&vState[r-1][c]===1&&!seen[r-1][c]){seen[r-1][c]=true;st.push([r-1,c]);}
  }
  return v===td2;
}
```

Commit: `feat(core): checker.js — lineCount + decided + validateLoop (pure)`

---

### Task 5: index.html — module mode + import + cleanup

**Edit 1: `<script>` → `<script type="module">`**

old_string:
```
<script>
/* =========================================================================
   0) PWA — service worker register + persistent storage
   ========================================================================= */
```

new_string:
```
<script type="module">
import {hashSeed, mulberry32} from "./src/core/rng.js";
import {makePuzzle} from "./src/core/generator.js";
import {lineCount as _lineCount, decided as _decided, validateLoop} from "./src/core/checker.js";

/* =========================================================================
   0) PWA — service worker register + persistent storage
   ========================================================================= */
```

**Edit 2: Eski `hashSeed` ve `mulberry32` tanımlarını sil**

Bul:
```javascript
function hashSeed(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
```

Sil (Edit ile boş string'e değiştir veya yorum bloğuna çevir). Bu satırlar artık import ediliyor.

old_string:
```
function hashSeed(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
```

new_string:
```
// hashSeed + mulberry32 imported from ./src/core/rng.js
```

**Edit 3: Eski `makePuzzle` tanımını sil**

(Çok uzun bir blok; Edit ile değiştir.)

Eski `function makePuzzle(R,C,keepRatio,rng){...}` tamamını bul; tek satıra:

new_string: `// makePuzzle imported from ./src/core/generator.js`

(Pratik için: Read ile mevcut metni al, ardından Edit'le tek satırlık yorum yap.)

**Edit 4: Eski `lineCount` ve `decided` (foundation versiyonları stateful — hState/vState global)**

Mevcut signature: `lineCount(r,c)` — global hState/vState kullanır.
Yeni signature: `_lineCount(hState,vState,r,c)` — pure.

Index.html'de `lineCount(r,c)` çağrılarını `_lineCount(hState,vState,r,c)` olarak değiştir. Veya basit bir wrapper tanımla:

```javascript
const lineCount=(r,c)=>_lineCount(hState,vState,r,c);
const decided=(r,c)=>_decided(hState,vState,r,c);
```

Eski tanımları sil (`function lineCount...` ve `function decided...` satırları).

Edit yöntemi:
- old: `function lineCount(r,c){return ...}\nfunction decided(r,c){return ...}`
- new: `const lineCount=(r,c)=>_lineCount(hState,vState,r,c);\nconst decided=(r,c)=>_decided(hState,vState,r,c);`

**Edit 5: `checkWin` validateLoop kullansın**

Mevcut `function checkWin(){...}` win condition kontrolünü `validateLoop` ile değiştir.

old:
```javascript
function checkWin(){const R=P.R,C=P.C;
  for(let r=0;r<R;r++)for(let c=0;c<C;c++){if(P.clue[r][c]<0)continue;if(lineCount(r,c)!==P.clue[r][c])return;}
  const deg=Array.from({length:R+1},()=>Array(C+1).fill(0));let edges=0;
  for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(hState[r][c]===1){deg[r][c]++;deg[r][c+1]++;edges++;}
  for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(vState[r][c]===1){deg[r][c]++;deg[r+1][c]++;edges++;}
  if(!edges)return;for(let r=0;r<=R;r++)for(let c=0;c<=C;c++)if(deg[r][c]!==0&&deg[r][c]!==2)return;
  let s=null,td2=0;for(let r=0;r<=R;r++)for(let c=0;c<=C;c++)if(deg[r][c]===2){td2++;if(!s)s=[r,c];}
  const seen=Array.from({length:R+1},()=>Array(C+1).fill(false));const st=[s];seen[s[0]][s[1]]=true;let v=0;
  while(st.length){const[r,c]=st.pop();v++;
    if(c<C&&hState[r][c]===1&&!seen[r][c+1]){seen[r][c+1]=true;st.push([r,c+1]);}
    if(c>0&&hState[r][c-1]===1&&!seen[r][c-1]){seen[r][c-1]=true;st.push([r,c-1]);}
    if(r<R&&vState[r][c]===1&&!seen[r+1][c]){seen[r+1][c]=true;st.push([r+1,c]);}
    if(r>0&&vState[r-1][c]===1&&!seen[r-1][c]){seen[r-1][c]=true;st.push([r-1,c]);}}
  if(v===td2)win();
}
```

new:
```javascript
function checkWin(){
  if(validateLoop(P,hState,vState))win();
}
```

Commit: `refactor(core): index.html pure logic'i src/core'a delege etti (module mode)`

---

### Task 6: Test harness

**Step 6.1:** `tests/test-runner.html`

```html
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Slitherlink Test Runner</title>
<style>
body{font-family:ui-monospace,monospace;background:#0a0a0c;color:#EDEAE3;padding:24px;line-height:1.5;}
h1{color:#A89B8B;font-weight:500;margin:0 0 16px;}
.test{padding:8px 12px;margin:4px 0;border-radius:6px;border:1px solid rgba(237,234,227,.08);}
.test.pass{border-color:rgba(143,163,154,.5);color:#8FA39A;}
.test.fail{border-color:rgba(201,122,111,.5);color:#C97A6F;}
.summary{margin-top:18px;padding:12px;background:#15151a;border-radius:8px;}
</style>
</head>
<body>
<h1>Slitherlink — Core Tests</h1>
<div id="results"></div>
<div class="summary" id="summary">Running…</div>
<script type="module">
import "./core.test.js";
</script>
</body>
</html>
```

**Step 6.2:** `tests/core.test.js`

```javascript
// tests/core.test.js — minimal smoke harness, no framework
import {hashSeed, mulberry32} from "../src/core/rng.js";
import {makePuzzle} from "../src/core/generator.js";
import {validateLoop} from "../src/core/checker.js";

const results=document.getElementById("results");
const summary=document.getElementById("summary");
let pass=0,fail=0;

function test(name,fn){
  const div=document.createElement("div");
  div.className="test";
  try{
    fn();
    div.classList.add("pass");
    div.textContent="✓ "+name;
    pass++;
  }catch(e){
    div.classList.add("fail");
    div.textContent="✗ "+name+" — "+e.message;
    fail++;
  }
  results.appendChild(div);
}
function assert(cond,msg){if(!cond)throw new Error(msg||"assert failed");}
function eq(a,b,msg){if(a!==b)throw new Error((msg||"eq failed")+": "+a+" !== "+b);}

// RNG: deterministik
test("hashSeed deterministic",()=>{
  eq(hashSeed("merve-01"),hashSeed("merve-01"));
  assert(hashSeed("a")!==hashSeed("b"));
});
test("mulberry32 deterministic",()=>{
  const r1=mulberry32(42);const r2=mulberry32(42);
  for(let i=0;i<5;i++)eq(r1(),r2());
});

// Generator: tek loop + clue validity
test("makePuzzle returns valid structure",()=>{
  const rng=mulberry32(hashSeed("test-seed-1"));
  const p=makePuzzle(5,5,0.8,rng);
  eq(p.R,5);eq(p.C,5);
  eq(p.solH.length,6);eq(p.solH[0].length,5);
  eq(p.solV.length,5);eq(p.solV[0].length,6);
  eq(p.clue.length,5);
});
test("makePuzzle solution is a valid single loop",()=>{
  for(let seed=1;seed<=10;seed++){
    const rng=mulberry32(hashSeed("test-"+seed));
    const p=makePuzzle(5,5,1.0,rng);
    assert(validateLoop(p,p.solH,p.solV),"solution should validate for seed "+seed);
  }
});

// Checker: empty state should not win
test("validateLoop returns false for empty edges",()=>{
  const rng=mulberry32(hashSeed("empty-check"));
  const p=makePuzzle(4,4,1.0,rng);
  const hEmpty=Array.from({length:5},()=>Array(4).fill(0));
  const vEmpty=Array.from({length:4},()=>Array(5).fill(0));
  assert(!validateLoop(p,hEmpty,vEmpty));
});

summary.textContent=`${pass} pass · ${fail} fail · ${pass+fail} total`;
summary.style.color=fail?"#C97A6F":"#8FA39A";
```

**Step 6.3:** README'ye test çalıştırma not'u ekle (`README.md` mevcut)

Optional minor edit: README'ye `tests/test-runner.html` çalıştırma not'u ekle. Veya skip.

Commit: `test(core): test-runner.html + 5 smoke assert (rng + generator + validateLoop)`

---

### Task 7: Final + merge + push

- [ ] **Manuel test instruction (progress log'a yaz):**
  ```
  Test: 
  1. cd to project root
  2. python3 -m http.server 8000
  3. Open http://localhost:8000/tests/test-runner.html
  4. Tüm test'ler yeşil olmalı
  5. http://localhost:8000/ ile oyunu aç, hâlâ çalıştığını doğrula
  ```

- [ ] Progress log final + roadmap update (`05 — Modular refactor | ✓ tamamlandı | <SHA> |`)

- [ ] Commit + branch push + main merge + main push

---

## Self-Review

**Spec coverage:** ✅ rng + generator + checker ayrıldı, ✅ module mode, ✅ test harness.

**Önerilen dispatch:** Tek dispatch — Tasks 1-7 tek subagent'a (toplam ~8 commit + 1 merge).
