// Ayarlar paneli, sistem tokenleri kartı
const { T:T4, Kicker:K4, Rule:R4, Display:D4, StatusBar:SB4, Phone:Ph4, noiseStyle:NS4 } = window.SI;

// ── Ayarlar (sheet) ─────────────────────────────────────────────────────
function SettingsSheet() {
  const toggles = [
    { k:'hints',   t:'İpucu butonu',                d:'oyunda ipucu butonunu göster',          on:true  },
    { k:'fade',    t:'Tamamlananı soluklaştır',     d:'çizgisi biten sayıyı soluklaştır',      on:true  },
    { k:'errors',  t:'Hataları kırmızı göster',     d:'fazla/yanlış çizgide sayıyı kırmızı yap',on:true  },
    { k:'haptics', t:'Titreşim',                    d:'dokununca küçük titreşim',              on:false },
  ];

  const Sw = ({ on }) => (
    <div style={{
      width:48, height:28, borderRadius:99,
      background: on ? T4.ink : T4.faint, position:'relative', flexShrink:0,
      transition:'.2s',
    }}>
      <div style={{
        position:'absolute', top:3, left: on?23:3, width:22, height:22, borderRadius:'50%',
        background:'#fff', transition:'.2s',
      }} />
    </div>
  );

  return (
    <Ph4 label="06 · AYARLAR">
      <SB4 />
      {/* arka plan: home menüden hafif blurlu */}
      <div style={{
        position:'absolute', inset:0, padding:'56px 24px 0',
        background: T4.bg, opacity:.7,
      }}>
        <K4 style={{textAlign:'center'}}>merve i̇çi̇n</K4>
        <D4 size={56} style={{textAlign:'center', marginTop:10, color:'rgba(237,234,227,0.25)', filter:'blur(2px)'}}>Çember</D4>
      </div>
      {/* dim overlay */}
      <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,.55)', backdropFilter:'blur(6px)'}} />

      {/* sheet */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0,
        background:T4.panel2, borderTopLeftRadius:28, borderTopRightRadius:28,
        border:`1px solid ${T4.hairline2}`, borderBottom:'none',
        padding:'22px 22px 42px',
      }}>
        {/* handle */}
        <div style={{
          width:42, height:4, borderRadius:99, background:T4.faint, margin:'0 auto 18px',
        }} />
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
          <D4 size={28}>Ayarlar</D4>
          <K4 size={9}>v · 0.1</K4>
        </div>
        <div style={{
          fontFamily:T4.fSerif, fontStyle:'italic', color:T4.muted, fontSize:13.5,
          marginTop:6, marginBottom:14,
        }}>oyun deneyimini kendine göre ayarla.</div>

        {toggles.map((tg, i) => (
          <React.Fragment key={tg.k}>
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'14px 2px',
            }}>
              <div style={{flex:1, paddingRight:20}}>
                <div style={{fontFamily:T4.fBody, fontWeight:700, fontSize:15, color:T4.ink}}>{tg.t}</div>
                <div style={{color:T4.muted, fontSize:12, marginTop:3}}>{tg.d}</div>
              </div>
              <Sw on={tg.on} />
            </div>
            {i < toggles.length-1 && <R4 />}
          </React.Fragment>
        ))}

        <R4 style={{margin:'10px 0 14px'}} />

        {/* iPhone tam ekran ipucu */}
        <div style={{
          background:T4.bg, border:`1px solid ${T4.hairline}`, borderRadius:14,
          padding:'14px 16px',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{
              width:32, height:32, borderRadius:8, background:T4.panel,
              border:`1px solid ${T4.hairline}`, display:'grid', placeItems:'center',
              color:T4.accent, fontSize:14,
            }}>↗</div>
            <div style={{fontFamily:T4.fBody, fontWeight:700, fontSize:13.5, color:T4.ink}}>Tam ekran oyna</div>
          </div>
          <div style={{
            fontFamily:T4.fSerif, fontStyle:'italic', color:T4.muted, fontSize:12.5,
            marginTop:8, lineHeight:1.45,
          }}>
            Safari'de paylaş butonundan <b style={{color:T4.inkDim, fontStyle:'normal', fontWeight:600}}>Ana Ekrana Ekle</b> dersen oyun uygulama gibi tam ekran açılır.
          </div>
        </div>

        {/* alt imza — Jedi sessiz easter egg */}
        <div style={{
          marginTop:18, textAlign:'center', color:T4.muted,
          fontFamily:T4.fMono, fontSize:10, letterSpacing:'.3em', textTransform:'uppercase',
        }}>
          merve <span style={{color:T4.faint}}>·</span> jedi <span style={{color:T4.faint}}>·</span> ç
        </div>
      </div>
    </Ph4>
  );
}

