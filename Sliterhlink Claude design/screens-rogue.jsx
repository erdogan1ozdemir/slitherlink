// Rogue Modu — gelecek tasarımları (sonraki aşama)
const { T:T5, Kicker:K5, Rule:R5, Display:D5, StatusBar:SB5, Phone:Ph5, Board:Board5 } = window.SI;

// Mini topbar
function MiniBar({ kicker, title }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, padding:'10px 20px 6px', minHeight:48}}>
      <button style={{
        width:38, height:38, borderRadius:11, background:T5.panel,
        border:`1px solid ${T5.hairline}`, color:T5.ink, fontSize:18,
      }}>‹</button>
      <div style={{flex:1, minWidth:0, textAlign:'center'}}>
        <K5 size={9}>{kicker}</K5>
        <div style={{fontFamily:T5.fSerif, fontWeight:600, fontSize:16, color:T5.ink, marginTop:1}}>{title}</div>
      </div>
      <div style={{width:38}} />
    </div>
  );
}

// Can ve eşya sayacı (run HUD'da kullanılır)
function RunHud({ lives = 2, maxLives = 3, relics = 3, floor = 2 }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'6px 20px 10px', gap:10,
    }}>
      <div style={{display:'flex', gap:5}}>
        {Array.from({length:maxLives}).map((_,i) => (
          <span key={i} style={{
            fontSize:16, color: i < lives ? T5.bad : T5.faint,
          }}>♥</span>
        ))}
      </div>
      <div style={{
        fontFamily:T5.fMono, fontSize:10, color:T5.muted, letterSpacing:'.2em', textTransform:'uppercase',
      }}>KAT {floor} <span style={{color:T5.faint}}>·</span> seed alev-0148</div>
      <div style={{
        display:'flex', alignItems:'center', gap:6,
        fontFamily:T5.fMono, fontSize:12, color:T5.accent, fontWeight:700,
      }}>
        <span style={{color:T5.accent}}>◇</span> {relics}
      </div>
    </div>
  );
}

