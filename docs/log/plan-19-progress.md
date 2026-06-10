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

- [ ] Task 9 (KRİTİK): Daily resume
- [ ] Task 10 (KRİTİK): Daily'de ✦ Yeni gizle
- [ ] Task 11 (ÖNEMLİ): Boss multi-stage re-entry
- [ ] Task 12 (ÖNEMLİ): Ara boss aşaması modal + persist
- [ ] Task 13 (ÖNEMLİ): Neow blessing kaybı
- [ ] Task 14 (ÖNEMLİ): Realm değişimi confirm + reset LB + Esc genOverlay
- [ ] Task 15 (ÖNEMLİ): Win modal free Devam + seed'li Yeni + daily dal
- [ ] Task 16 (MİNÖR paketi — UI)

## Final

- [ ] Task 17: Acceptance + SW v7 + roadmap + merge/push
