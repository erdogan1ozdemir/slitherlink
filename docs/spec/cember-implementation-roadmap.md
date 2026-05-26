# Çember — Implementation Roadmap (v2)

> v2 güncellemesi: research (Slitherlink + Roguelike) sonrası eklenen feature'lar `cember-feature-additions.md` içinde. Plan kapsamları o doğrultuda yeniden çizildi.

Spec (`cember-rogue-design.md` + `cember-feature-additions.md`) içeriği **10 ayrı plana** bölündü. Her plan:
- Tek bir alt-sisteme odaklı
- Kendi başına çalışan/test edilebilir yazılım üretir
- `/superpowers:execute-plan` (veya subagent-driven-development) ile sırayla yürütülür
- Her plan sonu bir Vercel deploy ile Merve test edebilir

Bu sayfa **sadece roadmap özeti**. Detaylı tasklar ilgili plan MD'lerinde.

---

## Plan 01 · Sessiz İplik tokens applied ✓
**Dosya:** `docs/spec/plan-01-sessiz-iplik-tokens.md`
**Durum:** Tamamlandı (merge commit `f7d25f3`).

## Plan 02 · Quick fixes + Slitherlink QoL + How-to-play + Backup code
**Dosya:** `docs/spec/plan-02-patches-and-features.md`
**Çıktı:** Türkçe karakter audit + "Merhaba Yarim" + ipucu yoğunluğu 0 + Auto-X + Undo/Redo + Auto-check mode + Nasıl Oynanır sheet + Yedek Kodu sistemi.
**Bağımlılık:** Plan 01.
**Test:** Tüm Türkçe stringler doğru; setup'tan 0 yoğunluk başlatılır; auto-X çalışır; undo/redo doğru; help sheet açılır; yedek kodu round-trip restore eder.

## Plan 03 · PWA setup (manifest + service worker)
**Dosya:** `docs/spec/plan-03-pwa.md`
**Çıktı:** "Ana Ekrana Ekle" ile tam ekran + offline + persistent storage flag.
**Bağımlılık:** Plan 02.
**Test:** iPhone'da Ana Ekrana Ekle → uçak modunda aç.

## Plan 04 · Persistence v2 (IDB mirror + export/import + migration + new schema)
**Dosya:** `docs/spec/plan-04-persistence-v2.md`
**Çıktı:** Şema v2 (yeni loomHall + thornsContract + charms + currencies + settings ek toggle'lar). IDB mirror. Migration runtime. Yedek kodu'nu IDB ile de senkronize eder.
**Bağımlılık:** Plan 03.
**Test:** localStorage temizlenince IDB'den restore. Eski v1 şemadan v2'ye migration sorunsuz.

## Plan 05 · Modular refactor (src/ yapısı)
**Dosya:** `docs/spec/plan-05-modular-refactor.md`
**Çıktı:** Pure logic (generator, checker, RNG, constraint solver) ve UI ayrılmış, `<script type="module">` ile yüklenen `src/` klasörü. Test harness.
**Bağımlılık:** Plan 04.
**Test:** Test harness yeşil + foundation davranışı aynı.

## Plan 06 · Rogue infrastructure (Yuva + Karakter + İpliklik shell + Pusula Yıldızı + Engine + Achievement)
**Dosya:** `docs/spec/plan-06-rogue-infrastructure.md`
**Çıktı:** Yuva ekranı, Karakter ekranı (Jedi avatarı + istatistik), İpliklik shell (talent grid, boş), Diken Sözleşmesi shell (modifier UI), Pusula Yıldızı progression tracker, Yuva Fısıltısı (Neow), rogue run engine, branching map, achievement registry/engine — **stub realm ile** uçtan uca oynanabilir.
**Bağımlılık:** Plan 05.
**Test:** Stub realm ile koşu başlat, düğüm gez, autosave doğrula, fake achievement aç, İpliklik'te talent açabil.

## Plan 07 · Realm 1 — Söğüt Eşiği (+ ilk constraint tiles)
**Dosya:** `docs/spec/plan-07-realm-sogut-esigi.md`
**Çıktı:** D1 tam çalışır: 6 relic, 6 event, 1 boss, 5 achievement, pati izi varyant 1, 2 constraint tile tipi (Sis + İkiz), İpliklik'in ilk 4 talent'i, 4 charm.
**Bağımlılık:** Plan 06.

## Plan 08 · Realm 2 — Karanlık İğne (+ bronze key + 2 constraint tile)
**Dosya:** `docs/spec/plan-08-realm-karanlik-igne.md`
**Çıktı:** D2 tam + locked chest mekaniği + 2 constraint tile (Donmuş + 2 Konmaz) + 6 relic + 6 event + boss + 5 achievement + İpliklik 2 yeni talent + 3 charm.
**Bağımlılık:** Plan 07.

## Plan 09 · Realm 3 — Yıldız Geçidi (+ multi-stage boss + Mum Modu)
**Dosya:** `docs/spec/plan-09-realm-yildiz-gecidi.md`
**Çıktı:** D3 tam + 3-stage boss + Mum Modu (time pressure) default + 3 constraint tile (Lanetli + Yankı + Kayan) + 6 relic + 6 event + 5 achievement + İpliklik 2 yeni talent + 3 charm.
**Bağımlılık:** Plan 08.

## Plan 10 · Polish + meta achievements + Hediye Boncukları + deploy + a11y
**Dosya:** `docs/spec/plan-10-polish-deploy.md`
**Çıktı:** Cross-realm meta achievements (10), saklı easter egg'ler (5), Hediye Boncukları (8 keepsake), permanent starter slot UI, Slitherlink ileri özellikler (segment highlight, tap modes, vertex indicator), renk körü modu, Vercel production deploy, iPhone end-to-end test.
**Bağımlılık:** Plan 09.

---

## Yürütme

Her plan tamamlanınca:
1. Tüm dosyalar commit edilir
2. `main` branch'e merge + push
3. (Plan 03 sonrası her plan'da) Vercel auto-deploy tetikleyicisinden Merve canlı sürümü test edebilir
4. Bir sonraki plan'ın detayını yaz (`plan-NN.md`), execute et

> İlerleme bu MD'de TodoWrite görünümüyle takip edilir. Bir token sonrası Claude bu MD'yi okuyup nerede kalındığını anlar.

## İlerleme tablosu

| Plan | Durum | Commit |
|------|-------|--------|
| 01 — Sessiz İplik tokens | ✓ tamamlandı | f7d25f3 |
| 02 — Quick fixes + Slitherlink QoL + How-to-play + Backup code | ✓ tamamlandı | 11911ac |
| 03 — PWA setup | ✓ tamamlandı | 04470bf |
| 04 — Persistence v2 | ✓ tamamlandı | 94c0207 |
| 05 — Modular refactor | ✓ tamamlandı | c7e75f8 |
| 06 — Rogue infrastructure (Yuva + Karakter + İpliklik + Diken + Pusula) | ✓ tamamlandı | c38873c |
| 07 — Söğüt Eşiği (D1) | ✓ tamamlandı | dd7d4ca |
| 08 — Karanlık İğne (D2) | ✓ tamamlandı | 4272163 |
| 09 — Yıldız Geçidi (D3) + Mum Modu + UX polish | ✓ tamamlandı | a7b7fdf |
| 10 — Polish + Hediye + a11y + deploy | bekliyor | – |
