# Plan 01 · Sessiz İplik Tokens Applied to Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mevcut `index.html` foundation'ının CSS değişkenlerini, fontlarını, geometrik ölçülerini ve bileşen sınıflarını `Sliterhlink Claude design/tokens.jsx` + `DESIGN-NOTES.md` ile birebir uyumlu hale getir; foundation görsel olarak design canvas ile aynı dili konuşsun.

**Architecture:** Foundation hâlâ tek dosya (`index.html`). Bu plan **sadece görsel katmanı** değiştirir — oyun mantığı, render engine, state machine dokunulmaz. Tüm değişiklikler `<style>` bloğunda ve render fonksiyonlarındaki literal stil/sınıf isimlerinde olur.

**Tech Stack:** Vanilla HTML/CSS/SVG, Google Fonts (Fraunces, Karla, JetBrains Mono ekleniyor).

**Bağımlılık:** Yok. İlk plan.

**Tahmini süre:** 90-120 dakika.

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `index.html` | Modify | CSS variables, font import, sınıf adları/stilleri, SVG render ayarları |
| `docs/log/plan-01-progress.md` | Create | Görevler tamamlandıkça progress notları (her commit'le güncellenir) |

> Bu plan'da yeni bir kaynak dosya oluşturulmuyor. Tüm değişiklik tek dosyada (`index.html`).

---

## Görevler

### Task 1: Baseline ekran görüntüsü ve progress log

**Files:**
- Create: `docs/log/plan-01-progress.md`

- [ ] **Step 1.1: Mevcut `index.html` dosyasını tarayıcıda aç**

Macos Finder'da `index.html` → çift tıkla. Varsayılan tarayıcıda açılır. Görsel ana menü + bir bulmacayı (5×5) baştan başlat.

- [ ] **Step 1.2: Baseline durumun notunu al**

Şu an gözle görülen tutarsızlıkları kayda al (örn: ana menü kartlarındaki accent rengi `#c9c9d2` çok soğuk; HUD chip'lerinde mono font yok; iplik rengi çok beyaz).

- [ ] **Step 1.3: Progress log dosyasını oluştur**

`docs/log/plan-01-progress.md` içeriği:

```markdown
# Plan 01 Progress

## Baseline (commit f307ed8)
- Renkler: var ama tonlar tokens.jsx'ten farklı (--bg #0b0b0d vs hedef #0a0a0c, vb.)
- Font: Fraunces + Karla var, JetBrains Mono yok
- Mono uygulaması: yok (HUD chip'leri Karla)
- Geometri: --border kullanılıyor, --hairline yok
- Edge stroke-width: 6 (hedef 5.5)
- Dot radius: 0.07 (hedef 0.06)

## Görev tamamlanma
- [ ] Task 1: Baseline + log
- [ ] Task 2: CSS değişken katmanı güncellendi
- [ ] Task 3: JetBrains Mono font eklendi
- [ ] Task 4: --font-* ailesi tanımlandı
- [ ] Task 5: Old → new değişken adları (border→hairline, dim→faint) globally
- [ ] Task 6: HUD chip mono font uygulandı
- [ ] Task 7: Geometri (radii, stroke, dot) güncellendi
- [ ] Task 8: Kicker pattern ve italic ton class'ları
- [ ] Task 9: Card / panel geometrisi
- [ ] Task 10: Modal + sheet ölçüleri
- [ ] Task 11: Görsel diff vs design canvas
- [ ] Task 12: Final commit + push
```

- [ ] **Step 1.4: Commit**

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git add docs/log/plan-01-progress.md
git commit -m "chore(plan-01): start — baseline log oluşturuldu"
```

---

### Task 2: CSS değişken katmanı — `:root` bloğunu güncelle

**Files:**
- Modify: `index.html:21-35` (`:root` block içindeki tüm değişken tanımları)

- [ ] **Step 2.1: Mevcut `:root` bloğunu oku ve hedef değerleri karşılaştır**

Mevcut (index.html:21-35):
```css
:root{
  --bg:#0b0b0d;
  --panel:#141418;
  --panel-2:#1c1c22;
  --line:#ededf2;
  --ink:#ededf2;
  --muted:#8a8a93;
  --dim:#3a3a42;
  --accent:#c9c9d2;
  --good:#9fb0a6;
  --bad:#d98a86;
  --border:rgba(255,255,255,.08);
  --safe-t:env(safe-area-inset-top,0px);
  --safe-b:env(safe-area-inset-bottom,0px);
}
```

Hedef (tokens.jsx + DESIGN-NOTES.md):
- Tüm renk hex'leri değişecek
- `--border` → `--hairline` + yeni `--hairline-2`
- `--dim` → `--faint`
- `--line` (artık ink ile aynı, ayrı durmasına gerek yok ama foundation'da edge stroke için kullanılıyor — şimdilik koru)
- Yeni: `--bg-warm`, `--ink-dim`, `--accent-warm`, `--accent-cool`, `--accent-dim`

- [ ] **Step 2.2: `:root` bloğunu hedefe göre yeniden yaz**

Edit `index.html:21-35` ile değiştir:

old_string:
```css
:root{
  --bg:#0b0b0d;
  --panel:#141418;
  --panel-2:#1c1c22;
  --line:#ededf2;      /* cember rengi */
  --ink:#ededf2;
  --muted:#8a8a93;
  --dim:#3a3a42;
  --accent:#c9c9d2;    /* gri vurgu */
  --good:#9fb0a6;
  --bad:#d98a86;
  --border:rgba(255,255,255,.08);
  --safe-t:env(safe-area-inset-top,0px);
  --safe-b:env(safe-area-inset-bottom,0px);
}
```

new_string:
```css
:root{
  /* Sessiz İplik — design tokens (cf. Sliterhlink Claude design/tokens.jsx) */
  --bg:#0a0a0c;
  --bg-warm:#0d0c0e;
  --panel:#15151a;
  --panel-2:#1d1d23;
  --hairline:rgba(237,234,227,.08);
  --hairline-2:rgba(237,234,227,.14);
  --ink:#EDEAE3;
  --ink-dim:rgba(237,234,227,.62);
  --line:#EDEAE3;          /* cember/iplik rengi — ink ile aynı */
  --muted:#7a7a82;
  --faint:#3a3a42;
  --accent:#A89B8B;         /* taupe — default (Karanlık İğne) */
  --accent-warm:#B89F8A;    /* Söğüt Eşiği için sıcak nudge */
  --accent-cool:#99A3B0;    /* Yıldız Geçidi için gümüş-mavi */
  --accent-dim:rgba(168,155,139,.20);
  --bad:#C97A6F;
  --good:#8FA39A;
  --safe-t:env(safe-area-inset-top,0px);
  --safe-b:env(safe-area-inset-bottom,0px);
}
```

- [ ] **Step 2.3: Tarayıcıyı yenile, değişimi gözle**

`index.html`'i tarayıcıda Cmd+R. Önce renkler bozuk görünecek çünkü `--border` ve `--dim` hâlâ kullanılıyor. Bu beklenen — Task 5'te halledilecek.

- [ ] **Step 2.4: Commit**

```bash
git add index.html
git commit -m "feat(tokens): :root değişkenleri tokens.jsx ile uyumlu hale getirildi"
```

---

### Task 3: JetBrains Mono fontu ekle

**Files:**
- Modify: `index.html:14` (Google Fonts link)

- [ ] **Step 3.1: Mevcut fonts link satırını bul**

`index.html:14`:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Karla:wght@400;500;700&display=swap" rel="stylesheet">
```

- [ ] **Step 3.2: JetBrains Mono'yu ekle**

Edit ile değiştir:

old_string:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Karla:wght@400;500;700&display=swap" rel="stylesheet">
```

new_string:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,400&family=Karla:wght@400;500;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
```

(Fraunces italic 400 da eklendi — DESIGN-NOTES "italik ton" için.)

- [ ] **Step 3.3: Tarayıcıyı yenile, network tab'inde 3 fontun yüklendiğini doğrula**

Chrome DevTools → Network → Filter "font" → Fraunces, Karla, JetBrains Mono dosyalarının indirildiğini gör.

- [ ] **Step 3.4: Commit**

```bash
git add index.html
git commit -m "feat(fonts): JetBrains Mono + Fraunces italic 400 eklendi"
```

---

### Task 4: Font değişkenleri tanımla

**Files:**
- Modify: `index.html` — `:root` bloğunun sonuna ekle (Task 2'deki blok)

- [ ] **Step 4.1: `:root` bloğunun sonuna font değişkenlerini ekle**

Edit ile `--safe-b` satırının altına 3 satır ekle:

old_string:
```css
  --safe-t:env(safe-area-inset-top,0px);
  --safe-b:env(safe-area-inset-bottom,0px);
}
```

new_string:
```css
  --safe-t:env(safe-area-inset-top,0px);
  --safe-b:env(safe-area-inset-bottom,0px);
  --font-serif:"Fraunces", "Cormorant Garamond", Georgia, serif;
  --font-body:"Karla", -apple-system, system-ui, sans-serif;
  --font-mono:"JetBrains Mono", "SF Mono", ui-monospace, monospace;
}
```

- [ ] **Step 4.2: Body'nin font-family'sini değişkene bağla**

`index.html:38-42` civarındaki body kuralı:

old_string:
```css
body{
  background:radial-gradient(120% 80% at 50% -10%,#17171c 0%,var(--bg) 60%);
  color:var(--ink);font-family:"Karla",-apple-system,system-ui,sans-serif;
  height:100dvh;overflow:hidden;user-select:none;
}
```

new_string:
```css
body{
  background:radial-gradient(120% 80% at 50% -10%,#17171c 0%,var(--bg) 60%);
  color:var(--ink);font-family:var(--font-body);
  height:100dvh;overflow:hidden;user-select:none;
  font-variant-numeric:tabular-nums;
}
```

(`tabular-nums` body seviyesinde — tüm rakamlar sabit genişlik.)

- [ ] **Step 4.3: Tarayıcıyı yenile, body fontunun hâlâ Karla göründüğünü doğrula**

Cmd+R. Görsel değişiklik beklenmiyor (Karla zaten yüklüydü), sadece değişkene bağlandı.

- [ ] **Step 4.4: Commit**

```bash
git add index.html
git commit -m "feat(fonts): --font-serif/body/mono değişkenleri + body tabular-nums"
```

---

### Task 5: Eski değişken adlarını değiştir (`--border` → `--hairline`, `--dim` → `--faint`)

**Files:**
- Modify: `index.html` (tüm `<style>` bloğu boyunca)

- [ ] **Step 5.1: `--border` kullanımını listele**

Bash:
```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
grep -n "var(--border)" index.html
```

Beklenen: ~15-20 satır. Her birinde `var(--border)` → `var(--hairline)` olacak.

- [ ] **Step 5.2: `--border` → `--hairline` toplu değiştir**

Edit tool'un `replace_all` parametresiyle:

old_string: `var(--border)`
new_string: `var(--hairline)`
replace_all: true

- [ ] **Step 5.3: `--dim` kullanımını listele**

```bash
grep -n "var(--dim)" index.html
```

Beklenen: ~5 satır (dot fill, switch off background).

- [ ] **Step 5.4: `--dim` → `--faint` toplu değiştir**

old_string: `var(--dim)`
new_string: `var(--faint)`
replace_all: true

- [ ] **Step 5.5: Tarayıcıyı yenile**

Cmd+R. Şu an renkler doğru görünmeli (border'lar artık `--hairline` ile çiziliyor, dot'lar `--faint`).

- [ ] **Step 5.6: Sanity check — kalan eski isimler var mı?**

```bash
grep -nE "var\(--border\)|var\(--dim\)" index.html
```

Beklenen: hiçbir sonuç (boş output).

- [ ] **Step 5.7: Commit**

```bash
git add index.html
git commit -m "refactor(tokens): --border → --hairline, --dim → --faint globally"
```

---

### Task 6: HUD chip'lerine mono font uygula

**Files:**
- Modify: `index.html` — `.chip` ve `.chip small` kuralları (`index.html:90-91` civarı)

- [ ] **Step 6.1: Mevcut chip kuralını bul**

`index.html:90-91`:
```css
.chip{background:var(--panel);border:1px solid var(--hairline);border-radius:999px;padding:6px 13px;font-weight:700;font-size:13px;display:flex;gap:6px;align-items:center;}
.chip small{color:var(--muted);font-weight:500;font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
```

- [ ] **Step 6.2: Mono font + tightened layout uygula**

Edit:

old_string:
```css
.chip{background:var(--panel);border:1px solid var(--hairline);border-radius:999px;padding:6px 13px;font-weight:700;font-size:13px;display:flex;gap:6px;align-items:center;}
.chip small{color:var(--muted);font-weight:500;font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
```

new_string:
```css
.chip{background:var(--panel);border:1px solid var(--hairline);border-radius:999px;padding:6px 13px;font-family:var(--font-mono);font-weight:700;font-size:12px;display:flex;gap:8px;align-items:center;font-variant-numeric:tabular-nums;}
.chip small{color:var(--muted);font-weight:500;font-size:9px;letter-spacing:.22em;text-transform:uppercase;font-family:var(--font-mono);}
```

- [ ] **Step 6.3: Tarayıcıyı yenile, oyun ekranındaki HUD chip'lerinde monospace font + uppercase mono küçük etiketler görünmeli**

Bir bulmaca başlat. Süre `0:00` ve İpucu `0` JetBrains Mono ile çizilmeli; "Süre" / "İpucu" etiketleri ince mono kapital olmalı.

- [ ] **Step 6.4: Commit**

```bash
git add index.html
git commit -m "feat(hud): chip mono font + uppercase mono small label"
```

---

### Task 7: Geometri — edge stroke, dot radius, radii güncellemesi

**Files:**
- Modify: `index.html` — `.edge-line` (`:82`), render fonksiyonundaki SVG circle radius (`:373`), board-card radius (`:76`)

- [ ] **Step 7.1: Edge stroke-width 6 → 5.5**

old_string:
```css
.edge-line{stroke:var(--line);stroke-width:6;stroke-linecap:round;}
```

new_string:
```css
.edge-line{stroke:var(--line);stroke-width:5.5;stroke-linecap:round;}
```

- [ ] **Step 7.2: Dot radius `S*0.07` → `S*0.06`**

Mevcut (`index.html:373`):
```javascript
ci.setAttribute("r",g.S*0.07);
```

old_string:
```javascript
ci.setAttribute("r",g.S*0.07);
```

new_string:
```javascript
ci.setAttribute("r",g.S*0.06);
```

- [ ] **Step 7.3: Board card border-radius 20 → 22 (DESIGN-NOTES 22)**

old_string:
```css
.board-card{background:var(--panel);border:1px solid var(--hairline);border-radius:20px;padding:14px;width:100%;}
```

new_string:
```css
.board-card{background:var(--panel);border:1px solid var(--hairline);border-radius:22px;padding:14px;width:100%;}
```

- [ ] **Step 7.4: Tarayıcıyı yenile, görsel diff**

Çizgiler hafifçe inceldi, noktalar minik küçüldü, kart köşeleri biraz daha yumuşak. Karşılaştırma için tasarım canvas'ından `screens-game.jsx` `Board` örneğini referans al.

- [ ] **Step 7.5: Commit**

```bash
git add index.html
git commit -m "feat(geom): edge stroke 5.5, dot r 0.06, board-card 22px radius"
```

---

### Task 8: Kicker pattern ve italic ton class'larını ekle

**Files:**
- Modify: `index.html` — `.section-label` (`:100`), home `.hero .kick` (`:58`), hero `.greet` (`:60`)

- [ ] **Step 8.1: `.section-label` letter-spacing değerini `.22em`'e yükselt + mono font uygula**

Mevcut (`index.html:100`):
```css
.section-label{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin:20px 0 10px;}
```

Letter-spacing zaten `.22em`. Sadece font-family ekle:

old_string:
```css
.section-label{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin:20px 0 10px;}
```

new_string:
```css
.section-label{font-family:var(--font-mono);font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:var(--muted);margin:20px 0 10px;font-weight:500;}
```

(DESIGN-NOTES: Kicker letter-spacing `.32em`, font-size 10, weight 500, mono.)

- [ ] **Step 8.2: Hero `.kick` uppercase mono kicker'a dönüştür**

Mevcut (`index.html:58`):
```css
.hero .kick{font-size:11px;letter-spacing:.4em;text-transform:uppercase;color:var(--muted);}
```

old_string:
```css
.hero .kick{font-size:11px;letter-spacing:.4em;text-transform:uppercase;color:var(--muted);}
```

new_string:
```css
.hero .kick{font-family:var(--font-mono);font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:var(--muted);font-weight:500;}
```

- [ ] **Step 8.3: `.hero .greet` Fraunces italic'e geç**

Mevcut (`index.html:60`):
```css
.hero .greet{color:var(--muted);font-family:"Fraunces",serif;font-style:italic;font-size:16px;}
```

old_string:
```css
.hero .greet{color:var(--muted);font-family:"Fraunces",serif;font-style:italic;font-size:16px;}
```

new_string:
```css
.hero .greet{color:var(--ink-dim);font-family:var(--font-serif);font-style:italic;font-size:16px;line-height:1.5;}
```

(Renk muted → ink-dim, daha okunaklı; line-height 1.5 italik tonun nefesi için.)

- [ ] **Step 8.4: Tarayıcıyı yenile, ana menüde "ÇEMBER BULMACA" mono uppercase, "Merve için" italic ink-dim**

- [ ] **Step 8.5: Commit**

```bash
git add index.html
git commit -m "feat(typography): kicker pattern (mono) + italic ton (Fraunces italic) class'ları"
```

---

### Task 9: Card / panel geometrisi — hero `h1`, cards, level rows

**Files:**
- Modify: `index.html` — `.hero h1` (`:59`), `.card` (`:62-66`), `.lvl` (`:112`)

- [ ] **Step 9.1: Hero h1 letter-spacing tighten ve weight set**

Mevcut (`index.html:59`):
```css
.hero h1{font-family:"Fraunces",serif;font-size:46px;font-weight:600;margin:6px 0 2px;letter-spacing:-.02em;}
```

old_string:
```css
.hero h1{font-family:"Fraunces",serif;font-size:46px;font-weight:600;margin:6px 0 2px;letter-spacing:-.02em;}
```

new_string:
```css
.hero h1{font-family:var(--font-serif);font-size:54px;font-weight:500;margin:8px 0 4px;letter-spacing:-.025em;line-height:1.0;}
```

(Fraunces 500 + bigger size + tighter tracking — DESIGN-NOTES Display class.)

- [ ] **Step 9.2: Card border ve radius güncelle**

Mevcut (`index.html:62-66`):
```css
.card{background:linear-gradient(160deg,var(--panel-2),var(--panel));border:1px solid var(--hairline);
  border-radius:18px;padding:18px;display:flex;align-items:center;gap:16px;cursor:pointer;transition:.16s;}
```

old_string:
```css
.card{background:linear-gradient(160deg,var(--panel-2),var(--panel));border:1px solid var(--hairline);
  border-radius:18px;padding:18px;display:flex;align-items:center;gap:16px;cursor:pointer;transition:.16s;}
```

new_string:
```css
.card{background:linear-gradient(160deg,var(--panel-2),var(--panel));border:1px solid var(--hairline-2);
  border-radius:18px;padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:.16s;}
```

(`--hairline-2` ile vurgulu border, padding 18→16, gap 16→14 — DESIGN-NOTES tighter cards.)

- [ ] **Step 9.3: Card `.emo` ikon boyutu ve renk**

Mevcut (`index.html:66`):
```css
.card .emo{font-size:26px;width:46px;height:46px;display:grid;place-items:center;background:var(--bg);border-radius:14px;border:1px solid var(--hairline);}
```

old_string:
```css
.card .emo{font-size:26px;width:46px;height:46px;display:grid;place-items:center;background:var(--bg);border-radius:14px;border:1px solid var(--hairline);}
```

new_string:
```css
.card .emo{font-size:24px;width:50px;height:50px;display:grid;place-items:center;background:var(--bg);border-radius:14px;border:1px solid var(--hairline);color:var(--accent);font-family:var(--font-serif);}
```

(Boyut 50×50, taupe accent rengi, Fraunces glyph — DESIGN-NOTES card.emo.)

- [ ] **Step 9.4: Card `.meta h3` Fraunces 600**

Mevcut (`index.html:68`):
```css
.card .meta h3{margin:0;font-size:18px;font-weight:700;font-family:"Fraunces",serif;}
```

old_string:
```css
.card .meta h3{margin:0;font-size:18px;font-weight:700;font-family:"Fraunces",serif;}
```

new_string:
```css
.card .meta h3{margin:0;font-size:18px;font-weight:600;font-family:var(--font-serif);line-height:1.1;}
```

- [ ] **Step 9.5: Level row geometrisi**

Mevcut (`index.html:112`):
```css
.lvl{display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--hairline);border-radius:14px;padding:13px 16px;cursor:pointer;}
```

old_string:
```css
.lvl{display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--hairline);border-radius:14px;padding:13px 16px;cursor:pointer;}
```

new_string:
```css
.lvl{display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--hairline);border-radius:16px;padding:13px 16px;cursor:pointer;}
.lvl .info b{font-family:var(--font-serif);font-weight:600;}
.lvl .info span{font-family:var(--font-mono);font-size:11px;letter-spacing:.04em;}
```

Wait — `.lvl .info b` ve `.lvl .info span` zaten `index.html:117-118`'de tanımlı. Onları override etmek için tek değişiklik yeterli; ayrı kurallar ekleyince çakışma riski olur. Bunun yerine mevcut iki satırı güncelle:

Mevcut (`index.html:117-118`):
```css
.lvl .info b{font-size:15px;}
.lvl .info span{display:block;color:var(--muted);font-size:12px;}
```

old_string:
```css
.lvl .info b{font-size:15px;}
.lvl .info span{display:block;color:var(--muted);font-size:12px;}
```

new_string:
```css
.lvl .info b{font-family:var(--font-serif);font-weight:600;font-size:15px;}
.lvl .info span{display:block;color:var(--muted);font-size:11px;font-family:var(--font-mono);letter-spacing:.04em;margin-top:2px;}
```

Ve `.lvl` kuralını yukarıdaki gibi `border-radius:16px` ile güncelle.

- [ ] **Step 9.6: Floor heading (`.floor-h`) italik düzelt**

Mevcut (`index.html:111`):
```css
.floor-h{font-family:"Fraunces",serif;font-size:15px;color:var(--accent);margin:18px 0 4px;font-style:italic;}
```

old_string:
```css
.floor-h{font-family:"Fraunces",serif;font-size:15px;color:var(--accent);margin:18px 0 4px;font-style:italic;}
```

new_string:
```css
.floor-h{font-family:var(--font-serif);font-style:italic;font-weight:400;font-size:15px;color:var(--accent);margin:22px 0 6px;letter-spacing:0;}
```

- [ ] **Step 9.7: Tarayıcıyı yenile**

Ana menü kartları belirgin şekilde rafine: glyph'ler taupe rengi, başlık serif 600, level satırı serif başlık + mono alt yazı.

- [ ] **Step 9.8: Commit**

```bash
git add index.html
git commit -m "feat(geom): card + level row + floor heading Sessiz İplik geometri"
```

---

### Task 10: Modal + bottom-sheet ölçüleri

**Files:**
- Modify: `index.html` — `.sheet` (`:125-126`), `.modal` (`:137`), `.toggle-row` (`:129`)

- [ ] **Step 10.1: Sheet — handle (üst tutamaç) ekle**

DESIGN-NOTES: "Settings sheet'i overlay olarak değil, bottom-sheet olarak yeniden konumla; üstte 42×4 handle."

Mevcut sheet zaten bottom-sheet pozisyonunda. Sadece handle eklenmiyor. Önce CSS, sonra HTML.

CSS ekle (`.sheet` kuralının altına yeni `.sheet-handle`):

Bul (`index.html:125-126`):
```css
.sheet{background:var(--panel-2);border:1px solid var(--hairline);border-radius:24px 24px 0 0;width:100%;max-width:600px;
  padding:22px 20px calc(26px + var(--safe-b));transform:translateY(100%);transition:.3s cubic-bezier(.2,.8,.2,1);max-height:84dvh;overflow-y:auto;}
```

Edit:

old_string:
```css
.sheet{background:var(--panel-2);border:1px solid var(--hairline);border-radius:24px 24px 0 0;width:100%;max-width:600px;
  padding:22px 20px calc(26px + var(--safe-b));transform:translateY(100%);transition:.3s cubic-bezier(.2,.8,.2,1);max-height:84dvh;overflow-y:auto;}
```

new_string:
```css
.sheet{background:var(--panel-2);border:1px solid var(--hairline);border-radius:24px 24px 0 0;width:100%;max-width:600px;
  padding:14px 22px calc(28px + var(--safe-b));transform:translateY(100%);transition:.3s cubic-bezier(.2,.8,.2,1);max-height:84dvh;overflow-y:auto;position:relative;}
.sheet::before{content:"";display:block;width:42px;height:4px;border-radius:999px;background:var(--faint);margin:0 auto 14px;}
```

(Padding üst 22→14 daha sıkı, handle pseudo-element olarak `::before`.)

- [ ] **Step 10.2: Sheet h2 stilini ayarla**

Mevcut (`index.html:128`):
```css
.sheet h2{font-family:"Fraunces",serif;font-weight:600;font-size:24px;margin:0 0 4px;}
```

old_string:
```css
.sheet h2{font-family:"Fraunces",serif;font-weight:600;font-size:24px;margin:0 0 4px;}
```

new_string:
```css
.sheet h2{font-family:var(--font-serif);font-weight:500;font-size:26px;margin:0 0 6px;letter-spacing:-.02em;}
```

- [ ] **Step 10.3: Toggle row label tipografisi**

Mevcut (`index.html:130-131`):
```css
.toggle-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--hairline);}
.toggle-row .lbl b{font-size:15px;}
.toggle-row .lbl span{display:block;color:var(--muted);font-size:12px;margin-top:2px;}
```

old_string:
```css
.toggle-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--hairline);}
.toggle-row .lbl b{font-size:15px;}
.toggle-row .lbl span{display:block;color:var(--muted);font-size:12px;margin-top:2px;}
```

new_string:
```css
.toggle-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--hairline);gap:14px;}
.toggle-row .lbl b{font-family:var(--font-serif);font-weight:600;font-size:15px;}
.toggle-row .lbl span{display:block;color:var(--muted);font-size:12px;margin-top:3px;line-height:1.4;}
```

- [ ] **Step 10.4: Switch ölçüleri — DESIGN-NOTES'da 48×28**

Mevcut (`index.html:132-135`):
```css
.sw{width:50px;height:30px;border-radius:999px;background:var(--faint);position:relative;cursor:pointer;transition:.2s;flex-shrink:0;}
.sw.on{background:var(--ink);}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:.2s;}
.sw.on::after{left:23px;}
```

old_string:
```css
.sw{width:50px;height:30px;border-radius:999px;background:var(--faint);position:relative;cursor:pointer;transition:.2s;flex-shrink:0;}
.sw.on{background:var(--ink);}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:.2s;}
.sw.on::after{left:23px;}
```

new_string:
```css
.sw{width:48px;height:28px;border-radius:999px;background:var(--faint);position:relative;cursor:pointer;transition:.2s;flex-shrink:0;}
.sw.on{background:var(--ink);}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:var(--bg);transition:.2s;}
.sw.on::after{left:23px;background:var(--bg);}
```

(Beyaz top → bg, daha az parlak; ölçüler 48×28 + 22 knob.)

- [ ] **Step 10.5: Modal başlık tipografisi**

Mevcut (`index.html:140`):
```css
.modal h2{font-family:"Fraunces",serif;font-weight:600;font-size:28px;margin:8px 0 4px;}
```

old_string:
```css
.modal h2{font-family:"Fraunces",serif;font-weight:600;font-size:28px;margin:8px 0 4px;}
```

new_string:
```css
.modal h2{font-family:var(--font-serif);font-weight:500;font-size:30px;margin:12px 0 6px;letter-spacing:-.02em;}
```

- [ ] **Step 10.6: Modal `.p` italic tonu**

Mevcut (`index.html:141`):
```css
.modal p{color:var(--muted);font-size:15px;font-family:"Fraunces",serif;font-style:italic;margin:0 0 6px;line-height:1.5;}
```

old_string:
```css
.modal p{color:var(--muted);font-size:15px;font-family:"Fraunces",serif;font-style:italic;margin:0 0 6px;line-height:1.5;}
```

new_string:
```css
.modal p{color:var(--ink-dim);font-size:15px;font-family:var(--font-serif);font-style:italic;font-weight:400;margin:4px 0 6px;line-height:1.5;}
```

- [ ] **Step 10.7: Modal stat numarası mono + tabular**

Mevcut (`index.html:144`):
```css
.modal .stat b{display:block;font-size:20px;font-family:"Fraunces",serif;}
```

old_string:
```css
.modal .stat b{display:block;font-size:20px;font-family:"Fraunces",serif;}
```

new_string:
```css
.modal .stat b{display:block;font-size:22px;font-family:var(--font-serif);font-weight:500;}
.modal .stat small{font-family:var(--font-mono);}
```

- [ ] **Step 10.8: Tarayıcıyı yenile, ayarlar sheet'ini aç**

Üstte tutamaç (handle) görünüyor; başlık Fraunces 500; toggle row b serif 600. Bir bulmacayı kazan, kazanma modalı: italic ton ink-dim, stat numaraları serif 500.

- [ ] **Step 10.9: Commit**

```bash
git add index.html
git commit -m "feat(geom): sheet handle + modal Sessiz İplik geometri"
```

---

### Task 11: Button geometrisi ve label tipografisi

**Files:**
- Modify: `index.html` — `.controls button` (`:93`), `.bigbtn` (`:108`), `.modal button` (`:147`)

- [ ] **Step 11.1: Controls button (Temizle/İpucu/Yeni)**

Mevcut (`index.html:93`):
```css
.controls button{font-family:"Karla";font-weight:700;font-size:14px;padding:12px 16px;border-radius:14px;border:1px solid var(--hairline);cursor:pointer;flex:1;max-width:150px;}
```

old_string:
```css
.controls button{font-family:"Karla";font-weight:700;font-size:14px;padding:12px 16px;border-radius:14px;border:1px solid var(--hairline);cursor:pointer;flex:1;max-width:150px;}
```

new_string:
```css
.controls button{font-family:var(--font-body);font-weight:700;font-size:14px;padding:13px 16px;border-radius:14px;border:1px solid var(--hairline);cursor:pointer;flex:1;max-width:150px;letter-spacing:.01em;}
```

- [ ] **Step 11.2: Big start button**

Mevcut (`index.html:108`):
```css
.bigbtn{width:100%;background:var(--ink);color:var(--bg);border:none;border-radius:16px;padding:16px;font-family:"Karla";font-weight:700;font-size:16px;margin-top:24px;cursor:pointer;}
```

old_string:
```css
.bigbtn{width:100%;background:var(--ink);color:var(--bg);border:none;border-radius:16px;padding:16px;font-family:"Karla";font-weight:700;font-size:16px;margin-top:24px;cursor:pointer;}
```

new_string:
```css
.bigbtn{width:100%;background:var(--ink);color:var(--bg);border:none;border-radius:18px;padding:18px;font-family:var(--font-body);font-weight:700;font-size:16px;margin-top:28px;cursor:pointer;letter-spacing:.02em;}
```

- [ ] **Step 11.3: Modal button**

Mevcut (`index.html:147`):
```css
.modal button{flex:1;border-radius:14px;padding:13px;font-family:"Karla";font-weight:700;font-size:14px;cursor:pointer;border:1px solid var(--hairline);}
```

old_string:
```css
.modal button{flex:1;border-radius:14px;padding:13px;font-family:"Karla";font-weight:700;font-size:14px;cursor:pointer;border:1px solid var(--hairline);}
```

new_string:
```css
.modal button{flex:1;border-radius:14px;padding:13px;font-family:var(--font-body);font-weight:700;font-size:14px;cursor:pointer;border:1px solid var(--hairline);}
```

(Yalnızca font değişkene bağlandı; geri kalan aynı.)

- [ ] **Step 11.4: Resume-pill (devam et) mono**

Mevcut (`index.html:71-72`):
```css
.resume-pill{display:inline-block;margin-top:8px;background:var(--ink);color:var(--bg);
  font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;}
```

old_string:
```css
.resume-pill{display:inline-block;margin-top:8px;background:var(--ink);color:var(--bg);
  font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;}
```

new_string:
```css
.resume-pill{display:inline-block;margin-top:9px;background:var(--ink);color:var(--bg);
  font-family:var(--font-mono);font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:999px;letter-spacing:.08em;text-transform:uppercase;}
```

- [ ] **Step 11.5: Tarayıcıyı yenile**

Tüm butonlar tutarlı; resume pill mono uppercase küçük; modal/sheet düğmeleri tutarlı.

- [ ] **Step 11.6: Commit**

```bash
git add index.html
git commit -m "feat(buttons): controls/big/modal/resume-pill tipografi düzeni"
```

---

### Task 12: Foot-note + opt chips + seedrow input

**Files:**
- Modify: `index.html` — `.foot-note` (`:149`), `.opt` (`:102`), `.seedrow input` (`:107`)

- [ ] **Step 12.1: Foot-note italik ton**

Mevcut (`index.html:149`):
```css
.foot-note{text-align:center;color:var(--muted);font-size:12px;font-style:italic;font-family:"Fraunces",serif;padding:8px 24px;line-height:1.5;}
```

old_string:
```css
.foot-note{text-align:center;color:var(--muted);font-size:12px;font-style:italic;font-family:"Fraunces",serif;padding:8px 24px;line-height:1.5;}
```

new_string:
```css
.foot-note{text-align:center;color:var(--muted);font-size:13px;font-style:italic;font-weight:400;font-family:var(--font-serif);padding:14px 24px;line-height:1.5;text-wrap:pretty;}
```

- [ ] **Step 12.2: Opt chips (size/preset chips)**

Mevcut (`index.html:102`):
```css
.opt{background:var(--panel);border:1px solid var(--hairline);color:var(--ink);border-radius:12px;padding:9px 15px;font-weight:700;font-size:14px;cursor:pointer;}
.opt.sel{background:var(--ink);color:var(--bg);}
```

old_string:
```css
.opt{background:var(--panel);border:1px solid var(--hairline);color:var(--ink);border-radius:12px;padding:9px 15px;font-weight:700;font-size:14px;cursor:pointer;}
.opt.sel{background:var(--ink);color:var(--bg);}
```

new_string:
```css
.opt{background:var(--panel);border:1px solid var(--hairline);color:var(--ink);border-radius:12px;padding:9px 14px;font-family:var(--font-body);font-weight:700;font-size:13px;cursor:pointer;transition:background .15s,color .15s;}
.opt.sel{background:var(--ink);color:var(--bg);border-color:var(--ink);}
```

- [ ] **Step 12.3: Seed input mono**

Mevcut (`index.html:107`):
```css
.seedrow input[type=text]{flex:1;background:var(--panel);border:1px solid var(--hairline);color:var(--ink);border-radius:12px;padding:11px 14px;font-family:"Karla";font-size:15px;}
```

old_string:
```css
.seedrow input[type=text]{flex:1;background:var(--panel);border:1px solid var(--hairline);color:var(--ink);border-radius:12px;padding:11px 14px;font-family:"Karla";font-size:15px;}
```

new_string:
```css
.seedrow input[type=text]{flex:1;background:var(--panel);border:1px solid var(--hairline);color:var(--ink);border-radius:12px;padding:11px 14px;font-family:var(--font-mono);font-size:14px;letter-spacing:.02em;}
```

- [ ] **Step 12.4: Tarayıcıyı yenile**

Setup ekranındaki chip'ler tutarlı; seed input mono.

- [ ] **Step 12.5: Commit**

```bash
git add index.html
git commit -m "feat(forms): foot-note italic, opt chips, seed input mono"
```

---

### Task 13: Topbar başlık tipografisi

**Files:**
- Modify: `index.html` — `.topbar .ttl` (`:51`), iconbtn (`:52-53`)

- [ ] **Step 13.1: Title font + weight**

Mevcut (`index.html:51`):
```css
.topbar .ttl{font-family:"Fraunces",serif;font-size:20px;font-weight:600;flex:1;}
```

old_string:
```css
.topbar .ttl{font-family:"Fraunces",serif;font-size:20px;font-weight:600;flex:1;}
```

new_string:
```css
.topbar .ttl{font-family:var(--font-serif);font-size:18px;font-weight:600;flex:1;letter-spacing:-.01em;}
```

- [ ] **Step 13.2: Iconbtn ölçüsü ve renkleri**

Mevcut (`index.html:52-53`):
```css
.iconbtn{background:var(--panel);border:1px solid var(--hairline);color:var(--ink);
  width:40px;height:40px;border-radius:12px;font-size:17px;display:grid;place-items:center;cursor:pointer;}
```

old_string:
```css
.iconbtn{background:var(--panel);border:1px solid var(--hairline);color:var(--ink);
  width:40px;height:40px;border-radius:12px;font-size:17px;display:grid;place-items:center;cursor:pointer;}
```

new_string:
```css
.iconbtn{background:var(--panel);border:1px solid var(--hairline);color:var(--ink);
  width:38px;height:38px;border-radius:11px;font-size:16px;display:grid;place-items:center;cursor:pointer;font-family:var(--font-body);}
```

(38×38, radius 11 — DESIGN-NOTES'tan.)

- [ ] **Step 13.3: Tarayıcıyı yenile**

Topbar daha sıkı; başlıklar Fraunces 600 18px; iconbtn'lar minik.

- [ ] **Step 13.4: Commit**

```bash
git add index.html
git commit -m "feat(topbar): title + iconbtn Sessiz İplik geometri"
```

---

### Task 14: Confetti (gri tonlu) renk paleti güncelle

**Files:**
- Modify: `index.html:507` (`cols` array)

- [ ] **Step 14.1: Yeni renk paleti**

Mevcut (`index.html:507`):
```javascript
const cols=["#ededf2","#c9c9d2","#8a8a93","#5a5a63","#ffffff"];
```

old_string:
```javascript
const cols=["#ededf2","#c9c9d2","#8a8a93","#5a5a63","#ffffff"];
```

new_string:
```javascript
const cols=["#EDEAE3","#A89B8B","#7a7a82","#3a3a42","#B89F8A"];
```

(Ink + taupe + muted + faint + accent-warm — Sessiz İplik paletinden.)

- [ ] **Step 14.2: Bulmaca çöz, konfeti renklerini gözlemle**

Bir 4×4 başlat, çöz, konfeti taupe ağırlıklı; beyazlar kalkmış.

- [ ] **Step 14.3: Commit**

```bash
git add index.html
git commit -m "feat(confetti): paleti Sessiz İplik tokenlerine bağla"
```

---

### Task 15: Clue text rengi ve fade davranışı

**Files:**
- Modify: `index.html` — `.clue` (`:79`), `.clue.done` (`:80`)

- [ ] **Step 15.1: Clue done daha açık opasite (DESIGN-NOTES: 0.22)**

Mevcut (`index.html:80`):
```css
.clue.done{fill:var(--muted);opacity:.3;}
```

old_string:
```css
.clue.done{fill:var(--muted);opacity:.3;}
```

new_string:
```css
.clue.done{fill:var(--ink);opacity:.22;}
```

(Renk ink kalıyor ama düşük opasite — DESIGN-NOTES.)

- [ ] **Step 15.2: Clue error pas tonu**

Mevcut (`index.html:81`):
```css
.clue.err{fill:var(--bad);}
```

Bu satır zaten doğru (`--bad` artık #C97A6F). Değişiklik yok.

- [ ] **Step 15.3: Clue normal fill ink + clue font-family belirt**

Mevcut (`index.html:79`):
```css
.clue{font-family:"Karla",sans-serif;font-weight:700;text-anchor:middle;dominant-baseline:central;fill:var(--ink);transition:fill .18s,opacity .18s;}
```

old_string:
```css
.clue{font-family:"Karla",sans-serif;font-weight:700;text-anchor:middle;dominant-baseline:central;fill:var(--ink);transition:fill .18s,opacity .18s;}
```

new_string:
```css
.clue{font-family:var(--font-body);font-weight:700;text-anchor:middle;dominant-baseline:central;fill:var(--ink);transition:fill .18s,opacity .18s;font-variant-numeric:tabular-nums;}
```

- [ ] **Step 15.4: Tarayıcıyı yenile, bir 5×5 başlat, kenarları işaretle**

Tamamlanan ipucu daha sönük (0.22 opasite); hatalar pas tonu; normal ipuçları net.

- [ ] **Step 15.5: Commit**

```bash
git add index.html
git commit -m "feat(clue): done opacity 0.22, font değişkene bağlı, tabular-nums"
```

---

### Task 16: Topbar padding ve page padding güncellemesi

**Files:**
- Modify: `index.html` — `.topbar` (`:50`), `.scroll` (`:47`)

- [ ] **Step 16.1: Topbar daha sıkı padding**

Mevcut (`index.html:50`):
```css
.topbar{display:flex;align-items:center;gap:12px;padding:8px 16px;min-height:48px;}
```

old_string:
```css
.topbar{display:flex;align-items:center;gap:12px;padding:8px 16px;min-height:48px;}
```

new_string:
```css
.topbar{display:flex;align-items:center;gap:12px;padding:10px 20px 6px;min-height:48px;}
```

- [ ] **Step 16.2: Scroll page padding 18px → 22px**

Mevcut (`index.html:47`):
```css
.scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 18px 24px;}
```

old_string:
```css
.scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 18px 24px;}
```

new_string:
```css
.scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 22px 28px;}
```

- [ ] **Step 16.3: Tarayıcıyı yenile, sayfaların nefesi açıldı**

- [ ] **Step 16.4: Commit**

```bash
git add index.html
git commit -m "feat(layout): topbar + page padding Sessiz İplik aralıkları"
```

---

### Task 17: Görsel diff — design canvas ile karşılaştır

**Files:**
- Read: `Sliterhlink Claude design/Çember · Tasarım Tuvali.html` (referans)
- Modify: `docs/log/plan-01-progress.md` (gözlem notları)

- [ ] **Step 17.1: Tasarım canvas'ını tarayıcıda aç**

Finder'da `Sliterhlink Claude design/Çember · Tasarım Tuvali.html` → çift tıkla. Yan yana iki sekmede design canvas + güncellenen foundation.

- [ ] **Step 17.2: Ekran ekran karşılaştır**

Karşılaştırılacak noktalar:
- Ana menü kartları (renk, padding, glyph rengi, başlık fontu)
- Setup ekranı (chip görünümü, slider, seed input)
- Oyun ekranı (HUD chip mono, board card, edge stroke, clue typography)
- Ayarlar sheet (handle, toggle row, switch)
- Kazanma modal (italic ton, stat tipografisi)

- [ ] **Step 17.3: Tutarsızlık varsa progress log'a yaz**

Eğer bir gözlemlenen fark varsa `docs/log/plan-01-progress.md` altına ekle. Bu plan'da düzeltilemeyecek kadar büyükse "Plan-01-followup" maddesi olarak işaretle.

Tipik kabul edilebilir farklar:
- Foundation hâlâ bezel-less (telefon çerçevesi yok) — sorun değil, gerçek body kullanıyor
- Status bar yok — gerçek tarayıcıda gereksiz

- [ ] **Step 17.4: Commit**

```bash
git add docs/log/plan-01-progress.md
git commit -m "docs(plan-01): görsel diff notları"
```

---

### Task 18: iPhone 11 ölçüsünde manuel test

**Files:**
- Görsel test, dosya değişikliği yok (yalnızca progress log)

- [ ] **Step 18.1: Chrome DevTools Device Mode (414 × 896)**

`index.html`'i Chrome'da aç → DevTools (Cmd+Opt+I) → Device toggle (Cmd+Shift+M) → "iPhone 11" preset (yoksa custom 414×896).

- [ ] **Step 18.2: Tüm akışı yürü**

- Başlangıç overlay → "Başla" tıkla
- Ana menü → "Serbest Oyun" → bir bulmaca başlat
- Bulmacayı çöz (4×4) → kazanma modalını gör
- "Ana menü" → "Yolculuk" → bir bölüm seç → oyna
- Ayarlar (⚙) → her toggle çevir, varsayılana geri al

- [ ] **Step 18.3: Tüm akışın kırılmadığını doğrula**

Beklenen: hiçbir layout overflow, hiçbir kayıp metin, mono fontlar HUD'da, sheet handle görünür.

- [ ] **Step 18.4: Progress log'u final notlarla güncelle**

```markdown
## Plan 01 — Final notlar (commit <SHA>)
- Tüm 18 task tamamlandı
- iPhone 11 mode'da akış sorunsuz
- Görsel diff: design canvas ile ~95% uyumlu; saklı farklar Plan-01-followup'ta
- Sonraki adım: Plan 02 (PWA setup)
```

- [ ] **Step 18.5: Commit**

```bash
git add docs/log/plan-01-progress.md
git commit -m "docs(plan-01): iPhone test + final notlar"
```

---

### Task 19: Roadmap güncellemesi + push

**Files:**
- Modify: `docs/spec/cember-implementation-roadmap.md` (ilerleme tablosu)

- [ ] **Step 19.1: Roadmap tablosunda Plan 01'i tamamlandı işaretle**

Edit `docs/spec/cember-implementation-roadmap.md`:

old_string:
```
| 01 — Sessiz İplik tokens | yazıldı, exec hazır | – |
```

new_string:
```
| 01 — Sessiz İplik tokens | ✓ tamamlandı | <son commit SHA> |
```

(Son commit SHA `git log -1 --format=%h` ile alınır.)

- [ ] **Step 19.2: Push**

```bash
git add docs/spec/cember-implementation-roadmap.md
git commit -m "docs(roadmap): Plan 01 tamamlandı olarak işaretle"
git push origin main
```

- [ ] **Step 19.3: Vercel kontrol et (opsiyonel)**

Vercel'e bağlıysa otomatik deploy. Yoksa `vercel --prod` veya web UI'dan deploy. Vercel kurulumu Plan 02'de PWA ile birlikte detaylı yapılacak.

---

## Self-Review (skill gereği)

**Spec coverage:**
- ✅ Sessiz İplik tokens → Task 2, 4
- ✅ Font triadı → Task 3, 4, 6, 8, 9, 10, 12, 13, 15
- ✅ Geometri (radii, hairlines, stroke, dot) → Task 7, 9, 10
- ✅ Bottom-sheet handle → Task 10
- ✅ Switch ölçüleri → Task 10
- ✅ Italic ton + Kicker pattern → Task 8
- ✅ Konfeti palette → Task 14
- ✅ Tabular-nums numeric → Task 4, 6, 15
- ✅ Visual diff sahası → Task 17
- ✅ iPhone smoke test → Task 18

**Placeholder taraması:** Hiçbir step "TBD/TODO/implement later" içermiyor. Her step kod bloğu veya komut içeriyor.

**Tip tutarlılığı:** Yok (saf CSS plan; tip yok).

**Test stratejisi:** Bu plan saf görsel/styling. Test = tarayıcıda manuel + design canvas karşılaştırması. Logic katmanları (Plan 04+) ayrı test stratejisi alacak.

**Toplam adım sayısı:** ~70 step (19 task × ortalama 4 step). Tahmini süre 90-120 dakika.

---

## Execution Handoff

Plan tamam ve commit edildi (`docs/spec/plan-01-sessiz-iplik-tokens.md`).

**Yürütme seçenekleri:**

1. **Subagent-Driven (önerilen)** — her task fresh subagent'la, aralarda review, hızlı iterasyon. `superpowers:subagent-driven-development` skill'i ile yürütülür.

2. **Inline Execution** — bu session içinde executing-plans skill'i ile checkpoint'li batch yürütme.

Sıradaki adım: kullanıcının seçimini al, ilgili skill ile yürütmeye başla.
