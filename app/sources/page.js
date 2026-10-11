'use client'
import { useState } from 'react'
import Link from 'next/link'
import Window from '@/app/components/Window'
import { SOURCES, SOURCES_BY_PAGE } from '@/lib/sources'

function formatChecked(d) {
  if (!d) return null
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Sources() {
  const [selected, setSelected] = useState(null)
  const shown = selected ? SOURCES_BY_PAGE.filter(g => g.page === selected) : SOURCES_BY_PAGE
  const uniqueCount = new Set(shown.flatMap(g => g.ids)).size

  return (
    <main className="xp-desktop">
      <style>{`
        .src-list { list-style: none; margin: 0; padding: 0; }
        .src-item { padding: 12px 14px; border-top: 1px solid #2a2636; }
        .src-item:first-child { border-top: 0; }
        .src-item h3 { margin: 0 0 2px; font-size: 14.5px; line-height: 1.45; }
        .src-meta { margin: 0 0 8px; font-size: 12.5px; color: var(--xp-text-dim); }
        .src-row { display: grid; grid-template-columns: 150px 1fr; gap: 2px 12px; font-size: 13.5px; line-height: 1.6; }
        .src-row dt { color: var(--xp-accent); }
        .src-row dd { margin: 0 0 4px; }
        @media (max-width: 760px) { .src-row { grid-template-columns: 1fr; } .src-row dd { margin-bottom: 8px; } }
      `}</style>

      <Window
        title="Sources"
        icon="folder"
        status={[`${uniqueCount} sources`, selected ?? 'All pages']}
      >
        <p className="xp-intro">
          Everything on myClearance should be checkable. For each page, this lists every source, what
          information came from it, and how the site uses it. Links open the original.
        </p>

        <div role="toolbar" aria-label="Filter by page" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px', marginBottom: '6px', borderTop: '1px solid var(--xp-hi)', borderBottom: '1px solid var(--xp-lo)' }}>
          <button onClick={() => setSelected(null)} aria-pressed={selected === null} style={{ padding: '3px 10px', fontSize: '13px' }}>
            All pages
          </button>
          {SOURCES_BY_PAGE.map(g => (
            <button key={g.page} onClick={() => setSelected(selected === g.page ? null : g.page)} aria-pressed={selected === g.page} style={{ padding: '3px 10px', fontSize: '13px' }}>
              {g.page}
            </button>
          ))}
        </div>

        {shown.map(group => (
          <section key={group.page} className="xp-group" style={{ marginTop: '26px', paddingTop: '18px' }}>
            <h2 className="xp-legend" style={{ fontWeight: 'bold' }}>
              <Link href={group.href} style={{ color: 'inherit' }}>{group.page}</Link>
            </h2>
            <ol className="src-list xp-well">
              {group.ids.map(id => {
                const s = SOURCES[id]
                const checked = formatChecked(s.checked)
                return (
                  <li key={id} className="src-item">
                    <h3>
                      {s.url
                        ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
                        : s.title}
                    </h3>
                    <p className="src-meta">
                      {s.publisher}{s.year && s.year !== 'online' && s.year !== 'online table' ? `, ${s.year}` : ''}
                      {checked ? `. Checked ${checked}.` : '. No online version.'}
                    </p>
                    <dl className="src-row">
                      <dt>What came from it</dt>
                      <dd>{s.took}</dd>
                      <dt>How it is used</dt>
                      <dd>{s.used}</dd>
                    </dl>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}

        <div className="xp-alert xp-alert-info" style={{ marginTop: '22px' }}>
          <strong>Found something wrong or outdated?</strong> Drug markets and laws change quickly. Each source shows
          when it was last checked. The calculations themselves are done by fixed formulas in your browser, not by AI.
        </div>
      </Window>
    </main>
  )
}
