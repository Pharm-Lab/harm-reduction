'use client'
import Link from 'next/link'
import { Section, ParamTable, CompareTable, Equations, CodeFiles, Steps, Bullets, OriginLegend, SBox, SC, ArrowDefs } from './parts'

function Schematic() {
  const A = SC.arrow
  return (
    <svg viewBox="0 0 680 290" className="mdl-svg" role="img" aria-labelledby="alc-s-t alc-s-d">
      <title id="alc-s-t">Structure of the alcohol model</title>
      <desc id="alc-s-d">Each drink enters the stomach and gut and is absorbed into body water. The liver removes a fixed amount per hour. Body water is estimated from your details with the Watson formula, which sets the distribution factor r. The blood alcohol level is then matched to effect zones.</desc>
      <ArrowDefs id="alcarr" />
      <SBox x={40} y={60} w={100} title="Drinks" sub="grams, time" c={SC.gray} />
      <line x1="140" y1="88" x2="158" y2="88" stroke={A} markerEnd="url(#alcarr)" />
      <SBox x={160} y={60} w={150} title="Stomach, gut" sub="ka 6/h or 1.5/h" c={SC.pk} />
      <line x1="310" y1="88" x2="328" y2="88" stroke={A} markerEnd="url(#alcarr)" />
      <SBox x={330} y={60} w={150} title="Body water" sub="BAC, Vd = r × W" c={SC.pk} />
      <line x1="480" y1="88" x2="498" y2="88" stroke={A} markerEnd="url(#alcarr)" />
      <SBox x={500} y={60} w={150} title="Liver" sub="−0.15 g/L per hour" c={SC.gray} />
      <SBox x={40} y={190} w={170} title="Your details" sub="sex, age, height, W" c={SC.gray} />
      <line x1="210" y1="218" x2="228" y2="218" stroke={A} markerEnd="url(#alcarr)" />
      <SBox x={230} y={190} w={170} title="Watson r" sub="r = TBW / (0.8 × W)" c={SC.pk} />
      <path d="M400 218 H415 V118" fill="none" stroke={A} strokeDasharray="4 3" markerEnd="url(#alcarr)" />
      <path d="M470 116 V218 H498" fill="none" stroke={A} markerEnd="url(#alcarr)" />
      <SBox x={500} y={190} w={150} title="Effect zones" sub="lookup by BAC" c={SC.pd} />
      <text x="40" y="276" fontSize="12" fill={A}>Solid: alcohol or BAC moving on. Dashed: your details setting the size of the body water.</text>
    </svg>
  )
}

const PARAMS = [
  { sym: 'Widmark equation', val: 'BAC = g ÷ (W × r)', what: 'Core of the model: alcohol spreads through body water', origin: 'Published', src: 'Widmark 1932' },
  { sym: 'TBW (men)', val: '2.447 − 0.09516·age + 0.1074·height + 0.3362·W', what: 'Total body water in litres', origin: 'Published', src: 'Watson 1980, checked against two independent pages' },
  { sym: 'TBW (women)', val: '−2.097 + 0.1069·height + 0.2466·W', what: 'Total body water in litres', origin: 'Published', src: 'Watson 1980' },
  { sym: '0.8', val: '0.8', what: 'Water fraction of blood, turns body water into r', origin: 'Published', src: 'Univ. of Wisconsin alcohol methods; BoozeLib documentation' },
  { sym: 'r limits', val: '0.4 to 0.95', what: 'Keeps r in a realistic range for unusual inputs', origin: 'Chosen', src: 'Safety limit; typical adults come out between about 0.5 and 0.85' },
  { sym: 'ka fasting', val: '6 /h', what: 'Absorption rate on an empty stomach', origin: 'Chosen', src: '95% absorbed after 30 min, the fast end of the 30 min to 2 h range (Mozayani, OSAC)' },
  { sym: 'ka after a meal', val: '1.5 /h', what: 'Absorption rate after food', origin: 'Chosen', src: '95% absorbed after 2 h, the slow end of that range; food slows absorption (Jones 1994)' },
  { sym: 'β', val: '0.15 g/L per h', what: 'Fixed amount the liver removes per hour', origin: 'Chosen', src: 'A typical value inside the 0.10 to 0.25 range (OSAC)' },
  { sym: 'β band', val: '0.10 to 0.25 g/L per h', what: 'Shaded band: slow to fast eliminators', origin: 'Published', src: 'OSAC 2020-S-0003' },
  { sym: 'Low-level cut-off', val: '0.01 g/L', what: 'Below this, elimination slows in proportion to BAC so the curve reaches zero smoothly', origin: 'Chosen', src: 'Numerical choice; affects only the last minutes' },
  { sym: 'Ethanol density', val: '0.789 g/mL', what: 'Turns mL of pure alcohol into grams', origin: 'Constant', src: 'Physical constant' },
  { sym: 'Solver', val: 'RK4, step ≤ 0.01 h', what: 'Numerical solution of the equations', origin: 'Chosen', src: 'max(2000, 100 × hours) steps' },
  { sym: 'Effect zones', val: '0.5 / 1.5 / 3 / 4 ‰', what: 'Boundaries of relaxed, tipsy, drunk, stupor, coma risk', origin: 'Published', src: 'alcoholinfo.nl' },
]

