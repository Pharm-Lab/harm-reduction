'use client'
import Link from 'next/link'
import { Section, ParamTable, CompareTable, Equations, CodeFiles, Steps, Bullets, OriginLegend, SBox, SC, ArrowDefs } from './parts'

function Schematic() {
  const A = SC.arrow
  return (
    <svg viewBox="0 0 680 520" className="mdl-svg" role="img" aria-labelledby="mdma-s-t mdma-s-d">
      <title id="mdma-s-t">Structure of the MDMA PK-PD model</title>
      <desc id="mdma-s-d">A dose enters the gut and is absorbed into plasma. Elimination depends on the CYP2D6 enzyme, which MDMA in plasma switches off. Plasma concentration drives an effect site; the effect follows a sigmoid curve whose EC50 is raised by a tolerance compartment.</desc>
      <ArrowDefs id="mdarr" />
      <rect x="24" y="36" width="640" height="210" rx="8" fill="none" stroke="#4a5274" strokeDasharray="5 4" />
      <rect x="24" y="270" width="640" height="236" rx="8" fill="none" stroke="#4a5274" strokeDasharray="5 4" />
      <text x="44" y="196" fontSize="14" fontWeight="bold" fill={SC.pk.sub}>Pharmacokinetics</text>
      <text x="44" y="216" fontSize="12" fill={A}>blood level, ng/mL</text>
      <text x="44" y="440" fontSize="14" fontWeight="bold" fill={SC.pd.sub}>Pharmacodynamics</text>
      <text x="44" y="460" fontSize="12" fill={A}>felt effect, % of maximum</text>
      <SBox x={40} y={60} w={90} title="Dose" sub="mg at time t" c={SC.gray} />
      <line x1="130" y1="88" x2="148" y2="88" stroke={A} markerEnd="url(#mdarr)" />
      <SBox x={150} y={60} w={165} title="Gut (A)" sub="lag 0.32 h, ka 1.17/h" c={SC.pk} />
      <line x1="315" y1="88" x2="333" y2="88" stroke={A} markerEnd="url(#mdarr)" />
      <SBox x={335} y={60} w={160} title="Plasma (X)" sub="V 350 L, Cp = X/V" c={SC.pk} />
      <line x1="495" y1="88" x2="513" y2="88" stroke={A} markerEnd="url(#mdarr)" />
      <SBox x={515} y={60} w={135} title="Elimination" sub="CL set by E" c={SC.gray} />
      <SBox x={515} y={170} w={135} title="CYP2D6 (E)" sub="recovers t½ 46.6 h" c={SC.pk} />
      <path d="M470 116 V198 H513" fill="none" stroke={A} markerEnd="url(#mdarr)" />
      <text x="462" y="160" textAnchor="end" fontSize="12" fill={A}>switches off</text>
      <line x1="582" y1="170" x2="582" y2="118" stroke={A} strokeDasharray="4 3" markerEnd="url(#mdarr)" />
      <line x1="360" y1="116" x2="360" y2="298" stroke={A} markerEnd="url(#mdarr)" />
      <text x="368" y="263" fontSize="12" fill={A}>ke0 3.47/h</text>
      <SBox x={335} y={300} w={160} title="Effect site (Ce)" sub="lags behind Cp" c={SC.pd} />
      <line x1="495" y1="328" x2="513" y2="328" stroke={A} markerEnd="url(#mdarr)" />
      <SBox x={515} y={300} w={135} title="Effect" sub="sigmoid Emax, n 3" c={SC.pd} />
      <line x1="415" y1="356" x2="415" y2="418" stroke={A} markerEnd="url(#mdarr)" />
      <SBox x={335} y={420} w={160} title="Tolerance (T)" sub="ktol 0.19/h" c={SC.pd} />
      <path d="M495 448 H582 V358" fill="none" stroke={A} strokeDasharray="4 3" markerEnd="url(#mdarr)" />
      <text x="592" y="452" fontSize="12" fill={A}>raises EC50</text>
    </svg>
  )
}

