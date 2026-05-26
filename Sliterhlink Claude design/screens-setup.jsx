// Serbest oyun kurulum + Yolculuk haritası
const { T:T2, Kicker:K2, Rule:R2, Display:D2, StatusBar:SB2, Phone:Ph2, noiseStyle:NS2 } = window.SI;

function TopBar({ title, kicker, right = '⚙' }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'10px 20px 6px', minHeight:48,
    }}>
      <button style={{
        width:38, height:38, borderRadius:11, background:T2.panel,
        border:`1px solid ${T2.hairline}`, color:T2.ink, fontSize:18, lineHeight:1,
      }}>‹</button>
      <div style={{flex:1, minWidth:0}}>
        {kicker && <K2 size={9}>{kicker}</K2>}
        <div style={{fontFamily:T2.fSerif, fontWeight:600, fontSize:18, color:T2.ink, marginTop:1}}>{title}</div>
      </div>
      <button style={{
        width:38, height:38, borderRadius:11, background:T2.panel,
        border:`1px solid ${T2.hairline}`, color:T2.ink, fontSize:15,
      }}>{right}</button>
    </div>
  );
}

// ── Setup (Serbest oyun ayarları) ────────────────────────────────────────
function SetupScreen() {
  const presets = ['Kolay','Orta','Zor','Uzman','Rastgele'];
  const sizes = [4,5,6,7,9,12];
  const selSize = 7;
  const dens = 68;

  const Chip = ({ children, sel, mono }) => (
    <div style={{
      padding:'9px 14px', borderRadius:11,
      border:`1px solid ${sel ? T2.ink : T2.hairline}`,
      background: sel ? T2.ink : T2.panel,
      color: sel ? T2.bg : T2.ink,
      fontFamily: mono ? T2.fMono : T2.fBody,
      fontWeight:700, fontSize:13.5, letterSpacing: mono ? '.05em' : 0,
    }}>{children}</div>
  );

  return (
    <Ph2 label="03 · SERBEST · KURULUM">
      <SB2 />
      <TopBar title="Serbest Oyun" kicker="ç · serbest" right="⌃" />
      <div style={{padding:'8px 24px 24px', overflowY:'auto'}}>

        <K2>Hazır seviye</K2>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:12, marginBottom:24}}>
          {presets.map((p,i)=>(<Chip key={p} sel={i===1}>{p}</Chip>))}
        </div>

        <K2>Tahta boyutu</K2>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:12, marginBottom:24}}>
          {sizes.map(s=>(<Chip key={s} sel={s===selSize} mono>{s}×{s}</Chip>))}
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
          <K2>İpucu yoğunluğu</K2>
          <span style={{fontFamily:T2.fMono, fontSize:13, color:T2.ink, fontWeight:700}}>%{dens}</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14, marginTop:14, marginBottom:24}}>
          <span style={{color:T2.muted, fontSize:11, fontFamily:T2.fMono, letterSpacing:'.1em'}}>az</span>
          <div style={{flex:1, height:6, borderRadius:99, background:T2.panel, position:'relative'}}>
            <div style={{position:'absolute', inset:'0 0 0 0', width:`${dens}%`, background:T2.ink, borderRadius:99}} />
            <div style={{
              position:'absolute', left:`${dens}%`, top:'50%', transform:'translate(-50%,-50%)',
              width:22, height:22, borderRadius:'50%', background:T2.ink, boxShadow:'0 2px 8px rgba(0,0,0,.4)',
            }} />
          </div>
          <span style={{color:T2.muted, fontSize:11, fontFamily:T2.fMono, letterSpacing:'.1em'}}>çok</span>
        </div>

        <K2>Seed (rastgelelik)</K2>
        <div style={{
          color:T2.muted, fontSize:12, fontFamily:T2.fSerif, fontStyle:'italic',
          marginTop:6, marginBottom:10,
        }}>boş bırakırsan rastgele bir seed üretilir.</div>
        <div style={{display:'flex', gap:8, marginBottom:32}}>
          <div style={{
            flex:1, background:T2.panel, border:`1px solid ${T2.hairline}`,
            borderRadius:12, padding:'12px 14px', fontFamily:T2.fMono, fontSize:14,
            color:T2.ink, letterSpacing:'.04em',
          }}>merve-014</div>
          <button style={{
            width:46, background:T2.panel, border:`1px solid ${T2.hairline}`,
            borderRadius:12, color:T2.ink, fontSize:18,
          }}>⤬</button>
        </div>

        {/* mini önizleme — seçilen ayarlarla nasıl olur */}
        <div style={{
          background:T2.panel, border:`1px solid ${T2.hairline}`, borderRadius:16,
          padding:'14px 16px', display:'flex', alignItems:'center', gap:14, marginBottom:24,
        }}>
          <div style={{
            width:64, height:64, borderRadius:10, background:T2.bg, border:`1px solid ${T2.hairline}`,
            display:'grid', placeItems:'center', fontFamily:T2.fMono, color:T2.accent, fontSize:11,
          }}>7×7</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:T2.fSerif, fontSize:15, color:T2.ink, fontWeight:600}}>Orta zorluk · 7×7</div>
            <div style={{color:T2.muted, fontSize:12, marginTop:3}}>~%68 ipucu · seed sabit</div>
          </div>
        </div>

        <button style={{
          width:'100%', padding:'18px', borderRadius:16, border:'none',
          background:T2.ink, color:T2.bg, fontFamily:T2.fBody, fontSize:16, fontWeight:700,
        }}>Başlat</button>
      </div>
    </Ph2>
  );
}

