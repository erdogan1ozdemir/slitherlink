# Çember (Slitherlink) - Proje Devir Dokümanı

Bu doküman projenin mevcut durumunu, mimarisini, oyun tasarımını ve sonraki adımları açıklar. İki ekibe hitap eder: kodu ilerletecek Claude Code ve görsel tasarımı yapacak Claude Design. İlgili bölümler ayrı başlıklarda işaretlendi.

## 1. Özet ve mevcut durum

Çember, klasik Slitherlink (çember bulmacası) mantığına dayanan, tamamen istemci tarafında çalışan bir web oyunudur. Sunucu gerektirmez, Vercel gibi statik bir host üzerinde yayınlanır. Oyun Merve için kişiselleştirilmiştir (siyah/gri tema, açılış ve kazanma mesajları).

Şu an elimizde çalışan bir temel (foundation) var: tek dosyalık `index.html`. Bu sürüm oynanabilir ve aşağıdaki özellikleri içerir:

Tamamlanan özellikler:
- Tek-kapalı-çember garantili bulmaca üreticisi (her boyutta geçerli, çözülebilir bulmaca üretir). 200 rastgele testte %100 doğrulandı.
- Seed tabanlı rastgelelik (aynı seed her zaman aynı bulmacayı verir). Bu hem tekrar oynanabilirlik hem de level üretimi için temel.
- Kazanma doğrulayıcı (tüm ipuçları sağlanmış mı + tek kapalı çember mi).
- İki oyun modu: Serbest Oyun ve Yolculuk (level/dungeon iskeleti, 6 kat x 5 bölüm = 30 bölüm).
- Ayarlardan açılıp kapanan özellikler: ipucu butonu, tamamlanan sayıyı soluklaştırma, hataları kırmızı gösterme, titreşim.
- Çok sayıda zorluk ve rastgelelik seçeneği: hazır seviyeler (Kolay/Orta/Zor/Uzman/Rastgele), tahta boyutu (4 ila 12), ipucu yoğunluğu sürgüsü, seed girişi.
- Otomatik kayıt ve kaldığı yerden devam (Serbest ve Yolculuk için ayrı). Sayfa kapansa bile son durum korunur.
- iPhone tam ekran hazırlığı (apple meta etiketleri, safe-area, 100dvh, Ana Ekrana Ekle ile uygulama gibi açılır).
- İpucu sistemi (doğru bir kenarı açar).

Henüz yapılmayan / sonraki aşama:
- Roguelike modu (tasarımı bu dokümanda, kod yok).
- Görsel tasarımın yenilenmesi (Claude Design).
- Geri al (undo) özelliği.
- Ses efektleri.
- İstatistik ekranı (toplam çözülen, ortalama süre vb.).

## 2. Çalıştırma ve yayınlama

Yerel açma: `index.html` dosyasını tarayıcıda açmak yeterli (modül yok, derleme yok). Kaydetme localStorage ile çalışır.

Vercel'e yayınlama:
1. `index.html` dosyasını bir klasöre koy.
2. vercel.com hesabına gir, "Add New Project" ya da sürükle-bırak ile klasörü yükle.
3. Birkaç saniyede canlı bir `.vercel.app` adresi hazır olur.

iPhone'da tam ekran: Merve Safari'de oyunu açar, paylaş butonundan "Ana Ekrana Ekle" der. Bundan sonra simgeye dokununca oyun adres çubuğu olmadan tam ekran açılır.

## 3. Claude Code için: mimari ve veri modelleri

### 3.1 Mevcut yapı

Şu an her şey tek bir `index.html` içinde, 11 numaralı bölümlere ayrılmış yorum başlıklarıyla. Bölümler:
1. CONFIG (kişiselleştirme)
2. Depolama (localStorage sarmalayıcı `store`)
3. Rastgelelik (`hashSeed`, `mulberry32`)
4. Bulmaca üreteci ve doğrulayıcı (`makePuzzle`)
5. Ayarlar
6. Yolculuk / level sistemi
7. Oyun durumu ve çizim (`render`, `toggle`, `checkWin`)
8. Ekranlar / navigasyon
9. Ayar paneli
10. Konfeti
11. Olay bağlama

