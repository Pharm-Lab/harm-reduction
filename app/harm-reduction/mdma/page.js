'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import Window from '@/app/components/Window'
import InfoPage from '@/app/components/InfoPage'
import { simulateMDMA, mdmaMetrics, BAND_LOW, BAND_HIGH } from '@/lib/mdmamath'

let nextId = 1
const makeDose = (timeh = 0, mg = 100) => ({ id: nextId++, timeh, mg })

function fmtH(h) {
  if (h == null) return '-'
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60)
  if (mm === 60) return `${hh + 1}h 00m`
  return hh === 0 ? `${mm} min` : `${hh}h ${String(mm).padStart(2, '0')}m`
}

const BLUE = '#3b82f6'
const PURPLE = '#a78bfa'

function Graph({ tab, pts, doses, m, show }) {
  const W = 760, H = 360
  const pad = { top: 26, right: 22, bottom: 58, left: 62 }
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom
  const vis = pts.filter(p => p.t <= show)
  const xS = t => pad.left + (t / show) * cW

  const isPK = tab === 'pk'
  const maxC = Math.max(...pts.map(p => p.c), 1) * BAND_HIGH
  const cStep = [25, 50, 100, 200, 250, 500].find(s => maxC / s <= 7) ?? 1000
  const yMax = isPK ? Math.ceil(maxC / cStep) * cStep : 100
  const yStep = isPK ? cStep : 20
  const yS = v => pad.top + cH - (Math.min(v, yMax) / yMax) * cH
  const yTicks = Array.from({ length: Math.round(yMax / yStep) + 1 }, (_, i) => i * yStep)
  const xStep = [1, 2, 3, 4, 6, 8, 12].find(s => show / s <= 12) ?? 24
  const xTicks = Array.from({ length: Math.floor(show / xStep) + 1 }, (_, i) => i * xStep)

  const line = (f) => vis.map((p, i) => `${i ? 'L' : 'M'}${xS(p.t).toFixed(1)},${yS(f(p)).toFixed(1)}`).join('')
  const band = vis.length
    ? line(p => p.c * BAND_HIGH) + [...vis].reverse().map(p => `L${xS(p.t).toFixed(1)},${yS(p.c * BAND_LOW).toFixed(1)}`).join('') + 'Z'
    : ''
  const peakC = m?.peakC || 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="xp-well" style={{ width: '100%', height: 'auto', display: 'block', background: '#11141f' }}
      role="img" aria-label={isPK ? 'MDMA blood level over time' : 'Felt effect of MDMA over time'}>
      {yTicks.map(v => (
        <g key={'y' + v}>
          <line x1={pad.left} x2={pad.left + cW} y1={yS(v)} y2={yS(v)} stroke="rgba(255,255,255,0.07)" />
          <text x={pad.left - 6} y={yS(v) + 4} textAnchor="end" fontSize="11" fill="#9aa1bf">{isPK ? v : v + '%'}</text>
        </g>
      ))}
      {xTicks.map(h => (
        <g key={'x' + h}>
          <line x1={xS(h)} x2={xS(h)} y1={pad.top} y2={pad.top + cH} stroke="rgba(255,255,255,0.07)" />
          <text x={xS(h)} y={pad.top + cH + 18} textAnchor="middle" fontSize="11" fill="#9aa1bf">{h}h</text>
        </g>
      ))}
      <rect x={pad.left} y={pad.top} width={cW} height={cH} fill="none" stroke="#4a5274" />
      <text transform={`translate(16 ${pad.top + cH / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill="#9aa1bf">
        {isPK ? 'MDMA in blood (ng/mL)' : 'Felt effect (% of maximum)'}
      </text>
      <text x={pad.left + cW / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#9aa1bf">Time after first dose (h)</text>

      {isPK && <path d={band} fill={BLUE} opacity="0.15" />}
      {!isPK && <path d={line(p => (p.c / peakC) * 100)} fill="none" stroke={BLUE} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" />}

      {m?.fadeTime != null && m.fadeTime <= show && (
        <g>
          <line x1={xS(m.fadeTime)} x2={xS(m.fadeTime)} y1={pad.top} y2={pad.top + cH} stroke="#f59e0b" strokeDasharray="4 3" />
          <text x={xS(m.fadeTime) + 5} y={pad.top + 14} fontSize="10.5" fill="#f59e0b">Effect mostly gone</text>
        </g>
      )}

      <path d={isPK ? line(p => p.c) : line(p => p.e)} fill="none" stroke={isPK ? BLUE : PURPLE} strokeWidth="2.6" strokeLinejoin="round" />

      {m && isPK && m.peakCTime <= show && (
        <g>
          <circle cx={xS(m.peakCTime)} cy={yS(m.peakC)} r="5" fill="#ef4444" />
          <text x={xS(m.peakCTime)} y={yS(m.peakC) - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#e8ebf7">Peak {m.peakC} ng/mL</text>
        </g>
      )}
      {m && !isPK && m.peakETime <= show && (
        <g>
          <circle cx={xS(m.peakETime)} cy={yS(m.peakE)} r="5" fill="#ef4444" />
          <text x={xS(m.peakETime)} y={yS(m.peakE) - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#e8ebf7">Peak {m.peakE}%</text>
        </g>
      )}

      {doses.filter(d => d.timeh <= show).map(d => (
        <g key={d.id} transform={`translate(${xS(d.timeh)} ${pad.top + cH + 34})`}>
          <ellipse rx="8" ry="5" fill="#c9b8ff" stroke="#6a4ee6" />
          <line x1="0" x2="0" y1="-5" y2="5" stroke="#6a4ee6" />
          <text y="17" textAnchor="middle" fontSize="9.5" fill="#9aa1bf">{d.mg} mg</text>
        </g>
      ))}
    </svg>
  )
}

export default function MDMACalculator() {
  const [doses, setDoses] = useState([makeDose(0, 100)])
  const [tab, setTab] = useState('pk')
  const [show, setShow] = useState(24)

  const tEnd = useMemo(() => Math.min(72, Math.max(24, Math.ceil(Math.max(...doses.map(d => d.timeh)) + 30))), [doses])
  const sim = useMemo(() => simulateMDMA({ doses, tEnd }), [doses, tEnd])
  const m = useMemo(() => mdmaMetrics(sim.pts, sim.minEnz), [sim])
  const showH = Math.min(show, tEnd)

  const total = doses.reduce((s, d) => s + d.mg, 0)
  const bigDose = doses.some(d => d.mg >= 160)
  const redosed = doses.length > 1

  const upd = (id, patch) => setDoses(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d))
  const add = () => setDoses(prev => [...prev, makeDose(Math.min(12, Math.max(...prev.map(d => d.timeh)) + 2), 50)])
  const remove = id => setDoses(prev => prev.filter(d => d.id !== id))

  const label = { fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }

  return (
    <>
      <main className="xp-desktop">
        <style>{`
          .md-grid { display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; }
          .md-tabs { display: flex; gap: 2px; margin-bottom: -1px; position: relative; z-index: 1; }
          .md-tab { padding: 6px 16px; font-size: 13.5px; border-radius: 3px 3px 0 0; }
          .md-tab[aria-selected="true"] { font-weight: bold; color: #fff; background: var(--xp-face-2); border-bottom-color: var(--xp-face-2); }
          .md-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .md-stat { background: var(--xp-face-2); border: 1px solid var(--xp-etch); border-radius: 3px; padding: 10px 12px; }
          .md-stat .l { font-size: 12.5px; color: var(--xp-text-dim); margin-bottom: 2px; }
          .md-stat .v { font-size: 17px; font-weight: 700; color: #f0f4ff; }
          .md-stat .s { font-size: 11.5px; color: rgba(240,244,255,0.45); }
          .md-key { display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 12.5px; color: var(--xp-text-dim); }
          .md-key i { display: inline-block; width: 18px; vertical-align: middle; margin-right: 6px; }
          .edu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
          .edu { margin-top: 24px; padding-top: 18px; }
          .edu p { margin: 0 0 10px; line-height: 1.7; }
          .edu p:last-child { margin-bottom: 0; }
          .edu ul { margin: 0 0 10px; padding-left: 20px; line-height: 1.7; }
          .edu .calc { padding: 8px 12px; margin: 4px 0 10px; font-size: 13.5px; }
          @media (max-width: 900px) { .md-grid, .edu-grid { grid-template-columns: 1fr; } }
        `}</style>

        <Window title="MDMA calculator" icon="substance:mdma" closeHref="/harm-reduction"
          status={['PK-PD model', 'Runs on your device. Nothing you enter is sent anywhere.']}>
          <p className="xp-intro">
            Two sides of the same night. The <strong>blood level</strong> tab shows how much MDMA is in your body over time
            (pharmacokinetics). The <strong>effect</strong> tab shows how strongly you feel it (pharmacodynamics). The two do not
            line up: the feeling peaks and fades hours before the drug is gone. Scroll down to see why.
          </p>

          <div className="xp-alert xp-alert-warn" style={{ marginBottom: '1.25rem', fontSize: '13.5px' }}>
            <strong>This is not dosing advice.</strong> The model shows an average person from lab studies. You only know how
            much MDMA is in a pill if it has been tested, and pills vary a lot. The starting value of 100 mg is the dose used
            in several of the studies behind this model.
          </div>

          <div className="xp-alert xp-alert-info" style={{ marginBottom: '1.25rem', fontSize: '13.5px' }}>
            <strong>A combined model, built for this site.</strong> It joins published values from several studies with values we
            fitted ourselves, and it has not been peer reviewed. <Link href="/models?model=mdma">See exactly how it is built</Link> on the Models page, with every parameter, its source and the code.
          </div>

          <div className="md-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="xp-group">
                <p className="xp-legend">Doses</p>
                {doses.map((d, i) => (
                  <div key={d.id} style={{ background: 'var(--xp-face-2)', border: '1px solid var(--xp-etch)', borderRadius: '3px', padding: '10px 12px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'rgba(240,244,255,0.75)' }}>Dose {i + 1}</span>
                      {doses.length > 1 && (
                        <button onClick={() => remove(d.id)} aria-label={`Remove dose ${i + 1}`} style={{ fontSize: '18px', lineHeight: 1, padding: 0 }}>&times;</button>
                      )}
                    </div>
                    <label style={label} htmlFor={`mg-${d.id}`}>Amount of MDMA (mg)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <input id={`mg-${d.id}`} type="number" min={10} max={300} step={5} value={d.mg}
                        onChange={e => { const v = parseInt(e.target.value); if (v >= 10 && v <= 300) upd(d.id, { mg: v }) }}
                        style={{ width: '70px', padding: '4px 8px', textAlign: 'right', fontSize: '15.5px', fontWeight: 600 }} />
                      <input type="range" min={10} max={300} step={5} value={d.mg} aria-label={`Amount of dose ${i + 1}`}
                        onChange={e => upd(d.id, { mg: parseInt(e.target.value) })} style={{ flex: 1 }} />
                    </div>
                    <label style={label}>Time: {d.timeh === 0 ? 'Start (t=0)' : `+${fmtH(d.timeh)} after start`}</label>
                    <input type="range" min={0} max={12} step={0.25} value={d.timeh} aria-label={`Time of dose ${i + 1}`}
                      onChange={e => upd(d.id, { timeh: parseFloat(e.target.value) })} style={{ width: '100%' }} />
                  </div>
                ))}
                {doses.length < 6 && (
                  <button onClick={add} style={{ width: '100%', padding: '8px', fontSize: '14.5px' }}>+ Add another dose</button>
                )}
                <div className="xp-well" style={{ marginTop: '10px', padding: '8px 12px', fontSize: '13.5px' }}>
                  Total: <strong>{total} mg</strong> in {doses.length} {doses.length === 1 ? 'dose' : 'doses'}
                </div>
              </div>

              <div className="xp-group" style={{ fontSize: '13px', color: 'var(--xp-text-dim)', padding: '12px 14px', lineHeight: 1.6 }}>
                The model has no body weight or sex input, because the study it is based on found no clear effect of these on
                its own. In lab studies women did reach about 29% higher blood levels than men at the same dose and reported
                more unpleasant effects.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
              <div>
                <div className="md-tabs" role="tablist" aria-label="Graph">
                  <button role="tab" className="md-tab" aria-selected={tab === 'pk'} onClick={() => setTab('pk')}>Blood level (PK)</button>
                  <button role="tab" className="md-tab" aria-selected={tab === 'pd'} onClick={() => setTab('pd')}>Effect (PD)</button>
                </div>
                <Graph tab={tab} pts={sim.pts} doses={doses} m={m} show={showH} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)' }}>Show</span>
                <input type="range" min={6} max={tEnd} step={1} value={showH} onChange={e => setShow(parseInt(e.target.value))} style={{ flex: 1 }} aria-label="Hours shown" />
                <span style={{ fontWeight: 600, minWidth: '32px' }}>{showH}h</span>
              </div>

              <div className="md-key">
                {tab === 'pk' ? <>
                  <span><i style={{ height: '3px', background: BLUE }} />Average person</span>
                  <span><i style={{ height: '10px', background: 'rgba(59,130,246,0.3)' }} />Shaded: range of peak levels measured between people at the same dose</span>
                </> : <>
                  <span><i style={{ height: '3px', background: PURPLE }} />How strongly it is felt</span>
                  <span><i style={{ height: '0', borderTop: `2px dashed ${BLUE}` }} />Blood level, scaled to the same height for comparison</span>
                </>}
                <span><i style={{ height: '0', borderTop: '2px dashed #f59e0b' }} />Effect below 10% of its peak</span>
              </div>

              {m && (
                <div className="md-stats">
                  <div className="md-stat"><div className="l">Peak blood level</div><div className="v">{m.peakC} ng/mL</div><div className="s">at {fmtH(m.peakCTime)}</div></div>
                  <div className="md-stat"><div className="l">Strongest effect</div><div className="v" style={{ color: PURPLE }}>{fmtH(m.peakETime)}</div><div className="s">after first dose, felt from {fmtH(m.onsetTime)}</div></div>
                  <div className="md-stat"><div className="l">Effect mostly gone</div><div className="v">{m.fadeTime != null ? fmtH(m.fadeTime) : `> ${tEnd}h`}</div><div className="s">{m.fadeLevelPct != null ? `${m.fadeLevelPct}% of the peak blood level is still there` : ''}</div></div>
                  <div className="md-stat"><div className="l">Mostly cleared</div><div className="v">{m.lowTime != null ? fmtH(m.lowTime) : `> ${tEnd}h`}</div><div className="s">below 10% of the peak blood level</div></div>
                  <div className="md-stat" style={{ gridColumn: '1 / -1' }}>
                    <div className="l">Liver enzyme CYP2D6</div>
                    <div className="v" style={{ color: '#f59e0b' }}>down to {m.minEnzPct}% of normal</div>
                    <div className="s">about {Math.round(m.recoverDays)} days until it is back to 90%</div>
                  </div>
                </div>
              )}

              {redosed && (
                <div className="xp-alert xp-alert-warn" style={{ fontSize: '13.5px' }}>
                  <strong>Redosing: more drug, not much more feeling.</strong> MDMA blocks the enzyme that breaks it down, so a
                  second dose pushes the blood level higher than the same dose would on its own. Your brain has also become
                  less sensitive, so the feeling barely grows. Compare the two tabs: the strain on your heart and body
                  temperature follows the blood level, not the feeling.
                </div>
              )}
              {bigDose && (
                <div className="xp-alert xp-alert-error" style={{ fontSize: '13.5px' }}>
                  <strong>A dose of 160 mg or more.</strong> Users report more negative than positive effects from around 160 mg.
                  The lab studies behind this model stopped at about 150 mg because of side effects, so the curve above is less
                  certain here.
                </div>
              )}

              <div className="xp-group" style={{ fontSize: '13.5px', color: 'var(--xp-text-dim)', padding: '12px 14px' }}>
                Overheating? Someone confused, very hot or not responding? Call 112. Questions about your own use:
                {' '}<a href="https://www.jellinek.nl" target="_blank" rel="noopener noreferrer">Jellinek</a> and{' '}
                <a href="https://www.drugsinfo.nl" target="_blank" rel="noopener noreferrer">Drugsinfo.nl</a>.
              </div>
            </div>
          </div>
        </Window>

        <Window title="How MDMA moves through your body" icon="guide" closeHref={null} headingLevel={2}
          status={['Every step is sourced', 'See the Sources page for details']}>
          <p className="xp-intro">
            The blood level tab is pharmacokinetics: what your body does to MDMA. The effect tab is pharmacodynamics: what
            MDMA does to you. These five steps explain both curves.
          </p>

          <div className="edu-grid">
            <section className="xp-group edu">
              <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>1. Absorption: the slow climb</h3>
              <p>
                MDMA starts reaching your blood about 20 minutes after swallowing it. The blood level keeps rising for
                2 to 3 hours. After a meal this takes longer: in one study the peak came after about 4 hours instead of 2.
              </p>
              <div className="calc xp-well">
                Reaches the blood: after about 20 minutes<br />
                Felt most: after about 1.5 hours<br />
                Highest blood level: after 2 to 3 hours (about 4 after food)
              </div>
            </section>

            <section className="xp-group edu">
              <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>2. Breakdown: MDMA blocks its own exit</h3>
              <p>
                Your liver breaks MDMA down mainly with the enzyme CYP2D6, and MDMA damages that enzyme while it is being
                processed. After one dose, two thirds of the people in one study had the enzyme activity of someone born
                without a working CYP2D6. So the more you take, the slower it is cleared.
              </p>
              <p>
                Rebuilding the enzyme takes days: it was still not fully back after 10 days. Meanwhile, other medicines
                that CYP2D6 breaks down can build up more than usual.
              </p>
            </section>

            <section className="xp-group edu">
              <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>3. Elimination: a long tail</h3>
              <p>
                Half of the MDMA in your blood is gone after about 8 hours. That means roughly an eighth is still there 24 hours
                after a single dose, long after the effect has worn off.
              </p>
              <div className="calc xp-well">
                Half-life 8 hours: 100% &rarr; 50% at 8h &rarr; 25% at 16h &rarr; 12.5% at 24h
              </div>
            </section>

            <section className="xp-group edu">
              <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>4. Effect: why the feeling fades early</h3>
              <p>
                MDMA makes your brain release serotonin and noradrenaline. In lab studies people first felt it after about
                half an hour, felt it most after about 1.5 hours, and the effect lasted about 4 hours. The blood level
                peaks later and stays high much longer.
              </p>
              <p>
                That gap is acute tolerance: within a few hours your brain responds less to the same amount of MDMA. This is
                why the effect tab drops while the dashed blood line is still high.
              </p>
            </section>
          </div>

          <div className="edu-grid">
            <section className="xp-group edu">
              <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>5. Redosing</h3>
              <p>
                In a study where people took 100 mg twice, 4 hours apart, the second dose gave blood levels 23% higher than
                simply adding two doses would. Most effects were similar or only slightly stronger than after one dose.
                Blood pressure was the exception and rose further.
              </p>
            </section>

            <section className="xp-group edu">
              <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>Body temperature</h3>
              <p>
                Even sitting still in a lab, body temperature rose and peaked about 2.4 hours after MDMA, and 19% of people went
                above 38&deg;C. Dancing in a hot, crowded room adds to this. Take breaks to cool down and sip water, but do not
                drink large amounts: too much water is also dangerous.
              </p>
            </section>
          </div>

        </Window>
      </main>
      <InfoPage id="mdma" embedded />
    </>
  )
}
