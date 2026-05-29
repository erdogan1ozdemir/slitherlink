# Çember

> Merve için bir Slitherlink (çember) bulmacası.

Tek dosyalık, sunucu-gerektirmez, mobil-öncelikli bir web oyunu. Görsel sistem **"Sessiz İplik"** — siyah/gri + tek taupe vurgu, hairline borders. Norveç orman kedisi Jedi sessiz bir varlık olarak içeride.

## Durum

| Katman | Durum |
|--------|-------|
| Foundation (puzzle generator + game loop) | ✓ çalışıyor (`index.html`) |
| Görsel tasarım (12 ekran, design tokens) | ✓ teslim (`Sliterhlink Claude design/`) |
| Sessiz İplik giydirmesi | ✓ uygulandı (`index.html`) |
| Persistence v2 (localStorage + IndexedDB + yedek kodu) | ✓ çalışıyor |
| PWA (manifest + service worker) | ✓ çalışıyor |
| Modüler çekirdek (`src/core`, `src/rogue`) | ✓ ayrıştırıldı |
| Rogue mode kodu (4 diyar, relic/talent/charm/event/achievement) | ✓ entegre (`index.html` + `src/rogue/`) |
| Kısıt mühürleri (constraint tiles) | ⏳ Sis aktif; diğer 6 tile solver-uyumlu hale getiriliyor |

## Yerelde çalıştır

`index.html` dosyasını tarayıcıda aç. Modül yok, build adımı yok.

İleride modüler yapıya geçilirse basit bir static server gerekir:

```bash
python3 -m http.server 8080
# veya
npx serve .
```

## Yayınla

Vercel (önerilen) — `vercel.json` proje köküne dahil; static deploy, PWA-uyumlu cache headers.

### Vercel ile yayınlama

```bash
# Tek seferlik: Vercel CLI kur
npm i -g vercel

# Proje köküne git
cd /path/to/slitherlink

# İlk deploy (prompts: confirm settings, link to project)
vercel

# Production deploy
vercel --prod
```

Sonuç: `https://<proje-adi>.vercel.app` adresinde canlı.

`vercel.json` içinde:
- Service worker `no-cache` header'la sunuluyor (PWA güncellemeleri için)
- HTML/JSON/SVG 1 saatlik cache + revalidate
- JS modülleri 24 saatlik cache

Alternatif: Cloudflare Pages, Netlify, GitHub Pages.

## iPhone'da tam ekran

Safari'de oyunu aç → paylaş butonu → "Ana Ekrana Ekle". İkona dokununca tam ekran açılır. Service worker aktif olduğundan çevrimdışı da çalışır.

### Manuel test (iPhone)

1. Vercel URL'sini Safari'de aç
2. Paylaş butonu → "Ana Ekrana Ekle"
3. Ana ekrandan ikonu aç — tam ekran, adres çubuğu yok
4. Uçak modunu aç, oyunu tekrar başlat → çalışır (service worker cache)
5. DevTools (PC bağlı): Application → Manifest hatasız + Service Workers active

## Klasör yapısı

```
.
├── index.html                       # foundation — oynanan oyun
├── HANDOFF.md                       # original handoff (ilk Claude Code'a)
├── README.md                        # bu dosya
├── .gitignore
├── docs/
│   ├── spec/                        # tasarım ve teknik spec'ler
│   │   └── cember-rogue-design.md   # v1 rogue + persistence spec
│   └── log/                         # brainstorm + decision logs
└── Sliterhlink Claude design/       # Claude Design çıktısı (tasarım kaynakları)
    ├── Çember · Tasarım Tuvali.html
    ├── DESIGN-NOTES.md
    ├── tokens.jsx
    ├── screens-*.jsx
    └── screenshots/
```

## Sonraki adımlar

1. `/superpowers:write-plan` ile implementation planı (`docs/spec/cember-implementation-plan.md`)
2. `/superpowers:execute-plan` ile adım adım kod
3. Vercel deploy
4. PWA manifest + service worker
5. Rogue mode ekranları + 3 diyar

Tüm süreç bu repo'da, MD'lerde takip edilir.

---

*Kişisel proje. Sahibi: Erdoğan. Oynayan: Merve. Sessiz ortak: Jedi.*
