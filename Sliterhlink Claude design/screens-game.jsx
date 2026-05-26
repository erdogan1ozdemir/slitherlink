// Oyun ekranı — birden çok durum
const { T:T3, Kicker:K3, Display:D3, StatusBar:SB3, Phone:Ph3, Board:Board3 } = window.SI;

// Örnek küçük bulmaca verileri — gerçekçi görünmesi için elden yazılmış
// 5×5
const PUZZLE_5 = {
  R: 5, C: 5,
  clues: [
    [-1, 3, -1,-1, 2],
    [ 2,-1,-1, 3,-1],
    [-1,-1, 1,-1,-1],
    [-1, 2,-1,-1, 3],
    [ 3,-1,-1, 2,-1],
  ],
};
// 7×7
const PUZZLE_7 = {
  R: 7, C: 7,
  clues: [
    [-1, 2,-1, 3,-1, 2,-1],
    [ 3,-1, 2,-1, 2,-1, 1],
    [-1, 1,-1,-1,-1, 3,-1],
    [ 2,-1, 2,-1, 1,-1, 2],
    [-1, 3,-1,-1,-1, 2,-1],
    [ 1,-1, 2,-1, 3,-1, 3],
    [-1, 2,-1, 3,-1, 2,-1],
  ],
};
// 12×12 (sparse — uzman görünümü)
const PUZZLE_12 = (() => {
  const R=12,C=12;
  const clues = Array.from({length:R},()=>Array(C).fill(-1));
  const fill = [
    [0,1,2],[0,4,3],[0,7,1],[0,10,2],
    [1,2,3],[1,5,2],[1,9,3],
    [2,0,2],[2,6,1],[2,11,3],
    [3,3,2],[3,7,3],[3,10,1],
    [4,1,3],[4,5,1],[4,8,2],
    [5,4,2],[5,7,2],[5,11,2],
    [6,0,3],[6,3,2],[6,9,1],
    [7,1,2],[7,6,2],[7,10,3],
    [8,2,1],[8,5,3],[8,8,2],
    [9,4,3],[9,7,1],[9,11,2],
    [10,1,2],[10,9,3],
    [11,2,2],[11,5,1],[11,8,2],[11,11,3],
  ];
  fill.forEach(([r,c,n])=>{ clues[r][c]=n; });
  return { R, C, clues };
})();

const empty = (R,C) => ({
  h: Array.from({length:R+1},()=>Array(C).fill(0)),
  v: Array.from({length:R},()=>Array(C+1).fill(0)),
});

// 5×5 için "yeni başlamış" tahta — birkaç çizgi
const EDGES_5_EARLY = (() => {
  const e = empty(5,5);
  // küçük başlangıç
  e.v[0][0]=1; e.v[1][0]=1;
  e.h[2][0]=1;
  e.v[2][1]=2; // bir çarpı
  e.h[0][1]=1; e.v[0][2]=1;
  return e;
})();

// 7×7 için "orta oyun" — belirgin bir yol başlamış, bir hata var
const EDGES_7_MID = (() => {
  const e = empty(7,7);
  // bir yol çizgisi (yaklaşık üst-sol köşede bir kıvrım)
  const H = [[0,1],[0,2],[0,3],[1,4],[2,4],[2,5],[3,5],[3,6]];
  const V = [[0,1],[1,1],[1,5],[2,5],[3,6],[3,7]];
  H.forEach(([r,c])=>{ e.h[r][c]=1; });
  V.forEach(([r,c])=>{ e.v[r][c]=1; });
  // çarpılar (negative space işaretleri)
  e.v[0][3]=2; e.h[1][2]=2; e.v[3][2]=2;
  return e;
})();

// 7×7 için "kazanma" — küçük bir kapalı döngü görseli
const EDGES_7_NEAR_WIN = (() => {
  const e = empty(7,7);
  // tek bir kapalı şekil
  const H=[[0,1],[0,2],[0,3],[0,4],[3,1],[3,2],[3,3],[3,4]];
  const V=[[0,1],[1,1],[2,1],[0,5],[1,5],[2,5]];
  H.forEach(([r,c])=>{e.h[r][c]=1;});
  V.forEach(([r,c])=>{e.v[r][c]=1;});
  return e;
})();