const PARAMS = [
  { sym: 'lag', val: '0.322 h', what: 'Delay before absorption starts', origin: 'Published', src: 'Huestis 2024' },
  { sym: 'ka', val: '1.17 /h', what: 'Absorption rate from the gut', origin: 'Published', src: 'Huestis 2024' },
  { sym: 'fm', val: '0.85', what: 'Share of clearance through CYP2D6', origin: 'Published', src: 'Huestis 2024 (value used in their PBPK model)' },
  { sym: 'kdeg', val: 'ln2 / 46.6 h', what: 'Rate at which new CYP2D6 is made', origin: 'Published', src: "O'Mathúna 2008 (recovery half-life after MDMA)" },
  { sym: 'V', val: '350 L', what: 'Apparent volume of distribution', origin: 'Fitted', src: 'Targets from Vizeli 2017, Hysek 2012, Farré 2015' },
  { sym: 'CL0', val: '163 L/h', what: 'Clearance with fully working CYP2D6', origin: 'Fitted', src: 'Same targets as V' },
  { sym: 'kinact', val: '3.72 L/(mg h)', what: 'How fast MDMA switches off CYP2D6', origin: 'Fitted', src: 'Same targets as V' },
  { sym: 'EC50', val: '74 ng/mL (start)', what: 'Concentration giving half the maximum effect, before tolerance', origin: 'Published', src: 'Hysek 2012, pooled value, reused in a model with an effect-site delay' },
  { sym: 'ke0', val: '3.47 /h', what: 'Speed at which the effect site follows plasma', origin: 'Fitted', src: 'Timing from Vizeli 2017' },
  { sym: 'n', val: '3', what: 'Steepness of the effect curve', origin: 'Chosen', src: 'Best of 2, 2.5 and 3; a free fit gave 7.6, which made 50 mg almost unfelt' },
  { sym: 'ktol', val: '0.191 /h', what: 'Speed at which tolerance builds and fades', origin: 'Fitted', src: 'Vizeli 2017, Farré 2015' },
  { sym: 'alpha', val: '3.02', what: 'How much tolerance raises the EC50', origin: 'Fitted', src: 'Vizeli 2017, Farré 2015' },
  { sym: 'Band', val: '0.67 to 1.51 × curve', what: 'Shaded spread of peak levels between people', origin: 'Published', src: 'Holze 2020: 158 to 357 ng/mL around 236 after 125 mg' },
  { sym: 'dt', val: '0.005 h', what: 'Step size of the numerical solution', origin: 'Chosen', src: 'Euler method; a 5 times smaller step changes the peaks by less than 0.1%' },
]

const CAL = [
  { what: 'Peak blood level after 75 mg', target: '124.5 ng/mL', model: '126 ng/mL', src: 'Vizeli 2017' },
  { what: 'Peak blood level after 125 mg', target: '224 ng/mL', model: '222 ng/mL', src: 'Vizeli 2017' },
  { what: 'Time of peak blood level, 125 mg (not fitted)', target: '2.3 h', model: '2.3 h', src: 'Hysek 2012' },
  { what: 'Half-life, 125 mg', target: '8.2 h', model: '7.8 h', src: 'Hysek 2012' },
  { what: 'Second 100 mg dose after 4 h: peak versus simply adding the doses', target: '+23%', model: '+18%', src: 'Farré 2015' },
  { what: 'Same, peak after two doses versus after one', target: '2.08 ×', model: '2.04 ×', src: 'Farré 2015' },
  { what: 'Effect starts (10% of peak), 125 mg', target: '33 min', model: '36 min', src: 'Vizeli 2017' },
  { what: 'Strongest effect, 125 mg', target: '1.6 h', model: '1.3 h', src: 'Vizeli 2017' },
  { what: 'Effect duration, 125 mg', target: '4.2 ± 1.3 h', model: '4.9 h', src: 'Vizeli 2017' },
  { what: 'Overall peak effect with a second dose', target: 'not higher than one dose', model: 'not higher (second bump about half)', src: 'Farré 2015' },
]

const HELD_OUT = [
  { what: '50 mg, then 100 mg 2 h later: peak versus simply adding the doses', target: '+12.8%', model: '+14%', src: 'Peiró 2013' },
  { what: 'Same: peak after both doses versus 100 mg alone', target: '1.53 ×', model: '1.54 ×', src: 'Peiró 2013' },
  { what: 'Half-life longer after a higher dose (direction only)', target: 'yes (6.9 to 8.1 h)', model: 'yes (6.1 to 7.8 h)', src: 'Kolbrich 2008' },
]

