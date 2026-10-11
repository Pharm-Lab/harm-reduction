import Link from 'next/link'
import Window from '@/app/components/Window'
import XpIcon from '@/app/components/XpIcon'
import SubstanceIcon from '@/app/components/SubstanceIcon'

const SUBSTANCES = [
  { icon:'alcohol',      title:'Alcohol',      tag:'PK-PD calculator', desc:'Watch your blood alcohol rise and fall over a night, with effects, driving limits and how your body clears it.', href:'/harm-reduction/alcohol' },
  { icon:'mdma',         title:'MDMA',         tag:'Info page',        desc:'Pill strength, what else turns up in samples, overheating and risky combinations.', href:'/harm-reduction/mdma' },
  { icon:'cannabis',     title:'Cannabis',     tag:'Info page',        desc:'Why edibles catch people out, and the mental health risks of frequent use.', href:'/harm-reduction/cannabis' },
  { icon:'cocaine',      title:'Cocaine',      tag:'Info page',        desc:'Rising purity, what it is cut with, and why mixing with alcohol is riskier.', href:'/harm-reduction/cocaine' },
  { icon:'amphetamines', title:'Amphetamines', tag:'Info page',        desc:'Why speed keeps you up so long, and what else is often in it.', href:'/harm-reduction/amphetamines' },
  { icon:'ketamine',     title:'Ketamine',     tag:'Info page',        desc:'Bladder damage from regular use, addiction, and combinations to avoid.', href:'/harm-reduction/ketamine' },
  { icon:'cathinones',   title:'Cathinones',   tag:'Info page',        desc:'Why "3-MMC" is almost never 3-MMC, with 2025 testing data from the Netherlands.', href:'/harm-reduction/cathinones' },
]

const RESOURCES = [
  { icon:'interactions', title:'Interaction checker', desc:'How recreational and prescription drugs combine, and how dangerous each pairing is.', href:'/harm-reduction/interactions' },
  { icon:'guide', title:'PK graph guide',      desc:'What the curves mean in plain English: peak, half-life, and why you can still be high.', href:'/harm-reduction/guide' },
  { icon:'guide', title:'Sources',             desc:'Every source behind the site, with what came from it and how it is used.', href:'/sources' },
]

const SUPPORT = [
  { name:'Jellinek',          desc:'Addiction care and advice, Netherlands',           url:'https://www.jellinek.nl',   flag:'nl' },
  { name:'Trimbos Instituut', desc:'National drug monitor, research and helpline',     url:'https://www.trimbos.nl',    flag:'nl' },
  { name:'Drugsinfo.nl',      desc:'Independent drug information and testing',         url:'https://www.drugsinfo.nl',  flag:'nl' },
  { name:'TripSit',           desc:'Live drug information and harm reduction chat',    url:'https://tripsit.me',        flag:'globe' },
  { name:'DanceSafe',         desc:'Drug checking and information at events',          url:'https://dancesafe.org',     flag:'globe' },
  { name:'The Loop',          desc:'Festival drug checking and welfare services',      url:'https://wearetheloop.org',  flag:'globe' },
]

