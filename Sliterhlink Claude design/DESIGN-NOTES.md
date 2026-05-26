# Çember · Tasarım Notları — Sessiz İplik

Bu dosya, `Çember · Tasarım Tuvali.html` içindeki tasarımların **yazılı spec'i**. Claude Code mevcut foundation'ı bu sisteme göre giydirirken referans alır. Tüm görseller iPhone 11 (414×896) dikey için kurgulandı.

---

## 1. Yön — "Sessiz İplik"

> Sıcak siyahlar üzerine kağıt grisi. Tek bir taupe vurgu. Kalan her şey çekilir, susar; ipliği sen çizersin.

Tek metafor: **iplik**. Çizilen çember ipliktir; ipucu rakamları, hata uyarıları, modaller — hepsi ipliğin etrafında, fısıltıyla. Slop yok, emoji yok, gradient arka plan yok. "Dungeon" dokunuşu sadece Yolculuk ve Rogue'da, başlık seçimlerinde ve ince fonlu hairline detaylarda hissedilir.

**Karakter dokunuşu:** Merve için ana kişiselleştirme (selam, sıcak ton). Jedi (Norveç orman kedisi) iki sessiz easter egg olarak yaşar:
- Açılış ekranı sağ üst köşede ince bir kedi kulağı silüeti.
- Ayarlar paneli altında `merve · jedi · ç` imzası.

---

## 2. Renk

Tüm renkler `--*` değişkeniyle yönetilir, mevcut foundation'daki şemayla uyumlu.

| Token         | Hex        | Kullanım |
|---------------|------------|----------|
| `--bg`        | `#0a0a0c`  | Arka plan (kağıt değil; mürekkep dökülmüş tahta) |
| `--bg-warm`   | `#0d0c0e`  | Hafif çeşit, modal arka planı |
| `--panel`     | `#15151a`  | Kart, chip, panel temel zemini |
| `--panel-2`   | `#1d1d23`  | Üst katman (modal, vurgulu kart) |
| `--hairline`  | `rgba(237,234,227,.08)` | Tüm sınırlar |
| `--hairline-2`| `rgba(237,234,227,.14)` | Vurgulu sınır |
| `--ink`       | `#EDEAE3`  | Yazı, **çember/iplik** rengi |
| `--ink-dim`   | `rgba(237,234,227,.62)` | İtalik ton metni |
| `--muted`     | `#7a7a82`  | İkincil metin, mono detay |
| `--faint`     | `#3a3a42`  | Noktalar, kapalı switch arka planı |
| `--accent`    | `#A89B8B`  | **Taupe vurgu** — kat etiketi, "açıldı", aktif düğüm halkası |
| `--bad`       | `#C97A6F`  | Hata (pas tonu) |
| `--good`      | `#8FA39A`  | Başarı (adaçayı) |

> Önemli: Renk asla tek bilgi taşıyıcı değildir. Çizgi/çarpı/boş üç **ayrı şekil**. Tamamlanan rakam soluklaşırken renge **+** opaklığa düşer.

---

## 3. Tipografi

| Rol | Font | Ağırlık | Notlar |
|-----|------|---------|--------|
| Display / başlık | **Fraunces** | 500-600 | Letter-spacing `-0.02em` ile sıkı |
| Ton / italik | **Fraunces Italic** | 400 | Selam, modal alt yazıları, fısıltılar |
| Gövde / button | **Karla** | 400-700 | UI, kart başlığı, button |
| HUD / mono | **JetBrains Mono** | 500-700 | Süre, ipucu sayısı, seed, kat etiketi |

