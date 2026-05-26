# Çember — Rogue Mode & Persistence Spec (v1)

> **Bağlam.** Çember, Slitherlink mantığıyla çalışan tek-dosyalık (foundation: `index.html`) bir mobil-öncelikli web oyunudur. Tek kullanıcı (Merve, iPhone 11 ana hedef) için kişiselleştirildi. Görsel sistem **"Sessiz İplik"** (siyah/gri + tek taupe vurgu, hairline borders, Fraunces + Karla + JetBrains Mono). Norveç orman kedileri Jedi temaya minik bir "fısıltı" olarak işlenir — karakter değil, varlık.
>
> Bu spec **Rogue mode** + **persistence** + **PWA** katmanlarını kapsar. Mevcut `index.html` foundation'ı ve `Sliterhlink Claude design/` ekranlarını üst-katman olarak alır.

**Hedef:** Spec onaylandıktan sonra `docs/spec/cember-implementation-plan.md` ile detaylı implementation planı yazılacak, ardından adım adım koda dökülecek. Tüm süreç GitHub repo'su `erdogan1ozdemir/slitherlink` üzerinde takip edilir.

---

## 1. Sürüm hedefleri (v1 scope)

**Kapsam içinde:**
- 3 diyar (Söğüt Eşiği, Karanlık İğne, Yıldız Geçidi)
- Rogue koşu motoru (5 floor, branching map, 6 node tipi, 3 lives default)
- ~30 achievement (18 diyar-bazlı + 10 meta + 5 saklı)
- Yuva ekranı (rogue hub) + Jedi'nin Günlüğü alt-sayfası
- Permanent starter slot (1 slot v1'de)
- 3-katmanlı persistence (localStorage + IndexedDB + manuel export/import)
- Schema versioning + migration runtime
- PWA setup (manifest + service worker)
- Pati izi animasyonu (per-realm varyasyon)
- Mevcut Sessiz İplik design tokenlerinin foundation'a giydirilmesi

**Kapsam dışı (v2+):**
- 4. saklı diyar "Düğümün Ardı" (3 diyarın hepsi tamamlanırsa açılır)
- Unique solution kontrolü (mantık solver)
- Yolculuğun dallanan haritaya çevrilmesi
- Ses / titreşim ötesinde animasyonlu efektler
- Permanent starter slot 2-3
- Çoklu dil
- Ascension / NG+ benzeri zorluk katmanları
- Cloud sync

---

## 2. "Sessiz İplik" prensipleri (tasarım dili)

Bu bölüm `Sliterhlink Claude design/DESIGN-NOTES.md` özetidir; tüm Rogue ekranları bu prensiplere uyar.

**Renkler** (CSS variables):
```
--bg #0a0a0c   --bg-warm #0d0c0e
--panel #15151a   --panel-2 #1d1d23
--hairline rgba(237,234,227,.08)   --hairline-2 rgba(237,234,227,.14)
--ink #EDEAE3   --ink-dim rgba(237,234,227,.62)
--muted #7a7a82   --faint #3a3a42
--accent #A89B8B (taupe — default, Karanlık İğne)
--accent-warm #B89F8A (Söğüt Eşiği için hafif sıcak nudge)
--accent-cool #99A3B0 (Yıldız Geçidi için gümüş-mavi tint)
--bad #C97A6F   --good #8FA39A
```

**Tipografi:**
- Display: Fraunces 500–600, `-0.02em` tracking
- Body: Karla 400–700
- Mono / HUD: JetBrains Mono 500–700, `tabular-nums`
- Italic ton: Fraunces italic

**Geometri:**
- Chip 12, kart 16-18, modal 24 radius
- 1px hairline (asla 2px)
- Sayfa kenarı 20-24px

**Erişilebilirlik:** Renk asla tek bilgi taşıyıcı değildir. Çizgi/çarpı/boş üç ayrı şekildir.

---

## 3. Jedi entegrasyonu

Jedi (Merve'nin Norveç orman kedisi) literal karakter değil — sessiz bir varlık. Şu motiflerle yaşar:

1. **Açılışta kedi kulağı silüeti** (var, korunur)
2. **Ayar imzası "merve · jedi · ç"** (var, korunur)
3. **Pati izi** — kapalı çember tamamlanınca ipliğin üstünden hafif silikleşen pati izi geçer. Win modalında da küçük versiyonu. Her diyar kendi pati izi varyasyonunu kullanır (toprak / mürekkep / parıltı)
4. **Yuva ekranındaki silüet** — kıvrılmış uyuyor veya oturmuş, küçük inline SVG. Sayfanın "duygusal merkezi"
5. **Rogue map'te ziyaret edilen düğüm işaretçisi** — pati izi olarak çizilir
6. **Saklı easter egg `Jedi'yi Gör`** — düşük olasılıkla Yuva'da Jedi silüeti yanıp söner, dokunulursa achievement

**Tüm Jedi varlığı inline SVG line art.** Ek repo/asset yok. Tahmini SVG sayısı: ~8 (kulak, pati izi base, pati izi 3 varyant, oturan jedi, uyuyan jedi, optional gözler).

---

## 4. Persistence (3-katmanlı koruma)

### 4.1 Risk
iPhone Safari 7+ gün açılmayan sitelerin localStorage'ını silebilir. Chrome iOS da WebKit kullandığı için aynı limitlere tabidir. Tek kullanıcı için bu emek kaybı kabul edilemez.

### 4.2 Katman 1 — localStorage (birincil)
- Hızlı, anlık
- Mevcut `store.get/set/del` sarmalayıcı kullanılır
- Her hamle / her ayar değişikliği sonrası yazar

### 4.3 Katman 2 — IndexedDB (sessiz ayna)
- Daha kalıcı (Safari'nin temizleme politikasına dirençli)
- PWA modunda neredeyse hiç silinmez
- `idbStore` adında ufak Promise-based sarmalayıcı yazılır (~50 satır)
- Her 30 sn'de, sahne geçişlerinde, `visibilitychange` ve `pagehide` event'lerinde yazar
- Açılışta sıra: önce localStorage → yoksa IDB → migrate

### 4.4 Katman 3 — Manuel export/import
- Ayarlar sheet'inin altına bir satır: **Yedek al** (JSON dosyası indir) · **Yedek yükle** (file input)
- Tüm `cember:*` anahtarları + IDB içeriği tek JSON
- Yüklemede çakışma uyarısı: "Mevcut ilerlemenin üstüne yazılacak. Devam?"

### 4.5 Schema sürümleme
- Her root anahtar bir `version` alanı taşır (örn. `cember:meta` → `version: 1`)
- Load sırasında version kontrolü → düşükse migration runtime çalışır
- Migration fonksiyonu: `migrate(oldData, fromVersion, toVersion)` → her major version bumpta yazılır
- Eski veri **asla atılmaz** (worst case "okuyamadım" warning + manuel yedek önerisi)

### 4.6 Autosave tetikleyiciler
| Olay | LS | IDB |
|------|----|----|
| Her kenar değişimi | ✓ | – |
| Her düğüm geçişi | ✓ | ✓ |
| Her achievement açılışı | ✓ | ✓ |
| Her 30 sn (game/run aktifken) | – | ✓ |
| `visibilitychange` (sekme arkada) | ✓ | ✓ |
| `pagehide` / `beforeunload` | ✓ | ✓ |
| Settings toggle | ✓ | ✓ |

### 4.7 Saklanan veri şeması

```js
// cember:meta (v1) — koşulardan bağımsız kalıcı her şey
{
  version: 1,
  hasSeenIntro: false,
  achievements: {
    [id]: { unlockedAt: epoch_ms, count?: number }
  },
  realms: {
    'sogut-esigi':   { unlocked: true,  timesEntered: 0, timesCleared: 0,
                       bestFloor: 0, bestTime: null, defeatedBosses: 0,
                       seenEvents: [], knownRelics: [] },
    'karanlik-igne': { unlocked: false, ... },
    'yildiz-gecidi': { unlocked: false, ... }
  },
  totalStats: { runs: 0, solves: 0, time: 0, hintsUsed: 0 },
  permanentStarters: [],   // array of relicId, max 1 slot in v1
  jediDiary: [             // unlock order, latest first
    { achievementId, unlockedAt, text }
  ]
}

// cember:settings — mevcut, üzerine
{ version: 1, hints, fade, errors, haptics }

// cember:rogue:run — aktif koşu (null değilse "devam et" pill görünür)
{
  version: 1,
  realmId: 'karanlik-igne',
  seed: 'merve-abc123',
  startedAt: epoch_ms,
  floor: 2,                  // 0-4
  nodeIndex: '2-1',          // floor-col
  lives: { current: 2, max: 3 },
  relics: ['mursil', 'kelebek'],
  mapGraph: { nodes: [...], edges: [...] },
  visited: ['0-1','1-0','2-1'],
  rngState: 12345,
  elapsedInRun: 360,
  midPuzzle: {               // null değilse koşu içi bulmaca yarıda
    puzzle: {...},
    hState: [[...]], vState: [[...]],
    hints: 1, elapsed: 45
  }
}

// cember:free:current ve cember:journey:current — mevcut foundation
// cember:journey:progress — mevcut foundation
```

### 4.8 Backwards compatibility
Mevcut foundation'da version alanı yok. İlk yüklemede:
- Eski `cember:settings` okunur → version 0 sayılır → version 1'e migrate (default field'lar eklenir)
- Eski `cember:journey:progress` aynı şekilde

---

## 5. Rogue mode — diyar sistemi

### 5.1 Genel iskelet
Her koşu = 1 diyar. Diyar Yuva'dan seçilir. Koşu yapısı:
- 5 floor, her floor'da 2-3 node, dallanan map (Slay the Spire benzeri)
- Node tipleri: `puzzle / elite / chest / rest / event / boss`
- Player floor 0'dan başlar, son floor sadece boss
- 3 can default (relic ile +1/+2)
- Permadeath (canlar bitince koşu sonu; bestFloor güncellenir)

### 5.2 Diyarlar

**D1 · Söğüt Eşiği** — *baştan açık*
- Atmosfer: pastoral, akşam ışığı, çayır, eski sandık
- Color accent: `--accent-warm`
- Pati izi: yumuşak toprak izi (solgun kahve)
- Floor names: Pervaz → Çayır → Söğüt Altı → Eski Sandık → **Akşam Işığı**
- Boss: **Yün Bekçisi** — sessiz, hata bağışlayıcı; tek istisna: tekrarlanan hata patrona güç verir
- Difficulty: 4×4 → 6×6, %75-85 ipucu yoğunluğu
- Relic pool (6):
  - `Söğüt Yaprağı` — ilk hata cezasız
  - `Kelebek Pulu` — koşuda +1 ipucu
  - `Yün Tohumu` — rest düğümünde +1 can
  - `Bahçıvanın Eldiveni` — çarpı işareti daha okunaklı (a11y bonus)
  - `Akşam Mumu` — bir önceki kat node tiplerini önceden gösterir
  - `Çiyli Yün` — event düğümünde 1 ekstra seçenek görünür
- Event pool (6):
  - `Yağmur Başladı`, `Kelebek Yolu`, `Eski Sandık`, `Bahçıvanın Notu`, `Akşam Çayı`, `Çayır Kedisi` (jedi ref)

**D2 · Karanlık İğne** — *D1'de ≥1 boss yenildiğinde açılır*
- Atmosfer: tozlu kütüphane, mürekkep, sayfa, fısıltılar
- Color accent: `--accent` (default taupe)
- Pati izi: mürekkep ıslak parlak siyah
- Floor names: Eşik → Toz Koridoru → Kayıp Sayfalar → Mürekkep Havuzu → **Sessiz Kütüphaneci**
- Boss: **Sessiz Kütüphaneci** — uyandırırsan zaman daralır; ipucu sayısı +1 sayar
- Difficulty: 5×5 → 8×8, %60-72 ipucu yoğunluğu, ilk elite düğüm bu diyarda
- Relic pool (6):
  - `Mürekkep Damlası` — hint kullanımında zaman cezası yok
  - `Sayfa Köşesi` — koşu başına 1 node geri al
  - `Bronz Anahtar` — kilitli chest'leri açar (D2'de bazı chest'ler kilitli üretilir)
  - `Tüy Kalem` — ipucu sayacı yarıya
  - `Eski Mum` — sonraki kat node tiplerini detaylı gösterir
  - `Mürekkep Lekesi` — boss savaşında +1 can buffer
- Event pool (6):
  - `Kütüphaneci'nin Uykusu`, `Kayıp Mektup`, `Mürekkep Kuyusu`, `Boş Koltuk`, `Anahtar Çıngırağı`, `Toz Patikası`

**D3 · Yıldız Geçidi** — *D2'de ≥1 boss yenildiğinde ve 2 farklı koşuda toplam ≥3 farklı relic görüldüğünde açılır*
- Atmosfer: gece, yıldız, ay, rüya, kar
- Color accent: `--accent-cool`
- Pati izi: parıltılı (kısa süreli ışık)
- Floor names: Buzlu Pencere → Kuyruklu Yıldız → Düş Eşiği → Ay Saati → **Yıldız İplikçisi**
- Boss: **Yıldız İplikçisi** — zamanlı + multi-stage hint
- Difficulty: 7×7 → 12×12, %45-60 ipucu yoğunluğu, multi-elite
- Relic pool (6):
  - `Yıldız Tozu` — 1 ipucu 2 sayar
  - `Ay Mührü` — bir kez tam geri al (full undo)
  - `Gece Pusulası` — koşu başında tüm harita görünür
  - `Kuyruklu Yıldız` — yarıda bırakılan koşudan kayıpsız çıkış
  - `Düş İpliği` — +5 dk bonus süre (zamanlı node'lar için)
  - `Yıldızsayar` — sayıların yanında düşük olasılık üzeri ufak işaret
- Event pool (6):
  - `Sönmüş Yıldız`, `Ay Seni Tanıyor`, `Düş Parçası`, `Kar Tanesi`, `Buzlu Cam`, `Gece Patikası`

### 5.3 Map üretimi (algoritma)
- Seed: `<realmId>-<runIndex>-<userSalt>` veya kullanıcı manuel seed
- mulberry32 RNG (mevcut foundation kullanıyor)
- Her floor için node tipi dağılımı (D1 örnek):
  - F1 (start): puzzle ×1
  - F2: puzzle ×2 + event ×1
  - F3: puzzle ×1, chest ×1, elite ×1
  - F4: rest ×1, puzzle ×1
  - F5: boss ×1
- Edges: önceki floor'dan en yakın 1-2 node'a bağlanır (mevcut design'daki algoritma)

### 5.4 Boss mekanikleri
Her boss puzzle bir relic etkisini kısıtlar:
- Yün Bekçisi: ipucu kullanılırsa süre cezası
- Sessiz Kütüphaneci: süre limit yok ama her hata can götürür
- Yıldız İplikçisi: zamanlı + multi-stage (3 ardışık puzzle, her stage zorlaşır)

### 5.5 Permanent starter
Belirli achievement'lar Yuva'daki tek slot'u doldurur. Slot dolu ise sonraki tüm koşular o relic'le başlar.

V1'de unlock kaynakları:
- `Üç Diyar` → `Ayışığı` starter (random düşük olasılıkla +1 relic offer)
- `Sessiz Dost` → `Yün Yumağı` starter (rest'lerde +1 can)
- `Pati İzi` → `Söğüt Yaprağı` starter

Slot Yuva'dan değiştirilebilir (tıkla → koleksiyondan seç).

---

## 6. Achievement sistemi

### 6.1 Veri modeli
```js
// achievement registry (statik, koda gömülü)
const ACHIEVEMENTS = {
  'aksam-isigi': {
    realm: 'sogut-esigi',
    title: 'Akşam Işığı',
    body: 'Söğüt Eşiği\'ni ilk kez geçtin.',
    diaryEntry: 'Akşam ışığı düştü. Yün Bekçisi başını öne eğdi, geçtin.',
    secret: false,
    trigger: 'realm_cleared:sogut-esigi',
  },
  // ...
}
```

### 6.2 Trigger registry (engine)
- `realm_cleared:<id>` — diyar tamamlandı
- `boss_defeated:<id>` — boss yenildi
- `no_hint_clear:<id>` — diyar boyunca 0 hint
- `all_relics_in_run:<id>` — tek koşuda diyarın tüm relic'lerini gördü
- `event_chain:<id>:<chainId>` — belirli event seçim sırası
- `solve_count:<n>` — toplam puzzle count threshold
- `realms_cleared_all` — 3 diyar da tamamlandı
- `bosses_defeated_all` — 3 boss da yenildi
- `relics_per_realm:<n>` — her diyardan en az n relic
- `days_streak:<n>` — n farklı günde oyna
- `daytime:<startH>-<endH>` — belirli saatte oyna
- `month:<n>` — belirli ayda oyna (kar achievement için)
- `max_events_in_run` — tek koşuda max event
- `errors_flag_perfect:<id>` — errors flag açıkken sıfır hata
- `secret_jedi_tap` — Yuva'da Jedi silüeti yanıp söner, dokun

Engine her ilgili event'i emit eder; achievement registry karşılığını bulur, ilk unlock'ta `cember:meta.achievements`'a yazar, Jedi'nin Günlüğü'ne entry ekler, opsiyonel permanent starter'ı doldurur.

### 6.3 Açılış UX
- Diyar bossu yenilince win modal'da achievement listesi belirir
- Run sonu modalında "yeni günlük entry" + Jedi pati izi animasyonu
- Yuva'da `Jedi'nin Günlüğü` rozeti yanar (yeni entry varsa)

---

## 7. Yuva ekranı

Tek scroll, mobil-öncelikli. Bölümler:

```
[ ← geri ]                                       [ ⚙ ]
[ MINI JEDI SVG ]   Yuva
                    son durum cümlesi (italik, ink-dim)
─────────────────────────────────────────────────
[ Söğüt Eşiği card ]   warm accent strip
[ Karanlık İğne card ] taupe strip · "açılış: Söğüt Eşiği'nde 1 boss yen"
[ Yıldız Geçidi card ] cool strip · LOCKED
─────────────────────────────────────────────────
runs 23 · solves 187 · jediDiary 9/30
─────────────────────────────────────────────────
[ Jedi'nin Günlüğü › ]  (alt sayfa)
─────────────────────────────────────────────────
yanında başla:
[ söğüt yaprağı slot ]   (boş ise çember outline)
─────────────────────────────────────────────────
yedek al · yedek yükle
```

### 7.1 Jedi'nin Günlüğü alt sayfası
Diary entry'leri reverse-chrono. Her entry kart:
- Üst: achievement title (Fraunces 600) + tarih (mono küçük)
- Body: short narrative (Fraunces italic, ink-dim, ~2-3 satır)
- Sağ üst: relic ikonu (varsa)
- Kilitli entry'ler: `····` placeholder + sadece kategori (`söğüt eşiği · ?`)

---

## 8. PWA setup

### 8.1 manifest.json
```json
{
  "name": "Çember",
  "short_name": "Çember",
  "description": "Merve için bir çember bulmacası.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0a0a0c",
  "theme_color": "#0a0a0c",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 8.2 service-worker.js
- Cache-first strategy for shell (`index.html`, manifest, icons, fontlar)
- Network-first for fonts (Google Fonts CDN, fallback to cache)
- Version-based cache busting (`cember-shell-v1`)
- Activate: eski cache'leri temizler
- Bonus: `navigator.storage.persist()` çağrısı ile persistent storage flag iste

### 8.3 Icon assets
v1 için minimal: tek SVG çember + taupe accent, 192/512/maskable variant'lar. Üretim sonradan; placeholder için `<link rel="icon">` foundation'da var.

---

## 9. Çıkar / kalır listesi (foundation üzeri değişiklikler)

**Korunur:**
- Tüm mevcut puzzle generator + checker (saf mantık)
- localStorage `store` sarmalayıcı
- mulberry32 RNG + hashSeed
- Render engine (`render()`, `toggle()`, `geom()`)
- Settings, journey level system

**Genişler:**
- `store` → IDB mirror ekler, version-aware load
- `KEYS` → `meta`, `rogue:run` eklenir
- Settings sheet → "Yedek al/yükle" satırı
- Home cards → Rogue artık kilitli değil, "Yuva" sayfasına yönlendirir

**Yeni:**
- `src/persistence/idb.js` — IDB sarmalayıcı
- `src/persistence/migrate.js` — schema migration runtime
- `src/rogue/engine.js` — koşu state machine
- `src/rogue/map.js` — branching map generation
- `src/rogue/realms/*.js` — 3 diyar tanımı (relic/event/boss data)
- `src/rogue/achievements.js` — registry + engine
- `src/ui/yuva.js` — Yuva ekranı
- `src/ui/diary.js` — Jedi'nin Günlüğü
- `src/ui/rogue-board.js` — koşu içi board (mevcut board reuse + run HUD)
- `src/ui/rogue-map.js` — koşu haritası ekranı
- `src/ui/rogue-events.js` — event/chest/rest/boss modal'ları
- `src/illustrations/jedi.js` — SVG sprite (kulak, pati izi, oturan jedi vb.)
- `src/pwa/sw.js` — service worker
- `manifest.json`, `icons/`
- `src/styles/sessiz-iplik.css` — yeni design tokens

> Modüler yapıya geçilirse `type="module"` kullanılır; yerelde file:// yerine basit bir static server (veya Vercel/CF Pages) servis edilir.
> Alternatif: foundation gibi tek-dosya `index.html` içinde bölüm yorumlarıyla devam. **Tercih: modüler yapı** — token bütçesi, test edilebilirlik ve future-proofing için.

---

## 10. Açık kalan kararlar (implementation planında çözülecek)

1. **Modüler vs tek-dosya?** Önerim modüler (build step yok, `<script type="module">` doğrudan çalışır).
2. **CSS framework?** Yok. CSS variables + vanilla. Mevcut yaklaşım korunur.
3. **Test stratejisi?** Saf logic için (generator, checker, achievement engine) küçük test runner (HTML sayfası + assert helper). UI manuel.
4. **Icon production?** Spec'te placeholder; gerçek üretim implementation sonrası ayrı task.
5. **Sound effects?** v1'de yok (haptics var). Sound v2+.

---

## 11. Referans

- **Foundation:** `index.html` (1-548)
- **Original handoff:** `HANDOFF.md`
- **Design canvas:** `Sliterhlink Claude design/Çember · Tasarım Tuvali.html`
- **Design tokens:** `Sliterhlink Claude design/tokens.jsx`
- **Design screens (JSX):** `Sliterhlink Claude design/screens-*.jsx`
- **Design notes:** `Sliterhlink Claude design/DESIGN-NOTES.md`

---

*Spec sahibi: Erdoğan. Hedef kullanıcı: Merve. Sessiz ortak: Jedi.*
