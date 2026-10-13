# MDMA PK-PD model: reproduce and check

The calculator on the MDMA page runs `lib/mdmamath.js`. This folder holds the same model in Python, plus the scripts used to fit it and to check it.

| File | What it does |
|---|---|
| `model.py` | The model equations and default parameters (identical to `lib/mdmamath.js`) |
| `fit.py` | Refits the free parameters from published summary data (about 30 seconds) |
| `check.py` | Compares the model with the fitting targets and with studies that were not used for fitting |

## Run

```
pip install numpy scipy
python check.py
python fit.py
```

## How the fit works

1. Fixed from the literature: `ka`, `lag` (Huestis 2024), `fm` (Huestis 2024 PBPK), `kdeg` (O'Mathuna 2008), `ec50` start value (Hysek 2012).
2. PK fit: `V`, `CL0` and `kinact` by least squares (Nelder-Mead on log parameters) against peak levels after 75 and 125 mg (Vizeli 2017), half-life after 125 mg (Hysek 2012) and the extra peak after a second dose 4 h later (Farre 2015, weighted 4x).
3. PD fit: with the PK fixed, `ke0`, `ktol` and `alpha` for Hill slopes 2, 2.5 and 3, against effect onset, peak and offset after 125 mg (Vizeli 2017), with a penalty if a second dose 4 h later is felt less than 60% as strongly as the first (Farre 2015). The lowest loss wins.

Every target is a group mean taken from a paper, not individual data. `ke0` is weakly identified: values from about 3.5 to 3.8 per hour fit equally well.

## Held-out test

Peiro et al. 2013 (50 mg, then 100 mg two hours later) was not used for fitting.

| Measure | Study | Model |
|---|---|---|
| Extra peak compared with simply adding the doses | +12.8% | +14% |
| Peak after both doses ÷ peak after 100 mg alone | 1.53 | 1.54 |
