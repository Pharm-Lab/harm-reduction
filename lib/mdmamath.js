// MDMA PK-PD model for myClearance.
//
// Blood level (PK): one compartment with an absorption lag and first-order absorption
// (Huestis et al. 2024), plus clearance that falls as MDMA switches off its own
// breakdown enzyme CYP2D6 (mechanism-based inhibition). fm = 0.85 is the CYP2D6 share
// used by Huestis et al. 2024; the enzyme recovery half-life of 46.6 h is from
// O'Mathuna et al. 2008. V, CL0 and KINACT were fitted by us so the model reproduces:
//   - Cmax 124.5 ng/mL after 75 mg and 224 ng/mL after 125 mg (Vizeli & Liechti 2017)
//   - half-life about 8 h and Tmax about 2.3 h after 125 mg (Hysek et al. 2012)
//   - a second 100 mg dose 4 h after the first giving about 20% more than simple
//     addition predicts (Farre et al. 2015 report +23%)
//
// Effect (PD): effect compartment (ke0) with a sigmoid Emax curve. EC50 = 74 ng/mL is the
// pooled value from Hysek et al. 2012. Acute tolerance is a slow compartment that pushes
// the EC50 up while MDMA is present. ke0, the Hill slope and the tolerance terms were
// fitted by us to the timing in Vizeli & Liechti 2017 (onset 33 min, peak 1.6 h,
// duration 4.2 h) and to Farre et al. 2015 (a second dose does not double the effect).
// Doses are in mg of MDMA hydrochloride, as in these studies.

export const PK = {
  ka: 1.17,          // 1/h, Huestis 2024
  lag: 0.322,        // h, Huestis 2024
  V: 350,            // L, fitted
  CL0: 163,          // L/h, clearance with fully active CYP2D6, fitted
  fm: 0.85,          // share of clearance through CYP2D6, Huestis 2024
  kinact: 3.72,      // L/(mg h), fitted
  kdeg: Math.LN2 / 46.6, // 1/h, O'Mathuna 2008
}

export const PD = {
  ke0: 3.47,         // 1/h, fitted
  ec50: 74,          // ng/mL, Hysek 2012
  hill: 3,           // fitted
  ktol: 0.191,       // 1/h, fitted
  alpha: 3.02,       // EC50 rises by alpha ng/mL per ng/mL of tolerance, fitted
}

// Range of peak levels between people after 125 mg (Holze et al. 2020: 158 to 357 ng/mL
// around a geometric mean of 236 ng/mL).
export const BAND_LOW = 158 / 236
export const BAND_HIGH = 357 / 236

export function simulateMDMA({ doses, tEnd = 24, dt = 0.005 }) {
  const n = Math.round(tEnd / dt)
  const starts = doses.map(d => Math.round((d.timeh + PK.lag) / dt))
  let gut = 0, body = 0, enz = 1, ce = 0, tol = 0
  const pts = []
  const every = Math.max(1, Math.round(0.05 / dt))
  let minEnz = 1

  for (let i = 0; i <= n; i++) {
    doses.forEach((d, j) => { if (starts[j] === i) gut += d.mg })
    const c = body / PK.V                       // mg/L
    const ng = c * 1000                         // ng/mL
    const cl = PK.CL0 * ((1 - PK.fm) + PK.fm * enz)

    const ec = PD.ec50 + PD.alpha * tol
    const effect = ce > 0 ? 100 * ce ** PD.hill / (ce ** PD.hill + ec ** PD.hill) : 0

    if (i % every === 0) pts.push({ t: +(i * dt).toFixed(3), c: ng, e: effect, enz })
    if (enz < minEnz) minEnz = enz

    const dGut = -PK.ka * gut
    const dBody = PK.ka * gut - cl * c
    const dEnz = PK.kdeg * (1 - enz) - PK.kinact * c * enz
    gut += dGut * dt
    body += dBody * dt
    enz += dEnz * dt
    ce += PD.ke0 * (ng - ce) * dt
    tol += PD.ktol * (ce - tol) * dt
  }
  return { pts, minEnz }
}

export function mdmaMetrics(pts, minEnz) {
  if (!pts.length) return null
  let iC = 0, iE = 0
  pts.forEach((p, i) => { if (p.c > pts[iC].c) iC = i; if (p.e > pts[iE].e) iE = i })
  const peakC = pts[iC].c, peakE = pts[iE].e
  const onset = pts.find(p => p.e >= 0.1 * peakE)
  const fade = pts.slice(iE).find(p => p.e < 0.1 * peakE)
  const lastT = pts[pts.length - 1].t
  const low = pts.slice(iC).find(p => p.c < 0.1 * peakC)
  // Days until CYP2D6 is back to 90%: 1 - E(t) = (1 - Emin) * exp(-kdeg t)
  const recoverH = minEnz < 0.9 ? Math.log((1 - minEnz) / 0.1) / PK.kdeg : 0
  return {
    peakC: Math.round(peakC),
    peakCTime: pts[iC].t,
    peakE: Math.round(peakE),
    peakETime: pts[iE].t,
    onsetTime: onset?.t ?? null,
    fadeTime: fade?.t ?? null,
    fadeLevelPct: fade ? Math.round((fade.c / peakC) * 100) : null,
    lowTime: low?.t ?? null,
    lastT,
    minEnzPct: Math.round(minEnz * 100),
    recoverDays: recoverH / 24,
  }
}
