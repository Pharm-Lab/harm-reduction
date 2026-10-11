import Window from '@/app/components/Window'
export default function HarmReductionGuide() {
  const sections = [
    {
      title: 'What is on the graph?',
      emoji: '🩸',
      content: `The line shows how much of a substance is in your blood over time. For alcohol that is your blood alcohol concentration (BAC), measured in promille (‰): roughly grams of alcohol per litre of blood. For other drugs it is usually given in nanograms per millilitre (ng/mL).

This is a real, measurable number, not a feeling. A police blood test measures exactly this.`,
    },
    {
      title: "Why the curve doesn't equal how you feel",
      emoji: '🧠',
      content: `The graph shows pharmacokinetics: what your body does to the substance. How you feel is pharmacodynamics: what the substance does to you. The two are related but not the same.

There is a delay between a substance reaching your blood and reaching your brain, and your brain adapts while it is there. So you can feel effects getting stronger while the level in your blood is already falling, and feel them fade while a lot is still in your system.`,
    },
    {
      title: 'The redosing trap',
      emoji: '🔄',
      highlight: 'red',
      content: `The most dangerous misreading of a night out is: "I don't feel it anymore, so it must be gone."

Effects often fade long before a substance has left your body. MDMA has a half-life of 6 to 7 hours and amphetamine of roughly 4 to 12 hours, so a large part of the first dose is still there when the effect seems over.

Taking more at that point does not reset the night. It stacks on top of what is still in your blood and pushes the level higher than the first dose ever did. That is why "one more" late at night carries more risk than the first.`,
    },
    {
      title: 'What the coloured zones mean',
      emoji: '🎨',
      content: `The coloured bands on the alcohol graph show what people typically experience at each blood alcohol level, from relaxed below 0.5‰ to a risk of coma above 4‰. They are indications for experienced drinkers.

Your own experience can differ because of:
- Tolerance: regular drinkers feel less at the same BAC, but the BAC itself is the same
- How often you drink: if you rarely drink, you will feel stronger effects at lower levels
- Mood and setting: the same level can feel very different depending on where you are and how you feel
- Other substances: combinations change both the level in your blood and what it does to you

The zones are a guide, not a prediction.`,
    },
    {
      title: 'Multiple drinks and accumulation',
      emoji: '📈',
      content: `When you drink again before the last drink has been cleared, the new one adds on top of what is still there.

Try it on the alcohol calculator: add a second and third drink an hour apart. Each one lifts the curve from where it already was. If you keep drinking at about the pace your body clears alcohol, the line flattens at a high level instead of coming down. The calculator warns you when that happens.

The graph makes this visible. The feeling in your head does not.`,
    },
    {
      title: 'Half-life, and why alcohol is different',
      emoji: '⏳',
      content: `Most drugs leave your body with a half-life: after one half-life, half is left; after two, a quarter; after five, about 3%. Take a drug with a 10 hour half-life at midnight, and half of it is still in your body at 10am.

Alcohol works differently. Your liver removes a roughly fixed amount per hour, usually between 0.10 and 0.25‰. That is why the alcohol curve comes down as a straight line, and why a high BAC simply takes a long time: there is no way to speed it up.

A long tail affects:
- Sleep, which is often poor while a substance is still active
- Concentration, memory and reaction time the next day
- Driving: you can still be over the limit hours after you feel sober
- Mood in the days after a big night`,
    },
    {
      title: "Why 'I've done this loads of times' isn't safety data",
      emoji: '📊',
      content: `Tolerance means you need more to feel the same effect. It does not make the substance less harmful, and it does not lower the level in your blood.

So someone with a high tolerance who takes more to feel something also gets more of the risks that come with a higher dose. The graph shows amount and time. It does not adjust for experience.`,
    },
    {
      title: 'Uncertainty in these models',
      emoji: '📏',
      highlight: 'amber',
      content: `The alcohol calculator uses average values from published forensic and pharmacological research. Your own body can absorb, distribute and clear alcohol faster or slower.

PK-PD tools for other substances are being rebuilt. For some of them, especially newer cathinones like 2-MMC and NEP, there is very little human data at all.

Use the models to understand how your body handles a substance, not to calculate a "safe" amount.`,
    },
  ]

  return (
    <main className="xp-desktop" style={{ maxWidth: '840px' }}>
      <Window title="How to read the graphs" icon="guide" closeHref="/harm-reduction" status={['PK graph guide']}>
      <p className="xp-intro">
        The alcohol calculator shows a pharmacokinetic curve: how much alcohol is in your blood over time. That is not the same as how drunk or high you feel. Here is what the graph means, and why the difference matters. The sources are listed on the Sources page.
      </p>

      {sections.map((section, i) => {
        const kind = section.highlight === 'red' ? 'error' : section.highlight === 'amber' ? 'warn' : null
        const body = section.content.split('\n\n').map((para, j) => (
          <p key={j} style={{ margin: '0 0 10px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{para}</p>
        ))
        return kind ? (
          <div key={i} className={`xp-alert xp-alert-${kind}`} style={{ margin: '18px 0 6px' }}>
            <h2 style={{ fontSize: '14.5px', fontWeight: 'bold', margin: '0 0 8px', color: '#fff' }}>{section.title}</h2>
            {body}
          </div>
        ) : (
          <div key={i} className="xp-group" style={{ margin: '22px 0 6px', paddingTop: '18px' }}>
            <h2 className="xp-legend" style={{ fontSize: '14.5px', fontWeight: 'bold' }}>
              <span aria-hidden="true" style={{ marginRight: '6px' }}>{section.emoji}</span>{section.title}
            </h2>
            {body}
          </div>
        )
      })}
      </Window>
    </main>
  )
}