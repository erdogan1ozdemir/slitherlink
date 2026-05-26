// Sessiz İplik — tasarım sistemi sabitleri ve paylaşılan parçalar
const T = {
  // Renk
  bg:       '#0a0a0c',
  bgWarm:   '#0d0c0e',
  panel:    '#15151a',
  panel2:   '#1d1d23',
  hairline: 'rgba(237,234,227,0.08)',
  hairline2:'rgba(237,234,227,0.14)',
  ink:      '#EDEAE3',
  inkDim:   'rgba(237,234,227,0.62)',
  muted:    '#7a7a82',
  faint:    '#3a3a42',
  accent:   '#A89B8B',   // taupe
  accentDim:'rgba(168,155,139,0.20)',
  bad:      '#C97A6F',
  good:     '#8FA39A',
  // Tipografi
  fSerif:   '"Fraunces", "Cormorant Garamond", Georgia, serif',
  fBody:    '"Karla", -apple-system, system-ui, sans-serif',
  fMono:    '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  // Geometri
  r: { sm:8, md:12, lg:16, xl:20, xxl:24 },
};

// Küçük etiket (kategorinin başı): büyük letter-spacing'li uppercase
function Kicker({ children, color = T.muted, size = 10, style = {} }) {
  return (
    <div style={{
      fontFamily: T.fMono, fontSize: size, fontWeight: 500,
      letterSpacing: '0.32em', textTransform: 'uppercase', color, ...style,
    }}>{children}</div>
  );
}

// Hairline ayraç
function Rule({ color = T.hairline, style = {} }) {
  return <div style={{ height: 1, background: color, ...style }} />;
}

// Tipografik H1 / başlık
function Display({ children, size = 44, style = {} }) {
  return (
    <h1 style={{
      fontFamily: T.fSerif, fontWeight: 500, fontSize: size,
      lineHeight: 1.0, letterSpacing: '-0.02em', margin: 0,
      color: T.ink, ...style,
    }}>{children}</h1>
  );
}

// Sıcak gri "ipek" doku — panellere bırakılan çok ince noise
const noiseStyle = {
  backgroundImage:
    'radial-gradient(120% 80% at 50% -10%, rgba(168,155,139,0.06) 0%, transparent 60%)',
};

// Statik üst durum çubuğu (saat 9:41) — biz IOSDevice'ı kullanmıyoruz
// (mat dark frame için kendi compact bezel'imizi çizeceğiz)
function StatusBar({ time = '9:41' }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'18px 28px 8px', color:T.ink, fontFamily:'-apple-system,SF Pro,system-ui',
      fontSize:14, fontWeight:600, position:'relative', zIndex:5,
    }}>
      <span>{time}</span>
      <div style={{display:'flex', gap:6, alignItems:'center', opacity:.9}}>
        <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0" y="6" width="2.5" height="4" rx=".5" fill={T.ink}/><rect x="4" y="4" width="2.5" height="6" rx=".5" fill={T.ink}/><rect x="8" y="2" width="2.5" height="8" rx=".5" fill={T.ink}/><rect x="12" y="0" width="2.5" height="10" rx=".5" fill={T.ink}/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="19" height="10" rx="2.8" stroke={T.ink} strokeOpacity=".5" fill="none"/><rect x="2" y="2" width="16" height="7" rx="1.5" fill={T.ink}/></svg>
      </div>
    </div>
  );
}

// iPhone 11 bezel'i — siyah, kalın, "vault" hissi.
// Çentik var (iPhone 11 dynamic island'lı değil, gerçek çentik).
function Phone({ children, width = 414, height = 896, label }) {
  return (
    <div style={{
      width, height, borderRadius: 54, background: '#000',
      padding: 12, boxShadow: '0 40px 90px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(0,0,0,1)',
      position: 'relative', fontFamily: T.fBody,
    }}>
      <div style={{
        width:'100%', height:'100%', borderRadius:44, overflow:'hidden',
        background: T.bg, position:'relative',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        {/* iPhone 11 notch */}
        <div style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          width: 210, height: 28, background:'#000', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, zIndex: 60,
        }} />
        {children}
        {/* home indicator */}
        <div style={{
          position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)',
          width:134, height:5, borderRadius:99, background:'rgba(237,234,227,0.55)', zIndex:60,
        }} />
      </div>
      {label && (
        <div style={{
          position:'absolute', top: -28, left: 4, color: 'rgba(60,50,40,0.6)',
          fontFamily: T.fMono, fontSize: 11, letterSpacing: '0.18em', textTransform:'uppercase',
        }}>{label}</div>
      )}
    </div>
  );
}

