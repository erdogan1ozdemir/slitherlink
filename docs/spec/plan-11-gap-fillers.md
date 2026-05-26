# Plan 11 · Gap fillers — İpliklik + Boncuk Dizimi + Pati izi + Neow + Sis tile + fixes

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Plan 06-10 sürecinde Plan 11+'ya ertelenmiş öncelikli gap'leri kapat. Currency'ler artık harcanabilir (İpliklik talents + Boncuk Dizimi), pati izi animation gelir, run başında Yuva Fısıltısı 3 seçim, ilk constraint tile (Sis) D2/D3'te aktif, ufak bug fix + cleanup.

**Bağımlılık:** Plan 10.

**Tahmini süre:** 4-5 saat.

---

## Scope

**Phase A — İpliklik functional:** 6 talent + spend UI + run start effect application
**Phase B — Boncuk Dizimi:** 6 charm + Karakter equip UI (3 slot) + run start effects
**Phase C — Pati izi animation:** Win modal'da küçük taupe SVG paw trail (per-realm variant)
**Phase D — Yuva Fısıltısı (Neow):** Run başında 3 random seçim modal'ı
**Phase E — Sis constraint tile:** D2/D3 puzzle'larında %20-30 hücre gizli (tıkla → 3s reveal)
**Phase F — Fixes + cleanup:** achievement emit guard fix, stub-realm.js sil, run.wasResumed proper

**Ertelenmiş (Plan 12):**
- Diken Sözleşmesi (Pact of Punishment) full
- Hediye Boncukları (keepsakes) full UI
- Ek constraint tile (İkiz, Donmuş, 2 Konmaz, Lanetli, Yankı, Kayan)
- Mum Modu puzzle-içi tick
- Daily challenge

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `src/rogue/talents.js` | Create | İpliklik talent registry + 6 talent + effect helpers |
| `src/rogue/charms.js` | Create | Boncuk Dizimi charm registry + 6 charm + effect helpers |
| `src/rogue/neow.js` | Create | Yuva Fısıltısı blessing registry + roll |
| `src/rogue/tiles.js` | Create | Constraint tile registry + applyTilesToPuzzle (Sis impl) |
| `src/rogue/achievements.js` | Modify | emit guard fix (semantic) |
| `src/rogue/stub-realm.js` | Delete | Dead code cleanup |
| `index.html` | Modify | İpliklik UI, Boncuk Dizimi UI (Karakter), Neow modal, pati izi SVG, Sis reveal, talent/charm effect application |
| `tests/core.test.js` | Modify | New asserts: talents + charms + neow + tiles + emit |
| `docs/log/plan-11-progress.md` | Create | Progress notları |

---

## Görevler

### Task 1: Branch + log

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-11 -b plan-11-gap-fillers
cd "../slitherlink-plan-11"
```

`docs/log/plan-11-progress.md`:
```markdown
# Plan 11 Progress
- [ ] Task 1: Branch + log
## Phase A — İpliklik
- [ ] Task 2: src/rogue/talents.js
- [ ] Task 3: İpliklik UI render + spend handler
- [ ] Task 4: Run start: apply talent effects
## Phase B — Charms
- [ ] Task 5: src/rogue/charms.js
- [ ] Task 6: Karakter Boncuk Dizimi UI (3 slot)
- [ ] Task 7: Run start: apply charm effects
## Phase C — Pati izi
- [ ] Task 8: Win modal SVG paw animation (per-realm)
## Phase D — Neow
- [ ] Task 9: src/rogue/neow.js + 8 blessing
- [ ] Task 10: Run start Neow modal
## Phase E — Sis tile
- [ ] Task 11: src/rogue/tiles.js + Sis impl
- [ ] Task 12: Puzzle render Sis hidden + reveal on tap
## Phase F — Fixes
- [ ] Task 13: achievements.js emit guard fix + stub-realm.js sil + run.wasResumed
## Test + Final
- [ ] Task 14: tests/core.test.js genişlet
- [ ] Task 15: Final + merge + push
```

Commit: `chore(plan-11): start — branch + log`

---

### Task 2: src/rogue/talents.js

```javascript
// src/rogue/talents.js — İpliklik (Mirror of Night) — kalıcı pasifler

export const TALENTS={
  "dur-dengesi":{
    id:"dur-dengesi",
    name:"Dur Dengesi",
    desc:"Koşu başında +1 can.",
    cost:10,
    effect:{type:"bonus-life",amount:1},
  },
  "sezgi":{
    id:"sezgi",
    name:"Sezgi",
    desc:"İlk hint ücretsiz (zaman cezası yok).",
    cost:15,
    effect:{type:"first-hint-free"},
  },
  "yun-avantaji":{
    id:"yun-avantaji",
    name:"Yün Avantajı",
    desc:"Sandık'ta +1 seçenek (3 yerine 4).",
    cost:20,
    effect:{type:"chest-extra-offer",amount:1},
  },
  "sessiz-tabaka":{
    id:"sessiz-tabaka",
    name:"Sessiz Tabaka",
    desc:"Rest düğümlerinde +1 can yenilenir (toplam +2).",
    cost:25,
    effect:{type:"rest-bonus-heal",amount:1},
  },
  "sabir-pusulasi":{
    id:"sabir-pusulasi",
    name:"Sabır Pusulası",
    desc:"Koşu başında bir extra hint hakkı.",
    cost:30,
    effect:{type:"bonus-hint",amount:1},
  },
  "yildiz-olcusu":{
    id:"yildiz-olcusu",
    name:"Yıldız Ölçüsü",
    desc:"Boss yenince +5 ekstra iplik.",
    cost:40,
    effect:{type:"boss-bonus-thread",amount:5},
  },
};

