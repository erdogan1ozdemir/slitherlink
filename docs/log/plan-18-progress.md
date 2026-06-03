# Plan 18 — Progress Log

Branch: `plan-18-uniqueness-bulletproof`

Hedef: Tek-çözüm garantisini kuşkusuz hale getir. (1) Uniqueness zorunlu (toggle kaldırıldı, tüm call site'lar `checkUnique:true`). (2) Generator final uniqueness guard. (3) Size-aware solver budget. (4) Büyük tahtalarda density floor (uniqueness'i koru). (5) "Üretiliyor…" göstergesi.

---

## Task 1 — Start ✅

- [x] Progress log oluşturuldu
- Commit: `9043929` `chore(plan-18): start`

## Phase A — Uniqueness zorunlu ✅

- [x] 5 call site'ta `checkUnique:settings.uniquePuzzle` → `checkUnique:true` (rogue 1265, boss 1613, startFree, startJourney, daily)
- [x] `TOGGLE_DEFS`'ten `uniquePuzzle` satırı silindi (footgun kaldırıldı; `DEFAULT_SETTINGS.uniquePuzzle:true` geriye uyumluluk için kaldı)
- [x] `HOW_CONTENT.rules` "Kazanma" bölümüne tek-çözüm notu eklendi
- [x] index.html JS parse OK
- Commit: `13b8d60` `feat(uniqueness): tek çözüm artık zorunlu — toggle kaldırıldı, tüm modlar checkUnique:true`

## Phase B — Generator bulletproofing ✅

- [x] `src/core/generator.js` checkUnique yolu YENİ versiyonla değiştirildi:
  - size-aware budget: `verifyMs/checkMs/digMs/finalMs` artık `area`'ya göre ölçekleniyor (`maxLoops=8`)
  - density floor: `keepFloor` = area>=100 ? 0.45 : (area>=64 ? 0.38 : 0.30); `effKeep` clamp
  - FINAL GUARD: dig sonrası `countSolutions!==1` ise full clue'a geri dön (en yoğun, en olası tekil form)
- [x] `node --check src/core/generator.js` geçti
- Commit: `ac2fb94` `feat(generator): final uniqueness guard + size-aware budget + density floor`

## Phase C — "Üretiliyor…" göstergesi ✅

- [x] `genOverlay` HTML eklendi (`<canvas id="confetti">` öncesi)
- [x] `buildPuzzleThen(genFn, then)` helper eklendi (startFree öncesi) — overlay göster, 24ms tick ertele, sonra üret
- [x] startFree / startJourney / daily `buildPuzzleThen` ile wrap edildi
- [x] rogue (1265) + boss-stage (1613): sadece `checkUnique:true` — overlay wrap ATLANDI.
  - Karar gerekçesi: rogue call site `applyTiles` + `pendingNodeId`/`store.set` + `openRogueModal` ile sıkı bağlı; boss stage zaten `setTimeout` + `winOverlay` koreografisi içinde. Plan bu ikisi için overlay'i opsiyonel bırakıyor, kritik olan checkUnique:true.
- [x] index.html JS parse OK
- Commit: `b6ebefc` `feat(ux): 'Üretiliyor…' göstergesi — uniqueness üretimi sırasında donma yerine geri bildirim`

## Phase D — Doğrulama ✅

### Crossing/vertex rule (kod değişikliği yok, doğrulandı)
- `solver.js` `validLoop()`: `if(deg[r][c]!==0&&deg[r][c]!==2)return false;` ✓ — ayrıca `propagate()` içinde `if(d>2)return false;` ve `d===2&&u>0 → cross` zorlaması var.
- `checker.js` `validateLoop()`: `if(deg[r][c]!==0&&deg[r][c]!==2)return false;` ✓
- Canlı oyun (index.html:847-858): `if(settings.preventVertex&&next===1){...if(vdeg(vr,vc)>=2){buzz(...);return;}}` ✓ — 2 çizgili noktaya 3.'yü engelliyor (default açık).
- Sonuç: kural doğru, değişiklik gerekmedi.

### Acceptance test
- [x] `tests/core.test.js`'e `uniqueness across sizes/densities` testi eklendi (5 case × 4 seed)
- [x] Stale test güncellendi: `checkUnique on large board ...` artık `dt<1500` yerine `dt<15000` + uniqueness assert (Plan 18 fast-bail felsefesini kaldırdı; uniqueness mandatory + size-aware budget).
- [x] Full suite headless (Node, document stub): **33 pass · 0 fail · 33 total**

### Node smoke (ZORUNLU)
- cases: [5,.5][6,.5][7,.6][7,.4][9,.55][12,.4] × 4 seed = 24 puzzle
- **non-unique: 0** ✓
- max gen ms: **~9976** (12×12 worst case, digMs cap ~8760'a yakın — plan kabul ediyor)

## Phase E — Final + merge ⏳

- [ ] SW v6 + reset flag `cember:reset:v6`
- [ ] Roadmap satırı
- [ ] Branch push + main merge + push
