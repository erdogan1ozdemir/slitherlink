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

## Test instruction: Yedek roundtrip
1. Settings'i değiştir, bir bulmaca yarıda bırak
2. Yedek Kodu Üret → kopyala
3. DevTools → Application → localStorage → tüm cember:* sil
4. Yenile, Yedek Yükle → kodu yapıştır
5. Ayar değişikliği + yarım bulmaca geri gelmeli

## Plan 02 — Final

Branch `plan-02-patches-and-features` üzerinde 18 task tamamlandı. Toplam 17-18 commit.

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
