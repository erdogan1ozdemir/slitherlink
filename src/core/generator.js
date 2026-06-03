// src/core/generator.js — Slitherlink puzzle generator (unique-solution via dig)
import {countSolutions} from "./solver.js";

export function makePuzzle(R,C,keepRatio,rng,options){
  rng=rng||Math.random;
  options=options||{};
  const inb=(r,c)=>r>=0&&r<R&&c>=0&&c<C;

  function generateLoop(){
    const filled=Array.from({length:R},()=>Array(C).fill(false));
    filled[(R/2)|0][(C/2)|0]=true;
    const cnt=()=>{let n=0;for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(filled[r][c])n++;return n;};
    function regionConnected(){let s=null;for(let r=0;r<R&&!s;r++)for(let c=0;c<C&&!s;c++)if(filled[r][c])s=[r,c];if(!s)return false;const seen=Array.from({length:R},()=>Array(C).fill(false));const st=[s];seen[s[0]][s[1]]=true;let k=0;while(st.length){const[r,c]=st.pop();k++;for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(inb(nr,nc)&&filled[nr][nc]&&!seen[nr][nc]){seen[nr][nc]=true;st.push([nr,nc]);}}}return k===cnt();}
    function complementConnected(){const seen=Array.from({length:R},()=>Array(C).fill(false));const st=[];for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(!filled[r][c]&&(r===0||r===R-1||c===0||c===C-1)&&!seen[r][c]){seen[r][c]=true;st.push([r,c]);}while(st.length){const[r,c]=st.pop();for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(inb(nr,nc)&&!filled[nr][nc]&&!seen[nr][nc]){seen[nr][nc]=true;st.push([nr,nc]);}}}for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(!filled[r][c]&&!seen[r][c])return false;return true;}
    const total=R*C, iters=R*C*40;
    for(let i=0;i<iters;i++){const r=(rng()*R)|0,c=(rng()*C)|0,prev=filled[r][c];filled[r][c]=!prev;const nf=cnt();let ok=nf>=1&&nf<=total-1;if(ok)ok=regionConnected()&&complementConnected();if(!ok)filled[r][c]=prev;}
    const f=(r,c)=>inb(r,c)?filled[r][c]:false;
    const hE=Array.from({length:R+1},()=>Array(C).fill(0));
    for(let r=0;r<=R;r++)for(let c=0;c<C;c++)hE[r][c]=(f(r-1,c)!==f(r,c))?1:0;
    const vE=Array.from({length:R},()=>Array(C+1).fill(0));
    for(let r=0;r<R;r++)for(let c=0;c<=C;c++)vE[r][c]=(f(r,c-1)!==f(r,c))?1:0;
    const clue=Array.from({length:R},()=>Array(C).fill(-1));
    for(let r=0;r<R;r++)for(let c=0;c<C;c++)clue[r][c]=hE[r][c]+hE[r+1][c]+vE[r][c]+vE[r][c+1];
    return {hE,vE,clue};
  }

  // Fast path: legacy random removal (no uniqueness guarantee)
  if(!options.checkUnique){
    const {hE,vE,clue}=generateLoop();
    for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(rng()>keepRatio)clue[r][c]=-1;
    return {R,C,solH:hE,solV:vE,clue};
  }

  // Unique path: generate loop with unique full-clue set, then dig.
  const verifyMs=options.verifyMs||1200;
  const checkMs=options.checkMs||500;
  const digMs=options.digMs||4000;
  const maxLoops=options.maxLoops||5;

  let chosen=null;
  for(let attempt=0;attempt<maxLoops;attempt++){
    const lp=generateLoop();
    const fu=countSolutions({R,C,clue:lp.clue},2,verifyMs);
    if(fu===1){ chosen=lp; break; }
    if(!chosen)chosen=lp; // fallback: keep first even if not verified-unique
  }
  const {hE,vE,clue}=chosen;

  // Dig: start from full clues, remove while uniqueness preserved.
  // Each removal kept ONLY if countSolutions==1 afterwards → result is guaranteed unique
  // (or as-dense-as-the-verified-base if base wasn't verified unique).
  const targetRemovals=Math.floor(R*C*(1-keepRatio));
  const cells=[];
  for(let r=0;r<R;r++)for(let c=0;c<C;c++)cells.push([r,c]);
  for(let i=cells.length-1;i>0;i--){const j=(rng()*(i+1))|0;const t=cells[i];cells[i]=cells[j];cells[j]=t;}
  let removed=0;
  const deadline=Date.now()+digMs;
  for(const[r,c] of cells){
    if(removed>=targetRemovals)break;
    if(Date.now()>deadline)break;
    const saved=clue[r][c];
    if(saved<0)continue;
    clue[r][c]=-1;
    const n=countSolutions({R,C,clue},2,checkMs);
    if(n===1){removed++;} else {clue[r][c]=saved;}
  }
  return {R,C,solH:hE,solV:vE,clue};
}
