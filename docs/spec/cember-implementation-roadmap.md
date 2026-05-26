# Çember — Implementation Roadmap

Spec (`cember-rogue-design.md`) içeriği **9 ayrı plana** bölündü. Her plan:
- Tek bir alt-sisteme odaklı
- Kendi başına çalışan/test edilebilir yazılım üretir
- `/superpowers:execute-plan` ile sırayla yürütülür
- Her plan sonu bir Vercel deploy ile Merve test edebilir

Bu sayfa **sadece roadmap özeti**. Detaylı tasklar ilgili plan MD'lerinde.

---

## Plan 01 · Sessiz İplik tokens applied
**Dosya:** `docs/spec/plan-01-sessiz-iplik-tokens.md`
**Çıktı:** Foundation `index.html`, tasarım canvas'ındaki Sessiz İplik diline tam uyumlu.
**Bağımlılık:** Yok. İlk plan, hemen başlayabilir.
**Test:** Görsel; tarayıcıda aç + design canvas ile karşılaştır.

## Plan 02 · PWA setup (manifest + service worker)
**Dosya:** `docs/spec/plan-02-pwa.md`
**Çıktı:** "Ana Ekrana Ekle" ile tam ekran + offline + persistent storage flag.
**Bağımlılık:** Plan 01 (görsel netlik sonrası).
**Test:** iPhone'da Ana Ekrana Ekle → uçak modunda aç.

## Plan 03 · Persistence v2 (IDB mirror + export/import + migration)
**Dosya:** `docs/spec/plan-03-persistence-v2.md`
**Çıktı:** Veri kaybı riskinin neredeyse sıfırlanması. Schema versioning, IDB ayna, JSON yedek.
**Bağımlılık:** Plan 02 (PWA persistent flag avantajı).
**Test:** DevTools'tan localStorage temizle, IDB'den restore beklendiğini doğrula.

## Plan 04 · Modular refactor (src/ yapısı)
**Dosya:** `docs/spec/plan-04-modular-refactor.md`
**Çıktı:** Pure logic (generator, checker, RNG) ve UI ayrılmış, `<script type="module">` ile yüklenen `src/` klasörü.
**Bağımlılık:** Plan 03 (state ayrımı yapılmadan refactor riskli).
**Test:** Test harness (`tests/test-runner.html`) ile pure functions yeşil + foundation davranışı aynı.

## Plan 05 · Rogue infrastructure (Yuva + engine + achievement skeleton)
**Dosya:** `docs/spec/plan-05-rogue-infrastructure.md`
**Çıktı:** Yuva ekranı, rogue run engine, branching map generator, achievement registry/engine — **stub realm ile** uçtan uca oynanabilir.
**Bağımlılık:** Plan 04 (modular yapı şart).
**Test:** Stub realm ile koşu başlat, düğüm gez, autosave doğrula, fake achievement aç.

## Plan 06 · Realm 1 — Söğüt Eşiği
**Dosya:** `docs/spec/plan-06-realm-sogut-esigi.md`
**Çıktı:** D1 tam çalışır: 6 relic, 6 event, 1 boss, 5 achievement, pati izi varyant 1.
**Bağımlılık:** Plan 05.
**Test:** D1'i baştan sona oyna; her relic/event tetiklenebilir; boss yenilir; 5 achievement açılabilir.

## Plan 07 · Realm 2 — Karanlık İğne (+ bronze key mechanic)
**Dosya:** `docs/spec/plan-07-realm-karanlik-igne.md`
**Çıktı:** D2 tam çalışır + locked chest mekaniği. Unlock kuralı (D1'de 1 boss) aktif.
**Bağımlılık:** Plan 06.
**Test:** D1 boss yendikten sonra D2 açılır; bronze key + locked chest çalışır.

## Plan 08 · Realm 3 — Yıldız Geçidi (+ multi-stage boss)
**Dosya:** `docs/spec/plan-08-realm-yildiz-gecidi.md`
**Çıktı:** D3 tam çalışır + 3-stage boss + zamanlı node'lar. Unlock kuralı (D2 boss + ≥3 relic) aktif.
**Bağımlılık:** Plan 07.
**Test:** D2 boss + relic koşulu sonrası D3 açılır; multi-stage boss + zamanlı node testi.

## Plan 09 · Polish + meta achievements + deploy
**Dosya:** `docs/spec/plan-09-polish-deploy.md`
**Çıktı:** Cross-realm meta achievements (10), saklı easter egg'ler (5), permanent starter slot UI, son polish, Vercel production deploy, iPhone end-to-end test.
**Bağımlılık:** Plan 08.
**Test:** 7-gün streak achievement, Jedi'yi Gör easter egg, Aralık ayı + D3 = İlk Kar achievement, full game playthrough.

---

## Yürütme

Her plan tamamlanınca:
1. Tüm dosyalar commit edilir
2. `main` branch'e push
3. (Plan 02 sonrası her plan'da) Vercel auto-deploy tetikleyicisinden Merve canlı sürümü test edebilir
4. Bir sonraki plan'ın detayını yaz (`plan-NN.md`), execute et

> İlerleme bu MD'de TodoWrite görünümüyle takip edilir. Bir token sonrası Claude bu MD'yi okuyup nerede kalındığını anlar.

## İlerleme tablosu

| Plan | Durum | Commit |
|------|-------|--------|
| 01 — Sessiz İplik tokens | ✓ tamamlandı | fddf52f |
| 02 — PWA | bekliyor | – |
| 03 — Persistence v2 | bekliyor | – |
| 04 — Modular refactor | bekliyor | – |
| 05 — Rogue infrastructure | bekliyor | – |
| 06 — Söğüt Eşiği | bekliyor | – |
| 07 — Karanlık İğne | bekliyor | – |
| 08 — Yıldız Geçidi | bekliyor | – |
| 09 — Polish + deploy | bekliyor | – |
