# Plan 02 · Patches + Slitherlink QoL + How-to-play + Backup Code

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Acil UX patches (Türkçe karakter audit + "Merhaba Yarim" + ipucu 0) + Slitherlink yaygın QoL toggle'ları (Auto-X, Undo/Redo, Auto-check) + "Nasıl Oynanır" tutorial sheet + Yedek Kodu (snapshot copy-paste) sistemi.

**Architecture:** Foundation hâlâ tek dosya (`index.html`). CSS değişikliği yok (Plan 01 bitti). JS değişikliği: toggle'lar için `settings` objesine yeni alanlar, `toggle()` fonksiyonuna `autoXAfterClue` çağrısı, undo/redo stack, yeni `Yedek Kodu` modal'ı. HTML değişikliği: Nasıl Oynanır sheet'i, ayar sheet'ine yeni satırlar.

**Tech Stack:** Vanilla HTML/CSS/SVG/JS. Yeni bağımlılık yok.

**Bağımlılık:** Plan 01 tamamlanmış olmalı (`main` branch'inde Sessiz İplik tokens).

**Tahmini süre:** 4-6 saat (subagent-driven).

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `index.html` | Modify | Turkish chars, CONFIG, settings, JS toggle/undo/autoX/backup, HTML sheet'ler |
| `docs/log/plan-02-progress.md` | Create | Progress notları |

> Bu plan'da yeni asset / yeni klasör yok. Tek dosya değişikliği.

---

## Plan'ın Faz Yapısı

- **Faz A** (Task 1-4): Türkçe + Yarim + hint=0 acil patches
- **Faz B** (Task 5-9): Slitherlink QoL toggle'lar (Auto-X, Undo, Auto-check)
- **Faz C** (Task 10-13): Nasıl Oynanır sheet'i
- **Faz D** (Task 14-18): Yedek Kodu sistemi
- **Faz E** (Task 19-21): Finalize + push + merge

---

## Görevler

### Task 1: Progress log + branch

**Files:**
- Create: `docs/log/plan-02-progress.md`

- [ ] **Step 1.1: Worktree oluştur**

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-02 -b plan-02-patches-and-features
cd "../slitherlink-plan-02"
git status
```

Beklenen: `On branch plan-02-patches-and-features`.

- [ ] **Step 1.2: Progress log oluştur**

`/Users/Erdo/Desktop/Claude Projects/slitherlink-plan-02/docs/log/plan-02-progress.md` içeriği:

```markdown
# Plan 02 Progress

## Faz A — Acil patches
- [ ] Task 1: Branch + log
- [ ] Task 2: Türkçe karakter audit (CONFIG + foot-note + greet)
- [ ] Task 3: Türkçe karakter audit (ayarlar + journey + setup)
- [ ] Task 4: "Merhaba Yarim" + ipucu yoğunluğu 0

## Faz B — Slitherlink QoL toggle'ları
- [ ] Task 5: settings'e autoX, autoCheckMode eklendi
- [ ] Task 6: Auto-X implementation (toggle() sonrası autoXAfterClue çağrısı)
- [ ] Task 7: Auto-check 3-mode (off / mistakes-only / live) implementation
- [ ] Task 8: Undo/Redo stack + 2 yeni buton HUD'a
- [ ] Task 9: Ayar sheet'ine yeni toggle'lar (Auto-X, Auto-check mode)

## Faz C — Nasıl Oynanır
- [ ] Task 10: Help sheet HTML iskeleti (5 sekme)
- [ ] Task 11: İçerik 1-2 (Çember kuralları + Modlar)
- [ ] Task 12: İçerik 3-4 (Rogue detay + Kalıcı geliştirme)
- [ ] Task 13: İçerik 5 (Yedek Kodu) + Help link entegrasyonu (ayar sheet + ana menü)

## Faz D — Yedek Kodu
- [ ] Task 14: Snapshot serialize/deserialize (collectAllKeys, encode, decode)
- [ ] Task 15: Yedek Kodu modal UI (üret + yükle)
- [ ] Task 16: Ayar sheet'ine entegre
- [ ] Task 17: Roundtrip test (üret + load farklı tarayıcı/private sekme)
- [ ] Task 18: Hata yönetimi (geçersiz kod, versiyon uyumsuzluğu)

## Faz E — Finalize
- [ ] Task 19: Smoke test (full akış)
- [ ] Task 20: Progress log final + roadmap güncelle
- [ ] Task 21: Push + merge main + push
```

- [ ] **Step 1.3: Commit**

```bash
git add docs/log/plan-02-progress.md
git commit -m "chore(plan-02): start — branch + progress log"
```

---

### Task 2: Türkçe karakter audit — CONFIG, başlık, foot-note

**Files:**
- Modify: `index.html` — CONFIG block + hero kicker + foot-note + start/win text

- [ ] **Step 2.1: CONFIG bloğunu güncelle**

`index.html:253-258` civarındaki CONFIG'i bul:

old_string:
```
const CONFIG = {
  name: "Merve",
  greet: "{name} icin",
  startMsg: "Bunu senin icin yaptim. Tek bir cember ciz, kaybolma 🩶",
  winMsg:   "Yine basardin. Seninle her bulmaca daha guzel.",
};
```

new_string:
```
const CONFIG = {
  name: "Merve",
  intimateName: "Yarim",
  greet: "{name} için",
  startMsg: "Bunu senin için yaptım. Tek bir çember çiz, kaybolma 🩶",
  winMsg:   "Yine başardın. Seninle her bulmaca daha güzel.",
};
```

- [ ] **Step 2.2: Hero kicker — "cember bulmaca" → "çember bulmaca"**

`index.html:160` civarı:

old_string:
```html
        <div class="kick">cember bulmaca</div>
```

new_string:
```html
        <div class="kick">çember bulmaca</div>
```

- [ ] **Step 2.3: Foot-note (ana menü altı)**

`index.html:165` civarı:

old_string:
```html
      <p class="foot-note">Tek ve kapali bir cember ciz. Her sayi, etrafindaki cizgi adedini soyler.</p>
```

new_string:
```html
      <p class="foot-note">Tek ve kapalı bir çember çiz. Her sayı, etrafındaki çizgi adedini söyler.</p>
```

- [ ] **Step 2.4: Ayar sheet'i altı (Ana Ekrana Ekle ipucu)**

`index.html:217-218` civarı:

old_string:
```html
    <p class="foot-note" style="text-align:left;padding:14px 0 0;">
      iPhone'da tam ekran: Safari'de paylas butonu → "Ana Ekrana Ekle". Oyun uygulama gibi tam ekran acilir.</p>
```

new_string:
```html
    <p class="foot-note" style="text-align:left;padding:14px 0 0;">
      iPhone'da tam ekran: Safari'de paylaş butonu → "Ana Ekrana Ekle". Oyun uygulama gibi tam ekran açılır.</p>
```

Commit:
```bash
git add index.html
git commit -m "fix(i18n): CONFIG + hero + foot-note Türkçe karakter düzeltmesi"
```

---

### Task 3: Türkçe karakter audit — setup, journey, game, settings labels

**Files:**
- Modify: `index.html`

- [ ] **Step 3.1: Setup ekranı başlıkları**

`index.html:173-186` civarı setup screen content:

old_string:
```html
    <div class="topbar"><button class="iconbtn" data-back>‹</button><div class="ttl">Serbest Oyun</div></div>
    <div class="scroll">
      <div class="section-label">Hazir seviye</div>
      <div class="chips" id="presetChips"></div>
      <div class="section-label">Tahta boyutu</div>
      <div class="chips" id="sizeChips"></div>
      <div class="section-label">Ipucu yogunlugu <span id="densVal" style="color:var(--ink)"></span></div>
      <div class="slider-row"><span style="color:var(--muted);font-size:12px">Az</span>
        <input type="range" id="density" min="35" max="90" value="70">
        <span style="color:var(--muted);font-size:12px">Cok</span></div>
      <div class="section-label">Seed (rastgelelik) - bos birak = rastgele</div>
      <div class="seedrow"><input type="text" id="seedInput" placeholder="orn. merve-01" autocapitalize="off" autocomplete="off">
        <button class="opt" id="seedRand">🎲</button></div>
      <button class="bigbtn" id="startFreeBtn">Baslat</button>
```

new_string:
```html
    <div class="topbar"><button class="iconbtn" data-back>‹</button><div class="ttl">Serbest Oyun</div></div>
    <div class="scroll">
      <div class="section-label">Hazır seviye</div>
      <div class="chips" id="presetChips"></div>
      <div class="section-label">Tahta boyutu</div>
      <div class="chips" id="sizeChips"></div>
      <div class="section-label">İpucu yoğunluğu <span id="densVal" style="color:var(--ink)"></span></div>
      <div class="slider-row"><span style="color:var(--muted);font-size:12px">Az</span>
        <input type="range" id="density" min="0" max="90" value="70">
        <span style="color:var(--muted);font-size:12px">Çok</span></div>
      <div class="section-label">Seed (rastgelelik) — boş bırak = rastgele</div>
      <div class="seedrow"><input type="text" id="seedInput" placeholder="örn. merve-01" autocapitalize="off" autocomplete="off">
        <button class="opt" id="seedRand">🎲</button></div>
      <button class="bigbtn" id="startFreeBtn">Başlat</button>
```

(Not: Bu Edit ayrıca density `min="35"` → `min="0"` değişikliğini içeriyor — Task 4'te ayrı yapılacaktı ama burada birlikte aldık. Hint density 0 fix dahil.)

- [ ] **Step 3.2: Journey ekranı**

`index.html:190-192` civarı:

old_string:
```html
    <div class="topbar"><button class="iconbtn" data-back>‹</button><div class="ttl">Yolculuk</div>
      <button class="iconbtn" id="journeyReset" title="Sifirla">↺</button></div>
```

new_string:
```html
    <div class="topbar"><button class="iconbtn" data-back>‹</button><div class="ttl">Yolculuk</div>
      <button class="iconbtn" id="journeyReset" title="Sıfırla">↺</button></div>
```

- [ ] **Step 3.3: Game ekranı HUD label'ları (HTML)**

`index.html:200-208` civarı:

old_string:
```html
    <div class="gamebar">
      <div class="chip"><small>Sure</small><span id="timer">0:00</span></div>
      <div class="chip" id="hintChip"><small>Ipucu</small><span id="hintsUsed">0</span></div>
    </div>
    <div class="board-wrap"><div class="board-card"><svg id="board"></svg></div></div>
    <div class="controls">
      <button class="btn-ghost" id="resetBtn">↺ Temizle</button>
      <button class="btn-ghost hidden" id="hintBtn">💡 Ipucu</button>
      <button class="btn-primary" id="newBtn">✦ Yeni</button>
    </div>
```

new_string:
```html
    <div class="gamebar">
      <div class="chip"><small>Süre</small><span id="timer">0:00</span></div>
      <div class="chip" id="hintChip"><small>İpucu</small><span id="hintsUsed">0</span></div>
    </div>
    <div class="board-wrap"><div class="board-card"><svg id="board"></svg></div></div>
    <div class="controls">
      <button class="btn-ghost" id="resetBtn">↺ Temizle</button>
      <button class="btn-ghost hidden" id="hintBtn">💡 İpucu</button>
      <button class="btn-primary" id="newBtn">✦ Yeni</button>
    </div>
```

- [ ] **Step 3.4: Toggle definitions (TOGGLE_DEFS array)**

`index.html:308-314` civarı, JS:

old_string:
```javascript
const TOGGLE_DEFS=[
  {k:"hints",  t:"Ipucu butonu",            d:"Oyunda ipucu butonunu goster"},
  {k:"fade",   t:"Tamamlanani soluklastir", d:"Cizgisi biten sayiyi soluklastir"},
  {k:"errors", t:"Hatalari kirmizi goster", d:"Fazla/yanlis cizgide sayiyi kirmizi yap"},
  {k:"haptics",t:"Titresim",                d:"Dokununca kucuk titresim (destekleyen cihazda)"},
];
```

new_string:
```javascript
const TOGGLE_DEFS=[
  {k:"hints",  t:"İpucu butonu",            d:"Oyunda ipucu butonunu göster"},
  {k:"fade",   t:"Tamamlananı soluklaştır", d:"Çizgisi biten sayıyı soluklaştır"},
  {k:"errors", t:"Hataları kırmızı göster", d:"Fazla/yanlış çizgide sayıyı kırmızı yap"},
  {k:"haptics",t:"Titreşim",                d:"Dokununca küçük titreşim (destekleyen cihazda)"},
];
```

- [ ] **Step 3.5: Floor isimleri**

`index.html:319-324` civarı `FLOORS` array:

old_string:
```javascript
const FLOORS=[
  {name:"Giris Holu",     size:4, keep:.85},
  {name:"Sessiz Koridor", size:5, keep:.78},
  {name:"Golge Galerisi", size:6, keep:.72},
  {name:"Kayip Kutuphane",size:7, keep:.66},
  {name:"Kristal Magara", size:8, keep:.60},
  {name:"Zirve",          size:9, keep:.55},
];
```

new_string:
```javascript
const FLOORS=[
  {name:"Giriş Holü",     size:4, keep:.85},
  {name:"Sessiz Koridor", size:5, keep:.78},
  {name:"Gölge Galerisi", size:6, keep:.72},
  {name:"Kayıp Kütüphane",size:7, keep:.66},
  {name:"Kristal Mağara", size:8, keep:.60},
  {name:"Zirve",          size:9, keep:.55},
];
```

- [ ] **Step 3.6: Game title ve "Serbest" string'i**

`index.html` içinde `ctx.mode==="journey" ? levelParams(ctx.levelIndex).title : "Serbest"` ifadesi var. "Serbest" string'i zaten doğru. `title` template'i `"Bolum "+(i+1)` — "Bölüm" olmalı.

`index.html:332` civarı `levelParams`:

old_string:
```javascript
  return {index:i, floor:fi, name:f.name, R:f.size, C:f.size, keep, seed:"merve-journey-"+i, title:"Bolum "+(i+1)};
```

new_string:
```javascript
  return {index:i, floor:fi, name:f.name, R:f.size, C:f.size, keep, seed:"merve-journey-"+i, title:"Bölüm "+(i+1)};
```

- [ ] **Step 3.7: renderJourney best time + ipucu yüzdesi**

`index.html:476-480` civarı:

old_string:
```javascript
      const locked=i>prog.unlocked, done=prog.times[i]!=null;
      const bt=done?" · en iyi "+fmt(prog.times[i]):"";
      html+=`<div class="lvl ${locked?'locked':''} ${done?'done':''}" data-level="${locked?'':i}">
        <div class="num">${i+1}</div>
        <div class="info"><b>${lp.R}×${lp.C}</b><span>ipucu %${Math.round(lp.keep*100)}${bt}</span></div>
```

new_string:
```javascript
      const locked=i>prog.unlocked, done=prog.times[i]!=null;
      const bt=done?" · en iyi "+fmt(prog.times[i]):"";
      html+=`<div class="lvl ${locked?'locked':''} ${done?'done':''}" data-level="${locked?'':i}">
        <div class="num">${i+1}</div>
        <div class="info"><b>${lp.R}×${lp.C}</b><span>ipucu %${Math.round(lp.keep*100)}${bt}</span></div>
```

(Bu satır zaten Türkçe karakter içermiyor — değişiklik yok; yine de okuma için tutuldu.)

- [ ] **Step 3.8: Journey reset confirm + cards**

`index.html:533` civarı:

old_string:
```javascript
$("journeyReset").addEventListener("click",()=>{if(confirm("Yolculuk ilerlemesi sifirlansin mi?")){store.del(KEYS.jrnProg);store.del(KEYS.jrnCur);renderJourney();}});
```

new_string:
```javascript
$("journeyReset").addEventListener("click",()=>{if(confirm("Yolculuk ilerlemesi sıfırlansın mı?")){store.del(KEYS.jrnProg);store.del(KEYS.jrnCur);renderJourney();}});
```

- [ ] **Step 3.9: Home cards içerikleri**

`index.html:438-441` civarı `cards` array:

old_string:
```javascript
  const cards=[
    {id:"free",emo:"✦",h:"Serbest Oyun",p:"Boyut, yogunluk ve seed sec",resume:freeResume},
    {id:"journey",emo:"⬢",h:"Yolculuk",p:prog.unlocked+" / "+TOTAL_LEVELS+" bolum acildi",resume:jrnResume},
    {id:"rogue",emo:"☠",h:"Rogue Modu",p:"Yakinda - canlar, esyalar, rastgele kat",locked:true},
  ];
```

new_string:
```javascript
  const cards=[
    {id:"free",emo:"✦",h:"Serbest Oyun",p:"Boyut, yoğunluk ve seed seç",resume:freeResume},
    {id:"journey",emo:"⬢",h:"Yolculuk",p:prog.unlocked+" / "+TOTAL_LEVELS+" bölüm açıldı",resume:jrnResume},
    {id:"rogue",emo:"☠",h:"Rogue Modu",p:"Yakında — canlar, eşyalar, rastgele kat",locked:true},
  ];
```

- [ ] **Step 3.10: Resume pill**

`index.html:103` civarı `resume-pill` HTML class (CSS değil, JS template):

old_string:
```javascript
                }}>● Devam et · 04:21</div>
