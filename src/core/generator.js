// src/core/generator.js — Slitherlink puzzle generator (single-loop guaranteed)
import {countSolutions} from "./solver.js";

export function makePuzzle(R,C,keepRatio,rng,options){
  rng=rng||Math.random;
  const filled=Array.from({length:R},()=>Array(C).fill(false));
  filled[(R/2)|0][(C/2)|0]=true;
  const inb=(r,c)=>r>=0&&r<R&&c>=0&&c<C;
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
  for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(rng()>keepRatio)clue[r][c]=-1;
  // Uniqueness check: birden fazla çözüm varsa geri clue ekle.
  // Solver timeout'a düşerse "çoklu çözüm" değil "karar verilemedi" demektir —
  // bu durumda clue eklemek de aynı şekilde timeout'a düşer (boşuna ~timeout×attempts
  // donma). O yüzden her çağrının süresini ölçüp, timeout algılanınca döngüyü
  // hemen durduruyoruz (bulmaca olduğu gibi kabul edilir — kabul edilebilir degradasyon).
  if(options&&options.checkUnique){
    const uniqTimeout=options.uniqueTimeoutMs||1200;
    const maxAttempts=options.uniqueAttempts!=null?options.uniqueAttempts:3;
    const ran=fn=>{const t=Date.now();const v=fn();return [v,Date.now()-t>=uniqTimeout*0.9];};
    let attempts=0;
    let [solCount,timedOut]=ran(()=>countSolutions({R,C,clue},2,uniqTimeout));
    while(!timedOut&&solCount>1&&attempts<maxAttempts){
      const candidates=[];
      for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(clue[r][c]<0)candidates.push([r,c]);
      if(!candidates.length)break;
      const[ar,ac]=candidates[(rng()*candidates.length)|0];
      clue[ar][ac]=hE[ar][ac]+hE[ar+1][ac]+vE[ar][ac]+vE[ar][ac+1];
      attempts++;
      [solCount,timedOut]=ran(()=>countSolutions({R,C,clue},2,uniqTimeout));
    }
  }
  return {R,C,solH:hE,solV:vE,clue};
}
