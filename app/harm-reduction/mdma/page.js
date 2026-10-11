'use client'
import { useState, useEffect, useRef } from 'react'
import Window from '@/app/components/Window'
import {
  MDMA_PK, MDMA_ZONES, MDMA_INTERACTIONS,
  simulateMDMA, calcMDMAMetrics,
} from '../../../lib/bacmath.js'

function formatHours(h) {
  if (h == null) return '—'
  const hours = Math.floor(h)
  const mins  = Math.round((h - hours) * 60)
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

const DOSE_OPTIONS = {
  full:    { label: 'Full pill',    fraction: 1.0 },
  half:    { label: 'Half pill',    fraction: 0.5 },
  quarter: { label: 'Quarter pill', fraction: 0.25 },
}

let doseIdCounter = 1

function makeDoseEntry(timeh = 0, fraction = 'full') {
  return { id: doseIdCounter++, timeh, fraction }
}

export default function MDMACalculator() {
  const [weightKg,    setWeightKg]    = useState(70)
  const [rawWeight,   setRawWeight]   = useState('70')
  const [pillMg,      setPillMg]      = useState(150)
  const [rawPillMg,   setRawPillMg]   = useState('150')
  const [purity,      setPurity]      = useState(100)
  const [rawPurity,   setRawPurity]   = useState('100')
  const [knownPurity, setKnownPurity] = useState(false)
  const [doseEntries, setDoseEntries] = useState([makeDoseEntry(0, 'full')])
  const [timeScale,   setTimeScale]   = useState(24)
  const [pts,         setPts]         = useState([])
  const [metrics,     setMetrics]     = useState(null)

  const canvasRef = useRef(null)
  const ptsRef    = useRef([])
  const metRef    = useRef(null)
  const stateRef  = useRef({})

  const effectivePillMg = pillMg * (knownPurity ? purity / 100 : 1.0)

  const totalDoseMg = doseEntries.reduce((sum, d) =>
    sum + effectivePillMg * DOSE_OPTIONS[d.fraction].fraction, 0)

  const highDose = doseEntries.some(d =>
    effectivePillMg * DOSE_OPTIONS[d.fraction].fraction > 150)

  useEffect(() => {
    stateRef.current = { timeScale, doseEntries }
  }, [timeScale, doseEntries])

  useEffect(() => {
    const doses = doseEntries.map(d => ({
      timeh:  d.timeh,
      doseMg: effectivePillMg * DOSE_OPTIONS[d.fraction].fraction,
    }))

    const simPts = simulateMDMA({ doses, weightKg, tEnd: 48 })
    const m      = calcMDMAMetrics(simPts)
    ptsRef.current = simPts
    metRef.current = m
    setPts(simPts)
    setMetrics(m)
    setTimeout(() => { if (canvasRef.current) drawCanvas() }, 0)
  }, [doseEntries, effectivePillMg, weightKg])

  useEffect(() => {
    if (ptsRef.current.length && canvasRef.current) drawCanvas()
  }, [pts, timeScale])

  function drawCanvas(exportCtx = null, exportW = 0, exportH = 0) {
    const simPts   = ptsRef.current
    const m        = metRef.current
    const st       = stateRef.current
    const ts       = st.timeScale   ?? timeScale
    const dEntries = st.doseEntries ?? doseEntries
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
    const maxC    = Math.max(...simPts.map(p => p.c), 100) * 1.15
    const dispMax = Math.ceil(maxC / 100) * 100
    const maxT    = ts

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#11141f'
    ctx.fillRect(0, 0, W, H)

    const xS = t => pad.left + (Math.min(t, maxT) / maxT) * cW
    const yS = c => pad.top  + cH - (Math.min(Math.max(c, 0), dispMax) / dispMax) * cH

    // Effect zones
    MDMA_ZONES.forEach(zone => {
      const y0 = yS(Math.min(zone.max, dispMax))
      const y1 = yS(zone.min)
      if (y1 <= pad.top || y0 >= pad.top + cH) return
      ctx.fillStyle   = zone.color
      ctx.globalAlpha = zone.alpha
      ctx.fillRect(pad.left, Math.max(y0, pad.top), cW, Math.min(y1, pad.top + cH) - Math.max(y0, pad.top))
      ctx.globalAlpha = 1
      const midY = (Math.max(y0, pad.top) + Math.min(y1, pad.top + cH)) / 2
      if (Math.min(y1, pad.top + cH) - Math.max(y0, pad.top) > 14) {
        ctx.fillStyle   = zone.color
        ctx.globalAlpha = 0.75
        ctx.font        = '9px Tahoma, Verdana, sans-serif'
        ctx.textAlign   = 'right'
        ctx.fillText(zone.label, pad.left + cW - 3, midY + 3)
        ctx.globalAlpha = 1
      }
    })

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 1
    const yLines = Array.from({ length: Math.floor(dispMax / 100) + 1 }, (_, i) => i * 100).filter(v => v <= dispMax)
    yLines.forEach(v => {
      const y = yS(v)
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke()
    })
    const nX = Math.min(ts, 12)
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
      ctx.fillText((ts * i / nX).toFixed(0) + 'h', pad.left + (i / nX) * cW, pad.top + cH + 18)
    }
    ctx.save()
    ctx.translate(12, pad.top + cH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.font = '10px Tahoma, Verdana, sans-serif'
    ctx.fillStyle = '#9ca3af'
    ctx.fillText('Conc. (ng/mL)', 0, 0)
    ctx.restore()
    ctx.textAlign = 'center'
    ctx.fillText('Time after first dose (h)', pad.left + cW / 2, H - 8)
    ctx.strokeStyle = '#4a5274'; ctx.lineWidth = 1
    ctx.strokeRect(pad.left, pad.top, cW, cH)

    // Dose event markers + vertical lines
    dEntries.forEach((d, idx) => {
      if (d.timeh > maxT) return
      const x = xS(d.timeh)
      // Vertical marker for redoses (not first)
      if (idx > 0) {
        ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3])
        ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + cH); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#8b5cf6'; ctx.font = '9px Tahoma, Verdana, sans-serif'; ctx.textAlign = 'center'
        ctx.fillText('+' + (effectivePillMg * DOSE_OPTIONS[d.fraction].fraction).toFixed(0) + 'mg', x, pad.top + 12)
      }
      // Pill emoji
      ctx.font = '13px Tahoma, Verdana, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('💊', x, pad.top + cH + 40)
      // Time label
      ctx.fillStyle = '#6b7280'; ctx.font = '9px Tahoma, Verdana, sans-serif'
      ctx.fillText(d.timeh === 0 ? 't=0' : '+' + d.timeh + 'h', x, pad.top + cH + 50)
    })

    // Sub-threshold marker
    if (m?.clearTime != null && m.clearTime <= maxT) {
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(xS(m.clearTime), pad.top); ctx.lineTo(xS(m.clearTime), pad.top + cH); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#22c55e'; ctx.font = '10px Tahoma, Verdana, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('Sub-threshold', xS(m.clearTime), pad.top + 22)
    }

    // Main curve
    const filtered = simPts.filter(p => p.t <= maxT)
    ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'
    ctx.beginPath()
    filtered.forEach((p, i) => i === 0 ? ctx.moveTo(xS(p.t), yS(p.c)) : ctx.lineTo(xS(p.t), yS(p.c)))
    ctx.stroke()

    // Peak dot
    if (m && m.tmax <= maxT) {
      ctx.fillStyle = '#7c3aed'
      ctx.beginPath(); ctx.arc(xS(m.tmax), yS(m.cmax), 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#e8ebf7'; ctx.font = 'bold 11px Tahoma, Verdana, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('Peak ' + m.cmax + ' ng/mL', xS(m.tmax), yS(m.cmax) - 10)
    }
  }

  function exportGraph() {
    const src = canvasRef.current
    if (!src) return
    const scale = 3
    const W = src.offsetWidth; const H = src.offsetHeight
    const off = document.createElement('canvas')
    off.width = W * scale; off.height = H * scale
    const ctx = off.getContext('2d')
    ctx.scale(scale, scale)
    drawCanvas(ctx, W, H)
    const link = document.createElement('a')
    link.download = 'myclearance-mdma-curve.png'
    link.href = off.toDataURL('image/png', 1.0)
    link.click()
  }

  function updateDose(id, field, value) {
    setDoseEntries(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  function removeDose(id) {
    setDoseEntries(prev => prev.filter(d => d.id !== id))
  }

  function addDose() {
    const lastTime = Math.max(...doseEntries.map(d => d.timeh))
    setDoseEntries(prev => [...prev, makeDoseEntry(Math.min(lastTime + 2, 12), 'half')])
  }

  const btn = active => ({
    padding: '4px 12px', cursor: 'pointer', fontSize: '13.5px', minHeight: '24px',
  })

  return (
    <main className="xp-desktop">
      <Window title="MDMA pharmacokinetics" icon="substance:mdma" closeHref="/harm-reduction" status={['1-compartment model with CYP2D6 autoinhibition', 'Runs on your device. Nothing you enter is sent anywhere.']}>
      <p className="xp-intro">
        Plasma concentration model based on published population PK parameters. Shows how dose, body weight, and redosing affect concentration over time.
      </p>

      {/* Test kit disclaimer */}
      <div className="xp-alert xp-alert-error" style={{ marginBottom: '12px', fontSize: '14.5px' }}>
        <strong>Always test your substance before use.</strong> Street MDMA is frequently adulterated with dangerous compounds including methamphetamine, synthetic cathinones, and PMA/PMMA — which have caused deaths at doses people considered safe. PMA has a much lower lethal dose and slower onset than MDMA, causing people to redose thinking it is not working. A reagent test kit (Marquis, Mecke, Simon's) takes 30 seconds and can save your life. Available for example from <a href="https://dancesafe.org" target="_blank" rel="noopener noreferrer" style={{ color: '#dc2626' }}>DanceSafe</a>.
      </div>

      <div className="xp-alert xp-alert-warn" style={{ marginBottom: '1.5rem', fontSize: '13.5px' }}>
        Population-average PK model. ~7% of Europeans are CYP2D6 poor metabolisers and reach 2–3× higher concentrations at the same dose. This is not a safety guarantee.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Body weight */}
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
            <p style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', marginTop: '6px' }}>
              Vd scales with body weight (~7 L/kg). Lighter individuals reach higher concentrations at the same dose.
            </p>
          </div>

          {/* Pill details */}
          <div className="xp-group">
            <p className="xp-legend">Pill details</p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', display: 'block', marginBottom: '4px' }}>Pill weight (mg)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" value={rawPillMg} min={50} max={500}
                  onChange={e => { setRawPillMg(e.target.value); const n = parseFloat(e.target.value); if (n >= 50 && n <= 500) setPillMg(n) }}
                  onBlur={() => { const n = parseFloat(rawPillMg); const clamped = Math.min(Math.max(isNaN(n) ? 150 : n, 50), 500); setPillMg(clamped); setRawPillMg(String(clamped)) }}
                  style={{ width: '72px', padding: '4px 8px', borderRadius: '2px', border: '1px solid var(--xp-etch)', fontSize: '15.5px', fontWeight: '600', color: 'var(--xp-text)', textAlign: 'right', background: 'var(--xp-face-2)' }} />
                <span style={{ fontSize: '13.5px', color: 'var(--xp-text-dim)' }}>mg</span>
                <input type="range" min={50} max={500} step={5} value={pillMg}
                  onChange={e => { setPillMg(parseInt(e.target.value)); setRawPillMg(e.target.value) }}
                  style={{ flex: 1, accentColor: '#2fb34a' }} />
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', marginTop: '4px' }}>
                Dutch pills commonly range 100–250mg. High-dose pills (&gt;200mg) carry significantly higher risk.
              </p>
            </div>

            {/* Purity */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <input type="checkbox" id="purity-check" checked={knownPurity}
                  onChange={e => setKnownPurity(e.target.checked)}
                  style={{ accentColor: '#2fb34a', width: '14px', height: '14px' }} />
                <label htmlFor="purity-check" style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', cursor: 'pointer' }}>
                  I know the purity (from test result)
                </label>
              </div>
              {knownPurity && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <input type="number" value={rawPurity} min={1} max={100}
                    onChange={e => { setRawPurity(e.target.value); const n = parseFloat(e.target.value); if (n >= 1 && n <= 100) setPurity(n) }}
                    onBlur={() => { const n = parseFloat(rawPurity); const c = Math.min(Math.max(isNaN(n) ? 100 : n, 1), 100); setPurity(c); setRawPurity(String(c)) }}
                    style={{ width: '60px', padding: '4px 8px', borderRadius: '2px', border: '1px solid var(--xp-etch)', fontSize: '15.5px', fontWeight: '600', color: 'var(--xp-text)', textAlign: 'right', background: 'var(--xp-face-2)' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--xp-text-dim)' }}>% pure</span>
                  <input type="range" min={1} max={100} step={1} value={purity}
                    onChange={e => { setPurity(parseInt(e.target.value)); setRawPurity(e.target.value) }}
                    style={{ flex: 1, accentColor: '#2fb34a' }} />
                </div>
              )}
              {!knownPurity && (
                <p style={{ fontSize: '12.5px', color: '#f59e0b', margin: 0 }}>
                  ⚠ Assuming 100% purity. Actual content may differ significantly. Test your substance.
                </p>
              )}
              <div className="xp-well" style={{ marginTop: '8px', padding: '6px 10px', fontSize: '13.5px' }}>
                Effective MDMA per pill: <strong>{effectivePillMg.toFixed(1)} mg</strong>
                {knownPurity && purity < 100 && <span style={{ color: 'var(--xp-text-dim)' }}> ({purity}% of {pillMg}mg)</span>}
              </div>
            </div>
          </div>

          {/* Dose schedule */}
          <div className="xp-group">
            <p className="xp-legend">Dose schedule</p>

            {doseEntries.map((d, idx) => {
              const doseMg = effectivePillMg * DOSE_OPTIONS[d.fraction].fraction
              return (
                <div key={d.id} style={{ background: 'var(--xp-face-2)', border: '1px solid var(--xp-etch)', borderRadius: '3px', padding: '10px 12px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'rgba(240,244,255,0.75)' }}>
                      {idx === 0 ? 'First dose' : `Dose ${idx + 1}`}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)' }}>{doseMg.toFixed(1)}mg</span>
                      {doseEntries.length > 1 && (
                        <button onClick={() => removeDose(d.id)}
                          style={{ fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
                      )}
                    </div>
                  </div>

                  {/* Fraction selector */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: idx === 0 ? 0 : '8px' }}>
                    {Object.entries(DOSE_OPTIONS).map(([key, val]) => (
                      <button key={key} onClick={() => updateDose(d.id, 'fraction', key)} style={btn(d.fraction === key)} aria-pressed={Boolean(d.fraction === key)}>
                        {val.label}
                      </button>
                    ))}
                  </div>

                  {/* Timing — only for doses after first */}
                  {idx > 0 && (
                    <div>
                      <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>
                        Time: +{d.timeh}h after first dose
                      </label>
                      <input type="range" min={0.5} max={12} step={0.5} value={d.timeh}
                        onChange={e => updateDose(d.id, 'timeh', parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#2fb34a' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#6d7494' }}>
                        <span>+0.5h</span><span>+12h</span>
                      </div>
                    </div>
                  )}

                  {doseMg > 150 && (
                    <div className="xp-alert xp-alert-error" style={{ marginTop: '6px', fontSize: '11.5px' }}>
                      ⚠ This dose exceeds 150mg — risk increases non-linearly
                    </div>
                  )}
                </div>
              )
            })}

            <button onClick={addDose}
              style={{ width: '100%', padding: '8px', fontSize: '14.5px', cursor: 'pointer' }}>
              + Add another dose
            </button>

            <div className="xp-well" style={{ marginTop: '10px', padding: '6px 10px', fontSize: '13.5px' }}>
              Total: <strong>{totalDoseMg.toFixed(1)} mg</strong> MDMA
              <span style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', marginLeft: '6px' }}>
                ({(totalDoseMg / weightKg).toFixed(2)} mg/kg)
              </span>
            </div>

            {doseEntries.length > 1 && (
              <div className="xp-alert xp-alert-warn" style={{ marginTop: '8px', fontSize: '12.5px' }}>
                ⚠ Multiple doses significantly extend the time at high concentration and increase next-day neurotoxicity risk. The curve shows exactly why.
              </div>
            )}
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
            <input type="range" min={8} max={48} step={4} value={timeScale}
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
            {MDMA_ZONES.slice(0, 6).map(z => (
              <span key={z.label} style={{ fontSize: '11.5px', padding: '2px 8px', borderRadius: '2px', background: z.color + '22', color: z.color, border: `1px solid ${z.color}44` }}>
                {z.min}–{z.max === 99999 ? '800+' : z.max} ng/mL {z.label}
              </span>
            ))}
          </div>

          {/* Metrics */}
          {metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Peak concentration', value: metrics.cmax + ' ng/mL', sub: metrics.peakZone?.label ?? '', color: metrics.peakZone?.color },
                { label: 'Time to peak',        value: formatHours(metrics.tmax), sub: 'after first dose' },
                { label: 'Sub-threshold at',    value: metrics.clearTime     != null ? formatHours(metrics.clearTime)     : '>48h', sub: 'below 50 ng/mL' },
                { label: 'Essentially clear',   value: metrics.fullClearTime != null ? formatHours(metrics.fullClearTime) : '>48h', sub: 'below 10 ng/mL' },
              ].map(m => (
                <div key={m.label} style={{ background: 'var(--xp-face-2)', border: '1px solid var(--xp-etch)', borderRadius: '3px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', marginBottom: '2px' }}>{m.label}</div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: m.color ?? '#f0f4ff' }}>{m.value}</div>
                  {m.sub && <div style={{ fontSize: '11.5px', color: m.color ?? 'rgba(240,244,255,0.35)' }}>{m.sub}</div>}
                </div>
              ))}
            </div>
          )}

          {metrics && (
            <div className="xp-alert xp-alert-info" style={{ fontSize: '12.5px' }}>
             <strong>Note on peak concentration:</strong> The peak on the graph shows when plasma concentration is highest — not necessarily when subjective effects feel strongest. MDMA's psychoactive effects depend on serotonin release in the brain, which precedes plasma peak and diminishes as acute tolerance develops. You may feel effects intensely before the curve peaks, and feel little at plasma concentrations that look high on the graph.
            </div>
        )}

          {/* PK education */}
          <div className="xp-alert xp-alert-info" style={{ fontSize: '13.5px' }}>
            <p style={{ margin: '0 0 6px' }}>
              <strong>Why higher doses are disproportionately dangerous:</strong> MDMA inhibits CYP2D6 — the enzyme that metabolises it — at higher concentrations (autoinhibition). Clearance slows as concentration rises, so doubling the dose more than doubles peak concentration.
            </p>
            <p style={{ margin: '0 0 6px' }}>
              <strong>t½ ≈ 8.5h means:</strong> significant MDMA remains present the next morning. Sleep deprivation combined with elevated concentrations substantially increases serotonergic neurotoxicity risk.
            </p>
            <p style={{ margin: 0 }}>
              <strong>CYP2D6 variation:</strong> ~7% of Europeans are poor metabolisers and reach 2–3× higher concentrations at identical doses. There is no way to know your metaboliser status without genetic testing.
            </p>
          </div>

          {/* Dangerous interactions */}
          <div className="xp-group" style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--xp-text)', margin: '0 0 10px' }}>Dangerous combinations</p>
            {MDMA_INTERACTIONS.map(inter => (
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
            Struggling with MDMA use? <a href="https://www.jellinek.nl" target="_blank" rel="noopener noreferrer" style={{ color: '#c4b5fd' }}>Jellinek.nl</a> and <a href="https://www.trimbos.nl" target="_blank" rel="noopener noreferrer" style={{ color: '#c4b5fd' }}>Trimbos.nl</a> offer free, confidential support.
          </div>
        </div>
      </div>
      </Window>
    </main>
  )
}