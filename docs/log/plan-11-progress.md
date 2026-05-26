# Plan 11 Progress
- [x] Task 1: Branch + log
## Phase A — İpliklik
- [x] Task 2: src/rogue/talents.js
- [x] Task 3: İpliklik UI render + spend handler
- [x] Task 4: Run start: apply talent effects
## Phase B — Charms
- [x] Task 5: src/rogue/charms.js
- [x] Task 6: Karakter Boncuk Dizimi UI (3 slot)
- [x] Task 7: Run start: apply charm effects
## Phase C — Pati izi
- [x] Task 8: Win modal SVG paw animation (per-realm)
## Phase D — Neow
- [x] Task 9: src/rogue/neow.js + 8 blessing
- [x] Task 10: Run start Neow modal
## Phase E — Sis tile
- [x] Task 11: src/rogue/tiles.js + Sis impl
- [x] Task 12: Puzzle render Sis hidden + reveal on tap
## Phase F — Fixes
- [x] Task 13: achievements.js emit guard fix + stub-realm.js sil + run.wasResumed
## Test + Final
- [x] Task 14: tests/core.test.js genişlet
- [x] Task 15: Final + merge + push

## Self-Review

**Spec coverage:**
- ✅ İpliklik functional (6 talent + purchase + run effects: bonusLife, bonusHint, firstHintFree, chestExtraOffer, restBonusHeal, bossBonusThread)
- ✅ Boncuk Dizimi (6 charm + equip 3-slot + library modal + run effects)
- ✅ Pati izi animation (4 paw trail SVG, per-realm color: warm/cool/taupe)
- ✅ Yuva Fısıltısı (8 blessing + start modal, deterministic seed)
- ✅ Sis constraint tile (D2/D3 karanlik-igne/yildiz-gecidi, %22 density, tap → 3s reveal)
- ✅ Fixes:
  - achievements.js: erken-return guard kaldırıldı (semantic fix)
  - stub-realm.js silindi (dead code)
  - run.wasResumed home rogue card resume click'inde set ediliyor (mevcut)
- ✅ Test harness: 8 yeni assert (talent purchase, talent aggregate, charm 3-slot cap, neow determinism, tile apply)

## Smoke test çıktısı
```
talents: 6
charms: 6
neow: 8
tiles: 1
talent purchased, thread: 90 unlocked: [ 'dur-dengesi' ]
effects: { bonusLife: 1, ... }
sis tiles applied: 19
```

## Yeni dosyalar
- src/rogue/talents.js
- src/rogue/charms.js
- src/rogue/neow.js
- src/rogue/tiles.js
- docs/log/plan-11-progress.md

## Silinen dosya
- src/rogue/stub-realm.js (dead code)

## Notlar
- Hint hint() içinde firstHintFree flag handling eklendi — ilk hint sayılmaz.
- Chest offer 3+chestExtraOffer dinamik hesaplanıyor.
- Rest düğümlerinde heal = 1 + restBonusHeal (talent + charm + neow bileşik).
- Charm "Pati İzi" her visited node'da +1 thread (handleRogueNode'da moveTo sonrası).
- Sis reveal: render() içinde setTimeout 3s sonra geri gizle + re-render.
- Neow modal yeni run'da gösterilir, callback'te run save + map render.
