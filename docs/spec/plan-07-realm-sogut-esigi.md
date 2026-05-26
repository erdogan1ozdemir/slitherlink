# Plan 07 · Söğüt Eşiği (D1) — content + relic + event + achievement engine

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** İlk gerçek diyar — Söğüt Eşiği — content + rogue oynanışın etrafındaki temel sistemler. Stub realm yerine seçilince Söğüt Eşiği'ne girer; chest/event node'ları gerçek modal'lar açar; boss yenilince Pusula Yıldızı artar; achievement'lar unlock olur ve Jedi'nin Günlüğü'ne yazılır.

**Architecture:** Yeni modüller `src/rogue/`. Realm registry pattern (`REALMS[id]` lookup), relic + event + achievement registry'leri. Modal UI'lar index.html'de. State `cember:meta` + `cember:rogue:run`.

**Bağımlılık:** Plan 06.

**Tahmini süre:** 5-6 saat.

---

## Scope sınırı

**Plan 07 kapsam içi:**
- Realm registry + Söğüt Eşiği data
- 6 relic (registry + run state + effects)
- 6 event (registry + modal + choices)
- Sandık node → relic offer modal
- Boss puzzle + Pusula Yıldızı increment
- 5 achievement (engine + triggers + jediDiary)
- Lives düşüşü: puzzle terkedilince -1 can
- Yuva ekranı: Söğüt Eşiği unlocked (D2/D3 hâlâ kilitli)

**Plan 07 kapsam dışı (sonraki planlara):**
- İpliklik talent fonksiyonu → Plan 09
- Boncuk Dizimi (charm) → Plan 09
- Constraint tile (Sis + İkiz) → Plan 09
- Yuva Fısıltısı (Neow) → Plan 09 / Plan 10
- Pati izi animation → Plan 10

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `src/rogue/realms.js` | Create | REALMS registry: stub + sogut-esigi |
| `src/rogue/relics.js` | Create | RELICS registry + effect hooks |
| `src/rogue/events.js` | Create | EVENTS registry + choice resolvers |
| `src/rogue/achievements.js` | Create | ACHIEVEMENTS registry + engine (emit + check) |
| `index.html` | Modify | Yuva realm cards, chest modal, event modal, boss flow, achievement notif, Pusula Yıldızı UI |
| `docs/log/plan-07-progress.md` | Create | Progress notları |

---

## Görevler

### Task 1: Branch + dir + progress log

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-07 -b plan-07-realm-sogut-esigi
cd "../slitherlink-plan-07"
```

`docs/log/plan-07-progress.md`:
```markdown
# Plan 07 Progress
- [ ] Task 1: Branch + log
- [ ] Task 2: src/rogue/realms.js (registry + Söğüt Eşiği)
- [ ] Task 3: src/rogue/relics.js (6 relic + effects)
- [ ] Task 4: src/rogue/events.js (6 event + resolvers)
- [ ] Task 5: src/rogue/achievements.js (engine + 5 D1 ach)
- [ ] Task 6: Chest modal + relic offer UI
- [ ] Task 7: Event modal + choice resolver UI
- [ ] Task 8: Boss → Pusula Yıldızı + winRun + currency
- [ ] Task 9: Achievement notification toast + jediDiary
- [ ] Task 10: Yuva realm cards real data + D2 lock
- [ ] Task 11: Final + merge + push
```

Commit: `chore(plan-07): start — branch + log`

---

### Task 2: src/rogue/realms.js — Registry + Söğüt Eşiği

```javascript
// src/rogue/realms.js — Realm registry; Plan 07 = sogut-esigi + stub

