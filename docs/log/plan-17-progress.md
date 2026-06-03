# Plan 17 — Progress Log

Branch: `plan-17-uniqueness-preview-bugs`

Hedef: Çoklu-çözüm bug'ının kök çözümü (propagating solver + dig generation), node preview modal, orphan node fix, code review bug'ları.

---

## Phase A — Solver rewrite (propagation) ✅

- [x] `src/core/solver.js` constraint propagation + trail-based backtracking ile tamamen değiştirildi
- [x] `node --check src/core/solver.js` geçti
- Commit: `a32e1c5` `feat(solver): constraint propagation + trail backtracking — uniqueness 50-100x hızlandı`

## Phase B — Generator dig rewrite ✅

- [x] `src/core/generator.js` dig algoritması ile tamamen değiştirildi (generateLoop iç fonksiyonu + dig)
- [x] `node --check src/core/generator.js` geçti
- [x] Acceptance test: `non-unique: 0/20` (7×7, 20 seed) — gen avg 12ms
- [x] Solver doğruluk testi (full-clue=1 ✓, empty 2x2=2 çoklu ✓)
- [x] Ek robustness sweep (6x6/7x7/12x12/4x4): TOTAL non-unique=0
- Commit: `3d44ddc` `feat(generator): dig algoritması — tam clue'dan başla, tekil kalırken çıkar (uniqueness garantili)`

## Phase C — Node preview modal ✅

- [x] `index.html` `handleRogueNode` → preview wrapper + `enterRogueNode` gövdesi ayrıldı
- [x] Plan 16 boss-intro pre-check kaldırıldı (preview boss'u da kapsıyor)
- Commit: `2ca1795` `feat(rogue): node preview modal — tıklayınca ne verdiğini gösterir, Başla deyince başlar`

## Phase D — Orphan node fix (K3) ✅

- [x] `src/rogue/map.js` orphan + dead-end fix pass'i eklendi
- Commit: `dbcebdc` `fix(rogue): orphan + dead-end node fix — her node erişilebilir + ilerler`

## Phase E — Bug fixes ✅

- [x] E.1 Daily key bug (ayrı `dailyCur` key) — `0b66158`
- [x] E.2 Multi-stage boss solve count — `003f5d4`
- [x] E.3 bestFloor + timesEntered — `b37d3a0`
- [x] E.4 META_DEFAULTS dugumun-ardi — `d9408ad`
- [x] E.5 Yardım metni hizalama — `6dc3c4a`
- [x] E.6 Neow "Aç Tilki" can clamp — `c58ef90`
- [x] E.7 SW v5 + reset flag — `38eaa39`

Not: Paralel oturum (repo review + nokta-çizgi ihlali) merge edilmişti; her E task'i önce grep/Read ile
doğrulandı. Doğrulama sonucu hepsi HENÜZ DÜZELTİLMEMİŞTİ (dailyCur key yoktu; timesEntered/bestFloor hiç
yazılmıyordu; dugumun-ardi META_DEFAULTS'ta yoktu; neow trade clamp yoktu; SW v4'tü) → 7'si de uygulandı.

## Phase F — Tests + Final ✅

- [x] F.1 Uniqueness acceptance test (`tests/core.test.js`, 10×6×6) — `bf0fb8f`
  - node ile eşdeğer doğrulama: `bad: 0/10`
- [x] F.2 Roadmap satırı + merge + push
- [x] Final acceptance (15×6×6): `FINAL non-unique: 0/15`
- [x] `node --check`: tüm src/*.js + index.html inline module + tests/core.test.js geçti

---

## Notlar

- Phase A+B+C+D önceki dispatch'lerde tamamlandı (son commit `dbcebdc`).
- Bu dispatch: Phase E (7 bug fix, atomik commit'ler) + Phase F (test + final merge).
- Generator: dig algoritması yalnızca `countSolutions===1` ise clue çıkarır → uniqueness garantili.
- Branch `plan-17-uniqueness-preview-bugs` main'e `--no-ff` merge edildi.
