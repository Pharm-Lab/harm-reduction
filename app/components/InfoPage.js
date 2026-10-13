import Link from 'next/link'
import Window from './Window'
import { SUBSTANCES } from '@/lib/substances'
import { SOURCES } from '@/lib/sources'

const SUPPORT = [
  { name: 'Jellinek', url: 'https://www.jellinek.nl' },
  { name: 'Trimbos-instituut', url: 'https://www.trimbos.nl' },
  { name: 'Drugsinfo.nl', url: 'https://www.drugsinfo.nl' },
]

export default function InfoPage({ id, embedded = false }) {
  const s = SUBSTANCES[id]
  const Wrap = embedded ? 'div' : 'main'

  return (
    <Wrap className="xp-desktop" style={embedded ? { paddingTop: 0 } : { maxWidth: '980px' }}>
      <style>{`
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
        .info-group { margin-top: 24px; padding-top: 18px; }
        .info-group p { margin: 0 0 10px; line-height: 1.7; }
        .info-group p:last-child { margin-bottom: 0; }
        .info-combos { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .info-combos b { display: block; color: #fff; margin-bottom: 1px; }
        .info-src { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 13px; }
        .info-src span { color: var(--xp-text-dim); }
        .bar-row { display: grid; grid-template-columns: 190px 1fr 44px; gap: 10px; align-items: center; margin-bottom: 8px; font-size: 13.5px; }
        .bar-track { height: 18px; }
        .bar-fill { height: 100%; box-shadow: inset 0 1px 0 rgba(255,255,255,.35); }
        .cmp { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 14px; }
        @media (max-width: 760px) {
          .info-grid, .cmp { grid-template-columns: 1fr; }
          .bar-row { grid-template-columns: 110px 1fr 40px; }
        }
      `}</style>

      <Window
        title={embedded ? `${s.title}: what else to know` : s.title}
        icon={embedded ? 'info' : `substance:${id}`}
        closeHref={embedded ? null : undefined}
        headingLevel={embedded ? 2 : undefined}
        status={embedded ? ['Information', 'Sources listed below'] : ['Information page', 'PK-PD interactive tool coming soon']}
      >
        <p className="xp-intro">{s.intro}</p>

        {!embedded && <div className="xp-alert xp-alert-info" style={{ marginBottom: '12px' }}>
          <strong>PK-PD interactive tool coming soon.</strong> The interactive model for {s.title.toLowerCase()} is being rebuilt
          so it meets the same standard as the <Link href="/harm-reduction/alcohol">alcohol calculator</Link>.
          Until then, this page covers what is most worth knowing.
        </div>}

        <div className={`xp-alert xp-alert-${s.alert.kind}`}>
          <strong>{s.alert.title}</strong> {s.alert.text}
        </div>

        {s.market && (
          <section className="xp-group info-group">
            <h2 className="xp-legend" style={{ fontWeight: 'bold' }}>What was in &ldquo;3-MMC&rdquo; in {s.market.year}</h2>
            {s.market.rows.map(r => (
              <div className="bar-row" key={r.label}>
                <span>{r.label}</span>
                <div className="bar-track xp-well">
                  <div className="bar-fill" style={{ width: `${r.value}%`, background: r.color }} />
                </div>
                <strong style={{ textAlign: 'right' }}>{r.value}%</strong>
              </div>
            ))}
            <p style={{ color: 'var(--xp-text-dim)', fontSize: '13px', marginTop: '6px' }}>
              {s.market.note} &ldquo;Other or mixed&rdquo; is the remainder after the three named substances.
            </p>
          </section>
        )}

        {s.compounds && (
          <div className="cmp">
            {s.compounds.map(c => (
              <section key={c.name} className="xp-group info-group">
                <h2 className="xp-legend" style={{ fontWeight: 'bold' }}>{c.name}</h2>
                <div className={`xp-alert xp-alert-${c.kind}`} style={{ marginBottom: '10px', fontSize: '13px' }}>
                  <strong>{c.badge}</strong>
                </div>
                <p>{c.text}</p>
              </section>
            ))}
          </div>
        )}

        <div className="info-grid">
          <section className="xp-group info-group">
            <h2 className="xp-legend" style={{ fontWeight: 'bold' }}>Worth knowing</h2>
            {s.facts.map(f => (
              <p key={f.title}><strong>{f.title}.</strong> {f.text}</p>
            ))}
          </section>

          <section className="xp-group info-group">
            <h2 className="xp-legend" style={{ fontWeight: 'bold' }}>Risky combinations</h2>
            <ul className="info-combos">
              {s.combos.map(c => (
                <li key={c.with}><b>{c.with}</b>{c.text}</li>
              ))}
            </ul>
            <p style={{ marginTop: '12px' }}>
              <Link href="/harm-reduction/interactions">Open the interaction checker</Link> to see more combinations and their risk ratings.
            </p>
          </section>
        </div>

        <section className="xp-group info-group">
          <h2 className="xp-legend" style={{ fontWeight: 'bold' }}>Help and testing</h2>
          <p>
            In the Netherlands, testing services connected to DIMS can tell you what is in your drugs.
            For questions about use or worries about yourself or someone else:{' '}
            {SUPPORT.map((x, i) => (
              <span key={x.url}>
                <a href={x.url} target="_blank" rel="noopener noreferrer">{x.name}</a>{i < SUPPORT.length - 1 ? ', ' : '.'}
              </span>
            ))}{' '}
            In an emergency, call 112.
          </p>
        </section>

        <section className="xp-group info-group">
          <h2 className="xp-legend" style={{ fontWeight: 'bold' }}>Sources for this page</h2>
          <ol className="info-src">
            {s.sources.map(sid => {
              const src = SOURCES[sid]
              return (
                <li key={sid}>
                  {src.url
                    ? <a href={src.url} target="_blank" rel="noopener noreferrer">{src.title}</a>
                    : src.title}
                  <span>, {src.publisher}{src.year && src.year !== 'online' ? `, ${src.year}` : ''}</span>
                </li>
              )
            })}
          </ol>
          <p style={{ marginTop: '10px', fontSize: '13px' }}>
            <Link href="/sources">See exactly what each source was used for</Link>.
          </p>
        </section>
      </Window>
    </Wrap>
  )
}
