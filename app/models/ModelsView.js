'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Window from '@/app/components/Window'
import SubstanceIcon from '@/app/components/SubstanceIcon'
import MdmaModel, { MDMA_META } from './MdmaModel'
import AlcoholModel, { ALCOHOL_META } from './AlcoholModel'

const MODELS = [
  { meta: ALCOHOL_META, Body: AlcoholModel },
  { meta: MDMA_META, Body: MdmaModel },
]

export default function ModelsView({ files }) {
  const params = useSearchParams()
  const router = useRouter()
  const selected = MODELS.find(m => m.meta.id === params.get('model')) ?? null
  const pick = id => router.push(id ? `/models?model=${id}` : '/models', { scroll: false })

  return (
    <main className="xp-desktop">
      <style>{`
        .mdl-sec { margin-top: 24px; padding-top: 18px; min-width: 0; }
        .mdl-sec p { margin: 0 0 10px; line-height: 1.7; }
        .mdl-sec p:last-child { margin-bottom: 0; }
        .mdl-note { font-size: 13px; color: var(--xp-text-dim); margin-top: 8px !important; }
        .mdl-h4 { margin: 14px 0 6px; font-size: 14px; }
        .mdl-h4:first-child { margin-top: 0; }
        .mdl-tbl { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .mdl-scroll { overflow-x: auto; max-width: 100%; }
        .mdl-eq { padding: 10px 14px; font: 13.5px/1.9 ui-monospace, Consolas, monospace; white-space: pre-wrap; }
        .mdl-steps { margin: 0; padding-left: 22px; line-height: 1.7; list-style: decimal; }
        .mdl-steps li { margin-bottom: 8px; }
        .mdl-list { margin: 0; padding-left: 20px; line-height: 1.7; list-style: disc; }
        .mdl-svg { width: 100%; max-width: 760px; height: auto; display: block; margin: 0 auto; }
        .mdl-code summary { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; cursor: pointer; padding: 8px 12px; background: var(--xp-face-2); border: 1px solid var(--xp-etch); border-radius: 3px; font-size: 13.5px; }
        .mdl-code pre { margin: 8px 0 0; padding: 10px 12px; max-height: 480px; overflow: auto; font: 12.5px/1.55 ui-monospace, Consolas, monospace; }
        .mdl-card { display: flex; gap: 14px; align-items: flex-start; width: 100%; text-align: left; padding: 14px; cursor: pointer; }
        .mdl-card .ic { flex: none; width: 68px; height: 68px; display: grid; place-items: center; background: var(--xp-sunken); border: 1px solid; border-color: var(--xp-lo) var(--xp-hi) var(--xp-hi) var(--xp-lo); }
        .mdl-card b { display: block; font-size: 16px; margin-bottom: 4px; }
        .mdl-card .d { display: block; font-size: 13.5px; line-height: 1.55; color: var(--xp-text-dim); font-weight: normal; }
        .mdl-meta { display: grid; grid-template-columns: 150px 1fr; gap: 4px 12px; font-size: 13.5px; margin: 0; }
        .mdl-meta dt { color: var(--xp-accent); }
        .mdl-meta dd { margin: 0; }
        @media (max-width: 760px) { .mdl-meta { grid-template-columns: 1fr; } .mdl-meta dd { margin-bottom: 6px; } }
      `}</style>

      <Window
        title={selected ? `Models: ${selected.meta.name}` : 'Models'}
        icon="chart"
        status={[`${MODELS.length} models`, selected ? `Version ${selected.meta.version}` : 'Click a model for all details']}
      >
        <p className="xp-intro">
          Every calculator on myClearance runs on a model. This page shows each one in full: how it is built, where every number
          comes from, how well it matches published studies, and the actual code, so anyone can check it or rebuild it.
        </p>

        <div role="toolbar" aria-label="Choose a model" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px', marginBottom: '6px', borderTop: '1px solid var(--xp-hi)', borderBottom: '1px solid var(--xp-lo)' }}>
          <button onClick={() => pick(null)} aria-pressed={!selected} style={{ padding: '3px 10px', fontSize: '13px' }}>Overview</button>
          {MODELS.map(({ meta }) => (
            <button key={meta.id} onClick={() => pick(meta.id)} aria-pressed={selected?.meta.id === meta.id} style={{ padding: '3px 10px', fontSize: '13px' }}>
              {meta.name}
            </button>
          ))}
        </div>

        {!selected && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {MODELS.map(({ meta }) => (
              <button key={meta.id} className="mdl-card" onClick={() => pick(meta.id)}>
                <span className="ic" aria-hidden="true"><SubstanceIcon name={meta.id} size={62} /></span>
                <span>
                  <b>{meta.name}</b>
                  <span className="d">{meta.short}</span>
                  <span className="d" style={{ marginTop: '6px' }}>
                    <span style={{ color: meta.statusKind === 'warn' ? '#fcd34d' : '#86efac' }}>{meta.status}</span>
                    <br />{meta.tested}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <>
            <dl className="mdl-meta xp-well" style={{ padding: '10px 14px', margin: '14px 0 12px' }}>
              <dt>Status</dt><dd>{selected.meta.status}</dd>
              <dt>Tested</dt><dd>{selected.meta.tested}</dd>
              <dt>Used on</dt><dd><Link href={selected.meta.usedOn.href}>{selected.meta.usedOn.label}</Link></dd>
              <dt>Version</dt><dd>{selected.meta.version}</dd>
            </dl>
            <selected.Body files={files[selected.meta.id]} />
          </>
        )}

        <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--xp-text-dim)' }}>
          Found a mistake, or want to suggest a better source or model? See the <Link href="/about">About page</Link> for who made this.
        </p>
      </Window>
    </main>
  )
}
