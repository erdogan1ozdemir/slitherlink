// tests/core.test.js — minimal smoke harness, no framework
import {hashSeed, mulberry32} from "../src/core/rng.js";
import {makePuzzle} from "../src/core/generator.js";
import {validateLoop} from "../src/core/checker.js";

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

summary.textContent=`${pass} pass · ${fail} fail · ${pass+fail} total`;
summary.style.color=fail?"#C97A6F":"#8FA39A";