```

(Bu design canvas dosyasında — uygulanmaz)

(Aslında foundation `index.html`'in `renderHome` fonksiyonundaki resume HTML'i kontrol et: line 447 civarı `<span class="resume-pill">Devam et</span>` — bu Türkçe doğru.)

- [ ] **Step 3.11: Tüm Türkçe diff doğrulama**

Bash:
```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink-plan-02"
grep -nE "Basla|icin|cember|cizgi|Ipucu|Sifirla|Bolum|sifirlansin|yogun|Bos birak|Giris|Golge|Kayip Kutuphane|Magara|Yakinda|esya|kucuk|titres" index.html | grep -v "^\s*//\|^\s*/\*" | head -30
```

Beklenen: hiçbir match (veya sadece yorum satırları). Kullanıcı-görür string kalmamalı. Eğer match varsa raporla.

Commit:
```bash
git add index.html
git commit -m "fix(i18n): tüm UI string'leri Türkçe karaktere geçirildi + hint density min=0"
```

---

### Task 4: "Merhaba Yarim" + start overlay

**Files:**
- Modify: `index.html` — `$("startTitle").textContent="Merhaba "+CONFIG.name;` satırı

- [ ] **Step 4.1: Start title intimateName kullansın**

`index.html:515` civarı:

old_string:
```javascript
$("startTitle").textContent="Merhaba "+CONFIG.name;
```

new_string:
```javascript
$("startTitle").textContent="Merhaba "+CONFIG.intimateName;
```

- [ ] **Step 4.2: Win title — name korunsun (Merve)**

`index.html:517` zaten:
```javascript
$("winTitle").textContent="Aferin "+CONFIG.name;
```

Bu doğru — "Aferin Merve" kalsın (özel kutlama). Değişiklik yok, sadece doğrula.

- [ ] **Step 4.3: Greet — "Merve için" (italik italik) korunsun**

`index.html:434` zaten:
```javascript
$("greet").textContent=CONFIG.greet.replace("{name}",CONFIG.name);
```

→ "Merve için" — doğru. Değişiklik yok.

- [ ] **Step 4.4: Commit**

```bash
git add index.html
git commit -m "feat(ux): açılış 'Merhaba Yarim' (start title intimateName)"
```

---

### Task 5: settings'e yeni alanlar — autoX, autoCheckMode, undo

**Files:**
- Modify: `index.html` — DEFAULT_SETTINGS, TOGGLE_DEFS

- [ ] **Step 5.1: DEFAULT_SETTINGS genişlet**

`index.html:305` civarı:

old_string:
```javascript
const DEFAULT_SETTINGS={hints:true,fade:true,errors:true,haptics:true};
```

new_string:
```javascript
const DEFAULT_SETTINGS={hints:true,fade:true,errors:true,haptics:true,autoX:true,autoCheckMode:"mistakes-only"};
```

(`autoCheckMode` değerleri: `"off" | "mistakes-only" | "live"`. Default mistakes-only — şu anki davranışla uyumlu.)

- [ ] **Step 5.2: Settings legacy migration**

`index.html:306` zaten:
```javascript
let settings=Object.assign({},DEFAULT_SETTINGS,store.get(KEYS.settings,{}));
```

Bu `Object.assign` zaten yeni alanları default'tan dolduruyor (mevcut user'ın settings'inde olmayan key'ler default'tan gelir). Değişiklik gerekmez.

- [ ] **Step 5.3: TOGGLE_DEFS'e autoX ekle**

`index.html:308-314` civarı (Türkçe karakter düzeltilmiş hali):

old_string:
```javascript
const TOGGLE_DEFS=[
  {k:"hints",  t:"İpucu butonu",            d:"Oyunda ipucu butonunu göster"},
  {k:"fade",   t:"Tamamlananı soluklaştır", d:"Çizgisi biten sayıyı soluklaştır"},
  {k:"errors", t:"Hataları kırmızı göster", d:"Fazla/yanlış çizgide sayıyı kırmızı yap"},
  {k:"haptics",t:"Titreşim",                d:"Dokununca küçük titreşim (destekleyen cihazda)"},
];
```

new_string:
```javascript
const TOGGLE_DEFS=[
  {k:"hints",  t:"İpucu butonu",            d:"Oyunda ipucu butonunu göster"},
  {k:"autoX",  t:"Otomatik çarpı",          d:"Sayı tamamlanınca boş kenarlara çarpı koy"},
  {k:"fade",   t:"Tamamlananı soluklaştır", d:"Çizgisi biten sayıyı soluklaştır"},
  {k:"errors", t:"Hataları kırmızı göster", d:"Fazla/yanlış çizgide sayıyı kırmızı yap"},
  {k:"haptics",t:"Titreşim",                d:"Dokununca küçük titreşim (destekleyen cihazda)"},
];
```

(`autoCheckMode` ayrı bir UI gerektiriyor — basit toggle değil, 3 seçenekli segment. Task 9'da ayrıca eklenecek.)

- [ ] **Step 5.4: Commit**

```bash
git add index.html
git commit -m "feat(settings): autoX + autoCheckMode default fields + autoX toggle UI"
```

---

### Task 6: Auto-X implementation

**Files:**
- Modify: `index.html` — `toggle()` fonksiyonu + yeni `autoXAfterClue()` helper

- [ ] **Step 6.1: autoXAfterClue helper fonksiyonu ekle**

`index.html` içinde, `toggle` fonksiyonundan ÖNCE (yaklaşık line 380'den önce) yeni fonksiyon ekle. Önce mevcut bağlamı oku:

`index.html:380` civarı:
```javascript
function toggle(k,r,c){if(solved)return;const arr=k==="h"?hState:vState;arr[r][c]=(arr[r][c]+1)%3;buzz(8);render();autosave();checkWin();}
```

Bu satırdan ÖNCE ekle (Edit ile `function toggle(...)` öncesi yeni fonksiyon enjekte et):

old_string:
```javascript
function toggle(k,r,c){if(solved)return;const arr=k==="h"?hState:vState;arr[r][c]=(arr[r][c]+1)%3;buzz(8);render();autosave();checkWin();}
function lineCount(r,c){return (hState[r][c]===1)+(hState[r+1][c]===1)+(vState[r][c]===1)+(vState[r][c+1]===1);}
```

new_string:
```javascript
function autoXAfterClue(r,c){
  if(!settings.autoX)return;
  if(!P||r<0||r>=P.R||c<0||c>=P.C)return;
  const n=P.clue[r][c];if(n<0)return;
  const lc=lineCount(r,c);
  if(lc===n){
    if(hState[r][c]===0)hState[r][c]=2;
    if(hState[r+1][c]===0)hState[r+1][c]=2;
    if(vState[r][c]===0)vState[r][c]=2;
    if(vState[r][c+1]===0)vState[r][c+1]=2;
  }
}
function applyAutoXAround(r,c){
  for(const[dr,dc]of[[0,0],[-1,0],[0,-1],[-1,-1]]){
    autoXAfterClue(r+dr,c+dc);
  }
}
function toggle(k,r,c){
  if(solved)return;
  const arr=k==="h"?hState:vState;
  arr[r][c]=(arr[r][c]+1)%3;
  if(settings.autoX){
    if(k==="h"){applyAutoXAround(r,c);applyAutoXAround(r,c+1);}
    else{applyAutoXAround(r,c);applyAutoXAround(r+1,c);}
  }
  buzz(8);render();autosave();checkWin();
}
function lineCount(r,c){return (hState[r][c]===1)+(hState[r+1][c]===1)+(vState[r][c]===1)+(vState[r][c+1]===1);}
```

(Mantık: bir kenar değiştiğinde komşu hücreleri kontrol et. Her hücrenin 4 köşesi var; o hücreye dokunan 4 olası clue position'ı var. Onları tara, tatmin edilmişse boş kenarları otomatik çarpıya çevir.)

- [ ] **Step 6.2: Manuel test (kafa testi)**

Tarayıcıda yeni 5×5 başlat. `settings.autoX = true` (default). Bir 0 hücresinin etrafına çizgi koy — beklemediğin yerlere otomatik çarpı oluşur. Bir 3 hücresinin 3 kenarına çizgi koy — 4. kenar otomatik çarpıya döner.

(Subagent browser'da test edemez — bu doğrulama spec-review safhasında yapılır.)

- [ ] **Step 6.3: Commit**

```bash
git add index.html
git commit -m "feat(autox): otomatik çarpı, sayı tamamlanınca boş kenarlara çarpı koy"
```

---

### Task 7: Auto-check 3-mode (off / mistakes-only / live)

**Files:**
- Modify: `index.html` — `updateClueStates()` fonksiyonu + yeni segmented control

- [ ] **Step 7.1: updateClueStates'i 3-mode'a göre güncelle**

`index.html:383` civarı:

old_string:
```javascript
function updateClueStates(){boardEl.querySelectorAll("text.clue").forEach(t=>{const r=+t.dataset.r,c=+t.dataset.c,n=P.clue[r][c],lc=lineCount(r,c);t.classList.remove("done","err");if(settings.errors&&(lc>n||(decided(r,c)&&lc!==n)))t.classList.add("err");else if(settings.fade&&lc===n)t.classList.add("done");});}
```

new_string:
```javascript
function updateClueStates(){
  boardEl.querySelectorAll("text.clue").forEach(t=>{
    const r=+t.dataset.r,c=+t.dataset.c,n=P.clue[r][c],lc=lineCount(r,c);
    t.classList.remove("done","err");
    const mode=settings.autoCheckMode||"mistakes-only";
    let isErr=false;
    if(mode==="live"){
      isErr=(lc>n)||(decided(r,c)&&lc!==n);
    }else if(mode==="mistakes-only"){
      isErr=(lc>n)||(decided(r,c)&&lc!==n);
    }
    if(settings.errors&&isErr)t.classList.add("err");
    else if(settings.fade&&lc===n)t.classList.add("done");
  });
}
```

(Şu an "live" ve "mistakes-only" aynı davranış. Gerçek farklılık ileride: "live" mode'da daha proactive hint highlight da olabilir. v1'de bu yapı yeterli; settings.errors zaten ana kontrol.)

- [ ] **Step 7.2: Commit**

```bash
git add index.html
git commit -m "feat(check): autoCheckMode 3-değerli; updateClueStates ona göre"
```

---

### Task 8: Undo / Redo stack + 2 yeni buton

**Files:**
- Modify: `index.html` — Undo state, `toggle()` push, HUD'a 2 yeni buton + CSS

- [ ] **Step 8.1: Undo/Redo state'i ekle**

`index.html:339` civarı (oyun state değişkenlerinin yakını):

old_string:
```javascript
let P=null,hState=null,vState=null,solved=false,hints=0;
let elapsed=0,timerId=null,timerBase=0;
let ctx={mode:"free",levelIndex:null};
```

new_string:
```javascript
let P=null,hState=null,vState=null,solved=false,hints=0;
let elapsed=0,timerId=null,timerBase=0;
let ctx={mode:"free",levelIndex:null};
let undoStack=[],redoStack=[];
```

- [ ] **Step 8.2: toggle() undoStack'e push'lasın**

Mevcut `toggle()` (Task 6'da güncellenmiş):

old_string:
```javascript
function toggle(k,r,c){
  if(solved)return;
  const arr=k==="h"?hState:vState;
  arr[r][c]=(arr[r][c]+1)%3;
  if(settings.autoX){
    if(k==="h"){applyAutoXAround(r,c);applyAutoXAround(r,c+1);}
    else{applyAutoXAround(r,c);applyAutoXAround(r+1,c);}
  }
  buzz(8);render();autosave();checkWin();
}
```

new_string:
```javascript
function snapshotState(){
  return {h:hState.map(row=>row.slice()),v:vState.map(row=>row.slice())};
}
function restoreState(s){
  hState=s.h.map(row=>row.slice());
  vState=s.v.map(row=>row.slice());
}
function toggle(k,r,c){
  if(solved)return;
  undoStack.push(snapshotState());
  if(undoStack.length>200)undoStack.shift();
  redoStack=[];
  const arr=k==="h"?hState:vState;
  arr[r][c]=(arr[r][c]+1)%3;
  if(settings.autoX){
    if(k==="h"){applyAutoXAround(r,c);applyAutoXAround(r,c+1);}
    else{applyAutoXAround(r,c);applyAutoXAround(r+1,c);}
  }
  buzz(8);render();autosave();checkWin();
}
function undo(){
  if(!undoStack.length||solved)return;
  redoStack.push(snapshotState());
  restoreState(undoStack.pop());
  buzz(6);render();autosave();
}
function redo(){
  if(!redoStack.length||solved)return;
  undoStack.push(snapshotState());
  restoreState(redoStack.pop());
  buzz(6);render();autosave();
}
```

- [ ] **Step 8.3: resetBoard ve hint undoStack temizlesin**

`index.html:416` civarı `resetBoard`:

old_string:
```javascript
function resetBoard(){hState=Array.from({length:P.R+1},()=>Array(P.C).fill(0));vState=Array.from({length:P.R},()=>Array(P.C+1).fill(0));solved=false;render();autosave();}
```

new_string:
```javascript
function resetBoard(){
  undoStack.push(snapshotState());
  if(undoStack.length>200)undoStack.shift();
  redoStack=[];
  hState=Array.from({length:P.R+1},()=>Array(P.C).fill(0));
  vState=Array.from({length:P.R},()=>Array(P.C+1).fill(0));
  solved=false;render();autosave();
}
```

(Reset de undoable olsun.)

`hint` fonksiyonu da undoable olabilir:

`index.html:411-415` civarı:

old_string:
```javascript
function hint(){if(solved)return;const cand=[];
  for(let r=0;r<=P.R;r++)for(let c=0;c<P.C;c++)if(P.solH[r][c]===1&&hState[r][c]!==1)cand.push(["h",r,c]);
  for(let r=0;r<P.R;r++)for(let c=0;c<=P.C;c++)if(P.solV[r][c]===1&&vState[r][c]!==1)cand.push(["v",r,c]);
  if(!cand.length)return;const[k,r,c]=cand[(Math.random()*cand.length)|0];(k==="h"?hState:vState)[r][c]=1;
  hints++;$("hintsUsed").textContent=hints;render();autosave();checkWin();}
