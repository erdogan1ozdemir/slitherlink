# Plan 04 · Persistence v2 (IDB mirror + schema versioning + meta key)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Veri kaybı riskini minimize et — IDB ayna, schema versioning, `cember:meta` v1 anahtarı introduce et. Plan 06+'da Rogue mode bu altyapı üzerine inşa edilecek.

**Architecture:** `store` sarmalayıcı genişler: `idbStore` IDB Promise-based wrapper, `store.set/get` her ikisini de yazar/okur. Yeni `cember:meta` anahtarı runtime'da boş şablonla initialize edilir. Yedek Kodu'na IDB içeriği de dahil edilir.

**Tech Stack:** Vanilla JS, `indexedDB` Web API. Yeni bağımlılık yok.

**Bağımlılık:** Plan 03 tamamlanmış.

**Tahmini süre:** 2-3 saat.

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `index.html` | Modify | idbStore wrapper, store enhanced, schema versioning, meta init, backup IDB sync |
| `docs/log/plan-04-progress.md` | Create | Progress notları |

> Tek dosya değişikliği — modüler refactor Plan 05.

---

## Görevler

### Task 1: Branch + progress log

- [ ] **Step 1.1:** Worktree

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git worktree add ../slitherlink-plan-04 -b plan-04-persistence-v2
cd "../slitherlink-plan-04"
```

- [ ] **Step 1.2:** `docs/log/plan-04-progress.md` oluştur

```markdown
# Plan 04 Progress

- [ ] Task 1: Branch + log
- [ ] Task 2: idbStore wrapper
- [ ] Task 3: store sarmalayıcı genişlet (mirror writes)
- [ ] Task 4: cember:meta v1 init
- [ ] Task 5: Schema versioning + migration runtime
- [ ] Task 6: Yedek Kodu IDB içeriğini de toplasın
- [ ] Task 7: autosave critical events IDB yazar
- [ ] Task 8: Final + merge + push
```

- [ ] **Step 1.3:** Commit `chore(plan-04): start — branch + progress log`

---

### Task 2: idbStore wrapper

`index.html`'in `<script>` bloğunda, `store` tanımının HEMEN ALTINA yeni `idbStore` wrapper ekle.

**Edit — store tanımının altına idbStore ekle:**

old_string:
```
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}},
  del(k){try{localStorage.removeItem(k);}catch(e){}}
};
```

new_string:
```
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}},
  del(k){try{localStorage.removeItem(k);}catch(e){}}
};