// ── 07 · Rogue · Koşu haritası (dallanan düğümler) ──────────────────────
function RogueMap() {
  // 5 kat, her katta 2-3 düğüm; tipler: puzzle/elite/chest/rest/event/boss
  const FLOORS = [
    // [tip, kolon-index]
    [['puzzle', 1]],                                          // başlangıç
    [['puzzle', 0], ['event', 2]],
    [['puzzle', 0], ['chest', 1], ['elite', 2]],
    [['rest', 0], ['puzzle', 2]],
    [['boss', 1]],
  ];
  const COLS = 3;
  const W = 360, H = 540;
  const cx = c => 40 + c * ((W-80)/(COLS-1));
  const cy = f => 40 + f * ((H-80)/(FLOORS.length-1));

  // bağlantılar (önceki kat → bu kat). Basit: her düğüm en yakın 1-2'ye bağlanır
  const edges = [];
  for (let f = 1; f < FLOORS.length; f++) {
    for (const [, c] of FLOORS[f]) {
      // en yakın 1-2 önceki kat düğümünü bul
      const prev = FLOORS[f-1].map(([, pc]) => pc);
      prev.sort((a,b)=> Math.abs(a-c) - Math.abs(b-c));
      edges.push([f-1, prev[0], f, c]);
      if (prev[1] !== undefined && Math.abs(prev[1]-c) <= 2 && Math.random() > 0.4) {
        edges.push([f-1, prev[1], f, c]);
      }
    }
  }

  const visited = '0-1,1-0'; // örnek: ilk iki seçim yapıldı
  const current = '2-1';     // şu an: chest'e bakıyoruz

  const glyph = {
    puzzle: '◇', elite: '☆', chest: '⬚', rest: '◐', event: '?', boss: '☠',
  };
  const labelOf = {
    puzzle:'Bulmaca', elite:'Elit', chest:'Sandık', rest:'Dinlenme', event:'Olay', boss:'Patron',
  };

  return (
    <Ph5 label="07 · ROGUE · KOŞU HARİTASI">
      <SB5 />
      <MiniBar kicker="rogue · koşu #14" title="Karanlık İğne" />
      <RunHud lives={2} maxLives={3} relics={2} floor={3} />

      <div style={{padding:'0 18px'}}>
        <div style={{
          background:T5.panel, border:`1px solid ${T5.hairline}`, borderRadius:18,
          padding:14, position:'relative',
          backgroundImage: 'radial-gradient(80% 60% at 50% 0%, rgba(168,155,139,0.06) 0%, transparent 70%)',
        }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
            {/* bağlantılar */}
            {edges.map(([f1, c1, f2, c2], i) => (
              <line key={i} x1={cx(c1)} y1={cy(f1)} x2={cx(c2)} y2={cy(f2)}
                stroke={T5.hairline2} strokeWidth="1" strokeDasharray="3 4" />
            ))}
            {/* düğümler */}
            {FLOORS.map((row, f) => row.map(([type, c]) => {
              const key = `${f}-${c}`;
              const isVisited = visited.includes(key);
              const isCurrent = current === key;
              const dim = !isVisited && !isCurrent && f > 2;
              const fill = isCurrent ? T5.ink : (isVisited ? T5.panel2 : T5.bg);
              const stroke = isCurrent ? T5.accent : (isVisited ? T5.accent : T5.hairline2);
              return (
                <g key={key} opacity={dim ? 0.4 : 1}>
                  {isCurrent && (
                    <circle cx={cx(c)} cy={cy(f)} r={22} fill="none" stroke={T5.accent} strokeOpacity=".25" strokeWidth="6"/>
                  )}
                  <circle cx={cx(c)} cy={cy(f)} r={16} fill={fill} stroke={stroke} strokeWidth="1.2"/>
                  <text x={cx(c)} y={cy(f)+1} textAnchor="middle" dominantBaseline="central"
                    fontFamily={T5.fSerif} fontSize="14" fontWeight="600"
                    fill={isCurrent ? T5.bg : (isVisited ? T5.accent : T5.muted)}>
                    {glyph[type]}
                  </text>
                </g>
              );
            }))}
            {/* kat etiketleri */}
            {FLOORS.map((_, f) => (
              <text key={`fl${f}`} x={14} y={cy(f)+3} fontFamily={T5.fMono} fontSize="9"
                fill={T5.muted} letterSpacing=".18em">{String(f+1).padStart(2,'0')}</text>
            ))}
          </svg>
        </div>

        {/* alt detay — seçilen düğümün önizlemesi */}
        <div style={{
          marginTop:14, background:T5.panel2, border:`1px solid ${T5.accent}`,
          borderRadius:16, padding:'14px 16px',
        }}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{
              width:36, height:36, borderRadius:10, background:T5.bg,
              display:'grid', placeItems:'center', color:T5.accent, fontFamily:T5.fSerif, fontSize:18,
              border:`1px solid ${T5.hairline}`,
            }}>⬚</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:T5.fSerif, fontWeight:600, fontSize:15, color:T5.ink}}>Sandık</div>
              <div style={{color:T5.muted, fontSize:12, fontFamily:T5.fSerif, fontStyle:'italic'}}>bir eşya seç. bulmaca yok.</div>
            </div>
            <span style={{fontFamily:T5.fMono, fontSize:11, color:T5.accent, letterSpacing:'.15em'}}>SEÇ ›</span>
          </div>
        </div>
      </div>
    </Ph5>
  );
}