export function getTalent(id){return TALENTS[id];}
export function isUnlocked(meta,id){return !!(meta?.loomHall?.unlockedTalents||[]).includes(id);}
export function canAfford(meta,id){const t=TALENTS[id];return t&&meta.currencies.thread>=t.cost;}
export function purchase(meta,id){
  const t=TALENTS[id];
  if(!t)return false;
  if(isUnlocked(meta,id))return false;
  if(!canAfford(meta,id))return false;
  if(!meta.loomHall)meta.loomHall={unlockedTalents:[],activeTalents:{}};
  if(!meta.loomHall.unlockedTalents)meta.loomHall.unlockedTalents=[];
  meta.loomHall.unlockedTalents.push(id);
  meta.currencies.thread-=t.cost;
  return true;
}

/** Compute aggregate effects from all unlocked talents — used at run start. */
export function aggregateEffects(meta){
  const eff={
    bonusLife:0,
    bonusHint:0,
    firstHintFree:false,
    chestExtraOffer:0,
    restBonusHeal:0,
    bossBonusThread:0,
  };
  const unlocked=meta?.loomHall?.unlockedTalents||[];
  for(const id of unlocked){
    const t=TALENTS[id];
    if(!t)continue;
    const e=t.effect;
    if(e.type==="bonus-life")eff.bonusLife+=e.amount;
    else if(e.type==="bonus-hint")eff.bonusHint+=e.amount;
    else if(e.type==="first-hint-free")eff.firstHintFree=true;
    else if(e.type==="chest-extra-offer")eff.chestExtraOffer+=e.amount;
    else if(e.type==="rest-bonus-heal")eff.restBonusHeal+=e.amount;
    else if(e.type==="boss-bonus-thread")eff.bossBonusThread+=e.amount;
  }
  return eff;
}
```

Commit: `feat(rogue): talents.js — 6 İpliklik talent + purchase + aggregateEffects`

---

### Task 3: İpliklik UI render + spend

Mevcut `renderIpliklik` placeholder'ını değiştir:

```javascript
function renderIpliklik(){
  const eff=talentEffects(meta);
  const html=`
    <div style="text-align:center;padding:16px 0 8px;">
      <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:var(--accent);">iplik bakiyesi</div>
      <div style="font-family:var(--font-serif);font-size:32px;font-weight:500;color:var(--ink);margin-top:2px;">${meta.currencies.thread||0}</div>
    </div>
    <p style="text-align:center;font-family:var(--font-serif);font-style:italic;color:var(--ink-dim);font-size:13px;padding:0 18px 8px;line-height:1.5;">
      koşulardan kazanılan iplik burada<br>kalıcı yetenekler olarak örülür.
    </p>
    <div style="display:flex;flex-direction:column;gap:10px;padding:8px 4px;">
      ${Object.values(TALENTS).map(t=>{
        const owned=isTalentUnlocked(meta,t.id);
        const afford=canAffordTalent(meta,t.id);
        return `
          <div style="background:${owned?'var(--panel-2)':'var(--panel)'};border:1px solid ${owned?'var(--accent)':'var(--hairline)'};border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:12px;">
            <div style="flex:1;">
              <div style="font-family:var(--font-serif);font-weight:600;font-size:15px;color:var(--ink);">${t.name}</div>
              <div style="color:var(--muted);font-size:12.5px;margin-top:3px;font-family:var(--font-serif);font-style:italic;">${t.desc}</div>
            </div>
            ${owned?
              `<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);">açıldı</span>`:
              `<button class="opt" data-talent="${t.id}" ${afford?"":"disabled"} style="background:${afford?'var(--ink)':'var(--panel-2)'};color:${afford?'var(--bg)':'var(--muted)'};border:1px solid ${afford?'var(--ink)':'var(--hairline)'};font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;padding:8px 12px;">${t.cost} İplik</button>`
            }
          </div>
        `;
      }).join("")}
    </div>
  `;
  $("ipliklikContent").innerHTML=html;
  $("ipliklikContent").querySelectorAll("[data-talent]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id=btn.dataset.talent;
      if(purchaseTalent(meta,id)){
        saveMeta();
        renderIpliklik();
      }
    });
  });
}
```

Index.html imports kısmına ekle:
```javascript
import {TALENTS, isUnlocked as isTalentUnlocked, canAfford as canAffordTalent, purchase as purchaseTalent, aggregateEffects as talentEffects} from "./src/rogue/talents.js";
```

Commit: `feat(rogue-ui): İpliklik functional — talent grid + spend + balance`

---

### Task 4: Run start — talent effects apply

`startRogueRun` içinde activeRun yaratıldıktan sonra:

```javascript
// Talent effects
const tEff=talentEffects(meta);
if(tEff.bonusLife){
  activeRun.lives.max+=tEff.bonusLife;
  activeRun.lives.current+=tEff.bonusLife;
}
// İpucu bonusu: rogue run state'inde tracker
activeRun.bonusHints=tEff.bonusHint||0;
activeRun.firstHintFree=tEff.firstHintFree;
activeRun.chestExtraOffer=tEff.chestExtraOffer||0;
activeRun.restBonusHeal=tEff.restBonusHeal||0;
activeRun.bossBonusThread=tEff.bossBonusThread||0;
```

Rest düğümünde `restBonusHeal`:
```javascript
}else if(node.type==="rest"){
  const heal=1+(run.restBonusHeal||0);
  run.lives.current=Math.min(run.lives.max,run.lives.current+heal);
```

Chest'te extra offer:
```javascript
const offerCount=3+(run.chestExtraOffer||0);
const offers=rollRelicOffer(realm.relicPool||[],offerCount,rng).filter(r=>!run.relics.includes(r.id));
```

Boss yendiğinde extra iplik:
```javascript
if(node&&node.type==="boss"){
  // ...mevcut...
  if(run.bossBonusThread)meta.currencies.thread=(meta.currencies.thread||0)+run.bossBonusThread;
```

Commit: `feat(rogue): run start applies talent effects (life, hint, chest, rest, boss bonus)`

---

### Task 5: src/rogue/charms.js

```javascript
// src/rogue/charms.js — Boncuk Dizimi (Hollow Knight Charms)

export const CHARMS={
  "sogut-yapragi-charm":{
    id:"sogut-yapragi-charm",
    name:"Söğüt Yaprağı",
    glyph:"❦",
    desc:"Koşu başında +1 hint.",
    cost:3, // bead
    effect:{type:"bonus-hint",amount:1},
  },
  "yun-yumagi":{
    id:"yun-yumagi",
    name:"Yün Yumağı",
    glyph:"●",
    desc:"Rest düğümlerinde +1 ekstra can.",
    cost:5,
    effect:{type:"rest-bonus-heal",amount:1},
  },
  "kelebek-kanadi":{
    id:"kelebek-kanadi",
    name:"Kelebek Kanadı",
    glyph:"✿",
    desc:"Event'lerde +1 seçenek.",
    cost:5,
    effect:{type:"event-extra-choice",amount:1},
  },
  "ay-muhru-charm":{
    id:"ay-muhru-charm",
    name:"Ay Mührü",
    glyph:"☾",
    desc:"Koşuda 1 ekstra geri al hakkı.",
    cost:7,
    effect:{type:"bonus-undo",amount:1},
  },
  "gece-pusulasi-charm":{
    id:"gece-pusulasi-charm",
    name:"Gece Pusulası",
    glyph:"✧",
    desc:"Koşu başında harita önceden görünür.",
    cost:8,
    effect:{type:"map-preview"},
  },
  "pati-izi":{
    id:"pati-izi",
    name:"Pati İzi",
    glyph:"❀",
    desc:"Visited node'lardan +1 iplik.",
    cost:4,
    effect:{type:"visited-thread",amount:1},
  },
};

export function getCharm(id){return CHARMS[id];}
export function isUnlocked(meta,id){return !!(meta?.charms?.unlocked||[]).includes(id);}
export function isEquipped(meta,id){return !!(meta?.charms?.equipped||[]).includes(id);}
export function canAfford(meta,id){const c=CHARMS[id];return c&&meta.currencies.bead>=c.cost;}
export function purchase(meta,id){
  const c=CHARMS[id];
  if(!c||isUnlocked(meta,id)||!canAfford(meta,id))return false;
  if(!meta.charms)meta.charms={unlocked:[],equipped:[]};
  if(!meta.charms.unlocked)meta.charms.unlocked=[];
  meta.charms.unlocked.push(id);
  meta.currencies.bead-=c.cost;
  return true;
}
export function equip(meta,id,maxSlots=3){
  if(!isUnlocked(meta,id))return false;
  if(!meta.charms)meta.charms={unlocked:[],equipped:[]};
  if(!meta.charms.equipped)meta.charms.equipped=[];
  if(meta.charms.equipped.includes(id))return false;
  if(meta.charms.equipped.length>=maxSlots)return false;
  meta.charms.equipped.push(id);
  return true;
}
export function unequip(meta,id){
  if(!meta.charms||!meta.charms.equipped)return false;
  meta.charms.equipped=meta.charms.equipped.filter(c=>c!==id);
  return true;
}

export function aggregateEffects(meta){
  const eff={bonusHint:0,restBonusHeal:0,eventExtraChoice:0,bonusUndo:0,mapPreview:false,visitedThread:0};
  const equipped=meta?.charms?.equipped||[];
  for(const id of equipped){
    const c=CHARMS[id];
    if(!c)continue;
    const e=c.effect;
    if(e.type==="bonus-hint")eff.bonusHint+=e.amount;
    else if(e.type==="rest-bonus-heal")eff.restBonusHeal+=e.amount;
    else if(e.type==="event-extra-choice")eff.eventExtraChoice+=e.amount;
    else if(e.type==="bonus-undo")eff.bonusUndo+=e.amount;
    else if(e.type==="map-preview")eff.mapPreview=true;
    else if(e.type==="visited-thread")eff.visitedThread+=e.amount;
  }
  return eff;
}
```

Commit: `feat(rogue): charms.js — 6 Boncuk Dizimi + purchase/equip/effects`

---

### Task 6: Karakter Boncuk Dizimi UI

`renderKarakter` sonuna (permanent starter'dan sonra) Boncuk Dizimi bölümü ekle:

```javascript
const charmsHtml=`
  <div style="margin-top:18px;padding:0 4px;">
    <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;">boncuk dizimi · ${(meta.charms?.equipped||[]).length}/3</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
      ${[0,1,2].map(i=>{
        const eq=(meta.charms?.equipped||[])[i];
        const c=eq?CHARMS[eq]:null;
        return `
          <div data-charm-slot="${i}" style="background:${c?'var(--panel-2)':'var(--panel)'};border:1px ${c?'solid var(--accent)':'dashed var(--hairline)'};border-radius:12px;padding:14px 8px;text-align:center;cursor:pointer;min-height:88px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            ${c?`
              <div style="color:var(--accent);font-family:var(--font-serif);font-size:22px;">${c.glyph}</div>
              <div style="font-family:var(--font-serif);font-weight:600;font-size:11.5px;color:var(--ink);margin-top:4px;line-height:1.2;">${c.name}</div>
            `:`
              <div style="color:var(--muted);font-family:var(--font-serif);font-size:20px;opacity:.4;">+</div>
              <div style="font-family:var(--font-mono);font-size:8.5px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;margin-top:4px;">boş</div>
            `}
          </div>
        `;
      }).join("")}
    </div>
    <button class="opt" id="charmsLibBtn" style="margin-top:10px;width:100%;background:transparent;border:1px solid var(--hairline-2);color:var(--ink-dim);">Boncuk Koleksiyonu</button>
  </div>
