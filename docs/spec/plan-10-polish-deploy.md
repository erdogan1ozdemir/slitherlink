# Plan 10 · Polish + meta achievements + permanent starter UI + a11y + Vercel deploy

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Sürüm öncesi son polish: cross-realm meta achievement'lar, permanent starter slot UI, basic a11y, Vercel deploy hazırlığı. v1 ship-ready halini al.

**Bağımlılık:** Plan 09.

**Tahmini süre:** 3-4 saat.

**Scope sınırı:**
- ✅ 8-10 meta achievement (cross-realm + saklı)
- ✅ Permanent starter slot UI + equip (Karakter ekranında)
- ✅ A11y minimum: focus rings, ARIA label'lar
- ✅ Vercel deploy (vercel.json + README instructions)

**v1.x'e ertelenmiş (Plan 11+):**
- Hediye Boncukları (keepsake) full UI
- İpliklik talent fonksiyonu (kalıcı pasif efektler)
- Boncuk Dizimi (charm equip + effects)
- Constraint tiles (Sis, İkiz, Donmuş, vb.)
- Yuva Fısıltısı (Neow start choice)
- Pati izi animation

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `src/rogue/achievements.js` | Modify | 8-10 meta + secret achievement ekle |
| `index.html` | Modify | Permanent starter UI, a11y focus rings, achievement check triggers (solve_count, days_streak) |
| `vercel.json` | Create | Vercel config (static, headers) |
| `README.md` | Modify | Deploy instructions |
| `docs/log/plan-10-progress.md` | Create | Progress notları |

---

## Görevler

### Task 1: Branch + log

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-10 -b plan-10-polish-deploy
cd "../slitherlink-plan-10"
```

`docs/log/plan-10-progress.md`:
```markdown
# Plan 10 Progress
- [ ] Task 1: Branch + log
- [ ] Task 2: 10 meta achievement (achievements.js)
- [ ] Task 3: Solve_count + days_streak trigger logic
- [ ] Task 4: Permanent starter UI (Karakter ekranı)
- [ ] Task 5: A11y focus rings + ARIA
- [ ] Task 6: vercel.json + README deploy notu
- [ ] Task 7: Final + merge + push
```

Commit: `chore(plan-10): start — branch + log`

---

### Task 2: 10 meta + secret achievement

`src/rogue/achievements.js` ACHIEVEMENTS objesine ekle. D3 ach'lerin altına:

```javascript
  // === Cross-realm meta ===
  "ilk-iz":{
    id:"ilk-iz",realm:null,title:"İlk İz",
    body:"Herhangi bir koşu başlattın.",
    diary:"Bir adım atıldı. İz başladı.",
    trigger:"run_started",secret:false,
  },
  "on-cember":{
    id:"on-cember",realm:null,title:"On Çember",
    body:"10 puzzle çözdün.",
    diary:"On çember, on iplik, on nefes.",
    trigger:"solve_count:10",secret:false,
  },
  "yuz-cember":{
    id:"yuz-cember",realm:null,title:"Yüz Çember",
    body:"100 puzzle çözdün.",
    diary:"Yüzüncü çember kapandı. Tezgah seni tanıyor.",
    trigger:"solve_count:100",secret:false,
  },
  "uc-diyar":{
    id:"uc-diyar",realm:null,title:"Üç Diyar",
    body:"Üç diyarı da en az bir kez tamamladın.",
    diary:"Üç kapıdan da geçtin. Geceyi de gündüzü de tanıdın.",
    trigger:"realms_cleared_all",secret:false,
  },
  "uc-patron":{
    id:"uc-patron",realm:null,title:"Üç Patron",
    body:"Üç patronu da yendin.",
    diary:"Üç sessizlik, üç selam.",
    trigger:"bosses_defeated_all",secret:false,
  },
  "koleksiyoncu":{
    id:"koleksiyoncu",realm:null,title:"Koleksiyoncu",
    body:"Her diyardan en az 3 farklı relic gördün.",
    diary:"Boncuklar uzun bir ip oldu.",
    trigger:"relics_per_realm:3",secret:false,
  },
  "sessiz-dost":{
    id:"sessiz-dost",realm:null,title:"Sessiz Dost",
    body:"7 farklı günde oynadın.",
    diary:"Her gün bir iplik bıraktın. Hiç sözsüz.",
    trigger:"days_streak:7",secret:false,
  },
  "ev-sahibi":{
    id:"ev-sahibi",realm:null,title:"Ev Sahibi",
    body:"Permanent starter slot'unu doldurdun.",
    diary:"Yuvana bir armağan koydun. Sonraki koşulara seninle gelir.",
    trigger:"permanent_starter_set",secret:false,
  },
  // === Saklı ===
  "jediyi-gor":{
    id:"jediyi-gor",realm:null,title:"Jedi'yi Gör",
    body:"Yuva'da Jedi'nin silüetine dokundun.",
    diary:"Jedi sana baktı. Sen ona. Bir an her şey durdu.",
    trigger:"jedi_tap",secret:true,
  },
  "saatin-kedisi":{
    id:"saatin-kedisi",realm:null,title:"Saatin Kedisi",
    body:"Gece 3 ile 4 arasında oynadın.",
    diary:"Gece yarısı geçti, kedi uyumadı. Sen de.",
    trigger:"played_in_hour:3",secret:true,
  },
