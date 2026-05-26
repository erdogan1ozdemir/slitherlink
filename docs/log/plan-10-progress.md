# Plan 10 Progress
- [x] Task 1: Branch + log
- [x] Task 2: 10 meta achievement (achievements.js)
- [x] Task 3: Solve_count + days_streak trigger logic
- [x] Task 4: Permanent starter UI (Karakter ekranı)
- [x] Task 5: A11y focus rings + ARIA
- [x] Task 6: vercel.json + README deploy notu
- [x] Task 7: Final + merge + push

## Self-Review
- Task 2: 8 meta + 2 secret achievement (cross-realm). Registry 16 → 26.
  Trigger string'leri achievements.js içinde sabit; emit logic index.html
  içinde yayıldı (engine pattern korundu).
- Task 3: 8 emit point (startRogueRun, win solve_count, win boss
  cross-realm, renderYuva jedi tap, init daysStreak + nightCat).
  meta.daysStreak yeni alan (dates+last); 30 günlük rolling buffer.
- Task 4: renderKarakter starter slot doldu/boş varyantları + picker
  modal (koleksiyondan). startRogueRun yeni koşulara starter relic'i
  enjekte eder. ev-sahibi achievement set sırasında emit edilir.
- Task 5: focus-visible CSS (3 satır), 8 data-back + 5 icon/control
  butonuna aria-label (toplam +18 aria-label, +2 aria-checked switch).
  Switch elementlerine role=switch + tabindex=0 + Enter/Space handler.
- Task 6: vercel.json static config (cleanUrls + service worker
  no-cache + 1h HTML/JSON/SVG + 24h JS). README Yayınla bölümü vercel
  CLI komutları + iPhone manuel test akışı ile genişletildi.

## Registry counts (final)
- realms: 4 (stub + D1 + D2 + D3)
- relics: 18 (6 D1 + 6 D2 + 6 D3)
- events: 18 (6+6+6)
- achievements: **26** (5 D1 + 6 D2 + 5 D3 + 8 meta + 2 secret)

## Plan 10 — Final manual test

### Cross-realm meta ach
- [ ] İlk koşu başlat → "İlk İz" toast
- [ ] 10 puzzle çöz → "On Çember" toast
- [ ] D1+D2+D3 hepsini tamamla → "Üç Diyar" + "Üç Patron" toast
- [ ] Her diyardan ≥3 relic gör → "Koleksiyoncu" toast
- [ ] 7 farklı günde aç → "Sessiz Dost" toast (zaman alır)

### Saklı ach
- [ ] Yuva'da Jedi'ye dokun (rastgele aktif olur) → "Jedi'yi Gör"
- [ ] Gece 3-4 arası aç → "Saatin Kedisi"

### Permanent starter
- [ ] Karakter ekranı → "Yanında başla" → koleksiyondan biri seç
- [ ] Yeni koşu başlat → o relic listede

### A11y
- [ ] Tab ile gezindiğinde focus ring görünür (accent renk)
- [ ] Switch Enter/Space ile toggle olur
- [ ] VoiceOver "Geri", "Ayarlar", switch on/off doğru okur

### Vercel
- [ ] `vercel --prod` → URL döner
- [ ] iPhone Safari'de aç → Ana Ekrana Ekle → tam ekran + offline test

### Sonraki adım
Plan 11+ (deferred items): Hediye Boncukları + İpliklik talents +
Boncuk Dizimi + Constraint tiles + Yuva Fısıltısı + Pati izi anim
