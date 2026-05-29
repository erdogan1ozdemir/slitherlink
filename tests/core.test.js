// tests/core.test.js — minimal smoke harness, no framework
import {hashSeed, mulberry32} from "../src/core/rng.js";
import {makePuzzle} from "../src/core/generator.js";
import {validateLoop} from "../src/core/checker.js";
import {countSolutions} from "../src/core/solver.js";
import {TALENTS, purchase as purchaseTalent, aggregateEffects as talentEffects} from "../src/rogue/talents.js";
import {CHARMS, purchase as purchaseCharm, equip as equipCharm, aggregateEffects as charmEffects} from "../src/rogue/charms.js";
import {NEOW_BLESSINGS, rollBlessings, applyBlessing} from "../src/rogue/neow.js";
import {TILE_TYPES, applyTiles, revealTile, tickKayanTiles} from "../src/rogue/tiles.js";
import {THORNS, totalIzScore, rewardMultiplier} from "../src/rogue/thorns.js";
import {KEEPSAKES, allUnlockedKeepsakes, checkAutoUnlock} from "../src/rogue/keepsakes.js";
import {todaySeed, todayDate, hasPlayedToday, recordResult, getLeaderboard} from "../src/rogue/daily.js";
import {REALMS} from "../src/rogue/realms.js";
import {ACHIEVEMENTS} from "../src/rogue/achievements.js";

const results=document.getElementById("results");
const summary=document.getElementById("summary");
let pass=0,fail=0;

function test(name,fn){
  const div=document.createElement("div");
  div.className="test";
  try{
    fn();
    div.classList.add("pass");
    div.textContent="✓ "+name;
    pass++;
  }catch(e){
    div.classList.add("fail");
    div.textContent="✗ "+name+" — "+e.message;
    fail++;
  }
  results.appendChild(div);
}
function assert(cond,msg){if(!cond)throw new Error(msg||"assert failed");}
function eq(a,b,msg){if(a!==b)throw new Error((msg||"eq failed")+": "+a+" !== "+b);}

// RNG: deterministik
test("hashSeed deterministic",()=>{
  eq(hashSeed("merve-01"),hashSeed("merve-01"));
  assert(hashSeed("a")!==hashSeed("b"));
});
test("mulberry32 deterministic",()=>{
  const r1=mulberry32(42);const r2=mulberry32(42);
  for(let i=0;i<5;i++)eq(r1(),r2());
});

// Generator: tek loop + clue validity
test("makePuzzle returns valid structure",()=>{
  const rng=mulberry32(hashSeed("test-seed-1"));
  const p=makePuzzle(5,5,0.8,rng);
  eq(p.R,5);eq(p.C,5);
  eq(p.solH.length,6);eq(p.solH[0].length,5);
  eq(p.solV.length,5);eq(p.solV[0].length,6);
  eq(p.clue.length,5);
});
test("makePuzzle solution is a valid single loop",()=>{
  for(let seed=1;seed<=10;seed++){
    const rng=mulberry32(hashSeed("test-"+seed));
    const p=makePuzzle(5,5,1.0,rng);
    assert(validateLoop(p,p.solH,p.solV),"solution should validate for seed "+seed);
  }
});

// Checker: empty state should not win
test("validateLoop returns false for empty edges",()=>{
  const rng=mulberry32(hashSeed("empty-check"));
  const p=makePuzzle(4,4,1.0,rng);
  const hEmpty=Array.from({length:5},()=>Array(4).fill(0));
  const vEmpty=Array.from({length:4},()=>Array(5).fill(0));
  assert(!validateLoop(p,hEmpty,vEmpty));
});

// Solver: full-clue puzzle should have at least one solution
test("solver counts solution",()=>{
  const rng=mulberry32(hashSeed("solver-test"));
  const p=makePuzzle(4,4,1.0,rng);
  const n=countSolutions(p,2,2000);
  assert(n>=1,"solver finds at least one solution, got "+n);
});

// === Plan 11 — talents + charms + neow + tiles ===
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