### 3.2 Önerilen modüler yapı (refactor hedefi)

Claude Code projeyi şuna bölebilir. Çekirdek mantık UI'dan tamamen ayrık olduğu için bu kolay olacak:

```
/src
  /core
    rng.js          # hashSeed, mulberry32
    generator.js    # makePuzzle (saf fonksiyon, DOM yok)
    solver.js       # checkWin + ileride teklik kontrolü / mantık çözücü
  /state
    storage.js      # localStorage sarmalayıcı
    settings.js     # ayar yönetimi
    progress.js     # yolculuk + roguelike ilerleme
  /modes
    journey.js      # level tanımları + parametre üretimi
    rogue.js        # roguelike koşu mantığı (yeni)
  /ui
    board.js        # SVG çizimi ve girdi
    screens.js      # ekran navigasyonu
    confetti.js
  main.js
index.html
```

Not: Modüllere geçilirse `type="module"` kullanılır ve yerelde file:// yerine bir sunucudan (veya Vercel) servis edilmesi gerekir. Tek dosya tercih edilirse mevcut yapı korunabilir.

### 3.3 Temel veri yapıları

Bulmaca nesnesi (`makePuzzle` çıktısı):
- `R`, `C`: satır ve sütun sayısı (hücre).
- `clue[r][c]`: gösterilen ipucu (0-3) ya da -1 (boş). r in 0..R-1, c in 0..C-1.
- `solH[r][c]`: çözümdeki yatay kenarlar. r in 0..R, c in 0..C-1. 1 = çizgi var.
- `solV[r][c]`: çözümdeki dikey kenarlar. r in 0..R-1, c in 0..C. 1 = çizgi var.

Oyuncu durumu:
- `hState[r][c]`, `vState[r][c]`: 0 = boş, 1 = çizgi, 2 = çarpı (kullanıcı "burada çizgi yok" işareti).
- Bir hücrenin 4 kenarı: üst `hState[r][c]`, alt `hState[r+1][c]`, sol `vState[r][c]`, sağ `vState[r][c+1]`.

Kazanma koşulu (`checkWin`):
1. Gösterilen her ipucu için, etrafındaki çizgi (state 1) sayısı ipucuya eşit.
2. Çizgili kenarlar tek bir kapalı döngü oluşturur: her nokta derecesi 0 veya 2, ve tüm çizgiler tek bir bileşen.

### 3.4 Persistence şeması (localStorage anahtarları)

- `cember:settings` -> `{hints, fade, errors, haptics}` (boolean)
- `cember:free:current` -> serbest oyundaki yarım bulmacanın snapshot'ı
- `cember:journey:progress` -> `{unlocked: number, times: {levelIndex: saniye}}`
- `cember:journey:current` -> yolculuktaki yarım bölümün snapshot'ı
- `cember:stats` -> (rezerve, henüz kullanılmıyor)

Snapshot formatı: `{puzzle, ctx, hState, vState, hints, elapsed}`. `ctx = {mode, levelIndex, seed?}`.

Roguelike için yeni anahtar önerisi: `cember:rogue:run` (aktif koşu) ve `cember:rogue:meta` (kalıcı ilerleme, açılan başlangıç bonusları vb.).

### 3.5 Önemli teknik notlar

- Üreteç "basit bağlı bölge" (simply connected region) büyütme yöntemi kullanır; bu sayede üretilen çember her zaman tek ve kapalıdır. Teklik (unique solution) garanti edilmez. Çoklu çözüm bir oyuncu için sorun değildir (geçerli her çember kazanır), ama "gerçek" Slitherlink hissi isteniyorsa Claude Code bir mantık çözücü ekleyip teklik kontrolü yapabilir (`solver.js`).
- İpucu yoğunluğu düştükçe çoklu çözüm olasılığı artar. Zorluk arttıkça teklik kontrolü daha değerli hale gelir.
- Çizim SVG tabanlı; her kenarın üstünde geniş görünmez bir tıklama alanı (`edge-hit`) var, mobilde rahat dokunmak için.

## 4. Oyun tasarımı

