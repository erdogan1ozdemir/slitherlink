# Plan 18 · Uniqueness bulletproof — zorunlu tek çözüm + final guard

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Tek-çözüm garantisini kuşkusuz hale getir. Kullanıcı net: "Tek çözüm en önemlisi; yoğunluk bunu bozacaksa diğer parametreleri sınırla." (1) Uniqueness'i zorunlu kıl (toggle ile kapatılamasın). (2) Generator'a final uniqueness guard ekle. (3) Size-aware solver budget. (4) Büyük tahtalarda density clamp (uniqueness'i koru). (5) Üretim sırasında "Üretiliyor…" göstergesi.

**Bağımlılık:** Plan 17.

**Tahmini süre:** 2-3 saat.

---

## Prensip

- **Uniqueness = sert kısıt.** Yoğunluk (ipucu miktarı) = hedef, gerekirse feda edilir.
- Dig algoritması zaten yoğunluğu dinamik sınırlıyor (tekil kalmazsa clue tutar). Bu plan onu **garantili** + **her zaman açık** hale getirir.
- Vertex derece 0/2 kuralı (çizgilerin kesişememesi) zaten `preventVertex` (default açık) + `validateLoop` ile uygulanıyor — değişiklik yok, sadece doğrula.

---

## Phase A — Uniqueness zorunlu

### A.1 Call site'larda checkUnique her zaman true

`index.html`'de 5 `makePuzzle(...)` çağrısında `{checkUnique:settings.uniquePuzzle}` → `{checkUnique:true}`.

Satırlar (grep ile bul, hepsi):
- `~1265` rogue puzzle
- `~1613` rogue boss stage
- `~2341` startFree
- `~2363` startJourney
- `~2443` daily

Her birinde `checkUnique:settings.uniquePuzzle` → `checkUnique:true`.

### A.2 Toggle'ı settings listesinden kaldır (artık her zaman açık)

`TOGGLE_DEFS` içinden `{k:"uniquePuzzle",...}` satırını SİL. (Kullanıcı kapatamasın — footgun.)

`DEFAULT_SETTINGS`'te `uniquePuzzle:true` kalabilir (zararsız, geriye uyumluluk) — dokunma.

### A.3 Nasıl Oynanır'a not

`HOW_CONTENT.rules` veya `modes` içine kısa bir satır: "Her bulmaca **tek çözümlüdür** — tahtanın iki türlü bitirilme ihtimali yoktur." (Zaten varsa atla.)

Commit: `feat(uniqueness): tek çözüm artık zorunlu — toggle kaldırıldı, tüm modlar checkUnique:true`

---

## Phase B — Generator bulletproofing

`src/core/generator.js`'in `checkUnique` yolunu (dig bölümü) güçlendir.

Mevcut dig bölümünü (verifyMs/checkMs/digMs/maxLoops tanımından dönüş satırına kadar) şu YENİ versiyonla değiştir:

```javascript
  // Unique path — uniqueness MANDATORY. Budgets scale with board area.
  const area=R*C;
  const verifyMs=options.verifyMs|| Math.min(3000, 600+area*15);
  const checkMs =options.checkMs || Math.min(1200, 250+area*6);
  const digMs   =options.digMs   || Math.min(9000, 2000+area*45);
  const finalMs =options.finalMs || Math.min(3000, 800+area*15);
  const maxLoops=options.maxLoops|| 8;

  // Density clamp: çok düşük yoğunluk büyük tahtalarda uniqueness'i zorlaştırır
  // ve üretimi yavaşlatır. Boyuta göre minimum keep oranı uygula.
  // (Kullanıcı isteği: "yoğunluk bunu bozacaksa diğer parametreleri sınırla")
  let effKeep=keepRatio;
  const keepFloor = area>=100 ? 0.45 : (area>=64 ? 0.38 : 0.30);
  if(effKeep<keepFloor)effKeep=keepFloor;

  // 1) Full clue set'i VERIFIED-UNIQUE olan bir loop bul.
  let base=null;
  for(let attempt=0;attempt<maxLoops;attempt++){
    const lp=generateLoop();
    if(countSolutions({R,C,clue:lp.clue},2,verifyMs)===1){ base=lp; break; }
    if(!base)base=lp; // densest fallback
  }
  const {hE,vE,clue}=base;

  // 2) Dig: yalnızca uniqueness korunursa clue çıkar.
  const targetRemovals=Math.floor(area*(1-effKeep));
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
    if(countSolutions({R,C,clue},2,checkMs)===1){removed++;}
    else{clue[r][c]=saved;}
  }

  // 3) FINAL GUARD: sonuç MUTLAKA tek çözümlü olmalı. Değilse (base verify
  //    edilememişse) full clue'a geri dön — en kısıtlı, neredeyse her zaman tekil form.
  if(countSolutions({R,C,clue},2,finalMs)!==1){
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      clue[r][c]=hE[r][c]+hE[r+1][c]+vE[r][c]+vE[r][c+1];
    }
  }
  return {R,C,solH:hE,solV:vE,clue};
```

**Garanti zinciri:**
- maxLoops=8 → verified-unique full-clue base bulunur (neredeyse her zaman).
- Dig her removal'da countSolutions===1 doğrular → unique korunur.
- Final guard → sonuç tekil değilse full clue (en yoğun, en olası tekil) döner.
- keepFloor → büyük tahtalarda aşırı seyreklik engellenir (uniqueness + hız).

Commit: `feat(generator): final uniqueness guard + size-aware budget + density floor`

---

## Phase C — "Üretiliyor…" göstergesi

Uniqueness her zaman açık olunca büyük tahtalarda üretim 1-5s sürebilir. Donma yerine kısa overlay.

### C.1 HTML overlay

`index.html`'de `<canvas id="confetti">` öncesine ekle:

```html
<div class="overlay center" id="genOverlay">
  <div style="text-align:center;">
    <div style="font-family:var(--font-serif);font-style:italic;font-size:20px;color:var(--accent);">Üretiliyor…</div>
    <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:8px;">tek çözümlü bulmaca hazırlanıyor</div>
  </div>
</div>
```

### C.2 Helper + deferred generation

JS'te (puzzle generation call site'larından önce tanımlı olacak şekilde):

