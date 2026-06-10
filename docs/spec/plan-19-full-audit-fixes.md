# Plan 19 · Full audit fix turu — 2 kritik + 12 önemli + minörler

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** İki paralel code-review'un (core mekanik + UI/akış) tüm bulgularını düzelt. Kaynak: Plan 19 öncesi audit raporları (bu spec'e gömülü).

**Bağımlılık:** Plan 18. **Tahmini süre:** 3-4 saat.

---

## Dispatch 1 — Core mekanik fixleri (Tasks 1-8)

### Task 1: Branch + log
Worktree: `plan-19-full-audit-fixes`. `docs/log/plan-19-progress.md` checklist.

### Task 2 (KRİTİK): clue===4 reject — `src/core/generator.js`
`generateLoop()` tek hücrelik filled region üretebiliyor → o hücrenin clue'su 4 olur (tek-hücre mini-loop). Klasik Slitherlink'te 4 yasak; oyun içi yardım da "4 değeri yoktur" diyor. Ampirik: 4×4'te ~%0.2, uniqueness guard'larından geçiyor (trivially unique).

**Fix:** `generateLoop()` dönüşünden önce clue matrisinde 4 taraması; varsa yeniden üret (iç döngü, max 20 deneme — pratikte 1-2 yeter). Hem fast path hem unique path bu fonksiyonu kullandığı için tek noktadan çözülür:

```javascript
function generateLoop(){
  for(let retry=0;retry<20;retry++){
    // ... mevcut üretim gövdesi ...
    // clue hesabından sonra:
    let has4=false;
    for(let r=0;r<R&&!has4;r++)for(let c=0;c<C&&!has4;c++)if(clue[r][c]===4)has4=true;
    if(!has4)return {hE,vE,clue};
  }
  // son çare: yine de döndür (teorik; 20 denemede hep 4 çıkması pratikte imkansız)
  return {hE,vE,clue};
}
```
(Mevcut gövdeyi retry döngüsüne al; filled/hE/vE/clue tanımları döngü içinde kalmalı.)

Commit: `fix(generator): clue=4 (tek-hücre loop) reject — klasik kural ihlali engellendi`

### Task 3 (ÖNEMLİ): Final guard re-verify — `src/core/generator.js`
Mevcut final guard full-clue'a dönüyor ama restore edilen grid yeniden verify edilmiyor. Fix: restore sonrası `countSolutions(...,finalMs)` tekrar; hâlâ !==1 ise `generateLoop()` ile yeni base üret (1 kez) ve onun full-clue halini döndür. Yorumdaki "densest fallback" ifadesini de düzelt ("ilk deneme fallback").

Commit: `fix(generator): final guard restore sonrası re-verify + gerekirse yeni loop`

### Task 4 (ÖNEMLİ): Mum tick persistence — `index.html` startTimer
Mevcut: her tick `store.get` (taze JSON.parse, kaydedilmemiş eski değer) + sadece `elapsed%5===0`'da `store.set` → azaltımların %80'i kaybolur, mum 5× yavaş yanar.

**Fix:** interval closure'ında run'ı bellekte tut:
```javascript
// startTimer içinde, interval kurulmadan önce:
let candleRun=null;
if(ctx.mode==="rogue"){
  const r=store.get(KEYS.rogueRun,null);
  if(r&&r.candleMode&&!r.ended)candleRun=r;
}
// interval içinde store.get yerine candleRun kullan; decrement bellekte;
// throttle yazım korunabilir ama okuma bellekten:
if(candleRun){
  candleRun.timeRemaining=Math.max(0,(candleRun.timeRemaining||0)-deltaSec);
  if((elapsed%5)===0||candleRun.timeRemaining<=0)store.set(KEYS.rogueRun,candleRun);
  if(candleRun.timeRemaining<=0){ /* mevcut timeout akışı */ }
}
```
DİKKAT: autosave da rogueRun'a yazıyor (midPuzzle) — autosave `store.get` ile taze alıp midPuzzle yazarsa candleRun'daki timeRemaining'i ezebilir. Çözüm: autosave rogue dalında da `candleRun` referansını kullan (ya da autosave'in aldığı objeye `timeRemaining`'i candleRun'dan kopyala). En basit güvenli yol: startTimer ve autosave'in paylaştığı module-level `activeCandleRun` değişkeni; autosave rogue dalında `if(activeCandleRun){activeCandleRun.midPuzzle=snapshot();store.set(KEYS.rogueRun,activeCandleRun);}else{mevcut}`. stopTimer'da `activeCandleRun=null` + son store.set.

Commit: `fix(rogue): mum tick persistence — bellekte tut, azaltım kaybolmuyor (5x yavaş yanma bug'ı)`

