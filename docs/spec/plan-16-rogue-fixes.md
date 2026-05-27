# Plan 16 · Rogue map fixes + Journey/Daily uniqueness + Boss pre-fight

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Rogue map'te tespit edilen layout sorunlarını düzelt (label overflow, node x-overflow), Journey ve Daily mod'larına uniqueness check ekle, boss pre-fight bilgi modali ekle, rogueMapHelp button binding doğrula.

**Bağımlılık:** Plan 15.

**Tahmini süre:** 2-3 saat.

---

## Phase A — Rogue map layout fixes

### A.1 Floor labels yatay yukarıda

**Problem:** Mevcut labelHtml floor isimleri sol kenarda x=22, text-anchor="middle". "Bahçıvanın" (10 char) gibi uzun isimler -25 ile 70 arasında uzanıyor, col=0 node (x=56-76 bölgesi) ile çakışıyor.

**Fix:** Label'ları her floor'un ÜSTÜNE tek satır olarak koy.

`renderRogueMap` labelsHtml bloğunu değiştir:

```javascript
const labelsHtml=Object.values(floorLabels).map(l=>{
  const y=cy(l.floor)-30;  // node row'un üstü
  const tagColor=l.isEdge?"var(--accent)":"var(--muted)";
  const nameTxt=l.name?" · "+l.name.toUpperCase().slice(0,18):"";
  return `<text x="14" y="${y}" font-family="var(--font-mono)" font-size="9.5" fill="${tagColor}" letter-spacing="1.6" text-anchor="start">${l.tag}${nameTxt}</text>`;
}).join("");
```

### A.2 Node x-overflow düzelt

**Problem:** Mevcut `cx(c)=56+c*((W-72)/(COLS-1||1))` ile W=360 + COLS=4 → cx(3)=344 + r=20 → x range 324-364, W=360'ı aşıyor.

**Fix:** `cx` formülünü güvenli margin ile yeniden yaz:
```javascript
const cx=c=>50+c*((W-100)/Math.max(1,COLS-1));
```

W=360, COLS=4 için: cx(0)=50, cx(3)=50+3*(260/3)=310. Node r=20 ile range 30-330. Margin 30px her iki yanda.

COLS=3 için: cx(0)=50, cx(2)=50+2*130=310. Aynı.

COLS=2 için: cx(0)=50, cx(1)=50+1*260=310. Aynı.

### A.3 SVG height — label üst marjı

Labels artık node row'un üstünde (y=cy(f)-30). İlk floor (f=0) cy=50, label y=20. SVG H başlangıcı sorunsuz.

Mevcut: `const H=80+floorSpacing*Math.max(1,run.mapGraph.floors-1);`

Üst marj zaten 80px (cy(0)=50, label y=20 → 30px üstte, margin OK).

Floor 12 için: H=80+90*11=1070. Acceptable.

### A.4 rogueMapHelp button binding doğrula

`renderRogueMap`'in sonunda `mapEl.onclick` ve `rogueNewBtn` binding var. **rogueMapHelp** binding'i eksik.

Render fonksiyonun en sonuna ekle:
```javascript
$("rogueMapHelp")?.addEventListener("click",()=>{
  const l=$("rogueMapLegend");
  if(l)l.style.display=l.style.display==="none"?"block":"none";
});
```

Bu zaten Plan 13'te eklendi ama her renderRogueMap çağrısında re-bind edilmesi lazım çünkü innerHTML güncellenmiyor (sadece rogueMapContent içinde). topbar HTML'i statik, binding bir kere kurulur. Mevcut Plan 13 koduna bak — eğer setupYuvaListeners benzeri tek seferlik kurulum varsa OK; yoksa renderRogueMap'in sonuna ekle (idempotent, tekrar bind sorun olmaz).

Test: rogueMapHelp event listener var mı? grep et:
```bash
grep -n 'rogueMapHelp' index.html
```

Eğer sadece HTML'de var ama listener yoksa, ekle.

---

## Phase B — Journey + Daily uniqueness

### B.1 Journey makePuzzle

`startJourney` fonksiyonunda makePuzzle çağrısını bul:
```javascript
function startJourney(i){
  const lp=levelParams(i);
  const rng=mulberry32(hashSeed(lp.seed));
  startGame(makePuzzle(lp.R,lp.C,lp.keep,rng),{mode:"journey",levelIndex:i});
}
```

