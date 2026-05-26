# Plan 05 Progress — Modular refactor (soft)

## Tasklar
- [x] Task 1: Branch + log + dirs (0ebbc40)
- [x] Task 2: src/core/rng.js (f5498e5)
- [x] Task 3: src/core/generator.js (dbe4b7b)
- [x] Task 4: src/core/checker.js (702287b)
- [x] Task 5: index.html type=module + import + cleanup (1d215ab)
- [x] Task 6: tests/test-runner.html + tests/core.test.js (9a2d0a7)
- [x] Task 7: Final + merge + push

## Sonuç — Mimari özet
- `src/core/rng.js` — `hashSeed`, `mulberry32` (pure ES export)
- `src/core/generator.js` — `makePuzzle(R,C,keepRatio,rng)` (pure, single-loop guaranteed)
- `src/core/checker.js` — `lineCount`, `decided`, `validateLoop` (pure)
- `index.html` artık `<script type="module">`; pure logic delege edildi
  * `lineCount(r,c)` / `decided(r,c)` index.html'de state-bound wrapper
  * `checkWin()` artık tek satır: `if(validateLoop(P,hState,vState))win();`
- `tests/test-runner.html` + `tests/core.test.js` — 5 smoke assert

## index.html boyut değişimi
- Önce: 1015 satır
- Sonra: 988 satır
- Net azalış: ~27 satır (5 fonksiyon — hashSeed, mulberry32, makePuzzle, lineCount, decided, ve checkWin gövdesi — kaldırıldı; 3 import + 2 wrapper + 1 yorum eklendi)

## Manuel test talimatı
```
1. cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"  (veya plan-05 worktree)
2. python3 -m http.server 8000
3. Tarayıcı: http://localhost:8000/tests/test-runner.html
   → 5/5 yeşil bekleniyor
4. Tarayıcı: http://localhost:8000/
   → Oyun normal çalışmalı (puzzle gen + tıklama + win)
```

> Not: `file://` üzerinden ES modules çalışmaz — yerel sunucu zorunlu.

## Roadmap update
`05 — Modular refactor (soft) | ✓ tamamlandı | merge sonrası SHA` — ana repo'ya merge edildikten sonra docs/spec/roadmap dosyasında güncellenir.
