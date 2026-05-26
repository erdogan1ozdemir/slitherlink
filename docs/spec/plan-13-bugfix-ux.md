# Plan 13 · Bug fix + UX iyileştirmeleri + Cache reset

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Vercel canlı sürümünden gelen kullanıcı feedback'ini çöz: rogue node click bug, preset stuck bug, "Yeni" buton yeri/confirm, check button, corner auto-X, symbol legend, larger text, cache bust, unique solution iyileştirmesi.

**Bağımlılık:** Plan 12.

**Tahmini süre:** 3-4 saat.

---

## Phase A — Critical Bug Fixes

### A.1 Rogue map node click bug (iOS SVG event handling)

**Problem:** Rogue map'te düğümlere tıklayamıyor. Sebep: SVG `<g>` elementlerine direkt `addEventListener("click")` iOS Safari'de güvenilmez (touch event SVG hiyerarşisinde tam bubble etmiyor olabilir).

**Fix:** Event delegation parent container'da. `rogueMapContent` div'ine tek listener.

`renderRogueMap`'in sonunda mevcut:
```javascript
$("rogueMapContent").querySelectorAll("[data-node-id]").forEach(g=>{
  g.addEventListener("click",()=>{
    if(g.dataset.accessible!=="1")return;
    handleRogueNode(g.dataset.nodeId);
  });
});
```

Şu şekilde değiştir:
```javascript
const mapEl=$("rogueMapContent");
mapEl.onclick=null;
mapEl.addEventListener("click",e=>{
  const g=e.target.closest("[data-node-id]");
  if(!g||g.dataset.accessible!=="1")return;
  handleRogueNode(g.dataset.nodeId);
},{once:false});
```

Ayrıca her `<g>` element'ine `<rect>` (invisible larger hit area) ekle:

`renderRogueMap` SVG node generation içinde mevcut:
```html
<g data-node-id="${n.id}" ...>
  <circle cx="${cx(n.col)}" cy="${cy(n.floor)}" r="16" ... />
  <text ... />
</g>
```

Şu şekilde değiştir:
```html
<g data-node-id="${n.id}" data-accessible="..." style="...">
  <circle cx="${cx(n.col)}" cy="${cy(n.floor)}" r="26" fill="transparent" stroke="none" pointer-events="all"/>
  <circle cx="${cx(n.col)}" cy="${cy(n.floor)}" r="16" ... pointer-events="none"/>
  <text ... pointer-events="none"/>
</g>
```

(Transparent 26-radius circle yakalar tıklamayı, görsel 16-radius içinde, text ortada.)

### A.2 Cache bust → SW v3 + one-time data reset

**Problem:** Eski versiyonun cache'i + saklı state.

**Fix:**
- `service-worker.js`: `VERSION = 'slitherlink-shell-v3'`
- index.html init script'in en başına one-time reset flag check:

```javascript
// One-time reset for v3 migration (cache bust + clean state)
const RESET_FLAG="cember:reset:v3";
if(!localStorage.getItem(RESET_FLAG)){
  // Clear all cember:* keys
  const toRemove=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k&&k.startsWith("cember:"))toRemove.push(k);
  }
  toRemove.forEach(k=>localStorage.removeItem(k));
  // Clear IDB if available
  if(typeof indexedDB!=="undefined"){
    try{indexedDB.deleteDatabase("cember-db");}catch(e){}
  }
  localStorage.setItem(RESET_FLAG,"done");
}
```

Bu blok PWA register'dan ÖNCE çalışmalı (ilk satırlar). Sadece bir kere fırar; sonraki yüklemelerde geçilir.

### A.3 Preset chip "Rastgele" stuck

