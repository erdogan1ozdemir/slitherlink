# Plan 13 Progress

## Phase A — Bug fixes
- [x] Task 1: Branch + log
- [x] Task 2: SW v3 + one-time reset (Phase A.2)
- [x] Task 3: Rogue map click bug fix (Phase A.1)
- [x] Task 4: Preset stuck fix + active pill (Phase A.3)

## Phase B — UX
- [x] Task 5: "Yeni" buton topbar + confirm (Phase B.1)
- [x] Task 6: Check (Kontrol) butonu (Phase B.2)
- [x] Task 7: Corner auto-X mekaniği (Phase B.3)
- [x] Task 8: Map symbol legend toggle (Phase B.4)
- [x] Task 9: Rogue text size + Karakter label boost (Phase B.5)
- [x] Task 10: Charm slot tap → library (Phase B.6)

## Phase C — Generator
- [x] Task 11: density min 0→35 + uyarı not (Phase C.1)

## Final
- [x] Task 12: Final + merge + push

---

## Özet

12 görev tamamlandı. Vercel canlı sürümünden gelen tüm bug + UX feedback'i kapatıldı.

### Phase A — Critical bug fixes
- **A.1 Rogue map click bug:** Her SVG node'a transparent r=26 hit-area circle (pointer-events="all") + visible elementler pointer-events="none". Listener'lar single delegated handler'a taşındı (`rogueMapContent.onclick`). iOS Safari'de güvenilmez touch propagation çözüldü.
- **A.2 Cache bust + reset:** service-worker.js VERSION v2→v3. index.html script head'inde RESET_FLAG="cember:reset:v3" check — ilk yüklemede tüm cember:* localStorage + cember-db IDB silinir, flag set edilir, sonraki yüklemeler etkilenmez.
- **A.3 Preset stuck:** `setupActivePreset` global tracking. Preset click set eder, size/density manuel değişimi -1'e çeker, renderSetup `sel` class'ı doğru gösterir.

### Phase B — UX improvements
- **B.1 "Yeni" butonu yer değiştirdi:** Topbar'a `gameNewBtn ✦`. Controls bloğundan kaldırıldı. Click confirm("Yeni bulmaca başlatılsın mı?") ile sarmalandı.
- **B.2 Check (Kontrol) butonu:** `runCheck()` solH/solV vs hState/vState farkını wrongSet'e doldurur. render() içinde seg() artık k/r/c parametre alıyor + wrongSet kontrol ediyor → `.edge-line.wrong` ve `.ex.wrong` (stroke:var(--bad)). 3sn sonra wrongSet null + re-render. Title 2.7sn boyunca ✓/✗ + count gösterir.
- **B.3 Corner auto-X:** vertexDeg(r,c) komşu 4 edge'in kaç tanesinin line olduğunu sayar. applyCornerAutoX() deg===2 olan vertex'lerin kalan 0-state komşu edge'lerini X yapar. toggle() içinde mevcut applyAutoXAround çağrılarından sonra eklendi (sadece settings.autoX açıkken).
- **B.4 Symbol legend:** s-rogue-map topbar'da `rogueMapHelp ?` butonu. renderRogueMap başına display:none legend (7 sembol grid'i). Click toggle.
- **B.5 Daha büyük metin:** Rogue HUD font sizes 10→12, 11→13, 12→14. Karakter currency/stats/starter/charms/keepsake mono label'ları 8-9px → 10px. Stats number 16→18. İpliklik/Diken balance 28→30.
- **B.6 Charm slot tap:** data-charm-slot click artık her zaman openCharmsLibrary() — dolu slot'a yanlışlıkla tıklayıp boncuğu kaybetme önlendi. Library zaten "Çıkar" sunuyor.

### Phase C — Generator improvement (limited)
- **C.1 Density min 35:** `<input type="range" id="density" min="35" max="90">`. Section-label altına italic uyarı: "düşük yoğunlukta birden fazla çözüm olabilir".

## Smoke test (final)

```
talents OK 6
charms OK 6
node --check inline script OK (106238 chars)
```

## Değişen dosyalar
- `index.html` — A.1/A.2/A.3 + B.1/B.2/B.3/B.4/B.5/B.6 + C.1
- `service-worker.js` — VERSION v2→v3
- `docs/spec/cember-implementation-roadmap.md` — Plan 13 satırı
