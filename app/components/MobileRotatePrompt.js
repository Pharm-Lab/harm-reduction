'use client'
import { useState, useEffect } from 'react'

// On narrow portrait screens, suggest landscape once, as an XP dialog
// that can be dismissed. The graphs are easier to read sideways, but
// the site works in portrait too.
export default function MobileRotatePrompt() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try { if (sessionStorage.getItem('rotate-dismissed')) setDismissed(true) } catch {}
    function check() {
      const isMobile = window.innerWidth < 768
      const isPortrait = window.innerHeight > window.innerWidth
      setShow(isMobile && isPortrait)
    }
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  function dismiss() {
    setDismissed(true)
    try { sessionStorage.setItem('rotate-dismissed', '1') } catch {}
  }

  if (!show || dismissed) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(5,6,20,0.6)', display: 'grid', placeItems: 'center', padding: '16px' }}>
      <div className="xp-window" role="dialog" aria-modal="true" aria-labelledby="rotate-title" style={{ width: 'min(320px, 100%)' }}>
        <div className="xp-titlebar">
          <h2 id="rotate-title">myClearance</h2>
          <button className="xp-cap xp-cap-close" onClick={dismiss} aria-label="Close" style={{ padding: 0, cursor: 'pointer' }}>
            <svg viewBox="0 0 11 11" aria-hidden="true"><path d="M2 2l7 7M9 2l-7 7" stroke="#fff" strokeWidth="2" /></svg>
          </button>
        </div>
        <div className="xp-window-body">
          <div className="xp-alert xp-alert-info" style={{ background: 'transparent', border: 0, marginBottom: '14px' }}>
            The graphs are easier to read in landscape. Turn your phone sideways, or carry on in portrait.
          </div>
          <div style={{ textAlign: 'right' }}>
            <button className="xp-btn" onClick={dismiss} autoFocus style={{ minWidth: '75px', padding: '4px 12px' }}>OK</button>
          </div>
        </div>
      </div>
    </div>
  )
}