Güncelle:
```javascript
function startJourney(i){
  const lp=levelParams(i);
  const rng=mulberry32(hashSeed(lp.seed));
  startGame(makePuzzle(lp.R,lp.C,lp.keep,rng,{checkUnique:settings.uniquePuzzle}),{mode:"journey",levelIndex:i});
}
```

### B.2 Daily makePuzzle

Daily click handler'ında makePuzzle çağrısı:
```javascript
const seed=todaySeed();
const rng=mulberry32(hashSeed(seed));
startGame(makePuzzle(7,7,0.7,rng),{mode:"daily",seed,date:todayDate()});
```

Güncelle:
```javascript
const seed=todaySeed();
const rng=mulberry32(hashSeed(seed));
startGame(makePuzzle(7,7,0.7,rng,{checkUnique:settings.uniquePuzzle}),{mode:"daily",seed,date:todayDate()});
```

---

## Phase C — Boss pre-fight modal

### C.1 Boss'a girişte intro modal

`handleRogueNode` puzzle branch'inde, eğer node.type==="boss" ise, puzzle başlamadan ÖNCE modal göster:

```javascript
if(node.type==="puzzle"||node.type==="elite"||node.type==="boss"){
  // Boss pre-fight intro
  if(node.type==="boss"&&!run.bossIntroShown){
    const realm=getRealm(run.realmId);
    const bossName=realm.bossName||"Patron";
    const bossIntro=realm.bossIntro||"Kat sonu büyük bulmaca.";
    if(confirm(`⚠ ${bossName} karşında.\n\n${bossIntro}\n\nDevam edilsin mi?`)){
      run.bossIntroShown=true;
      store.set(KEYS.rogueRun,run);
    }else{
      return; // user cancelled, stay on map
    }
  }
  // ... existing puzzle setup
}
```

