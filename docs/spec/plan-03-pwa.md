# Plan 03 · PWA Setup (manifest + service worker + persistent storage)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Foundation'ı PWA'ya çevir — "Ana Ekrana Ekle" sonrası tam ekran, offline, persistent storage flag.

**Architecture:** Yeni dosyalar: `manifest.json`, `service-worker.js`, `icons/icon.svg` (maskable). Mevcut `index.html` head bölümüne `<link rel="manifest">` + JS SW register + `navigator.storage.persist()`.

**Tech Stack:** Web App Manifest + Service Worker API. Build adımı yok.

**Bağımlılık:** Plan 02 tamamlanmış.

**Tahmini süre:** 1.5-2 saat (subagent-driven).

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `manifest.json` | Create | Web App Manifest |
| `service-worker.js` | Create | Cache-first shell, network-first fonts, offline |
| `icons/icon.svg` | Create | Tek SVG asset, çoklu boyut + maskable |
| `index.html` | Modify | Manifest link, SW register, persistent storage çağrısı |
| `docs/log/plan-03-progress.md` | Create | Progress notları |

---

## Görevler

### Task 1: Branch + progress log

- [ ] **Step 1.1:** Worktree oluştur

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-03 -b plan-03-pwa
cd "../slitherlink-plan-03"
```

- [ ] **Step 1.2:** Progress log oluştur (`docs/log/plan-03-progress.md`)

```markdown
# Plan 03 Progress

- [ ] Task 1: Branch + log
- [ ] Task 2: icons/icon.svg
- [ ] Task 3: manifest.json
- [ ] Task 4: service-worker.js
- [ ] Task 5: index.html head'e manifest + theme color
- [ ] Task 6: SW register + persistent storage JS
- [ ] Task 7: Final + merge + push
```

- [ ] **Step 1.3:** Commit `chore(plan-03): start — branch + progress log`

---

### Task 2: SVG icon

- [ ] **Step 2.1:** `icons/` klasörü oluştur

```bash
mkdir -p icons
```

- [ ] **Step 2.2:** `icons/icon.svg` oluştur

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Sessiz İplik palette -->
  <rect width="512" height="512" fill="#0a0a0c"/>
  <!-- Tek çember + ipliklik motifi -->
  <g stroke="#EDEAE3" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M 140 180 L 140 332 L 256 332 L 256 256 L 372 256 L 372 180 Z"/>
  </g>
  <!-- Taupe vertex dots -->
  <g fill="#A89B8B">
    <circle cx="140" cy="180" r="9"/>
    <circle cx="140" cy="332" r="9"/>
    <circle cx="256" cy="332" r="9"/>
    <circle cx="256" cy="256" r="9"/>
    <circle cx="372" cy="256" r="9"/>
    <circle cx="372" cy="180" r="9"/>
  </g>
</svg>
```

(Tek loop tasarımı — açılış ekranındaki dekoratif çember motifinin scaled-up versiyonu. 512×512 maskable-safe central area.)

- [ ] **Step 2.3:** Commit `feat(pwa): icons/icon.svg — Sessiz İplik tek-çember motifi`

---

### Task 3: manifest.json

- [ ] **Step 3.1:** `manifest.json` oluştur

```json
{
  "name": "Slitherlink — Yarim için",
  "short_name": "Slitherlink",
  "description": "Noktaları birleştir, tek bir kapalı döngü oluştur.",
  "lang": "tr",
  "dir": "ltr",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0a0a0c",
  "theme_color": "#0a0a0c",
  "categories": ["games", "puzzles"],
  "icons": [
    {
      "src": "./icons/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 3.2:** Commit `feat(pwa): manifest.json`

---

### Task 4: service-worker.js

- [ ] **Step 4.1:** `service-worker.js` oluştur

```javascript
// Slitherlink PWA service worker — cache-first shell, network-first dynamic
const VERSION = 'slitherlink-shell-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Google Fonts: network-first, fallback to cache
  if (url.host.endsWith('fonts.googleapis.com') || url.host.endsWith('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(VERSION).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Same-origin: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached ||
        fetch(event.request).then((res) => {
          if (res.ok && event.request.method === 'GET') {
            const clone = res.clone();
            caches.open(VERSION).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
      )
    );
    return;
  }

  // External: network only
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
```

- [ ] **Step 4.2:** Commit `feat(pwa): service-worker.js — cache-first shell + network-first fonts`

---

### Task 5: index.html head — manifest link

- [ ] **Step 5.1:** `<head>` içine manifest link ekle

`index.html` head bölümünde, theme-color satırından sonra:

old_string:
```
<meta name="theme-color" content="#0a0a0c">
<title>Slitherlink · Yarim için</title>
```

new_string:
```
<meta name="theme-color" content="#0a0a0c">
<link rel="manifest" href="./manifest.json">
<link rel="icon" href="./icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="./icons/icon.svg">
<title>Slitherlink · Yarim için</title>
```

- [ ] **Step 5.2:** Commit `feat(pwa): manifest + icon link'leri head'e`

---

### Task 6: SW register + persistent storage çağrısı

- [ ] **Step 6.1:** `<script>` bloğunun BAŞINA (CONFIG'den önce) SW register kodu ekle

Mevcut script açılışı:
```javascript
<script>
/* =========================================================================
   1) KISISELLESTIRME / CONFIG   (tek degistirecegin yer)
   ========================================================================= */
const CONFIG = {
```

Edit:

old_string:
```
<script>
/* =========================================================================
   1) KISISELLESTIRME / CONFIG   (tek degistirecegin yer)
   ========================================================================= */
const CONFIG = {
```

new_string:
```
<script>
/* =========================================================================
   0) PWA — service worker register + persistent storage
   ========================================================================= */
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  });
}
if(navigator.storage&&navigator.storage.persist){
  navigator.storage.persist().catch(()=>{});
}

/* =========================================================================
   1) KISISELLESTIRME / CONFIG   (tek degistirecegin yer)
   ========================================================================= */
const CONFIG = {
```

- [ ] **Step 6.2:** Commit `feat(pwa): SW register + storage.persist() çağrısı`

---

### Task 7: Final + merge + push

- [ ] **Step 7.1:** Progress log final notları + manuel test instruction

```markdown
## Plan 03 — Final

6 task, 7 commit. PWA hazır.

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
```

- [ ] **Step 7.2:** Roadmap güncelle

`docs/spec/cember-implementation-roadmap.md`:

old_string: `| 03 — PWA setup | bekliyor | – |`
new_string: `| 03 — PWA setup | ✓ tamamlandı | <SON_COMMIT_SHA> |`

- [ ] **Step 7.3:** Commit `docs(plan-03): final progress + roadmap`

- [ ] **Step 7.4:** Branch push

```bash
git push -u origin plan-03-pwa
```

- [ ] **Step 7.5:** Main merge

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git checkout main
git merge --no-ff plan-03-pwa -m "Merge Plan 03: PWA setup (manifest + service worker + persistent storage)"
git push origin main
```

---

## Self-Review

**Spec coverage:** ✅ manifest, ✅ SW, ✅ icons, ✅ register, ✅ persist call.

**Toplam adım:** ~20 step.

**Önerilen gruplar (subagent dispatches):**
- **Dispatch 1:** Task 1-4 (branch + icon + manifest + SW)
- **Dispatch 2:** Task 5-6 (index.html değişiklikleri)
- **Dispatch 3:** Task 7 (final + merge + push)

= 3 dispatch (her birinin ardından spec review opsiyonel — değişiklikler küçük ve mekanik).
