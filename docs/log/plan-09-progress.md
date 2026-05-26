# Plan 09 Progress
- [x] Task 1: Branch + log
## Phase A - UX polish
- [x] Task 2: Yuva ⚙ handler + Yuva settings buttons
- [x] Task 3: Rogue Map floor labels (GİRİŞ / BİTİŞ + isim)
- [x] Task 4: Home Rogue Modu kartına resume pill
- [x] Task 5: Game "Yeni" butonu rogue'da gizle + mid-puzzle save/resume
## Phase B - D3 content
- [x] Task 6: realms.js — yildiz-gecidi
- [x] Task 7: relics.js — 6 D3 relic
- [x] Task 8: events.js — 6 D3 event
- [x] Task 9: achievements.js — 5 D3 achievement + multi-stage boss
- [x] Task 10: Boss callback — D3 boss multi-stage handling
## Phase C - Mum Modu
- [x] Task 11: Settings'e mumModu toggle
- [x] Task 12: Rogue HUD mum + timer + node cost
- [x] Task 13: Timer tick + run end on timeout (puzzle-içi tick SKIP — node geçişlerinden düşülüyor)
## Finalize
- [x] Task 14: Final + merge + push

## Self-Review
- Phase A: Yuva ⚙ orphan, floor labels (GİRİŞ/BİTİŞ), home resume pill (rogue go direct to map), mid-puzzle save+resume, "Yeni" hide → DONE
- Phase B: D3 realm + 6 relic + 6 event + 5 achievement + 3-stage boss + 2 new event effect (stardust, chance-bead-or-damage) → DONE
- Phase C: mumModu toggle + HUD candle + node cost + +90s floor bonus + timeout end → DONE (puzzle-içi tick SKIP per plan)

## Registry counts
- realms: 4 (stub + D1 + D2 + D3)
- relics: 18 (6 D1 + 6 D2 + 6 D3)
- events: 18 (6+6+6)
- achievements: 16 (5 D1 + 6 D2 + 5 D3)

## Notes
- Multi-stage boss artar (size + 1 her aşama, keep − 5% her aşama, floor — 0.40)
- `run.wasResumed` flag home resume click veya page reload üzerinde set edilebilir; v1 sadece home click → wasResumed=true
- mum modu node cost: puzzle=60s, elite=120s, event=30s, rest/chest/boss=0; floor bonus = +90s
