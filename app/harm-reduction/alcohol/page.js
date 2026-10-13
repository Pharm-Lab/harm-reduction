'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Window from '@/app/components/Window'
import {
  COUNTRIES, BAC_ZONES, DRINK_TYPES, DRINK_VOLUMES,
  simulateBAC, calcBACMetrics, formatHours,
  calcEthanolGrams, KA_FASTING, KA_FED,
  BETA_MEAN, BETA_LOW, BETA_HIGH, calcWidmarkPeak, watsonTBW, rFromBody,
} from '../../../lib/bacmath.js'

const CATEGORIES = ['Beer', 'Wine', 'Spirits', 'Mixed', 'Custom']
let drinkIdCounter = 1

function makeDrink() {
  const type = DRINK_TYPES[0]
  return {
    id:           drinkIdCounter++,
    typeId:       type.id,
    category:     type.category,
    name:         type.name,
    volumeMl:     330,
    abv:          type.defaultAbv,
    timeh:        0,
    qty:          1,
    customVolume: 330,
    customAbv:    5.0,
  }
}

export default function AlcoholCalculator() {
  const [sex,        setSex]        = useState('male')
  const [weightKg,   setWeightKg]   = useState(75)
  const [rawWeight,  setRawWeight]  = useState('75')
  const [heightCm,   setHeightCm]   = useState(180)
  const [ageY,       setAgeY]       = useState(25)
  const [country,    setCountry]    = useState('NL')
  const [driverType, setDriverType] = useState('standard')
  const [withFood,   setWithFood]   = useState(false)
  const [drinks,     setDrinks]     = useState([makeDrink()])
  const [mode,       setMode]       = useState('drinks')   // 'drinks' or 'session'
  const [session,    setSession]    = useState({ count: 24, intervalMin: 15, typeId: 'lager', category: 'Beer', volumeMl: 330, abv: 5.0 })
  const [timeScale,  setTimeScale]  = useState(12)
  const [bacPts,     setBacPts]     = useState([])
  const [bacPtsLow,  setBacPtsLow]  = useState([])
  const [bacPtsHigh, setBacPtsHigh] = useState([])
  const [metrics,    setMetrics]    = useState(null)

  const canvasRef = useRef(null)
  const bacRef    = useRef([])
  const lowRef    = useRef([])
  const highRef   = useRef([])
  const metRef    = useRef(null)
  const stateRef  = useRef({})

  // Body water (Watson) gives a personal distribution factor r
  const body = { sex, ageY, heightCm, weightKg }
  const tbw  = watsonTBW(body)
  const r    = rFromBody(body)

  // One list of { timeh, ethanolG } for both input modes
  const drinkList = useMemo(() => {
    if (mode === 'session') {
      const eg = calcEthanolGrams(session.volumeMl, session.abv / 100)
      return Array.from({ length: session.count }, (_, i) => ({ timeh: (i * session.intervalMin) / 60, ethanolG: eg }))
    }
    return drinks.flatMap(d => {
      const vol = d.typeId === 'custom' ? d.customVolume : d.volumeMl
      const abv = d.typeId === 'custom' ? d.customAbv    : d.abv
      const eg  = calcEthanolGrams(vol, abv / 100)
      return Array.from({ length: d.qty }, () => ({ timeh: d.timeh, ethanolG: eg }))
    })
  }, [mode, session, drinks])

  const totalEthanol = drinkList.reduce((sum, d) => sum + d.ethanolG, 0)
  const lastDrinkH   = drinkList.reduce((m, d) => Math.max(m, d.timeh), 0)

  // Simulate long enough for even the slowest eliminator to get back to zero
  const tEnd = useMemo(() => {
    const widmark = totalEthanol / (weightKg * r)
    return Math.min(96, Math.max(24, Math.ceil(lastDrinkH + widmark / BETA_LOW + 2)))
  }, [totalEthanol, lastDrinkH, weightKg, r])

  // In session mode, zoom the graph out to show the whole session
  useEffect(() => {
    if (mode === 'session') setTimeScale(Math.min(tEnd, 48))
    else setTimeScale(t => Math.min(t, tEnd))
  }, [mode, tEnd])

  // Keep stateRef in sync for drawCanvas
  useEffect(() => {
    stateRef.current = { timeScale, country, driverType, drinks: drinkList }
  }, [timeScale, country, driverType, drinkList])

  // Recompute BAC whenever inputs change
  useEffect(() => {
    const ka = withFood ? KA_FED : KA_FASTING
    const drinkInputs = drinkList.map(d => ({ ...d, ka }))

    if (!drinkInputs.length) { setBacPts([]); setMetrics(null); return }

    const common = { drinks: drinkInputs, weightKg, sex, r, tEnd, nSteps: Math.max(2000, Math.round(tEnd * 100)) }
    const pts    = simulateBAC({ ...common, betaRate: BETA_MEAN })
    const ptsLow = simulateBAC({ ...common, betaRate: BETA_LOW  })
    const ptsHigh= simulateBAC({ ...common, betaRate: BETA_HIGH })

    const limit = driverType !== 'none'
      ? (COUNTRIES[country][driverType] ?? COUNTRIES[country].standard)
      : null
    const totalEthanolG = drinkInputs.reduce((sum, d) => sum + d.ethanolG, 0)
    const widmarkPeak   = calcWidmarkPeak(totalEthanolG, weightKg, sex, r)
    const m             = { ...calcBACMetrics(pts, limit), widmarkPeak: +widmarkPeak.toFixed(3) }

    bacRef.current  = pts
    lowRef.current  = ptsLow
    highRef.current = ptsHigh
    metRef.current  = m

    setBacPts(pts)
    setBacPtsLow(ptsLow)
    setBacPtsHigh(ptsHigh)
    setMetrics(m)
    setTimeout(() => { if (canvasRef.current) drawCanvas() }, 0)
  }, [drinkList, sex, weightKg, r, withFood, country, driverType, tEnd])

  useEffect(() => {
    if (bacRef.current.length && canvasRef.current) drawCanvas()
  }, [bacPts, timeScale, country, driverType])

  function drawCanvas(exportCtx = null, exportW = 0, exportH = 0) {
  const pts    = bacRef.current
  const ptsLow = lowRef.current
  const ptsHigh= highRef.current
  const m      = metRef.current
  const st     = stateRef.current
  const ts     = st.timeScale  ?? timeScale
  const cntry  = st.country    ?? country
  const drvType= st.driverType ?? driverType
  const drnks  = st.drinks     ?? drinks
  if (!pts || !pts.length) return

  let ctx, W, H
  if (exportCtx) {
    ctx = exportCtx
    W   = exportW
    H   = exportH
  } else {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    W = canvas.offsetWidth
    H = canvas.offsetHeight
    if (!W || !H) return
    canvas.width  = W * dpr
    canvas.height = H * dpr
    ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
  }

    const pad = { top: 28, right: 24, bottom: 62, left: 52 }
    const cW  = W - pad.left - pad.right
    const cH  = H - pad.top  - pad.bottom

    const maxBAC  = Math.max(...pts.map(p => p.bac), ...ptsLow.map(p => p.bac), 0.1) * 1.15
    const dispMax = Math.ceil(maxBAC / 0.5) * 0.5
    const maxT    = ts

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#11141f'
    ctx.fillRect(0, 0, W, H)

    const xS = t   => pad.left + (Math.min(t, maxT) / maxT) * cW
    const yS = bac => pad.top + cH - (Math.min(Math.max(bac, 0), dispMax) / dispMax) * cH

    // Effect zone bands
    BAC_ZONES.forEach(zone => {
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
    const yStep  = dispMax > 4 ? 1 : 0.5
    const yLines = Array.from({ length: Math.floor(dispMax / yStep) + 1 }, (_, i) => +(i * yStep).toFixed(1))
    yLines.forEach(v => {
      const y = yS(v)
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke()
    })
    // Even time steps: the smallest of these that gives at most 12 ticks
    const xStep  = [1, 2, 3, 4, 6, 8, 12].find(st => ts / st <= 12) ?? 24
    const xTicks = Array.from({ length: Math.floor(ts / xStep) + 1 }, (_, i) => i * xStep)
    xTicks.forEach(h => {
      const x = xS(h)
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + cH); ctx.stroke()
    })

    // Axis labels
    ctx.fillStyle = '#9aa1bf'
    ctx.font = '11px Tahoma, Verdana, sans-serif'
    ctx.textAlign = 'right'
    yLines.forEach(v => {
      ctx.fillText(v.toFixed(1) + '‰', pad.left - 4, yS(v) + 4)
    })
    ctx.textAlign = 'center'
    xTicks.forEach(h => ctx.fillText(h + 'h', xS(h), pad.top + cH + 18))
    ctx.save()
    ctx.translate(14, pad.top + cH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('BAC (‰ g/L)', 0, 0)
    ctx.restore()
    ctx.textAlign = 'center'
    ctx.fillText('Time after first drink (h)', pad.left + cW / 2, H - 6)
    ctx.strokeStyle = '#4a5274'
    ctx.lineWidth = 1
    ctx.strokeRect(pad.left, pad.top, cW, cH)

    // Uncertainty band
    if (ptsLow.length && ptsHigh.length) {
      ctx.globalAlpha = 0.15
      ctx.fillStyle   = '#2563eb'
      ctx.beginPath()
      const lo = ptsLow.filter(p  => p.t <= maxT)
      const hi = ptsHigh.filter(p => p.t <= maxT)
      lo.forEach((p, i) => i === 0 ? ctx.moveTo(xS(p.t), yS(p.bac)) : ctx.lineTo(xS(p.t), yS(p.bac)))
      ;[...hi].reverse().forEach(p => ctx.lineTo(xS(p.t), yS(p.bac)))
      ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 1
    }

    // Legal limit line, only when driving
    const limitVal = drvType !== 'none'
      ? (COUNTRIES[cntry][drvType] ?? COUNTRIES[cntry].standard)
      : null

    if (limitVal != null && limitVal >= 0 && limitVal <= dispMax) {
      ctx.strokeStyle = '#dc2626'
      ctx.lineWidth   = 1.5
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(pad.left, yS(limitVal)); ctx.lineTo(pad.left + cW, yS(limitVal))
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle  = '#dc2626'
      ctx.font       = '10px Tahoma, Verdana, sans-serif'
      ctx.textAlign  = 'left'
      ctx.fillText(`Legal limit ${limitVal}‰ (${COUNTRIES[cntry].name})`, pad.left + 4, yS(limitVal) - 4)
    }

    // Germany 0.3‰ criminal threshold
    if (cntry === 'DE' && drvType !== 'none' && 0.3 <= dispMax) {
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth   = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(pad.left, yS(0.3)); ctx.lineTo(pad.left + cW, yS(0.3))
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle  = '#f97316'
      ctx.font       = '9px Tahoma, Verdana, sans-serif'
      ctx.textAlign  = 'left'
      ctx.fillText('0.3‰: criminal with impairment or accident (DE)', pad.left + 4, yS(0.3) - 3)
    }

    // Safe to drive marker
    if (m?.safeToDriveTime != null && m.safeToDriveTime <= maxT && drvType !== 'none') {
      const sx = xS(m.safeToDriveTime)
      ctx.strokeStyle = '#16a34a'
      ctx.lineWidth   = 1.5
      ctx.setLineDash([4, 3])
      ctx.beginPath(); ctx.moveTo(sx, pad.top); ctx.lineTo(sx, pad.top + cH); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle  = '#16a34a'
      ctx.font       = '10px Tahoma, Verdana, sans-serif'
      ctx.textAlign  = 'center'
      ctx.fillText('Safe to drive', sx, pad.top + 12)
    }

    // Sober marker
    if (m?.soberTime != null && m.soberTime <= maxT) {
      const sx = xS(m.soberTime)
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth   = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(sx, pad.top); ctx.lineTo(sx, pad.top + cH); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle  = '#22c55e'
      ctx.font       = '10px Tahoma, Verdana, sans-serif'
      ctx.textAlign  = 'center'
      ctx.fillText('Sober', sx, pad.top + 22)
    }

    // Steady state annotation
    if (m?.steadyState) {
      ctx.fillStyle  = '#f59e0b'
      ctx.font       = '10px Tahoma, Verdana, sans-serif'
      ctx.textAlign  = 'right'
      ctx.fillText('Drinking as fast as you clear', pad.left + cW - 4, pad.top + cH - 6)
    }

    // Drink time markers
    const uniqueTimes = [...new Set(drnks.map(d => d.timeh))].sort((a, b) => a - b)
    uniqueTimes.forEach(t => {
      if (t > maxT) return
      ctx.font      = '12px Tahoma, Verdana, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🍺', xS(t), pad.top + cH + 36)
    })

    // Main BAC curve
    const filtered = pts.filter(p => p.t <= maxT)
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth   = 2.5
    ctx.lineJoin    = 'round'
    ctx.beginPath()
    filtered.forEach((p, i) => i === 0 ? ctx.moveTo(xS(p.t), yS(p.bac)) : ctx.lineTo(xS(p.t), yS(p.bac)))
    ctx.stroke()

    // Peak dot
    if (m && m.peakTime <= maxT) {
      ctx.fillStyle = '#ef4444'
      ctx.beginPath(); ctx.arc(xS(m.peakTime), yS(m.peakBAC), 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle  = '#e8ebf7'
      ctx.font       = 'bold 11px Tahoma, Verdana, sans-serif'
      ctx.textAlign  = 'center'
      ctx.fillText('Peak ' + m.peakBAC + '‰', xS(m.peakTime), yS(m.peakBAC) - 10)
    }
  }

  function exportGraph() {
    const src = canvasRef.current
    if (!src) return
    const scale = 3
    const W     = src.offsetWidth
    const H     = src.offsetHeight
    const off   = document.createElement('canvas')
    off.width   = W * scale
    off.height  = H * scale
    const ctx   = off.getContext('2d')
    ctx.scale(scale, scale)
    drawCanvas(ctx, W, H)
    const link    = document.createElement('a')
    link.download = 'myclearance-bac-curve.png'
    link.href     = off.toDataURL('image/png', 1.0)
    link.click()
  }

  function updateDrink(id, field, value) {
    setDrinks(prev => prev.map(d => {
      if (d.id !== id) return d
      const updated = { ...d, [field]: value }
      if (field === 'typeId') {
        const type = DRINK_TYPES.find(t => t.id === value)
        if (type) {
          updated.category = type.category
          updated.name     = type.name
          updated.abv      = type.defaultAbv
          const vols       = DRINK_VOLUMES[type.category]
          updated.volumeMl = vols?.[1]?.ml ?? vols?.[0]?.ml ?? 330
        }
      }
      return updated
    }))
  }

  function removeDrink(id) { setDrinks(prev => prev.filter(d => d.id !== id)) }
  function addDrink()      { setDrinks(prev => [...prev, makeDrink()]) }

  const limit        = driverType !== 'none' ? (COUNTRIES[country][driverType] ?? COUNTRIES[country].standard) : null
  const peakZone     = metrics ? BAC_ZONES.slice().reverse().find(z => metrics.peakBAC >= z.min) : null
  const totalUnits = totalEthanol / 10
  const sessionMinutes = mode === 'session' ? (session.count - 1) * session.intervalMin : 0
  const setS = patch => setSession(prev => ({ ...prev, ...patch }))
  function pickSessionType(typeId) {
    const type = DRINK_TYPES.find(t => t.id === typeId)
    if (!type) return
    const vols = DRINK_VOLUMES[type.category] ?? DRINK_VOLUMES['Mixed']
    setS({ typeId, category: type.category, abv: type.defaultAbv, volumeMl: vols?.[1]?.ml ?? vols?.[0]?.ml ?? 330 })
  }

  const btn = active => ({
    padding: '4px 12px', cursor: 'pointer', fontSize: '13.5px', minHeight: '24px',
  })

  return (
    <main className="xp-desktop">
      <Window title="Alcohol calculator" icon="substance:alcohol" closeHref="/harm-reduction" status={['Widmark model', 'Runs on your device. Nothing you enter is sent anywhere.']}>
      <p className="xp-intro">
        See how your blood alcohol concentration (BAC) rises and falls over a night, based on the Widmark model that forensic labs still use. The blue line is a typical person. The shaded band shows the range between people who clear alcohol slowly and people who clear it fast. Scroll down to learn what is happening in your body at each step.
      </p>

      <div className="xp-alert xp-alert-warn" style={{ marginBottom: '1.25rem', fontSize: '13.5px' }}>
        <strong>Never use this to decide whether you can drive.</strong> The model shows averages, and your real BAC can be higher. If you have been drinking, don't drive.
      </div>

      <p style={{ margin: '-0.5rem 0 1.25rem', fontSize: '13px', color: 'var(--xp-text-dim)' }}>
        Want to check the maths? The <Link href="/models?model=alcohol">Models page</Link> shows every equation, parameter, source and line of code behind this calculator.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem' }}>

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Personal details */}
          <div className="xp-group">
            <p className="xp-legend">Personal details</p>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', display: 'block', marginBottom: '4px' }}>Biological sex</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setSex('male')}   style={btn(sex === 'male')} aria-pressed={Boolean(sex === 'male')}>Male</button>
                <button onClick={() => setSex('female')} style={btn(sex === 'female')} aria-pressed={Boolean(sex === 'female')}>Female</button>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', display: 'block', marginBottom: '4px' }}>Body weight</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" value={rawWeight} min={30} max={200}
                  onChange={e => { setRawWeight(e.target.value); const n = parseFloat(e.target.value); if (n >= 30 && n <= 200) setWeightKg(n) }}
                  onBlur={() => { const n = parseFloat(rawWeight); if (isNaN(n) || n < 30 || n > 200) { setWeightKg(75); setRawWeight('75') } }}
                  style={{ width: '60px', padding: '4px 8px', borderRadius: '2px', border: '1px solid var(--xp-etch)', fontSize: '15.5px', fontWeight: '600', color: 'var(--xp-text)', textAlign: 'right', background: 'var(--xp-face-2)' }} />
                <span style={{ fontSize: '13.5px', color: 'var(--xp-text-dim)' }}>kg</span>
                <input type="range" min={30} max={200} step={1} value={weightKg}
                  onChange={e => { setWeightKg(parseInt(e.target.value)); setRawWeight(e.target.value) }}
                  style={{ flex: 1, accentColor: '#2fb34a' }} />
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', display: 'block', marginBottom: '4px' }}>Height</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" value={heightCm} min={140} max={210}
                  onChange={e => { const n = parseInt(e.target.value); if (n >= 140 && n <= 210) setHeightCm(n) }}
                  style={{ width: '60px', padding: '4px 8px', fontSize: '15.5px', fontWeight: '600', textAlign: 'right' }} aria-label="Height in cm" />
                <span style={{ fontSize: '13.5px', color: 'var(--xp-text-dim)' }}>cm</span>
                <input type="range" min={140} max={210} step={1} value={heightCm}
                  onChange={e => setHeightCm(parseInt(e.target.value))} style={{ flex: 1 }} aria-label="Height" />
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', display: 'block', marginBottom: '4px' }}>Age</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" value={ageY} min={18} max={90}
                  onChange={e => { const n = parseInt(e.target.value); if (n >= 18 && n <= 90) setAgeY(n) }}
                  style={{ width: '60px', padding: '4px 8px', fontSize: '15.5px', fontWeight: '600', textAlign: 'right' }} aria-label="Age in years" />
                <span style={{ fontSize: '13.5px', color: 'var(--xp-text-dim)' }}>years</span>
                <input type="range" min={18} max={90} step={1} value={ageY}
                  onChange={e => setAgeY(parseInt(e.target.value))} style={{ flex: 1 }} aria-label="Age" />
              </div>
            </div>

            <div className="xp-well" style={{ padding: '8px 12px', marginBottom: '12px', fontSize: '13px' }}>
              Estimated body water: <strong>{tbw.toFixed(1)} L</strong>, giving a distribution factor <strong>r = {r.toFixed(2)}</strong>
              <span style={{ display: 'block', color: 'var(--xp-text-dim)', fontSize: '12px', marginTop: '2px' }}>
                Watson formula{sex === 'female' ? ' (for women it uses height and weight only)' : ''}.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', display: 'block', marginBottom: '4px' }}>Stomach contents</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setWithFood(false)} style={btn(!withFood)} aria-pressed={Boolean(!withFood)}>Empty stomach</button>
                <button onClick={() => setWithFood(true)}  style={btn(withFood)} aria-pressed={Boolean(withFood)}>After a meal (slower absorption)</button>
              </div>
            </div>
          </div>

          {/* Country + driver type */}
          <div className="xp-group">
            <p className="xp-legend">Driving limits</p>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', display: 'block', marginBottom: '4px' }}>Country</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.entries(COUNTRIES).map(([k, v]) => (
                  <button key={k} onClick={() => { setCountry(k); setDriverType('standard') }} style={btn(country === k)} aria-pressed={Boolean(country === k)}>
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', display: 'block', marginBottom: '4px' }}>Driver type</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button onClick={() => setDriverType('standard')}
                  style={btn(driverType === 'standard')} aria-pressed={Boolean(driverType === 'standard')}>
                  Standard ({COUNTRIES[country].standard}‰)
                </button>
                {COUNTRIES[country].novice != null && (
                  <button onClick={() => setDriverType('novice')}
                    style={btn(driverType === 'novice')} aria-pressed={Boolean(driverType === 'novice')}>
                    {COUNTRIES[country].noviceLabel} ({COUNTRIES[country].novice}‰)
                  </button>
                )}
                {COUNTRIES[country].professional != null && (
                  <button onClick={() => setDriverType('professional')}
                    style={btn(driverType === 'professional')} aria-pressed={Boolean(driverType === 'professional')}>
                    {COUNTRIES[country].proLabel} ({COUNTRIES[country].professional}‰)
                  </button>
                )}
                <button onClick={() => setDriverType('none')}
                  style={btn(driverType === 'none')} aria-pressed={Boolean(driverType === 'none')}>
                  Not driving
                </button>
              </div>

              {/* Germany criminal threshold note */}
              {COUNTRIES[country].note && driverType !== 'none' && (
                <div className="xp-alert xp-alert-warn" style={{ marginTop: '8px', fontSize: '12.5px' }}>
                  {COUNTRIES[country].note}
                </div>
              )}

              {/* Not driving confirmation */}
              {driverType === 'none' && (
                <div className="xp-alert xp-alert-ok" style={{ marginTop: '8px', fontSize: '12.5px' }}>
                  Not driving, so no legal limit line is shown.
                </div>
              )}
            </div>
          </div>

          {/* Drinks */}
          <div className="xp-group">
            <p className="xp-legend">Drinks</p>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <button onClick={() => setMode('drinks')}  style={btn(mode === 'drinks')}  aria-pressed={mode === 'drinks'}>Drink by drink</button>
              <button onClick={() => setMode('session')} style={btn(mode === 'session')} aria-pressed={mode === 'session'}>Binge session</button>
            </div>

            {mode === 'session' && (
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--xp-text-dim)' }}>
                  Same drink, steady pace. For a long session like kratzitten (a full crate of 24 beers in one go).
                </p>
                <button onClick={() => setSession({ count: 24, intervalMin: 15, typeId: 'lager', category: 'Beer', volumeMl: 330, abv: 5.0 })}
                  style={{ padding: '4px 10px', fontSize: '13px', marginBottom: '12px' }}>
                  Krat preset: 24 &times; 330 ml at 5%, every 15 min
                </button>

                <label style={{ fontSize: '13.5px', display: 'block', marginBottom: '4px' }}>Number of drinks</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <input type="number" min={1} max={48} value={session.count}
                    onChange={e => { const n = parseInt(e.target.value); if (n >= 1 && n <= 48) setS({ count: n }) }}
                    style={{ width: '60px', padding: '4px 8px', textAlign: 'right', fontSize: '15.5px', fontWeight: '600' }} />
                  <input type="range" min={1} max={48} step={1} value={session.count}
                    onChange={e => setS({ count: parseInt(e.target.value) })} style={{ flex: 1 }} aria-label="Number of drinks" />
                </div>

                <label style={{ fontSize: '13.5px', display: 'block', marginBottom: '4px' }}>Minutes between drinks (average)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <input type="number" min={1} max={120} value={session.intervalMin}
                    onChange={e => { const n = parseInt(e.target.value); if (n >= 1 && n <= 120) setS({ intervalMin: n }) }}
                    style={{ width: '60px', padding: '4px 8px', textAlign: 'right', fontSize: '15.5px', fontWeight: '600' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--xp-text-dim)' }}>min</span>
                  <input type="range" min={1} max={120} step={1} value={session.intervalMin}
                    onChange={e => setS({ intervalMin: parseInt(e.target.value) })} style={{ flex: 1 }} aria-label="Minutes between drinks" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>Drink</label>
                    <select value={session.typeId} onChange={e => pickSessionType(e.target.value)} style={{ width: '100%', padding: '6px 8px', fontSize: '13.5px' }}>
                      {CATEGORIES.filter(c => c !== 'Custom').map(cat => (
                        <optgroup key={cat} label={cat}>
                          {DRINK_TYPES.filter(t => t.category === cat).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>Size</label>
                    <select value={session.volumeMl} onChange={e => setS({ volumeMl: parseInt(e.target.value) })} style={{ width: '100%', padding: '6px 8px', fontSize: '13.5px' }}>
                      {(DRINK_VOLUMES[session.category] ?? DRINK_VOLUMES['Mixed']).map(v => <option key={v.label} value={v.ml}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>Alcohol: {session.abv.toFixed(1)}%</label>
                <input type="range" min={0.5} max={70} step={0.5} value={session.abv}
                  onChange={e => setS({ abv: parseFloat(e.target.value) })} style={{ width: '100%' }} aria-label="Alcohol percentage" />

                <div className="xp-well" style={{ marginTop: '10px', padding: '8px 12px', fontSize: '13.5px' }}>
                  {session.count} drinks over <strong>{formatHours(sessionMinutes / 60)}</strong>, starting at 0h.
                </div>
              </div>
            )}

            {mode === 'drinks' && <>
            {drinks.map((d, idx) => {
              const volumes  = DRINK_VOLUMES[d.category] ?? DRINK_VOLUMES['Mixed']
              const isCustom = d.typeId === 'custom'
              const vol      = isCustom ? d.customVolume : d.volumeMl
              const abv      = isCustom ? d.customAbv    : d.abv
              const eg       = calcEthanolGrams(vol, abv / 100)

              return (
                <div key={d.id} style={{ background: 'var(--xp-face-2)', border: '1px solid var(--xp-etch)', borderRadius: '3px', padding: '10px 12px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'rgba(240,244,255,0.75)' }}>Drink {idx + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)' }}>{eg.toFixed(1)} g alcohol ({(eg/10).toFixed(1)} standard drinks)</span>
                      {drinks.length > 1 && (
                        <button onClick={() => removeDrink(d.id)}
                          style={{ fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
                      )}
                    </div>
                  </div>

                  {/* Type */}
                  <div style={{ marginBottom: '6px' }}>
                    <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>Type</label>
                    <select value={d.typeId} onChange={e => updateDrink(d.id, 'typeId', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid var(--xp-etch)', fontSize: '13.5px', color: 'var(--xp-text)', background: 'var(--xp-face-2)' }}>
                      {CATEGORIES.map(cat => (
                        <optgroup key={cat} label={cat}>
                          {DRINK_TYPES.filter(t => t.category === cat).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {isCustom ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                      <div>
                        <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>Volume (mL)</label>
                        <input type="number" value={d.customVolume} min={10} max={2000}
                          onChange={e => updateDrink(d.id, 'customVolume', parseFloat(e.target.value) || 250)}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: '2px', border: '1px solid var(--xp-etch)', fontSize: '14.5px', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>ABV (%)</label>
                        <input type="number" value={d.customAbv} min={0.1} max={96} step={0.1}
                          onChange={e => updateDrink(d.id, 'customAbv', parseFloat(e.target.value) || 5)}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: '2px', border: '1px solid var(--xp-etch)', fontSize: '14.5px', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px', gap: '6px', marginBottom: '6px' }}>
                        <div>
                          <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>Volume</label>
                          <select value={d.volumeMl} onChange={e => updateDrink(d.id, 'volumeMl', parseInt(e.target.value))}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid var(--xp-etch)', fontSize: '13.5px', color: 'var(--xp-text)', background: 'var(--xp-face-2)' }}>
                            {volumes.map(v => (
                              <option key={v.label} value={v.ml}>{v.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>Qty</label>
                          <select value={d.qty} onChange={e => updateDrink(d.id, 'qty', parseInt(e.target.value))}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid var(--xp-etch)', fontSize: '13.5px', color: 'var(--xp-text)', background: 'var(--xp-face-2)' }}>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                      <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>ABV: {d.abv.toFixed(1)}%</label>
                      <input type="range" min={0.5} max={70} step={0.5} value={d.abv}
                        onChange={e => updateDrink(d.id, 'abv', parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#2fb34a' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#6d7494' }}>
                        <span>0.5%</span><span>70%</span>
                      </div>
                    </div>
                  )}

                  {/* Timing */}
                  <div>
                    <label style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', display: 'block', marginBottom: '3px' }}>
                      Time: {d.timeh === 0 ? 'Start (t=0)' : `+${d.timeh}h after start`}
                    </label>
                    <input type="range" min={0} max={12} step={0.25} value={d.timeh}
                      onChange={e => updateDrink(d.id, 'timeh', parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#2fb34a' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#6d7494' }}>
                      <span>Start</span><span>+12h</span>
                    </div>
                  </div>
                </div>
              )
            })}

            <button onClick={addDrink}
              style={{ width: '100%', padding: '8px', fontSize: '14.5px', cursor: 'pointer' }}>
              + Add another drink
            </button>
            </>}

            <div className="xp-group" style={{ marginTop: '10px', fontSize: '13.5px', color: 'rgba(240,244,255,0.75)', padding: '12px 14px' }}>
              Total: <strong>{totalEthanol.toFixed(1)} g alcohol</strong>, which is <strong>{totalUnits.toFixed(1)}</strong> Dutch standard drinks (10 g each)
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
            <span style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--xp-text-dim)', whiteSpace: 'nowrap' }}>Show</span>
            <input type="range" min={4} max={tEnd} step={1} value={timeScale}
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
            {BAC_ZONES.map(z => (
              <span key={z.label} title={z.detail} style={{ fontSize: '11.5px', padding: '2px 8px', borderRadius: '2px', background: z.color + '22', color: z.color, border: `1px solid ${z.color}44` }}>
                {z.max === 10 ? `${z.min.toFixed(1)}‰ and up` : `${z.min.toFixed(1)} to ${z.max.toFixed(1)}‰`}: {z.label}
              </span>
            ))}
          </div>

          {/* What the line and band mean */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontSize: '12.5px', color: 'var(--xp-text-dim)' }}>
            <span><span aria-hidden="true" style={{ display: 'inline-block', width: '18px', height: '3px', background: '#2563eb', verticalAlign: 'middle', marginRight: '6px' }} />Typical person: clears 0.15&permil; per hour</span>
            <span><span aria-hidden="true" style={{ display: 'inline-block', width: '18px', height: '10px', background: 'rgba(37,99,235,0.3)', verticalAlign: 'middle', marginRight: '6px' }} />Shaded: fast clearers (0.25&permil;/h) at the bottom to slow clearers (0.10&permil;/h) at the top. Over many drinks this gap keeps growing.</span>
          </div>

          {/* Metrics */}
          {metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                {
                  label: 'Simulated peak BAC',
                  value: metrics.peakBAC + '‰',
                  sub:   peakZone?.label ?? '',
                  color: peakZone?.color ?? '#f0f4ff',
                },
                {
                  label: 'Peak time',
                  value: formatHours(metrics.peakTime),
                  sub:   'after first drink',
                },
                {
                  label: 'Safe to drive',
                  value: driverType === 'none'
                    ? 'Not driving'
                    : metrics.safeToDriveTime != null
                      ? formatHours(metrics.safeToDriveTime)
                      : `> ${tEnd}h`,
                  sub: driverType === 'none'
                    ? 'No limit applied'
                    : limit != null ? `Below ${limit}‰ limit` : '',
                  color: driverType === 'none' ? '#22c55e' : undefined,
                },
                {
                  label: 'Fully sober',
                  value: metrics.soberTime != null ? formatHours(metrics.soberTime) : `> ${tEnd}h`,
                  sub:   'BAC returns to 0',
                },
                {
                  label: 'Widmark peak (max)',
                  value: metrics.widmarkPeak + '‰',
                  sub:   'If all alcohol were absorbed at once',
                  color: 'var(--xp-text-dim)',
                },
              ].map(m => (
                <div key={m.label} style={{ background: 'var(--xp-face-2)', border: '1px solid var(--xp-etch)', borderRadius: '3px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', marginBottom: '2px' }}>{m.label}</div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: m.color ?? '#f0f4ff' }}>{m.value}</div>
                  {m.sub && <div style={{ fontSize: '11.5px', color: m.color ?? 'rgba(240,244,255,0.35)' }}>{m.sub}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Dangerous level warnings */}
          {metrics && metrics.peakBAC >= 3 && (
            <div className="xp-alert xp-alert-error" style={{ fontSize: '13.5px' }}>
              <strong>This level can kill.</strong> A peak above 3&permil; means numbed senses and confusion, and above 4&permil; breathing and pulse can slow until coma. In real life vomiting often removes some alcohol, so peaks can end up lower than modelled, but a session like this is exactly how people end up in hospital or worse. Never let someone who is this drunk sleep it off alone. If they cannot be woken or breathe slowly, call 112.
            </div>
          )}
          {metrics && metrics.peakBAC >= 1.5 && metrics.peakBAC < 3 && mode === 'session' && (
            <div className="xp-alert xp-alert-warn" style={{ fontSize: '13.5px' }}>
              <strong>Very drunk territory.</strong> Above 1.5&permil; most people feel sick, vomit and lose judgement. Spreading the same drinks over more time lowers the peak, because your liver keeps clearing alcohol during the session. Drinking fewer lowers it most. Try both with the sliders.
            </div>
          )}

          {/* Steady state warning */}
          {metrics?.steadyState && (
            <div className="xp-alert xp-alert-warn" style={{ fontSize: '13.5px' }}>
              <strong>You are drinking about as fast as your body clears alcohol.</strong> Your BAC stops falling and stays high. Every extra drink pushes it up further. This is how long sessions end at dangerous levels without it ever feeling like a lot at once.
            </div>
          )}

          <div className="xp-alert xp-alert-info" style={{ fontSize: '13.5px' }}>
            <strong>Two peaks, two meanings.</strong> The <em>simulated peak</em> follows your drinks over time, so absorption and breakdown happen at the same time. The <em>Widmark peak</em> assumes every drink reached your blood at once. Your real peak usually sits between the two: closer to Widmark if you drink fast, closer to the simulation if you spread your drinks.
          </div>

          {/* Support footer */}
          <div className="xp-group" style={{ fontSize: '13.5px', color: 'var(--xp-text-dim)', padding: '12px 14px' }}>
            Concerned about alcohol use? <a href="https://www.jellinek.nl" target="_blank" rel="noopener noreferrer" style={{ color: '#2a6fdb' }}>Jellinek.nl</a> and <a href="https://www.trimbos.nl" target="_blank" rel="noopener noreferrer" style={{ color: '#2a6fdb' }}>Trimbos.nl</a> offer free, confidential support.
          </div>
        </div>
      </div>
      </Window>

      <Window title="How alcohol moves through your body" icon="guide" closeHref={null} headingLevel={2}
        status={['Every step is sourced', 'See the Sources page for details']}>
        <style>{`
          .edu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
          .edu { margin-top: 24px; padding-top: 18px; }
          .edu p { margin: 0 0 10px; line-height: 1.7; }
          .edu p:last-child { margin-bottom: 0; }
          .edu ul { margin: 0 0 10px; padding-left: 20px; line-height: 1.7; }
          .edu .calc { padding: 8px 12px; margin: 4px 0 10px; font-size: 13.5px; }
          @media (max-width: 760px) { .edu-grid { grid-template-columns: 1fr; } }
        `}</style>

        <p className="xp-intro">
          The curve above is pharmacokinetics: what your body does to alcohol. These four steps explain its shape,
          and the effect zones show the other side, what alcohol does to you.
        </p>

        <div className="edu-grid">
          <section className="xp-group edu">
            <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>1. Absorption: the curve goes up</h3>
            <p>
              After you drink, alcohol passes from your stomach and gut into your blood. For most people this is
              complete somewhere between 30 minutes and 2 hours after the drink, and it can take up to 2 hours after
              the last one.
            </p>
            <p>
              Food in your stomach slows this down and lowers the whole curve. That is why the &ldquo;after a meal&rdquo;
              option gives a slower, flatter rise. It also means your BAC can still be climbing when you have already stopped drinking.
            </p>
          </section>

          <section className="xp-group edu">
            <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>2. Distribution: why weight and sex matter</h3>
            <p>
              Alcohol spreads through the water in your body, so less body water means a higher concentration from the
              same drinks. That is why women, older people and people with more body fat usually reach a higher BAC.
            </p>
            <p>
              The Widmark factor <em>r</em> captures this. The calculator works out your body water from sex, age, height and
              weight (the Watson formula). Blood is about 80% water, so r = body water &divide; (0.8 &times; body weight).
            </p>
            <div className="calc xp-well">
              Body water, men: 2.447 &minus; 0.09516 &times; age + 0.1074 &times; height + 0.3362 &times; weight<br />
              Body water, women: &minus;2.097 + 0.1069 &times; height + 0.2466 &times; weight<br />
              Peak BAC = grams of alcohol &divide; (weight &times; r)<br />
              <span style={{ color: 'var(--xp-text-dim)' }}>
                Example: man, 25, 180 cm, 75 kg: 44.6 L body water, r &asymp; 0.74.
                Three standard drinks (30 g): 30 &divide; (75 &times; 0.74) &asymp; 0.54&permil;
              </span>
            </div>
          </section>

          <section className="xp-group edu">
            <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>3. Metabolism: what your liver does</h3>
            <p>
              Your liver breaks down more than 90% of the alcohol you drink. A small part is already broken down in your stomach.
            </p>
            <ul>
              <li><strong>Alcohol dehydrogenase (ADH)</strong> turns alcohol into acetaldehyde.</li>
              <li><strong>Aldehyde dehydrogenase (ALDH)</strong> turns acetaldehyde into acetate, which muscles and the heart use up.</li>
              <li><strong>CYP2E1</strong> handles about 10%. Regular heavy drinking makes the body produce more of it.</li>
            </ul>
          </section>

          <section className="xp-group edu">
            <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>4. Elimination: the curve goes down in a straight line</h3>
            <p>
              Most drugs leave your body faster when there is more of them. Alcohol does not. Once your BAC is above a very
              low level, the enzymes work at full capacity and remove a roughly fixed amount per hour. That is why the
              downslope on the graph is a straight line instead of a curve.
            </p>
            <p>
              For most people that fixed amount is between 0.10 and 0.25&permil; per hour. The blue line uses 0.15, and the
              shaded band shows the full range.
            </p>
            <div className="calc xp-well">
              From 1.0&permil; at 0.15&permil; per hour: 1.0 &divide; 0.15 &asymp; 6 hours 40 minutes until sober.<br />
              A slow eliminator (0.10&permil; per hour) needs 10 hours.
            </div>
          </section>
        </div>

        <div className="edu-grid">
          <section className="xp-group edu">
            <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>Coffee, water and cold showers</h3>
            <p>
              None of these speed up step 4. Coffee can make you feel more awake, but your liver still clears alcohol
              at the same pace. A cold shower, coffee or walking also does not help someone with alcohol poisoning,
              and can make things worse. Only time lowers your BAC.
            </p>
          </section>

          <section className="xp-group edu">
            <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>What counts as one drink</h3>
            <p>
              A Dutch standard drink contains about 10 grams of alcohol: 250 ml of beer at 5%, 100 ml of wine at 12.5%
              or 35 ml of spirits at 35%. Real servings are often bigger. A 330 ml bottle of 5% beer is 1.3 standard
              drinks, and a large glass of wine can easily be two.
            </p>
          </section>
        </div>

        <div className="xp-alert xp-alert-error" style={{ marginTop: '22px' }}>
          <strong>Alcohol poisoning: call 112.</strong> Call straight away if someone is confused, cannot stay awake or
          cannot be woken, is vomiting, has a seizure, breathes slowly or irregularly, or has cold, pale or bluish skin.
          Do not wait for all the signs. Stay with them. If they are lying down, roll them onto their side so they cannot
          choke if they vomit. Do not let them &ldquo;sleep it off&rdquo;: BAC can keep rising after someone has stopped
          drinking or passed out.
        </div>

        <div className="xp-alert xp-alert-warn" style={{ marginTop: '12px' }}>
          <strong>There is no safe amount for your long-term health.</strong> Alcohol is classified as a Group 1 carcinogen
          and causes at least seven types of cancer. No level has been found below which that risk disappears.
        </div>

        <section className="xp-group edu">
          <h3 className="xp-legend" style={{ fontWeight: 'bold' }}>What this model leaves out</h3>
          <ul>
            <li>It uses average values. Your own absorption, body water and elimination rate can differ.</li>
            <li>Food is modelled as slower absorption. In reality food also lowers how much alcohol reaches your blood, so the real curve after a meal can be lower still.</li>
            <li>Tolerance does not change your BAC, only how drunk you feel. Feeling fine is not the same as being under the limit.</li>
            <li>The effect zones are indications for experienced drinkers. If you rarely drink, you will feel stronger effects at lower levels.</li>
          </ul>
        </section>
      </Window>
    </main>
  )
}