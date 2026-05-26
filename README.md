# Çember

> Merve için bir Slitherlink (çember) bulmacası.

Tek dosyalık, sunucu-gerektirmez, mobil-öncelikli bir web oyunu. Görsel sistem **"Sessiz İplik"** — siyah/gri + tek taupe vurgu, hairline borders. Norveç orman kedisi Jedi sessiz bir varlık olarak içeride.

## Durum

| Katman | Durum |
|--------|-------|
| Foundation (puzzle generator + game loop) | ✓ çalışıyor (`index.html`) |
| Görsel tasarım (12 ekran, design tokens) | ✓ teslim (`Sliterhlink Claude design/`) |
| Rogue mode + Persistence + PWA spec | ✓ yazıldı (`docs/spec/cember-rogue-design.md`) |
| Implementation plan | ⏳ sonraki adım |
| Sessiz İplik giydirmesi | ⏳ planlanıyor |
| Rogue mode kodu | ⏳ planlanıyor |

## Yerelde çalıştır

`index.html` dosyasını tarayıcıda aç. Modül yok, build adımı yok.

İleride modüler yapıya geçilirse basit bir static server gerekir:

```bash
python3 -m http.server 8080
# veya
npx serve .
```

## Yayınla

Vercel (önerilen) — dosyaları sürükle bırak, otomatik `.vercel.app` adresi.
Alternatif: Cloudflare Pages, Netlify, GitHub Pages.

## iPhone'da tam ekran

Safari'de oyunu aç → paylaş butonu → "Ana Ekrana Ekle". İkona dokununca tam ekran açılır. PWA katmanı tamamlanınca çevrimdışı da çalışır.

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