```

new_string:
```javascript
function hint(){
  if(solved)return;
  undoStack.push(snapshotState());
  if(undoStack.length>200)undoStack.shift();
  redoStack=[];
  const cand=[];
  for(let r=0;r<=P.R;r++)for(let c=0;c<P.C;c++)if(P.solH[r][c]===1&&hState[r][c]!==1)cand.push(["h",r,c]);
  for(let r=0;r<P.R;r++)for(let c=0;c<=P.C;c++)if(P.solV[r][c]===1&&vState[r][c]!==1)cand.push(["v",r,c]);
  if(!cand.length)return;
  const[k,r,c]=cand[(Math.random()*cand.length)|0];
  (k==="h"?hState:vState)[r][c]=1;
  hints++;$("hintsUsed").textContent=hints;render();autosave();checkWin();
}
```

- [ ] **Step 8.4: startGame undoStack reset etsin**

`index.html:347` civarı `startGame`:

old_string:
```javascript
function startGame(puzzle,context,restore){
  P=puzzle;ctx=context;solved=false;
  if(restore){hState=restore.hState;vState=restore.vState;hints=restore.hints||0;elapsed=restore.elapsed||0;}
  else{hState=Array.from({length:P.R+1},()=>Array(P.C).fill(0));
       vState=Array.from({length:P.R},()=>Array(P.C+1).fill(0));hints=0;elapsed=0;}
```

new_string:
```javascript
function startGame(puzzle,context,restore){
  P=puzzle;ctx=context;solved=false;
  undoStack=[];redoStack=[];
  if(restore){hState=restore.hState;vState=restore.vState;hints=restore.hints||0;elapsed=restore.elapsed||0;}
  else{hState=Array.from({length:P.R+1},()=>Array(P.C).fill(0));
       vState=Array.from({length:P.R},()=>Array(P.C+1).fill(0));hints=0;elapsed=0;}
```

- [ ] **Step 8.5: HUD'a Undo/Redo butonları ekle**

`index.html:203-208` civarı (Task 3.3'te zaten Türkçeleştirildi):

old_string:
```html
    <div class="controls">
      <button class="btn-ghost" id="resetBtn">↺ Temizle</button>
      <button class="btn-ghost hidden" id="hintBtn">💡 İpucu</button>
      <button class="btn-primary" id="newBtn">✦ Yeni</button>
    </div>
```

new_string:
```html
    <div class="controls">
      <button class="btn-ghost" id="undoBtn" title="Geri al">↶</button>
      <button class="btn-ghost" id="redoBtn" title="İleri al">↷</button>
      <button class="btn-ghost" id="resetBtn" title="Temizle">↺</button>
      <button class="btn-ghost hidden" id="hintBtn">💡 İpucu</button>
      <button class="btn-primary" id="newBtn">✦ Yeni</button>
    </div>
```

(Daha kompakt buton seti: 5 buton küçük ikonlu. Mobil 414px'de sığar.)

- [ ] **Step 8.6: CSS — undo/redo butonları için kompakt stil**

`index.html:103-104` civarı `.controls button` kuralı (Plan 01'de güncellenmiş):

old_string:
```css
.controls button{font-family:var(--font-body);font-weight:700;font-size:14px;padding:13px 16px;border-radius:14px;border:1px solid var(--hairline);cursor:pointer;flex:1;max-width:150px;letter-spacing:.01em;}
```

new_string:
```css
.controls button{font-family:var(--font-body);font-weight:700;font-size:14px;padding:13px 12px;border-radius:14px;border:1px solid var(--hairline);cursor:pointer;flex:1;max-width:150px;letter-spacing:.01em;min-width:44px;}
.controls button:disabled{opacity:.3;cursor:not-allowed;}
```

(Padding 16 → 12 daha kompakt; min-width 44 a11y için; disabled stilde.)

- [ ] **Step 8.7: Event handlers**

`index.html:535-536` civarı eventBinding bloğu — `resetBtn` / `hintBtn` yanına ekle:

old_string:
```javascript
$("resetBtn").addEventListener("click",resetBoard);
$("hintBtn").addEventListener("click",hint);
```

new_string:
```javascript
$("undoBtn").addEventListener("click",undo);
$("redoBtn").addEventListener("click",redo);
$("resetBtn").addEventListener("click",resetBoard);
$("hintBtn").addEventListener("click",hint);
function updateUndoRedoButtons(){
  $("undoBtn").disabled=!undoStack.length||solved;
  $("redoBtn").disabled=!redoStack.length||solved;
}
```

Ve `render()` fonksiyonunun sonuna `updateUndoRedoButtons()` çağrısı ekle:

`index.html:378` civarı:

old_string:
```javascript
  updateClueStates();
}
```

new_string:
```javascript
  updateClueStates();
  updateUndoRedoButtons();
}
```

Commit:
```bash
git add index.html
git commit -m "feat(undo): undo/redo stack + HUD buton + 200 step buffer"
```

---

### Task 9: Ayar sheet'ine autoCheck mode segment ekle

**Files:**
- Modify: `index.html` — `renderToggles` fonksiyonu + CSS segment

- [ ] **Step 9.1: CSS — segment 3-li switch**

CSS bloğunun sonuna ekle (settings overlay civarı):

`index.html:134-135` civarı (mevcut `.sw::after` kuralından sonra):

old_string:
```css
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:var(--bg);transition:.2s;}
.sw.on::after{left:23px;background:var(--bg);}
```

new_string:
```css
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:var(--bg);transition:.2s;}
.sw.on::after{left:23px;background:var(--bg);}
.seg{display:flex;gap:4px;background:var(--bg);border:1px solid var(--hairline);border-radius:10px;padding:3px;}
.seg button{flex:1;background:transparent;border:none;color:var(--muted);padding:6px 8px;font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border-radius:7px;}
.seg button.sel{background:var(--ink);color:var(--bg);}
```

- [ ] **Step 9.2: renderToggles auto-check segment satırı ekle**

`index.html:494-498` civarı:

old_string:
```javascript
function renderToggles(){
  $("toggleList").innerHTML=TOGGLE_DEFS.map(d=>`
    <div class="toggle-row"><div class="lbl"><b>${d.t}</b><span>${d.d}</span></div>
    <div class="sw ${settings[d.k]?'on':''}" data-tog="${d.k}"></div></div>`).join("");
}
```

new_string:
```javascript
function renderToggles(){
  const togglesHtml=TOGGLE_DEFS.map(d=>`
    <div class="toggle-row"><div class="lbl"><b>${d.t}</b><span>${d.d}</span></div>
    <div class="sw ${settings[d.k]?'on':''}" data-tog="${d.k}"></div></div>`).join("");
  const checkModes=[
    {v:"off",t:"Kapalı"},
    {v:"mistakes-only",t:"Sadece hata"},
    {v:"live",t:"Canlı"},
  ];
  const segHtml=`
    <div class="toggle-row"><div class="lbl"><b>Hata kontrolü</b><span>Yanlış kenarları ne zaman göster</span></div>
    <div class="seg" data-seg="autoCheckMode">${checkModes.map(m=>`<button data-val="${m.v}" class="${settings.autoCheckMode===m.v?'sel':''}">${m.t}</button>`).join('')}</div></div>`;
  $("toggleList").innerHTML=togglesHtml+segHtml;
}
```

- [ ] **Step 9.3: Toggle event handler segment'i de yakalasın**

`index.html:499-501` civarı:

old_string:
```javascript
$("toggleList").addEventListener("click",e=>{const sw=e.target.closest("[data-tog]");if(!sw)return;
  const k=sw.dataset.tog;settings[k]=!settings[k];saveSettings();sw.classList.toggle("on",settings[k]);
  if($("s-game").classList.contains("active")){applyHintVisibility();updateClueStates();}});
