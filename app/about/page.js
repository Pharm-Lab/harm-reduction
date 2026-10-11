import Link from 'next/link'
import Window from '@/app/components/Window'

const sections = [
  {
    title: 'Who I am',
    paras: [
      "I'm doing a master's in Biopharmaceutical Sciences at Leiden, after doing my bachelor's in Bio-Farmaceutische Wetenschappen (BFW) there too. Four years of pharmacokinetics, drug metabolism and pharmacology, and I didn't want any of it to go to waste.",
      "When I'm not doing this, I'm probably setting up the nth modded Minecraft server for my friends, producing hard electronic music, or letting it all go at a rave. I nerd out. Pharmacokinetics and raves are closer together than they sound, and that overlap is exactly where this site came from.",
      "In my friend group, mostly pharmacy and bioscience students, we have literally modelled our own pharmacology. Because we could, and because it's useful. At some point it seemed strange that this kind of knowledge only lives in university courses and textbooks.",
    ],
  },
  {
    title: 'Why harm reduction',
    paras: [
      "Accurate information reduces harm better than scare tactics. That's not a hot take. It's the foundation of harm reduction as a public health field.",
      "There are plenty of good harm reduction sites, and most do genuinely useful work. What I hadn't seen was one that starts from pharmacokinetics: real models, real parameters, here is what your body does and when. People who go out deserve to understand the pharmacology of what they take, without needing a degree first.",
      "myClearance doesn't tell you to use or not to use. It tells you what happens in your body, so the choices you make are informed ones.",
    ],
  },
  {
    title: 'What is on the site',
    paras: [
      "The alcohol calculator is the first complete PK-PD tool. It models how your blood alcohol rises and falls over a night, shows what each level does to you, and explains every step underneath.",
      "The other substances have information pages for now: what is actually being sold, the biggest risks, and the combinations to avoid. Interactive PK-PD tools for them are coming, but only once each one is as solid as the alcohol calculator.",
      "There is also an interaction checker for combinations, and a guide that explains how to read the graphs.",
    ],
  },
  {
    title: 'How it stays honest',
    paras: [
      "No accounts, no tracking, no ads. The calculator runs entirely in your browser. Nothing you enter is stored or sent anywhere.",
      "Every claim on the site comes from a source you can check. The Sources page lists each one, what information came from it and how it is used, with the date it was last checked.",
      "The calculations are fixed formulas from published pharmacokinetics. No AI is involved when you use the site.",
    ],
  },
  {
    title: 'On using Claude',
    paras: [
      "I used Claude, an AI assistant, throughout development. It made building faster and got me to something polished without months of grinding solo. The site in its current form wouldn't exist without it.",
      "The thinking is mine though. The parameters, the framing, what to build and why: that came from four years of courses and actually caring about this. Claude wrote a lot of the code and helped research and check sources. I decided what the site should do and say.",
      "I'd rather be upfront about that than pretend otherwise.",
    ],
  },
  {
    title: 'What this is not',
    paras: [
      "This is not medical advice and not dosing advice. The models use population averages, and your body can differ.",
      "myClearance is an independent student project. It is not affiliated with Leiden University or any other institution.",
      "If you are worried about your own use or someone else's, Jellinek, Trimbos and Drugsinfo.nl offer free and confidential help. In an emergency, call 112.",
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
            <p>A student project that got out of hand. Built between lectures, practicals and parties.</p>
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
          Start with the <Link href="/harm-reduction/alcohol">alcohol calculator</Link>, browse
          the <Link href="/harm-reduction">substance pages</Link>, or check
          the <Link href="/sources">sources</Link> behind everything.
        </div>
      </Window>
    </main>
  )
}
