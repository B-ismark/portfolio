// Schematic illustrations for NDA case studies, where screenshots can't be
// shown. Drawn in the site's own inks (CSS variables), so they follow the
// light/dark theme. Each is a role="img" with the alt text from content.json;
// the SVG text is decorative detail for sighted readers.
//
// Shared viewBox width is 480 so the type stays legible when a diagram
// shrinks to a phone column.

const W = 480;

function Arrow({ id }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 10 5 0 10z" className="dg-fill-ink" />
    </marker>
  );
}

function Skel({ x, y, w, h = 6, cls = 'dg-skel' }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} className={cls} />;
}

/* ---- eight tools into one portal ------------------------------------ */
function Portal() {
  const tiles = Array.from({ length: 8 }, (_, i) => i);
  // deliberately inconsistent chrome: each old tool drew its own frame
  const styles = [
    { rx: 0, head: 'dg-fill-ink' },
    { rx: 8, head: 'dg-fill-accent', dash: '4 3' },
    { rx: 2, head: 'dg-fill-alarm' },
    { rx: 12, head: 'dg-fill-soft' },
    { rx: 0, head: 'dg-fill-soft', dash: '2 2' },
    { rx: 6, head: 'dg-fill-ink' },
    { rx: 0, head: 'dg-fill-accent' },
    { rx: 10, head: 'dg-fill-alarm', dash: '6 3' },
  ];
  return (
    <svg viewBox={`0 0 ${W} 300`}>
      <defs>
        <Arrow id="dg-a-portal" />
      </defs>
      {tiles.map((i) => {
        const x = 10 + (i % 2) * 86;
        const y = 22 + Math.floor(i / 2) * 60;
        const s = styles[i];
        return (
          <g key={i}>
            <rect x={x} y={y} width="76" height="50" rx={s.rx} className="dg-box" strokeDasharray={s.dash} />
            <rect x={x + 6} y={y + 7} width={i % 3 === 0 ? 64 : 40} height="6" rx={s.rx ? 3 : 0} className={s.head} />
            <text x={x + 38} y={y + 36} className="dg-t dg-mid">
              Tool {i + 1}
            </text>
          </g>
        );
      })}
      <text x="93" y="284" className="dg-s dg-mid">8 tools, 8 ways of working</text>

      <line x1="188" y1="140" x2="250" y2="140" className="dg-ink" markerEnd="url(#dg-a-portal)" />

      <rect x="262" y="22" width="208" height="230" className="dg-box" />
      <rect x="262" y="22" width="208" height="28" className="dg-panel" />
      <text x="272" y="41" className="dg-s">One sign-in</text>
      <circle cx="455" cy="36" r="7" className="dg-panel-2" />
      <line x1="326" y1="50" x2="326" y2="252" className="dg-line" />
      {tiles.map((i) => (
        <g key={i}>
          {i === 2 && <rect x="262" y={60 + i * 22} width="64" height="20" className="dg-fill-accent-soft" />}
          <Skel x={272} y={67 + i * 22} w={i === 2 ? 44 : 36 + (i % 3) * 4} cls={i === 2 ? 'dg-fill-accent' : 'dg-skel'} />
        </g>
      ))}
      <Skel x={340} y={66} w={90} h={8} cls="dg-skel-ink" />
      <rect x="340" y="88" width="118" height="60" className="dg-panel" />
      <rect x="340" y="158" width="56" height="40" className="dg-panel" />
      <rect x="402" y="158" width="56" height="40" className="dg-panel" />
      <Skel x={340} y={212} w={100} />
      <Skel x={340} y={226} w={76} />
      <text x="366" y="284" className="dg-s dg-mid">1 portal, 8 modules</text>
    </svg>
  );
}

