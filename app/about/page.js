import Link from 'next/link'
import Window from '@/app/components/Window'

const sections = [
  {
    label: 'Origin',
    title: 'Why I built this',
    paras: [
      "I'm doing a master's in Biopharmaceutical Sciences at Leiden — did my bachelor's in Bio-pharmaceutische Wetenschappen (BFW) there too. This started as a way to not let that bachelor go completely to waste and stay sharp on things I'd spent four years learning.",
      "If I weren't doing this I'd be making the nth modded Minecraft server to play with friends, producing hard electronic music, or just letting it all go at a rave for a bit. I nerd out. Occasionally geek tf out. Pharmacokinetics and raves are not as far apart as they sound — and that's actually where the harm reduction side of this came from.",
      "Within my friend group — mostly pharmacy and bioscience students — we've sometimes literally modelled our own pharmacology. Because we could, and because it's useful. Meanwhile I was manually counting colonies by hand in practicals thinking 'there has to be a better way' (there was — I used ImageJ — but it still felt clunky). At some point it just seemed weird that none of this existed somewhere accessible, outside of university courses or tools built for academic and industrial labs.",
    ],
  },
  {
    label: 'For who',
    title: "Who it's for",
    paras: [
      "Primarily BFW and BPS students at Leiden, since that's where this came from — but honestly anyone in a related programme. Pharmacy, biomedical sciences, a similar HBO track, or just someone anywhere in the world following a curriculum that touches on this stuff.",
      "If you've had a PK course and want to actually interact with the equations rather than just read about them, this is for you. The lab tools are for anyone spending time at a bench. The harm reduction section has no prerequisites.",
    ],
  },
  {
    label: 'Harm reduction',
    title: 'Why that section is free',
    paras: [
      "Accurate information reduces harm better than scare tactics. That's not a take — it's the entire foundation of harm reduction as a public health field. There are plenty of harm reduction sites out there, and most of them do genuinely useful work. But I hadn't seen one approach it from a pharmacokinetics angle: actual models, actual parameters, here's what your body does and when.",
      "BPS students kind of have that background by default. It seemed worth making it more accessible to people who didn't spend three years studying drug metabolism. I go to parties. I think people deserve to understand the pharmacology of what they're taking. Those tools are free and will stay that way.",
    ],
  },
  {
    label: 'Process',
    title: 'On using Claude',
    paras: [
      "I used Claude throughout development — it made execution faster and got me to something polished without months of grinding solo. The site in its current form wouldn't exist without it.",
      "The thinking is mine though. The parameters, the framing, what to build and why — that came from four years of courses and actually caring about this stuff. Claude wrote a lot of the code. I decided what it should do.",
      "I'd rather be upfront about that than pretend otherwise. I don't think AI is magic, but taking on a large chunk of the implementation work for a project like this seems like a completely reasonable use of it.",
    ],
  },
]

export default function AboutPage() {
  return (
    <main className="xp-desktop">
      <style>{`
        .about-banner {
          display: flex; align-items: center; gap: 16px;
          margin: -14px -14px 0; padding: 22px 22px 18px;
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
        status={['Independent student project', 'Not affiliated with Leiden University or any institution']}
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
            <p>A student project that got out of hand. Built in between lectures, practicals and parties.</p>
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
          Educational purposes only. The models use population averages, and nothing here is medical advice.
          See the <Link href="/sources">sources</Link> behind every calculator, or go to the <Link href="/harm-reduction">calculators</Link>.
        </div>
      </Window>
    </main>
  )
}