// ── Yolculuk haritası — varsayılan vertical path ─────────────────────────
const FLOORS = [
  { name:'Giriş Holü', size:4, keep:85 },
  { name:'Sessiz Koridor', size:5, keep:78 },
  { name:'Gölge Galerisi', size:6, keep:72 },
  { name:'Kayıp Kütüphane', size:7, keep:66 },
  { name:'Kristal Mağara', size:8, keep:60 },
  { name:'Zirve', size:9, keep:55 },
];

function JourneyMap() {
  // Şu anki ilerleme: 1.kat 5/5, 2.kat 2/5
  const unlocked = 7;

  return (
    <Ph2 label="04 · YOLCULUK · HARİTA">
      <SB2 />
      <TopBar title="Yolculuk" kicker="ç · kampanya" right="↺" />
      <div style={{padding:'4px 0 32px', overflowY:'auto'}}>

        {/* ilerleme şeridi */}
        <div style={{padding:'4px 24px 18px', display:'flex', alignItems:'center', gap:10}}>
          <div style={{
            fontFamily:T2.fMono, fontSize:11, color:T2.muted, letterSpacing:'.18em', textTransform:'uppercase',
          }}>İlerleme</div>
          <div style={{flex:1, height:2, background:T2.hairline, position:'relative'}}>
            <div style={{position:'absolute', inset:0, width:`${(unlocked/30)*100}%`, background:T2.accent, height:2}} />
          </div>
          <div style={{fontFamily:T2.fMono, fontSize:12, color:T2.ink, fontWeight:600}}>{unlocked}<span style={{color:T2.muted}}>/30</span></div>
        </div>

        {FLOORS.map((f, fi) => {
          const start = fi*5;
          return (
            <div key={f.name} style={{padding:'8px 24px 4px'}}>
              <div style={{display:'flex', alignItems:'baseline', gap:10, marginTop: fi===0?0:18, marginBottom:12}}>
                <span style={{
                  fontFamily:T2.fMono, fontSize:10, color:T2.accent, letterSpacing:'.2em',
                }}>KAT {String(fi+1).padStart(2,'0')}</span>
                <div style={{flex:1, height:1, background:T2.hairline}} />
                <span style={{
                  fontFamily:T2.fSerif, fontStyle:'italic', fontSize:14, color:T2.ink,
                }}>{f.name}</span>
              </div>
              {/* nodes — yatay 5 düğüm, aralarında ip */}
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative'}}>
                {/* connecting thread */}
                <div style={{position:'absolute', left:18, right:18, top:'50%', height:1, background:T2.hairline2}} />
                {[0,1,2,3,4].map(w => {
                  const i = start+w;
                  const done = i < unlocked;
                  const cur = i === unlocked;
                  const lock = i > unlocked;
                  return (
                    <div key={w} style={{
                      position:'relative', zIndex:1,
                      width:42, height:42, borderRadius:'50%',
                      background: cur ? T2.ink : (done ? T2.panel2 : T2.bg),
                      border:`1px solid ${cur ? T2.ink : (done ? T2.accent : T2.hairline)}`,
                      display:'grid', placeItems:'center',
                      color: cur ? T2.bg : (done ? T2.accent : T2.muted),
                      fontFamily:T2.fMono, fontSize:12, fontWeight:700,
                      opacity: lock ? 0.45 : 1,
                      boxShadow: cur ? '0 0 0 6px rgba(168,155,139,0.12)' : 'none',
                    }}>
                      {lock ? '◌' : (done ? '✓' : (w+1))}
                    </div>
                  );
                })}
              </div>
              <div style={{
                display:'flex', justifyContent:'space-between',
                fontFamily:T2.fMono, fontSize:10, color:T2.muted,
                letterSpacing:'.05em', marginTop:8, padding:'0 4px',
              }}>
                <span>{f.size}×{f.size}</span>
                <span>·</span>
                <span>%{f.keep}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Ph2>
  );
}

// ── Yolculuk — alternatif: kart listesi ─────────────────────────────────
function JourneyList() {
  const unlocked = 7;
  return (
    <Ph2 label="04b · YOLCULUK · LİSTE">
      <SB2 />
      <TopBar title="Yolculuk" kicker="ç · kampanya" right="↺" />
      <div style={{padding:'4px 24px 32px', overflowY:'auto'}}>
        {FLOORS.slice(0,3).map((f, fi) => (
          <div key={f.name}>
            <div style={{
              fontFamily:T2.fSerif, fontStyle:'italic', fontSize:15, color:T2.accent,
              margin:'22px 4px 10px',
            }}>{fi+1}. {f.name}</div>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {[0,1,2,3,4].map(w=>{
                const i = fi*5+w;
                const done = i<unlocked, cur=i===unlocked, lock=i>unlocked;
                const time = ['0:42','1:18','2:04','3:11','4:55'][w];
                return (
                  <div key={w} style={{
                    display:'flex', alignItems:'center', gap:14,
                    background: cur ? T2.panel2 : T2.panel,
                    border:`1px solid ${cur?T2.accent:T2.hairline}`,
                    borderRadius:14, padding:'12px 14px', opacity:lock?0.4:1,
                  }}>
                    <div style={{
                      width:32, height:32, borderRadius:9, background:T2.bg,
                      border:`1px solid ${T2.hairline}`, display:'grid', placeItems:'center',
                      fontFamily:T2.fMono, fontSize:12, fontWeight:700, color: cur?T2.ink:T2.muted,
                    }}>{i+1}</div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontFamily:T2.fBody, fontWeight:700, fontSize:14, color:T2.ink}}>{f.size}×{f.size}</div>
                      <div style={{color:T2.muted, fontSize:11.5, marginTop:2, fontFamily:T2.fMono, letterSpacing:'.04em'}}>
                        ipucu %{f.keep}{done && ` · en iyi ${time}`}
                      </div>
                    </div>
                    <div style={{color:lock?T2.muted:(done?T2.accent:T2.ink), fontSize:16}}>
                      {lock?'◌':(done?'✓':'›')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Ph2>
  );
}

window.SCREENS_SETUP = { SetupScreen, JourneyMap, JourneyList };