// ── Sistem kartı (token özeti) ───────────────────────────────────────────
function SystemCard() {
  const colors = [
    { name:'bg', hex:T4.bg },
    { name:'panel', hex:T4.panel },
    { name:'panel-2', hex:T4.panel2 },
    { name:'ink', hex:T4.ink },
    { name:'ink-dim', hex:'#9C9890' },
    { name:'muted', hex:T4.muted },
    { name:'accent · taupe', hex:T4.accent },
    { name:'bad · pas', hex:T4.bad },
    { name:'good · adaçayı', hex:T4.good },
  ];
  return (
    <div style={{
      width:540, background:T4.panel, color:T4.ink, padding:32,
      border:`1px solid ${T4.hairline2}`, borderRadius:24, fontFamily:T4.fBody,
    }}>
      <K4>tasarım sistemi · 01</K4>
      <D4 size={42} style={{marginTop:8}}>Sessiz İplik</D4>
      <div style={{fontFamily:T4.fSerif, fontStyle:'italic', color:T4.inkDim, fontSize:15, marginTop:8, maxWidth:420}}>
        sıcak siyahlar üzerine kağıt grisi. tek bir taupe vurgu. kalan her şey çekilir, susar; ipliği sen çizersin.
      </div>

      <Rule color={T4.hairline2} style={{margin:'26px 0 18px'}} />

      <K4>renk</K4>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginTop:12}}>
        {colors.map(c => (
          <div key={c.name} style={{
            background:T4.bg, border:`1px solid ${T4.hairline}`, borderRadius:12, padding:'10px 12px',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{width:26, height:26, borderRadius:7, background:c.hex, border:`1px solid ${T4.hairline}`}} />
            <div style={{minWidth:0}}>
              <div style={{fontFamily:T4.fBody, fontWeight:700, fontSize:11.5, color:T4.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.name}</div>
              <div style={{fontFamily:T4.fMono, fontSize:10, color:T4.muted, letterSpacing:'.04em'}}>{c.hex}</div>
            </div>
          </div>
        ))}
      </div>

      <Rule color={T4.hairline2} style={{margin:'22px 0 18px'}} />

      <K4>tipografi</K4>
      <div style={{marginTop:14}}>
        <div style={{display:'flex', alignItems:'baseline', gap:12, marginBottom:6}}>
          <span style={{fontFamily:T4.fSerif, fontSize:46, fontWeight:500, color:T4.ink, letterSpacing:'-0.025em', lineHeight:1}}>Çember</span>
          <span style={{fontFamily:T4.fMono, fontSize:10, color:T4.muted, letterSpacing:'.18em', textTransform:'uppercase'}}>fraunces · 500 · display</span>
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap:12, marginBottom:6}}>
          <span style={{fontFamily:T4.fSerif, fontSize:20, fontStyle:'italic', color:T4.inkDim}}>iyi ki döndün.</span>
          <span style={{fontFamily:T4.fMono, fontSize:10, color:T4.muted, letterSpacing:'.18em', textTransform:'uppercase'}}>fraunces · italik · ton</span>
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap:12, marginBottom:6}}>
          <span style={{fontFamily:T4.fBody, fontSize:14, color:T4.ink, fontWeight:700}}>Başlat — tahta boyutu 7×7</span>
          <span style={{fontFamily:T4.fMono, fontSize:10, color:T4.muted, letterSpacing:'.18em', textTransform:'uppercase'}}>karla · 700 · gövde</span>
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap:12}}>
          <span style={{fontFamily:T4.fMono, fontSize:12, color:T4.accent, letterSpacing:'.18em', textTransform:'uppercase'}}>seed · merve-014</span>
          <span style={{fontFamily:T4.fMono, fontSize:10, color:T4.muted, letterSpacing:'.18em', textTransform:'uppercase'}}>jetbrains mono · HUD</span>
        </div>
      </div>

      <Rule color={T4.hairline2} style={{margin:'22px 0 18px'}} />

      <K4>i̇lkeler</K4>
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12,
        fontFamily:T4.fSerif, fontStyle:'italic', color:T4.inkDim, fontSize:13, lineHeight:1.5,
      }}>
        <div>· slop yok. emoji yok. gradient bg yok.</div>
        <div>· ipucu rakamı küçük ekranda net okunmalı.</div>
        <div>· renk taşımaz; çizgi/çarpı/boş şekilden ayrılır.</div>
        <div>· iplik kahramandır — diğer her şey çekilir.</div>
      </div>
    </div>
  );
}

window.SCREENS_MODALS = { SettingsSheet, SystemCard };