Multi-stage boss için: `bossIntroShown` field her stage'de değil, ilk girişte sıfırlanır. Plan 14'te multi-stage advance sırasında startGame doğrudan çağrılıyor (handleRogueNode'dan değil), o yüzden bossIntroShown sadece ilk attempt'ta tetiklenir.

Win callback'inde, eğer node multi-stage tamamlandıysa `bossIntroShown` reset:
```javascript
if(node&&node.type==="boss"){
  // ... multi-stage handling
  // After final stage:
  run.bossIntroShown=false; // reset for next boss encounter (different realm)
}
```

Aslında `bossIntroShown` realm-spesifik olmalı: `bossIntroShown:{[realmId]:true}` yapısı daha temiz, ama basit tutmak için tek koşu boyunca bir kez yeterli.

### C.2 Pre-fight modal yerine pretty modal (optional)

Confirm() yerine kendi `openRogueModal` kullan:
```javascript
function showBossIntro(run, callback){
  const realm=getRealm(run.realmId);
  const html=`
    <div style="text-align:center;padding:8px 0 4px;">
      <div style="font-family:var(--font-serif);font-size:36px;color:var(--bad);">☠</div>
    </div>
    <h2 style="text-align:center;">${realm.bossName||"Patron"}</h2>
    <p style="font-family:var(--font-serif);font-style:italic;color:var(--ink-dim);text-align:center;line-height:1.5;">${realm.bossIntro||"Kat sonu büyük bulmaca."}</p>
    ${realm.bossMultiStage&&realm.bossMultiStage>1?`<p style="text-align:center;font-family:var(--font-mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);">${realm.bossMultiStage} aşama</p>`:""}
    <div class="row" style="margin-top:14px;">
      <button class="btn-ghost" data-boss-cancel="1">Vazgeç</button>
      <button class="btn-primary" data-boss-go="1" style="border:none;">Başla</button>
    </div>
  `;
  openRogueModal(html,e=>{
    if(e.target.closest("[data-boss-cancel]")){closeRogueModal();}
    else if(e.target.closest("[data-boss-go]")){closeRogueModal();callback();}
  });
}
```

`handleRogueNode` boss handling:
```javascript
if(node.type==="boss"&&!run.bossIntroShown){
  run.bossIntroShown=true;
  store.set(KEYS.rogueRun,run);
  showBossIntro(run,()=>{
    // Continue with puzzle setup
    startBossPuzzle(run,node,nodeId);
  });
  return;
}
// Normal puzzle setup
startBossPuzzle(run,node,nodeId);
```

Bu daha temiz. `startBossPuzzle` helper olarak refactor:
```javascript
function startBossPuzzle(run,node,nodeId){
  // Resume mid-puzzle if same node
  if(run.midPuzzle&&run.midPuzzle.ctx&&run.midPuzzle.ctx.nodeId===nodeId){
    startGame(run.midPuzzle.puzzle,run.midPuzzle.ctx,run.midPuzzle);
    return;
  }
  const realm=getRealm(run.realmId);
  const floorCfg=realm.floorConfig&&realm.floorConfig[node.floor];
  const size=floorCfg?floorCfg.sizes[0]:5;
  const keep=floorCfg?floorCfg.keep:0.75;
  const rng=mulberry32(hashSeed(run.seed+"-"+nodeId));
  const puzzle=makePuzzle(size,size,keep,rng,{checkUnique:settings.uniquePuzzle});
  // tile density
  const tileDensity=({"sogut-esigi":0.15,"karanlik-igne":0.22,"yildiz-gecidi":0.30,"dugumun-ardi":0.35})[run.realmId]||0.22;
  const isBoss=node.type==="boss";
  const finalDensity=isBoss?tileDensity*1.5:tileDensity;
  applyTiles(puzzle,run.realmId,mulberry32(hashSeed(run.seed+"-"+nodeId+"-tiles")),finalDensity);
  startGame(puzzle,{mode:"rogue",realmId:run.realmId,nodeId,runRef:true});
}
```

Mevcut puzzle setup'ı bu helper'a taşı.

---

## Görevler

### Task 1: Branch + log

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-16 -b plan-16-rogue-fixes
cd "../slitherlink-plan-16"
```

`docs/log/plan-16-progress.md`:
```markdown
# Plan 16 Progress
- [ ] Task 1: Branch + log
- [ ] Task 2: Floor labels üste taşı (A.1)
- [ ] Task 3: Node x-overflow düzelt (A.2)
- [ ] Task 4: rogueMapHelp binding doğrula (A.4)
- [ ] Task 5: Journey + Daily checkUnique (B.1-B.2)
- [ ] Task 6: Boss pre-fight modal (C.1-C.2)
- [ ] Task 7: Final + merge + push
```

Commit: `chore(plan-16): start — branch + log`

### Task 2 — Floor labels üste

`renderRogueMap` labelsHtml bloğunu güncelle (üstte single-line label).

Commit: `fix(rogue): floor labels üste taşındı (yatay çakışma yok)`

### Task 3 — Node x-overflow

`cx` formülünü güncelle: `50+c*((W-100)/...)`.

Commit: `fix(rogue): node x-overflow — cx margin artırıldı (4 col için güvenli)`

### Task 4 — rogueMapHelp binding

`grep -n 'rogueMapHelp'` ile mevcut binding'i kontrol et. Eksikse `renderRogueMap` sonuna ekle. Mevcutsa pas.

Commit: `chore(rogue): rogueMapHelp button event listener doğrulandı`

### Task 5 — Journey + Daily checkUnique

`startJourney` ve daily handler'ında makePuzzle'a `{checkUnique:settings.uniquePuzzle}` ekle.

Commit: `feat(uniqueness): journey + daily mod'larına da checkUnique uygulandı`

### Task 6 — Boss pre-fight modal

`handleRogueNode` boss branch'inde `showBossIntro` + `startBossPuzzle` refactor.

Commit: `feat(rogue): boss pre-fight modal — başlamadan önce uyarı + Vazgeç/Başla seçimi`

### Task 7 — Final + merge + push

Roadmap'e satır ekle: `16 — Rogue map fix + uniqueness + boss modal | ✓ tamamlandı | <SHA>`. Branch push + main merge + push.

---

## Self-Review

- ✅ Floor label çakışma fixed (üste taşındı)
- ✅ Node x-overflow fixed (cx margin)
- ✅ Help button binding doğrulandı
- ✅ Journey + Daily uniqueness
- ✅ Boss pre-fight modal

**Önerilen dispatch:** Tek dispatch, 7 task.
