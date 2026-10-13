"""Compare the model (with the values used on the site) to the fitting targets and to held-out studies."""
from model import DEFAULT as p, simulate, peak, half_life, effect_times, superposition_ratio

def row(name, study, model, src):
    print(f'{name:<52}{study:>16}{model:>16}   {src}')

ts, c75, _, _ = simulate([(0, 75)], p)
_, c125, e125, _ = simulate([(0, 125)], p)
on, tp, off, _ = effect_times(ts, e125)
print('USED FOR FITTING')
row('Cmax 75 mg (ng/mL)', '124.5', f'{peak(ts, c75)[0]:.0f}', 'Vizeli 2017')
row('Cmax 125 mg (ng/mL)', '224', f'{peak(ts, c125)[0]:.0f}', 'Vizeli 2017')
row('Tmax 125 mg (h)', '2.34', f'{peak(ts, c125)[1]:.2f}', 'Hysek 2012 (not fitted)')
row('Half-life 125 mg (h)', '8.17', f'{half_life(ts, c125):.2f}', 'Hysek 2012')
row('100+100 mg, 4 h apart: vs adding doses', '+23.1%', f'{(superposition_ratio(p,100,100,4)-1)*100:+.1f}%', 'Farre 2015')
row('Effect onset / peak / offset (h)', '0.55/1.6/4.8', f'{on:.2f}/{tp:.2f}/{off:.2f}', 'Vizeli 2017')

print('\nHELD OUT (not used for fitting)')
_, c100, _, _ = simulate([(0, 100)], p)
_, c2h, _, _ = simulate([(0, 50), (2, 100)], p)
r = peak(ts, c2h)[0] / peak(ts, c100)[0]
row('50 then 100 mg, 2 h apart: vs adding doses', '+12.8%', f'{(superposition_ratio(p,50,100,2)-1)*100:+.1f}%', 'Peiro 2013')
row('Same: Cmax two doses / Cmax 100 mg alone', f'{311.16/202.92:.2f}x', f'{r:.2f}x', 'Peiro 2013')
row('Half-life longer after higher dose?', 'yes 6.9 -> 8.1', f'{half_life(ts, c75):.1f} -> {half_life(ts, c125):.1f}', 'Kolbrich 2008 (1.0 vs 1.6 mg/kg)')
