# Plan 12 Progress
- [x] Task 1: Branch + log

## Phase A — Diken
- [x] Task 2: thorns.js (10 modifier + apply + iz score)
- [x] Task 3: Diken Sözleşmesi UI + profile + run start apply

## Phase B — 6 tile
- [x] Task 4: tiles.js genişlet (ikiz, donmuş, ikiKonmaz, lanetli, yanki, kayan)
- [x] Task 5: Puzzle render integration (her tile için görsel/davranış)

## Phase C — Hediye Boncukları
- [x] Task 6: keepsakes.js (8 keepsake + auto-unlock on ach)
- [x] Task 7: Karakter UI keepsake bölümü

## Phase D — Mum tick
- [x] Task 8: Puzzle render her saniye timeRemaining tick

## Phase E — Daily
- [x] Task 9: daily.js (seed + local leaderboard)
- [x] Task 10: Ana menü "Günün Çemberi" kartı + flow

## Phase F — 4. diyar
- [x] Task 11: realms.js dugumun-ardi entry + unlock kuralı
- [x] Task 12: D4 achievement (3 ach)

## Final
- [x] Task 13: tests/core.test.js genişlet
- [x] Task 14: Final + merge + push

---

## Özet

Tüm 14 görev tamamlandı. Plan 12 ile Plan 11 sonrası kalan tüm deferred items kapatıldı:

- **Phase A (Diken Sözleşmesi):** 10 modifier (Daralma, Kör Pusula, Kırılgan İplik, Yankılı Boss, Çıplak Başlangıç, Sıkı Kontrol, Sönük Yıldız, Tek Kapı, Dolu Tabla, Çift Düğüm). UI'de toggle/rank seçimi, run start'ta apply, koşu sonu reward multiplier (≤2 iz → ×1.0, ≤5 → ×1.5, ≤10 → ×2.0, 11+ → ×2.5).
- **Phase B (6 yeni constraint tile):** İkiz, Donmuş, 2 Konmaz, Lanetli, Yankı, Kayan. Solvability-preserving filtreler. Puzzle render + CSS class'ları + Kayan tick toggle()'da.
- **Phase C (Hediye Boncukları):** 8 keepsake achievement-locked, Karakter ekranında "Hediye Boncukları" alt-bölümü, auto-unlock achievementUnlock() içinde.
- **Phase D (Mum Modu puzzle-içi tick):** startTimer interval'inde her saniye `run.timeRemaining -= 1`, throttle save (5 sn'de bir), timeout → run ended.
- **Phase E (Daily Challenge):** `daily.js` (todaySeed UTC tabanlı, hasPlayedToday, recordResult, getLeaderboard son 7 gün). Ana menüde "Günün Çemberi" kartı + showDailyLeaderboard modal + win callback'inde daily branch.
- **Phase F (4. diyar "Düğümün Ardı"):** 7 floor, tüm 18 relic + 18 event pool, "Düğüm Ustası" boss. 3 base diyar cleared olunca unlock. 3 yeni achievement (Düğümün Sonu, Düğüm Ustası, İpliğin Sonu).

## Smoke test (final)

```
thorns: 10
keepsakes: 8
tiles: 7
realms: 5  (stub-diyar + 4 active)
achievements: 29  (26 base + 3 D4)
iz: 3
reward7: 2.0
seed: daily-2026-05-26
```

## Yeni dosyalar
- `src/rogue/thorns.js` — 10 modifier + apply + iz score + reward mult
- `src/rogue/keepsakes.js` — 8 keepsake + auto-unlock
- `src/rogue/daily.js` — todaySeed + leaderboard (local 7-day)

## Değişen dosyalar
- `src/rogue/tiles.js` — 6 yeni tile + dugumun-ardi pool
- `src/rogue/realms.js` — dugumun-ardi entry (7 floor + tüm pool)
- `src/rogue/achievements.js` — 3 D4 achievement (29 toplam)
- `index.html` — Diken UI, Hediye UI, Mum tick, Daily kart, 4. realm unlock + 4-realm achievement, tile render
- `tests/core.test.js` — thorns/keepsakes/daily/realms/D4 smoke asserts