/* IDB sarmalayıcı — sessiz ayna; başarısız olursa null/noop */
const IDB_NAME="cember-db",IDB_STORE="kv",IDB_VERSION=1;
let _idbReady=null;
function _idbOpen(){
  if(_idbReady)return _idbReady;
  _idbReady=new Promise(res=>{
    try{
      const req=indexedDB.open(IDB_NAME,IDB_VERSION);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(IDB_STORE))db.createObjectStore(IDB_STORE);};
      req.onsuccess=()=>res(req.result);
      req.onerror=()=>res(null);
    }catch(e){res(null);}
  });
  return _idbReady;
}
const idbStore={
  async get(k){const db=await _idbOpen();if(!db)return undefined;return new Promise(res=>{try{const tx=db.transaction(IDB_STORE,"readonly");const r=tx.objectStore(IDB_STORE).get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>res(undefined);}catch(e){res(undefined);}});},
  async set(k,v){const db=await _idbOpen();if(!db)return;return new Promise(res=>{try{const tx=db.transaction(IDB_STORE,"readwrite");tx.objectStore(IDB_STORE).put(v,k);tx.oncomplete=()=>res();tx.onerror=()=>res();}catch(e){res();}});},
  async del(k){const db=await _idbOpen();if(!db)return;return new Promise(res=>{try{const tx=db.transaction(IDB_STORE,"readwrite");tx.objectStore(IDB_STORE).delete(k);tx.oncomplete=()=>res();tx.onerror=()=>res();}catch(e){res();}});},
  async keys(){const db=await _idbOpen();if(!db)return [];return new Promise(res=>{try{const tx=db.transaction(IDB_STORE,"readonly");const r=tx.objectStore(IDB_STORE).getAllKeys();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>res([]);}catch(e){res([]);}});}
};
```

Commit: `feat(persistence): idbStore wrapper (Promise-based, sessiz)`

---

### Task 3: store sarmalayıcı mirror writes

`store.set` her yazımda IDB'ye de yazsın (fire-and-forget, await yok — UI block etmez):

old_string:
```
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}},
  del(k){try{localStorage.removeItem(k);}catch(e){}}
};
```

new_string:
```
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}idbStore.set(k,v);},
  del(k){try{localStorage.removeItem(k);}catch(e){}idbStore.del(k);}
};
```

**Önemli:** `idbStore` Task 2'de tanımlanmış olmalı. Bu Edit Task 2'nin yeni yapısının ÜZERİNE yapılır — yani store tanımı şimdi sadece set/get/del değiştirilir.

Commit: `feat(persistence): store mirror writes IDB (fire-and-forget)`

---

### Task 4: cember:meta v1 init

`KEYS` tanımına `meta` anahtarı zaten var (stats yerine). İçeriği initialize et — yoksa default şablonu kur.

**Edit — KEYS tanımı yakınında, KEYS satırı sonrası init logic ekle:**

`KEYS` tanımının altına (settings load'dan önce) ekle. Önce bağlamı oku:

```bash
grep -n "const KEYS\|let settings=Object" index.html
```

old_string:
```
const KEYS={settings:"cember:settings",freeCur:"cember:free:current",
  jrnProg:"cember:journey:progress",jrnCur:"cember:journey:current",stats:"cember:stats"};