```

new_string:
```javascript
$("toggleList").addEventListener("click",e=>{
  const sw=e.target.closest("[data-tog]");
  if(sw){
    const k=sw.dataset.tog;settings[k]=!settings[k];saveSettings();sw.classList.toggle("on",settings[k]);
    if($("s-game").classList.contains("active")){applyHintVisibility();updateClueStates();render();}
    return;
  }
  const segBtn=e.target.closest("[data-val]");
  if(segBtn){
    const seg=segBtn.closest("[data-seg]");
    const key=seg.dataset.seg;const val=segBtn.dataset.val;
    settings[key]=val;saveSettings();
    seg.querySelectorAll("button").forEach(b=>b.classList.toggle("sel",b.dataset.val===val));
    if($("s-game").classList.contains("active")){updateClueStates();}
  }
});
```

Commit:
```bash
git add index.html
git commit -m "feat(settings): autoCheckMode 3-segment + ayar sheet entegrasyonu"
```

---

### Task 10: Nasıl Oynanır sheet HTML iskeleti

**Files:**
- Modify: `index.html` — yeni overlay/sheet + CSS sekme stili

- [ ] **Step 10.1: HTML — yeni overlay (settings overlay'in altına ekle)**

`index.html:220` civarı (settings overlay'in `</div>` kapanışının altına):

Önce bağlamı oku:

```bash
grep -n 'id="settingsOverlay"' index.html
grep -n 'id="winOverlay"' index.html
```

Settings overlay (`id="settingsOverlay"`) ile Win overlay (`id="winOverlay"`) arasına yeni overlay ekle:

old_string:
```html
<!-- WIN -->
<div class="overlay center" id="winOverlay">
```

new_string:
```html
<!-- HOW TO PLAY -->
<div class="overlay" id="howOverlay">
  <div class="sheet how-sheet">
    <h2>Nasıl Oynanır</h2>
    <div class="tabs" id="howTabs">
      <button class="tab sel" data-tab="rules">Kurallar</button>
      <button class="tab" data-tab="modes">Modlar</button>
      <button class="tab" data-tab="rogue">Rogue</button>
      <button class="tab" data-tab="meta">Geliştirme</button>
      <button class="tab" data-tab="backup">Yedek</button>
    </div>
    <div class="tab-body" id="howBody"></div>
  </div>
