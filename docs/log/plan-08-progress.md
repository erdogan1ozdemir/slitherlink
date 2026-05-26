# Plan 08 Progress
- [x] Task 1: Branch + log — `b0fe058`
- [x] Task 2: realms.js — karanlik-igne entry — `bdee9f1`
- [x] Task 3: relics.js — 6 D2 relic (bronze-key dahil) — `cf94256`
- [x] Task 4: events.js — 6 D2 event + 3 yeni effect tipi — `4e26f2e`
- [x] Task 5: achievements.js — 6 D2 achievement — `bc9fae4`
- [x] Task 6: map.js — locked-chest impl Task 7'de (UI-side); doc-only skip
- [x] Task 7: index.html — locked chest + bronze key + D3 unlock + 3 effect — `6b5540b`
- [x] Task 8: Final + merge + push

## Özet

Karanlık İğne (D2) tamamlandı:
- Realm: 5 kat (Eşik / Toz Koridoru / Kayıp Sayfalar / Mürekkep Havuzu / Sessiz Kütüphaneci).
- 6 relic: mürekkep-damlası, sayfa-köşesi, bronz-anahtar, tüy-kalem, eski-mum, mürekkep-lekesi.
- 6 event: kütüphanecinin-uykusu, kayıp-mektup, mürekkep-kuyusu, boş-koltuk, anahtar-çıngırağı, toz-patikası.
- 3 yeni event effect: `chance-relic-or-damage`, `damage-then-relic`, `chance-specific-relic`.
- 6 achievement: sessiz-geçit, kütüphaneci-uyurken, mürekkep-lekesi (locked chest), sayfanın-sonu (speed <15 dk), yedi-mum (all elites), tozsuz-geçit (no hint).
- Locked chest mekaniği: D2'de chest düğümlerinin %50'si `locked-chest` olur; Bronz Anahtar olmadan açılmaz.
- D3 unlock: D2 boss + ≥3 farklı relic tanınmış olması.

## Roadmap

08 — Karanlık İğne (D2) | ✓ tamamlandı | merge SHA `4272163`

## Sonraki adım

Plan 09 — Yıldız Geçidi (D3) + constraint tiles + İpliklik talents + Boncuk Dizimi.
