# Plan 17 — Progress Log

Branch: `plan-17-uniqueness-preview-bugs`

Hedef: Çoklu-çözüm bug'ının kök çözümü (propagating solver + dig generation), node preview modal, orphan node fix, code review bug'ları.

---

## Phase A — Solver rewrite (propagation)

- [ ] `src/core/solver.js` constraint propagation + trail-based backtracking ile tamamen değiştirildi
- [ ] `node --check src/core/solver.js` geçti
- Commit: `feat(solver): constraint propagation + trail backtracking — uniqueness 50-100x hızlandı`

## Phase B — Generator dig rewrite

- [ ] `src/core/generator.js` dig algoritması ile tamamen değiştirildi (generateLoop iç fonksiyonu + dig)
- [ ] `node --check src/core/generator.js` geçti
- [ ] Acceptance test: `non-unique: 0/20` (7×7, 20 seed)
- [ ] Solver doğruluk testi (full-clue=1, empty 2x2=çoklu)
- Commit: `feat(generator): dig algoritması — tam clue'dan başla, tekil kalırken çıkar (uniqueness garantili)`

## Phase C — Node preview modal

- [ ] `index.html` `handleRogueNode` → preview + `enterRogueNode` ayrımı
- [ ] Plan 16 boss-intro pre-check kaldırıldı
- Commit: `feat(rogue): node preview modal — tıklayınca ne verdiğini gösterir, Başla deyince başlar`

## Phase D — Orphan node fix (K3)

- [ ] `src/rogue/map.js` orphan + dead-end fix pass'i eklendi
- Commit: `fix(rogue): orphan + dead-end node fix — her node bir önceki kattan erişilebilir, her node ilerler`

## Phase E — Bug fixes

- [ ] E.1 Daily key bug (ayrı `dailyCur` key)
- [ ] E.2 Multi-stage boss solve count
- [ ] E.3 bestFloor + timesEntered
- [ ] E.4 META_DEFAULTS dugumun-ardi
- [ ] E.5 Yardım metni hizalama
- [ ] E.6 Neow "Aç Tilki" can clamp
- [ ] E.7 SW v5 + reset flag

## Phase F — Tests + Final

- [ ] F.1 Uniqueness acceptance test (`tests/core.test.js`)
- [ ] F.2 Roadmap satırı + merge + push

---

## Notlar

- Bu dispatch sadece **Phase A + B** yürütüyor. Phase C-F başka dispatch'lerde gelecek.
- Branch main'e MERGE EDİLMEYECEK — sadece Phase A+B commit'leri bırakılacak.