```

Commit: `feat(rogue): 8 meta + 2 secret achievement (cross-realm)`

---

### Task 3: Meta trigger logic — solve_count + days_streak + run_started + etc

`index.html`'de meta trigger emit point'lerini ekle:

**Edit 1 — `startRogueRun` başında `run_started` emit:**

mevcut startRogueRun başına ekle:
```javascript
achievementUnlock("run_started");
```

**Edit 2 — `win()` rogue dalında solve_count emit:**

mevcut `meta.totalStats.solves=(meta.totalStats.solves||0)+1;saveMeta();` satırından sonra:

```javascript
// Solve milestones
[10,100].forEach(n=>{if(meta.totalStats.solves===n)achievementUnlock("solve_count:"+n);});
```

**Edit 3 — `realm_cleared` triggers'ından sonra cross-realm checks:**

Mevcut `achievementUnlock("realm_cleared:..."` çağrısından sonra:
```javascript
// Cross-realm checks
const clearedCount=Object.values(meta.realms||{}).filter(r=>r&&r.timesCleared>0).length;
if(clearedCount>=3)achievementUnlock("realms_cleared_all");
const defeatedCount=Object.values(meta.realms||{}).filter(r=>r&&r.defeatedBosses>0).length;
if(defeatedCount>=3)achievementUnlock("bosses_defeated_all");
// Koleksiyoncu: her diyardan ≥3 relic
const realmIds=["sogut-esigi","karanlik-igne","yildiz-gecidi"];
if(realmIds.every(id=>(meta.realms[id]?.knownRelics||[]).length>=3))achievementUnlock("relics_per_realm:3");
```

**Edit 4 — days_streak: app açılışında kontrol et**

`renderHome` başında veya init script bölümünde:
```javascript
// Days streak tracking
(function checkDaysStreak(){
  const today=new Date().toISOString().slice(0,10);
  if(!meta.daysStreak)meta.daysStreak={dates:[],last:null};
  if(meta.daysStreak.last!==today){
    meta.daysStreak.dates=(meta.daysStreak.dates||[]).concat([today]);
    // Sadece son 30 günü tut
    meta.daysStreak.dates=meta.daysStreak.dates.slice(-30);
    meta.daysStreak.last=today;
    saveMeta();
  }
  const uniqueDays=new Set(meta.daysStreak.dates).size;
  if(uniqueDays>=7)achievementUnlock("days_streak:7");
})();
```

**Edit 5 — played_in_hour:3 (saklı)**

Aynı yerde:
```javascript
(function checkNightCat(){
  const hr=new Date().getHours();
  if(hr>=3&&hr<4)achievementUnlock("played_in_hour:3");
})();
```

**Edit 6 — Jedi silüetine tap (Yuva'da rastgele görünür)**

`renderYuva` Jedi SVG'sine click handler:
```javascript
// Random Jedi-tap easter egg: %3 ihtimal aktif
const jediEl=$("yuvaContent").querySelector("svg");
if(jediEl&&Math.random()<0.03){
  jediEl.style.cursor="pointer";
  jediEl.addEventListener("click",()=>achievementUnlock("jedi_tap"),{once:true});
}
```

Commit: `feat(rogue): meta achievement trigger logic (solve_count, days_streak, realms_cleared, secret)`

---

### Task 4: Permanent starter slot UI

`renderKarakter` içine yeni bölüm: "Yanında başla" + boş veya dolu slot + relic koleksiyonundan seçim modali.

renderKarakter HTML'inin sonuna ekle (mevcut stat grid'inden sonra):

```javascript
const starter=meta.permanentStarters&&meta.permanentStarters[0];
const starterHtml=starter?(()=>{
  const r=RELICS[starter];
  return r?`
    <div style="display:flex;align-items:center;gap:12px;background:var(--panel-2);border:1px solid var(--accent);border-radius:14px;padding:14px;">
      <div style="width:46px;height:46px;border-radius:12px;background:var(--bg);border:1px solid var(--hairline);display:grid;place-items:center;color:var(--accent);font-family:var(--font-serif);font-size:22px;">${r.glyph}</div>
      <div style="flex:1;">
        <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.2em;color:var(--accent);text-transform:uppercase;">yanında başla</div>
        <div style="font-family:var(--font-serif);font-weight:600;font-size:15px;color:var(--ink);margin-top:2px;">${r.name}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px;font-family:var(--font-serif);font-style:italic;">${r.desc}</div>
      </div>
      <button class="opt" id="starterChangeBtn" style="background:transparent;border:1px solid var(--hairline);color:var(--muted);font-size:11px;">değiştir</button>
    </div>
  `:"";
})():`
  <div style="background:var(--panel);border:1px dashed var(--hairline);border-radius:14px;padding:14px;text-align:center;">
    <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.2em;color:var(--muted);text-transform:uppercase;">yanında başla</div>
    <div style="font-family:var(--font-serif);font-style:italic;color:var(--ink-dim);margin-top:6px;font-size:13px;">henüz boş — gördüğün relic'lerden birini seç</div>
    <button class="opt" id="starterSelectBtn" style="margin-top:10px;background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);">Seç</button>
  </div>
`;

// existingHtml'in sonuna inject
const fullHtml=existingHtml+`<div style="margin-top:16px;padding:0 4px;">${starterHtml}</div>`;
$("karakterContent").innerHTML=fullHtml;

// Handler
const sel=$("starterSelectBtn")||$("starterChangeBtn");
if(sel)sel.addEventListener("click",openStarterPicker);
```

`openStarterPicker` fonksiyonu — koleksiyondan seçim modali:

```javascript
function openStarterPicker(){
  const seenRelics=new Set();
  for(const realmId of Object.keys(meta.realms||{})){
    for(const id of (meta.realms[realmId].knownRelics||[]))seenRelics.add(id);
  }
  const items=Array.from(seenRelics).map(id=>RELICS[id]).filter(Boolean);
  if(!items.length){
    alert("Henüz hiç relic görmedin. Bir koşuda chest aç ya da event'ten kazan.");
    return;
  }
  const current=meta.permanentStarters&&meta.permanentStarters[0];
  const html=`
    <h2>Yanında Başla</h2>
    <p>Koleksiyondan birini seç. Her yeni koşuda bu relic'le başlarsın.</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin:14px 0;max-height:50dvh;overflow-y:auto;">
      ${items.map(r=>`
        <button class="opt" data-starter="${r.id}" style="text-align:left;padding:12px 14px;background:${current===r.id?'var(--panel-2)':'var(--panel)'};border:1px solid ${current===r.id?'var(--accent)':'var(--hairline)'};">
          <div style="display:flex;align-items:baseline;gap:10px;">
            <span style="color:var(--accent);font-family:var(--font-serif);font-size:20px;">${r.glyph}</span>
            <b style="font-family:var(--font-serif);font-weight:600;color:var(--ink);">${r.name}</b>
            ${current===r.id?'<span style="margin-left:auto;color:var(--accent);">●</span>':""}
          </div>
          <div style="color:var(--muted);font-size:12px;margin-top:4px;font-family:var(--font-serif);font-style:italic;">${r.desc}</div>
        </button>
      `).join("")}
      ${current?`<button class="opt" data-starter="" style="background:transparent;border:1px dashed var(--hairline);color:var(--muted);">Slot'u boşalt</button>`:""}
    </div>
  `;
  openRogueModal(html,e=>{
    const btn=e.target.closest("[data-starter]");
    if(!btn)return;
    const id=btn.dataset.starter;
    if(id){meta.permanentStarters=[id];achievementUnlock("permanent_starter_set");}
    else{meta.permanentStarters=[];}
    saveMeta();
    closeRogueModal();
    renderKarakter();
  });
}
```

Ve `startRogueRun` içinde permanent starter relic'i koşuya ekle:

```javascript
// Permanent starter ekle (yeni koşuysa)
if(meta.permanentStarters&&meta.permanentStarters[0]&&!activeRun.relics.includes(meta.permanentStarters[0])){
  activeRun.relics.push(meta.permanentStarters[0]);
}
```

Commit: `feat(rogue): permanent starter slot UI + picker + run start ekleme`

---

### Task 5: A11y minimum — focus rings + ARIA

CSS bloğunun başına ekle:

```css
*:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px;}
button:focus-visible,.opt:focus-visible,.sw:focus-visible,.tab:focus-visible{outline:2px solid var(--accent);outline-offset:3px;}
.iconbtn:focus-visible{outline-offset:2px;}
```

Tüm topbar back butonlarına ARIA:

`<button class="iconbtn" data-back>‹</button>` → `<button class="iconbtn" data-back aria-label="Geri">‹</button>`

`<button class="iconbtn" id="homeSettings">⚙</button>` → `<button class="iconbtn" id="homeSettings" aria-label="Ayarlar">⚙</button>`

(Tüm iconbtn'lara ARIA label eklenir. Bash replace_all uygun.)

Switch elementlerine `role="switch"` + `aria-checked`:

```javascript
// renderToggles güncellemesi (mevcut .sw render'da):
<div class="sw ${settings[d.k]?'on':''}" data-tog="${d.k}" role="switch" aria-checked="${settings[d.k]}" tabindex="0"></div>
```

Switch click handler'a keyboard support (Enter / Space):

```javascript
$("toggleList").addEventListener("keydown",e=>{
  if(e.key==="Enter"||e.key===" "){
    const sw=e.target.closest("[data-tog]");
    if(sw){e.preventDefault();sw.click();}
  }
});
```

Commit: `feat(a11y): focus rings + ARIA labels + switch keyboard support`

---

### Task 6: vercel.json + README deploy notu

`vercel.json`:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/(.*)\\.(html|json|svg)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600, must-revalidate" }
      ]
    },
    {
      "source": "/(.*)\\.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    }
  ]
}
```

README.md'ye "Yayınla" bölümünü genişlet:

`## Yayınla` bölümünde mevcut "Vercel" satırının altına ekle:

```markdown
### Vercel ile yayınlama (önerilen)

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

vercel.json içinde:
- Service worker `no-cache` header'la sunuluyor (PWA güncellemeleri için)
- HTML/JSON/SVG 1 saatlik cache + revalidate
- JS modülleri 24 saatlik cache

### Manuel test (iPhone)

1. Vercel URL'sini Safari'de aç
2. Paylaş butonu → "Ana Ekrana Ekle"
3. Ana ekrandan ikonu aç — tam ekran, adres çubuğu yok
4. Uçak modunu aç, oyunu tekrar başlat → çalışır (service worker cache)
5. DevTools (PC bağlı): Application → Manifest hatasız + Service Workers active
```

Commit: `feat(deploy): vercel.json + README deploy + iPhone test notları`

---

### Task 7: Final + merge + push

- [ ] Progress log final + roadmap güncelle (`10 — Polish + deploy | ✓ tamamlandı | <SHA>`)
- [ ] Commit + branch push + main merge + push

Manuel test instruction'ı progress log'a:

```markdown
## Plan 10 — Final manual test

### Cross-realm meta ach
- [ ] İlk koşu başlat → "İlk İz" toast
- [ ] 10 puzzle çöz → "On Çember" toast
- [ ] D1+D2+D3 hepsini tamamla → "Üç Diyar" + "Üç Patron" toast
- [ ] Her diyardan ≥3 relic gör → "Koleksiyoncu" toast
- [ ] 7 farklı günde aç → "Sessiz Dost" toast (zaman alır)

### Saklı ach
- [ ] Yuva'da Jedi'ye dokun (rastgele aktif olur) → "Jedi'yi Gör"
- [ ] Gece 3-4 arası aç → "Saatin Kedisi"

### Permanent starter
- [ ] Karakter ekranı → "Yanında başla" → koleksiyondan biri seç
- [ ] Yeni koşu başlat → o relic listede

### Vercel
- [ ] `vercel --prod` → URL döner
- [ ] iPhone Safari'de aç → Ana Ekrana Ekle → tam ekran + offline test

### Sonraki adım
Plan 11+ (deferred items): Hediye Boncukları + İpliklik talents + Boncuk Dizimi + Constraint tiles + Yuva Fısıltısı + Pati izi anim
```

---

## Self-Review

**Spec coverage:**
- ✅ 8 meta + 2 secret achievement
- ✅ Trigger logic (solve_count, days_streak, jedi_tap, played_in_hour, realms_cleared_all, bosses_defeated_all, relics_per_realm, run_started, permanent_starter_set)
- ✅ Permanent starter slot UI + picker
- ✅ A11y focus rings + ARIA
- ✅ Vercel config + deploy docs

**Önerilen dispatch:** Tek dispatch (Tasks 1-7).