export const REALMS={
  "stub-diyar":{
    id:"stub-diyar",
    name:"Deneme Diyarı",
    intro:"Geçici test diyarı.",
    accent:"--accent",
    floors:3,
    floorConfig:[
      {sizes:[4,4],keep:0.85,nodes:["puzzle"]},
      {sizes:[5,5],keep:0.75,nodes:["puzzle","event"]},
      {sizes:[5,5],keep:0.70,nodes:["boss"]},
    ],
    relicPool:[],
    eventPool:[],
    bossName:"Deneme Bekçisi",
    unlockedByDefault:true,
  },
  "sogut-esigi":{
    id:"sogut-esigi",
    name:"Söğüt Eşiği",
    intro:"akşam ışığı, çayır, eski sandık. ilk macera.",
    accent:"--accent-warm",
    floors:5,
    floorConfig:[
      {sizes:[4,4],keep:0.85,nodes:["puzzle"],floorName:"Pervaz"},
      {sizes:[5,5],keep:0.80,nodes:["puzzle","event","chest"],floorName:"Çayır"},
      {sizes:[5,5],keep:0.75,nodes:["puzzle","chest","event"],floorName:"Söğüt Altı"},
      {sizes:[6,6],keep:0.72,nodes:["rest","puzzle"],floorName:"Eski Sandık"},
      {sizes:[6,6],keep:0.68,nodes:["boss"],floorName:"Akşam Işığı"},
    ],
    relicPool:["sogut-yapragi","kelebek-pulu","yun-tohumu","bahcivanin-eldiveni","aksam-mumu","ciyli-yun"],
    eventPool:["yagmur-basladi","kelebek-yolu","eski-sandik","bahcivanin-notu","aksam-cayi","cayir-kedisi"],
    bossName:"Yün Bekçisi",
    bossIntro:"sessiz, hata bağışlayıcı — ama tekrarlanan hata patrona güç verir.",
    unlockedByDefault:true,
  },
};

export function getRealm(id){return REALMS[id];}
export function isRealmUnlocked(id, meta){
  const r=REALMS[id];
  if(!r)return false;
  if(r.unlockedByDefault)return true;
  return !!(meta&&meta.realms&&meta.realms[id]&&meta.realms[id].unlocked);
}
```

Commit: `feat(rogue): realms.js registry + Söğüt Eşiği data`

---

### Task 3: src/rogue/relics.js — 6 relic + effect hooks

```javascript
// src/rogue/relics.js — Relic registry + effect application

export const RELICS={
  "sogut-yapragi":{
    id:"sogut-yapragi",
    name:"Söğüt Yaprağı",
    glyph:"❦",
    desc:"İlk hata cezasız.",
    rarity:"sik",
    realm:"sogut-esigi",
  },
  "kelebek-pulu":{
    id:"kelebek-pulu",
    name:"Kelebek Pulu",
    glyph:"✿",
    desc:"Koşuda +1 ipucu hakkı.",
    rarity:"sik",
    realm:"sogut-esigi",
  },
  "yun-tohumu":{
    id:"yun-tohumu",
    name:"Yün Tohumu",
    glyph:"●",
    desc:"Dinlenme düğümünde +1 can yenilenir.",
    rarity:"sik",
    realm:"sogut-esigi",
  },
  "bahcivanin-eldiveni":{
    id:"bahcivanin-eldiveni",
    name:"Bahçıvanın Eldiveni",
    glyph:"☘",
    desc:"Çarpı işaretleri daha okunaklı.",
    rarity:"sik",
    realm:"sogut-esigi",
  },
  "aksam-mumu":{
    id:"aksam-mumu",
    name:"Akşam Mumu",
    glyph:"♦",
    desc:"Sonraki kattaki düğüm tiplerini önceden gösterir.",
    rarity:"nadir",
    realm:"sogut-esigi",
  },
  "ciyli-yun":{
    id:"ciyli-yun",
    name:"Çiyli Yün",
    glyph:"❉",
    desc:"Olay düğümünde +1 seçenek görünür.",
    rarity:"nadir",
    realm:"sogut-esigi",
  },
};

export function getRelic(id){return RELICS[id];}

/** Run start için bir relic gerekli — random pick (rng) ile. */
export function rollRelicOffer(pool, count, rng){
  const available=pool.slice();
  const chosen=[];
  for(let i=0;i<count&&available.length;i++){
    const idx=(rng()*available.length)|0;
    chosen.push(available.splice(idx,1)[0]);
  }
  return chosen.map(id=>RELICS[id]).filter(Boolean);
}

/** Effect helpers — Plan 07 v1 minimum:
 *  - sogut-yapragi: ilk hata cezasız (lives consumption blocked once)
 *  - kelebek-pulu: hint count visible in HUD; +1 free hint
 *  - bahcivanin-eldiveni: CSS class to game board (.relic-bahcivan)
 *  - Diğerleri: data-only (Plan 09'da effect engine ile bağlanacak)
 */
