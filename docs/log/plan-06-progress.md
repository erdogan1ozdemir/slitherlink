# Plan 06 Progress — Rogue Infrastructure (Yuva + Karakter + İpliklik + Diken + engine)

## Tasklar
- [x] Task 1: Branch + src/rogue/ dir + progress log (31df669)
- [x] Task 2: src/rogue/map.js — branching map generator (f5df38f)
- [x] Task 3: src/rogue/engine.js — run state machine (2009812)
- [x] Task 4: src/rogue/stub-realm.js — minimum realm placeholder (caadf12)
- [x] Task 5: index.html — Rogue kart unlock + 5 yeni screen + data-back routing (7240d57)
- [x] Task 6: index.html — Yuva + Karakter + İpliklik + Diken render + 3 import + KEYS.rogueRun (3a78695)
- [x] Task 7: index.html — startRogueRun + renderRogueMap + handleRogueNode + win() rogue branch + winNext rogue routing + s-game back rogue routing + gameTitle rogue (1c49493)
- [x] Task 8: Smoke test + final + merge + push

## Mimari özet
**Yeni modüller (src/rogue/):**
- `map.js` (67 satır): `generateMap(seed, {floors,maxWidth})` — F floor × ≤3 col branching DAG (boss son katta, start ortada). `nextAccessibleNodes(map, nodeId)` — kenarlardan reachable next-floor düğümleri.
- `engine.js` (75 satır): `startRun({realmId, seed, config})` → fresh run (3 lives, map, visited=[start]). `moveTo`, `loseLife`, `winRun`, `currentNode` pure state mutator/getter.
- `stub-realm.js` (13 satır): 3-floor placeholder ("Deneme Diyarı", 5×5 puzzle / 6×6 boss).

**index.html değişiklikleri:**
- Rogue kart artık unlocked → tıkla = Yuva
- 5 yeni screen: `s-yuva`, `s-karakter`, `s-ipliklik`, `s-diken`, `s-rogue-map`
- `data-back` rogue alt ekranlarından Yuva'ya; s-game'de rogue mode'da Map'e
- 3 import: engine, map, stub-realm
- `KEYS.rogueRun = "cember:rogue:run"`
- `renderYuva`: mini Jedi silueti + 3 realm card + stats chip + 3 yuva-nav button
- `renderKarakter`: büyük Jedi avatarı + 6 stat grid (run/solve/time/hint + thread/bead)
- `renderIpliklik`, `renderDiken`: "Yakında" placeholder
- `setupYuvaListeners`: realm card → startRogueRun; nav btn → ilgili alt ekran
- `startRogueRun`: aktif run var → devam; yok → yeni run, totalStats.runs++
- `renderRogueMap`: lives/floor/relics topbar + SVG branching map + Yeni Koşu butonu (ended ise)
- `handleRogueNode`: moveTo → puzzle/elite/boss = startGame(mode:'rogue'); diğer tipler stub auto-pass
- `win()`: rogue branch → boss = winRun + bead+1; diğer = thread+3 (elite +5); totalStats.solves++
- `winNext`: rogue mode'da map'e döner; gameTitle rogue'da STUB_REALM.name

## Smoke test (node ES modules)
- Deterministic map: aynı seed → aynı sonuç ✓
- 3-floor map: 1 start, 1 boss ✓
- Run lifecycle: start → moveTo (visited grows) → 3 hits = ended (reason: no-lives) ✓
- index.html inline `<script type="module">` syntax: valid ✓

## Manuel test (browser)
```
1. cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"  (veya plan-06 worktree)
2. python3 -m http.server 8000
3. http://localhost:8000/ aç
4. Ana menü → "Rogue Modu" tıkla → Yuva ekranı açılır
5. Yuva: Jedi silueti + 3 realm card (sadece "Deneme Diyarı" açık) + "0 koşu · N çözüm" + Karakter/İpliklik/Diken butonları
6. Karakter tıkla → Jedi avatarı + 6 stat grid
7. İpliklik / Diken → "Yakında" placeholder
8. Deneme Diyarı kartı → koşu başlar, harita görünür (3 floor)
9. Erişilebilir bir düğüme tıkla → puzzle açılır (5×5)
10. Puzzle'ı çöz → Win modal → "Devam" → Map'e dön
11. Boss düğümüne ulaş ve çöz → run.ended=true, "İplik tamamlandı" + Yeni Koşu butonu
12. Yeni Koşu → koşu silinir, Yuva'ya döner
```

> Not: `file://` üzerinden ES modules çalışmaz — yerel sunucu zorunlu.

## Plan 06 v1 scope sınırı (Plan 07+'da)
- Gerçek diyar içerikleri (Söğüt Eşiği vb.)
- Yuva Fısıltısı (Neow start choice)
- Pusula Yıldızı progression
- Achievement triggers
- Constraint tiles
- İpliklik talent gerçek fonksiyonu
- Diken Sözleşmesi modifier'ları gerçek

## Roadmap update
`06 — Rogue infrastructure | ✓ tamamlandı | merge sonrası SHA` — ana repo'ya merge edildikten sonra docs/spec/roadmap dosyasında güncellenir.