// ── 08 · Rogue · Oyun · canlar + eşya HUD ───────────────────────────────
function RogueGame() {
  // küçük 6×6 bulmaca, mid-game
  const clues = [
    [-1, 2,-1, 3, 1,-1],
    [ 2,-1, 1,-1,-1, 2],
    [-1, 3,-1, 2,-1,-1],
    [ 1,-1, 2,-1, 3,-1],
    [-1, 2,-1, 1,-1, 2],
    [ 2,-1, 3,-1, 2,-1],
  ];
  const e = { h: Array.from({length:7},()=>Array(6).fill(0)), v: Array.from({length:6},()=>Array(7).fill(0)) };
  e.h[0][1]=1; e.h[0][2]=1; e.v[0][1]=1; e.v[0][3]=1;
  e.h[2][3]=1; e.v[1][3]=1; e.v[2][4]=1;
  e.h[4][1]=1; e.h[4][2]=1; e.v[3][2]=2; e.h[3][4]=2;

  return (
    <Ph5 label="08 · ROGUE · OYUN HUD">
      <SB5 />
      <MiniBar kicker="rogue · kat 3 · bulmaca" title="Elit · Sızıntı" />
      <RunHud lives={1} maxLives={3} relics={3} floor={3} />

      <div style={{padding:'4px 18px 0'}}>
        <div style={{
          background:T5.panel, border:`1px solid ${T5.hairline}`, borderRadius:20, padding:12,
        }}>
          <Board5 R={6} C={6} clues={clues} edges={e} size={320} pad={20} />
        </div>

        {/* relics — taşıdığın eşyalar */}
        <div style={{
          marginTop:14, display:'flex', gap:8,
        }}>
          {[
            { g:'◈', t:'Pusula',     d:'+1 ipucu' },
            { g:'✎', t:'Gümüş kalem',d:'ilk hata cezasız' },
            { g:'⧗', t:'Kum saati',  d:'+30sn' },
          ].map(r => (
            <div key={r.t} style={{
              flex:1, background:T5.panel, border:`1px solid ${T5.hairline}`,
              borderRadius:12, padding:'10px 8px', textAlign:'center',
            }}>
              <div style={{color:T5.accent, fontFamily:T5.fSerif, fontSize:20, lineHeight:1}}>{r.g}</div>
              <div style={{fontFamily:T5.fBody, fontSize:11, color:T5.ink, fontWeight:700, marginTop:5}}>{r.t}</div>
              <div style={{fontFamily:T5.fMono, fontSize:9, color:T5.muted, marginTop:2, letterSpacing:'.04em'}}>{r.d}</div>
            </div>
          ))}
        </div>

        {/* alt durum çubuğu */}
        <div style={{
          marginTop:12, padding:'10px 14px',
          background:T5.panel2, border:`1px solid ${T5.hairline}`, borderRadius:12,
          display:'flex', alignItems:'center', gap:10,
        }}>
          <span style={{color:T5.bad, fontSize:13}}>♥</span>
          <div style={{
            fontFamily:T5.fSerif, fontStyle:'italic', color:T5.inkDim, fontSize:13, flex:1,
          }}>son canın. bir hata daha koşunu bitirir.</div>
        </div>
      </div>
    </Ph5>
  );
}

// ── 09 · Rogue · Eşya seçimi (sandık) ───────────────────────────────────
function RogueChest() {
  const items = [
    { g:'⬣', t:'Harita Parçası',    d:'sonraki katı baştan gör.',           rar:'nadir' },
    { g:'♾', t:'Çift Dikiş',        d:'dinlenmede 2 can geri gelir.',       rar:'sık'   },
    { g:'⟳', t:'Geri Dönüş',        d:'oyun başı bir kez geri al.',         rar:'sık'   },
  ];
  return (
    <Ph5 label="09 · ROGUE · SANDIK">
      <SB5 />
      <MiniBar kicker="rogue · sandık" title="Bir eşya seç" />

      <div style={{padding:'20px 22px 0'}}>
        <div style={{
          fontFamily:T5.fSerif, fontStyle:'italic', color:T5.inkDim, fontSize:14.5,
          textAlign:'center', lineHeight:1.5, marginBottom:22,
        }}>
          sandık açıldı.<br/>
          üç ışıltı, bir seçim. seçtiğin koşunun sonuna kadar seninle.
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {items.map((it, i) => (
            <div key={it.t} style={{
              background: i===1 ? T5.panel2 : T5.panel,
              border:`1px solid ${i===1 ? T5.accent : T5.hairline}`,
              borderRadius:16, padding:'14px 16px', display:'flex', gap:14, alignItems:'center',
              position:'relative',
            }}>
              <div style={{
                width:56, height:56, borderRadius:14, background:T5.bg,
                border:`1px solid ${T5.hairline}`, display:'grid', placeItems:'center',
                color:T5.accent, fontFamily:T5.fSerif, fontSize:26,
              }}>{it.g}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'baseline', gap:10}}>
                  <div style={{fontFamily:T5.fSerif, fontWeight:600, fontSize:16, color:T5.ink}}>{it.t}</div>
                  <span style={{
                    fontFamily:T5.fMono, fontSize:9, letterSpacing:'.2em', textTransform:'uppercase',
                    color: it.rar==='nadir' ? T5.accent : T5.muted,
                  }}>{it.rar}</span>
                </div>
                <div style={{color:T5.muted, fontSize:12.5, marginTop:3, fontFamily:T5.fSerif, fontStyle:'italic'}}>{it.d}</div>
              </div>
              {i===1 && <span style={{color:T5.accent, fontSize:18}}>●</span>}
            </div>
          ))}
        </div>

        <button style={{
          width:'100%', padding:'15px', borderRadius:14, border:'none',
          background:T5.ink, color:T5.bg, fontFamily:T5.fBody, fontWeight:700, fontSize:15,
          marginTop:24,
        }}>Çift Dikiş'i al</button>
        <div style={{
          textAlign:'center', marginTop:12, color:T5.muted, fontFamily:T5.fMono,
          fontSize:10, letterSpacing:'.2em', textTransform:'uppercase',
        }}>geç →</div>
      </div>
    </Ph5>
  );
}