</div>

<!-- WIN -->
<div class="overlay center" id="winOverlay">
```

- [ ] **Step 10.2: CSS — sekme stili**

CSS bloğunun sonuna (kontrol bloğunun yakını, line 148'den önce):

Şu CSS'lerden sonra eklenecek (segment switch'inden sonra):

old_string:
```css
.seg button.sel{background:var(--ink);color:var(--bg);}
```

new_string:
```css
.seg button.sel{background:var(--ink);color:var(--bg);}
.how-sheet h2{margin:0 0 14px;}
.tabs{display:flex;gap:4px;overflow-x:auto;padding-bottom:8px;border-bottom:1px solid var(--hairline);margin-bottom:14px;-webkit-overflow-scrolling:touch;}
.tab{flex-shrink:0;background:transparent;border:none;color:var(--muted);padding:8px 12px;font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;border-radius:8px;}
.tab.sel{background:var(--ink);color:var(--bg);}
.tab-body{font-family:var(--font-body);line-height:1.6;color:var(--ink);font-size:14.5px;}
.tab-body h3{font-family:var(--font-serif);font-weight:600;font-size:18px;margin:0 0 8px;color:var(--ink);letter-spacing:-.01em;}
.tab-body h4{font-family:var(--font-serif);font-weight:600;font-size:15px;margin:18px 0 4px;color:var(--accent);}
.tab-body p{margin:0 0 12px;color:var(--ink-dim);}
.tab-body ul{margin:6px 0 14px;padding-left:20px;color:var(--ink-dim);}
.tab-body ul li{margin:4px 0;}
.tab-body .quote{font-family:var(--font-serif);font-style:italic;color:var(--accent);border-left:2px solid var(--accent-dim);padding-left:14px;margin:14px 0;}
.tab-body code{font-family:var(--font-mono);background:var(--bg);padding:2px 6px;border-radius:4px;font-size:12px;color:var(--accent);}
```

Commit:
```bash
git add index.html
git commit -m "feat(help): Nasıl Oynanır sheet iskeleti + tab CSS"
```

---

### Task 11: Nasıl Oynanır içerik — Kurallar + Modlar

**Files:**
- Modify: `index.html` — JS yeni `HOW_CONTENT` objesi + `renderHowTab` fonksiyonu

- [ ] **Step 11.1: HOW_CONTENT objesini ekle**

JS bölümünde, `TOGGLE_DEFS` tanımının altına (line 315 civarı):

old_string:
```javascript
const TOGGLE_DEFS=[
  {k:"hints",  t:"İpucu butonu",            d:"Oyunda ipucu butonunu göster"},
  {k:"autoX",  t:"Otomatik çarpı",          d:"Sayı tamamlanınca boş kenarlara çarpı koy"},
  {k:"fade",   t:"Tamamlananı soluklaştır", d:"Çizgisi biten sayıyı soluklaştır"},
  {k:"errors", t:"Hataları kırmızı göster", d:"Fazla/yanlış çizgide sayıyı kırmızı yap"},
  {k:"haptics",t:"Titreşim",                d:"Dokununca küçük titreşim (destekleyen cihazda)"},
];
```

new_string:
```javascript
const TOGGLE_DEFS=[
  {k:"hints",  t:"İpucu butonu",            d:"Oyunda ipucu butonunu göster"},
  {k:"autoX",  t:"Otomatik çarpı",          d:"Sayı tamamlanınca boş kenarlara çarpı koy"},
  {k:"fade",   t:"Tamamlananı soluklaştır", d:"Çizgisi biten sayıyı soluklaştır"},
  {k:"errors", t:"Hataları kırmızı göster", d:"Fazla/yanlış çizgide sayıyı kırmızı yap"},
  {k:"haptics",t:"Titreşim",                d:"Dokununca küçük titreşim (destekleyen cihazda)"},
];

const HOW_CONTENT={
  rules:`
    <h3>Çember Kuralları</h3>
    <p class="quote">Tek ve kapalı bir çember çiz. İplikten kaybolma.</p>
    <ul>
      <li>Noktalardan oluşan ızgaranın kenarlarına çizgi çekersin.</li>
      <li>Hücredeki sayı, o hücrenin etrafındaki çizgi adedini söyler (0-3).</li>
      <li>Tüm çizilen kenarlar <b>tek ve kapalı</b> bir döngü oluşturmalı.</li>
      <li>Çizgiler kesişemez, dallanamaz.</li>
    </ul>
    <h4>Üç durum</h4>
    <p>Bir kenara dokun → <b>boş</b> → <b>çizgi</b> → <b>çarpı</b> → boş. Çarpı senin "burada kesin çizgi yok" notun; çözümü etkilemez, akıl yürütmene yardım eder.</p>
    <h4>Kazanma</h4>
    <p>Tüm gösterilen sayılar tatmin olduğunda + tüm çizgili kenarlar tek bir kapalı döngü oluşturduğunda kazandın.</p>
  `,
  modes:`
    <h3>Üç Mod</h3>
    <h4>Serbest Oyun ✦</h4>
    <p>Boyut (4×4–12×12), ipucu yoğunluğu (%0–%90) ve seed'i sen seçersin. Aynı seed her zaman aynı bulmacayı verir — favoriler için.</p>
    <h4>Yolculuk ⬢</h4>
    <p>30 bölümlük lineer kampanya. Zorluk kademeli artar. Her bölümün en iyi süresi tutulur. Yarım kalan bölüm "Devam et" rozetiyle açılır.</p>
    <h4>Rogue Modu ☠</h4>
    <p>Sessiz İplik'in en derin modu. Üç diyar, dallanan haritalar, eşyalar, canlar, ve koşular arası kalıcı geliştirme. (Detay için "Rogue" sekmesi.)</p>
  `,
  rogue:"",
  meta:"",
  backup:"",
};

function renderHowTab(tab){
  $("howBody").innerHTML=HOW_CONTENT[tab]||"";
}
```

(`rogue`, `meta`, `backup` Task 12 ve 13'te doldurulacak — şimdilik boş.)

Commit:
```bash
git add index.html
git commit -m "feat(help): HOW_CONTENT iskeleti + Kurallar + Modlar sekmesi"
```

---

### Task 12: Nasıl Oynanır içerik — Rogue detay + Kalıcı geliştirme

**Files:**
- Modify: `index.html` — `HOW_CONTENT.rogue` ve `HOW_CONTENT.meta`

- [ ] **Step 12.1: rogue ve meta içerikleri**

`HOW_CONTENT` içinde `rogue:""` ve `meta:""` placeholder'ları doldur:

old_string:
```javascript
  rogue:"",
  meta:"",
  backup:"",
