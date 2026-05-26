// src/rogue/tiles.js — Constraint tiles. v1: Sis (hidden clue).

export const TILE_TYPES={
  "sis":{
    id:"sis",
    name:"Sis Hücresi",
    desc:"Sayı gizli — dokun, 3 saniye reveal.",
    realms:["karanlik-igne","yildiz-gecidi"],
  },
};

/**
 * Apply constraint tiles to a puzzle. Mutates puzzle by adding `tiles` map.
 * tiles: { "r,c": { type: "sis", revealed: false } }
 * @param {object} puzzle
 * @param {string} realmId
 * @param {function} rng
 * @returns {object} same puzzle with `.tiles` added
 */
export function applyTiles(puzzle,realmId,rng,density=0.2){
  if(!puzzle.tiles)puzzle.tiles={};
  if(realmId==="karanlik-igne"||realmId==="yildiz-gecidi"){
    for(let r=0;r<puzzle.R;r++)for(let c=0;c<puzzle.C;c++){
      if(puzzle.clue[r][c]<0)continue;
      if(rng()<density){
        puzzle.tiles[r+","+c]={type:"sis",revealed:false};
      }
    }
  }
  return puzzle;
}

export function isTileRevealed(puzzle,r,c){
  const t=puzzle.tiles&&puzzle.tiles[r+","+c];
  return !t||t.revealed;
}

export function revealTile(puzzle,r,c){
  if(puzzle.tiles&&puzzle.tiles[r+","+c]){
    puzzle.tiles[r+","+c].revealed=true;
    return true;
  }
  return false;
}
