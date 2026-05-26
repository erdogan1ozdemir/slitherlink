// src/core/checker.js — Slitherlink win-condition validators (pure)

export function lineCount(hState,vState,r,c){
  return (hState[r][c]===1)+(hState[r+1][c]===1)+(vState[r][c]===1)+(vState[r][c+1]===1);
}

export function decided(hState,vState,r,c){
  return [hState[r][c],hState[r+1][c],vState[r][c],vState[r][c+1]].every(s=>s!==0);
}

/**
 * Returns true if hState/vState forms a single closed loop satisfying all clues.
 */
export function validateLoop(puzzle,hState,vState){
  const R=puzzle.R,C=puzzle.C;
  for(let r=0;r<R;r++)for(let c=0;c<C;c++){
    if(puzzle.clue[r][c]<0)continue;
    if(lineCount(hState,vState,r,c)!==puzzle.clue[r][c])return false;
  }
  const deg=Array.from({length:R+1},()=>Array(C+1).fill(0));
  let edges=0;
  for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(hState[r][c]===1){deg[r][c]++;deg[r][c+1]++;edges++;}
  for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(vState[r][c]===1){deg[r][c]++;deg[r+1][c]++;edges++;}
  if(!edges)return false;
  for(let r=0;r<=R;r++)for(let c=0;c<=C;c++)if(deg[r][c]!==0&&deg[r][c]!==2)return false;
  let s=null,td2=0;
  for(let r=0;r<=R;r++)for(let c=0;c<=C;c++)if(deg[r][c]===2){td2++;if(!s)s=[r,c];}
  const seen=Array.from({length:R+1},()=>Array(C+1).fill(false));
  const st=[s];seen[s[0]][s[1]]=true;let v=0;
  while(st.length){
    const[r,c]=st.pop();v++;
    if(c<C&&hState[r][c]===1&&!seen[r][c+1]){seen[r][c+1]=true;st.push([r,c+1]);}
    if(c>0&&hState[r][c-1]===1&&!seen[r][c-1]){seen[r][c-1]=true;st.push([r,c-1]);}
    if(r<R&&vState[r][c]===1&&!seen[r+1][c]){seen[r+1][c]=true;st.push([r+1,c]);}
    if(r>0&&vState[r-1][c]===1&&!seen[r-1][c]){seen[r-1][c]=true;st.push([r-1,c]);}
  }
  return v===td2;
}
