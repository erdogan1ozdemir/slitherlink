# Çember — Feature Additions (Research-Driven)

> Bu doküman, `cember-rogue-design.md` v1 spec'inin **eklemeli** spec'idir. Slitherlink yaygın özellikler + roguelike kalıcı geliştirme araştırmasından doğan yeni gereksinim ve mekanikleri toplar. Plan 02-09 buna referans verir.

**Araştırma kaynakları:** `docs/log/research-slitherlink-2026-05-26.md` (özet) + `docs/log/research-roguelike-2026-05-26.md` (özet) — research subagent çıktıları.

---

## A. Genel UX patches (Plan 02 — acil)

### A.1 "Merhaba Yarim" greeting
Açılış overlay'i `Merhaba Merve` yerine `Merhaba Yarim` der. Kazanma modali "Aferin Merve" olarak kalır (ayrı endearment). CONFIG katmanına `intimateName: "Yarim"` eklenir.

### A.2 Türkçe karakter audit
Foundation'da ASCII transliterasyonlar var (örn. "Basla", "icin", "soyler"). Tüm kullanıcı-görür stringler doğru Türkçe karakterlerle (ş, ı, ğ, ç, ö, ü, İ) yeniden yazılır. Kod yorumları ASCII kalabilir.

### A.3 İpucu yoğunluğu 0'a inebilir
Setup ekranındaki density slider `min="35"` → `min="0"`. 0 verildiğinde puzzle generator hiç clue göstermez (mevcut `keepRatio` parametresi 0 zaten destekliyor — sadece UI sınırı kaldırılıyor).

### A.4 İpucu tamamen kapatma (tüm modlarda)
"Ipucu butonu" toggle'ı zaten var (`settings.hints`). Ek olarak: serbest setup'a "hint bütçesi" alanı eklenir — 0 verilirse ipucu butonu hiç görünmez. Yolculuk ve Rogue'da ipucu bütçesi sırasıyla diyar zorluğuna ve relic'lere bağlı.

---

## B. Slitherlink QoL — toggle olarak eklenecek özellikler

### B.1 Otomatik Çarpı (Auto-X)
Bir rakamın gerektirdiği çizgi sayısına ulaşılınca kalan boş kenarlara otomatik çarpı koyar (ve tersi). Toggle, default ON. **Önem: must-have.** Implementation: `toggle()` sonrası `autoXAfterClue(r,c)` çağrısı.

### B.2 Undo / Redo (sınırsız stack)
Her hamle bir `move` objesi push'lar (`{k, r, c, prev, next}`). Undo: pop + state restore. Redo: forward stack. **Default açık** (toggle gereksiz). UI: oyun ekranı kontrol barına 2 buton `↶ / ↷` (mevcut Temizle + İpucu + Yeni yanına).

### B.3 Auto-check + "Sadece yanlışları göster"
Mevcut `settings.errors` 3 duruma genişler: `off / mistakes-only / live-check`. Live-check'te her hamleden sonra eşit-üstü olan clue'lar pas tonuna döner. Mistakes-only sadece kesin yanlışta uyarır. UI: tek toggle yerine 3 segmentli switch.

### B.4 Loop segment highlight (uzun bas)
Bir kenara uzun bas (>400ms) — o kenarın bağlı olduğu çizgi parçası kalın ve parlak gösterilir 1.5s boyunca. 8×8+ tahtalar için kritik QoL. Toggle, default ON 8×8+, OFF küçüklerde.