// 12×12 için seyrek bir oyun durumu
const EDGES_12 = (() => {
  const e = empty(12,12);
  for (let i=0;i<4;i++) e.h[0][i+2]=1;
  e.v[0][2]=1; e.v[1][2]=1; e.h[2][2]=1; e.h[2][3]=1;
  e.v[2][4]=1; e.v[3][4]=1; e.h[4][3]=1; e.h[4][4]=1;
  for(let r=5;r<9;r++) e.v[r][8]=1;
  for(let c=3;c<8;c++) e.h[9][c]=1;
  // çarpılar
  e.v[5][3]=2; e.h[6][6]=2; e.v[7][2]=2;
  return e;
})();

function GameChrome({ kicker, title, hudTime='02:14', hudHints='1', settingsBtn=true, backLabel='‹' }) {
  return (
    <>
      <div style={{display:'flex', alignItems:'center', gap:12, padding:'10px 20px 4px', minHeight:48}}>
        <button style={{
          width:38, height:38, borderRadius:11, background:T3.panel,
          border:`1px solid ${T3.hairline}`, color:T3.ink, fontSize:18,
        }}>{backLabel}</button>
        <div style={{flex:1, minWidth:0, textAlign:'center'}}>
          <K3 size={9}>{kicker}</K3>
          <div style={{fontFamily:T3.fSerif, fontWeight:600, fontSize:16, color:T3.ink, marginTop:1}}>{title}</div>
        </div>
        {settingsBtn ? (
          <button style={{
            width:38, height:38, borderRadius:11, background:T3.panel,
            border:`1px solid ${T3.hairline}`, color:T3.ink, fontSize:15,
          }}>⚙</button>
        ) : <div style={{width:38}}/>}
      </div>
      {/* HUD */}
      <div style={{display:'flex', justifyContent:'center', gap:8, padding:'6px 16px 4px'}}>
        <div style={{
          background:T3.panel, border:`1px solid ${T3.hairline}`, borderRadius:99,
          padding:'6px 14px', display:'flex', gap:8, alignItems:'center',
        }}>
          <span style={{fontFamily:T3.fMono, fontSize:9, color:T3.muted, letterSpacing:'.2em'}}>SÜRE</span>
          <span style={{fontFamily:T3.fMono, fontSize:13, color:T3.ink, fontWeight:700}}>{hudTime}</span>
        </div>
        <div style={{
          background:T3.panel, border:`1px solid ${T3.hairline}`, borderRadius:99,
          padding:'6px 14px', display:'flex', gap:8, alignItems:'center',
        }}>
          <span style={{fontFamily:T3.fMono, fontSize:9, color:T3.muted, letterSpacing:'.2em'}}>İPUCU</span>
          <span style={{fontFamily:T3.fMono, fontSize:13, color:T3.ink, fontWeight:700}}>{hudHints}</span>
        </div>
      </div>
    </>
  );
}

function GameFooter({ hint = true }) {
  return (
    <div style={{
      position:'absolute', bottom: 30, left: 0, right: 0,
      padding:'0 20px', display:'flex', gap:10, justifyContent:'center',
    }}>
      <button style={{
        flex:1, maxWidth:140, padding:'13px', borderRadius:13,
        background:T3.panel, color:T3.ink, border:`1px solid ${T3.hairline}`,
        fontFamily:T3.fBody, fontWeight:700, fontSize:13.5,
      }}>↺ Temizle</button>
      {hint && (
        <button style={{
          flex:1, maxWidth:140, padding:'13px', borderRadius:13,
          background:T3.panel, color:T3.ink, border:`1px solid ${T3.hairline}`,
          fontFamily:T3.fBody, fontWeight:700, fontSize:13.5,
        }}>◌ İpucu</button>
      )}
      <button style={{
        flex:1, maxWidth:140, padding:'13px', borderRadius:13,
        background:T3.ink, color:T3.bg, border:'none',
        fontFamily:T3.fBody, fontWeight:700, fontSize:13.5,
      }}>✦ Yeni</button>
    </div>
  );
}