/* ---- Project → Campaign → Session ------------------------------------ */
function ObjectModel() {
  const boxes = [
    { x: 10, name: 'Project', role: 'owns capacity' },
    { x: 172, name: 'Campaign', role: 'owns execution' },
    { x: 334, name: 'Test session', role: 'primary object', main: true },
  ];
  return (
    <svg viewBox={`0 0 ${W} 228`}>
      {boxes.map((b) => (
        <g key={b.name}>
          <rect x={b.x} y="40" width="136" height="84" className={b.main ? 'dg-box dg-box--main' : 'dg-box'} />
          <text x={b.x + 14} y="74" className="dg-h">{b.name}</text>
          <text x={b.x + 14} y="98" className="dg-t dg-muted">{b.role}</text>
        </g>
      ))}
      {[146, 308].map((x) => (
        <g key={x}>
          <line x1={x} y1="82" x2={x + 26} y2="82" className="dg-ink" />
          {/* crow's foot: one → many */}
          <path d={`M${x + 18} 82 L${x + 26} 74 M${x + 18} 82 L${x + 26} 90`} className="dg-ink" />
          <text x={x + 4} y="74" className="dg-s">1</text>
          <text x={x + 14} y="104" className="dg-s">n</text>
        </g>
      ))}
      <text x="10" y="24" className="dg-s dg-muted">Agreed before any screens</text>

      {[10, 92, 174].map((x, i) => (
        <g key={x} className="dg-retired">
          <rect x={x} y="168" width="72" height="48" className="dg-box" strokeDasharray="4 3" />
          <Skel x={x + 10} y={182} w={44} />
          <Skel x={x + 10} y={196} w={30 + i * 6} />
          <line x1={x - 2} y1="214" x2={x + 74} y2="170" className="dg-strike" />
        </g>
      ))}
      <text x="264" y="190" className="dg-t">Legacy pages that</text>
      <text x="264" y="208" className="dg-t">didn't fit: retired</text>
    </svg>
  );
}

/* ---- deferred filters --------------------------------------------------- */
function DeferredFilters() {
  const staged = ['Region', 'Cluster', 'Service'];
  return (
    <svg viewBox={`0 0 ${W} 300`}>
      <defs>
        <Arrow id="dg-a-filter" />
      </defs>
      <rect x="10" y="10" width="460" height="132" className="dg-box" />
      <text x="20" y="30" className="dg-s dg-muted">Staged until Apply</text>
      {staged.map((s, i) => (
        <g key={s}>
          <rect x={20 + i * 104} y="38" width="96" height="28" className="dg-panel" />
          <text x={30 + i * 104} y="57" className="dg-t">{s}</text>
          <path d={`M${104 + i * 104} 49 l4 5 4 -5`} className="dg-ink" />
          {i < 2 && (
            <path
              d={`M${68 + i * 104} 68 q52 16 104 0`}
              className="dg-ink dg-thin"
              markerEnd="url(#dg-a-filter)"
            />
          )}
        </g>
      ))}
      <text x="20" y="96" className="dg-s dg-muted">Changing one clears the filters after it</text>
      <rect x="338" y="38" width="58" height="28" className="dg-box" />
      <text x="367" y="57" className="dg-t dg-mid">Reset</text>
      <rect x="402" y="38" width="58" height="28" className="dg-fill-accent" />
      <text x="431" y="57" className="dg-t dg-mid dg-on-colour">Apply</text>

      <line x1="10" y1="106" x2="470" y2="106" className="dg-line" strokeDasharray="4 3" />
      <text x="20" y="128" className="dg-s dg-muted">Instant</text>
      <rect x="84" y="114" width="120" height="22" className="dg-panel" />
      <text x="94" y="130" className="dg-s">Environment</text>
      <text x="226" y="130" className="dg-s">Threshold</text>
      <line x1="290" y1="125" x2="400" y2="125" className="dg-line-strong" />
      <circle cx="352" cy="125" r="6" className="dg-fill-accent" />

      <rect x="10" y="160" width="222" height="120" className="dg-box" strokeDasharray="4 3" />
      <text x="121" y="214" className="dg-t dg-mid">Opens empty</text>
      <text x="121" y="234" className="dg-s dg-mid dg-muted">Choose filters, then Apply</text>
      <rect x="248" y="160" width="222" height="120" className="dg-box" />
      <polyline points="262,256 292,236 322,244 352,206 382,218 412,190 452,198" className="dg-chart" />
      <text x="262" y="182" className="dg-s dg-muted">After Apply: one query</text>
    </svg>
  );
}