export const MDMA_META = {
  id: 'mdma',
  name: 'MDMA PK-PD model',
  short: 'Blood level and felt effect of MDMA, including the self-blocking liver enzyme and acute tolerance.',
  status: 'Combined model built for this site',
  statusKind: 'warn',
  version: '1.0, 13 October 2026',
  usedOn: { label: 'MDMA calculator', href: '/harm-reduction/mdma' },
  tested: 'Checked against one independent study (Peiró 2013)',
}

export default function MdmaModel({ files }) {
  return (
    <>
      <div className="xp-alert xp-alert-warn">
        <strong>A combined model, built for this site.</strong> No single published study gives a complete PK-PD model for
        MDMA with all its numbers. This model joins published values from several studies with values we fitted ourselves
        so that it matches published measurements. It has not been peer reviewed. Everything needed to check or rebuild it
        is on this page.
      </div>

      <Section n={1} title="In short">
        <p>
          MDMA is absorbed from the gut into the blood, spreads through the body and is broken down mainly by the liver enzyme
          CYP2D6. MDMA damages that enzyme while it is being broken down, so clearance slows as you take more, and recovers
          over days. The felt effect follows the blood level with a short delay, but the brain quickly becomes less sensitive
          (acute tolerance), so the effect fades while MDMA is still in the blood.
        </p>
      </Section>

      <Section n={2} title="Structure">
        <Schematic />
        <p className="mdl-note">
          Solid arrows: MDMA moving or driving the next step. Dashed arrows: one part changing a value used by another. The
          only link between the two halves is the plasma concentration Cp.
        </p>
      </Section>

      <Section n={3} title="Equations">
        <Equations>{`Gut:           dA/dt   = −ka · A              (each dose is added to A at its time + lag)
Plasma:        dX/dt   = ka · A − CL · Cp      Cp = X / V
Clearance:     CL      = CL0 · ((1 − fm) + fm · E)
CYP2D6:        dE/dt   = kdeg · (1 − E) − kinact · Cp · E        (E starts at 1)
Effect site:   dCe/dt  = ke0 · (Cp − Ce)
Tolerance:     dT/dt   = ktol · (Ce − T)
Effect:        Effect  = 100 · Ceⁿ / (Ceⁿ + EC50ⁿ)    EC50 = 74 + alpha · T`}</Equations>
        <p className="mdl-note">
          Units: hours, mg and litres. Cp is in mg/L in the clearance and enzyme equations and in ng/mL in the effect equations.
          Doses are mg of MDMA hydrochloride, as in the studies. All states start at 0, except E, which starts at 1.
        </p>
      </Section>

      <Section n={4} title="Parameters">
        <OriginLegend />
        <ParamTable rows={PARAMS} />
      </Section>

      <Section n={5} title="How it was built, step by step">
        <Steps items={[
          ['Starting point', <>Huestis 2024 is the population PK model for MDMA with published values that we found. It is linear (V/F 462 L, CL/F 41.5 L/h), which means a second dose simply adds up. Studies show it does not (de la Torre 2000, Farré 2015), because MDMA switches off CYP2D6. So we kept its absorption (lag and ka) and replaced its fixed clearance with one that depends on the enzyme.</>],
          ['Simplification', 'Huestis combines a short zero-order input (0.304 h) with first-order absorption. We use first-order absorption only.'],
          ['Fixed from the literature', <>fm = 0.85 is the CYP2D6 share Huestis used in their PBPK model. kdeg comes from the measured recovery of CYP2D6 after MDMA (half-life 46.6 h, O&apos;Math&uacute;na 2008).</>],
          ['Fitting the blood curve', <>V, CL0 and kinact were fitted by least squares (Nelder-Mead on log-transformed values) to four targets: the peak levels after 75 and 125 mg, a half-life of 8 hours after 125 mg, and the 23% extra peak after a second dose (weighted 4 times). With V fixed at Huestis&apos;s 462 L these could not all be matched, so V was fitted too.</>],
          ['Choosing an effect model', 'The effect peaks and fades while the blood level is still high (Hysek 2012). We first tried a serotonin depletion model, where MDMA empties a store that refills slowly. It matched one dose, but made a second dose 4 hours later almost unfelt, which does not fit Farré 2015. A tolerance compartment that raises the EC50 fitted both, so we used that.'],
          ['Fitting the effect curve', <>EC50 was fixed at Hysek&apos;s 74 ng/mL. With the Hill slope n free, the fit chose about 7.6, which made 50 mg almost unfelt, so n was fixed and 2, 2.5 and 3 were compared; 3 fitted best. ke0, ktol and alpha were then fitted to Vizeli&apos;s onset, peak and offset after 125 mg, with a penalty if a second dose was felt less than 60% as strongly as the first.</>],
          ['Testing', 'The finished model was compared with the fitting targets and then with studies that were not used at all (section 6).'],
        ]} />
      </Section>

      <Section n={6} title="How well it matches the studies">
        <h4 className="mdl-h4">Targets used for fitting</h4>
        <CompareTable rows={CAL} />
        <h4 className="mdl-h4">Studies the model never saw</h4>
        <CompareTable rows={HELD_OUT} />
        <p className="mdl-note">
          All targets are group averages, not individual data. The Barcelona studies (Farré 2015, Peiró 2013) measured higher
          levels overall than the Basel studies (220 ng/mL after 100 mg, where this model gives 172), so for them the model is
          compared on relative changes. The Kolbrich doses were 1.0 and 1.6 mg/kg; the model was run at 75 and 125 mg, so that
          row only checks the direction of the change. No open dataset with individual MDMA blood levels or effect ratings was
          found; testing on individual data would need data from the study authors.
        </p>
      </Section>

      <Section n={7} title="Known weaknesses">
        <Bullets items={[
          'The effect curve is the least certain part. It is fitted to a handful of averages, and reuses an EC50 that Hysek estimated without an effect-site delay.',
          'ke0 is poorly pinned down: rerunning the fit from another starting point gives 3.8 instead of 3.5 per hour with an equally good fit. The curve barely changes across that range.',
          'The strongest effect comes about 20 minutes earlier than the study average, and the effect lasts about 40 minutes longer. Both are within the spread between people.',
          'We found no value for the enzyme switch-off rate measured in people that fits this simple setup, so kinact is a fitted number that also absorbs other sources of non-linearity.',
          'Up to about 5% of people, depending on ancestry, are born without a working CYP2D6 (Gaedigk 2017). The model does not cover them.',
          'No covariates. Huestis found none that mattered clinically, but women reached about 29% higher levels in the Basel studies (Vizeli 2017).',
          'The studies used healthy volunteers in a calm lab, mostly at doses up to 125 mg, and pills that contained only MDMA.',
        ]} />
      </Section>

      <Section n={8} title="Reproduce it">
        <Steps items={[
          ['Get the files', 'Download the files below. model.py contains the same equations and values as the site code, mdmamath.js.'],
          ['Install', <>Python 3 with numpy and scipy: <code>pip install numpy scipy</code></>],
          ['Check', <>Run <code>python check.py</code>. It prints the comparisons in section 6. Compare with expected_check_output.txt.</>],
          ['Refit', <>Run <code>python fit.py</code> (about 30 seconds). It refits the free values from the published targets and should give the values in expected_fit_output.txt.</>],
          ['Change something', 'Edit a value in model.py, or a target in fit.py, and rerun to see how much the result depends on it.'],
        ]} />
        <div style={{ marginTop: '12px' }}><CodeFiles files={files} /></div>
        <p className="mdl-note">
          Expected output was produced with Python 3.13, numpy 2.5 and scipy 1.18. These files are read straight from the site
          code when the site is built, so they always match what the calculator runs.
        </p>
      </Section>

      <Section n={9} title="Sources">
        <p>
          Huestis 2024, Vizeli &amp; Liechti 2017, Hysek 2012, Farr&eacute; 2015, O&apos;Math&uacute;na 2008, Holze 2020,
          de la Torre 2000, Gaedigk 2017, Peir&oacute; 2013 and Kolbrich 2008. The <Link href="/sources">Sources page</Link> lists
          each one with a link and exactly what was taken from it.
        </p>
      </Section>

      <Section n={10} title="Version history">
        <Bullets items={['1.0, 13 October 2026: first version.']} />
      </Section>
    </>
  )
}
