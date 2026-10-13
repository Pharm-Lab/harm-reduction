"""MDMA PK-PD model used on myClearance (same equations as lib/mdmamath.js).

PK:  gut (A) -> plasma (X), clearance depends on CYP2D6 activity E, which MDMA switches off.
PD:  effect site (Ce) -> sigmoid Emax; a tolerance compartment (T) raises the EC50.
Doses are mg MDMA hydrochloride. Time in hours. Solved with Euler steps of DT hours.
"""
import math
from dataclasses import dataclass, replace

DT = 0.005  # h

@dataclass(frozen=True)
class Params:
    # PK, published
    ka: float = 1.17              # 1/h        Huestis 2024
    lag: float = 0.322            # h          Huestis 2024
    fm: float = 0.85              # -          Huestis 2024 (PBPK fm for CYP2D6)
    kdeg: float = math.log(2) / 46.6  # 1/h    O'Mathuna 2008 (CYP2D6 recovery half-life)
    # PK, fitted
    V: float = 350.0              # L
    CL0: float = 163.0            # L/h  clearance with fully active CYP2D6
    kinact: float = 3.72          # L/(mg h)
    # PD
    ec50: float = 74.0            # ng/mL      Hysek 2012 (pooled)
    ke0: float = 3.47             # 1/h        fitted
    hill: float = 3.0             # -          chosen (2, 2.5, 3 compared)
    ktol: float = 0.191           # 1/h        fitted
    alpha: float = 3.02           # -          fitted

DEFAULT = Params()

def simulate(doses, p=DEFAULT, t_end=24.0, dt=DT):
    """doses: list of (time_h, mg). Returns lists t, Cp (ng/mL), effect (%), E."""
    n = int(round(t_end / dt))
    starts = {}
    for td, mg in doses:
        k = int(round((td + p.lag) / dt))
        starts[k] = starts.get(k, 0.0) + mg
    A = X = Ce = T = 0.0
    E = 1.0
    ts, cs, es, ens = [], [], [], []
    for i in range(n + 1):
        A += starts.get(i, 0.0)
        c = X / p.V                      # mg/L
        ng = c * 1000.0                  # ng/mL
        ec = p.ec50 + p.alpha * T
        eff = 100.0 * Ce**p.hill / (Ce**p.hill + ec**p.hill) if Ce > 0 else 0.0
        ts.append(i * dt); cs.append(ng); es.append(eff); ens.append(E)
        cl = p.CL0 * ((1 - p.fm) + p.fm * E)
        dA = -p.ka * A
        dX = p.ka * A - cl * c
        dE = p.kdeg * (1 - E) - p.kinact * c * E
        A += dA * dt; X += dX * dt; E += dE * dt
        Ce += p.ke0 * (ng - Ce) * dt
        T += p.ktol * (Ce - T) * dt
    return ts, cs, es, ens

# ---------- summary measures used for fitting and checking ----------

def peak(ts, ys, after=0.0):
    i = max((j for j in range(len(ts)) if ts[j] >= after), key=lambda j: ys[j])
    return ys[i], ts[i]

def half_life(ts, cs, t1=12.0, t2=24.0):
    i1 = int(round(t1 / (ts[1] - ts[0]))); i2 = int(round(t2 / (ts[1] - ts[0])))
    return math.log(2) * (t2 - t1) / math.log(cs[i1] / cs[i2])

def effect_times(ts, es):
    """Onset, time of peak and offset, defined at 10% of the individual peak (as in Vizeli 2017)."""
    pk, tp = peak(ts, es)
    on = next(t for t, e in zip(ts, es) if e >= 0.1 * pk)
    ip = ts.index(tp)
    off = next((ts[j] for j in range(ip, len(ts)) if es[j] < 0.1 * pk), ts[-1])
    return on, tp, off, pk

def superposition_ratio(p, first, second, gap):
    """Peak after the second dose, divided by the peak expected from adding single-dose curves.
    The single-dose curves are computed with the same (non-linear) model, as in the papers."""
    ts, c2, _, _ = simulate([(0, first), (gap, second)], p)
    _, c1, _, _ = simulate([(0, first)], p)
    _, cb, _, _ = simulate([(0, second)], p)
    k = int(round(gap / DT))
    added = [c1[i] + (cb[i - k] if i >= k else 0.0) for i in range(len(ts))]
    return peak(ts, c2, after=gap)[0] / peak(ts, added, after=gap)[0]
