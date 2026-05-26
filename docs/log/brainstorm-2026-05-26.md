# Brainstorm — 2026-05-26 · Rogue mode + Persistence

Bu log, spec'e giden brainstorm tartışmasının kararlarını ve gerekçelerini tutar. Spec değişirse buraya bakılarak "neden böyle yapmıştık" sorusu cevaplanır.

## Karar 1 — Vercel'de kal
- **Karar:** Yayın Vercel'de. PWA katmanıyla iPhone'da tam ekran + offline garanti.
- **Alternatifler değerlendirildi:** Cloudflare Pages, Netlify, GitHub Pages — bu proje için ölçü farkı yok.
- **Neden:** Statik tek dosya, edge CDN, ücretsiz tier yeterli. Tam ekran sorunu hostingla ilgili değil iOS Safari'nin kuralı (çözüm: "Ana Ekrana Ekle" + PWA).

## Karar 2 — Jedi: Fısıltı yaklaşımı
- **Karar:** Jedi karakter değil, varlık. SVG line art + pati izi motifi + Yuva'da silüet + saklı easter egg.
- **Alternatifler:**
  - (B) Avatar yaklaşımı (illüstre Jedi, karakter sayfası, level/exp) → reddedildi: "Sessiz İplik" estetiğini bozar
  - (C) Saf soyut (sadece mevcut easter egg'ler) → reddedildi: kişisel fırsatı kaçırır
- **Eklenti karar:** Tamamlanmış çemberin üstünden pati izi geçer (winning animation). Her diyarın kendi pati izi varyasyonu.
- **Neden:** Mevcut "iplik" metaforuna doğal olarak oturuyor; estetiği bozmadan sıcaklık katıyor.

## Karar 3 — 3 diyar, hub erişim, derin
- **Karar:** 3 diyar (1 açık + 2 kilitli). Yuva ekranından seçim. Her diyarın kendi atmosferi/relic havuzu/event havuzu/bossu.
- **Alternatifler:**
  - 5 diyar yüzeysel → reddedildi: derinlik > çeşit
  - 1 diyar MVP → reddedildi: "diyar sistemi" hissini vermez
- **Neden:** Roguelike'da derinlik > çeşit; 1 açık + 2 kilitli unlock motivasyonu verir.

## Karar 4 — Diyar isimleri (masalsı dilde)
- **D1 Söğüt Eşiği** — baştan açık, pastoral, ısınma
- **D2 Karanlık İğne** — mevcut design'daki diyar, kütüphane/mürekkep
- **D3 Yıldız Geçidi** — epik final, kozmik/rüyalı
- **Neden:** Hem mevcut "Karanlık İğne"yi koruyor hem yelpaze çiziyor (sıcak → mistik → kozmik).
- **Açılış kuralı:** D2 ← D1'de 1 boss; D3 ← D2'de 1 boss + ≥3 farklı relic 2 koşuda görüldü.

## Karar 5 — Persistence: 3 katman + versioning + PWA
- **Katman 1:** localStorage (birincil, hızlı, mevcut foundation üzeri)
- **Katman 2:** IndexedDB (sessiz ayna, 30 sn / visibility / pagehide)
- **Katman 3:** Manuel JSON export/import (acil sigorta)
- **+** Şema versioning + migration runtime, asla veri atılmaz.
- **+** PWA setup (`navigator.storage.persist()` çağrısı ile persistent flag)
- **Neden:** Tek kullanıcı için bile iOS Safari'nin 7-gün-temizlik kuralı emek kaybettirebilir. Tek katman yetersiz.
- **Tek başarısızlık senaryosu:** Safari tüm site verisini sil + IDB de sil + yedek alınmamış → o zaman kaybolur. Bunun ihtimali çok düşük.

## Karar 6 — Yuva ekranı = Rogue hub
- Yuva = Rogue moduna girince ilk açılan ekran (Yolculuk listesi gibi ama rogue için)
- Bileşenler: mini Jedi silüeti + 3 realm card + stats chip-row + Jedi'nin Günlüğü link + permanent starter slot + yedek al/yükle link
- Karakter ekranı ayrı değil — Yuva onu kapsıyor. Daha sade, daha sıcak.

## Karar 7 — Achievement: 3 katman, ~30 total
- 18 diyar-bazlı (her diyar için 5-6)
- 10 meta (cross-realm + stat-based)
- 5 saklı (easter egg, secret triggers)
- Engine event-emit + registry lookup
- Bazı achievement'lar permanent starter slot doldurur (D3 unlock motivasyonu)

## Karar 8 — Modüler yapıya geç
- Mevcut foundation tek HTML
- v1 implementation'da `src/` klasörü altında `core / persistence / rogue / ui / illustrations / pwa` modülleri
- `<script type="module">` ile build step gerekmez
- Yerelde basit static server (`python3 -m http.server`) ile çalışır
- **Neden:** Token bütçesi (büyük tek dosya context'i yer); test edilebilirlik; future-proofing

## Açık kalan kararlar (implementation planında)
- Test stratejisi (saf logic için minik harness)
- Icon üretimi (placeholder → gerçek SVG)
- Sound (v2+)
- Unique solution kontrolü (v2+)

---

## İletilen referanslar

- GitHub: `https://github.com/erdogan1ozdemir/slitherlink`
- Foundation: `index.html`
- Design canvas: `Sliterhlink Claude design/`
- Spec: `docs/spec/cember-rogue-design.md`

---

*Brainstorm tarihi: 2026-05-26. Katılımcılar: Erdoğan + Claude (opus 4.7).*