export function hasRelic(run, relicId){
  return !!(run&&run.relics&&run.relics.includes(relicId));
}
```

Commit: `feat(rogue): relics.js — 6 Söğüt Eşiği relic + helpers`

---

### Task 4: src/rogue/events.js — 6 event + resolvers

```javascript
// src/rogue/events.js — Event registry + choice resolution

export const EVENTS={
  "yagmur-basladi":{
    id:"yagmur-basladi",
    title:"Yağmur Başladı",
    text:"İnce bir yağmur düşüyor çayıra. Bir söğüt altına sığınmak yorgunluğu alır ama yol uzar.",
    choices:[
      {tone:"safe",text:"Sığın ve bekle",result:"+1 can",effect:{type:"heal",amount:1}},
      {tone:"risk",text:"Islak çayırı geç",result:"%50 ihtimal -1 can",effect:{type:"chance-damage",chance:0.5,amount:1}},
      {tone:"pass",text:"Görmezden gel",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"sogut-esigi",
  },
  "kelebek-yolu":{
    id:"kelebek-yolu",
    title:"Kelebek Yolu",
    text:"Bir kelebek senden önde uçuyor. Takip edersen ne göstereceğini bilmiyorsun.",
    choices:[
      {tone:"safe",text:"Takip et",result:"olası iplik bonusu",effect:{type:"thread",amount:3}},
      {tone:"pass",text:"Kendi yoluna git",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"sogut-esigi",
  },
  "eski-sandik":{
    id:"eski-sandik",
    title:"Eski Bir Sandık",
    text:"Çayırın kenarında küçük bir tahta sandık. Açmak biraz zorlama gerektirir.",
    choices:[
      {tone:"safe",text:"Aç",result:"rastgele relic",effect:{type:"relic-offer",count:1}},
      {tone:"pass",text:"Geç",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"sogut-esigi",
  },
  "bahcivanin-notu":{
    id:"bahcivanin-notu",
    title:"Bahçıvanın Notu",
    text:"Tahtaya çakılmış bir not: 'Söğüt yapraklarına dikkat.' Anlamını çözmen biraz zaman alır.",
    choices:[
      {tone:"safe",text:"Yapraklara dikkat et",result:"+2 iplik",effect:{type:"thread",amount:2}},
      {tone:"pass",text:"Görmezden gel",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"sogut-esigi",
  },
  "aksam-cayi":{
    id:"aksam-cayi",
    title:"Akşam Çayı",
    text:"Eski bir kupa, hâlâ ılık çay. Birisi yeni gitmiş gibi.",
    choices:[
      {tone:"safe",text:"İç",result:"+1 can",effect:{type:"heal",amount:1}},
      {tone:"risk",text:"Garip kokuyor, geç",result:"+3 iplik bonusu",effect:{type:"thread",amount:3}},
    ],
    realm:"sogut-esigi",
  },
  "cayir-kedisi":{
    id:"cayir-kedisi",
    title:"Çayır Kedisi",
    text:"Uzakta kıvrılmış bir kedi. Tüyü taupe rengi, sakin gözleri. Sana baktı.",
    choices:[
      {tone:"safe",text:"Yaklaş ve sev",result:"+1 boncuk + 'Jedi'yi Gör' tetiklenir",effect:{type:"bead",amount:1,trigger:"jedi-secret"}},
      {tone:"pass",text:"Dokunma, yoluna git",result:"hiçbir şey olmaz",effect:{type:"none"}},
    ],
    realm:"sogut-esigi",
  },
};

export function getEvent(id){return EVENTS[id];}
export function rollEvent(pool, rng){
  if(!pool||!pool.length)return null;
  return EVENTS[pool[(rng()*pool.length)|0]];
}
```

Commit: `feat(rogue): events.js — 6 Söğüt Eşiği event + choice resolvers`

---

### Task 5: src/rogue/achievements.js — engine + 5 D1 achievement

```javascript
// src/rogue/achievements.js — Achievement registry + engine

export const ACHIEVEMENTS={
  "aksam-isigi":{
    id:"aksam-isigi",
    realm:"sogut-esigi",
    title:"Akşam Işığı",
    body:"Söğüt Eşiği'ni ilk kez geçtin.",
    diary:"Akşam ışığı düştü. Yün Bekçisi başını öne eğdi, geçtin. Bir kapı açıldı.",
    trigger:"realm_cleared:sogut-esigi",
    secret:false,
  },
  "yun-bekcinin-selami":{
    id:"yun-bekcinin-selami",
    realm:"sogut-esigi",
    title:"Yün Bekçisinin Selamı",
    body:"Yün Bekçisi'ni yendin.",
    diary:"Yün Bekçisi sessizce başını eğdi. İpliği selamladı.",
    trigger:"boss_defeated:sogut-esigi",
    secret:false,
  },
  "tek-soluk":{
    id:"tek-soluk",
    realm:"sogut-esigi",
    title:"Tek Soluk",
    body:"Söğüt Eşiği'ni hiç ipucu kullanmadan geçtin.",
    diary:"Hiç fısıltı duymadın. Yalnız ipliğin sesi vardı.",
    trigger:"no_hint_clear:sogut-esigi",
    secret:false,
  },
  "cayiri-tani":{
    id:"cayiri-tani",
    realm:"sogut-esigi",
    title:"Çayırı Tanı",
    body:"Tek koşuda Söğüt Eşiği'nin tüm relic'lerini gördün.",
    diary:"Çayırın her ucunu öğrendin. Bahçıvan başını salladı.",
    trigger:"all_relics_seen_in_run:sogut-esigi",
    secret:false,
  },
  "yagmur-sonrasi":{
    id:"yagmur-sonrasi",
    realm:"sogut-esigi",
    title:"Yağmur Sonrası",
    body:"Yağmur olayında sığındın ve koşuyu tamamladın.",
    diary:"Yağmur dindi, çayır parladı. Tek bir damla bile boş düşmedi.",
    trigger:"event_chain:sogut-esigi:yagmur-shelter-and-clear",
    secret:false,
  },
};

/** Engine — emit/check pattern.
 *  Trigger string formats:
 *   - realm_cleared:<id>
 *   - boss_defeated:<id>
 *   - no_hint_clear:<id>
 *   - all_relics_seen_in_run:<id>
 *   - event_chain:<id>:<chainId>
 */
export function emit(triggerId, meta, onUnlock){
  if(meta.achievements[triggerId])return false; // not the achievement id but trigger
  for(const ach of Object.values(ACHIEVEMENTS)){
    if(ach.trigger!==triggerId)continue;
    if(meta.achievements[ach.id])continue;
    meta.achievements[ach.id]={unlockedAt:Date.now()};
    meta.jediDiary.unshift({achievementId:ach.id,unlockedAt:Date.now(),text:ach.diary});
    if(onUnlock)onUnlock(ach);
    return ach;
  }
  return false;
}

export function getAchievement(id){return ACHIEVEMENTS[id];}
export function unlockedCount(meta){return Object.keys(meta.achievements||{}).length;}
export function totalCount(){return Object.keys(ACHIEVEMENTS).length;}
```

Commit: `feat(rogue): achievements.js — engine + 5 Söğüt Eşiği achievement + diary`

---

### Task 6: index.html — Chest modal + relic offer UI

**Edit 1: import'lara ekle**

Plan 06'da eklenen importların altına:

```javascript
import {REALMS, getRealm, isRealmUnlocked} from "./src/rogue/realms.js";
import {RELICS, getRelic, rollRelicOffer, hasRelic} from "./src/rogue/relics.js";
import {EVENTS, getEvent, rollEvent} from "./src/rogue/events.js";
import {ACHIEVEMENTS, emit as emitAchievement, getAchievement, unlockedCount as achUnlocked, totalCount as achTotal} from "./src/rogue/achievements.js";
```

**Edit 2: stub-realm import KALDIR (artık registry kullanıyoruz)**

`import {STUB_REALM} from "./src/rogue/stub-realm.js";` satırını sil — REALMS["stub-diyar"] kullanılacak.

**Edit 3: STUB_REALM referanslarını REALMS lookup ile değiştir**

- `STUB_REALM.name` → `getRealm(run.realmId).name`
- `STUB_REALM.floors` → `getRealm(run.realmId).floors`
- `STUB_REALM.defaultPuzzleSize` → realm.floorConfig[floor].sizes[0] vb.

Bul ve değiştir:

old_string (gameTitle):
```
$("gameTitle").textContent = ctx.mode==="journey" ? levelParams(ctx.levelIndex).title : (ctx.mode==="rogue" ? STUB_REALM.name : "Serbest");
```

new_string:
```
$("gameTitle").textContent = ctx.mode==="journey" ? levelParams(ctx.levelIndex).title : (ctx.mode==="rogue" ? (getRealm(ctx.realmId)?.name||"Rogue") : "Serbest");
```

old_string (startRogueRun config):
```
activeRun=startRun({realmId,seed,config:{floors:STUB_REALM.floors}});
```

new_string:
```
const realm=getRealm(realmId);
activeRun=startRun({realmId,seed,config:{floors:realm.floors}});
```

old_string (handleRogueNode puzzle params):
```
    const size=node.type==="boss"?STUB_REALM.bossPuzzleSize:STUB_REALM.defaultPuzzleSize;
    const keep=node.type==="boss"?STUB_REALM.bossPuzzleKeep:STUB_REALM.defaultPuzzleKeep;
```

new_string:
```
    const realm=getRealm(run.realmId);
    const floorCfg=realm.floorConfig&&realm.floorConfig[node.floor];
    const size=floorCfg?floorCfg.sizes[0]:5;
    const keep=floorCfg?floorCfg.keep:0.75;
```

**Edit 4: handleRogueNode → chest + event handle**

`function handleRogueNode(nodeId)` içine chest ve event branch'leri ekle:

old_string:
```javascript
  }else{
    // Stub: non-puzzle nodes auto-pass for v1
    renderRogueMap(run);
  }
}
```

new_string:
```javascript
  }else if(node.type==="chest"){
    openChestModal(run,node);
  }else if(node.type==="event"){
    openEventModal(run,node);
  }else if(node.type==="rest"){
    run.lives.current=Math.min(run.lives.max,run.lives.current+1);
    store.set(KEYS.rogueRun,run);
    renderRogueMap(run);
  }else{
    renderRogueMap(run);
  }
}

function openChestModal(run,node){
  const realm=getRealm(run.realmId);
  let h=2166136261>>>0;const s=run.seed+"-chest-"+node.id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  const rng=mulberry32(h>>>0);
  const offers=rollRelicOffer(realm.relicPool||[],3,rng).filter(r=>!run.relics.includes(r.id));
  if(!offers.length){renderRogueMap(run);return;}
  const html=`
    <h2>Sandık</h2>
    <p>Üç ışıltı, bir seçim. Seçtiğin koşunun sonuna kadar seninle.</p>
    <div style="display:flex;flex-direction:column;gap:10px;margin:14px 0;">
      ${offers.map(r=>`
        <button class="opt" data-relic="${r.id}" style="text-align:left;padding:14px;background:var(--panel);border:1px solid var(--hairline);">
          <div style="display:flex;align-items:baseline;gap:10px;">
            <span style="color:var(--accent);font-family:var(--font-serif);font-size:22px;">${r.glyph}</span>
            <b style="font-family:var(--font-serif);font-weight:600;color:var(--ink);">${r.name}</b>
            <span style="margin-left:auto;font-family:var(--font-mono);font-size:9px;color:${r.rarity==='nadir'?'var(--accent)':'var(--muted)'};letter-spacing:.18em;text-transform:uppercase;">${r.rarity}</span>
          </div>
          <div style="color:var(--muted);font-size:12.5px;margin-top:4px;font-family:var(--font-serif);font-style:italic;">${r.desc}</div>
        </button>
      `).join("")}
      <button class="opt" data-relic="" style="background:transparent;border:1px dashed var(--hairline);color:var(--muted);">Geç (relic alma)</button>
    </div>
  `;
  openRogueModal(html,e=>{
    const btn=e.target.closest("[data-relic]");
    if(!btn)return;
    const relicId=btn.dataset.relic;
    if(relicId){
      run.relics.push(relicId);
      if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
      meta.realms[run.realmId].knownRelics=Array.from(new Set([...(meta.realms[run.realmId].knownRelics||[]),relicId]));
      saveMeta();
      checkAllRelicsSeenInRun(run);
    }
    store.set(KEYS.rogueRun,run);
    closeRogueModal();
    renderRogueMap(run);
  });
}

function openEventModal(run,node){
  const realm=getRealm(run.realmId);
  let h=2166136261>>>0;const s=run.seed+"-event-"+node.id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  const rng=mulberry32(h>>>0);
  const ev=rollEvent(realm.eventPool||[],rng);
  if(!ev){renderRogueMap(run);return;}
  // Track for achievement chain
  if(!run.eventLog)run.eventLog=[];
  if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
  meta.realms[run.realmId].seenEvents=Array.from(new Set([...(meta.realms[run.realmId].seenEvents||[]),ev.id]));
  saveMeta();
  const html=`
    <h2>${ev.title}</h2>
    <p>${ev.text}</p>
    <div style="display:flex;flex-direction:column;gap:10px;margin:14px 0;">
      ${ev.choices.map((c,i)=>`
        <button class="opt" data-choice="${i}" style="text-align:left;padding:14px;background:${c.tone==='risk'?'var(--panel-2)':'var(--panel)'};border:1px solid ${c.tone==='risk'?'var(--bad)':'var(--hairline)'};">
          <div style="display:flex;align-items:baseline;gap:10px;">
            <span style="font-family:var(--font-mono);font-size:9px;color:${c.tone==='risk'?'var(--bad)':(c.tone==='safe'?'var(--accent)':'var(--muted)')};letter-spacing:.18em;text-transform:uppercase;">${c.tone==='risk'?'risk':(c.tone==='safe'?'güven':'geç')}</span>
          </div>
          <div style="font-family:var(--font-body);font-weight:700;color:var(--ink);margin-top:4px;">${c.text}</div>
          <div style="color:var(--muted);font-size:12px;margin-top:3px;font-family:var(--font-serif);font-style:italic;">${c.result}</div>
        </button>
      `).join("")}
    </div>
  `;
  openRogueModal(html,e=>{
    const btn=e.target.closest("[data-choice]");
    if(!btn)return;
    const choice=ev.choices[+btn.dataset.choice];
    run.eventLog.push({eventId:ev.id,choiceIdx:+btn.dataset.choice});
    applyEventEffect(run,ev,choice);
    store.set(KEYS.rogueRun,run);
    closeRogueModal();
    if(run.ended){renderRogueMap(run);}
    else renderRogueMap(run);
  });
}

function applyEventEffect(run,ev,choice){
  const e=choice.effect;
  if(!e||e.type==="none")return;
  if(e.type==="heal"){
    run.lives.current=Math.min(run.lives.max,run.lives.current+(e.amount||1));
  }else if(e.type==="thread"){
    meta.currencies.thread=(meta.currencies.thread||0)+(e.amount||1);
    saveMeta();
  }else if(e.type==="bead"){
    meta.currencies.bead=(meta.currencies.bead||0)+(e.amount||1);
    saveMeta();
  }else if(e.type==="chance-damage"){
    if(Math.random()<(e.chance||0.5)){
      run.lives.current=Math.max(0,run.lives.current-(e.amount||1));
      if(run.lives.current===0){run.ended=true;run.endReason="no-lives";}
    }
  }else if(e.type==="relic-offer"){
    const realm=getRealm(run.realmId);
    const rng=mulberry32(Date.now()&0xffffffff);
    const offer=rollRelicOffer(realm.relicPool||[],e.count||1,rng).filter(r=>!run.relics.includes(r.id));
    if(offer.length){
      run.relics.push(offer[0].id);
      if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
      meta.realms[run.realmId].knownRelics=Array.from(new Set([...(meta.realms[run.realmId].knownRelics||[]),offer[0].id]));
      saveMeta();
      checkAllRelicsSeenInRun(run);
    }
  }
}

function checkAllRelicsSeenInRun(run){
  const realm=getRealm(run.realmId);
  if(!realm||!realm.relicPool)return;
  const pool=new Set(realm.relicPool);
  const seen=new Set(run.relics);
  for(const id of pool)if(!seen.has(id))return;
  achievementUnlock("all_relics_seen_in_run:"+run.realmId);
}

function achievementUnlock(triggerId){
  const ach=emitAchievement(triggerId,meta,a=>{
    showAchievementToast(a);
  });
  if(ach){saveMeta();}
}

function showAchievementToast(ach){
  const t=document.createElement("div");
  t.style.cssText="position:fixed;top:calc(var(--safe-t,0px) + 16px);left:50%;transform:translateX(-50%);z-index:200;background:var(--panel-2);border:1px solid var(--accent);border-radius:14px;padding:12px 18px;color:var(--ink);font-family:var(--font-body);max-width:340px;box-shadow:0 8px 24px rgba(0,0,0,.5);";
  t.innerHTML=`<div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.22em;color:var(--accent);text-transform:uppercase;">başarım açıldı</div><div style="font-family:var(--font-serif);font-weight:600;font-size:16px;margin-top:4px;">${ach.title}</div><div style="font-style:italic;font-size:12.5px;color:var(--ink-dim);margin-top:2px;">${ach.body}</div>`;
  document.body.appendChild(t);
  setTimeout(()=>{t.style.transition="opacity .6s, transform .6s";t.style.opacity="0";t.style.transform="translateX(-50%) translateY(-20px)";},2800);
  setTimeout(()=>t.remove(),3500);
}

let _rogueModalHandler=null;
function openRogueModal(html,onClick){
  let overlay=$("rogueModal");
  if(!overlay){
    overlay=document.createElement("div");
    overlay.id="rogueModal";
    overlay.className="overlay center";
    overlay.innerHTML='<div class="modal" id="rogueModalBody" style="max-width:420px;width:calc(100% - 32px);text-align:left;"></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener("click",e=>{if(e.target.id==="rogueModal")closeRogueModal();});
  }
  $("rogueModalBody").innerHTML=html;
  if(_rogueModalHandler)$("rogueModalBody").removeEventListener("click",_rogueModalHandler);
  _rogueModalHandler=onClick;
  $("rogueModalBody").addEventListener("click",_rogueModalHandler);
  overlay.classList.add("show");
}
function closeRogueModal(){
  const o=$("rogueModal");
  if(o)o.classList.remove("show");
}
```

Commit: `feat(rogue-ui): chest + event modal + relic offer + event effects + achievement toast`

---

### Task 7: Boss + Pusula Yıldızı + win callback genişletildi

Mevcut `win()` fonksiyonundaki rogue branch'i güncellet (Plan 06'da eklenen):

old_string:
```
  else if(ctx.mode==="rogue"){
    let run=store.get(KEYS.rogueRun,null);
    if(run){
      const node=run.mapGraph.nodes.find(n=>n.id===ctx.nodeId);
      if(node&&node.type==="boss"){winRun(run);meta.currencies.bead=(meta.currencies.bead||0)+1;}
      meta.currencies.thread=(meta.currencies.thread||0)+(node&&node.type==="elite"?5:3);
      saveMeta();
      store.set(KEYS.rogueRun,run);
    }
  }
```

new_string:
```
  else if(ctx.mode==="rogue"){
    let run=store.get(KEYS.rogueRun,null);
    if(run){
      const node=run.mapGraph.nodes.find(n=>n.id===ctx.nodeId);
      meta.currencies.thread=(meta.currencies.thread||0)+(node&&node.type==="elite"?5:3);
      if(node&&node.type==="boss"){
        winRun(run);
        meta.currencies.bead=(meta.currencies.bead||0)+1;
        if(!meta.realms[run.realmId])meta.realms[run.realmId]={};
        meta.realms[run.realmId].compassStars=Math.min(5,(meta.realms[run.realmId].compassStars||0)+1);
        meta.realms[run.realmId].timesCleared=(meta.realms[run.realmId].timesCleared||0)+1;
        meta.realms[run.realmId].defeatedBosses=(meta.realms[run.realmId].defeatedBosses||0)+1;
        achievementUnlock("boss_defeated:"+run.realmId);
        achievementUnlock("realm_cleared:"+run.realmId);
        if(hints===0)achievementUnlock("no_hint_clear:"+run.realmId);
        // event chain check: yagmur-shelter + clear
        if(run.eventLog&&run.eventLog.some(e=>e.eventId==="yagmur-basladi"&&e.choiceIdx===0)){
          achievementUnlock("event_chain:"+run.realmId+":yagmur-shelter-and-clear");
        }
        // Unlock next realm
        if(run.realmId==="sogut-esigi"){
          if(!meta.realms["karanlik-igne"])meta.realms["karanlik-igne"]={};
          meta.realms["karanlik-igne"].unlocked=true;
        }
      }
      saveMeta();
      store.set(KEYS.rogueRun,run);
    }
  }
```

Commit: `feat(rogue): boss win → Pusula Yıldızı + currencies + achievement triggers + D2 unlock`

---

### Task 8: Yuva realm cards real data + D2 lock UI

`renderYuva` içindeki realms array'i registry'den okusun:

old_string:
```
  const realms=[
    {id:STUB_REALM.id,name:STUB_REALM.name,intro:STUB_REALM.intro,unlocked:true,accent:"--accent-warm"},
    {id:"sogut-esigi",name:"Söğüt Eşiği",intro:"Yakında — Plan 07'de gelecek",unlocked:false,accent:"--accent-warm"},
    {id:"karanlik-igne",name:"Karanlık İğne",intro:"Yakında — Plan 08'de gelecek",unlocked:false,accent:"--accent"},
  ];
```

new_string:
```
  const realmIds=["sogut-esigi","karanlik-igne","yildiz-gecidi"];
  const realms=realmIds.map(id=>{
    const r=REALMS[id]||{id,name:id,intro:"yakında",accent:"--accent"};
    const stars=meta.realms[id]?.compassStars||0;
    const unlocked=isRealmUnlocked(id,meta);
    return {
      id:r.id,
      name:r.name,
      intro:unlocked?(r.intro||""):"kilitli — önceki diyarın patronunu yen",
      unlocked,
      accent:r.accent||"--accent",
      stars,
    };
  });
```

**Edit — Yuva card HTML'ine Pusula Yıldızı göstergesi ekle:**

old_string:
```
      ${realms.map(r=>`
        <div class="card ${r.unlocked?'':'locked'}" data-realm="${r.id}" data-unlocked="${r.unlocked}">
          <div class="emo" style="color:var(${r.accent});">◇</div>
          <div class="meta">
            <h3>${r.name}</h3>
            <p>${r.intro}</p>
          </div>
          <div class="go">${r.unlocked?'›':'◌'}</div>
        </div>
      `).join("")}
```

new_string:
```
      ${realms.map(r=>`
        <div class="card ${r.unlocked?'':'locked'}" data-realm="${r.id}" data-unlocked="${r.unlocked}">
          <div class="emo" style="color:var(${r.accent});">◇</div>
          <div class="meta">
            <h3>${r.name}</h3>
            <p>${r.intro}</p>
            ${r.unlocked&&r.stars>0?`<div style="margin-top:4px;font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;color:var(${r.accent});">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>`:""}
          </div>
          <div class="go">${r.unlocked?'›':'◌'}</div>
        </div>
      `).join("")}
```

**Edit — stats chip'e başarım sayacı ekle:**

old_string:
```
    <div style="text-align:center;font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);padding:18px 0 14px;">
      ${totalRuns} koşu · ${totalSolves} çözüm
    </div>
```

new_string:
```
    <div style="text-align:center;font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);padding:18px 0 14px;">
      ${totalRuns} koşu · ${totalSolves} çözüm · ${achUnlocked(meta)}/${achTotal()} başarım
    </div>
```

Commit: `feat(rogue-ui): Yuva realm cards registry-driven + Pusula Yıldızı + achievement counter`

---

### Task 9: Final + merge + push

- [ ] Progress log final + roadmap (`07 — Söğüt Eşiği (D1) | ✓ tamamlandı | <SHA>`)
- [ ] Commit + branch push + main merge + push

---

## Önerilen dispatch

- **Dispatch 1:** Tasks 1-5 (modules creation — pure data, no UI risk)
- **Dispatch 2:** Tasks 6-9 (UI wiring + final)

= 2 dispatch toplam.

---

## Self-Review

**Spec coverage:**
- ✅ Realm registry, Söğüt Eşiği data
- ✅ 6 relic data + offer modal
- ✅ 6 event data + choice resolver
- ✅ Boss + Pusula Yıldızı + currency
- ✅ 5 achievement + engine + toast + diary
- ✅ D2 unlock (D1 boss yenince)

**Plan 07 SKIP (sonraki):**
- İpliklik talents fonksiyonu (Plan 09)
- Boncuk Dizimi (Plan 09)
- Constraint tiles (Plan 09)
- Yuva Fısıltısı / Neow (Plan 10 polish)
- Pati izi animation (Plan 10)