### 4.1 Çekirdek mekanik

Slitherlink: noktalardan oluşan ızgarada, hücrelerdeki sayılar o hücrenin etrafındaki çizgi adedini söyler. Oyuncu tek ve kapalı bir döngü çizmeye çalışır. Çizgiler kesişemez, dallanamaz.

Girdi: bir kenara dokunmak durumu döngüsel değiştirir. Boş -> çizgi -> çarpı -> boş. Çarpı, oyuncunun "burada kesin çizgi yok" notu; çözümü etkilemez ama akıl yürütmeye yardım eder.

### 4.2 Modlar

Serbest Oyun: oyuncu boyut, ipucu yoğunluğu ve isteğe bağlı seed seçer, sınırsız bulmaca çözer. Hazır seviye ön ayarları hızlı başlangıç sağlar.

Yolculuk (kampanya / dungeon): 6 katlı, her kat 5 bölüm. Zorluk kademeli artar (boyut büyür, ipucu azalır). Bölümler sırayla açılır, ilerleme kaydedilir, her bölüm için en iyi süre tutulur. Katlar temalı isimlere sahip (Giriş Holü, Sessiz Koridor, Gölge Galerisi, Kayıp Kütüphane, Kristal Mağara, Zirve). Şu an doğrusal; ileride dallanan harita yapılabilir.

Rogue Modu (planlandı, kod yok): aşağıda ayrı bölüm.

### 4.3 Zorluk eksenleri

Zorluk üç bağımsız eksenle ayarlanır:
- Tahta boyutu: büyük tahta daha uzun ve zor.
- İpucu yoğunluğu: az ipucu daha zor.
- (İleride) teklik ve gerekli akıl yürütme derinliği: çözücü eklenince zorluk daha doğru ölçülebilir.

## 5. Roguelike modu tasarımı (Claude Code için inşa edilecek)

Amaç: Yolculuğun sabit/kaydeden yapısının aksine, her seferinde farklı, riskli ve ödüllü bir "koşu" (run) sunmak. Roguelike öğeleri: rastgele üretilen kat haritası, canlar, kalıcı olmayan ilerleme (permadeath), toplanabilir eşyalar/bonuslar, ve giderek artan zorluk.

### 5.1 Koşu yapısı

Bir koşu, dallanan bir kat haritasından oluşur (Slay the Spire benzeri düğüm haritası). Oyuncu her katta bir yol seçer ve düğümleri çözerek ilerler. Harita seed ile üretilir (tekrar üretilebilirlik ve hata ayıklama için).

Düğüm tipleri:
- Bulmaca düğümü (standart): bir Slitherlink çöz. Süre veya hata limiti olabilir.
- Elit düğüm: daha büyük/az ipuçlu zor bulmaca, daha iyi ödül.
- Ödül/sandık düğümü: bulmaca yok, bir eşya seç.
- Dinlenme düğümü: bir can yenile ya da bir eşyayı yükselt.
- Olay düğümü: rastgele metinli karar (risk/ödül).
- Patron düğümü (kat sonu): büyük bulmaca, ek kısıt.

### 5.2 Canlar ve başarısızlık

Oyuncu sınırlı canla başlar (örn. 3). Can kaybı tetikleyicileri (seçilebilir kurallar):
- Bir bulmacada belirli sayıda yanlış kapanış denemesi.
- Süre limitini aşmak (zamanlı düğümlerde).
- Olay düğümünde kötü sonuç.

Can biterse koşu biter (permadeath), oyuncu meta ilerleme ekranına döner. Bu, Yolculuktan farklı olarak risk hissi yaratır.

### 5.3 Eşyalar ve bonuslar (relics / perks)

Pasif ve aktif eşyalar koşu boyunca taşınır. Örnekler:
- Pusula: koşu başına 1 ücretsiz ipucu daha.
- Gümüş kalem: ilk yanlış kapanış cezasız.
- Kum saati: zamanlı düğümlerde +30 saniye.
- Harita parçası: bir sonraki kat düğüm tiplerini önceden gösterir.
- Çift dikiş: dinlenme düğümünde 2 can yenilenir.