function BoardCard({ children, style = {} }) {
  return (
    <div style={{
      background:T3.panel, border:`1px solid ${T3.hairline}`, borderRadius:22,
      padding:14, ...style,
    }}>{children}</div>
  );
}

// ── 05a · Oyun · Erken durum (5×5) ───────────────────────────────────────
function GameEarly() {
  return (
    <Ph3 label="05a · OYUN · ERKEN">
      <SB3 />
      <GameChrome kicker="serbest · 5×5" title="Bulmaca" hudTime="00:38" hudHints="0" />
      <div style={{padding:'16px 18px 0'}}>
        <BoardCard>
          <Board3 R={5} C={5} clues={PUZZLE_5.clues} edges={EDGES_5_EARLY} size={340} />
        </BoardCard>
        {/* duruma dair sessiz nota */}
        <div style={{
          marginTop:14, textAlign:'center', color:T3.muted, fontStyle:'italic',
          fontFamily:T3.fSerif, fontSize:13,
        }}>çizgi · çarpı · boş — dokun, döngüye giriyor.</div>
      </div>
      <GameFooter />
    </Ph3>
  );
}

// ── 05b · Oyun · Orta + Hata ─────────────────────────────────────────────
function GameMid() {
  // Hata: bir clue (1) etrafında 2 çizgi → kırmızı
  // Bitirilmiş clue: (2) etrafında tam 2 çizgi → solgun
  return (
    <Ph3 label="05b · OYUN · ORTA · HATA">
      <SB3 />
      <GameChrome kicker="yolculuk · bölüm 12" title="Gölge Galerisi" hudTime="04:21" hudHints="1" />
      <div style={{padding:'10px 18px 0'}}>
        <BoardCard>
          <Board3
            R={7} C={7}
            clues={PUZZLE_7.clues}
            edges={EDGES_7_MID}
            errors={[[2,1]]}
            done={[[0,1],[1,4],[2,5]]}
            size={340}
          />
        </BoardCard>
        {/* küçük durum şeridi */}
        <div style={{
          marginTop:14, display:'flex', justifyContent:'center', gap:14,
          fontFamily:T3.fMono, fontSize:10.5, color:T3.muted, letterSpacing:'.12em',
        }}>
          <span><span style={{color:T3.bad}}>●</span> hata</span>
          <span style={{color:T3.faint}}>·</span>
          <span><span style={{color:T3.accent, opacity:.5}}>●</span> tamamlandı</span>
          <span style={{color:T3.faint}}>·</span>
          <span><span style={{color:T3.ink}}>—</span> iplik</span>
        </div>
      </div>
      <GameFooter />
    </Ph3>
  );
}

// ── 05c · Oyun · Büyük tahta (12×12) ─────────────────────────────────────
function GameLarge() {
  return (
    <Ph3 label="05c · OYUN · UZMAN 12×12">
      <SB3 />
      <GameChrome kicker="serbest · 12×12 · uzman" title="Bulmaca" hudTime="11:47" hudHints="2" />
      <div style={{padding:'10px 14px 0'}}>
        <BoardCard style={{padding:10}}>
          <Board3 R={12} C={12} clues={PUZZLE_12.clues} edges={EDGES_12} size={360} pad={12} />
        </BoardCard>
        <div style={{
          marginTop:12, textAlign:'center', color:T3.muted, fontFamily:T3.fMono,
          fontSize:10, letterSpacing:'.22em', textTransform:'uppercase',
        }}>seed · merve-907</div>
      </div>
      <GameFooter />
    </Ph3>
  );
}