const CHECKS = [
  { what: 'Very fast absorption gives the Widmark peak (30 g, 75 kg man, r 0.74)', target: '0.54‰ (formula)', model: '0.53‰', src: 'Widmark 1932' },
  { what: 'Downslope once absorption is done', target: '0.15‰ per hour', model: '0.150‰ per hour', src: 'Set by β' },
  { what: '95% absorbed, fasting and after a meal', target: '30 min to 2 h', model: '0.5 h and 2.0 h', src: 'Mozayani; OSAC' },
  { what: 'Same 30 g: peak fasting and after a meal', target: 'lower after food', model: '0.44‰ at 31 min, 0.27‰ at 1.1 h', src: 'Jones 1994 (direction)' },
]

export const ALCOHOL_META = {
  id: 'alcohol',
  name: 'Alcohol model (Widmark)',
  short: 'Blood alcohol over time: first-order absorption, personal body water and a fixed elimination rate.',
  status: 'Established forensic method, with our absorption choices',
  statusKind: 'ok',
  version: '1.0, 13 October 2026',
  usedOn: { label: 'Alcohol calculator', href: '/harm-reduction/alcohol' },
  tested: 'Internal checks only; not yet compared with measured blood curves',
}

export default function AlcoholModel({ files }) {
  return (
    <>
      <div className="xp-alert xp-alert-info">
        <strong>Built on the Widmark method that forensic labs use</strong>, with personal body water from the Watson formula.
        The absorption speeds are our own choices, picked to match the published range. The model has not yet been compared
        with measured blood alcohol curves.
      </div>

      <Section n={1} title="In short">
        <p>
          Each drink is absorbed from the stomach and gut at a steady rate. Once in the blood, alcohol spreads through all the
          water in your body, so the amount of body water (estimated from your sex, age, height and weight) sets how high the
          level gets. The liver then removes a fixed amount per hour, whatever the level, which is why the curve goes down in a
          straight line.
        </p>
      </Section>

      <Section n={2} title="Structure">
        <Schematic />
      </Section>

      <Section n={3} title="Equations">
        <Equations>{`Drink:         grams   = mL × ABV × 0.789
Gut (drink i): dAi/dt  = −ka · Ai                  (Ai = grams still to be absorbed)
Blood:         dBAC/dt = Σ ka · Ai / (r · W) − β · min(1, BAC / 0.01)
Body water:    r       = TBW / (0.8 · W)           (limited to 0.4 to 0.95)
Men:           TBW     = 2.447 − 0.09516·age + 0.1074·height + 0.3362·W
Women:         TBW     = −2.097 + 0.1069·height + 0.2466·W
Readout:       Widmark peak = total grams / (W · r)`}</Equations>
        <p className="mdl-note">
          Units: hours, grams, kg (W is body weight), cm, litres. BAC is in grams per litre of blood, which equals promille (‰),
          the unit of Dutch driving limits. The shaded band repeats the calculation with β = 0.10 and β = 0.25.
        </p>
      </Section>

      <Section n={4} title="Parameters">
        <OriginLegend />
        <ParamTable rows={PARAMS} />
      </Section>

      <Section n={5} title="How it was built">
        <Steps items={[
          ['Core', 'The Widmark equation with zero-order elimination is the standard method in forensic alcohol calculations (OSAC). We kept it as is.'],
          ['Absorption over time', 'Widmark assumes all alcohol arrives at once. To draw a curve over a night, each drink is absorbed with a first-order rate. No single study gives one rate for everyone, so we chose rates that put the end of absorption at the two ends of the published 30 minutes to 2 hours.'],
          ['Personal body water', 'Instead of the fixed averages r = 0.68 (men) and 0.55 (women), r is calculated from body water with the Watson formula, as in published alcohol research methods.'],
          ['Elimination', 'A typical rate of 0.15 g/L per hour, with the published range 0.10 to 0.25 shown as a band.'],
          ['Checks', 'The model was checked for internal consistency (section 6). It has not yet been fitted to or tested against measured blood alcohol data.'],
        ]} />
      </Section>

      <Section n={6} title="Checks">
        <CompareTable rows={CHECKS} />
        <p className="mdl-note">
          These checks show that the code does what the equations say. They are not a test against real people. Comparing the
          curves with published measured blood alcohol curves is a planned next step.
        </p>
      </Section>

      <Section n={7} title="Known weaknesses">
        <Bullets items={[
          'Food is only modelled as slower absorption. In reality food also lowers how much alcohol reaches the blood, so real curves after a meal are often lower.',
          'The absorption rates are chosen, not measured, and absorption varies a lot between people and drinks.',
          'Elimination varies between people and can be faster in regular heavy drinkers, whose liver makes more CYP2E1 (Jiang 2020). The band shows the usual range.',
          'The effect zones are indications for experienced drinkers, not a model of each person.',
        ]} />
      </Section>

      <Section n={8} title="Reproduce it">
        <p>
          The whole model is in one JavaScript file with no dependencies. It can be run in Node.js: import <code>simulateBAC</code>
          and pass a list of drinks with time, grams and ka.
        </p>
        <div style={{ marginTop: '10px' }}><CodeFiles files={files} /></div>
      </Section>

      <Section n={9} title="Sources">
        <p>
          Widmark 1932, Watson 1980, OSAC 2020-S-0003, Mozayani (NIST), Jones 1994, University of Wisconsin alcohol methods,
          BoozeLib documentation, Jiang 2020 and alcoholinfo.nl. See the <Link href="/sources">Sources page</Link> for links and exactly
          what was taken from each.
        </p>
      </Section>

      <Section n={10} title="Version history">
        <Bullets items={['1.0, 13 October 2026: first documented version, with Watson body water and the binge session mode.']} />
      </Section>
    </>
  )
}