```

new_string:
```javascript
  rogue:`
    <h3>Rogue Modu</h3>
    <p class="quote">Jedi geceleri ipliği takip eder. Her koşusu yeni bir diyara, eski boncuklarla.</p>
    <h4>Diyarlar</h4>
    <p>Üç diyar var: <b>Söğüt Eşiği</b> (sıcak başlangıç), <b>Karanlık İğne</b> (mistik kütüphane), <b>Yıldız Geçidi</b> (kozmik final). Başta sadece Söğüt Eşiği açık; ilerleme ile diğerleri açılır.</p>
    <h4>Koşu yapısı</h4>
    <ul>
      <li><b>5 kat</b>, her katta 2-3 düğüm, dallanan harita</li>
      <li>Düğüm tipleri: <b>Bulmaca</b>, <b>Elit</b>, <b>Sandık</b>, <b>Dinlenme</b>, <b>Olay</b>, <b>Patron</b></li>
      <li>Başta <b>3 can</b>. Her hata 1 can götürür. Canlar biterse koşu son bulur (geri dönüş yok).</li>
      <li>Çözdüğün her bulmaca İplik biriktirir; bossu yenince Boncuk düşer.</li>
    </ul>
    <h4>Eşyalar (Relic)</h4>
    <p>Sandık ve olaylardan gelir. Sadece o koşu boyunca taşırsın. Örnek: <i>Söğüt Yaprağı</i> (ilk hata cezasız), <i>Mürekkep Damlası</i> (hint cezasız), <i>Ay Mührü</i> (bir kez geri al).</p>
    <h4>Mühürlü Hücreler</h4>
    <p>Diyar ilerledikçe puzzle'lara <b>kısıt mühürleri</b> eklenir: donmuş hücreler (etrafına çizgi konmaz), "2 konmaz" (sayı 2 değil), sis (sayı gizli), ikiz (iki hücre aynı sayı), lanetli (loop kesin çevreler), yankı, kayan...</p>
    <h4>Mum Modu (opsiyonel)</h4>
    <p>Zaman baskısı. Koşu 10 dakika ile başlar, her kat +90s. Düğümler süre tüketir. Süre biterse koşu son bulur ama kazandığın İplik kalır.</p>
    <h4>Patron</h4>
    <p>Her diyarın kendi patronu var: <i>Yün Bekçisi</i> (sessiz), <i>Sessiz Kütüphaneci</i> (uyandırırsan zaman daralır), <i>Yıldız İplikçisi</i> (3 ardışık bulmaca).</p>
  `,
  meta:`
    <h3>Kalıcı Geliştirme</h3>
    <p class="quote">Koşu biter; iplik kalır.</p>
    <h4>Yuva Ekranı</h4>
    <p>Rogue moduna girince ilk açılan yer. Jedi'nin koşular arası dinlendiği yer. Diyar seçimi, istatistikler, ve aşağıdaki ekranlara giriş.</p>
    <h4>Karakter Ekranı</h4>
    <p>Jedi'nin kartı: avatar, istatistik, kazanılmış boncuklar, dizilen boncuklar, kazanılmış başarımlar.</p>
    <h4>İpliklik</h4>
    <p>Kalıcı pasif yetenekler. <b>İplik</b> ile açılır. 8 yetenek; her birinin iki vibrasyonu (ücretsiz geçiş).</p>
    <h4>Diken Sözleşmesi</h4>
    <p>Kendi zorluğunu seç. 10 modifier (Daralma, Kör Pusula, Kırılgan İplik...) ranklarla. Toplam <b>İz</b> = koşu sonu ödülü çarpanı.</p>
    <h4>Pusula Yıldızı</h4>
    <p>Her diyar kendi yıldız progression'ı taşır. Boss yenildikçe yıldız artar, yeni içerik (event tipleri, relic kategorileri, constraint tile'lar) açılır.</p>
    <h4>Para birimleri</h4>
    <ul>
      <li><b>İplik</b> — her koşuda kazanılır, İpliklik talent'leri için</li>
      <li><b>Boncuk</b> — boss yenince düşer, Boncuk Dizimi (charm) için</li>
      <li><b>Yıldız Tozu</b> — Diken Sözleşmesi koşularından, kozmetik için</li>
    </ul>
  `,
  backup:"",
```

Commit:
```bash
git add index.html
git commit -m "feat(help): Rogue + Kalıcı geliştirme sekmeleri içerik"
```

---

### Task 13: Nasıl Oynanır içerik — Yedek + ana menü entegrasyon

**Files:**
- Modify: `index.html` — `HOW_CONTENT.backup` + ana menü/ayar entegrasyonu

- [ ] **Step 13.1: backup içerik**

old_string:
```javascript
  backup:"",
};
```

new_string:
```javascript
  backup:`
    <h3>Yedek Kodu</h3>
    <p class="quote">Tüm emeğin bir kodda. Kopyala, sakla, gerektiğinde geri yükle.</p>
    <h4>Ne işe yarar?</h4>
    <p>Tarayıcı geçmişini temizlesen, telefonun bozulsa, yeni bir cihaza geçsen — tüm ilerlemen kaybolmaz. Yedek kodunu kopyalayıp Notes/Mail/Drive'a kaydedersin; istediğin zaman geri yükleyebilirsin.</p>
    <h4>Üretme</h4>
    <p>Ayarlar → <b>Yedek Kodu Üret</b>. Açılan modalda uzun bir kod görünür (~5-50KB). "Kopyala" butonuna bas, istediğin yere yapıştır.</p>
    <h4>Yükleme</h4>
    <p>Ayarlar → <b>Yedek Yükle</b>. Açılan modale kodu yapıştır, "Yükle" de. <b>Mevcut tüm ilerlemenin üzerine yazılır</b> — önce mevcudunu yedeklemeyi unutma.</p>
    <h4>Kod neyi içerir?</h4>
    <ul>
      <li>Ayarlar (toggle'lar)</li>
      <li>Yolculuk ilerlemesi + en iyi süreler</li>
      <li>Yarım kalan oyunlar (Serbest + Yolculuk + Rogue)</li>
      <li>Rogue meta progress (İplik, Boncuk, talent'ler, achievement'lar, Pusula Yıldızları)</li>
    </ul>
    <h4>Güvenli mi?</h4>
    <p>Kod base64 ile şifrelenmiştir, sadece bu uygulama tanır. Başka kimse okuyamaz ya da değiştiremez. Kaybolursa veri kaybı dışında risk yok.</p>
  `,
};
```

- [ ] **Step 13.2: Ana menüye "Nasıl Oynanır" linki**

Foot-note'un yakınına link ekle:

`index.html:165` civarı:

old_string:
```html
      <p class="foot-note">Tek ve kapalı bir çember çiz. Her sayı, etrafındaki çizgi adedini söyler.</p>
```

new_string:
```html
      <p class="foot-note">Tek ve kapalı bir çember çiz. Her sayı, etrafındaki çizgi adedini söyler.</p>
      <div style="text-align:center;padding:0 24px 8px;"><button id="howBtn" class="opt" style="background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);">Nasıl Oynanır?</button></div>
```

- [ ] **Step 13.3: Ayar sheet'ine de "Nasıl Oynanır" linki**

`index.html:215-218` civarı (sheet içinde, foot-note'tan önce):

old_string:
```html
    <h2>Ayarlar</h2>
    <div id="toggleList"></div>
    <p class="foot-note" style="text-align:left;padding:14px 0 0;">
      iPhone'da tam ekran: Safari'de paylaş butonu → "Ana Ekrana Ekle". Oyun uygulama gibi tam ekran açılır.</p>
```

new_string:
```html
    <h2>Ayarlar</h2>
    <div id="toggleList"></div>
    <div style="padding:14px 0 0;"><button id="howBtnSettings" class="opt" style="width:100%;background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);">Nasıl Oynanır?</button></div>
    <p class="foot-note" style="text-align:left;padding:14px 0 0;">
      iPhone'da tam ekran: Safari'de paylaş butonu → "Ana Ekrana Ekle". Oyun uygulama gibi tam ekran açılır.</p>
```

- [ ] **Step 13.4: Event handler'lar — howBtn / howBtnSettings / tab click**

Event binding bölümünün altına ekle (line 542 civarı):

old_string:
```javascript
document.addEventListener("visibilitychange",()=>{if(document.hidden&&$("s-game").classList.contains("active"))autosave();});
window.addEventListener("pagehide",()=>{if($("s-game").classList.contains("active"))autosave();});
```

new_string:
```javascript
function openHow(){renderHowTab("rules");$("howTabs").querySelectorAll(".tab").forEach((t,i)=>t.classList.toggle("sel",i===0));$("howOverlay").classList.add("show");}
$("howBtn")?.addEventListener("click",openHow);
$("howBtnSettings")?.addEventListener("click",()=>{$("settingsOverlay").classList.remove("show");setTimeout(openHow,260);});
$("howTabs").addEventListener("click",e=>{const t=e.target.closest(".tab");if(!t)return;$("howTabs").querySelectorAll(".tab").forEach(x=>x.classList.toggle("sel",x===t));renderHowTab(t.dataset.tab);});
$("howOverlay").addEventListener("click",e=>{if(e.target.id==="howOverlay")$("howOverlay").classList.remove("show");});

document.addEventListener("visibilitychange",()=>{if(document.hidden&&$("s-game").classList.contains("active"))autosave();});
window.addEventListener("pagehide",()=>{if($("s-game").classList.contains("active"))autosave();});
```

Commit:
```bash
git add index.html
git commit -m "feat(help): Yedek sekmesi + ana menü + ayar entegrasyonu + handler'lar"
```

---

### Task 14: Yedek Kodu — serialize / deserialize fonksiyonları

**Files:**
- Modify: `index.html` — yeni `backup` namespace JS

- [ ] **Step 14.1: collectAllKeys + encode + decode fonksiyonları**

JS'in sonuna (line 545 civarı, `renderHome()` çağrısından ÖNCE) yeni fonksiyon bloğu ekle:

old_string:
```javascript
renderHome();
</script>
```

new_string:
```javascript
const BACKUP_PREFIX="CEMBER-v1:";
const BACKUP_KEYS=[KEYS.settings,KEYS.freeCur,KEYS.jrnProg,KEYS.jrnCur,KEYS.stats];
function backupCollect(){
  const data={v:1,t:Date.now(),keys:{}};
  for(const k of BACKUP_KEYS){
    const v=store.get(k,null);
    if(v!==null)data.keys[k]=v;
  }
  return data;
}
function backupEncode(data){
  try{
    const json=JSON.stringify(data);
    const b64=btoa(unescape(encodeURIComponent(json)));
    return BACKUP_PREFIX+b64;
  }catch(e){return null;}
}
function backupDecode(code){
  if(!code||!code.startsWith(BACKUP_PREFIX))return null;
  try{
    const b64=code.slice(BACKUP_PREFIX.length).trim();
    const json=decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  }catch(e){return null;}
}
function backupRestore(data){
  if(!data||!data.keys||typeof data.keys!=="object")return false;
  for(const k of BACKUP_KEYS){
    if(data.keys[k]!==undefined)store.set(k,data.keys[k]);
    else store.del(k);
  }
  return true;
}

