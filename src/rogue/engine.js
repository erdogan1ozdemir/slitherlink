// src/rogue/engine.js — Rogue run state machine

import {generateMap, nextAccessibleNodes} from "./map.js";

const DEFAULTS={
  lives:3,
  floors:5,
};

/**
 * Starts a new rogue run.
 */
export function startRun({realmId, seed, config={}}){
  const cfg={...DEFAULTS,...config};
  const map=generateMap(seed,{floors:cfg.floors,maxWidth:cfg.maxWidth||3,floorConfig:cfg.floorConfig});
  const startNode=map.nodes.find(n=>n.floor===0);
  return {
    realmId,
    seed,
    startedAt:Date.now(),
    floor:0,
    currentNodeId:startNode.id,
    lives:{current:cfg.lives,max:cfg.lives},
    relics:[],
    mapGraph:map,
    visited:[startNode.id],
    rngState:0,
    elapsedInRun:0,
    midPuzzle:null,
    ended:false,
    endReason:null,
  };
}

/**
 * Move to a node (must be in accessible set).
 */
export function moveTo(run, nodeId){
  const accessible=nextAccessibleNodes(run.mapGraph,run.currentNodeId);
  if(!accessible.includes(nodeId))throw new Error("Node not accessible: "+nodeId);
  const node=run.mapGraph.nodes.find(n=>n.id===nodeId);
  run.currentNodeId=nodeId;
  run.floor=node.floor;
  run.visited.push(nodeId);
  run.midPuzzle=null;
  return run;
}

/**
 * Apply a hit (lose 1 life). Returns updated run; sets ended if lives=0.
 */
export function loseLife(run){
  run.lives.current=Math.max(0,run.lives.current-1);
  if(run.lives.current===0){
    run.ended=true;
    run.endReason="no-lives";
  }
  return run;
}

/**
 * Mark run as won (boss defeated).
 */
export function winRun(run){
  run.ended=true;
  run.endReason="cleared";
  return run;
}

/**
 * Get current node object.
 */
export function currentNode(run){
  return run.mapGraph.nodes.find(n=>n.id===run.currentNodeId);
}