**Problem:** Rastgele preset seçilince size/density değiştirilemiyor (UI'da sel state takılı kalıyor).

Investigation: Mevcut:
```javascript
$("presetChips").addEventListener("click",e=>{const o=e.target.closest("[data-preset]");if(!o)return;const p=PRESETS[+o.dataset.preset];if(p.rand){setupSize=SIZE_OPTS[(Math.random()*SIZE_OPTS.length)|0];setupDens=40+((Math.random()*45)|0);}else{setupSize=p.size;setupDens=p.dens;}renderSetup();});
```

Bu setupSize/setupDens'i set ediyor ve renderSetup çağırıyor. Sonra kullanıcı size chip veya density slider değiştirebilir — bunlar ayrı handler'lara bağlı:

```javascript
$("sizeChips").addEventListener("click",e=>{const o=e.target.closest("[data-size]");if(!o)return;setupSize=+o.dataset.size;renderSetup();});
$("density").addEventListener("input",e=>{setupDens=+e.target.value;$("densVal").textContent="%"+setupDens;});
```

Bunlar çalışıyor olmalı. Eğer Rastgele preset sonrası değişmiyorsa, presetChips listener'ı her renderSetup'tan sonra re-attach ediliyor olmalı.

**Fix:** Tüm setup handler'ları renderSetup çağırırken hiçbir state'i kaybetmez. Asıl sorun PRESETS array'inde "Rastgele" preset'in `dens` alanı `undefined` çünkü `rand:true`. Renderda preset chip seçimi state'i belirsiz.

Test için: presetChips'e `data-preset` attribute Sel state göstergesi yok mu? Mevcut renderSetup:
```javascript
$("presetChips").innerHTML=PRESETS.map((p,i)=>`<div class="opt" data-preset="${i}">${p.n}</div>`).join("");
```

Hiçbir `.sel` class'ı yok preset için. Yani UI takılma yok teorik olarak. Ama kullanıcı bug olduğunu söylüyor — pratik olarak iOS'ta tap event'i ikinci kez tetiklenmiyor olabilir.

**Fix:** preset click handler'ını da delegate et ana setup screen'e. Plus pressed state göster.

```javascript
$("presetChips").addEventListener("click",e=>{
  const o=e.target.closest("[data-preset]");
  if(!o)return;
  const idx=+o.dataset.preset;
  const p=PRESETS[idx];
  if(p.rand){
    setupSize=SIZE_OPTS[(Math.random()*SIZE_OPTS.length)|0];
    setupDens=40+((Math.random()*45)|0);
  }else{
    setupSize=p.size;
    setupDens=p.dens;
  }
  setupActivePreset=idx; // YENİ
  renderSetup();
});
```

Ve renderSetup'te preset chip'lerine sel state ekle:
```javascript
$("presetChips").innerHTML=PRESETS.map((p,i)=>`<div class="opt ${setupActivePreset===i?'sel':''}" data-preset="${i}">${p.n}</div>`).join("");
```

`setupActivePreset` global değişkeni tanımla. Size/density manual değiştirilince setupActivePreset=-1 yap.

---

## Phase B — UX Improvements

### B.1 "Yeni" buton yer değişikliği + confirm

**Problem:** "Yeni" butonu "İpucu"nun hemen yanında, yanlışlıkla basılıyor.

**Fix:** "Yeni" butonunu topbar'a taşı (sağ üst, ⚙ yanına). Tıklanınca onay sor.

HTML değişiklik (`s-game` topbar):
```html
<div class="topbar">
  <button class="iconbtn" data-back aria-label="Geri">‹</button>
  <div class="ttl" id="gameTitle">Bulmaca</div>
  <button class="iconbtn" id="gameNewBtn" aria-label="Yeni" title="Yeni">✦</button>
  <button class="iconbtn" id="gameSettings" aria-label="Ayarlar">⚙</button>
</div>
```

Eski controls bloğundan "Yeni" butonu kaldır:
```html
<div class="controls">
  <button class="btn-ghost" id="undoBtn" ...>↶</button>
  <button class="btn-ghost" id="redoBtn" ...>↷</button>
  <button class="btn-ghost" id="resetBtn" ...>↺</button>
  <button class="btn-ghost" id="checkBtn" aria-label="Kontrol Et">✓</button>
  <button class="btn-ghost hidden" id="hintBtn">💡 İpucu</button>
</div>
```

`newBtn` id'sini `gameNewBtn`'e değiştir + topbar'da. Event handler `confirm()`'la sar:

```javascript
$("gameNewBtn").addEventListener("click",()=>{
  if(!confirm("Yeni bulmaca başlatılsın mı? Mevcut ilerleme kaybolacak."))return;
  if(ctx.mode==="journey")startJourney(ctx.levelIndex);
  else startFree();
});
```

(`applyNewBtnVisibility` rogue mode'da gameNewBtn'i gizler — aynı kalır, sadece id değişti.)

### B.2 Check (Kontrol) butonu

Mevcut hata göstergesi (`updateClueStates`) sadece clue rakamlarını işaret eder. Check butonu ek olarak yanlış kenarları işaretler.

CSS bloğuna ekle:
```css
.edge-line.wrong{stroke:var(--bad);}
.ex.wrong{stroke:var(--bad);opacity:.9;}
```

JS yeni fonksiyon:
```javascript
function runCheck(){
  if(!P||solved)return;
  let wrongs=0;
  // Compare each edge state to solution
  boardEl.querySelectorAll(".edge-line").forEach(el=>el.classList.remove("wrong"));
  boardEl.querySelectorAll(".ex").forEach(el=>el.classList.remove("wrong"));
  // Mark wrongly-placed lines (state=1 but solution=0) and crosses (state=2 but solution=1)
  // Re-render with wrong flag
  render();
  for(let r=0;r<=P.R;r++)for(let c=0;c<P.C;c++){
    const s=hState[r][c],sol=P.solH[r][c];
    if((s===1&&sol===0)||(s===2&&sol===1))wrongs++;
  }
  for(let r=0;r<P.R;r++)for(let c=0;c<=P.C;c++){
    const s=vState[r][c],sol=P.solV[r][c];
    if((s===1&&sol===0)||(s===2&&sol===1))wrongs++;
  }
  // Visual feedback in title
  const t=$("gameTitle");
  const old=t.textContent;
  t.textContent=wrongs===0?"✓ Şimdiye kadar doğru":`✗ ${wrongs} hatalı kenar`;
  t.style.color=wrongs===0?"var(--good)":"var(--bad)";
  setTimeout(()=>{t.textContent=old;t.style.color="";},2500);
  // Re-render with wrong class
  if(wrongs>0){
    setTimeout(()=>renderWithWrong(),50);
  }
}

function renderWithWrong(){
  // Call render() then add wrong class to mismatched edges
  render();
  for(let r=0;r<=P.R;r++)for(let c=0;c<P.C;c++){
    const s=hState[r][c],sol=P.solH[r][c];
    if((s===1&&sol===0)||(s===2&&sol===1)){
      // Find the rendered edge element by index — approximated by querying all .edge-line and .ex
      // Simpler: re-render with awareness — modify render() to accept "wrong" set
    }
  }
}
```

Hmm karmaşık. Daha temiz yaklaşım: `render()` fonksiyonuna `wrongSet` opsiyonel parametresi ekle, kenar çizerken kontrol etsin.

Render içinde edge çizimi:
```javascript
function seg(x1,y1,x2,y2,st,k,r,c){
  if(st===1){
    const l=document.createElementNS(NS,"line");
    l.setAttribute("x1",x1);l.setAttribute("y1",y1);l.setAttribute("x2",x2);l.setAttribute("y2",y2);
    const isWrong=wrongSet&&wrongSet.has(k+":"+r+":"+c);
    l.setAttribute("class","edge-line seg-appear"+(isWrong?" wrong":""));
    boardEl.appendChild(l);
  }else if(st===2){...}
}
```

Global `wrongSet` Map, render başında okunur. checkBtn handler set'i doldurur, render() çağırır.

```javascript
let wrongSet=null;
function runCheck(){
  if(!P||solved)return;
  wrongSet=new Set();
  for(let r=0;r<=P.R;r++)for(let c=0;c<P.C;c++){
    const s=hState[r][c],sol=P.solH[r][c];
    if((s===1&&sol===0)||(s===2&&sol===1))wrongSet.add("h:"+r+":"+c);
  }
  for(let r=0;r<P.R;r++)for(let c=0;c<=P.C;c++){
    const s=vState[r][c],sol=P.solV[r][c];
    if((s===1&&sol===0)||(s===2&&sol===1))wrongSet.add("v:"+r+":"+c);
  }
  render();
  const wrongs=wrongSet.size;
  setTimeout(()=>{wrongSet=null;render();},3000);
  const t=$("gameTitle"),old=t.textContent;
  t.textContent=wrongs===0?"✓ doğru gidiyorsun":`✗ ${wrongs} hatalı kenar`;
  t.style.color=wrongs===0?"var(--good)":"var(--bad)";
  setTimeout(()=>{t.textContent=old;t.style.color="";},2700);
}
```

render() içinde edge çizilirken wrongSet kontrol etsin.

Controls bar'a buton ekle:
```html
<button class="btn-ghost" id="checkBtn" aria-label="Kontrol et">✓</button>
```

Event:
```javascript
$("checkBtn").addEventListener("click",runCheck);
```

### B.3 Corner auto-X mekaniği

**Problem:** Bir köşede (vertex'te) 2 çizgi varsa, 3. kenara çizgi konulamaz (loop kuralı: her vertex 0 veya 2). Buna otomatik çarpı koyma.

**Fix:** `toggle()` içinde line→cross veya empty→line geçişi sırasında comşu vertex'te 2 line varsa, hedef edge'i otomatik X yap.

Sadece `settings.autoX` açıkken çalışsın.

`toggle()` fonksiyonunda mevcut autoX kontrolünden sonra:
```javascript
function vertexDeg(r,c){
  let d=0;
  if(c>0&&hState[r][c-1]===1)d++;
  if(c<P.C&&hState[r][c]===1)d++;
  if(r>0&&vState[r-1][c]===1)d++;
  if(r<P.R&&vState[r][c]===1)d++;
  return d;
}

function applyCornerAutoX(){
  if(!settings.autoX)return;
  // Iterate all vertices
  for(let r=0;r<=P.R;r++)for(let c=0;c<=P.C;c++){
    const deg=vertexDeg(r,c);
    if(deg===2){
      // The remaining 2 edges (if any) must be empty/cross — make them X
      if(c>0&&hState[r][c-1]===0)hState[r][c-1]=2;
      if(c<P.C&&hState[r][c]===0)hState[r][c]=2;
      if(r>0&&vState[r-1][c]===0)vState[r-1][c]=2;
      if(r<P.R&&vState[r][c]===0)vState[r][c]=2;
    }
  }
}
```

Toggle() içinde `applyAutoXAround` çağrılarından sonra `applyCornerAutoX()` ekle.

### B.4 Symbol legend (Rogue map)

**Problem:** Map'teki sembollerin (◇ ☆ ⬚ ⚿ ◐ ? ☠) ne anlama geldiği belirsiz.

**Fix:** Map topbar'a "❓" butonu ekle, basılınca legend overlay'i toggle.

HTML (`s-rogue-map` topbar):
```html
<div class="topbar">
  <button class="iconbtn" data-back>‹</button>
  <div class="ttl" id="rogueMapTitle">Koşu</div>
  <button class="iconbtn" id="rogueMapHelp" aria-label="Sembol açıklaması">?</button>
</div>
```

Map content'in başına collapsible legend ekle:
```javascript
const legendHtml=`
  <div id="rogueMapLegend" style="display:none;background:var(--panel-2);border:1px solid var(--hairline);border-radius:14px;padding:14px;margin-bottom:12px;">
    <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:10px;">harita sembolleri</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      ${[
        ["◇","Bulmaca","Standart bulmaca, çözünce relic seçeneği"],
        ["☆","Elit","Zor bulmaca, daha iyi ödül"],
        ["⬚","Sandık","Bulmaca yok, bir relic seç"],
        ["⚿","Kilitli Sandık","Bronz Anahtar gerekir"],
        ["◐","Dinlenme","+1 can yenilenir"],
        ["?","Olay","Metin + 2-3 seçim"],
        ["☠","Patron","Kat sonu büyük bulmaca"],
      ].map(([g,n,d])=>`
        <div style="display:flex;gap:8px;align-items:flex-start;">
          <span style="color:var(--accent);font-family:var(--font-serif);font-size:18px;min-width:20px;text-align:center;">${g}</span>
          <div style="flex:1;">
            <div style="font-family:var(--font-serif);font-weight:600;font-size:12px;color:var(--ink);">${n}</div>
            <div style="font-size:10.5px;color:var(--muted);line-height:1.3;font-family:var(--font-serif);font-style:italic;">${d}</div>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
`;
```

`rogueMapContent` innerHTML'in en başına legend ekle. Event:
```javascript
$("rogueMapHelp")?.addEventListener("click",()=>{
  const l=$("rogueMapLegend");
  if(l)l.style.display=l.style.display==="none"?"block":"none";
});
```

### B.5 Larger text in Rogue mode

Mevcut rogue map HUD font'ları 10-11px — küçük. iPhone'da okunması zor.

**Fix:** Yatay HUD'daki font'ları artır.

`renderRogueMap` HUD bloğunda font-size'leri:
- `font-size:10px` → `font-size:12px`
- `font-size:11px` → `font-size:13px`
- `font-size:12px` → `font-size:14px`

Aynı şekilde Karakter, İpliklik, Diken ekranlarında küçük 8-9px label'ları 10-11px'e çıkar (label'lar mono uppercase olduğu için 11px'e çıkarsa okunabilir).

### B.6 Talent/charm/keepsake tap info

Karakter ekranında keepsake/charm slot'a uzun bas → modal'da detay.

Şimdilik basit fix: charm slot'a tıklayınca (eğer dolu) → bir modal'da bilgi göster.

Mevcut: `el.addEventListener("click",()=>{const i=+el.dataset.charmSlot;const eq=...; if(eq){unequipCharm...} else {openCharmsLibrary();}});`

Bu davranış sorunlu — dolu slot'a tıklayınca direkt çıkarılıyor. Daha iyi: tıklayınca bilgi göster + "Çıkar" butonu.

**Fix:** Dolu slot tap → modal "Çıkar mı, bırak mı?". Veya basit: openCharmsLibrary() her durumda (boş veya dolu).

İkinci yaklaşım daha basit:
```javascript
el.addEventListener("click",()=>openCharmsLibrary());
```

Library modal zaten "Çıkar"/"Diz" butonlarına sahip.

---

## Phase C — Generator Improvement (limited)

### C.1 Unique solution iyileştirmesi

**Problem:** Düşük yoğunlukta puzzle birden fazla çözüme izin verebilir.

**Fix (limited):** Generator'a minimum keep ratio enforcement + post-gen sanity check.

`makePuzzle` fonksiyonunda clue removal aşamasında: rastgele removal yerine, "kritik clue"ları koru. Sınırlı iyileştirme: hücre 0/1/2/3 dağılımı bozulmasın.

Pragmatik: Setup'ta density slider min'ini 0 → 35 değiştir (çok düşük yoğunlukta birden fazla çözüm garanti).

`index.html`:
```html
<input type="range" id="density" min="35" max="90" value="70">
```

(Plan 02'de min=0 yapıldıydı; bunu min=35 olarak geri al. Sebep: 0 density ile her loop kazanır, çoklu çözüm. Spec'in original "ipucu yoğunluğu 0" Çember mantığında problem yaratıyor.)

Plus serbest setup'a not ekle: "Düşük yoğunlukta birden fazla çözüm mümkün — şüpheliyse '✓ Kontrol' butonu kullan."

Section-label altına:
```html
<div class="section-label">İpucu yoğunluğu <span id="densVal" style="color:var(--ink)"></span></div>
<div style="font-size:11px;color:var(--muted);font-style:italic;padding:0 0 6px;font-family:var(--font-serif);">düşük yoğunlukta birden fazla çözüm olabilir</div>
```

---

## Görevler

### Task 1: Branch + log

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-13 -b plan-13-bugfix-ux
cd "../slitherlink-plan-13"
```

`docs/log/plan-13-progress.md`:
```markdown
# Plan 13 Progress
## Phase A — Bug fixes
- [ ] Task 1: Branch + log
- [ ] Task 2: SW v3 + one-time reset (Phase A.2)
- [ ] Task 3: Rogue map click bug fix (Phase A.1)
- [ ] Task 4: Preset stuck fix + active pill (Phase A.3)
## Phase B — UX
- [ ] Task 5: "Yeni" buton topbar + confirm (Phase B.1)
- [ ] Task 6: Check (Kontrol) butonu (Phase B.2)
- [ ] Task 7: Corner auto-X mekaniği (Phase B.3)
- [ ] Task 8: Map symbol legend toggle (Phase B.4)
- [ ] Task 9: Rogue text size + Karakter label boost (Phase B.5)
- [ ] Task 10: Charm slot tap → library (Phase B.6)
## Phase C — Generator
- [ ] Task 11: density min 0→35 + uyarı not (Phase C.1)
## Final
- [ ] Task 12: Final + merge + push
```

Commit: `chore(plan-13): start — branch + log`

---

### Tasks 2-11

Spec'teki Phase A/B/C bölümlerini sırayla uygula. Her bağımsız fix kendi commit'i.

Önerilen commit sırası:
1. SW v3 + reset bootstrap (Task 2)
2. Rogue click delegated (Task 3)
3. Preset active state (Task 4)
4. Yeni buton topbar + confirm (Task 5)
5. Kontrol butonu (Task 6)
6. Corner auto-X (Task 7)
7. Symbol legend (Task 8)
8. Text size boost (Task 9)
9. Charm slot tap fix (Task 10)
10. Density min 35 + uyarı (Task 11)

### Task 12: Final + merge + push

Roadmap güncelle: `13 — Bug fix + UX + cache reset | ✓ tamamlandı | <SHA>`

---

## Self-Review

Tüm bug'lar ele alındı:
- ✅ Rogue node click (event delegation + transparent hit area)
- ✅ Preset stuck (active state tracking)
- ✅ Yeni buton (topbar + confirm)
- ✅ Check button (wrong edge highlight)
- ✅ Corner auto-X (vertex deg 2 → remaining X)
- ✅ Symbol legend (toggle)
- ✅ Larger text (font bumps)
- ✅ Charm slot UX
- ✅ Density min 35 (multi-solution warning)
- ✅ Cache v3 + one-time reset

**Önerilen dispatch:** Tek dispatch, 12 task.
