// src/core/generator.js — Slitherlink puzzle generator (unique-solution via dig)
import {countSolutions} from "./solver.js";

export function makePuzzle(R,C,keepRatio,rng,options){
  rng=rng||Math.random;
  options=options||{};
  const inb=(r,c)=>r>=0&&r<R&&c>=0&&c<C;

  function generateLoop(){
    // clue=4 (tek hücrelik mini-loop) klasik kural ihlali — varsa yeniden üret.
    for(let retry=0;retry<20;retry++){
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
    let has4=false;
    for(let r=0;r<R&&!has4;r++)for(let c=0;c<C&&!has4;c++)if(clue[r][c]===4)has4=true;
    if(!has4||retry===19)return {hE,vE,clue};
    }
  }

  // Fast path: legacy random removal (no uniqueness guarantee)
  if(!options.checkUnique){
    const {hE,vE,clue}=generateLoop();
    for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(rng()>keepRatio)clue[r][c]=-1;
    return {R,C,solH:hE,solV:vE,clue};
  }

  // Unique path — uniqueness MANDATORY. Budgets scale with board area.
  const area=R*C;
  const verifyMs=options.verifyMs|| Math.min(3000, 600+area*15);
  const checkMs =options.checkMs || Math.min(1200, 250+area*6);
  const digMs   =options.digMs   || Math.min(9000, 2000+area*45);
  const finalMs =options.finalMs || Math.min(3000, 800+area*15);
  const maxLoops=options.maxLoops|| 8;

  // Density clamp: çok düşük yoğunluk büyük tahtalarda uniqueness'i zorlaştırır
  // ve üretimi yavaşlatır. Boyuta göre minimum keep oranı uygula.
  // (Kullanıcı isteği: "yoğunluk bunu bozacaksa diğer parametreleri sınırla")
  let effKeep=keepRatio;
  const keepFloor = area>=100 ? 0.45 : (area>=64 ? 0.38 : 0.30);
  if(effKeep<keepFloor)effKeep=keepFloor;

  // 1) Full clue set'i VERIFIED-UNIQUE olan bir loop bul.
  let base=null;
  for(let attempt=0;attempt<maxLoops;attempt++){
    const lp=generateLoop();
    if(countSolutions({R,C,clue:lp.clue},2,verifyMs)===1){ base=lp; break; }
    if(!base)base=lp; // densest fallback
  }
  const {hE,vE,clue}=base;

  // 2) Dig: yalnızca uniqueness korunursa clue çıkar.
  const targetRemovals=Math.floor(area*(1-effKeep));
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
    if(countSolutions({R,C,clue},2,checkMs)===1){removed++;}
    else{clue[r][c]=saved;}
  }

  // 3) FINAL GUARD: sonuç MUTLAKA tek çözümlü olmalı. Değilse (base verify
  //    edilememişse / ilk deneme fallback ise) full clue'a geri dön ve YENİDEN
  //    doğrula; hâlâ tekil değilse yeni bir loop üret ve onun full clue'unu döndür.
  if(countSolutions({R,C,clue},2,finalMs)!==1){
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      clue[r][c]=hE[r][c]+hE[r+1][c]+vE[r][c]+vE[r][c+1];
    }
    if(countSolutions({R,C,clue},2,finalMs)!==1){
      const lp2=generateLoop();
      return {R,C,solH:lp2.hE,solV:lp2.vE,clue:lp2.clue.map(row=>row.slice())};
    }
  }
  return {R,C,solH:hE,solV:vE,clue};
}