/* ---- network: three-level drill-down ---------------------------------- */
function DrillDown() {
  const spark = (x, y, seed) => {
    const pts = Array.from({ length: 7 }, (_, k) => `${x + k * 9},${y - ((seed * (k + 3)) % 9)}`);
    return <polyline points={pts.join(' ')} className="dg-spark" />;
  };
  return (
    <svg viewBox={`0 0 ${W} 300`}>
      {['1  Map', '2  Connection', '3  Endpoint'].map((t, i) => (
        <g key={t}>
          <text x={10 + i * 158} y="24" className="dg-h">{t}</text>
          <rect x={10 + i * 158} y="36" width="146" height="204" className="dg-box" />
          {i < 2 && <path d={`M${160 + i * 158} 130 l5 8 -5 8`} className="dg-ink" />}
        </g>
      ))}
      {/* map */}
      {[
        [40, 80], [120, 70], [70, 150], [130, 190], [36, 210],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" className="dg-panel-2" />
      ))}
      <path d="M40 80 L120 70 M40 80 L70 150 M70 150 L36 210 M130 190 L36 210" className="dg-line-strong" />
      <path d="M70 150 L130 190" className="dg-accent-line" />
      <path d="M120 70 L130 190" className="dg-line-strong" />
      {/* connection: endpoint table with sparklines */}
      {Array.from({ length: 8 }, (_, r) => (
        <g key={r}>
          {r === 3 && <rect x="168" y={44 + r * 24} width="146" height="22" className="dg-fill-accent-soft" />}
          <Skel x={178} y={52 + r * 24} w={42} cls={r === 3 ? 'dg-fill-accent' : 'dg-skel'} />
          {spark(240, 62 + r * 24, r + 2)}
        </g>
      ))}
      {/* endpoint detail */}
      <Skel x={336} y={50} w={80} h={8} cls="dg-skel-ink" />
      <polyline points="336,170 356,150 376,160 396,118 416,132 436,100 452,110" className="dg-chart" />
      <line x1="336" y1="180" x2="456" y2="180" className="dg-line" />
      <Skel x={336} y={196} w={110} />
      <Skel x={336} y={212} w={84} />
      <text x="10" y="266" className="dg-s dg-muted">About 10 endpoints per link, 360 in all.</text>
      <text x="10" y="286" className="dg-s dg-muted">At each level: is it the link, the site pair or the cluster?</text>
    </svg>
  );
}

