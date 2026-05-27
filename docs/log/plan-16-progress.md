# Plan 16 Progress
- [x] Task 1: Branch + log (181e1ef)
- [x] Task 2: Floor labels üste taşı (A.1) — d48925f
- [x] Task 3: Node x-overflow düzelt (A.2) — 67273bc; cx(0..3) = 50, 136.67, 223.33, 310
- [x] Task 4: rogueMapHelp binding doğrula (A.4) — f4f13ce; mevcut global listener (line 2339) yeterli, ek bind yok
- [x] Task 5: Journey + Daily checkUnique (B.1-B.2) — bbc55a5
- [x] Task 6: Boss pre-fight modal (C.1-C.2) — 590aacf; pragmatik yaklaşım, refactor yerine boss case için pre-check
- [x] Task 7: Final + merge + push

## Notlar

- Boss intro implementasyonu: handleRogueNode puzzle branch'i koruyup, başında `if(node.type==="boss"&&!run.bossIntroShown)` ile pre-modal ekledim. Modal "Başla" tıklamasında handleRogueNode recursive çağrılıyor; bossIntroShown=true olduğu için modal atlanıp normal puzzle setup çalışıyor. "Vazgeç" tıklayınca closeRogueModal sonrası kullanıcı map'te kalıyor.
- showBossIntro helper, openRogueModal kullanır; bossName, bossIntro, bossMultiStage fields'i realms.js'den okur.
- bossIntroShown koşu (run) başına bir kez set olur; reset edilmez. Multi-stage boss advance startGame'i doğrudan çağırdığından (handleRogueNode'dan değil), pre-modal sadece ilk attempt'ta tetiklenir — istenen davranış.
- Smoke: tüm src/core/*.js + src/rogue/*.js node --check ile pass. index.html inline JS ayıklayıp node --check ile pass.