const store={
```

new_string:
```
const KEYS={settings:"cember:settings",freeCur:"cember:free:current",
  jrnProg:"cember:journey:progress",jrnCur:"cember:journey:current",stats:"cember:stats",meta:"cember:meta"};
const META_DEFAULTS={
  version:1,
  hasSeenIntro:false,
  achievements:{},
  realms:{
    "sogut-esigi":  {unlocked:true, timesEntered:0, timesCleared:0, bestFloor:0, bestTime:null, defeatedBosses:0, seenEvents:[], knownRelics:[], compassStars:0, unlockedConstraintTiles:[]},
    "karanlik-igne":{unlocked:false,timesEntered:0, timesCleared:0, bestFloor:0, bestTime:null, defeatedBosses:0, seenEvents:[], knownRelics:[], compassStars:0, unlockedConstraintTiles:[]},
    "yildiz-gecidi":{unlocked:false,timesEntered:0, timesCleared:0, bestFloor:0, bestTime:null, defeatedBosses:0, seenEvents:[], knownRelics:[], compassStars:0, unlockedConstraintTiles:[]}
  },
  totalStats:{runs:0,solves:0,time:0,hintsUsed:0},
  permanentStarters:[],
  jediDiary:[],
  loomHall:{activeTalents:{},unlockedTalents:[]},
  thornsContract:{profiles:[]},
  charms:{equipped:[],unlocked:[]},
  keepsakes:{discovered:[]},
  currencies:{thread:0,bead:0,stardust:0}
};
const store={
```

Ve metayı doldurmak için bir helper + lazy init ekle. `let settings=...` satırının sonrası:

old_string:
```
let settings=Object.assign({},DEFAULT_SETTINGS,store.get(KEYS.settings,{}));
function saveSettings(){store.set(KEYS.settings,settings);}
```

new_string:
```
let settings=Object.assign({},DEFAULT_SETTINGS,store.get(KEYS.settings,{}));
function saveSettings(){store.set(KEYS.settings,settings);}

function deepMerge(target,source){
  if(!source||typeof source!=="object")return target;
  for(const k in source){
    if(source[k]&&typeof source[k]==="object"&&!Array.isArray(source[k])){
      target[k]=deepMerge(typeof target[k]==="object"&&!Array.isArray(target[k])?target[k]:{},source[k]);
    }else if(target[k]===undefined){
      target[k]=source[k];
    }
  }
  return target;
}
let meta=deepMerge(Object.assign({},store.get(KEYS.meta,{})),META_DEFAULTS);
if(!meta.version)meta.version=1;
store.set(KEYS.meta,meta);
function saveMeta(){store.set(KEYS.meta,meta);}
```

Commit: `feat(persistence): cember:meta v1 init + deep-merge default şablonu`

---

### Task 5: Schema migration runtime (placeholder)

`META_DEFAULTS` `version:1`. Sonraki sürümler için migration scaffolding.

**Edit — `let meta=...` ile `if(!meta.version)` arasına ekle (Task 4'ün üzerine):**

old_string:
```
let meta=deepMerge(Object.assign({},store.get(KEYS.meta,{})),META_DEFAULTS);
if(!meta.version)meta.version=1;
store.set(KEYS.meta,meta);
```

new_string:
```
let meta=deepMerge(Object.assign({},store.get(KEYS.meta,{})),META_DEFAULTS);
function migrateMeta(m){
  if(!m.version)m.version=1;
  // v1 = current; future versions: if(m.version<2){...; m.version=2;}
  return m;
}
meta=migrateMeta(meta);
store.set(KEYS.meta,meta);
```

Commit: `feat(persistence): meta migration scaffolding (v1=current)`

---

### Task 6: Yedek Kodu IDB içeriğini de toplasın

Yedek kodu mevcut sadece localStorage'ı topluyor. IDB'yi de eklesin.

`BACKUP_KEYS` array'i mevcut. Yeni `meta` anahtarını ekle ve backupCollect async olabilir (IDB için).

**Edit 1 — BACKUP_KEYS'e meta ekle:**

old_string:
```
const BACKUP_KEYS=[KEYS.settings,KEYS.freeCur,KEYS.jrnProg,KEYS.jrnCur,KEYS.stats];
```

new_string:
```
const BACKUP_KEYS=[KEYS.settings,KEYS.freeCur,KEYS.jrnProg,KEYS.jrnCur,KEYS.stats,KEYS.meta];
```

(IDB ayrı kanal olarak içeriği zaten localStorage ile aynı tutuluyor — store.set hem yazıyor. Yedek kodu localStorage'dan topluyor, IDB'den ayrıca toplamasına gerek YOK; mirror sayesinde her iki kanal aynı veriyi taşıyor. Yine de güvenlik için backupCollect IDB'den eksik anahtarları doldurabilir.)

**Edit 2 — backupCollect IDB fallback ekle:**

old_string:
```
function backupCollect(){
  const data={v:1,t:Date.now(),keys:{}};
  for(const k of BACKUP_KEYS){
    const v=store.get(k,null);
    if(v!==null)data.keys[k]=v;
  }
  return data;
}
```

new_string:
```
function backupCollect(){
  const data={v:1,t:Date.now(),keys:{}};
  for(const k of BACKUP_KEYS){
    const v=store.get(k,null);
    if(v!==null)data.keys[k]=v;
  }
  return data;
}
async function backupCollectAsync(){
  const data=backupCollect();
  const idbKeys=await idbStore.keys();
  for(const k of idbKeys){
    if(typeof k!=="string"||!k.startsWith("cember:"))continue;
    if(data.keys[k]!==undefined)continue;
    const v=await idbStore.get(k);
    if(v!==undefined)data.keys[k]=v;
  }
  return data;
}
```

**Edit 3 — openBackupExport async sürümü kullansın:**

old_string:
```
function openBackupExport(){
  backupMode="export";
  const code=backupEncode(backupCollect())||"(kod üretilemedi)";
```

new_string:
```
async function openBackupExport(){
  backupMode="export";
  let data;
  try{data=await backupCollectAsync();}catch(e){data=backupCollect();}
  const code=backupEncode(data)||"(kod üretilemedi)";
```

**Edit 4 — backupRestore IDB'ye de yazsın:**

old_string:
```
function backupRestore(data){
  if(!data||!data.keys||typeof data.keys!=="object")return false;
  for(const k of BACKUP_KEYS){
    if(data.keys[k]!==undefined)store.set(k,data.keys[k]);
    else store.del(k);
  }
  return true;
}
```

new_string:
```
function backupRestore(data){
  if(!data||!data.keys||typeof data.keys!=="object")return false;
  // store.set zaten LS + IDB'ye yazıyor (Task 3'teki mirror)
  for(const k of BACKUP_KEYS){
    if(data.keys[k]!==undefined)store.set(k,data.keys[k]);
    else store.del(k);
  }
  // Yedekten gelen ek anahtarlar (BACKUP_KEYS dışı, örn. ileride eklenecek olanlar)
  for(const k in data.keys){
    if(!BACKUP_KEYS.includes(k)&&k.startsWith("cember:")){
      store.set(k,data.keys[k]);
    }
  }
  return true;
}
```

Commit: `feat(persistence): backup IDB sync + tüm cember:* anahtarları kapsar`

---

### Task 7: Critical events IDB write (zaten otomatik mirror'da, ek bir şey yok)

Task 3'te `store.set` zaten her çağrıda IDB yazıyor. Sadece doğrulama:

- [ ] **Step 7.1:** autosave → store.set(KEYS.jrnCur/freeCur, snapshot) → IDB'ye yazar (mirror)
- [ ] **Step 7.2:** saveSettings → store.set(KEYS.settings) → IDB
- [ ] **Step 7.3:** saveMeta → store.set(KEYS.meta) → IDB

Hiçbir ek değişiklik gerekmez. Mirror sayesinde her LS yazımı eşzamanlı IDB'ye gidiyor.

- [ ] **Step 7.4:** visibility/pagehide handlerlarını doğrula (Plan 02'den)

`document.addEventListener("visibilitychange"...)` ve `window.addEventListener("pagehide"...)` zaten autosave çağırıyor → mirror tetiklenir. Değişiklik gerekmez.

Bu task **sıfır commit** — sadece doğrulama. Bir commit'le kapatabilirsin:

```bash
git commit --allow-empty -m "chore(plan-04): mirror writes doğrulandı (autosave + visibility + pagehide)"
```

Veya bu task'i atla; progress log'da işaretle.

---

### Task 8: Final + merge + push

- [ ] **Step 8.1:** Progress log final

```markdown
## Plan 04 — Final

7-8 task tamamlandı. Persistence v2 hazır.

### Doğrulama
- localStorage temizlense bile IDB ayna sayesinde meta restore edilebilir
- store.set her çağrıda LS + IDB yazıyor
- Yedek Kodu artık cember:meta'yı da içeriyor

### Bilinen sınır
- Migration runtime placeholder (v1=current); ileride şema değişince burası dolacak

### Sonraki adım
Plan 05 — Modular refactor (src/ yapısı).
```

- [ ] **Step 8.2:** Roadmap update

old_string: `| 04 — Persistence v2 | bekliyor | – |`
new_string: `| 04 — Persistence v2 | ✓ tamamlandı | <SON_COMMIT_SHA> |`

- [ ] **Step 8.3:** Commit `docs(plan-04): final progress + roadmap`

- [ ] **Step 8.4:** Branch push

```bash
git push -u origin plan-04-persistence-v2
```

- [ ] **Step 8.5:** Main merge

```bash
cd "/Users/Erdo/Desktop/Claude Projects/slitherlink"
git checkout main
git merge --no-ff plan-04-persistence-v2 -m "Merge Plan 04: Persistence v2 (IDB mirror + meta + schema versioning)"
git push origin main
```

---

## Self-Review

**Spec coverage:** ✅ IDB wrapper, ✅ mirror, ✅ meta init, ✅ migration scaffolding, ✅ backup IDB sync.

**Önerilen dispatch grupları:**
- **Dispatch 1:** Task 1-5 (branch + idbStore + mirror + meta + migration)
- **Dispatch 2:** Task 6-8 (backup IDB + final + merge + push)

= 2 dispatch toplam.