```javascript
function buildPuzzleThen(genFn, then){
  $("genOverlay").classList.add("show");
  setTimeout(()=>{
    let p=null;
    try{ p=genFn(); }
    catch(e){ console.error("puzzle gen failed",e); }
    $("genOverlay").classList.remove("show");
    if(p)then(p);
  },24);
}
```

### C.3 Call site'ları wrap et

5 call site'ı `buildPuzzleThen` ile sar. Örnek:

`startFree`:
```javascript
function startFree(){
  const seedStr=$("seedInput").value.trim();
  const seed=seedStr?seedStr:("r"+Math.floor(Math.random()*1e9));
  const rng=mulberry32(hashSeed(seed));
  buildPuzzleThen(
    ()=>makePuzzle(setupSize,setupSize,setupDens/100,rng,{checkUnique:true}),
    (puzzle)=>startGame(puzzle,{mode:"free",levelIndex:null,seed})
  );
}
```

`startJourney`:
```javascript
function startJourney(i){
  const lp=levelParams(i);
  const rng=mulberry32(hashSeed(lp.seed));
  buildPuzzleThen(
    ()=>makePuzzle(lp.R,lp.C,lp.keep,rng,{checkUnique:true}),
    (puzzle)=>startGame(puzzle,{mode:"journey",levelIndex:i})
  );
}
```

Daily handler (satır ~2443): aynı şekilde wrap.

Rogue puzzle (satır ~1265, `enterRogueNode` veya `startBossPuzzle` içinde) ve rogue boss stage (~1613): bu ikisi `startGame`'i farklı bağlamda çağırıyor. Bunları da `buildPuzzleThen` ile sar — ama dikkat: rogue puzzle generation'ı `enterRogueNode` içinde diğer state (pendingNodeId, applyTiles) ile birlikte. `makePuzzle` + `applyTiles` zincirini genFn içine al, `startGame` çağrısını `then` içine al. Mevcut kodu Read edip dikkatli wrap et; pendingNodeId/store.set sıralamasını bozma.

