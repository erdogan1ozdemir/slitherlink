# Plan 03 Progress

- [x] Task 1: Branch + log
- [x] Task 2: icons/icon.svg
- [x] Task 3: manifest.json
- [x] Task 4: service-worker.js
- [x] Task 5: index.html head'e manifest + theme color
- [x] Task 6: SW register + persistent storage JS
- [x] Task 7: Final + merge + push

## Plan 03 — Final

7 task, 7 commit (+ final). PWA hazır.

### Manuel test (kullanıcı tarafı)
- [ ] iPhone Safari'de oyunu aç → paylaş → "Ana Ekrana Ekle"
- [ ] Ana ekrandan ikonu aç — tam ekran açılmalı, adres çubuğu olmamalı
- [ ] Uçak modu aç, oyunu tekrar başlat — yüklenir mi?
- [ ] DevTools (Chrome desktop): Application → Manifest hata yok mu? Service Workers → registered mi?
- [ ] navigator.storage.persisted() console'da true mu? (yalnızca PWA yüklenirse veya UA grant ederse)

### Bilinen sınır
- iOS Safari `manifest.json`'u kısmen okuyor; gerçek PWA hissi için "Apple-specific" meta tagleri zaten head'de mevcut (apple-mobile-web-app-capable vb.).
- Service worker iOS 16.4+'ta tam destekli; eski iOS'ta cache çalışmaz ama SW register hata vermez.

### Sonraki adım
Plan 04 — Persistence v2 (IDB mirror + schema versioning + migration).