Tüm rakamlar `font-variant-numeric: tabular-nums` ile sabit genişlikte. **Bulmaca rakamları** Karla 700, `S*0.42` (hücre boyunun ~%42'si).

---

## 4. Boşluk + geometri

- Köşe yarıçapı: chip 12, kart 16-18, modal 24
- Hairline 1px (asla 2px değil — incelik kimlik)
- Dış kart gölgesi yok; iç çerçeve `border` + opsiyonel `radial-gradient` halo
- Buton iç dolgusu: birincil 18px, ikincil 13px
- Sayfa kenarı: 20-24px

---

## 5. Ekranlar (12 adet)

### 5.1 Akış (oyunun ana iskeleti)

| # | Ekran | Notlar |
|---|-------|--------|
| 01 | **Açılış** | Tek seferlik; "Merhaba Merve" + dekoratif tek-çember ikon. İlk gösterimden sonra atlanır. |
| 02 | **Ana Menü (default)** | 3 mod kartı (Serbest / Yolculuk / Rogue-kilitli). Sağ üst ⚙. |
| 02b | **Ana Menü (devam et)** | Yarım oyun varsa kart altında `● Devam et · MM:SS` pill. |
| 03 | **Serbest · Kurulum** | Hazır seviye → boyut → yoğunluk → seed. Alt önizleme kartı. |
| 04a | **Yolculuk · Harita** | Üst ilerleme şeridi, kat başlıkları + 5 düğümlük yatay grup. Mevcut düğüm halkalı, tamamlanan ✓ taupe. |
| 04b | **Yolculuk · Liste** | Aynı veri, kart yığını formunda (alternatif). |
| 06 | **Ayarlar** | Bottom-sheet; 4 toggle + "Tam ekran oyna" bilgi kartı + imza. |

### 5.2 Oyun (kritik ekran)

| # | Ekran | Durum |
|---|-------|-------|
| 05a | **Erken** | 5×5, birkaç çizgi + bir çarpı |
| 05b | **Orta + hata** | 7×7, yol başlamış; bir rakam pas (hata), iki rakam solgun (tamam) |
| 05c | **Uzman 12×12** | Seyrek ipucu, küçük rakam, küçük boşluk; HUD'da seed satırı |
| 05d | **Kazanma** | Tahta arkada blurlu, modal: küçük iplik glyph + süre/ipucu/yıldız + "Sonraki bölüm" |

**Oyun ekranı kimliği:**
- Üst bar: `‹ | kicker + title | ⚙`
- HUD: iki pill (SÜRE · İPUCU), monospace rakam, uppercase mono etiket
- Tahta kartı: 22 yarıçap, 14 padding
- Alt kontroller: Temizle (ghost) · İpucu (ghost, ayara bağlı) · Yeni (primary, beyaz)

### 5.3 Rogue Modu (gelecek — sadece tasarım)

| # | Ekran | İçerik |
|---|-------|--------|
| 07 | **Koşu Haritası** | 5 katlı dallanan düğüm grafiği (puzzle/elite/chest/rest/event/boss); seçili düğüm halkalı, alt detay kartı |
| 08 | **Oyun + HUD** | Üst: ♥ canlar · KAT n · seed · ◇ relics. Tahta. Altta 3 relic kartı + uyarı şeridi |
| 09 | **Sandık** | 3 eşya, seçili olan accent border, "rar" mono etiketi (sık/nadir), birincil button |
| 10 | **Olay** | Üstte atmosferik glyph kartı, italik anlatım, 3 seçenek (risk/güven/geç tone tag'leri) |
| 11 | **Koşu Sonu** | Kırık iplik SVG, "İplik koptu", 4 istatistik kartı, yeni eşya açıldı bildirimi, "Yeni Koşu" |

---

## 6. Bileşen sözlüğü (Claude Code için)

```
.Kicker         — uppercase mono, letter-spacing .32em, color muted
.Rule           — 1px hairline
.Display        — Fraunces 500, tight tracking
.Phone          — bezel + notch + home indicator (414×896)
.StatusBar      — 9:41 + battery/signal (statik)
.Board          — SVG, props: R, C, clues[][], edges{h,v}, errors[][], done[][]
.Chip           — pill, sel state = ink bg / bg text
.Switch         — 48×28, ink bg on, faint bg off
.Card           — panel/panel-2 + hairline + 16-18 radius
```

`Board` bileşeni mevcut foundation'daki `render()` çağrısının doğrudan görsel karşılığı; `solH/solV` yerine sadece `edges` durumunu çizer (0=boş, 1=çizgi, 2=çarpı). Erişilebilirlik için boş+çizgi+çarpı üç ayrı şekil olarak korunur.

---

## 7. Devir: Claude Code için sıra

1. CSS değişkenlerini bu tablodaki tokenlere göre güncelle (`--bg`, `--ink`, `--accent`, vb. zaten var; sadece değerleri eşitle).
2. Üst bar / HUD chip / kart geometrisini bu değişkenlere bağla.
3. `Phone` çerçevesini gerçek body kullandığından, sadece **içerik** layout'unu giydir; bezel uygulamada gerek yok.
4. Açılış ekranındaki tek-çember ikonu küçük bir SVG asset olarak ayır (`assets/loop.svg`).
5. Yolculuk haritasını mevcut "liste" yönünden "yatay düğüm" yönüne çevir (bkz. 04a). Liste yönü (04b) kolay erişim için fallback.
6. Settings sheet'i overlay olarak değil, bottom-sheet olarak yeniden konumla; üstte 42×4 handle.
7. Rogue ekranları **henüz uygulanmaz** — sadece tasarım onaylanırsa kod aşamasına geçilir.

---

## 8. Açık tasarım soruları

- 04a haritada düğümler arasında **kesik çizgi** kullanıldı; sürekli (solid) hairline mi yoksa kesik mi tercih edilir?
- Açılışta tek-çember ikonu çizimi mi (mevcut) yoksa monogram (`Ç`) mi daha samimi olur?
- Ana menü kartlarında glyph (✦ ⬢ ☠) yerine her mod için özel **SVG sembol** çizilsin mi?
- Kazanma modalindaki "yıldız" yerine **kişisel bir tebrik** (örn. tarihçe: "12. çözümün") daha sıcak olur mu?

---

*Tüm görseller `Çember · Tasarım Tuvali.html` dosyasında canlıdır; doğrudan tarayıcıda aç, panele yakınlaş, herhangi bir kartı tam ekranda incele.*