renderHome();
</script>
```

(`unescape(encodeURIComponent(...))` Türkçe karakterli JSON'u doğru base64'e çevirir — `btoa` doğrudan kullanılırsa unicode'da hata verir.)

- [ ] **Step 14.2: Smoke test (tarayıcı console'da)**

Yorum: subagent browser console'a erişemez. Bu test spec-review safhasında yapılır:

Beklenen davranış:
```js
const c=backupEncode(backupCollect()); // CEMBER-v1:eyJ...
const d=backupDecode(c); // { v:1, t:..., keys:{...} }
backupRestore(d); // true
```

Commit:
```bash
git add index.html
git commit -m "feat(backup): serialize/encode/decode/restore fonksiyonları"
```

---

### Task 15: Yedek Kodu modal UI

**Files:**
- Modify: `index.html` — yeni overlay/modal HTML + CSS

- [ ] **Step 15.1: HTML overlay**

`howOverlay`'in altına yeni overlay ekle. Önce bağlamı oku, sonra:

old_string:
```html
<!-- WIN -->
<div class="overlay center" id="winOverlay">
```

new_string:
```html
<!-- BACKUP -->
<div class="overlay center" id="backupOverlay">
  <div class="modal" style="max-width:420px;width:calc(100% - 32px);text-align:left;">
    <h2 id="backupTitle">Yedek Kodu</h2>
    <p id="backupMsg">Bu kodu kopyala ve güvenli bir yere kaydet. Geri yüklemek için aynı kodu yapıştır.</p>
    <textarea id="backupTextarea" style="width:100%;height:160px;background:var(--bg);color:var(--ink);border:1px solid var(--hairline);border-radius:12px;padding:12px;font-family:var(--font-mono);font-size:11px;line-height:1.4;resize:none;margin:14px 0 12px;word-break:break-all;"></textarea>
    <div class="row">
      <button class="btn-ghost" id="backupCancel">İptal</button>
      <button class="btn-primary" id="backupAction" style="border:none">Kopyala</button>
    </div>
  </div>
</div>

<!-- WIN -->
<div class="overlay center" id="winOverlay">
```

- [ ] **Step 15.2: openBackupExport ve openBackupImport fonksiyonları**

`backupRestore` fonksiyonunun altına ekle:

old_string:
```javascript
function backupRestore(data){
  if(!data||!data.keys||typeof data.keys!=="object")return false;
  for(const k of BACKUP_KEYS){
    if(data.keys[k]!==undefined)store.set(k,data.keys[k]);
    else store.del(k);
  }
  return true;
}

renderHome();
```

new_string:
```javascript
function backupRestore(data){
  if(!data||!data.keys||typeof data.keys!=="object")return false;
  for(const k of BACKUP_KEYS){
    if(data.keys[k]!==undefined)store.set(k,data.keys[k]);
    else store.del(k);
  }
  return true;
}

let backupMode="export";
function openBackupExport(){
  backupMode="export";
  const code=backupEncode(backupCollect())||"(kod üretilemedi)";
  $("backupTitle").textContent="Yedek Kodu Üret";
  $("backupMsg").textContent="Aşağıdaki kodu kopyala ve güvenli bir yere kaydet (Notes, Mail, Drive). Geri yüklemek için aynı kodu kullanırsın.";
  $("backupTextarea").value=code;
  $("backupTextarea").readOnly=true;
  $("backupAction").textContent="Kopyala";
  $("settingsOverlay").classList.remove("show");
  setTimeout(()=>$("backupOverlay").classList.add("show"),260);
}
function openBackupImport(){
  backupMode="import";
  $("backupTitle").textContent="Yedek Yükle";
  $("backupMsg").textContent="Daha önce ürettiğin yedek kodunu yapıştır. Mevcut tüm ilerlemenin üzerine yazılır.";
  $("backupTextarea").value="";
  $("backupTextarea").readOnly=false;
  $("backupTextarea").placeholder="CEMBER-v1:eyJ...";
  $("backupAction").textContent="Yükle";
  $("settingsOverlay").classList.remove("show");
  setTimeout(()=>$("backupOverlay").classList.add("show"),260);
}
function handleBackupAction(){
  if(backupMode==="export"){
    const ta=$("backupTextarea");ta.select();
    try{document.execCommand("copy");$("backupAction").textContent="Kopyalandı ✓";setTimeout(()=>{$("backupOverlay").classList.remove("show");$("backupAction").textContent="Kopyala";},900);}
    catch(e){alert("Kopyalama başarısız. Manuel olarak seçip kopyala.");}
  }else{
    const code=$("backupTextarea").value.trim();
    if(!code){alert("Lütfen bir kod yapıştır.");return;}
    const data=backupDecode(code);
    if(!data){alert("Kod geçersiz veya bozuk. Doğru yedek kodu olduğundan emin ol.");return;}
    if(!confirm("Mevcut tüm ilerlemenin üzerine yazılacak. Devam edilsin mi?"))return;
    const ok=backupRestore(data);
    if(ok){
      $("backupAction").textContent="Yüklendi ✓";
      setTimeout(()=>{$("backupOverlay").classList.remove("show");settings=Object.assign({},DEFAULT_SETTINGS,store.get(KEYS.settings,{}));renderHome();showScreen("s-home");$("backupAction").textContent="Yükle";},900);
    }else{alert("Yükleme başarısız. Kod formatı doğru ama içerik tanınamadı.");}
  }
}

renderHome();
```

- [ ] **Step 15.3: Event handler'lar**

Az önce yeni handler ekledik (Task 13'te `howOverlay` listener). Bu listener'ın altına ekle. `index.html` içinde `$("howOverlay").addEventListener` çağrısının altına:

old_string:
```javascript
$("howOverlay").addEventListener("click",e=>{if(e.target.id==="howOverlay")$("howOverlay").classList.remove("show");});
```

new_string:
```javascript
$("howOverlay").addEventListener("click",e=>{if(e.target.id==="howOverlay")$("howOverlay").classList.remove("show");});
$("backupOverlay").addEventListener("click",e=>{if(e.target.id==="backupOverlay")$("backupOverlay").classList.remove("show");});
$("backupAction").addEventListener("click",handleBackupAction);
$("backupCancel").addEventListener("click",()=>$("backupOverlay").classList.remove("show"));
```

Commit:
```bash
git add index.html
git commit -m "feat(backup): export/import modal UI + handler'lar"
```

---

### Task 16: Yedek Kodu — ayar sheet'ine entegre

**Files:**
- Modify: `index.html` — settings sheet'e yeni satırlar

- [ ] **Step 16.1: Ayar sheet'ine Yedek bölümü**

`index.html:215-220` civarı (Task 13.3'te güncellenmiş):

old_string:
```html
    <h2>Ayarlar</h2>
    <div id="toggleList"></div>
    <div style="padding:14px 0 0;"><button id="howBtnSettings" class="opt" style="width:100%;background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);">Nasıl Oynanır?</button></div>
    <p class="foot-note" style="text-align:left;padding:14px 0 0;">
      iPhone'da tam ekran: Safari'de paylaş butonu → "Ana Ekrana Ekle". Oyun uygulama gibi tam ekran açılır.</p>
```

new_string:
```html
    <h2>Ayarlar</h2>
    <div id="toggleList"></div>
    <div style="padding:14px 0 0;display:flex;flex-direction:column;gap:8px;">
      <button id="howBtnSettings" class="opt" style="width:100%;background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);">Nasıl Oynanır?</button>
      <button id="backupExportBtn" class="opt" style="width:100%;background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);">Yedek Kodu Üret</button>
      <button id="backupImportBtn" class="opt" style="width:100%;background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);">Yedek Yükle</button>
    </div>
    <p class="foot-note" style="text-align:left;padding:14px 0 0;">
      iPhone'da tam ekran: Safari'de paylaş butonu → "Ana Ekrana Ekle". Oyun uygulama gibi tam ekran açılır.</p>