// ── 05d · Oyun · Kazanma anı (overlay) ──────────────────────────────────
function GameWin() {
  return (
    <Ph3 label="05d · KAZANMA">
      <SB3 />
      <GameChrome kicker="yolculuk · bölüm 06" title="Sessiz Koridor" hudTime="02:14" hudHints="0" />
      <div style={{padding:'10px 18px 0', filter:'blur(0.6px) brightness(.65)'}}>
        <BoardCard>
          <Board3
            R={7} C={7}
            clues={PUZZLE_7.clues}
            edges={EDGES_7_NEAR_WIN}
            done={[[0,1],[0,3],[0,5],[1,0],[1,2],[1,4],[1,6],[2,1],[2,5],[3,1],[3,4],[3,6],[4,1],[4,5],[5,0],[5,2],[5,4],[5,6],[6,1],[6,3],[6,5]]}
            size={340}
          />
        </BoardCard>
      </div>
      {/* WIN modal */}
      <div style={{
        position:'absolute', inset:0, zIndex:70,
        display:'flex', alignItems:'center', justifyContent:'center', padding:24,
        background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)',
      }}>
        <div style={{
          background:T3.panel2, border:`1px solid ${T3.hairline2}`, borderRadius:24,
          padding:'28px 24px 22px', width:'100%', textAlign:'center',
          boxShadow:'0 24px 60px rgba(0,0,0,.5)',
        }}>
          {/* iplik simgesi */}
          <svg width="42" height="42" viewBox="0 0 42 42" style={{margin:'0 auto 8px', display:'block'}}>
            <circle cx="21" cy="21" r="14" fill="none" stroke={T3.accent} strokeWidth="1.8"/>
            <circle cx="21" cy="21" r="2" fill={T3.accent}/>
          </svg>
          <K3 size={9}>tamamland · 02 · 14</K3>
          <div style={{fontFamily:T3.fSerif, fontWeight:600, fontSize:32, color:T3.ink, marginTop:8, letterSpacing:'-0.02em'}}>
            Aferin, Merve
          </div>
          <p style={{
            fontFamily:T3.fSerif, fontStyle:'italic', color:T3.inkDim, fontSize:15,
            margin:'8px 0 18px', lineHeight:1.45,
          }}>
            yine başardın.<br/>
            seninle her bulmaca daha güzel.
          </p>
          <div style={{
            display:'flex', gap:10, justifyContent:'center', marginBottom:20,
          }}>
            <div style={{
              flex:1, background:T3.bg, border:`1px solid ${T3.hairline}`, borderRadius:12,
              padding:'10px 0',
            }}>
              <div style={{fontFamily:T3.fSerif, fontSize:22, color:T3.ink, fontWeight:600}}>02:14</div>
              <div style={{fontFamily:T3.fMono, fontSize:9, color:T3.muted, letterSpacing:'.2em', marginTop:2}}>SÜRE</div>
            </div>
            <div style={{
              flex:1, background:T3.bg, border:`1px solid ${T3.hairline}`, borderRadius:12,
              padding:'10px 0',
            }}>
              <div style={{fontFamily:T3.fSerif, fontSize:22, color:T3.ink, fontWeight:600}}>0</div>
              <div style={{fontFamily:T3.fMono, fontSize:9, color:T3.muted, letterSpacing:'.2em', marginTop:2}}>İPUCU</div>
            </div>
            <div style={{
              flex:1, background:T3.bg, border:`1px solid ${T3.hairline}`, borderRadius:12,
              padding:'10px 0',
            }}>
              <div style={{fontFamily:T3.fSerif, fontSize:22, color:T3.accent, fontWeight:600}}>★</div>
              <div style={{fontFamily:T3.fMono, fontSize:9, color:T3.muted, letterSpacing:'.2em', marginTop:2}}>EN İYİ</div>
            </div>
          </div>
          <div style={{display:'flex', gap:10}}>
            <button style={{
              flex:1, padding:'13px', borderRadius:13, background:T3.panel,
              border:`1px solid ${T3.hairline}`, color:T3.ink, fontWeight:700, fontSize:14,
              fontFamily:T3.fBody,
            }}>Ana menü</button>
            <button style={{
              flex:1.4, padding:'13px', borderRadius:13, background:T3.ink, color:T3.bg,
              border:'none', fontWeight:700, fontSize:14, fontFamily:T3.fBody,
            }}>Sonraki bölüm ›</button>
          </div>
        </div>
      </div>
    </Ph3>
  );
}

window.SCREENS_GAME = { GameEarly, GameMid, GameLarge, GameWin };
