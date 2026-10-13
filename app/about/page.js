import Window from '@/app/components/Window'

const sections = [
  {
    title: 'Who made this',
    paras: [
      "I'm a master's student in Biopharmaceutical Sciences at Leiden, with a bachelor's in BFW from the same university. I also go out, and I noticed how little of what we learn about drugs in class reaches the people actually taking them.",
    ],
  },
  {
    title: 'Why',
    paras: [
      "Accurate information reduces harm better than scare tactics. myClearance shows what a substance does in your body and when, based on published pharmacokinetics. It doesn't tell you whether to use. It helps you understand what happens if you do.",
    ],
  },
  {
    title: 'How it works',
    paras: [
      "No accounts, no tracking, no ads. The calculator runs in your browser and nothing you enter leaves your device. Every claim links to a source on the Sources page.",
    ],
  },
  {
    title: 'Made with Claude',
    paras: [
      "I used Claude, an AI assistant, to write much of the code and to research and check sources. The choices about what to build and what to say are mine. When you use the site, no AI is involved: the calculations are fixed formulas.",
    ],
  },
]

export default function AboutPage() {
  return (
    <main className="xp-desktop">
      <style>{`
        .about-banner {
          display: flex; align-items: center; gap: 16px;
          margin: -16px -16px 0; padding: 22px 22px 18px;
          background:
            radial-gradient(ellipse 60% 120% at 100% 0%, rgba(167,139,250,.35), transparent 60%),
            linear-gradient(180deg, #2a1f6b, #1b1450);
          border-bottom: 2px solid; border-image: linear-gradient(90deg, #f5a623, #a78bfa 40%, #2f6fdb) 1;
        }
        .about-banner h1 { margin: 0; font: italic bold clamp(26px, 5vw, 38px) var(--xp-font-title); letter-spacing: -0.01em; color: #fff; text-shadow: 2px 2px 0 rgba(0,0,0,.4); }
        .about-banner h1 .my { color: #c9b8ff; font-weight: normal; }
        .about-banner p { margin: 2px 0 0; color: #c9cde3; }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 22px; margin-top: 8px; }
        .about-p { margin: 0 0 10px; line-height: 1.75; max-width: 68ch; }
        .about-p:last-child { margin-bottom: 0; }
        @media (max-width: 760px) { .about-grid { grid-template-columns: 1fr; } }
      `}</style>

      <Window
        title="About myClearance"
        icon="info"
        status={['Independent student project', 'No accounts, no tracking']}
      >
        <div className="about-banner">
          <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" style={{ flex: 'none' }}>
            <defs>
              <linearGradient id="about-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="1" stopColor="#7c3aed" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <path d="M47.56 16.44 A22 22 0 1 0 47.56 47.56" fill="none" stroke="url(#about-fade)" strokeWidth="7" strokeLinecap="round" />
            <circle cx="47.56" cy="16.44" r="6" fill="#a78bfa" />
          </svg>
          <div>
            <h1><span className="my">my</span>Clearance</h1>
            <p>Pharmacokinetics for a night out.</p>
          </div>
        </div>

        <div className="about-grid">
          {sections.map((s, i) => (
            <section key={i} className="xp-group" style={{ marginTop: '22px', paddingTop: '18px' }}>
              <h2 className="xp-legend" style={{ fontWeight: 'bold' }}>{s.title}</h2>
              {s.paras.map((p, j) => <p key={j} className="about-p">{p}</p>)}
            </section>
          ))}
        </div>

        <div className="xp-alert xp-alert-info" style={{ marginTop: '18px' }}>
          Not medical or dosing advice. An independent student project, not affiliated with Leiden University.
          Worried about your own use or someone else&apos;s? <a href="https://www.jellinek.nl" target="_blank" rel="noopener noreferrer">Jellinek</a> and <a href="https://www.drugsinfo.nl" target="_blank" rel="noopener noreferrer">Drugsinfo.nl</a> can help. In an emergency, call 112.
        </div>
      </Window>
    </main>
  )
}