`;

// Inject after starter
const fullHtml=existingHtml+`<div style="margin-top:16px;padding:0 4px;">${starterHtml}</div>${charmsHtml}`;
```

Charm slot click → unequip; library button → showCharmsLibrary modal:

```javascript
$("karakterContent").querySelectorAll("[data-charm-slot]").forEach(el=>{
  el.addEventListener("click",()=>{
    const i=+el.dataset.charmSlot;
    const eq=(meta.charms?.equipped||[])[i];
    if(eq){
      unequipCharm(meta,eq);
      saveMeta();
      renderKarakter();
    }else{
      openCharmsLibrary();
    }
  });
});
$("charmsLibBtn")?.addEventListener("click",openCharmsLibrary);
```

```javascript
function openCharmsLibrary(){
  const html=`
    <h2>Boncuk Koleksiyonu</h2>
    <p>Boncuk: <b>${meta.currencies.bead||0}</b> · Açık: ${(meta.charms?.unlocked||[]).length}/${Object.keys(CHARMS).length} · Dizili: ${(meta.charms?.equipped||[]).length}/3</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin:14px 0;max-height:55dvh;overflow-y:auto;">
      ${Object.values(CHARMS).map(c=>{
        const owned=isCharmUnlocked(meta,c.id);
        const eq=isCharmEquipped(meta,c.id);
        const afford=canAffordCharm(meta,c.id);
        let action;
        if(eq){
          action=`<button class="opt" data-charm-act="unequip" data-charm="${c.id}" style="background:var(--panel-2);color:var(--accent);border:1px solid var(--accent);font-size:11px;">Çıkar</button>`;
        }else if(owned){
          const slotFull=(meta.charms?.equipped||[]).length>=3;
          action=`<button class="opt" data-charm-act="equip" data-charm="${c.id}" ${slotFull?'disabled':''} style="background:${slotFull?'var(--panel)':'var(--ink)'};color:${slotFull?'var(--muted)':'var(--bg)'};border:none;font-size:11px;">${slotFull?'slot dolu':'Diz'}</button>`;
        }else{
          action=`<button class="opt" data-charm-act="buy" data-charm="${c.id}" ${afford?'':'disabled'} style="background:${afford?'var(--ink)':'var(--panel-2)'};color:${afford?'var(--bg)':'var(--muted)'};border:1px solid ${afford?'var(--ink)':'var(--hairline)'};font-family:var(--font-mono);font-size:11px;">${c.cost} Boncuk</button>`;
        }
        return `
          <div style="background:${eq?'var(--panel-2)':'var(--panel)'};border:1px solid ${eq?'var(--accent)':'var(--hairline)'};border-radius:12px;padding:11px 14px;display:flex;align-items:center;gap:12px;">
            <span style="color:${owned?'var(--accent)':'var(--muted)'};font-family:var(--font-serif);font-size:22px;">${c.glyph}</span>
            <div style="flex:1;">
              <div style="font-family:var(--font-serif);font-weight:600;font-size:14px;color:var(--ink);">${c.name}</div>
              <div style="color:var(--muted);font-size:12px;margin-top:2px;font-family:var(--font-serif);font-style:italic;">${c.desc}</div>
            </div>
            ${action}
          </div>
        `;
      }).join("")}
    </div>
  `;
  openRogueModal(html,e=>{
    const btn=e.target.closest("[data-charm-act]");
    if(!btn)return;
    const id=btn.dataset.charm;const act=btn.dataset.charmAct;
    let changed=false;
    if(act==="buy")changed=purchaseCharm(meta,id);
    else if(act==="equip")changed=equipCharm(meta,id);
    else if(act==="unequip")changed=unequipCharm(meta,id);
    if(changed){
      saveMeta();
      openCharmsLibrary(); // re-render
    }
  });
}
```

