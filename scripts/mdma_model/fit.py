"""Re-fit the free parameters of the MDMA model from published summary data.

Step 1 (PK): fit V, CL0, kinact with ka, lag, fm, kdeg fixed.
Step 2 (PD): with the PK fixed, fit ke0, ktol, alpha for each Hill slope in (2, 2.5, 3); keep the best.
Run:  python fit.py      (needs numpy and scipy; takes a few minutes)
"""
import numpy as np
from dataclasses import replace
from scipy.optimize import minimize
from model import DEFAULT, simulate, peak, half_life, effect_times, superposition_ratio

# ---- published targets ----
T_CMAX_75, T_CMAX_125 = 124.5, 224.0     # ng/mL, Vizeli & Liechti 2017
T_THALF_125 = 8.0                        # h, Hysek 2012 reports 8.17
T_SUPERPOS = 1.231                       # Farre 2015: +23.1% Cmax after 100 + 100 mg, 4 h apart
T_ONSET, T_PEAK, T_OFF = 0.55, 1.6, 4.6  # h, Vizeli & Liechti 2017 (33 min, 1.6 h, onset + about 4.2 h duration)
MIN_SECOND_BUMP = 0.6                    # Farre 2015: second dose still felt; penalise if bump < 60% of first peak

def pk_loss(x):
    V, CL0, kin = np.exp(x)
    p = replace(DEFAULT, V=V, CL0=CL0, kinact=kin)
    ts, c75, _, _ = simulate([(0, 75)], p)
    _, c125, _, _ = simulate([(0, 125)], p)
    return (((peak(ts, c75)[0] - T_CMAX_75) / T_CMAX_75) ** 2
            + ((peak(ts, c125)[0] - T_CMAX_125) / T_CMAX_125) ** 2
            + 4 * (superposition_ratio(p, 100, 100, 4) - T_SUPERPOS) ** 2
            + ((half_life(ts, c125) - T_THALF_125) / T_THALF_125) ** 2)

def pd_loss(x, p0):
    ke0, ktol, alpha = np.exp(x)
    p = replace(p0, ke0=ke0, ktol=ktol, alpha=alpha)
    ts, _, e125, _ = simulate([(0, 125)], p)
    on, tp, off, _ = effect_times(ts, e125)
    _, _, e1, _ = simulate([(0, 100)], p)
    _, _, e2, _ = simulate([(0, 100), (4, 100)], p)
    bump = peak(ts, e2, after=4.0)[0] / peak(ts, e1)[0]
    return (((on - T_ONSET) / T_ONSET) ** 2 + ((tp - T_PEAK) / T_PEAK) ** 2
            + 2 * ((off - T_OFF) / T_OFF) ** 2 + 4 * max(0.0, MIN_SECOND_BUMP - bump) ** 2)

if __name__ == '__main__':
    r = minimize(pk_loss, np.log([348, 165, 3.7]), method='Nelder-Mead', options={'maxiter': 300})
    V, CL0, kin = np.exp(r.x)
    print(f'PK  V={V:.0f} L  CL0={CL0:.1f} L/h  kinact={kin:.2f} L/(mg h)  loss={r.fun:.4f}')
    p = replace(DEFAULT, V=V, CL0=CL0, kinact=kin)
    best = None
    for n in (2.0, 2.5, 3.0):
        pn = replace(p, hill=n)
        r = minimize(pd_loss, np.log([3.2, 0.19, 3.06]), args=(pn,), method='Nelder-Mead', options={'maxiter': 300})
        ke0, ktol, alpha = np.exp(r.x)
        print(f'PD  n={n}: ke0={ke0:.2f}/h ktol={ktol:.3f}/h alpha={alpha:.2f}  loss={r.fun:.4f}')
        if best is None or r.fun < best[0]:
            best = (r.fun, n, ke0, ktol, alpha)
    print('Best Hill slope:', best[1])
