'use client'
// Shared building blocks for the Models page.

export const ORIGINS = {
  Published: { color: '#93c5fd', border: '#2f5a85', text: 'Taken directly from a published study' },
  Fitted: { color: '#fcd34d', border: '#7a5a12', text: 'Estimated by us so the model matches published measurements' },
  Chosen: { color: '#c4b5fd', border: '#4c3d8a', text: 'A modelling choice, with the reason given' },
  Constant: { color: '#86efac', border: '#2c6b3f', text: 'A physical constant or unit conversion' },
}

export function OriginTag({ origin }) {
  const o = ORIGINS[origin] ?? ORIGINS.Chosen
  return (
    <span style={{ display: 'inline-block', padding: '0 6px', borderRadius: '2px', fontSize: '11.5px', whiteSpace: 'nowrap', color: o.color, border: `1px solid ${o.border}` }}>
      {origin}
    </span>
  )
}

export function OriginLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontSize: '12.5px', color: 'var(--xp-text-dim)', marginBottom: '10px' }}>
      {Object.entries(ORIGINS).map(([k, v]) => (
        <span key={k}><OriginTag origin={k} /> {v.text}</span>
      ))}
    </div>
  )
}

export function Section({ n, title, children }) {
  return (
    <section className="xp-group mdl-sec">
      <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>{n ? `${n}. ` : ''}{title}</h3>
      {children}
    </section>
  )
}

const th = { textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid var(--xp-etch)', color: 'var(--xp-text-dim)', fontWeight: 'normal', fontSize: '12.5px', whiteSpace: 'nowrap' }
const td = { padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }

export function ParamTable({ rows }) {
  return (
    <div className="mdl-scroll">
      <table className="mdl-tbl">
        <thead><tr><th style={th}>Parameter</th><th style={th}>Value</th><th style={th}>What it does</th><th style={th}>Origin</th><th style={th}>Source or reason</th></tr></thead>
        <tbody>
          {rows.map(p => (
            <tr key={p.sym}>
              <td style={{ ...td, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{p.sym}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>{p.val}</td>
              <td style={td}>{p.what}</td>
              <td style={td}><OriginTag origin={p.origin} /></td>
              <td style={{ ...td, color: 'var(--xp-text-dim)' }}>{p.src}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CompareTable({ rows }) {
  return (
    <div className="mdl-scroll">
      <table className="mdl-tbl">
        <thead><tr><th style={th}>Measurement</th><th style={th}>Study</th><th style={th}>Model</th><th style={th}>Source</th></tr></thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.what}>
              <td style={td}>{c.what}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>{c.target}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>{c.model}</td>
              <td style={{ ...td, color: 'var(--xp-text-dim)' }}>{c.src}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Equations({ children }) {
  return <div className="mdl-eq xp-well">{children}</div>
}

function download(name, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

// Shows the real source files of the site, read at build time, so what you see is what runs.
export function CodeFiles({ files }) {
  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      {files.map(f => (
        <details key={f.path} className="mdl-code">
          <summary>
            <span><strong>{f.path}</strong> <span style={{ color: 'var(--xp-text-dim)' }}>{f.note}</span></span>
            <span style={{ color: 'var(--xp-text-dim)', fontSize: '12px' }}>{f.text.split('\n').length} lines</span>
          </summary>
          <div style={{ display: 'flex', gap: '6px', padding: '8px 10px 0' }}>
            <button onClick={() => download(f.path.split('/').pop(), f.text)} style={{ padding: '3px 10px', fontSize: '12.5px' }}>Download</button>
            <button onClick={() => navigator.clipboard?.writeText(f.text)} style={{ padding: '3px 10px', fontSize: '12.5px' }}>Copy</button>
          </div>
          <pre className="xp-well">{f.text}</pre>
        </details>
      ))}
    </div>
  )
}

export function Steps({ items }) {
  return (
    <ol className="mdl-steps">
      {items.map(([title, body]) => <li key={title}><strong>{title}.</strong> {body}</li>)}
    </ol>
  )
}

export function Bullets({ items }) {
  return <ul className="mdl-list">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
}

// Box used in the schematics.
export function SBox({ x, y, w, title, sub, c }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={56} rx={6} fill={c.fill} stroke={c.stroke} strokeWidth={1} />
      <text x={x + w / 2} y={y + 21} textAnchor="middle" fontSize={14} fontWeight="bold" fill={c.text}>{title}</text>
      <text x={x + w / 2} y={y + 41} textAnchor="middle" fontSize={12} fill={c.sub}>{sub}</text>
    </g>
  )
}

export const SC = {
  pk: { fill: '#16324a', stroke: '#4f9be0', text: '#dbeafe', sub: '#93c5fd' },
  pd: { fill: '#2b2350', stroke: '#a78bfa', text: '#ede9fe', sub: '#c4b5fd' },
  gray: { fill: '#23252f', stroke: '#6d7494', text: '#e5e7f0', sub: '#9aa1bf' },
  arrow: '#9aa1bf',
}

export function ArrowDefs({ id }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M2 1L8 5L2 9" fill="none" stroke={SC.arrow} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </marker>
    </defs>
  )
}