> NOT: Boss multi-stage (~1613) `setTimeout` içinde zaten çağrılıyor olabilir; orada `buildPuzzleThen` iç içe setTimeout sorun çıkarmaz ama gereksizse overlay'i atla — sadece `makePuzzle`'a `checkUnique:true` yeterli. İmplementer karar versin; kritik olan checkUnique:true.

Commit: `feat(ux): 'Üretiliyor…' göstergesi — uniqueness üretimi sırasında donma yerine geri bildirim`

---

## Phase D — Doğrulama (crossing rule + uniqueness)

### D.1 Crossing/vertex rule confirm (kod değişikliği yok, sadece doğrula)

- `validateLoop` (solver.js + checker.js): vertex derece sadece 0/2 kabul ediyor mu? (`if(deg!==0&&deg!==2)return false`) → EVET olmalı.
- Live oyun: `preventVertex` default true, bir noktada 2 çizgi varken 3.'ye izin vermiyor mu? → grep `vdeg(vr,vc)>=2`.
- Bulgularını progress log'a yaz. Kod doğruysa değişiklik yok.

### D.2 Acceptance test — çapraz boyut + yoğunluk

`tests/core.test.js`'e ekle:
```javascript
test("uniqueness across sizes/densities (no multi-solution ships)",()=>{
  let bad=0;
  const cases=[[5,0.5],[6,0.5],[7,0.6],[7,0.4],[9,0.55]];
  for(const [sz,dens] of cases){
    for(let s=0;s<4;s++){
      const p=makePuzzle(sz,sz,dens,mulberry32(hashSeed("acc"+sz+"-"+dens+"-"+s)),{checkUnique:true});
      if(countSolutions(p,2,4000)!==1)bad++;
    }
  }
  eq(bad,0);
});
```

Node smoke (worktree'de koş, raporla):
```bash
cat > _acc.mjs << 'EOF'
import {makePuzzle} from "./src/core/generator.js";
import {countSolutions} from "./src/core/solver.js";
import {mulberry32,hashSeed} from "./src/core/rng.js";
let bad=0,maxMs=0;
const cases=[[5,0.5],[6,0.5],[7,0.6],[7,0.4],[9,0.55],[12,0.4]];
for(const[sz,dens]of cases){
  for(let s=0;s<4;s++){
    const t0=Date.now();
    const p=makePuzzle(sz,sz,dens,mulberry32(hashSeed("a"+sz+dens+s)),{checkUnique:true});
    maxMs=Math.max(maxMs,Date.now()-t0);
    if(countSolutions(p,2,5000)!==1){bad++;console.log("MULTI:",sz,dens,s);}
  }
}
console.log("non-unique:",bad,"| max gen ms:",maxMs);
EOF
node ./_acc.mjs; rm _acc.mjs
```
**Beklenen: `non-unique: 0`.** max gen ms raporla (12x12 birkaç saniye olabilir, kabul).

---

## Phase E — Final + merge + push

- Progress log + roadmap satırı `18 — Uniqueness bulletproof | ✓ tamamlandı | <SHA>`
- SW v6 + reset flag `cember:reset:v6` (yeni generator davranışı + temiz başlangıç)
- Branch push + main merge --no-ff + push (pull --no-rebase --no-edit önce, divergent olabilir)

Commit (SW): `chore(pwa): SW v6 + reset flag`

---

## Self-Review

- ✅ Uniqueness zorunlu (toggle yok, her call site checkUnique:true)
- ✅ Final guard (sonuç tekil değilse full clue)
- ✅ Size-aware budget + density floor
- ✅ Üretiliyor göstergesi
- ✅ Crossing rule doğrulandı
- ✅ Çapraz boyut acceptance test (non-unique 0)
- ✅ SW v6 reset

## Önerilen dispatch

Tek dispatch — odaklı (generator + 5 call site + settings + overlay + test). Acceptance test ZORUNLU: non-unique 0 raporlanmalı.