### Task 5 (ÖNEMLİ): Mum double-charge — `index.html` win deferred moveTo
Puzzle node'da hem gerçek-zaman tick hem sabit 60/120s maliyet düşülüyor. Fix: win()'deki deferred moveTo costs'ta `puzzle:0, elite:0` yap (gerçek süre zaten tick'le sayılıyor); `event:30` ve diğerleri kalsın. Yorum ekle: "puzzle/elite süresi gerçek-zaman tick ile sayılır".

Commit: `fix(rogue): mum çifte kesinti kaldırıldı — puzzle süresi yalnız gerçek-zaman tick`

### Task 6 (ÖNEMLİ): Rogue üretimi buildPuzzleThen ile sar — `index.html`
`enterRogueNode` puzzle üretimi (makePuzzle+applyTiles) ve boss multi-stage üretimi senkron, overlay'siz. D4 8×8-12×12'de 5-10s donma.

**Fix (enterRogueNode):** mevcut sıralamayı koru — pendingNodeId set + store.set ÖNCE (senkron), sonra:
```javascript
buildPuzzleThen(
  ()=>{
    const puzzle=makePuzzle(size,size,keep,rng,{checkUnique:true});
    applyTiles(puzzle,run.realmId,mulberry32(hashSeed(run.seed+"-"+nodeId+"-tiles")),finalDensity);
    return puzzle;
  },
  (puzzle)=>startGame(puzzle,{mode:"rogue",realmId:run.realmId,nodeId,runRef:true})
);
```
**Fix (boss stage):** mevcut setTimeout içindeki senkron makePuzzle+startGame'i buildPuzzleThen ile değiştir (setTimeout kalkabilir; buildPuzzleThen zaten 24ms erteliyor; winOverlay kapatma sırası korunmalı).

Commit: `feat(ux): rogue puzzle üretimi 'Üretiliyor…' overlay'li — D4 donması yok`

### Task 7 (MİNÖR paketi — core):
- `hint()` sonrası autoX uygula: hint çizgisi konunca `applyAutoXAround` + `applyCornerAutoX` (settings.autoX ise) — manuel çizgiyle tutarlı
- `win()`'de `meta.totalStats.time+=elapsed` ekle; `hint()`'te `meta.totalStats.hintsUsed=(...)+1;saveMeta()` — Karakter ekranı SÜRE/İPUCU artık gerçek
- Ölü kod: `DEFAULT_SETTINGS`'ten `uniquePuzzle` kaldır; `run.candleTickAt` set'ini sil
- `resetBoard()` başına `if(solved)return;` guard

Commit: `fix(game): hint autoX + totalStats time/hints + ölü kod temizliği + resetBoard guard`

### Task 8: Dispatch 1 doğrulama
```bash
node --check src/core/generator.js
# clue=4 testi: 4x4 × 3000 üretim {checkUnique:true} → clue===4 sayısı 0 OLMALI
# uniqueness: 10 karışık puzzle → non-unique 0
# index inline script syntax OK
```
Sonuçları progress log'a yaz.

---

## Dispatch 2 — UI/akış fixleri (Tasks 9-16)