// Paylaşılan SVG bulmaca tahtası — durum prop'larına göre çizilir
// edges: { h: number[R+1][C], v: number[R][C+1] }  (0=boş, 1=çizgi, 2=çarpı)
// errors: [[r,c], ...]   done: [[r,c], ...]
function Board({ R, C, clues, edges, errors = [], done = [], size = 320, pad = 24, drawDot = true }) {
  const S = Math.floor((size - pad*2) / Math.max(R,C));
  const W = C*S + pad*2, H = R*S + pad*2;
  const dx = c => pad + c*S, dy = r => pad + r*S;
  const eSet = new Set(errors.map(([r,c]) => `${r},${c}`));
  const dSet = new Set(done.map(([r,c]) => `${r},${c}`));

  const segs = [];
  // edges horizontal
  for (let r=0;r<=R;r++) for (let c=0;c<C;c++) {
    const s = edges.h[r]?.[c] || 0;
    if (s === 1) segs.push(<line key={`h${r}-${c}`} x1={dx(c)} y1={dy(r)} x2={dx(c+1)} y2={dy(r)} stroke={T.ink} strokeWidth={5.5} strokeLinecap="round" />);
    else if (s === 2) {
      const mx=(dx(c)+dx(c+1))/2, my=dy(r), q=S*0.13;
      segs.push(<g key={`hx${r}-${c}`} stroke={T.muted} strokeWidth={2} strokeLinecap="round" opacity=".55"><line x1={mx-q} y1={my-q} x2={mx+q} y2={my+q}/><line x1={mx-q} y1={my+q} x2={mx+q} y2={my-q}/></g>);
    }
  }
  // edges vertical
  for (let r=0;r<R;r++) for (let c=0;c<=C;c++) {
    const s = edges.v[r]?.[c] || 0;
    if (s === 1) segs.push(<line key={`v${r}-${c}`} x1={dx(c)} y1={dy(r)} x2={dx(c)} y2={dy(r+1)} stroke={T.ink} strokeWidth={5.5} strokeLinecap="round" />);
    else if (s === 2) {
      const mx=dx(c), my=(dy(r)+dy(r+1))/2, q=S*0.13;
      segs.push(<g key={`vx${r}-${c}`} stroke={T.muted} strokeWidth={2} strokeLinecap="round" opacity=".55"><line x1={mx-q} y1={my-q} x2={mx+q} y2={my+q}/><line x1={mx-q} y1={my+q} x2={mx+q} y2={my-q}/></g>);
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
      {/* clue numbers */}
      {clues.flatMap((row, r) => row.map((n, c) => {
        if (n < 0) return null;
        const key = `${r},${c}`;
        const err = eSet.has(key), faded = dSet.has(key);
        const fill = err ? T.bad : T.ink;
        const opacity = faded && !err ? 0.22 : 1;
        return (
          <text key={`c${r}-${c}`} x={dx(c)+S/2} y={dy(r)+S/2+1}
            textAnchor="middle" dominantBaseline="central"
            fontFamily={T.fBody} fontWeight="700" fontSize={S*0.42}
            fill={fill} fillOpacity={opacity}
            style={{fontVariantNumeric:'tabular-nums'}}>{n}</text>
        );
      }))}
      {/* dots */}
      {drawDot && Array.from({length:R+1}).flatMap((_,r) =>
        Array.from({length:C+1}).map((__,c) => (
          <circle key={`d${r}-${c}`} cx={dx(c)} cy={dy(r)} r={S*0.06} fill={T.faint} />
        ))
      )}
      {segs}
    </svg>
  );
}

window.SI = { T, Kicker, Rule, Display, noiseStyle, StatusBar, Phone, Board };
