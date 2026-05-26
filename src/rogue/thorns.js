// src/rogue/thorns.js — Diken Sözleşmesi (Pact of Punishment)

export const THORNS=[
  {id:"daralma",name:"Daralma",desc:"Her floor süre limiti -10s/-20s/-30s",ranks:3,minRank:0,maxRank:3,
   apply:(run,rank)=>{run.thorns_daralma=rank*10;}},
  {id:"kor-pusula",name:"Kör Pusula",desc:"Branching map gösterilmez (sadece next 1 node)",ranks:1,minRank:0,maxRank:1,
   apply:(run,rank)=>{if(rank)run.thorns_korPusula=true;}},
  {id:"kirilgan-iplik",name:"Kırılgan İplik",desc:"Relic havuzundan 1/2 seçim çıkar",ranks:2,minRank:0,maxRank:2,
   apply:(run,rank)=>{run.thorns_kirilganIplik=rank;}},
  {id:"yankili-boss",name:"Yankılı Boss",desc:"Boss'ta constraint tile %50/%100 fazla",ranks:2,minRank:0,maxRank:2,
   apply:(run,rank)=>{run.thorns_yankiliBoss=rank*0.5;}},
  {id:"ciplak-baslangic",name:"Çıplak Başlangıç",desc:"Permanent starter slot bu koşuda boş",ranks:1,minRank:0,maxRank:1,
   apply:(run,rank)=>{if(rank)run.thorns_ciplak=true;}},
  {id:"siki-kontrol",name:"Sıkı Kontrol",desc:"Hata başına -1/-2/-3 can",ranks:3,minRank:0,maxRank:3,
   apply:(run,rank)=>{run.thorns_sikiKontrol=rank;}},
  {id:"sonuk-yildiz",name:"Sönük Yıldız",desc:"Hint kullanırsan boss güçlenir",ranks:1,minRank:0,maxRank:1,
   apply:(run,rank)=>{if(rank)run.thorns_sonukYildiz=true;}},
  {id:"tek-kapi",name:"Tek Kapı",desc:"Koşu sonu seçim opsiyonu yok",ranks:1,minRank:0,maxRank:1,
   apply:(run,rank)=>{if(rank)run.thorns_tekKapi=true;}},
  {id:"dolu-tabla",name:"Dolu Tabla",desc:"+1/+2 ekstra elite düğüm",ranks:2,minRank:0,maxRank:2,
   apply:(run,rank)=>{run.thorns_doluTabla=rank;}},
  {id:"cift-dugum",name:"Çift Düğüm",desc:"Boss çift / üçlü stage",ranks:2,minRank:0,maxRank:2,
   apply:(run,rank)=>{run.thorns_ciftDugum=rank;}},
];

export function getThorn(id){return THORNS.find(t=>t.id===id);}
export function totalIzScore(profile){
  if(!profile)return 0;
  let iz=0;
  for(const t of THORNS){
    iz+=(profile[t.id]||0);
  }
  return iz;
}

/** Apply all profile thorns to a run. */
export function applyThornsToRun(run,profile){
  if(!profile)return run;
  for(const t of THORNS){
    const rank=profile[t.id]||0;
    if(rank>0)t.apply(run,rank);
  }
  return run;
}

/** Reward multiplier from iz score. */
export function rewardMultiplier(iz){
  if(iz<=2)return 1.0;
  if(iz<=5)return 1.5;
  if(iz<=10)return 2.0;
  return 2.5;
}