### Task 9 (KRİTİK): Daily resume — `index.html` daily kart handler
`dailyCur` yazılıyor ama okunmuyor. Fix (daily kart handler'ında, hasPlayedToday kontrolünden sonra, üretimden önce):
```javascript
const dr=loadResume(KEYS.dailyCur);
if(dr&&dr.ctx&&dr.ctx.date===todayDate()){
  startGame(dr.puzzle,dr.ctx,dr);
  return;
}
if(dr)store.del(KEYS.dailyCur); // stale (dünden kalan)
```

Commit: `fix(daily): yarım kalan günün bulmacası devam ediyor (dailyCur resume + stale temizleme)`

### Task 10 (KRİTİK): Daily'de ✦ Yeni gizle
`applyNewBtnVisibility` → `$("gameNewBtn").classList.toggle("hidden",ctx.mode==="rogue"||ctx.mode==="daily");`

Commit: `fix(ui): Günün Çemberi'nde ✦ Yeni gizli (yanlış startFree engellendi)`

### Task 11 (ÖNEMLİ): Boss multi-stage re-entry — `index.html` enterRogueNode
Ara aşamada çıkıp dönünce stage-1 puzzle'ı geliyor. Fix: enterRogueNode boss dalında `run.bossStage>1` ise win()'deki formülle aynı seed/size/keep kullan. Ortak helper çıkar:
```javascript
function bossStageParams(run,node){
  const realm=getRealm(run.realmId);
  const fc=realm.floorConfig&&realm.floorConfig[node.floor];
  const baseSize=fc?fc.sizes[0]:5, baseKeep=fc?fc.keep:0.75;
  const stage=run.bossStage||1;
  if(stage<=1)return {size:baseSize,keep:baseKeep,seedSuffix:""};
  return {size:baseSize+stage-1,keep:Math.max(0.3,baseKeep-0.05*stage),seedSuffix:"-stage"+stage};
}
```
(win()'deki stage formülünü oku, birebir aynı değerleri üreten helper yap; hem enterRogueNode hem win() bunu kullansın.)

Commit: `fix(rogue): boss ara aşamasından çıkıp dönünce doğru stage puzzle'ı gelir`

### Task 12 (ÖNEMLİ): Ara boss aşaması modal + persist
Win()'in ara-aşama dalında: `$("winNext").style.display="none";` (yarış durumunu kapat) + `saveMeta()` (thread ödülü persist).

Commit: `fix(rogue): ara boss aşamasında Devam gizli + iplik ödülü persist`

### Task 13 (ÖNEMLİ): Neow blessing kaybı — `index.html`
Backdrop/Esc modal'ı kapatınca blessing sunumu kalıcı kayboluyor. Fix: `neowPending` flag:
- `startRogueRun` yeni koşuda: `activeRun.neowPending=true; store.set(...)` sonra modal aç
- Neow modal seçim handler'ında: `run.neowPending=false` + store.set
- `renderRogueMap` başında: `if(run.neowPending&&!run.ended){openNeowModal-yeniden-sun; }` — blessing'ler aynı seed'den deterministik üretildiği için aynı 3 seçenek gelir

Commit: `fix(rogue): Neow blessing backdrop/Esc ile kaybolmuyor — map'e girişte yeniden sunulur`

### Task 14 (ÖNEMLİ): Realm değişimi confirm + reset LB + Esc genOverlay
- Yuva realm click handler'ında: aktif (ended olmayan) koşu varken FARKLI realm'e tıklanırsa `confirm("Aktif koşun ve ilerlemesi silinecek. Yeni diyara geçilsin mi?")`
- `resetAllBtn`: `Object.values(KEYS)` yerine tüm `cember:` prefix'li LS anahtarlarını tara-sil (one-time reset bloğundaki desen); `indexedDB.deleteDatabase` sonrası reload'u `setTimeout(()=>location.reload(),300)` ile yap
- Esc handler'ı `genOverlay`'i kapatmasın (id kontrolü ekle)

Commit: `fix(ui): realm değişimi onayı + tam veri sıfırlama (daily LB dahil) + Esc genOverlay muaf`

### Task 15 (ÖNEMLİ): Win modal free Devam + seed'li Yeni + daily dal
- `showNext` koşuluna `||ctx.mode==="free"` ekle (free'de "Devam ›" = yeni puzzle)
- `startFree(forceNewSeed)` parametresi: true ise seed input'u yok say, rastgele seed. `gameNewBtn` free dalı ve `winNext` free dalı `startFree(true)` çağırsın (setup'tan normal başlatma `startFree()` — seed input geçerli)
- `winNext` handler'ına daily güvenlik dalı: `else if(ctx.mode==="daily"){$("winOverlay").classList.remove("show");renderHome();showScreen("s-home");}`

Commit: `fix(game): free'de Devam=yeni puzzle + Yeni her zaman taze seed + daily güvenli dal`

### Task 16 (MİNÖR paketi — UI):
- Mum timeout modal buton metni "Haritaya dön" (gerçek davranışla hizala)
- `renderYuva`: "koşu yarıda kaldı" yalnız `activeRun&&!activeRun.ended` iken
- `BACKUP_KEYS`'e `KEYS.rogueRun` ve `KEYS.dailyCur` ekle (yedek vaadiyle hizala)
- `applyHintVisibility`: `hintChip`'i de toggle et (`$("hintChip").classList.toggle("hidden",!settings.hints)`)
- `wasResumed` semantiği: home kartı handler'ından kaldır; init bloğunda (sayfa yüklenirken) bir kez: `const r0=store.get(KEYS.rogueRun,null); if(r0&&!r0.ended&&!r0.wasResumed){r0.wasResumed=true;store.set(KEYS.rogueRun,r0);}` — gerçek "farklı oturumda devam" anlamı

Commit: `fix(ui): minör paket — timeout metni, yuva durumu, backup kapsamı, hintChip, wasResumed semantiği`

---

## Final (Task 17)

- Acceptance: clue4=0 (3000×4×4), uniqueness 0 non-unique, `node --check` hepsi, inline script syntax, tests/core.test.js (DOM shim ile) 33+ pass
- SW v7 + reset flag `cember:reset:v7`
- Progress log + roadmap satırı `19 — Full audit fix turu | ✓ tamamlandı | <SHA>`
- Branch push + main merge --no-ff + **main push** (canlıya alma = GitHub push)

Commit: `chore(pwa): SW v7 + reset flag` + `docs(plan-19): final`

---

## Self-Review

- ✅ clue=4 reject (KRİTİK kural ihlali)
- ✅ Daily resume + Yeni gizleme (2 KRİTİK)
- ✅ Mum tick + double-charge
- ✅ Boss stage re-entry + ara aşama modal/persist
- ✅ Neow kaybı, realm confirm, reset LB, Esc
- ✅ Free Devam, taze seed, daily dal
- ✅ totalStats, hint autoX, ölü kod, backup kapsamı, wasResumed
- ✅ SW v7 + push
