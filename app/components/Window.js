import Link from 'next/link'
import XpIcon from './XpIcon'
import SubstanceIcon from './SubstanceIcon'

// A Windows XP–style window. The title bar holds the page title (as the h1),
// the close button goes back to `closeHref`, and `status` fills the status bar.
export default function Window({ title, icon = 'chart', closeHref = '/harm-reduction', status, children, headingLevel = 1, bodyStyle }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <section className="xp-window">
      <div className="xp-titlebar">
        {icon.startsWith('substance:')
          ? <SubstanceIcon name={icon.slice(10)} size={20} />
          : <XpIcon name={icon} light />}
        <Heading>{title}</Heading>
        <span className="xp-cap" aria-hidden="true">
          <svg viewBox="0 0 11 11"><rect x="2" y="8" width="6" height="2" fill="#fff" /></svg>
        </span>
        <span className="xp-cap" aria-hidden="true">
          <svg viewBox="0 0 11 11"><rect x="1.5" y="1.5" width="8" height="8" fill="none" stroke="#fff" strokeWidth="1.5" /><rect x="1.5" y="1.5" width="8" height="2" fill="#fff" /></svg>
        </span>
        {closeHref ? (
          <Link href={closeHref} className="xp-cap xp-cap-close" aria-label="Close" title="Close">
            <svg viewBox="0 0 11 11" aria-hidden="true"><path d="M2 2l7 7M9 2l-7 7" stroke="#fff" strokeWidth="2" /></svg>
          </Link>
        ) : (
          <span className="xp-cap xp-cap-close" aria-hidden="true">
            <svg viewBox="0 0 11 11"><path d="M2 2l7 7M9 2l-7 7" stroke="#fff" strokeWidth="2" /></svg>
          </span>
        )}
      </div>
      <div className="xp-window-body" style={bodyStyle}>{children}</div>
      {status && status.length > 0 && (
        <div className="xp-statusbar">
          {status.map((s, i) => <span key={i}>{s}</span>)}
        </div>
      )}
    </section>
  )
}
