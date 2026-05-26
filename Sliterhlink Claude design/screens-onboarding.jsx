// Açılış, Ana Menü ekranları — Sessiz İplik
const { T, Kicker, Rule, Display, StatusBar, Phone, noiseStyle } = window.SI;

// ── Açılış (ilk açılışta) ───────────────────────────────────────────────
function StartScreen() {
  return (
    <Phone label="01 · AÇILIŞ">
      <StatusBar />
      {/* sayfa */}
      <div style={{
        height:'100%', display:'flex', flexDirection:'column',
        padding:'90px 32px 70px', position:'relative', ...noiseStyle,
      }}>
        {/* küçük kedi kulağı silüeti — Jedi easter egg */}
        <svg width="22" height="14" viewBox="0 0 22 14" style={{position:'absolute', top:54, right:32, opacity:.55}}>
          <path d="M2 13 L7 2 L11 9 L15 2 L20 13 Z" fill="none" stroke={T.accent} strokeWidth="1" strokeLinejoin="round"/>
        </svg>

        <Kicker>cember bulmaca</Kicker>
        <div style={{flex:1}} />

        {/* dekoratif iplik — tek bir çember */}
        <div style={{margin:'0 auto 40px', width:140, height:140, position:'relative'}}>
          <svg viewBox="0 0 140 140" width="140" height="140">
            <circle cx="70" cy="70" r="48" fill="none" stroke={T.ink} strokeOpacity=".18" strokeWidth="1"/>
            <path d="M40 50 L40 95 L75 95 L75 75 L100 75 L100 50 L65 50 Z"
              fill="none" stroke={T.ink} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
            <circle cx="40" cy="50" r="2.5" fill={T.accent}/>
            <circle cx="100" cy="50" r="2.5" fill={T.accent}/>
          </svg>
        </div>

        <Display size={56} style={{textAlign:'center', letterSpacing:'-0.025em'}}>Çember</Display>
        <div style={{
          fontFamily:T.fSerif, fontStyle:'italic', textAlign:'center',
          color:T.inkDim, fontSize:18, marginTop:14, lineHeight:1.5,
          textWrap:'pretty',
        }}>
          Merhaba Merve.<br/>
          Bunu senin için yaptım — tek<br/>bir çember çiz, kaybolma.
        </div>

        <div style={{flex:1.4}} />

        <button style={{
          width:'100%', padding:'18px', borderRadius:18, border:'none',
          background:T.ink, color:T.bg, fontFamily:T.fBody, fontSize:16,
          fontWeight:700, letterSpacing:'.02em',
        }}>Başla</button>
        <div style={{textAlign:'center', marginTop:18, color:T.muted, fontFamily:T.fMono, fontSize:10, letterSpacing:'.28em', textTransform:'uppercase'}}>m · & · j</div>
      </div>
    </Phone>
  );
}

// ── Ana menü — varsayılan ───────────────────────────────────────────────
function HomeScreen({ withResume = false }) {
  const cards = [
    { id:'free', glyph:'✦', t:'Serbest Oyun', s:'Boyut, yoğunluk ve seed seç', resume: withResume },
    { id:'journey', glyph:'⬢', t:'Yolculuk', s: withResume ? '7 / 30 bölüm açıldı' : '1 / 30 bölüm açıldı', resume: false },
    { id:'rogue', glyph:'☠', t:'Rogue Modu', s:'Yakında — canlar, eşyalar, rastgele kat', locked:true },
  ];
  return (
    <Phone label={withResume ? '02b · ANA MENÜ (devam et)' : '02 · ANA MENÜ'}>
      <StatusBar />
      <div style={{padding:'12px 24px 0', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <Kicker>ç · 01</Kicker>
        <button style={{
          width:40, height:40, borderRadius:12, background:T.panel,
          border:`1px solid ${T.hairline}`, color:T.ink, fontSize:16,
        }}>⚙</button>
      </div>

      <div style={{padding:'18px 32px 0', textAlign:'center', ...noiseStyle}}>
        <Kicker>merve i̇çi̇n</Kicker>
        <Display size={62} style={{marginTop:10, letterSpacing:'-0.03em'}}>Çember</Display>
        <div style={{fontFamily:T.fSerif, fontStyle:'italic', color:T.inkDim, fontSize:14, marginTop:6}}>
          {withResume ? 'iyi ki döndün.' : 'bir bulmaca seç.'}
        </div>
      </div>

      <div style={{padding:'28px 22px 0', display:'flex', flexDirection:'column', gap:12}}>
        {cards.map(c => (
          <div key={c.id} style={{
            background: c.locked ? 'transparent' : `linear-gradient(160deg, ${T.panel2}, ${T.panel})`,
            border: `1px solid ${c.locked ? T.hairline : T.hairline2}`,
            borderRadius: 18, padding: '16px 16px', display:'flex', alignItems:'center', gap:14,
            opacity: c.locked ? 0.5 : 1, position:'relative',
          }}>
            <div style={{
              width:50, height:50, borderRadius:14, background:T.bg,
              border:`1px solid ${T.hairline}`, display:'grid', placeItems:'center',
              color: c.locked ? T.muted : T.accent, fontFamily:T.fSerif, fontSize:24,
            }}>{c.glyph}</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontFamily:T.fSerif, fontWeight:600, fontSize:18, color:T.ink, lineHeight:1.1}}>{c.t}</div>
              <div style={{color:T.muted, fontSize:12.5, marginTop:4, lineHeight:1.3}}>{c.s}</div>
              {c.resume && (
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:6, marginTop:9,
                  background:T.ink, color:T.bg, fontSize:10.5, fontWeight:700,
                  padding:'4px 9px 4px 9px', borderRadius:99, letterSpacing:'.08em', textTransform:'uppercase',
                  fontFamily:T.fMono,
                }}>● Devam et · 04:21</div>
              )}
            </div>
            <div style={{color:c.locked?T.muted:T.inkDim, fontSize:18, marginRight:4}}>{c.locked?'◌':'›'}</div>
          </div>
        ))}
      </div>

      <div style={{padding:'34px 32px 0', textAlign:'center'}}>
        <Rule />
        <div style={{
          fontFamily:T.fSerif, fontStyle:'italic', color:T.muted,
          fontSize:13, marginTop:14, lineHeight:1.5, textWrap:'pretty',
        }}>
          tek ve kapalı bir çember çiz.<br/>
          her sayı, etrafındaki çizgi adedini söyler.
        </div>
      </div>
    </Phone>
  );
}

window.SCREENS_ONBOARD = { StartScreen, HomeScreen };
