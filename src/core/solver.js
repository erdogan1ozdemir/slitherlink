// src/core/solver.js — Propagating Slitherlink solver for uniqueness checking

/**
 * Counts solutions up to maxSolutions. Uses constraint propagation to fixpoint
 * before branching, with trail-based undo. Timeout → returns maxSolutions
 * (conservative: "assume not unique").
 *
 * Edge encoding: 0=unknown, 1=line, 2=cross.
 *   h[r][c]: r in 0..R, c in 0..C-1
 *   v[r][c]: r in 0..R-1, c in 0..C
 */
export function countSolutions(puzzle, maxSolutions=2, timeoutMs=2000){
  const R=puzzle.R, C=puzzle.C, clue=puzzle.clue;
  const deadline=Date.now()+timeoutMs;
  let found=0, timedOut=false;

  const h=Array.from({length:R+1},()=>Array(C).fill(0));
  const v=Array.from({length:R},()=>Array(C+1).fill(0));
  const trail=[];

  function cellLines(r,c){return (h[r][c]===1)+(h[r+1][c]===1)+(v[r][c]===1)+(v[r][c+1]===1);}
  function cellCross(r,c){return (h[r][c]===2)+(h[r+1][c]===2)+(v[r][c]===2)+(v[r][c+1]===2);}
  function vDeg(r,c){
    let d=0;
    if(c>0&&h[r][c-1]===1)d++;
    if(c<C&&h[r][c]===1)d++;
    if(r>0&&v[r-1][c]===1)d++;
    if(r<R&&v[r][c]===1)d++;
    return d;
  }
  function vUnknown(r,c){
    let u=0;
    if(c>0&&h[r][c-1]===0)u++;
    if(c<C&&h[r][c]===0)u++;
    if(r>0&&v[r-1][c]===0)u++;
    if(r<R&&v[r][c]===0)u++;
    return u;
  }
  function mark(){return trail.length;}
  function undo(to){while(trail.length>to){const[k,r,c]=trail.pop();(k==="h"?h:v)[r][c]=0;}}
  function setCellUnknowns(r,c,val){
    let any=false;
    if(h[r][c]===0){h[r][c]=val;trail.push(["h",r,c]);any=true;}
    if(h[r+1][c]===0){h[r+1][c]=val;trail.push(["h",r+1,c]);any=true;}
    if(v[r][c]===0){v[r][c]=val;trail.push(["v",r,c]);any=true;}
    if(v[r][c+1]===0){v[r][c+1]=val;trail.push(["v",r,c+1]);any=true;}
    return any;
  }
  function setVertexUnknowns(r,c,val){
    let any=false;
    if(c>0&&h[r][c-1]===0){h[r][c-1]=val;trail.push(["h",r,c-1]);any=true;}
    if(c<C&&h[r][c]===0){h[r][c]=val;trail.push(["h",r,c]);any=true;}
    if(r>0&&v[r-1][c]===0){v[r-1][c]=val;trail.push(["v",r-1,c]);any=true;}
    if(r<R&&v[r][c]===0){v[r][c]=val;trail.push(["v",r,c]);any=true;}
    return any;
  }

  function propagate(){
    let changed=true;
    while(changed){
      changed=false;
      if(Date.now()>deadline){timedOut=true;return false;}
      // Cell rules
      for(let r=0;r<R;r++)for(let c=0;c<C;c++){
        const cl=clue[r][c]; if(cl<0)continue;
        const ln=cellLines(r,c), cr=cellCross(r,c), unk=4-ln-cr;
        if(ln>cl)return false;
        if(ln+unk<cl)return false;
        if(unk===0)continue;
        if(ln===cl){ if(setCellUnknowns(r,c,2))changed=true; }
        else if(ln+unk===cl){ if(setCellUnknowns(r,c,1))changed=true; }
      }
      // Vertex rules
      for(let r=0;r<=R;r++)for(let c=0;c<=C;c++){
        const d=vDeg(r,c), u=vUnknown(r,c);
        if(d>2)return false;
        if(d===2&&u>0){ if(setVertexUnknowns(r,c,2))changed=true; }
        else if(d===1&&u===0)return false;
        else if(d===1&&u===1){ if(setVertexUnknowns(r,c,1))changed=true; }
        else if(d===0&&u===1){ if(setVertexUnknowns(r,c,2))changed=true; }
      }
    }
    return true;
  }

  function pickEdge(){
    let best=null,bestU=99;
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      if(clue[r][c]<0)continue;
      const ln=cellLines(r,c),cr=cellCross(r,c),unk=4-ln-cr;
      if(unk===0)continue;
      if(unk<bestU){
        bestU=unk;
        if(h[r][c]===0)best=["h",r,c];
        else if(h[r+1][c]===0)best=["h",r+1,c];
        else if(v[r][c]===0)best=["v",r,c];
        else if(v[r][c+1]===0)best=["v",r,c+1];
      }
    }
    if(best)return best;
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(h[r][c]===0)return ["h",r,c];
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(v[r][c]===0)return ["v",r,c];
    return null;
  }

  function isComplete(){
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(h[r][c]===0)return false;
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(v[r][c]===0)return false;
    return true;
  }

  function validLoop(){
    const deg=Array.from({length:R+1},()=>Array(C+1).fill(0));
    let edges=0;
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)if(h[r][c]===1){deg[r][c]++;deg[r][c+1]++;edges++;}
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)if(v[r][c]===1){deg[r][c]++;deg[r+1][c]++;edges++;}
    if(!edges)return false;
    let start=null,count2=0;
    for(let r=0;r<=R;r++)for(let c=0;c<=C;c++){
      if(deg[r][c]!==0&&deg[r][c]!==2)return false;
      if(deg[r][c]===2){count2++;if(!start)start=[r,c];}
    }
    if(!start)return false;
    const seen=Array.from({length:R+1},()=>Array(C+1).fill(false));
    const st=[start];seen[start[0]][start[1]]=true;let vis=0;
    while(st.length){
      const[r,c]=st.pop();vis++;
      if(c<C&&h[r][c]===1&&!seen[r][c+1]){seen[r][c+1]=true;st.push([r,c+1]);}
      if(c>0&&h[r][c-1]===1&&!seen[r][c-1]){seen[r][c-1]=true;st.push([r,c-1]);}
      if(r<R&&v[r][c]===1&&!seen[r+1][c]){seen[r+1][c]=true;st.push([r+1,c]);}
      if(r>0&&v[r-1][c]===1&&!seen[r-1][c]){seen[r-1][c]=true;st.push([r-1,c]);}
    }
    return vis===count2;
  }

  function search(){
    if(found>=maxSolutions||timedOut)return;
    if(Date.now()>deadline){timedOut=true;return;}
    const m=mark();
    if(!propagate()){undo(m);return;}
    if(isComplete()){
      if(validLoop())found++;
      undo(m);return;
    }
    const e=pickEdge();
    if(!e){undo(m);return;}
    const[k,r,c]=e;
    const mb=mark();
    (k==="h"?h:v)[r][c]=1;trail.push([k,r,c]);
    search();
    undo(mb);
    if(found<maxSolutions&&!timedOut){
      (k==="h"?h:v)[r][c]=2;trail.push([k,r,c]);
      search();
      undo(mb);
    }
    undo(m);
  }

  search();
  return timedOut?maxSolutions:found;
}
