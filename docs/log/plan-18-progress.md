# Plan 18 — Progress Log

Branch: `plan-18-uniqueness-bulletproof`

Hedef: Tek-çözüm garantisini kuşkusuz hale getir. (1) Uniqueness zorunlu (toggle kaldırıldı, tüm call site'lar `checkUnique:true`). (2) Generator final uniqueness guard. (3) Size-aware solver budget. (4) Büyük tahtalarda density floor (uniqueness'i koru). (5) "Üretiliyor…" göstergesi.

---

## Task 1 — Start ⏳

- [ ] Progress log oluşturuldu
- Commit: `chore(plan-18): start`

## Phase A — Uniqueness zorunlu ⏳

- [ ] 5 call site'ta `checkUnique:settings.uniquePuzzle` → `checkUnique:true`
- [ ] `TOGGLE_DEFS`'ten `uniquePuzzle` satırı silindi
- [ ] `HOW_CONTENT.rules`'a tek-çözüm notu eklendi

## Phase B — Generator bulletproofing ⏳

- [ ] checkUnique yolu YENİ versiyonla değiştirildi (size-aware budget + density floor + final guard)

## Phase C — "Üretiliyor…" göstergesi ⏳

- [ ] genOverlay HTML eklendi
- [ ] `buildPuzzleThen` helper eklendi
- [ ] startFree / startJourney / daily wrap edildi
- [ ] rogue + boss: sadece `checkUnique:true` (overlay riski → atlandı)

## Phase D — Doğrulama ⏳

- [ ] Crossing rule doğrulandı (validateLoop + preventVertex)
- [ ] Acceptance test eklendi
- [ ] Node smoke: non-unique 0

## Phase E — Final + merge ⏳

- [ ] SW v6 + reset flag `cember:reset:v6`
- [ ] Roadmap satırı
- [ ] Branch push + main merge + push