### B.5 Tap mode seçimi
Setup'a 3 seçenekli radio: 
- **Tek dokunuş döngüsü** (mevcut: boş → çizgi → çarpı)
- **Çizgi modu** + uzun bas → çarpı
- **Ayrı butonlar** (HUD'da Çizgi / Çarpı toggle)

Erişilebilirlik için "Ayrı butonlar" motor zorluk olanlara yardımcı.

### B.6 Vertex degree indicator (nokta vurgusu)
Bir vertex'e 2 çizgi geldiğinde nokta küçük taupe halka çizilir (loop kuralı: her vertex 0 veya 2 derece). 1 çizgi varsa askıda işareti. Toggle, default OFF (advanced).

### B.7 Pencil marks
Uzun bas çift döngü: bir kenarın "olabilir" notuyla çizilmesi — yarı opak çizgi. Toggle, default OFF.

---

## C. Karakter / Geliştirme ekranları

### C.1 Yuva — Rogue hub (v1 spec'te tanımlı, genişletildi)
**Yeni eklemeler:**
- Sol üstte Jedi avatarı (oturmuş SVG silüet) — dokunulursa "Karakter ekranı"na geçer
- Sağ üstte İplik bakiyesi sayacı (mono, taupe)
- "İpliklik" butonu — kalıcı geliştirme ekranı (C.2)
- "Diken Sözleşmesi" butonu — challenge modifier'ları (C.3)
- "Nasıl Oynanır?" linki

### C.2 İpliklik (Mirror of Night — Hades adaptasyonu)
**Konsept:** Koşular arası kazanılan **İplik** ile kalıcı pasifler açılır.

**Görsel:** Yün simli/taupe duvar — örülmüş ipliklerin oluşturduğu pasif ağ. Her pasif iki "vibrasyon" arasında ücretsiz geçiş (örn. "Sessiz Adım" vs "Yankı Adımı").

**v1 talents (8 adet, her biri 2 vibrasyonlu):**
1. **Dur Dengesi** — Sessiz: koşu başında +1 can / Yankı: koşu sonu +1 İplik
2. **Sezgi** — Sessiz: ilk hatadan can düşmez / Yankı: ilk hint ücretsiz
3. **Kuyruk Pusulası** — Sessiz: branching map'in 1 düğümü öne çıkar / Yankı: tüm map önceden görünür
4. **İz Sürme** — Sessiz: visited node'lardan İplik geri alır / Yankı: chest açma 1 İplik karşılığı
5. **Yün Avantajı** — Sessiz: relic havuzu +1 seçenek / Yankı: relic'ler %20 daha güçlü
6. **Sessiz Tabaka** — Sessiz: 2 hata sonra geri çekilebilirsin / Yankı: hatalardan İplik kaybetmezsin
7. **Sabır Pusulası** — Sessiz: rest düğümlerinde +2 can yenilenir / Yankı: rest'ler 1 hint verir
8. **Yıldız Ölçüsü** — Sessiz: boss'a +1 can buffer / Yankı: boss yendiğinde +5 İplik

**Açma maliyeti:** Talent 1 = 10 İplik, Talent 8 = 80 İplik. Her başarılı koşu ~10-30 İplik kazandırır (zorluk + diyar + relic'e göre).

### C.3 Diken Sözleşmesi (Pact of Punishment — Hades adaptasyonu)
**Konsept:** Kullanıcı kendi zorluğunu seçer. 10 modifier, her birinin 0-3 rank'ı.

**v1 modifiers:**
1. **Daralma** (rank 1-3): her floor süre limiti -10s / -20s / -30s
2. **Kör Pusula** (1): branching map gösterilmez (1 düğüm önden görülür)
3. **Kırılgan İplik** (1-2): relic havuzundan 1/2 seçim çıkar
4. **Yankılı Boss** (1-2): bossta constraint tile %50/100 fazla
5. **Çıplak Başlangıç** (1): permanent starter slot bu koşuda boş
6. **Sıkı Kontrol** (1-3): hata başına -1 / -2 / -3 can
7. **Sönük Yıldız** (1): hint kullanılırsa boss güçlenir
8. **Tek Kapı** (1): koşu sonu seçim opsiyonu yok
9. **Dolu Tabla** (1-2): 1/2 ek elite düğüm
10. **Çift Düğüm** (1-2): boss çift / üçlü stage

**İz puanı:** Her rank +1 İz. Koşu sonu ödülü İz'e bağlı:
- 0-2 İz: standart İplik ödülü
- 3-5 İz: +50% İplik + 1 Boncuk
- 6-10 İz: +100% İplik + 2 Boncuk + Yıldız Tozu
- 10+ İz: yukarısına ek olarak gizli relic havuzundan 1 garantili

### C.4 Karakter Ekranı (Jedi avatarı + istatistik)
**Konsept:** Jedi'nin "kart"ı. Yuva'dan açılır.

**İçerik:**
- Üstte büyük Jedi avatarı (SVG line art — oturmuş, kuyruk kıvrık)
- "**Norveç Orman Kedisi · Dişi · Sessiz Ortağın**" alt yazısı (italic, ink-dim)
- İstatistik blokları (mono, tabular):
  - Toplam koşu
  - Tamamlanan diyar (3/3 ya da n/3)
  - Boss yenilme sayısı
  - En uzak kat
  - En hızlı koşu (mm:ss)
  - Toplam puzzle çözülmüş
  - İplik biriktirilmiş
  - Boncuk biriktirilmiş
- "**Boncuk Dizimi**" (sırt çantası, max 3 slot)
- "**Hediye Boncukları**" listesi — koleksiyon (8 adet, gizli olanlar `····`)
- "**Yıldız Mührü**" listesi — kazanılmış achievement nişanları

### C.5 Nasıl Oynanır? (Tutorial / Help)
**Konsept:** Ayar sheet'inden ve Yuva'dan erişilebilir bottom-sheet. Sekmeli içerik (Slitherlink kuralları + Rogue mod detay).

**Sekmeler:**

**1. Çember Kuralları:**
- Tek ve kapalı bir çember çiz
- Çizgiler kesişemez, dallanamaz
- Sayılar etrafındaki çizgi adedini söyler (0-3)
- Üç durum: boş → çizgi → çarpı → boş (tap döngüsü)
- Çarpı: "burada kesin çizgi yok" notu
- Tüm sayılar tatmin + tek kapalı döngü = kazandın

**2. Modlar:**
- **Serbest Oyun**: boyut/yoğunluk/seed seçersin, sınırsız bulmaca
- **Yolculuk**: 30 bölümlük linear kampanya, zorluk kademeli artar
- **Rogue Modu**: 3 diyar, koşular arası kalıcı geliştirme (aşağıda detaylı)

**3. Rogue Modu Detayı:**

> "Jedi geceleri ipliği takip eder. Her koşusu yeni bir diyara, eski boncuklarla."

- **Diyar seç** — Yuva'dan 1 açık + 2 kilitli. İlerleme ile açılırlar.
- **Koşu yapısı** — 5 floor, dallanan harita, 6 düğüm tipi:
  - **Bulmaca** (puzzle)
  - **Elit** (zor bulmaca, iyi ödül)
  - **Sandık** (relic seçimi)
  - **Dinlenme** (can yenile)
  - **Olay** (rastgele metinli karar)
  - **Patron** (kat sonu, büyük bulmaca + kısıt)
- **Canlar** — başta 3, her hata 1 can. Bittiğinde koşu sonu (permadeath).
- **Relic** — koşu içi pasifler. Sandık ve event'lerden gelir, koşu sonunda kaybolur.
- **Mühürlü hücreler** — constraint tile'lar. Donmuş, "2 konmaz", sis, ikiz vb. Diyar ilerledikçe daha fazla.
- **Mum Modu** (opsiyonel) — koşuda süre baskısı. Her floor +90s, node'lar süre tüketir.
- **Boss** — kat sonunda büyük bulmaca + diyara özgü kısıt.

**4. Kalıcı Geliştirme:**

- **İplik** — her koşuda kazanılır, asla kaybolmaz. İpliklik'te talent açar.
- **Boncuk** — boss yenince düşer. Boncuk Dizimi (charm) için.
- **Yıldız Tozu** — Diken Sözleşmesi koşularından. Kozmetik için.
- **İpliklik** — 8 talent, her biri 2 vibrasyon. Kalıcı pasif.
- **Pusula Yıldızı** — her diyar için ayrı progression. Boss yenildikçe yıldız artar, yeni içerik unlock olur.
- **Diken Sözleşmesi** — kullanıcı kendi zorluğunu seçer, daha çok ödül kazanır.

**5. Yedek Kodu:**
- Ayar sheet'inden "Yedek Kodu Üret" → kodu kopyalar
- "Yedek Yükle" → kod yapıştır → o snapshot restore olur
- Tüm ilerleme (İplik, Boncuk, talent'ler, achievement'ler, aktif koşu) korunur

### C.6 Yuva Fısıltısı (Neow's Blessing — Slay the Spire)
Koşu başında 3 random seçim. Önceki koşu performansına göre seçenek havuzu değişir.

**Örnek seçimler:**
- "Tok Karın" — +1 başlangıç canı
- "Aç Tilki" — –1 can ama relic ödülleri 1 tier yüksek
- "Süt Tabağı" — koşu içi para 2x
- "Boş Tabak" — para yok ama event seçenekleri %50 daha iyi
- "Saklı Hediye" — koşu içinde rastgele 1 gizli sandık
- "Yün Akşamı" — koşu boyunca tüm rest düğümleri +1 can verir
- "Yıldız Eseri" — ilk relic kesin nadir
- Önceki koşu başarısızsa: "Avuntu" — +1 can geri bağışlanır (özel)

---

## D. Rogue mode mekanik genişletmesi

### D.1 Koşu içi rampa (RoR2 scaling)
Her floor'da:
- Constraint tile sayısı +%20
- Boss HP (mental, hata buffer'ı) +%15
- Süre limiti varsa floor başına 5s sıkışır
- Floor 5 (boss): kaos pikinde

### D.2 Mum Modu (Time Pressure)
Toggle modifier ya da Diken Sözleşmesi rank 3.
- 10 dakika başlangıç süresi
- Her floor +90s
- Düğüm süre maliyeti: puzzle 60s, elite 120s, rest 0s, event 30s, chest 0s
- Süre biterse koşu son bulur (kazanılan İplik korunur)
- Görsel: koşu HUD'unda yavaşça eriyen mum SVG'si

### D.3 Pusula Yıldızı (Boss Cells + Stakes)
Her diyar **kendi yıldız progression'ı** taşır. Boss yenildikçe yıldız artar (max 5).

**Yıldız 1**: Diyar açılır, ilk koşu hakkı
**Yıldız 2**: Yeni event node tipi havuza girer (`gizli kart`, `iz oku`)
**Yıldız 3**: Yeni relic kategorisi (`lanetli iplik` — güçlü ama trade-off'lu)
**Yıldız 4**: Yeni constraint tile tipi havuza girer (her diyar farklı)
**Yıldız 5**: Gizli endgame diyarı `Düğümün Ardı` (4. diyar) açma şartlarından biri

Diyarlar bağımsız ilerler — D1'de Yıldız 3 alabilirsin ama D2 hala Yıldız 1.

### D.4 Mühürlü Hücreler (Constraint tile sistemi)
Diyar bazlı mühür havuzları. Solver, mühürleri puzzle generation aşamasında uygular.

**v1 mühür tipleri (10):**
1. **Donmuş Hücre (Buz)** — etrafına çizgi konulamaz; numara dış kenarlardan tatmin edilir
2. **2 Konmaz** — bu hücre 2 değerinde olamaz (generator rastgele 1 veya 3 atar)
3. **3 Konmaz** — aynı mantık 3 için
4. **Sis Hücresi** — sayı görünmez; dokunulunca 3s reveal
5. **Lanetli Hücre** — tam 4 kenar olmak zorunda (loop hücreyi çevreler)
6. **Yankı Hücresi** — referans hücreyle aynı sayıyı taşır
7. **Kayan Hücre** — her N hamleden sonra komşu boş hücreye atlar
8. **Kör Düğüm** — en az 2 kenar olmak zorunda
9. **Aç Hücre** — boş; başka hücreden "ödünç" puan
10. **Mühürlü Köşe** — bir köşesinden çizgi geçemez
11. (Bonus) **İkiz Hücre** — iki hücre aynı sayıyı taşır

**Diyar bazlı dağılım:**
- D1 Söğüt Eşiği: Sis + İkiz (yumuşak)
- D2 Karanlık İğne: Donmuş + 2 Konmaz (mistik)
- D3 Yıldız Geçidi: Lanetli + Yankı + Kayan (epic)
- D4 gizli: Hepsinin karışımı + Aç + Mühürlü Köşe

### D.5 Boncuk Dizimi (Charms — Hollow Knight adaptasyonu)
Karakter ekranından erişilir. Max 3 slot (achievement ile +1, max 5).

**v1 boncuklar (10):**
1. **Söğüt Yaprağı** — koşu başlangıcında +1 hint
2. **Yün Yumağı** — rest +1 can extra
3. **Kelebek Kanadı** — event'lerde +1 seçenek
4. **Buz Damlası** — donmuş hücreler %20 daha az
5. **Mürekkep Lekesi** — locked chest'leri açar
6. **Ay Mührü** — koşuda 1 geri al hakkı
7. **Kuyruklu Yıldız** — koşu yarıda kalsa relic'leri korur
8. **Gece Pusulası** — tüm harita görünür (Kör Pusula etkisini iptal eder)
9. **Pati İzi** — visited node'lardan +İplik
10. **Yıldız Tozu** (overcharm) — relic'ler %30 güçlü ama hata 2 can götürür

### D.6 Hediye Boncukları (Keepsakes — Hades, gizli unlock)
Achievement chain'leri ile açılır. Karakter ekranında görülür ama dizilemez (pasif koleksiyon).

---

## E. Yedek Kodu Sistemi

### E.1 Konsept
Tüm ilerleme (`cember:meta`, `cember:settings`, `cember:rogue:run`, `cember:journey:progress`, vb.) tek bir **kod** olarak çıkar. Kullanıcı kopyalar (mail, Notes, Drive, WhatsApp), istediği zaman yapıştırıp restore eder.

### E.2 Format
Base64-encoded JSON. Yapı:

```
CEMBER-v1:<base64encoded(JSON.stringify(allKeys))>
```

Örnek (kısaltılmış):
```
CEMBER-v1:eyJtIjp7InYiOjEsImEiOnsi...AsImoiOnsidiI6MSwidSI6MTV9fQ==
```

Tahmini boy: 5-50KB base64 → 200-800 satır metin. Mail/Notes'a sığar.

### E.3 UI
Ayar sheet altında yeni bölüm "**Yedek**":

- **Yedek Kodu Üret** butonu — modal açılır, kodu textarea'da gösterir, "Kopyala" butonu
- **Yedek Yükle** butonu — modal açılır, textarea, "Yükle" + uyarı:
  > "Mevcut tüm ilerlemenin üzerine yazılacak. Önce yedek almak ister misin?"

### E.4 Versiyonlama
Kod prefix'i `CEMBER-v1:` versiyon taşır. Eski versiyonlardan yüklemede migration runtime devreye girer. Çakışma olursa uyarı.

### E.5 Güvenlik / Bütünlük
Base64 encode için: `btoa(JSON.stringify(state))`.
Çözümleme: `JSON.parse(atob(code))`.
Bozuksa try/catch ile yakalanır, kullanıcıya "Kod geçersiz" denir.

---

## F. Yeni veri şeması eklemeleri

`cember:meta` v1 → v2:

```js
{
  version: 2,
  hasSeenIntro,
  achievements: {...},
  realms: {                      // her diyar için yeni alanlar
    [realmId]: {
      unlocked, timesEntered, timesCleared,
      bestFloor, bestTime, defeatedBosses,
      seenEvents, knownRelics,
      compassStars: 0,            // YENİ: 0-5
      unlockedConstraintTiles: []  // YENİ: yıldız ile açılan mühür tipleri
    }
  },
  totalStats: {...},
  permanentStarters: [],
  jediDiary: [],
  loomHall: {                    // YENİ: İpliklik
    activeTalents: { [talentId]: vibrationVariant },
    unlockedTalents: []
  },
  thornsContract: {              // YENİ: Diken Sözleşmesi profilleri
    profiles: [{ name, modifiers: { [modId]: rank } }]
  },
  charms: {                      // YENİ: Boncuk Dizimi
    equipped: [charmId, ...],
    unlocked: [charmId, ...]
  },
  keepsakes: {                   // YENİ: Hediye Boncukları
    discovered: [keepsakeId, ...]
  },
  currencies: {                  // YENİ: Multi-currency
    thread: 0,        // İplik
    bead: 0,          // Boncuk
    stardust: 0       // Yıldız Tozu
  },
  settings: {                    // YENİ: ek toggle'lar
    autoX: true,
    autoCheckMode: "off|mistakes-only|live",
    segmentHighlight: true,
    tapMode: "cycle|line-longpress|toggle-buttons",
    vertexIndicator: false,
    pencilMarks: false
  }
}
```

---

## G. Önceliklendirme — Plan dağılımı

| Plan | Kapsam | Bağımlılık |
|------|--------|------------|
| **02** | Quick patches (A.1-A.4) + Slitherlink toggles must-have (B.1, B.2, B.3) + "Nasıl Oynanır" (C.5) + Yedek Kodu (E) | – |
| **03** | PWA setup (mevcut plan, değişiklik yok) | 02 |
| **04** | Persistence v2 (mevcut plan + yeni şema F) | 03 |
| **05** | Modular refactor (mevcut plan) | 04 |
| **06** | Rogue infrastructure + **Yuva** (genişletildi) + **Karakter ekranı** (C.4) + **İpliklik shell** (C.2) + **Diken Sözleşmesi shell** (C.3) + **Pusula Yıldızı** (D.3) + **Yuva Fısıltısı** (C.6) + Achievement engine | 05 |
| **07** | D1 Söğüt Eşiği — relics + events + boss + 5 achievement + 2 constraint tile (Sis + İkiz) + İpliklik 4 talent + 4 charm | 06 |
| **08** | D2 Karanlık İğne — relics + events + boss + bronze key + 2 constraint tile (Donmuş + 2 Konmaz) + İpliklik +2 talent + 3 charm | 07 |
| **09** | D3 Yıldız Geçidi — relics + events + multi-stage boss + 3 constraint tile (Lanetli + Yankı + Kayan) + Mum Modu default + İpliklik +2 talent + 3 charm | 08 |
| **10** | Polish + meta achievements + Hediye Boncukları + Vercel deploy + son a11y pass | 09 |

**Önemli not:** Slitherlink B.4-B.7 (loop segment highlight, tap modes, vertex indicator, pencil marks) Plan 10 polish'e ya da v1.1'e ertelenir — Plan 02 fazla şişmesin.

---

## H. Felsefe sınırları

- **Sessiz İplik dilinden çıkma:** tüm yeni UI hairline + taupe + Fraunces/Karla/Mono triad'ı içinde kalır
- **Mum Modu felsefe çatışması:** zaman baskısı sakinlik felsefesine ters, **default off**, opt-in
- **Hata sayacı agresifliği:** "3 strikes" gibi UI'lar mod-içinde Mum Modu'na bağlanır, default modlarda yok
- **Türkçe metafor:** İngilizce terim kullanma (relic değil "boncuk/iplik", boss yerine "patron/bekçi")

---

*Spec eklemesi tarihi: 2026-05-26. Kaynaklar: research subagent çıktıları (`docs/log/research-*-2026-05-26.md`).*
