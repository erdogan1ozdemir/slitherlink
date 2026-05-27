// src/core/solver.js — Minimal Slitherlink solver for uniqueness check

/**
 * Counts the number of solutions for a puzzle, up to maxSolutions.
 * Returns the count. Used to verify uniqueness during generation.
 *
 * Uses constraint propagation + backtracking with timeout.
 *
 * @param {object} puzzle — {R, C, clue}
 * @param {number} maxSolutions — stop search after this many found
 * @param {number} timeoutMs — max wall-clock time
 * @returns {number} solution count (capped at maxSolutions)
 */
export function countSolutions(puzzle, maxSolutions=2, timeoutMs=2000){
  const R=puzzle.R, C=puzzle.C;
  const start=Date.now();
  let found=0;

  const hState=Array.from({length:R+1},()=>Array(C).fill(0));
  const vState=Array.from({length:R},()=>Array(C+1).fill(0));

  function lineCount(r,c){
    return (hState[r][c]===1)+(hState[r+1][c]===1)+(vState[r][c]===1)+(vState[r][c+1]===1);
  }
  function crossCount(r,c){
    return (hState[r][c]===2)+(hState[r+1][c]===2)+(vState[r][c]===2)+(vState[r][c+1]===2);
  }

  function checkClueConstraints(){
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      const clue=puzzle.clue[r][c];
      if(clue<0)continue;
      const lines=lineCount(r,c);
      const crosses=crossCount(r,c);
      if(lines>clue)return false;
      if(4-crosses<clue)return false;
    }
    return true;
  }

  function checkVertexConstraints(){
    for(let r=0;r<=R;r++)for(let c=0;c<=C;c++){
      let deg=0;
      if(c>0&&hState[r][c-1]===1)deg++;
      if(c<C&&hState[r][c]===1)deg++;
      if(r>0&&vState[r-1][c]===1)deg++;
      if(r<R&&vState[r][c]===1)deg++;
      if(deg>2)return false;
    }
    return true;
  }

  function isComplete(){
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(hState[r][c]===0)return false;
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(vState[r][c]===0)return false;
    return true;
  }

  function isValidLoop(){
    // Validate single closed loop
    const deg=Array.from({length:R+1},()=>Array(C+1).fill(0));
    let edges=0;
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(hState[r][c]===1){deg[r][c]++;deg[r][c+1]++;edges++;}
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(vState[r][c]===1){deg[r][c]++;deg[r+1][c]++;edges++;}
    if(!edges)return false;
    for(let r=0;r<=R;r++)for(let c=0;c<=C;c++)if(deg[r][c]!==0&&deg[r][c]!==2)return false;
    let start=null;
    for(let r=0;r<=R&&!start;r++)for(let c=0;c<=C&&!start;c++)if(deg[r][c]===2)start=[r,c];
    if(!start)return false;
    let count2=0;
    for(let r=0;r<=R;r++)for(let c=0;c<=C;c++)if(deg[r][c]===2)count2++;
    const seen=Array.from({length:R+1},()=>Array(C+1).fill(false));
    const stack=[start];seen[start[0]][start[1]]=true;let visited=0;
    while(stack.length){
      const [r,c]=stack.pop();visited++;
      if(c<C&&hState[r][c]===1&&!seen[r][c+1]){seen[r][c+1]=true;stack.push([r,c+1]);}
      if(c>0&&hState[r][c-1]===1&&!seen[r][c-1]){seen[r][c-1]=true;stack.push([r,c-1]);}
      if(r<R&&vState[r][c]===1&&!seen[r+1][c]){seen[r+1][c]=true;stack.push([r+1,c]);}
      if(r>0&&vState[r-1][c]===1&&!seen[r-1][c]){seen[r-1][c]=true;stack.push([r-1,c]);}
    }
    return visited===count2;
  }

  function findNextEdge(){
    // Most-constrained heuristic: edge near most-constrained clue
    let best=null,bestScore=-1;
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      const clue=puzzle.clue[r][c];
      if(clue<0)continue;
      const lines=lineCount(r,c);
      const crosses=crossCount(r,c);
      const decided=lines+crosses;
      if(decided===4)continue;
      const score=clue===0||clue===3?3:(clue===1||clue===2?2:1);
      if(score>bestScore){
        // Find an undecided edge
        if(hState[r][c]===0)return ["h",r,c,best=[r,c],bestScore=score][0]&&{k:"h",r,c};
        if(hState[r+1][c]===0)return {k:"h",r:r+1,c};
        if(vState[r][c]===0)return {k:"v",r,c};
        if(vState[r][c+1]===0)return {k:"v",r,c:c+1};
      }
    }
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(hState[r][c]===0)return {k:"h",r,c};
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(vState[r][c]===0)return {k:"v",r,c};
    return null;
  }

  function backtrack(){
    if(found>=maxSolutions)return;
    if(Date.now()-start>timeoutMs){found=maxSolutions;return;} // timeout = assume not unique
    if(!checkClueConstraints())return;
    if(!checkVertexConstraints())return;
    if(isComplete()){
      // Full check including loop validity
      for(let r=0;r<R;r++)for(let c=0;c<C;c++){
        if(puzzle.clue[r][c]<0)continue;
        if(lineCount(r,c)!==puzzle.clue[r][c])return;
      }
      if(isValidLoop())found++;
      return;
    }
    const e=findNextEdge();
    if(!e)return;
    const arr=e.k==="h"?hState:vState;
    arr[e.r][e.c]=1;backtrack();
    if(found>=maxSolutions)return;
    arr[e.r][e.c]=2;backtrack();
    arr[e.r][e.c]=0;
  }

  backtrack();
  return found;
}
