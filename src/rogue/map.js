// src/rogue/map.js — Branching map generator for rogue runs

import {mulberry32} from "../core/rng.js";

/**
 * Generates a branching map for a rogue run.
 * Structure: F floors, each floor has 1-3 nodes. Last floor = boss (single node).
 * Edges: each node connects to 1-2 nodes on the next floor (nearest by column).
 *
 * @param {string} seed — string for hashSeed
 * @param {object} config — {floors:5, maxWidth:3, nodeTypes:['puzzle','elite','chest','rest','event']}
 * @returns {object} { nodes: [{id, floor, col, type}], edges: [[fromId, toId]] }
 */
export function generateMap(seed, config={}){
  const F=config.floors||5;
  const W=config.maxWidth||3;
  const types=config.nodeTypes||["puzzle","puzzle","elite","chest","rest","event"];
  // Hash seed → rng
  let h=2166136261>>>0;
  for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}
  const rng=mulberry32(h>>>0);

  const nodes=[];
  const idOf=(f,c)=>`${f}-${c}`;
  for(let f=0;f<F;f++){
    if(f===F-1){
      // Boss floor — single node at center
      nodes.push({id:idOf(f,Math.floor(W/2)),floor:f,col:Math.floor(W/2),type:"boss"});
    }else if(f===0){
      // Start — single node
      nodes.push({id:idOf(0,Math.floor(W/2)),floor:0,col:Math.floor(W/2),type:"puzzle"});
    }else{
      // Middle floor — 2-3 nodes
      const width=2+(rng()<0.5?1:0);
      const cols=[];
      if(width===2){cols.push(0,W-1);}
      else{cols.push(0,Math.floor(W/2),W-1);}
      for(const c of cols){
        const t=types[(rng()*types.length)|0];
        nodes.push({id:idOf(f,c),floor:f,col:c,type:t});
      }
    }
  }

  // Edges: each non-last node connects to 1-2 nearest next-floor nodes
  const edges=[];
  for(let f=0;f<F-1;f++){
    const cur=nodes.filter(n=>n.floor===f);
    const nxt=nodes.filter(n=>n.floor===f+1);
    for(const c of cur){
      const sorted=nxt.slice().sort((a,b)=>Math.abs(a.col-c.col)-Math.abs(b.col-c.col));
      edges.push([c.id,sorted[0].id]);
      if(sorted.length>1&&rng()>0.4){
        edges.push([c.id,sorted[1].id]);
      }
    }
  }

  return {nodes,edges,floors:F,maxWidth:W};
}

/**
 * Returns the list of nodes reachable from a given visited path.
 */
export function nextAccessibleNodes(map, currentNodeId){
  return map.edges.filter(([from])=>from===currentNodeId).map(([_,to])=>to);
}
