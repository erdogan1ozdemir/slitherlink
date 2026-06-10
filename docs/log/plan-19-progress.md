# Plan 19 — Full audit fix turu · Progress

Branch: `plan-19-full-audit-fixes`

## Dispatch 1 — Core mekanik fixleri

- [x] Task 1: Branch + log
- [x] Task 2 (KRİTİK): clue=4 reject — generator.js (`d5bd948`)
- [x] Task 3 (ÖNEMLİ): Final guard re-verify — generator.js (`644b0c3`)
- [x] Task 4 (ÖNEMLİ): Mum tick persistence — startTimer + autosave `activeCandleRun` (`1c22d82`)
- [x] Task 5 (ÖNEMLİ): Mum double-charge — win deferred moveTo `puzzle:0,elite:0` (`26a9488`)
- [x] Task 6 (ÖNEMLİ): Rogue üretimi buildPuzzleThen ile sar — enterRogueNode + boss stage (`38427b9`)
- [x] Task 7 (MİNÖR paketi — core): hint autoX + totalStats time/hints + uniquePuzzle/candleTickAt ölü kod + resetBoard guard (`bd101cf`)
- [x] Task 8: Dispatch 1 doğrulama

### Task 8 doğrulama sonuçları (2026-06-10)

- `node --check src/core/generator.js` → GEN_OK
- clue=4 testi: 3000× 4×4 `{checkUnique:true}` → **clue4 count: 0** ✓
- uniqueness regression: 5/6/7/9 boyutları × 3 seed → **non-unique: 0** ✓
- index.html inline module script → **INDEX_OK** ✓

Not (Task 4/7 kapsam genişlemesi): `hint()` rogue dalı da `activeCandleRun||store.get(...)` kullanıyor — aksi halde hint'in `store.set`'i bellekteki mum `timeRemaining`/`firstHintUsed` durumunu ezebilirdi (autosave fix'iyle aynı desen).

## Dispatch 2 — UI/akış fixleri

- [x] Task 9 (KRİTİK): Daily resume — dailyCur resume + stale temizleme (`3ba5984`)
- [x] Task 10 (KRİTİK): Daily'de ✦ Yeni gizle (`311b8c4`)
- [x] Task 11 (ÖNEMLİ): Boss multi-stage re-entry — `bossStageParams` helper, win() + enterRogueNode ortak (`3c69d77`)
- [x] Task 12 (ÖNEMLİ): Ara boss aşaması modal + persist — winNext gizli + saveMeta (`024646c`)
- [x] Task 13 (ÖNEMLİ): Neow blessing kaybı — `neowPending` flag + `maybeShowNeow` re-sun (`d1dfca5`)
- [x] Task 14 (ÖNEMLİ): Realm değişimi confirm + reset LB + Esc genOverlay (`c2cbf02`)
- [x] Task 15 (ÖNEMLİ): Win modal free Devam + seed'li Yeni + daily dal (`af3b373`)
- [x] Task 16 (MİNÖR paketi — UI): timeout metni, yuva durumu, backup kapsamı, hintChip, wasResumed (`efb07bd`)

### Dispatch 2 notları

- Task 9: `loadResume(KEYS.dailyCur)` free/journey ile aynı desen; `dr.ctx.date!==todayDate()` ise stale silinir.
- Task 11 kapsam notu: win() stage-advance `applyTiles` çağırmaz; re-entry de stage>1'de tile uygulamaz — birebir aynı puzzle. Re-entry ctx'ine `bossStage` eklendi (win() stage-advance ile aynı).
- Task 15 dikkat: `$("startFreeBtn").addEventListener("click",startFree)` event objesini `forceNewSeed` sanırdı — `()=>startFree()` ile sarıldı.
- Task 16 wasResumed: home kartı handler'ından kaldırıldı; init bloğunda sayfa yüklenirken bir kez işaretlenir (gerçek "farklı oturumda devam" semantiği).

## Final

- [x] Task 17: Acceptance + SW v7 + roadmap + merge/push (`ecaee5b` SW v7)

### Task 17 doğrulama sonuçları (2026-06-10)

- `node --check` src/core/*.js + src/rogue/*.js → **SRC_OK** ✓
- index.html inline module script → **INDEX_OK** ✓
- Spot check: 500× 4×4 `{checkUnique:true}` → **clue4: 0** ✓; 6× 6×6 → **non-unique: 0** ✓
- tests/core.test.js (DOM shim ile) → **33 pass · 0 fail · 33 total** ✓
- SW `slitherlink-shell-v7` + `cember:reset:v7` ✓
