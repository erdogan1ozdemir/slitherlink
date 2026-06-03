// src/rogue/tiles.js — Constraint tiles. v2: Sis + 6 new (ikiz, donmus, iki-konmaz, lanetli, yanki, kayan).

export const TILE_TYPES={
  "sis":{id:"sis",name:"Sis",desc:"Sayı gizli — tıkla 3s reveal.",realms:["karanlik-igne","yildiz-gecidi","dugumun-ardi"]},
  "ikiz":{id:"ikiz",name:"İkiz",desc:"İki hücre aynı sayıyı taşır.",realms:["sogut-esigi","yildiz-gecidi","dugumun-ardi"]},
  "donmus":{id:"donmus",name:"Donmuş",desc:"Etrafına çizgi konmaz.",realms:["karanlik-igne","yildiz-gecidi","dugumun-ardi"]},
  "iki-konmaz":{id:"iki-konmaz",name:"2 Konmaz",desc:"Sayı 2 olamaz.",realms:["karanlik-igne","yildiz-gecidi","dugumun-ardi"]},
  "lanetli":{id:"lanetli",name:"Lanetli",desc:"Loop bu hücreyi tam çevreler (4 kenar).",realms:["yildiz-gecidi","dugumun-ardi"]},
  "yanki":{id:"yanki",name:"Yankı",desc:"Referans hücreyle aynı sayı.",realms:["yildiz-gecidi","dugumun-ardi"]},
  "kayan":{id:"kayan",name:"Kayan",desc:"Her 5 hamlede komşu boş hücreye atlar.",realms:["yildiz-gecidi","dugumun-ardi"]},
};

const REALM_TILE_POOL={
  "sogut-esigi":["ikiz"],
  "karanlik-igne":["sis","donmus","iki-konmaz"],
  "yildiz-gecidi":["sis","ikiz","donmus","iki-konmaz","lanetli","yanki","kayan"],
  "dugumun-ardi":["sis","ikiz","donmus","iki-konmaz","lanetli","yanki","kayan"],
};

/**
 * Apply constraint tiles to a puzzle. Mutates puzzle by adding `tiles` map.
 * tiles: { "r,c": { type, revealed?, pair?, movesUntilShift? } }
 */
/** Solution line-count for a cell (number of loop edges around it in the real solution). */
function solLineCount(puzzle,r,c){
  return (puzzle.solH[r][c]===1)+(puzzle.solH[r+1][c]===1)+(puzzle.solV[r][c]===1)+(puzzle.solV[r][c+1]===1);
}

export function applyTiles(puzzle,realmId,rng,density=0.18){
  if(!puzzle.tiles)puzzle.tiles={};
  const pool=REALM_TILE_POOL[realmId]||[];
  if(!pool.length)return puzzle;
  // Core invariant: every displayed clue must stay TRUTHFUL — equal to the real
  // solution's line-count for that cell. Tiles may only add constraints (never
  // remove or falsify a clue), so a unique base puzzle stays solvable & unique.
  const solLines=(r,c)=>solLineCount(puzzle,r,c);
  for(let r=0;r<puzzle.R;r++)for(let c=0;c<puzzle.C;c++){
    if(puzzle.clue[r][c]<0)continue;
    if(rng()<density){
      const type=pool[(rng()*pool.length)|0];
      const sLines=solLines(r,c);
      // Solvability-preserving placement filters:
      if(type==="iki-konmaz"&&sLines===2)continue; // "2 konmaz" must actually hold
      if(type==="lanetli"&&sLines!==4)continue;    // loop fully surrounds (4 edges)
      if(type==="donmus"&&sLines!==0)continue;     // no edges around (0 edges)
      puzzle.tiles[r+","+c]={type,revealed:false};
      if(type==="lanetli")puzzle.clue[r][c]=4;     // ensure 4 shown (sol already 4)
      // donmus: keep clue (it is 0) — render shows ❄ glyph, win-check enforces 0
      // iki-konmaz / ikiz / yanki / kayan / sis: keep original (truthful) clue
    }
  }
  // İkiz: only pair tiles that already share the same solution line-count, so the
  // synchronized clue stays truthful for both cells.
  const byCount={};
  for(const k in puzzle.tiles){
    if(puzzle.tiles[k].type!=="ikiz")continue;
    const [r,c]=k.split(",").map(Number);
    const n=solLines(r,c);
    (byCount[n]||(byCount[n]=[])).push(k);
  }
  for(const n in byCount){
    const cells=byCount[n];
    for(let i=0;i+1<cells.length;i+=2){
      puzzle.tiles[cells[i]].pair=cells[i+1];
      puzzle.tiles[cells[i+1]].pair=cells[i];
      const [r1,c1]=cells[i].split(",").map(Number);
      const [r2,c2]=cells[i+1].split(",").map(Number);
      // Both equal n already (truthful); set explicitly in case one was clue-hidden.
      puzzle.clue[r1][c1]=+n;puzzle.clue[r2][c2]=+n;
    }
  }
  // Yankı: referential pairing only — never mutates clues, so always safe.
  const yankiCells=[];
  for(const k in puzzle.tiles){if(puzzle.tiles[k].type==="yanki")yankiCells.push(k);}
  for(let i=0;i+1<yankiCells.length;i+=2){
    puzzle.tiles[yankiCells[i]].pair=yankiCells[i+1];
    puzzle.tiles[yankiCells[i+1]].pair=yankiCells[i];
  }
  // Kayan: init drift counter.
  for(const k in puzzle.tiles){
    if(puzzle.tiles[k].type==="kayan")puzzle.tiles[k].movesUntilShift=5;
  }
  return puzzle;
}

export function isTileRevealed(puzzle,r,c){
  const t=puzzle.tiles&&puzzle.tiles[r+","+c];
  return !t||t.revealed||t.type!=="sis";
}

export function revealTile(puzzle,r,c){
  const t=puzzle.tiles&&puzzle.tiles[r+","+c];
  if(t&&t.type==="sis"){t.revealed=true;return true;}
  return false;
}

/** Tick "Kayan" tiles — called after each edge toggle in puzzle. Returns true if any moved. */
export function tickKayanTiles(puzzle,rng){
  if(!puzzle.tiles)return false;
  let moved=false;
  const keys=Object.keys(puzzle.tiles);
  for(const k of keys){
    const t=puzzle.tiles[k];
    if(!t||t.type!=="kayan")continue;
    t.movesUntilShift=Math.max(0,(t.movesUntilShift||5)-1);
    if(t.movesUntilShift!==0)continue;
    const [r,c]=k.split(",").map(Number);
    // Find an empty neighbor cell (no other tile there).
    const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(([dr,dc])=>[r+dr,c+dc])
      .filter(([nr,nc])=>nr>=0&&nr<puzzle.R&&nc>=0&&nc<puzzle.C&&!puzzle.tiles[nr+","+nc]);
    if(opts.length){
      const [nr,nc]=opts[(rng()*opts.length)|0];
      delete puzzle.tiles[k];
      puzzle.tiles[nr+","+nc]={type:"kayan",movesUntilShift:5};
      // Keep clues truthful: vacated cell loses its clue; new cell shows its OWN
      // solution line-count. The drifting number therefore always matches the
      // real solution, so the puzzle stays solvable at every frozen state.
      puzzle.clue[r][c]=-1;
      puzzle.clue[nr][nc]=solLineCount(puzzle,nr,nc);
      moved=true;
    }else{
      t.movesUntilShift=5; // reset if no empty neighbor
    }
  }
  return moved;
}