export default function HarmReductionPage() {
  const count = SUBSTANCES.length + RESOURCES.length
  return (
    <main className="xp-desktop">
      <style>{`
        .ex { display: grid; grid-template-columns: 240px 1fr; min-height: 100%; }
        .ex-side {
          padding: 12px 10px;
          background: linear-gradient(180deg, #2a2438 0%, #1d1927 100%);
          border-right: 1px solid var(--xp-lo);
        }
        .ex-panel { background: var(--xp-face-2); border-radius: 3px 3px 0 0; margin-bottom: 12px; overflow: hidden; }
        .ex-panel h2 {
          margin: 0; padding: 7px 12px; font: bold 13.5px var(--xp-font);
          color: #fff; background: linear-gradient(90deg, #6a4ee6, #3f2a9e);
          text-shadow: 1px 1px 0 rgba(0,0,0,.4);
        }
        .ex-panel ul { list-style: none; margin: 0; padding: 10px 12px; display: grid; gap: 8px; }
        .ex-panel a { display: flex; align-items: center; gap: 7px; color: var(--xp-text); text-decoration: none; font-size: 13.5px; }
        .ex-panel a:hover { color: #fff; text-decoration: underline; }
        .ex-panel p { margin: 0; padding: 10px 12px; font-size: 12.5px; line-height: 1.55; color: var(--xp-text-dim); }
        .ex-main { padding: 16px 20px 22px; min-width: 0; }
        .ex-group {
          margin: 10px 0 14px; padding-bottom: 4px;
          font: bold 15px var(--xp-font); color: var(--xp-accent);
          border-bottom: 1px solid; border-image: linear-gradient(90deg, var(--xp-accent), transparent 70%) 1;
        }
        .ex-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 8px 16px; margin-bottom: 22px; }
        .ex-tile {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 10px; border: 1px solid transparent; border-radius: 2px;
          color: var(--xp-text); text-decoration: none;
        }
        .ex-tile:hover { background: rgba(122,92,240,.22); border-color: rgba(167,139,250,.55); color: #fff; }
        .ex-tile:focus-visible { background: #3d2aa8; outline: 1px dotted #fff; outline-offset: -2px; }
        .ex-tile .big {
          flex: none; width: 68px; height: 68px; display: grid; place-items: center;
          background: var(--xp-sunken);
          border: 1px solid; border-color: var(--xp-lo) var(--xp-hi) var(--xp-hi) var(--xp-lo);
        }
        .ex-tile b { display: block; margin-bottom: 3px; font-size: 16px; }
        .tag { display: inline-block; margin-left: 6px; padding: 0 6px; font-size: 11px; font-weight: normal; vertical-align: 2px; color: var(--xp-text-dim); border: 1px solid var(--xp-etch); border-radius: 2px; }
        .tag-on { color: #fff; background: linear-gradient(180deg, #6a4ee6, #3f2a9e); border-color: #2a1a70; }
        .ex-tile span.d { display: block; font-size: 13px; line-height: 1.5; color: var(--xp-text-dim); }
        .ex-tile:hover span.d { color: #c9cde3; }
        .ex-tile.small .big { width: 44px; height: 44px; }
        .ex-tile.small b { font-size: 14.5px; }
        @media (max-width: 760px) {
          .ex { grid-template-columns: 1fr; }
          .ex-side { order: 2; border-right: 0; border-top: 1px solid var(--xp-lo); }
        }
      `}</style>

      <Window
        title="myClearance"
        icon="folder"
        closeHref={null}
        bodyStyle={{ padding: 0 }}
        status={[`${count} objects`, 'Runs on your device. Nothing you enter is sent anywhere.']}
      >
        <div className="ex">
          <aside className="ex-side">
            <div className="ex-panel">
              <h2>Other places</h2>
              <ul>
                <li><Link href="/harm-reduction/interactions"><XpIcon name="interactions" />Interaction checker</Link></li>
                <li><Link href="/harm-reduction/guide"><XpIcon name="guide" />PK graph guide</Link></li>
                <li><Link href="/sources"><XpIcon name="folder" />Sources</Link></li>
                <li><Link href="/about"><XpIcon name="info" />About myClearance</Link></li>
              </ul>
            </div>
            <div className="ex-panel">
              <h2>Details</h2>
              <p>
                The alcohol calculator models how alcohol moves through your body, using published data.
                The other substances have information pages while their PK-PD tools are being built.
                Everything here is educational, not medical advice.
              </p>
            </div>
            <div className="ex-panel">
              <h2>Privacy</h2>
              <p>No accounts and no tracking. Everything is calculated in your browser, and nothing you enter is stored or sent.</p>
            </div>
          </aside>

          <div className="ex-main">
            <h2 className="ex-group">Substances</h2>
            <div className="ex-tiles">
              {SUBSTANCES.map(s => (
                <Link key={s.href} href={s.href} className="ex-tile">
                  <span className="big" aria-hidden="true"><SubstanceIcon name={s.icon} size={62} /></span>
                  <span><b>{s.title} <span className={s.tag.startsWith('PK') ? 'tag tag-on' : 'tag'}>{s.tag}</span></b><span className="d">{s.desc}</span></span>
                </Link>
              ))}
            </div>

            <h2 className="ex-group">Resources</h2>
            <div className="ex-tiles">
              {RESOURCES.map(s => (
                <Link key={s.href} href={s.href} className="ex-tile">
                  <span className="big" aria-hidden="true"><SubstanceIcon name={s.icon} size={62} /></span>
                  <span><b>{s.title}</b><span className="d">{s.desc}</span></span>
                </Link>
              ))}
            </div>

            <h2 className="ex-group">Support and information</h2>
            <div className="ex-tiles">
              {SUPPORT.map(s => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="ex-tile small">
                  <span className="big" aria-hidden="true"><SubstanceIcon name={s.flag} size={40} /></span>
                  <span><b>{s.name}</b><span className="d">{s.desc}</span></span>
                </a>
              ))}
            </div>

            <div className="xp-alert xp-alert-info">
              If you or someone you know is in crisis, contact one of the services above or your local emergency number (112 in Europe).
            </div>
          </div>
        </div>
      </Window>
    </main>
  )
}