Imports:
```javascript
import {CHARMS, isUnlocked as isCharmUnlocked, isEquipped as isCharmEquipped, canAfford as canAffordCharm, purchase as purchaseCharm, equip as equipCharm, unequip as unequipCharm, aggregateEffects as charmEffects} from "./src/rogue/charms.js";
```

Commit: `feat(rogue-ui): Karakter Boncuk Dizimi 3 slot + library modal + equip/unequip`

---

### Task 7: Run start — charm effects apply

`startRogueRun` içinde talent effects'ten sonra:

```javascript
const cEff=charmEffects(meta);
// Charm effects merged with talent effects
activeRun.bonusHints=(activeRun.bonusHints||0)+cEff.bonusHint;
activeRun.restBonusHeal=(activeRun.restBonusHeal||0)+cEff.restBonusHeal;
activeRun.eventExtraChoice=cEff.eventExtraChoice||0;
activeRun.bonusUndo=cEff.bonusUndo||0;
activeRun.mapPreview=cEff.mapPreview||false;
activeRun.visitedThread=cEff.visitedThread||0;
```

`moveTo` çağrısı sonrası (handleRogueNode'da node geçildiğinde) visitedThread bonusu:

```javascript
// Charm: visited thread
if(run.visitedThread){meta.currencies.thread=(meta.currencies.thread||0)+run.visitedThread;saveMeta();}
```

Event modal'da extra choice (eventExtraChoice çoğunlukla yeni choice ekler — v1: data yok ama UX placeholder olarak event başlığına `★` ekle):

(SKIP for v1 — efekt placeholder mevcut events'lerin kendi choice count'una bağlı, fazladan ek "yardımcı seçenek" eklemek kompleks.)

Commit: `feat(rogue): charm effects apply at run start (hints, rest, thread)`

---

### Task 8: Pati izi animation (win modal'da)

Win modal'a SVG pati izi animasyonu ekle. CSS keyframe + SVG.

CSS bloğunun sonuna:
```css
@keyframes pawTrail {
  0% { opacity: 0; transform: translateX(-30px) translateY(8px) rotate(-12deg); }
  20% { opacity: 0.7; }
  100% { opacity: 0; transform: translateX(110px) translateY(-4px) rotate(8deg); }
}
.paw-trail { position: absolute; left: 50%; top: 50%; margin-left: -70px; margin-top: -20px; pointer-events: none; }
.paw-trail svg { animation: pawTrail 2.4s ease-in-out 1; opacity: 0; }
.paw-trail .paw + .paw { margin-left: 8px; }
.paw-trail .paw:nth-child(1) svg { animation-delay: 0s; }
.paw-trail .paw:nth-child(2) svg { animation-delay: 0.18s; }
.paw-trail .paw:nth-child(3) svg { animation-delay: 0.36s; }
.paw-trail .paw:nth-child(4) svg { animation-delay: 0.54s; }
```

`win()` fonksiyonunda confetti tetiklendikten sonra:
```javascript
setTimeout(()=>{
  showPawTrail();
},900);
```

Yardımcı:
```javascript
function showPawTrail(){
  // Realm-specific accent color
  let color="#A89B8B"; // default taupe
  if(ctx.mode==="rogue"&&ctx.realmId){
    if(ctx.realmId==="sogut-esigi")color="#B89F8A";
    else if(ctx.realmId==="yildiz-gecidi")color="#99A3B0";
  }
  const modal=document.querySelector("#winOverlay .modal");
  if(!modal)return;
  const old=modal.querySelector(".paw-trail");
  if(old)old.remove();
  const trail=document.createElement("div");
  trail.className="paw-trail";
  trail.innerHTML=[0,1,2,3].map(()=>`
    <span class="paw" style="display:inline-block;">
      <svg width="14" height="14" viewBox="0 0 14 14">
        <ellipse cx="3" cy="5" rx="1.3" ry="1.8" fill="${color}"/>
        <ellipse cx="6" cy="3" rx="1.3" ry="1.8" fill="${color}"/>
        <ellipse cx="9" cy="3" rx="1.3" ry="1.8" fill="${color}"/>
        <ellipse cx="12" cy="5" rx="1.3" ry="1.8" fill="${color}"/>
        <ellipse cx="7.5" cy="9.5" rx="3" ry="2.5" fill="${color}"/>
      </svg>
    </span>
  `).join("");
  modal.style.position="relative";
  modal.appendChild(trail);
  setTimeout(()=>trail.remove(),2800);
}
```

Commit: `feat(rogue-ui): pati izi animation — win modal'da realm-renkli SVG trail`

---

### Task 9: src/rogue/neow.js + Task 10: Run start Neow modal

```javascript
// src/rogue/neow.js — Yuva Fısıltısı (Slay the Spire Neow)

export const NEOW_BLESSINGS=[
  {id:"tok-karin",name:"Tok Karın",desc:"+1 başlangıç canı.",effect:{type:"bonus-life",amount:1}},
  {id:"ac-tilki",name:"Aç Tilki",desc:"-1 can ama relic'ler 1 tier yüksek.",effect:{type:"trade",cost:{life:1},gain:{relicTier:1}}},
  {id:"sut-tabagi",name:"Süt Tabağı",desc:"Koşu içi iplik 2x.",effect:{type:"thread-mult",amount:2}},
  {id:"sakli-hediye",name:"Saklı Hediye",desc:"Bir gizli sandık.",effect:{type:"bonus-chest",amount:1}},
  {id:"yun-aksami",name:"Yün Akşamı",desc:"Rest düğümlerinde +1 ekstra can.",effect:{type:"rest-bonus-heal",amount:1}},
  {id:"yildiz-eseri",name:"Yıldız Eseri",desc:"İlk relic kesin nadir.",effect:{type:"first-relic-rare"}},
  {id:"sessiz-baslangic",name:"Sessiz Başlangıç",desc:"+3 iplik.",effect:{type:"thread",amount:3}},
  {id:"siyah-yün",name:"Siyah Yün",desc:"Patron savaşında +1 can buffer.",effect:{type:"boss-life-buffer",amount:1}},
];

export function rollBlessings(rng,count=3){
  const shuffled=NEOW_BLESSINGS.slice();
  for(let i=shuffled.length-1;i>0;i--){
    const j=(rng()*(i+1))|0;
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  return shuffled.slice(0,count);
}

export function applyBlessing(run,meta,blessing){
  const e=blessing.effect;
  if(!e)return;
  if(e.type==="bonus-life"){run.lives.max+=e.amount;run.lives.current+=e.amount;}
  else if(e.type==="trade"){
    run.lives.max-=e.cost.life;run.lives.current-=e.cost.life;
    run.relicTierBonus=(run.relicTierBonus||0)+(e.gain.relicTier||0);
  }
  else if(e.type==="thread-mult")run.threadMultiplier=(run.threadMultiplier||1)*e.amount;
  else if(e.type==="bonus-chest")run.bonusChests=(run.bonusChests||0)+e.amount;
  else if(e.type==="rest-bonus-heal")run.restBonusHeal=(run.restBonusHeal||0)+e.amount;
  else if(e.type==="first-relic-rare")run.firstRelicRare=true;
  else if(e.type==="thread")meta.currencies.thread=(meta.currencies.thread||0)+e.amount;
  else if(e.type==="boss-life-buffer")run.bossLifeBuffer=(run.bossLifeBuffer||0)+e.amount;
  run.neowBlessing=blessing.id;
}
```

`index.html` startRogueRun içinde, activeRun yaratıldıktan sonra (talent + charm effects'ten önce):

```javascript
// Yuva Fısıltısı (Neow) modal — yeni koşularda
const isNewRun=!store.get(KEYS.rogueRun,null)||store.get(KEYS.rogueRun,null).ended;
if(isNewRun){
  let h=2166136261>>>0;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}
  const neowRng=mulberry32(h>>>0);
  const blessings=neowBlessings(neowRng,3);
  openNeowModal(activeRun,blessings,()=>{
    store.set(KEYS.rogueRun,activeRun);
    renderRogueMap(activeRun);
    showScreen("s-rogue-map");
  });
  return; // proceed in modal callback
}
```

`openNeowModal` fonksiyonu:
```javascript
function openNeowModal(run,blessings,after){
  const html=`
    <h2>Yuva Fısıltısı</h2>
    <p>Jedi uyanıyor. Bir armağan seç — koşuna seninle gelir.</p>
    <div style="display:flex;flex-direction:column;gap:10px;margin:14px 0;">
      ${blessings.map(b=>`
        <button class="opt" data-bless="${b.id}" style="text-align:left;padding:13px 14px;background:var(--panel);border:1px solid var(--hairline);">
          <div style="font-family:var(--font-serif);font-weight:600;font-size:15px;color:var(--ink);">${b.name}</div>
          <div style="color:var(--muted);font-size:12.5px;margin-top:3px;font-family:var(--font-serif);font-style:italic;">${b.desc}</div>
        </button>
      `).join("")}
    </div>
  `;
  openRogueModal(html,e=>{
    const btn=e.target.closest("[data-bless]");
    if(!btn)return;
    const b=blessings.find(x=>x.id===btn.dataset.bless);
    applyNeowBlessing(run,meta,b);
    saveMeta();
    closeRogueModal();
    if(after)after();
  });
}
```

Import:
```javascript
import {NEOW_BLESSINGS, rollBlessings as neowBlessings, applyBlessing as applyNeowBlessing} from "./src/rogue/neow.js";
```

Commit: `feat(rogue): Yuva Fısıltısı (Neow) — 8 blessing + run start modal`

---

### Task 11: src/rogue/tiles.js (Sis tile minimum)

```javascript
// src/rogue/tiles.js — Constraint tiles. v1: Sis (hidden clue).

export const TILE_TYPES={
  "sis":{
    id:"sis",
    name:"Sis Hücresi",
    desc:"Sayı gizli — dokun, 3 saniye reveal.",
    realms:["karanlik-igne","yildiz-gecidi"],
  },
};

/**
 * Apply constraint tiles to a puzzle. Mutates puzzle by adding `tiles` map.
 * tiles: { "r,c": { type: "sis", revealed: false } }
 * @param {object} puzzle
 * @param {string} realmId
 * @param {function} rng
 * @returns {object} same puzzle with `.tiles` added
 */
export function applyTiles(puzzle,realmId,rng,density=0.2){
  if(!puzzle.tiles)puzzle.tiles={};
  if(realmId==="karanlik-igne"||realmId==="yildiz-gecidi"){
    for(let r=0;r<puzzle.R;r++)for(let c=0;c<puzzle.C;c++){
      if(puzzle.clue[r][c]<0)continue;
      if(rng()<density){
        puzzle.tiles[r+","+c]={type:"sis",revealed:false};
      }
    }
  }
  return puzzle;
}

export function isTileRevealed(puzzle,r,c){
  const t=puzzle.tiles&&puzzle.tiles[r+","+c];
  return !t||t.revealed;
}

export function revealTile(puzzle,r,c){
  if(puzzle.tiles&&puzzle.tiles[r+","+c]){
    puzzle.tiles[r+","+c].revealed=true;
    return true;
  }
  return false;
}
```

Index.html'de handleRogueNode'da puzzle yaratıldıktan sonra applyTiles çağır:

```javascript
const puzzle=makePuzzle(size,size,keep,rng);
applyTiles(puzzle,run.realmId,mulberry32(hashSeed(run.seed+"-"+nodeId+"-tiles")),0.22);
startGame(puzzle,...);
```

Puzzle render'ında (mevcut render fonksiyonunda) clue text:
- Eğer tile sis ve revealed değil → "?" göster
- Tıklama: o hücreyi reveal (3 saniye sonra tekrar gizle)

Render fonksiyonunda mevcut `t.textContent=P.clue[r][c];` satırını değiştir:
```javascript
const tile=P.tiles&&P.tiles[r+","+c];
const hidden=tile&&!tile.revealed;
t.textContent=hidden?"?":P.clue[r][c];
if(hidden){
  t.style.cursor="pointer";
  t.setAttribute("class","clue sis-hidden");
  t.addEventListener("click",e=>{
    e.stopPropagation();
    tile.revealed=true;
    t.textContent=P.clue[r][c];
    t.removeAttribute("style");
    t.setAttribute("class","clue");
    setTimeout(()=>{
      if(P.tiles&&P.tiles[r+","+c]){
        tile.revealed=false;
        render();
      }
    },3000);
  });
}
```

CSS:
```css
.clue.sis-hidden { fill: var(--accent); font-style: italic; opacity: 0.7; }
```

Import:
```javascript
import {applyTiles, revealTile} from "./src/rogue/tiles.js";
```

Commit: `feat(rogue): Sis constraint tile — D2/D3 puzzle'larında %22 yoğunluk + tap reveal`

---

### Task 13: Fixes — achievement emit + stub-realm sil + run.wasResumed

**Edit 1 — achievements.js emit guard düzelt:**

old_string:
```
export function emit(triggerId, meta, onUnlock){
  if(meta.achievements[triggerId])return false; // not the achievement id but trigger
  for(const ach of Object.values(ACHIEVEMENTS)){
```

new_string:
```
export function emit(triggerId, meta, onUnlock){
  // No early return — iterate and let per-achievement guard handle duplicates
  for(const ach of Object.values(ACHIEVEMENTS)){
```

**Edit 2 — stub-realm.js sil:**

```bash
rm src/rogue/stub-realm.js
```

**Edit 3 — run.wasResumed home Resume click'inde set et:**

`renderHome` event handler'ında rogue card'a tıklayınca resume varsa flag:

```javascript
if(id==="rogue"){
  const activeRun=store.get(KEYS.rogueRun,null);
  if(activeRun&&!activeRun.ended){
    activeRun.wasResumed=true;
    store.set(KEYS.rogueRun,activeRun);
    renderRogueMap(activeRun);
    showScreen("s-rogue-map");
  }else{
    renderYuva();
    showScreen("s-yuva");
  }
}
```

Commit: `fix(rogue): achievement emit guard + stub-realm.js cleanup + wasResumed flag`

---

### Task 14: tests/core.test.js genişlet

Mevcut testlerin sonuna ekle:

```javascript
import {TALENTS, purchase as purchaseTalent, aggregateEffects as talentEffects} from "../src/rogue/talents.js";
import {CHARMS, purchase as purchaseCharm, equip as equipCharm, aggregateEffects as charmEffects} from "../src/rogue/charms.js";
import {NEOW_BLESSINGS, rollBlessings, applyBlessing} from "../src/rogue/neow.js";
import {TILE_TYPES, applyTiles, revealTile} from "../src/rogue/tiles.js";

test("talents registry has 6 entries",()=>eq(Object.keys(TALENTS).length,6));
test("charms registry has 6 entries",()=>eq(Object.keys(CHARMS).length,6));
test("neow has 8 blessings",()=>eq(NEOW_BLESSINGS.length,8));
test("tiles has sis type",()=>assert(TILE_TYPES.sis));

test("talent purchase decrements thread",()=>{
  const m={currencies:{thread:100,bead:0,stardust:0},loomHall:{unlockedTalents:[]}};
  assert(purchaseTalent(m,"dur-dengesi"));
  eq(m.currencies.thread,90);
  eq(m.loomHall.unlockedTalents[0],"dur-dengesi");
});

test("talent aggregateEffects sums life bonuses",()=>{
  const m={loomHall:{unlockedTalents:["dur-dengesi"]}};
  eq(talentEffects(m).bonusLife,1);
});

test("charm equip enforces 3-slot cap",()=>{
  const m={currencies:{bead:100,thread:0,stardust:0},charms:{unlocked:["sogut-yapragi-charm","yun-yumagi","kelebek-kanadi","ay-muhru-charm"],equipped:[]}};
  assert(equipCharm(m,"sogut-yapragi-charm"));
  assert(equipCharm(m,"yun-yumagi"));
  assert(equipCharm(m,"kelebek-kanadi"));
  eq(equipCharm(m,"ay-muhru-charm"),false); // slot full
});

test("neow rollBlessings deterministic",()=>{
  const rng1=mulberry32(42),rng2=mulberry32(42);
  const a=rollBlessings(rng1,3),b=rollBlessings(rng2,3);
  eq(JSON.stringify(a),JSON.stringify(b));
});

test("tiles apply adds sis to D2/D3 puzzles",()=>{
  const rng=mulberry32(hashSeed("tile-test"));
  const p=makePuzzle(6,6,1.0,rng);
  applyTiles(p,"karanlik-igne",mulberry32(hashSeed("tile-test-2")),0.5);
  let count=0;
  for(const k in (p.tiles||{}))count++;
  assert(count>0,"should have at least one sis tile");
});
```

Commit: `test(core): talents + charms + neow + tiles smoke asserts`

---

### Task 15: Final + merge + push + smoke test

- [ ] Roadmap güncelle: yeni Plan 11 satırı
- [ ] Progress log final
- [ ] Branch push + main merge + push
- [ ] Smoke test koş:
  ```bash
  cd "/Users/Erdo/Desktop/Claude Projects/slitherlink-plan-11"
  # Quick Node check  
  for f in src/rogue/talents.js src/rogue/charms.js src/rogue/neow.js src/rogue/tiles.js; do
    node --check "$f"
  done
  # Comprehensive smoke from project
  cp /Users/Erdo/.../_smoke-test.mjs ./ # see existing smoke script
  ```

Roadmap satırı:
```markdown
| 11 — Gap fillers (İpliklik + Charms + Pati izi + Neow + Sis) | ✓ tamamlandı | <SHA> |
```

---

## Self-Review

**Spec coverage:**
- ✅ İpliklik functional (6 talent + purchase + run effects)
- ✅ Boncuk Dizimi (6 charm + equip 3-slot + run effects)
- ✅ Pati izi animation (per-realm color)
- ✅ Yuva Fısıltısı (8 blessing + start modal)
- ✅ Sis constraint tile (D2/D3, tap reveal)
- ✅ Fixes (emit guard, stub cleanup, wasResumed)
- ✅ Test harness extended

**Önerilen dispatch:** Tek dispatch — 15 task.