/* ---- period and interval coupled ------------------------------------------ */
function PeriodInterval() {
  const periods = ['1 h', '24 h', '7 d', '30 d'];
  // for a 1-hour period: points = 60 min / interval
  const intervals = [
    ['10 s', 360],
    ['1 min', 60],
    ['5 min', 12],
    ['10 min', 6],
    ['1 h', 1],
  ];
  const ok = (n) => n >= 6 && n <= 144;
  const sx = (n) => 20 + (Math.min(n, 400) / 400) * 420;
  return (
    <svg viewBox={`0 0 ${W} 270`}>
      <text x="10" y="24" className="dg-s dg-muted">Period</text>
      {periods.map((p, i) => (
        <g key={p}>
          <rect x={10 + i * 70} y="32" width="70" height="28" className={i === 0 ? 'dg-fill-accent' : 'dg-box'} />
          <text x={45 + i * 70} y="51" className={`dg-t dg-mid ${i === 0 ? 'dg-on-colour' : ''}`}>{p}</text>
        </g>
      ))}
      <text x="10" y="90" className="dg-s dg-muted">Interval</text>
      {intervals.map(([label, n], i) => (
        <g key={label}>
          <rect
            x={10 + i * 92}
            y="98"
            width="84"
            height="40"
            className={ok(n) ? 'dg-box' : 'dg-box dg-off'}
            strokeDasharray={ok(n) ? undefined : '4 3'}
          />
          <text x={52 + i * 92} y="115" className={`dg-t dg-mid ${ok(n) ? '' : 'dg-muted'}`}>{label}</text>
          <text x={52 + i * 92} y="130" className="dg-s dg-mid dg-muted">{n} {n === 1 ? 'point' : 'points'}</text>
        </g>
      ))}
      {/* number line */}
      <line x1="20" y1="200" x2="440" y2="200" className="dg-line-strong" />
      <rect x={sx(6)} y="192" width={sx(144) - sx(6)} height="16" className="dg-fill-accent-soft" />
      {[6, 144].map((n) => (
        <g key={n}>
          <line x1={sx(n)} y1="188" x2={sx(n)} y2="212" className="dg-ink" />
          <text x={sx(n)} y="230" className="dg-s dg-mid">{n}</text>
        </g>
      ))}
      <text x={(sx(6) + sx(144)) / 2} y="182" className="dg-s dg-mid">points per view</text>
      <path d="M440 200 l-8 -5 v10z" className="dg-fill-ink" />
      <text x="440" y="230" className="dg-s dg-mid dg-muted">old: 1,000+</text>
      <text x="10" y="258" className="dg-s dg-muted">Shown for a 1-hour period. Dashed intervals are disabled.</text>
    </svg>
  );
}

/* ---- test creation: modal → full page ------------------------------------ */
function TestCreation() {
  return (
    <svg viewBox={`0 0 ${W} 280`}>
      <text x="10" y="24" className="dg-h">Before: modal</text>
      <rect x="10" y="36" width="216" height="210" className="dg-box" />
      <rect x="10" y="36" width="216" height="210" className="dg-scrim" />
      <rect x="40" y="64" width="156" height="154" className="dg-box dg-solid" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x="52" y={78 + i * 18} width={110 - (i % 3) * 14} height="10" className="dg-panel" />
      ))}
      <rect x="186" y="76" width="4" height="40" rx="2" className="dg-skel-ink" />
      <text x="118" y="266" className="dg-s dg-mid dg-muted">Long form in a small box</text>

      <text x="254" y="24" className="dg-h">After: full page</text>
      <rect x="254" y="36" width="216" height="210" className="dg-box" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Skel x={266 + i * 50} y={52} w={36} cls={i === 0 ? 'dg-fill-accent' : 'dg-skel'} />
          {i === 0 && <rect x="266" y="64" width="36" height="2" className="dg-fill-accent" />}
        </g>
      ))}
      <line x1="254" y1="68" x2="470" y2="68" className="dg-line" />
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <Skel x={266} y={84 + i * 32} w={60} />
          <rect x="266" y={94 + i * 32} width="190" height="14" className="dg-panel" />
        </g>
      ))}
      <rect x="254" y="214" width="216" height="32" className="dg-panel" />
      <rect x="346" y="221" width="50" height="18" className="dg-box" />
      <rect x="402" y="221" width="58" height="18" className="dg-fill-accent" />
      <text x="362" y="266" className="dg-s dg-mid dg-muted">Groups as tabs, actions stay at the bottom</text>
    </svg>
  );
}

const DIAGRAMS = {
  portal: Portal,
  'object-model': ObjectModel,
  'deferred-filters': DeferredFilters,
  'drill-down': DrillDown,
  'period-interval': PeriodInterval,
  'test-creation': TestCreation,
};

export default function Diagram({ id, alt }) {
  const Svg = DIAGRAMS[id];
  if (!Svg) return null;
  return (
    <div className="diagram" role="img" aria-label={alt}>
      <Svg />
    </div>
  );
}
