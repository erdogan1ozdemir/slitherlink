# Plan 14 Progress

## Phase A — CRITICAL
- [x] Task 1: Branch + log (e80d5b9)
- [x] Task 2: Sequential lock fix (pendingNodeId pattern) (b20f4e2)

## Phase B — Map layout
- [x] Task 3: Manhattan edge routing + dynamic SVG height + larger nodes (d496bb7)
- [x] Task 4: Floor labels separate column + no overlap (d496bb7)

## Phase C — More content
- [x] Task 5: realms.js floor counts (D1:6, D2:8, D3:10, D4:12) + isimler (0407880)
- [x] Task 6: map.js generateMap node distribution genişletme (f2b70a0)
- [x] Task 7: Boss difficulty scaling + D4 multi-stage (416bcc6)
- [x] Task 8: Constraint tile density per realm — d496bb7'de Task 3/4 ile birlikte applied
  (handleRogueNode'da tileDensity={D1:0.15,D2:0.22,D3:0.30,D4:0.35} + boss×1.5)

## Final
- [x] Task 9: Final + merge + push

## Self-Review

Smoke test (floor counts + boss size + multistage):
```
sogut-esigi   floors: 6  multistage: 1  boss size: 7
karanlik-igne floors: 8  multistage: 1  boss size: 8
yildiz-gecidi floors: 10 multistage: 3  boss size: 10
dugumun-ardi  floors: 12 multistage: 4  boss size: 12
```

Smoke test (generateMap with floorConfig):
- Non-start/boss floor'larda 2-4 node observed.
- Type'lar floorConfig[f].nodes pool'undan geliyor (D4 F2 → elite/event/chest; D4 F5 → rest/elite).
- Start/boss floor'lar tek node.
- Boss floor center'da (Math.floor(W/2)).

Karşılanan kriterler:
- ✅ Sequential lock (pendingNodeId, win-deferred moveTo)
- ✅ Manhattan path routing
- ✅ Dynamic SVG height
- ✅ Floor labels no overlap (separate column)
- ✅ Larger touch targets (r=20 visible, r=32 hit area)
- ✅ Floor counts 6/8/10/12
- ✅ More nodes per floor (2-4 random width)
- ✅ Boss difficulty scaling (D2 8x8, D3 10x10, D4 12x12)
- ✅ Constraint tile density per realm (D1:0.15 → D4:0.35, boss×1.5)