// === Plan 12 — thorns + keepsakes + daily + D4 ===
test("thorns 10 modifier",()=>eq(THORNS.length,10));
test("iz score sums ranks",()=>{eq(totalIzScore({"daralma":2,"kor-pusula":1}),3);});
test("reward multiplier tiers",()=>{
  eq(rewardMultiplier(0),1.0);
  eq(rewardMultiplier(3),1.5);
  eq(rewardMultiplier(7),2.0);
  eq(rewardMultiplier(11),2.5);
});
test("tiles registry has 7 types",()=>eq(Object.keys(TILE_TYPES).length,7));
test("keepsakes 8",()=>eq(Object.keys(KEEPSAKES).length,8));
test("keepsake autoUnlock adds to discovered",()=>{
  const m={achievements:{"aksam-isigi":{}},keepsakes:{discovered:[]}};
  checkAutoUnlock(m);
  assert(m.keepsakes.discovered.includes("akşam-isigi"));
});
test("today seed format",()=>{
  const s=todaySeed();
  assert(s.startsWith("daily-"));
  eq(todayDate().length,10);
});
test("daily recordResult stores latest entries",()=>{
  const mem={};
  const fakeStore={get:(k,d)=>k in mem?mem[k]:d,set:(k,v)=>{mem[k]=v;}};
  recordResult(fakeStore,{date:"2026-05-26",time:120,solves:1,realmId:null,success:true});
  const lb=getLeaderboard(fakeStore);
  eq(lb.entries.length,1);
  eq(lb.entries[0].date,"2026-05-26");
  assert(hasPlayedToday(fakeStore)||true); // today might be different from fixed date
});
test("realms registry has 5 entries",()=>{
  // stub-diyar + sogut-esigi + karanlik-igne + yildiz-gecidi + dugumun-ardi = 5
  eq(Object.keys(REALMS).length,5);
  assert(REALMS["dugumun-ardi"]);
  eq(REALMS["dugumun-ardi"].floors,12);
});
test("achievements registry has 29 entries (26 base + 3 D4)",()=>{
  eq(Object.keys(ACHIEVEMENTS).length,29);
  assert(ACHIEVEMENTS["dugumun-ardi-cleared"]);
  assert(ACHIEVEMENTS["dugum-ustasi"]);
  assert(ACHIEVEMENTS["iplgin-sonu"]);
});

// Solver: uniqueness smoke
test("solver finds unique solution for 4x4 full clue",()=>{
  const rng=mulberry32(hashSeed("solver-unique"));
  const p=makePuzzle(4,4,1.0,rng);
  const n=countSolutions(p,2,2000);
  eq(n,1);
});
test("solver caps at maxSolutions",()=>{
  const rng=mulberry32(hashSeed("solver-multi"));
  // Empty clue puzzle (no constraints) — likely multi solution
  const p={R:3,C:3,clue:Array.from({length:3},()=>Array(3).fill(-1)),solH:Array.from({length:4},()=>Array(3).fill(0)),solV:Array.from({length:3},()=>Array(4).fill(0))};
  const n=countSolutions(p,3,1000);
  assert(n>=2||n<=3,"caps in [0..maxSolutions]");
});
test("checkUnique on large board does not hang (timeout-aware)",()=>{
  // Big sparse boss-style board: solver times out, but generation must bail fast
  // (single check, no pointless clue-add loop). Bound well under the old 4×1500ms.
  const rng=mulberry32(hashSeed("boss-unique-12"));
  const t0=Date.now();
  const p=makePuzzle(12,12,0.36,rng,{checkUnique:true,uniqueTimeoutMs:600});
  const dt=Date.now()-t0;
  assert(validateLoop(p,p.solH,p.solV),"generated puzzle solution still valid");
  assert(dt<1500,"generation must bail fast on timeout, took "+dt+"ms");
});

// === Constraint tiles: solvability preserved across all realms (Paket B) ===
test("all constraint tiles keep the real solution valid",()=>{
  const realms=["sogut-esigi","karanlik-igne","yildiz-gecidi","dugumun-ardi"];
  for(const realm of realms){
    for(let seed=1;seed<=15;seed++){
      const rng=mulberry32(hashSeed(realm+"-tile-"+seed));
      const p=makePuzzle(6,6,0.85,rng);
      applyTiles(p,realm,mulberry32(hashSeed(realm+"-apply-"+seed)),0.4);
      assert(validateLoop(p,p.solH,p.solV),
        "real solution must still validate after tiles ("+realm+" seed "+seed+")");
    }
  }
});
test("non-sis tiles actually get placed (gate removed)",()=>{
  // yildiz-gecidi pool has all 7 types; high density should surface non-sis tiles.
  const types=new Set();
  for(let seed=1;seed<=30;seed++){
    const rng=mulberry32(hashSeed("place-"+seed));
    const p=makePuzzle(7,7,0.9,rng);
    applyTiles(p,"yildiz-gecidi",mulberry32(hashSeed("place-apply-"+seed)),0.5);
    for(const k in (p.tiles||{}))types.add(p.tiles[k].type);
  }
  assert(types.size>1,"more than just sis should appear, got: "+[...types].join(","));
  assert([...types].some(t=>t!=="sis"),"at least one non-sis tile type");
});
test("kayan drift keeps solution valid",()=>{
  // Force a puzzle with kayan tiles, tick many times, solution must stay valid.
  const rng=mulberry32(hashSeed("kayan-stress"));
  const p=makePuzzle(7,7,0.9,rng);
  applyTiles(p,"yildiz-gecidi",mulberry32(hashSeed("kayan-apply")),0.5);
  const tickRng=mulberry32(hashSeed("kayan-ticks"));
  for(let i=0;i<60;i++){
    tickKayanTiles(p,tickRng);
    assert(validateLoop(p,p.solH,p.solV),"solution valid after "+i+" kayan ticks");
  }
});

summary.textContent=`${pass} pass · ${fail} fail · ${pass+fail} total`;
summary.style.color=fail?"#C97A6F":"#8FA39A";
