# Plan 01 Progress

## Baseline (commit f307ed8)
- Renkler: var ama tonlar tokens.jsx'ten farklı (--bg #0b0b0d vs hedef #0a0a0c, vb.)
- Font: Fraunces + Karla var, JetBrains Mono yok
- Mono uygulaması: yok (HUD chip'leri Karla)
- Geometri: --border kullanılıyor, --hairline yok
- Edge stroke-width: 6 (hedef 5.5)
- Dot radius: 0.07 (hedef 0.06)

## Görev tamamlanma
- [x] Task 1: Baseline + log
- [x] Task 2: CSS değişken katmanı güncellendi
- [x] Task 3: JetBrains Mono font eklendi
- [x] Task 4: --font-* ailesi tanımlandı
- [x] Task 5: Old → new değişken adları (border→hairline, dim→faint) globally
- [x] Theme-color meta fix (Task 2 follow-up): #0b0b0d → #0a0a0c
- [x] Task 6: HUD chip mono font uygulandı
- [x] Task 7: Geometri (edge stroke 5.5, dot r 0.06, board-card 22)
- [x] Task 8: Kicker pattern (mono) + italic ton (Fraunces italic)
- [x] Task 9: Card + level row + floor heading Sessiz İplik geometri
- [x] Task 10: Sheet handle + modal Sessiz İplik geometri
- [x] Task 11: Controls + bigbtn + modal + resume-pill tipografi
- [x] Task 12: Foot-note + opt chips + seed input mono
- [x] Task 13: Topbar title + iconbtn geometri
- [x] Task 14: Konfeti palette Sessiz İplik
- [x] Task 15: Clue done opacity 0.22, font değişkene bağlı, tabular-nums
- [x] Task 16: Topbar + page padding Sessiz İplik aralıkları
- [x] Task 17-19: Verification + roadmap update + merge + push

## Plan 01 — Final

Branch `plan-01-sessiz-iplik-tokens` üzerinde 16 task tamamlandı, 17 commit atıldı. Tüm `"Fraunces"` / `"Karla"` literal'leri (sadece `--font-*` tanımı dışında) `var(--font-serif/body/mono)` değişkenlerine bağlandı. Tüm renkler `tokens.jsx` paletiyle birebir uyumlu. Geometri (stroke, radius, hairline, padding) Sessiz İplik DESIGN-NOTES'a uyumlu.

### Kod doğrulamaları
- `grep -c '"Fraunces"' index.html` → 1 (sadece --font-serif tanımı)
- `grep -c '"Karla"' index.html` → 1 (sadece --font-body tanımı)
- `grep -c "var(--border)" index.html` → 0
- `grep -c "var(--dim)" index.html` → 0
- `grep -c "var(--hairline)" index.html` → 14
- `grep -c "var(--font-mono)" index.html` → 8

### Beklenen görsel doğrulama (kullanıcı tarafı)
Kullanıcı `index.html`'i tarayıcıda açıp şunları kontrol etmeli (Plan 17-18 talimatları):
- Ana menü kart glyph'leri taupe renkte mi
- HUD chip'lerinde JetBrains Mono fontu görünür mü
- Bottom-sheet üstünde handle var mı
- Kazanma modalında italik ton ink-dim mi
- Konfeti renkleri taupe ağırlıklı mı

### Sonraki adım
Plan 02 — PWA setup (`docs/spec/plan-02-pwa.md` daha sonra yazılacak).