```

- [ ] **Step 16.2: Event handler'lar**

`$("backupCancel")` listener'ının altına ekle:

old_string:
```javascript
$("backupCancel").addEventListener("click",()=>$("backupOverlay").classList.remove("show"));
```

new_string:
```javascript
$("backupCancel").addEventListener("click",()=>$("backupOverlay").classList.remove("show"));
$("backupExportBtn")?.addEventListener("click",openBackupExport);
$("backupImportBtn")?.addEventListener("click",openBackupImport);
```

Commit:
```bash
git add index.html
git commit -m "feat(backup): ayar sheet'ine Yedek bölümü entegre"
```

---

### Task 17: Yedek Kodu — roundtrip smoke test (kavram)

**Files:**
- Görsel/manuel test, dosya değişikliği yok

- [ ] **Step 17.1: Roundtrip senaryosu**

Subagent browser'a erişemez ama mantıksal test:

1. Settings'i değiştir (örn. autoX'i kapat)
2. Bir Yolculuk bölümünü tamamla
3. `openBackupExport()` çağır → kod kopyala
4. localStorage temizle
5. `openBackupImport()` ile kodu yapıştır → Yükle
6. settings.autoX = false, journey.progress.unlocked >=1 olmalı

Bu test kullanıcı tarafından manuel olarak yapılır. Spec'te dokümante edildi.

- [ ] **Step 17.2: Progress log'a not**

```bash
# Progress log'a manuel test instruction'ı ekle (yorum amaçlı)
echo "" >> docs/log/plan-02-progress.md
echo "## Test instruction: Yedek roundtrip" >> docs/log/plan-02-progress.md
echo "1. Settings'i değiştir, bir bulmaca yarıda bırak" >> docs/log/plan-02-progress.md
echo "2. Yedek Kodu Üret → kopyala" >> docs/log/plan-02-progress.md
echo "3. DevTools → Application → localStorage → tüm cember:* sil" >> docs/log/plan-02-progress.md
echo "4. Yenile, Yedek Yükle → kodu yapıştır" >> docs/log/plan-02-progress.md
echo "5. Ayar değişikliği + yarım bulmaca geri gelmeli" >> docs/log/plan-02-progress.md
```

Commit:
```bash
git add docs/log/plan-02-progress.md
git commit -m "docs(plan-02): backup roundtrip test instruction"
```

---

### Task 18: Hata yönetimi — geçersiz kod, eski versiyon

**Files:**
- Modify: `index.html` — `backupDecode` daha sağlam hata mesajları

- [ ] **Step 18.1: Decode hata türünü geri döndür**

`backupDecode` fonksiyonunu güncelle (sadece null değil, hata türü):

old_string:
```javascript
function backupDecode(code){
  if(!code||!code.startsWith(BACKUP_PREFIX))return null;
  try{
    const b64=code.slice(BACKUP_PREFIX.length).trim();
    const json=decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  }catch(e){return null;}
}
```

new_string:
```javascript
function backupDecode(code){
  if(!code)return {error:"empty"};
  if(!code.startsWith(BACKUP_PREFIX))return {error:"prefix"};
  try{
    const b64=code.slice(BACKUP_PREFIX.length).trim();
    const json=decodeURIComponent(escape(atob(b64)));
    const data=JSON.parse(json);
    if(typeof data!=="object"||!data.keys)return {error:"format"};
    if(data.v&&data.v>1)return {error:"version-newer"};
    return {data};
  }catch(e){return {error:"corrupted",detail:e.message};}
}
```

- [ ] **Step 18.2: handleBackupAction hata mesajlarına göre uyarı**

`handleBackupAction`'ın import dalını güncelle:

old_string:
```javascript
  }else{
    const code=$("backupTextarea").value.trim();
    if(!code){alert("Lütfen bir kod yapıştır.");return;}
    const data=backupDecode(code);
    if(!data){alert("Kod geçersiz veya bozuk. Doğru yedek kodu olduğundan emin ol.");return;}
    if(!confirm("Mevcut tüm ilerlemenin üzerine yazılacak. Devam edilsin mi?"))return;
    const ok=backupRestore(data);
```

new_string:
```javascript
  }else{
    const code=$("backupTextarea").value.trim();
    if(!code){alert("Lütfen bir kod yapıştır.");return;}
    const result=backupDecode(code);
    if(result.error){
      const msgs={
        "empty":"Kod boş görünüyor.",
        "prefix":"Kod 'CEMBER-v1:' ile başlamalı. Doğru kodu yapıştırdığından emin ol.",
        "format":"Kod yapısı tanınamadı.",
        "version-newer":"Bu kod daha yeni bir Çember sürümüne ait. Uygulamayı güncelle.",
        "corrupted":"Kod bozuk: "+(result.detail||"bilinmeyen hata"),
      };
      alert(msgs[result.error]||"Kod geçersiz.");
      return;
    }
    const data=result.data;
    if(!confirm("Mevcut tüm ilerlemenin üzerine yazılacak. Devam edilsin mi?"))return;
    const ok=backupRestore(data);
```

Commit:
```bash
git add index.html
git commit -m "feat(backup): granular hata mesajları (empty/prefix/format/version/corrupted)"
```

---

### Task 19: Smoke test (kavramsal)

**Files:**
- Görsel test, dosya değişikliği yok

- [ ] **Step 19.1: Beklenen tüm akışlar**

Subagent doğrulayamaz ama dokümante eder:

1. **Türkçe**: Ana menü "ç", "ş", "ı" doğru görünüyor mu? Toggle başlıkları? Foot-note?
2. **Yarim**: Açılış overlay'i "Merhaba Yarim" yazıyor mu?
3. **Hint=0**: Setup'tan slider 0'a kadar inebiliyor mu? 0 ile başlat → puzzle'da hiç ipucu yok.
4. **Auto-X**: 0 hücresinin etrafına bir çizgi çek → otomatik çarpılar.
5. **Undo/Redo**: Çizgi → undo → kalkıyor. Redo → tekrar geliyor.
6. **Auto-check segment**: Ayarlarda 3-seçenek görünüyor mu? Seçim canlı update ediyor mu?
7. **Nasıl Oynanır**: Ana menüden ve ayardan açılıyor mu? 5 sekme dolu mu?
8. **Yedek Üret**: Kod görünür mü, kopyalanabilir mi?
9. **Yedek Yükle**: Geçerli kodla restore çalışıyor mu? Geçersiz kod uyarı veriyor mu?

- [ ] **Step 19.2: Progress log final**

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink-plan-02"
# Tüm Task'ların kapısını kontrol et — sayım:
git log --oneline | head -25
```

---

### Task 20: Final progress log + roadmap update

**Files:**
- Modify: `docs/log/plan-02-progress.md` (final notes)
- Modify: `docs/spec/cember-implementation-roadmap.md` (Plan 02 done)

- [ ] **Step 20.1: Progress log final**

`docs/log/plan-02-progress.md` dosyasının sonuna ekle:

```markdown

## Plan 02 — Final

Branch `plan-02-patches-and-features` üzerinde 19 task tamamlandı. Beklenen ~20 commit.

### Kullanıcı tarafı manuel doğrulama
- [ ] Açılış: "Merhaba Yarim"
- [ ] Türkçe karakterler her yerde doğru
- [ ] Setup → hint density slider 0'a inebilir
- [ ] Auto-X çalışıyor (0 etrafı, 3 etrafı)
- [ ] Undo/Redo butonları, max 200 buffer
- [ ] Auto-check 3 seçenek canlı update
- [ ] Nasıl Oynanır sheet 5 sekme
- [ ] Yedek Üret → kopyala → temizle → Yükle → restore

### Sonraki adım
Plan 03 — PWA setup (`docs/spec/plan-03-pwa.md` yazılacak).
```

- [ ] **Step 20.2: Roadmap update**

`/Users/Erdo/Desktop/Claude Projects/slitherlink-plan-02/docs/spec/cember-implementation-roadmap.md` içinde:

```bash
# Son commit SHA'sını al
git log -1 --format=%h
```

Edit:

old_string:
```
| 02 — Quick fixes + Slitherlink QoL + How-to-play + Backup code | yazıldı, exec hazır | – |
```

new_string:
```
| 02 — Quick fixes + Slitherlink QoL + How-to-play + Backup code | ✓ tamamlandı | <SON_COMMIT_SHA> |
```

Commit:
```bash
git add docs/log/plan-02-progress.md docs/spec/cember-implementation-roadmap.md
git commit -m "docs(plan-02): final progress + roadmap güncelleme"
```

---

### Task 21: Push + merge main + push

**Files:**
- Push operations

- [ ] **Step 21.1: Branch'i push**

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink-plan-02"
git push -u origin plan-02-patches-and-features
```

- [ ] **Step 21.2: Main'e merge**

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git checkout main
git merge --no-ff plan-02-patches-and-features -m "Merge Plan 02: patches + Slitherlink QoL + how-to-play + backup code"
git push origin main
```

- [ ] **Step 21.3: Final doğrulama**

```bash
git log --oneline -30
```

Beklenen: tüm Plan 02 commit'leri main'de, en üstte merge commit. Plan 01 commit'leri korunmuş.

---

## Self-Review (skill gereği)

**Spec coverage:**
- ✅ Türkçe karakter audit → Task 2, 3
- ✅ "Merhaba Yarim" → Task 4
- ✅ Hint density 0 → Task 3 (Step 3.1)
- ✅ Auto-X toggle + impl → Task 5, 6
- ✅ Undo/Redo → Task 8
- ✅ Auto-check 3-mode → Task 7, 9
- ✅ Nasıl Oynanır 5 sekme → Task 10-13
- ✅ Yedek Kodu üret/yükle → Task 14-18
- ✅ Hata yönetimi → Task 18
- ✅ Smoke test instruction → Task 17, 19
- ✅ Merge + push → Task 21

**Placeholder taraması:** Hiçbir step "TBD/TODO/implement later" içermiyor.

**Tip tutarlılığı:** `backupDecode` Task 14'te `null | data` döndürüyordu; Task 18'de `{error} | {data}` formatına geçti. Task 18 sonrası tutarlı. (Önceki çağrı yerleri Task 18'de güncellendi.)

**Test stratejisi:** Çoğu görsel; backup için kavramsal roundtrip. Otomatik test yok (foundation modüler değil; Plan 05'te test harness gelecek).

**Toplam adım sayısı:** ~80 step (21 task). Tahmini süre 4-6 saat subagent-driven.

---

## Execution Handoff

Plan tamam ve commit edilecek. Subagent-driven-development skill ile yürütülmeye hazır.

Önerilen task gruplama (efficiency için):
- **Group 1** — Task 1 (setup branch + log)
- **Group 2** — Task 2, 3, 4 (Türkçe + Yarim + hint=0, ~3-4 commit)
- **Group 3** — Task 5, 6, 7 (settings + autoX + autoCheck, ~3 commit)
- **Group 4** — Task 8, 9 (undo/redo + segment UI, ~2 commit)
- **Group 5** — Task 10, 11 (help sheet + kurallar/modlar, ~2 commit)
- **Group 6** — Task 12, 13 (rogue/meta/backup içerik + entegrasyon, ~2 commit)
- **Group 7** — Task 14, 15, 16 (backup core + modal + ayar, ~3 commit)
- **Group 8** — Task 17, 18, 19 (test instruction + hata + smoke, ~2 commit)
- **Group 9** — Task 20, 21 (final + merge + push, ~3 commit)

= 9 implementer dispatch + review döngüleri.