// ── 10 · Rogue · Olay düğümü ────────────────────────────────────────────
function RogueEvent() {
  return (
    <Ph5 label="10 · ROGUE · OLAY">
      <SB5 />
      <MiniBar kicker="rogue · olay" title="Karanlık Çeşme" />

      <div style={{padding:'14px 22px 0'}}>
        {/* atmosferik glyph */}
        <div style={{
          height:120, background:T5.panel, border:`1px solid ${T5.hairline}`, borderRadius:18,
          display:'grid', placeItems:'center', marginBottom:18,
          backgroundImage: 'radial-gradient(50% 70% at 50% 50%, rgba(168,155,139,0.10) 0%, transparent 70%)',
        }}>
          <svg width="64" height="80" viewBox="0 0 64 80">
            <path d="M32 8 L32 40" stroke={T5.accent} strokeWidth="1.2"/>
            <ellipse cx="32" cy="48" rx="22" ry="6" fill="none" stroke={T5.accent} strokeWidth="1.2"/>
            <path d="M14 48 Q32 72 50 48" fill="none" stroke={T5.accent} strokeWidth="1.2" strokeOpacity=".5"/>
            <circle cx="32" cy="48" r="2" fill={T5.accent}/>
          </svg>
        </div>

        <p style={{
          fontFamily:T5.fSerif, fontStyle:'italic', fontSize:15, color:T5.inkDim,
          lineHeight:1.55, margin:'0 0 18px', textWrap:'pretty',
        }}>
          ay ışığında titreyen bir çeşme. yüzeyi hareketli; aşağıda kıvrılan bir iplik görüyorsun. eğilirsen elin ıslanır ama bir şeyler de gelir.
        </p>

        {[
          { t:'Eğil ve çek',  s:'1 can riski · bir nadir eşya şansı',     tone:'risk' },
          { t:'İçme suyu doldur', s:'kayıpsız · küçük bir kazanç',         tone:'safe' },
          { t:'Geç', s:'hiçbir şey olmaz.', tone:'pass' },
        ].map(c => (
          <button key={c.t} style={{
            width:'100%', textAlign:'left',
            background: c.tone==='risk' ? T5.panel2 : T5.panel,
            border:`1px solid ${c.tone==='risk' ? T5.bad : T5.hairline}`,
            borderRadius:14, padding:'13px 16px', marginBottom:10, color:T5.ink,
            fontFamily:T5.fBody,
          }}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <span style={{
                fontFamily:T5.fMono, fontSize:11, color: c.tone==='risk'?T5.bad:T5.accent,
                letterSpacing:'.18em', textTransform:'uppercase',
              }}>{c.tone==='risk'?'risk':(c.tone==='safe'?'güven':'geç')}</span>
              <span style={{flex:1}}/>
            </div>
            <div style={{fontFamily:T5.fBody, fontWeight:700, fontSize:15, marginTop:4}}>{c.t}</div>
            <div style={{color:T5.muted, fontSize:12, marginTop:3, fontFamily:T5.fSerif, fontStyle:'italic'}}>{c.s}</div>
          </button>
        ))}
      </div>
    </Ph5>
  );
}