Eşyalar ödül ve sandık düğümlerinden gelir. Tasarım, eşyaların birbirini güçlendirmesine (sinerji) izin vermeli.

### 5.4 Meta ilerleme (koşular arası kalıcı)

Permadeath olsa da oyuncu uzun vadede ilerlemeli:
- Tamamlanan koşular yeni başlangıç eşyalarını veya kat temalarını açar.
- İstatistikler: en uzak kat, toplam koşu, en iyi süre.
- Açılan zorluk seviyeleri (ascension benzeri): tamamlayınca daha zor kural setleri açılır.

### 5.5 Roguelike için veri modeli önerisi

```
Run = {
  seed, floor, nodeIndex,
  lives, maxLives,
  relics: [relicId...],
  mapGraph: { nodes:[{id,type,floor,edgesTo:[id...]}], ... },
  visited: [nodeId...],
  rngState
}
RogueMeta = { bestFloor, totalRuns, unlockedStartRelics:[...], ascension }
```

Anahtarlar: `cember:rogue:run`, `cember:rogue:meta`. Koşu yarıda kalırsa devam edilebilir (autosave aynı mantık).

### 5.6 İlk sürüm (MVP) kapsamı

Roguelike'ı küçük başlatmak için önerilen ilk hedef: doğrusal 8-10 düğümlük tek bir koşu, 3 can, 3 eşya çeşidi, bir patron. Harita dallanması, olay düğümleri ve meta ilerleme sonraki iterasyonlara bırakılabilir.

## 6. Claude Design için: tasarlanacak ekranlar

Bu bölüm görsel tasarımın spec'idir. Mevcut `index.html` işlevsel bir iskelettir; tasarım baştan kurgulanabilir, ancak işlevsel akış ve bileşenler korunmalı.

### 6.1 Genel yön

