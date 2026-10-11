'use client'
import { useState, useEffect, useRef } from 'react'
import Window from '@/app/components/Window'
import {
  KETAMINE_PK, KETAMINE_ZONES, KETAMINE_INTERACTIONS,
  simulateKetamine, calcKetamineMetrics,
} from '../../../lib/bacmath.js'

function formatHours(h) {
  if (h == null) return '—'
  const hours = Math.floor(h)
  const mins  = Math.round((h - hours) * 60)
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

let doseIdCounter = 1
function makeDose(route = 'intranasal', timeh = 0) {
  return { id: doseIdCounter++, doseMg: 60, route, timeh }
}

export default function KetamineCalculator() {
  const [weightKg,   setWeightKg]   = useState(70)
  const [rawWeight,  setRawWeight]  = useState('70')
  const [doses,      setDoses]      = useState([makeDose('intranasal', 0)])
  const [timeScale,  setTimeScale]  = useState(8)
  const [pts,        setPts]        = useState([])
  const [metrics,    setMetrics]    = useState(null)

  const canvasRef = useRef(null)
  const ptsRef    = useRef([])
  const metRef    = useRef(null)
  const stateRef  = useRef({})

  const totalDose = doses.reduce((s, d) => s + d.doseMg, 0)

  useEffect(() => {
    stateRef.current = { timeScale, doses }
  }, [timeScale, doses])

  useEffect(() => {
    if (!doses.length) { setPts([]); setMetrics(null); return }
    const simPts   = simulateKetamine({ doses, weightKg, tEnd: Math.max(timeScale, 12) })
    const m        = calcKetamineMetrics(simPts)
    ptsRef.current = simPts
    metRef.current = m
    setPts(simPts)
    setMetrics(m)
    setTimeout(() => { if (canvasRef.current) drawCanvas() }, 0)
  }, [doses, weightKg])

  useEffect(() => {
    if (ptsRef.current.length && canvasRef.current) drawCanvas()
  }, [pts, timeScale])

  function drawCanvas(exportCtx = null, exportW = 0, exportH = 0) {
    const simPts   = ptsRef.current
    const m        = metRef.current
    const st       = stateRef.current
    const ts       = st.timeScale ?? timeScale
    const dEntries = st.doses     ?? doses
    if (!simPts || !simPts.length) return

    let ctx, W, H
    if (exportCtx) {
      ctx = exportCtx; W = exportW; H = exportH
    } else {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      W = canvas.offsetWidth; H = canvas.offsetHeight
      if (!W || !H) return
      canvas.width = W * dpr; canvas.height = H * dpr
      ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
    }

    const pad     = { top: 28, right: 24, bottom: 52, left: 72 }
    const cW      = W - pad.left - pad.right
    const cH      = H - pad.top  - pad.bottom
    const maxC    = Math.max(...simPts.map(p => p.c), 50) * 1.15
    const dispMax = Math.ceil(maxC / 100) * 100
    const maxT    = ts

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#11141f'
    ctx.fillRect(0, 0, W, H)

    const xS = t => pad.left + (Math.min(t, maxT) / maxT) * cW
    const yS = c => pad.top  + cH - (Math.min(Math.max(c, 0), dispMax) / dispMax) * cH

    // Effect zones
    KETAMINE_ZONES.forEach(zone => {
      const y0 = yS(Math.min(zone.max, dispMax))
      const y1 = yS(zone.min)
      if (y1 <= pad.top || y0 >= pad.top + cH) return
      ctx.fillStyle = zone.color; ctx.globalAlpha = zone.alpha
      ctx.fillRect(pad.left, Math.max(y0, pad.top), cW, Math.min(y1, pad.top + cH) - Math.max(y0, pad.top))
      ctx.globalAlpha = 1
      const midY = (Math.max(y0, pad.top) + Math.min(y1, pad.top + cH)) / 2
      if (Math.min(y1, pad.top + cH) - Math.max(y0, pad.top) > 14) {
        ctx.fillStyle = zone.color; ctx.globalAlpha = 0.75
        ctx.font = '9px Tahoma, Verdana, sans-serif'; ctx.textAlign = 'right'
        ctx.fillText(zone.label, pad.left + cW - 3, midY + 3)
        ctx.globalAlpha = 1
      }
    })

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1
    const yStep  = dispMax <= 400 ? 100 : 200
    const yLines = Array.from({ length: Math.floor(dispMax / yStep) + 1 }, (_, i) => i * yStep).filter(v => v <= dispMax)
    yLines.forEach(v => {
      ctx.beginPath(); ctx.moveTo(pad.left, yS(v)); ctx.lineTo(pad.left + cW, yS(v)); ctx.stroke()
    })
    const nX = Math.min(ts, 8)
    for (let i = 0; i <= nX; i++) {
      const x = pad.left + (i / nX) * cW
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + cH); ctx.stroke()
    }

    // Axis labels
    ctx.fillStyle = '#9aa1bf'; ctx.font = '11px Tahoma, Verdana, sans-serif'
    ctx.textAlign = 'right'
    yLines.forEach(v => ctx.fillText(v + ' ng/mL', pad.left - 4, yS(v) + 4))
    ctx.textAlign = 'center'
    for (let i = 0; i <= nX; i++) {
      ctx.fillText((ts * i / nX).toFixed(1) + 'h', pad.left + (i / nX) * cW, pad.top + cH + 18)
    }
    ctx.save()
    ctx.translate(12, pad.top + cH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'; ctx.font = '10px Tahoma, Verdana, sans-serif'; ctx.fillStyle = '#9ca3af'
    ctx.fillText('Ketamine plasma (ng/mL)', 0, 0)
    ctx.restore()
    ctx.textAlign = 'center'; ctx.fillStyle = '#9aa1bf'; ctx.font = '11px Tahoma, Verdana, sans-serif'
    ctx.fillText('Time after first dose (h)', pad.left + cW / 2, H - 8)
    ctx.strokeStyle = '#4a5274'; ctx.lineWidth = 1
    ctx.strokeRect(pad.left, pad.top, cW, cH)

    // Dose markers
    dEntries.forEach((d, idx) => {
      if (d.timeh > maxT) return
      const x = xS(d.timeh)
      if (idx > 0) {
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
        ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + cH); ctx.stroke()
        ctx.setLineDash([])
      }
      ctx.font = '12px Tahoma, Verdana, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(d.route === 'intranasal' ? '👃' : '💊', x, pad.top + cH + 40)
      ctx.fillStyle = '#6b7280'; ctx.font = '9px Tahoma, Verdana, sans-serif'
      ctx.fillText(d.timeh === 0 ? 't=0' : '+' + d.timeh + 'h', x, pad.top + cH + 50)
    })

    // Main curve
    const filtered = simPts.filter(p => p.t <= maxT)
    ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'
    ctx.beginPath()
    filtered.forEach((p, i) => i === 0 ? ctx.moveTo(xS(p.t), yS(p.c)) : ctx.lineTo(xS(p.t), yS(p.c)))
    ctx.stroke()

    // Peak dot
    if (m && m.tmax <= maxT) {
      ctx.fillStyle = '#6366f1'
      ctx.beginPath(); ctx.arc(xS(m.tmax), yS(m.cmax), 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#e8ebf7'; ctx.font = 'bold 11px Tahoma, Verdana, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('Peak ' + m.cmax + ' ng/mL', xS(m.tmax), yS(m.cmax) - 10)
    }
  }

  function exportGraph() {
    const src = canvasRef.current; if (!src) return
    const scale = 3; const W = src.offsetWidth; const H = src.offsetHeight
    const off = document.createElement('canvas')
    off.width = W * scale; off.height = H * scale
    const ctx = off.getContext('2d'); ctx.scale(scale, scale)
    drawCanvas(ctx, W, H)
    const link = document.createElement('a')
    link.download = 'myclearance-ketamine-curve.png'
    link.href = off.toDataURL('image/png', 1.0); link.click()
  }

  function updateDose(id, field, value) {
    setDoses(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }
  function removeDose(id) { setDoses(prev => prev.filter(d => d.id !== id)) }
  function addDose(route) {
    const lastTime = Math.max(...doses.map(d => d.timeh), 0)
    setDoses(prev => [...prev, makeDose(route, Math.min(lastTime + 1, 10))])
  }

  const btn = (active) => ({
    padding: '4px 12px', cursor: 'pointer', fontSize: '13.5px', minHeight: '24px',
  })

  return (
    <main className="xp-desktop">
      <Window title="Ketamine pharmacokinetics" icon="substance:ketamine" closeHref="/harm-reduction" status={['2-compartment intranasal model', 'Runs on your device. Nothing you enter is sent anywhere.']}>
      <p className="xp-intro">
        Plasma concentration model for intranasal and oral ketamine. Unique among recreational drugs — also used clinically for treatment-resistant depression and anaesthesia at higher doses.
      </p>

      {/* Bladder warning — most important chronic harm */}
      <div className="xp-alert xp-alert-error" style={{ marginBottom: '12px', fontSize: '14.5px' }}>
        <strong>Ketamine-induced uropathy — the most important chronic harm.</strong> Regular ketamine use causes progressive, irreversible bladder damage. Ketamine cystitis presents as severe bladder pain, urinary frequency, and reduced bladder capacity. In severe cases, bladder removal has been required. This is not a dose-dependent acute risk but a chronic use risk — it can develop within months of regular use. There is no safe frequency established. Any sign of urinary symptoms in a ketamine user requires immediate medical attention.
      </div>

      <div className="xp-alert xp-alert-warn" style={{ marginBottom: '1.5rem', fontSize: '13.5px' }}>
        Population-average PK model. Ketamine is a racemic mixture (R and S enantiomers) with different potencies — clinical esketamine (S-ketamine, Spravato) is approximately 2× more potent at the same plasma concentration. Street ketamine is racemic. Individual CYP3A4 variation affects clearance.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Personal */}
          <div className="xp-group">
            <p className="xp-legend">Personal details</p>
            <label style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', display: 'block', marginBottom: '4px' }}>Body weight</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="number" value={rawWeight} min={40} max={150}
                onChange={e => { setRawWeight(e.target.value); const n = parseFloat(e.target.value); if (n >= 40 && n <= 150) setWeightKg(n) }}
                onBlur={() => { const n = parseFloat(rawWeight); if (isNaN(n) || n < 40 || n > 150) { setWeightKg(70); setRawWeight('70') } }}
                style={{ width: '60px', padding: '4px 8px', borderRadius: '2px', border: '1px solid var(--xp-etch)', fontSize: '15.5px', fontWeight: '600', color: 'var(--xp-text)', textAlign: 'right', background: 'var(--xp-face-2)' }} />
              <span style={{ fontSize: '13.5px', color: 'var(--xp-text-dim)' }}>kg</span>
              <input type="range" min={40} max={150} step={1} value={weightKg}
                onChange={e => { setWeightKg(parseInt(e.target.value)); setRawWeight(e.target.value) }}
                style={{ flex: 1, accentColor: '#2fb34a' }} />
            </div>
          </div>

          {/* Doses */}
          <div className="xp-group">
            <p className="xp-legend">Dose schedule</p>

            {doses.map((d, idx) => (
              <div key={d.id} style={{ background: 'var(--xp-face-2)', border: '1px solid var(--xp-etch)', borderRadius: '3px', padding: '10px 12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'rgba(240,244,255,0.75)' }}>
                    {idx === 0 ? 'First dose' : `Dose ${idx + 1}`}
                    <span style={{ marginLeft: '6px', fontSize: '12.5px', color: 'var(--xp-text-dim)', fontWeight: '400' }}>
                      {d.route === 'intranasal' ? '👃 intranasal' : '💊 oral'}
                    </span>
                  </span>
                  {doses.length > 1 && (
                    <button onClick={() => removeDose(d.id)}
                      style={{ fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
                  )}
                </div>

                {/* Route toggle */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <button onClick={() => updateDose(d.id, 'route', 'intranasal')} style={btn(d.route === 'intranasal')} aria-pressed={Boolean(d.route === 'intranasal')}>👃 Intranasal</button>
                  <button onClick={() => updateDose(d.id, 'route', 'oral')}       style={btn(d.route === 'oral')} aria-pressed={Boolean(d.route === 'oral')}>💊 Oral</button>
                </div>

                {/* Dose */}
                <div style={{ marginBottom: idx === 0 ? 0 : '8px' }}>
                  <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>
                    Amount: {d.doseMg}mg
                    <span style={{ color: 'var(--xp-text-dim)', marginLeft: '4px' }}>
                      {d.route === 'intranasal'
                        ? '(typical recreational line ~30–100mg)'
                        : '(oral requires ~3× higher dose for similar effect)'}
                    </span>
                  </label>
                  <input type="range" min={10} max={300} step={5} value={d.doseMg}
                    onChange={e => updateDose(d.id, 'doseMg', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#2fb34a' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#6d7494' }}>
                    <span>10mg</span><span>300mg</span>
                  </div>
                </div>

                {/* Timing */}
                {idx > 0 && (
                  <div>
                    <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>
                      +{d.timeh}h after first dose
                    </label>
                    <input type="range" min={0.25} max={10} step={0.25} value={d.timeh}
                      onChange={e => updateDose(d.id, 'timeh', parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#2fb34a' }} />
                  </div>
                )}

                {d.doseMg >= 200 && (
                  <div className="xp-alert xp-alert-error" style={{ marginTop: '6px', fontSize: '11.5px' }}>
                    ⚠ High dose — anaesthetic dissociation range. Loss of bodily control, unable to communicate or move.
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => addDose('intranasal')}
                style={{ flex: 1, padding: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                + Add intranasal dose
              </button>
              <button onClick={() => addDose('oral')}
                style={{ flex: 1, padding: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                + Add oral dose
              </button>
            </div>

            <div className="xp-alert xp-alert-info" style={{ marginTop: '10px', fontSize: '13.5px' }}>
              Total: <strong>{totalDose}mg</strong>
              <span style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', marginLeft: '6px' }}>
                ({(totalDose / weightKg).toFixed(2)} mg/kg)
              </span>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Canvas */}
          <div style={{ position: 'relative', width: '100%', height: '360px' }}>
            <canvas ref={canvasRef}
              className="xp-well" style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Graph controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--xp-text-dim)', whiteSpace: 'nowrap' }}>SHOW</span>
            <input type="range" min={2} max={16} step={1} value={timeScale}
              onChange={e => setTimeScale(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: '#2fb34a' }} />
            <span style={{ fontWeight: '600', color: 'rgba(240,244,255,0.75)', minWidth: '28px' }}>{timeScale}h</span>
            <button onClick={exportGraph}
              style={{ padding: '5px 12px', fontSize: '12.5px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ↓ Export PNG
            </button>
          </div>

          {/* Zone legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {KETAMINE_ZONES.map(z => (
              <span key={z.label} style={{ fontSize: '11.5px', padding: '2px 8px', borderRadius: '2px', background: z.color + '22', color: z.color, border: `1px solid ${z.color}44` }}>
                {z.min}–{z.max === 99999 ? '400+' : z.max} ng/mL {z.label}
              </span>
            ))}
          </div>

          {/* Metrics */}
          {metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Peak concentration', value: metrics.cmax + ' ng/mL', sub: metrics.peakZone?.label ?? '', color: metrics.peakZone?.color },
                { label: 'Time to peak',        value: formatHours(metrics.tmax), sub: 'after first dose' },
                { label: 'Sub-threshold at',    value: metrics.clearTime != null ? formatHours(metrics.clearTime) : '>12h', sub: 'below 40 ng/mL' },
                { label: 'Total dose',          value: totalDose + 'mg', sub: (totalDose / weightKg).toFixed(2) + ' mg/kg' },
              ].map(m => (
                <div key={m.label} style={{ background: 'var(--xp-face-2)', border: '1px solid var(--xp-etch)', borderRadius: '3px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', marginBottom: '2px' }}>{m.label}</div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: m.color ?? '#f0f4ff' }}>{m.value}</div>
                  {m.sub && <div style={{ fontSize: '11.5px', color: m.color ?? 'rgba(240,244,255,0.35)' }}>{m.sub}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Clinical context note */}
          <div className="xp-alert xp-alert-info" style={{ fontSize: '13.5px' }}>
            <p style={{ margin: '0 0 6px' }}>
              <strong>Clinical vs recreational context:</strong> Ketamine is a licensed anaesthetic and, as esketamine (Spravato), an antidepressant for treatment-resistant depression. Clinical IV anaesthetic doses are typically 1–2 mg/kg (70–140mg for 70kg). Recreational intranasal doses are typically 30–100mg. The k-hole starts to become possible above ~100mg intranasally for a non-tolerant user.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Oral route produces different effects:</strong> First-pass metabolism converts ketamine to norketamine — an active metabolite with a longer half-life and different profile. Oral ketamine produces a more prolonged, less intense effect than intranasal. This is why the same dose taken orally feels weaker but lasts longer.
            </p>
          </div>

          {/* Interactions */}
          <div className="xp-group" style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--xp-text)', margin: '0 0 10px' }}>Dangerous combinations</p>
            {KETAMINE_INTERACTIONS.map(inter => (
              <div key={inter.substance} style={{ marginBottom: '8px', padding: '8px 10px', background: inter.color + '11', border: `1px solid ${inter.color}33`, borderRadius: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--xp-text)' }}>{inter.substance}</span>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', padding: '1px 8px', borderRadius: '2px', background: inter.color, color: 'white' }}>{inter.severity}</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', margin: 0, lineHeight: '1.5' }}>{inter.mechanism}</p>
              </div>
            ))}
          </div>

          {/* Support */}
          <div className="xp-group" style={{ fontSize: '13.5px', color: 'var(--xp-text-dim)', padding: '12px 14px' }}>
            Concerned about ketamine use? <a href="https://www.jellinek.nl" target="_blank" rel="noopener noreferrer" style={{ color: '#a5b4fc' }}>Jellinek.nl</a> and <a href="https://www.trimbos.nl" target="_blank" rel="noopener noreferrer" style={{ color: '#a5b4fc' }}>Trimbos.nl</a> offer free, confidential support.
          </div>
        </div>
      </div>
      </Window>
    </main>
  )
}