// ── 11 · Rogue · Koşu sonu ──────────────────────────────────────────────
function RogueEnd() {
  return (
    <Ph5 label="11 · ROGUE · KOŞU SONU">
      <SB5 />
      <MiniBar kicker="rogue · koşu #14" title="Karanlık İğne" />

      <div style={{padding:'24px 24px 0', textAlign:'center'}}>
        {/* kırık iplik */}
        <svg width="90" height="80" viewBox="0 0 90 80" style={{margin:'12px auto', display:'block'}}>
          <path d="M10 40 Q25 10 40 35" fill="none" stroke={T5.bad} strokeWidth="2" strokeLinecap="round"/>
          <path d="M50 45 Q65 70 80 40" fill="none" stroke={T5.bad} strokeWidth="2" strokeLinecap="round"/>
          <circle cx="40" cy="35" r="3" fill={T5.bad}/>
          <circle cx="50" cy="45" r="3" fill={T5.bad}/>
        </svg>

        <K5 size={9}>koşu · sonu</K5>
        <D5 size={32} style={{marginTop:10}}>İplik koptu</D5>
        <p style={{
          fontFamily:T5.fSerif, fontStyle:'italic', color:T5.inkDim, fontSize:14.5,
          margin:'10px 0 22px', lineHeight:1.5,
        }}>
          3. katta düştün. ama her<br/>düşüş bir sonraki ipliği güçlendirir.
        </p>

        {/* stats */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18}}>
          {[
            ['EN UZAK KAT', '3'],
            ['ÇÖZÜLEN', '7'],
            ['TOPLAMA SÜRE', '12:48'],
            ['EŞYA',  '3'],
          ].map(([k,v])=>(
            <div key={k} style={{
              background:T5.panel, border:`1px solid ${T5.hairline}`, borderRadius:12, padding:'12px 0',
            }}>
              <div style={{fontFamily:T5.fSerif, fontSize:24, fontWeight:600, color:T5.ink}}>{v}</div>
              <div style={{fontFamily:T5.fMono, fontSize:9, color:T5.muted, letterSpacing:'.2em', marginTop:2}}>{k}</div>
            </div>
          ))}
        </div>

        {/* meta ilerleme — yeni eşya açıldı */}
        <div style={{
          background:T5.panel2, border:`1px solid ${T5.accent}`, borderRadius:14,
          padding:'14px 16px', display:'flex', alignItems:'center', gap:12, textAlign:'left',
          marginBottom:24,
        }}>
          <div style={{
            width:42, height:42, borderRadius:11, background:T5.bg,
            border:`1px solid ${T5.hairline}`, display:'grid', placeItems:'center',
            color:T5.accent, fontFamily:T5.fSerif, fontSize:20,
          }}>◐</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:T5.fMono, fontSize:9, color:T5.accent, letterSpacing:'.2em', textTransform:'uppercase'}}>YENİ · AÇILDI</div>
            <div style={{fontFamily:T5.fSerif, fontWeight:600, fontSize:15, color:T5.ink, marginTop:2}}>Ayışığı — başlangıç eşyası</div>
            <div style={{color:T5.muted, fontSize:11.5, marginTop:2}}>bir sonraki koşuda yanında başla.</div>
          </div>
        </div>

        <button style={{
          width:'100%', padding:'15px', borderRadius:14, border:'none',
          background:T5.ink, color:T5.bg, fontFamily:T5.fBody, fontWeight:700, fontSize:15,
        }}>Yeni Koşu</button>
        <div style={{
          textAlign:'center', marginTop:12, color:T5.muted, fontFamily:T5.fMono,
          fontSize:10, letterSpacing:'.2em', textTransform:'uppercase',
        }}>ana menü →</div>
      </div>
    </Ph5>
  );
}

window.SCREENS_ROGUE = { RogueMap, RogueGame, RogueChest, RogueEvent, RogueEnd };