- Tema: siyah ve gri ağırlıklı, zarif, sakin (Merve'nin sevdiği renkler siyah ve gri). Tek dosyada renkler `--bg`, `--panel`, `--line`, `--ink`, `--muted`, `--accent` değişkenlerinden yönetilir; tasarım bu değişken setini genişletebilir.
- Hedef cihaz: iPhone 11 (CSS 414 x 896 px civarı), dikey. Tasarım mobil öncelikli olmalı; safe-area (çentik ve alt çubuk) dikkate alınmalı. 100dvh kullanımı önemli (adres çubuğu daralması).
- His: bulmaca sakinleştirici olmalı; yüksek kontrastlı ama yormayan, hafif "dungeon/mistik" dokunuşlar (Yolculuk ve Rogue için) ama Serbest Oyunda sade.
- Tipografi: şu an Fraunces (başlık) + Karla (gövde). Tasarım kendi seçimini yapabilir; okunaklı rakamlar bulmaca için kritik.
- Erişilebilirlik: ipucu rakamları küçük ekranda net okunmalı; çizgi/çarpı/boş durumları renkten bağımsız da ayırt edilebilmeli.

### 6.2 Ekran listesi ve durumlar

Açılış (Start) ekranı:
- Tek seferlik karşılama. "Merhaba Merve" + kişisel mesaj + Başla butonu.
- Marka anı: oyunun kimliğini ilk burada kuralım.

Ana menü (Home):
- Başlık/logo, "Merve için" alt metni.
- Mod kartları: Serbest Oyun, Yolculuk, Rogue Modu (kilitli/yakında rozeti). Her kartta ikon, başlık, kısa açıklama.
- "Devam et" rozeti: ilgili modda yarım oyun varsa kartta görünür. Tasarım bu durumu net göstermeli.
- Sağ üstte ayarlar (dişli) ikonu.

Serbest Oyun kurulum (Setup):
- Hazır seviye çipleri (Kolay/Orta/Zor/Uzman/Rastgele).
- Tahta boyutu çipleri (4x4 ila 12x12), seçili durum belirgin.
- İpucu yoğunluğu sürgüsü (% göstergeli).
- Seed metin alanı + rastgele (zar) butonu.
- Büyük Başlat butonu.
- Tasarım: bu ekran bir alt sayfa (sheet) ya da tam ekran olabilir.

Yolculuk haritası (Journey):
- Katlara gruplanmış bölüm listesi. Her bölümde numara, boyut, ipucu yüzdesi, en iyi süre.
- Durumlar: kilitli, açık (oynanabilir), tamamlandı (onay işareti).
- Mevcut iskelet düz liste; tasarım dikey bir "harita/yol" görselleştirmesine dönüştürebilir (düğümler arası bağlantı çizgileri, ilerleme hissi).

Oyun (Game) ekranı:
- Üst bar: geri, bölüm/mod başlığı, ayarlar.
- HUD: süre ve ipucu sayacı.
- Bulmaca tahtası: noktalar, ipucu rakamları, çizgi/çarpı kenarları. En önemli ekran; bulmacanın küçük ve büyük boyutlarda (4x4 ve 12x12) iyi durması gerek.
- Kenar durumları: boş, çizgi (kalın, ana renk), çarpı (soluk işaret). Tamamlanan ipucu soluklaşır (ayar açıksa), hatalı ipucu kırmızı olur (ayar açıksa). Tasarım bu üç durum için net görsel dil tanımlamalı.
- Alt kontroller: Temizle, İpucu (ayara bağlı görünür), Yeni.

Ayarlar (alt sayfa / sheet):
- Aç/kapa anahtarları: İpucu butonu, Tamamlananı soluklaştır, Hataları kırmızı göster, Titreşim.
- iPhone tam ekran ipucu metni (Ana Ekrana Ekle).
- İleride: tema seçimi, ses, dil.

Kazanma (Win) modali:
- Kutlama (şu an gri tonlu konfeti), "Aferin Merve" + mesaj, süre ve ipucu istatistiği.
- Aksiyonlar: Ana menü, Devam (Yolculukta sonraki bölüm; Serbestte yeni bulmaca).

Roguelike ekranları (gelecek, tasarımı şimdiden düşünülebilir):
- Koşu haritası (dallanan düğüm haritası).
- Can/eşya göstergeli oyun HUD'u.
- Eşya seçim ekranı (sandık/ödül).
- Olay düğümü (metin + seçenekler).
- Koşu sonu (başarı/başarısızlık + meta ilerleme).

### 6.3 Tasarım çıktısı beklentisi

Claude Design'dan beklenen: yukarıdaki ekranlar için tutarlı bir görsel sistem (renk değişkenleri, tipografi, boşluk ölçeği, bileşen stilleri, ikonografi, durum görselleri) ve her ekranın mobil düzeni. Çıktı, mevcut HTML/CSS yapısına uygulanabilir CSS değişkenleri ve bileşen sınıfları olarak verilebilir; böylece Claude Code işlevselliği bozmadan giydirebilir.

## 7. Yol haritası (önerilen sıra)

Kısa vade (Claude Code):
1. Tasarımı (Claude Design çıktısı) mevcut iskelete giydirmek.
2. Geri al (undo) ve tüm tahtayı çarpıyla doldurma gibi küçük kolaylıklar.
3. İstatistik ekranı ve toplam ilerleme.

Orta vade:
4. Mantık çözücü ve teklik kontrolü (gerçek Slitherlink zorluğu ve doğru zorluk etiketleri).
5. Yolculuğu dallanan haritaya çevirmek.

Uzun vade:
6. Roguelike MVP (bkz. bölüm 5.6), ardından harita dallanması, eşyalar, meta ilerleme.
7. PWA tamamlama (manifest + service worker) ile çevrimdışı oynanabilirlik.

## 8. Açık kararlar

- Teklik garantisi isteniyor mu, yoksa "geçerli her çember kazanır" yeterli mi? (Oyun hissini etkiler.)
- Yolculuk doğrusal mı kalsın, dallanan harita mı olsun?
- Roguelike ayrı bir mod mu, yoksa Yolculuğun zor bir varyantı mı?
- Çoklu dil gerekecek mi (şu an Türkçe)?
- Ses ve müzik eklenecek mi?

Bu kararlar netleştikçe bölüm 3.2'deki modüler yapı ve bölüm 5'teki roguelike kapsamı buna göre güncellenebilir.
