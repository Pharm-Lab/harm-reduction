// XP-style 48×48 icons for the substances and resources.
// Glossy fills, dark outline, light from the top-left — drawn as SVG
// so they sit dead-centre in their box and look the same on every OS.

const OUT = '#1a1426' // outline

function Defs({ id }) {
  return (
    <defs>
      <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".75" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.2" floodColor="#000" floodOpacity=".55" />
      </filter>
    </defs>
  )
}

const ICONS = {
  alcohol: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-beer`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f7c84a" /><stop offset=".55" stopColor="#e89a17" /><stop offset="1" stopColor="#b8650a" />
        </linearGradient>
        <linearGradient id={`${id}-foam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e9e3d2" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path d="M31 17h4.5a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H31" fill="none" stroke={OUT} strokeWidth="5.5" />
        <path d="M31 17h4.5a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H31" fill="none" stroke="#d9dbe6" strokeWidth="3" />
        <rect x="9" y="14" width="23" height="28" rx="2.5" fill={`url(#${id}-beer)`} stroke={OUT} strokeWidth="1.5" />
        <path d="M13 20v17M18 20v17M23 20v17M28 20v17" stroke="#fff" strokeOpacity=".22" strokeWidth="1.6" />
        <circle cx="15" cy="30" r="1.1" fill="#fff" fillOpacity=".7" /><circle cx="25" cy="25" r=".9" fill="#fff" fillOpacity=".7" /><circle cx="20" cy="35" r=".8" fill="#fff" fillOpacity=".6" />
        <path d="M7.5 15c0-4.5 3.5-7 7-6 1.5-2.8 6-3.4 8.3-.8 2.6-1.6 7.2-.4 7.6 3.4 2.8.4 3.6 3.6 1.6 5.1-1.2 1-3.4.8-4.4-.2-1 2-4 2.4-5.6.8-1.4 1.6-4.8 1.6-6-.4-1.6 1.4-5.3 1.4-8.5-1.9z" fill={`url(#${id}-foam)`} stroke={OUT} strokeWidth="1.4" />
        <rect x="11" y="16" width="4" height="22" rx="2" fill={`url(#${id}-shine)`} opacity=".7" />
      </g>
    </>
  ),

  mdma: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}-pill`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#f3ecff" /><stop offset=".55" stopColor="#c7b2ff" /><stop offset="1" stopColor="#8c6ff0" />
        </radialGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <ellipse cx="24" cy="29.5" rx="19" ry="13" fill="#6a4fc8" stroke={OUT} strokeWidth="1.5" />
        <ellipse cx="24" cy="24" rx="19" ry="13" fill={`url(#${id}-pill)`} stroke={OUT} strokeWidth="1.5" />
        <path d="M9 24h30" stroke="#7a5ee0" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
        <path d="M17 17.5l3.5 3.2 3.5-3.2 3.5 3.2 3.5-3.2" fill="none" stroke="#7458e0" strokeWidth="1.5" strokeLinejoin="round" opacity=".75" />
        <ellipse cx="18" cy="17" rx="8" ry="3.2" fill={`url(#${id}-shine)`} opacity=".9" />
      </g>
    </>
  ),

  cannabis: (id) => {
    const leaf = 'M0 0 C 4.2 -6 4.4 -14 0 -21 C -4.4 -14 -4.2 -6 0 0 Z'
    const blades = [[-90, 1], [-57, .85], [-123, .85], [-26, .64], [-154, .64], [6, .4], [174, .4]]
    return (
      <>
        <defs>
          <linearGradient id={`${id}-leaf`} x1="0" y1="-21" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8fe36b" /><stop offset="1" stopColor="#2f9a3a" />
          </linearGradient>
        </defs>
        <g filter={`url(#${id}-shadow)`}>
          <path d="M24 36 L24 45" stroke="#2b6b2c" strokeWidth="2.6" strokeLinecap="round" />
          <g transform="translate(24 37)">
            {blades.map(([a, s], i) => (
              <path key={i} d={leaf} transform={`rotate(${a + 90}) scale(${s * 1.55})`}
                fill={`url(#${id}-leaf)`} stroke={OUT} strokeWidth={1.3 / (s * 1.55)} strokeLinejoin="round" />
            ))}
            <path d="M0 0 L0 -21" stroke="#c6f5a8" strokeOpacity=".6" strokeWidth="1" transform="scale(1.55)" />
          </g>
        </g>
      </>
    )
  },

  cocaine: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-mirror`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef1fb" /><stop offset=".45" stopColor="#a9b2cc" /><stop offset=".5" stopColor="#c9cfe2" /><stop offset="1" stopColor="#6c7593" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`} transform="translate(24 25) scale(1.15) translate(-24 -25)">
        <path d="M5 30 L28 12 L43 22 L20 40 Z" fill="#4b5370" stroke={OUT} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M5 27.5 L28 9.5 L43 19.5 L20 37.5 Z" fill={`url(#${id}-mirror)`} stroke={OUT} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 27 L29 15.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M19 30.5 L34 19" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M14 27 L29 15.5 M19 30.5 L34 19" stroke="#b9c1db" strokeWidth=".6" strokeLinecap="round" transform="translate(.6 .9)" opacity=".8" />
        <path d="M9 26 L27 12" stroke="#fff" strokeOpacity=".8" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </>
  ),

  amphetamines: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-bolt`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3a6" /><stop offset=".45" stopColor="#ffc423" /><stop offset="1" stopColor="#e2730b" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path d="M28 4 L10 27 H22 L18 44 L38 18 H26 Z" fill={`url(#${id}-bolt)`} stroke={OUT} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M26.5 8 L14.5 24.5 H20" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      </g>
    </>
  ),

  ketamine: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dfe6ff" stopOpacity=".55" /><stop offset=".3" stopColor="#ffffff" stopOpacity=".25" /><stop offset="1" stopColor="#9aa6d6" stopOpacity=".45" />
        </linearGradient>
        <linearGradient id={`${id}-liquid`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7fa8ff" /><stop offset=".6" stopColor="#4f6ef0" /><stop offset="1" stopColor="#3546b8" />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f2f3f8" /><stop offset=".5" stopColor="#a8adc2" /><stop offset="1" stopColor="#6d7390" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path d="M16 15 h16 v24 a4 4 0 0 1 -4 4 h-8 a4 4 0 0 1 -4 -4 z" fill="#2a2f4a" fillOpacity=".35" />
        <path d="M16 25 h16 v14 a4 4 0 0 1 -4 4 h-8 a4 4 0 0 1 -4 -4 z" fill={`url(#${id}-liquid)`} />
        <ellipse cx="24" cy="25" rx="8" ry="1.4" fill="#a9c2ff" />
        <path d="M16 15 h16 v24 a4 4 0 0 1 -4 4 h-8 a4 4 0 0 1 -4 -4 z" fill={`url(#${id}-glass)`} stroke={OUT} strokeWidth="1.5" />
        <rect x="18" y="12" width="12" height="4" fill="#cfd4e6" stroke={OUT} strokeWidth="1.2" />
        <rect x="15" y="4" width="18" height="9" rx="2" fill={`url(#${id}-cap)`} stroke={OUT} strokeWidth="1.5" />
        <rect x="18.5" y="18" width="2.6" height="21" rx="1.3" fill="#fff" fillOpacity=".75" />
      </g>
    </>
  ),

  cathinones: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-c1`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e7b8ef" />
        </linearGradient>
        <linearGradient id={`${id}-c2`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e4fb" /><stop offset="1" stopColor="#b77ad0" />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`} strokeLinejoin="round">
        <path d="M8 40 L12 22 L18 18 L21 38 Z" fill={`url(#${id}-c2)`} stroke={OUT} strokeWidth="1.4" />
        <path d="M12 22 L18 18 L21 38" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth=".8" />
        <path d="M30 41 L33 24 L38 21 L42 40 Z" fill={`url(#${id}-c2)`} stroke={OUT} strokeWidth="1.4" />
        <path d="M17 42 L19 14 L25 5 L31 14 L32 42 Z" fill={`url(#${id}-c1)`} stroke={OUT} strokeWidth="1.5" />
        <path d="M25 5 L25 42 M19 14 L25 18 L31 14" fill="none" stroke="#c48fd8" strokeWidth="1" />
        <path d="M21 16 L24 9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M43 9 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2z" fill="#fff" />
      </g>
    </>
  ),

  interactions: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}-o`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#ffd98a" /><stop offset="1" stopColor="#e5820f" /></radialGradient>
        <radialGradient id={`${id}-b`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#a6ccff" /><stop offset="1" stopColor="#2f6fdb" /></radialGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <circle cx="17" cy="20" r="12.5" fill={`url(#${id}-o)`} stroke={OUT} strokeWidth="1.5" />
        <circle cx="31" cy="20" r="12.5" fill={`url(#${id}-b)`} fillOpacity=".88" stroke={OUT} strokeWidth="1.5" />
        <ellipse cx="13" cy="13" rx="6" ry="3" fill={`url(#${id}-shine)`} />
        <ellipse cx="33" cy="13" rx="6" ry="3" fill={`url(#${id}-shine)`} />
        <path d="M24 27 L35 45 H13 Z" fill="#f5c84a" stroke={OUT} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M24 32.5 v6" stroke="#1a1426" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="24" cy="42" r="1.4" fill="#1a1426" />
      </g>
    </>
  ),

  guide: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-cover`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7d63f5" /><stop offset="1" stopColor="#3a239e" /></linearGradient>
        <linearGradient id={`${id}-page`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dcdff0" /></linearGradient>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path d="M6 9 C 13 6 19 7 24 11 C 29 7 35 6 42 9 V 41 C 35 38 29 39 24 43 C 19 39 13 38 6 41 Z" fill={`url(#${id}-cover)`} stroke={OUT} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8.5 10.5 C 14 8.5 19 9.5 23 12.5 V 39.5 C 19 36.8 14 36.2 8.5 38 Z" fill={`url(#${id}-page)`} />
        <path d="M39.5 10.5 C 34 8.5 29 9.5 25 12.5 V 39.5 C 29 36.8 34 36.2 39.5 38 Z" fill={`url(#${id}-page)`} />
        <path d="M11 33 C 13 20 15 18 16.5 22 S 20 30 21.5 29" fill="none" stroke="#7a5cf0" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M11 34.5 H 21.5 M11 34.5 V 16" stroke="#8a8fa8" strokeWidth=".9" />
        <path d="M27.5 16h9M27.5 20h9M27.5 24h7M27.5 28h9M27.5 32h6" stroke="#9aa0bc" strokeWidth="1.3" />
        <path d="M24 12 V 42" stroke="#2a1a70" strokeWidth="1" />
      </g>
    </>
  ),

  nl: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-wave`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset=".35" stopColor="#000" stopOpacity=".18" /><stop offset=".7" stopColor="#fff" stopOpacity=".18" /><stop offset="1" stopColor="#000" stopOpacity=".15" />
        </linearGradient>
        <clipPath id={`${id}-clip`}><path d="M6 12 C 16 8 26 16 42 11 V 36 C 26 41 16 33 6 37 Z" /></clipPath>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <g clipPath={`url(#${id}-clip)`}>
          <rect x="4" y="6" width="40" height="15" fill="#c8102e" transform="skewY(-2)" />
          <path d="M6 20 C 16 16 26 24 42 19 V 28 C 26 33 16 25 6 29 Z" fill="#ffffff" />
          <path d="M6 28 C 16 24 26 32 42 27 V 40 H 6 Z" fill="#21468b" />
          <rect x="0" y="0" width="48" height="48" fill={`url(#${id}-wave)`} />
        </g>
        <path d="M6 12 C 16 8 26 16 42 11 V 36 C 26 41 16 33 6 37 Z" fill="none" stroke={OUT} strokeWidth="1.4" />
      </g>
    </>
  ),

  globe: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}-sea`} cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#9fd0ff" /><stop offset=".6" stopColor="#2f7be0" /><stop offset="1" stopColor="#163f99" /></radialGradient>
        <clipPath id={`${id}-clip`}><circle cx="24" cy="24" r="17" /></clipPath>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <circle cx="24" cy="24" r="17" fill={`url(#${id}-sea)`} />
        <g clipPath={`url(#${id}-clip)`} fill="#4cbf4a" stroke="#1f6e2a" strokeWidth=".8">
          <path d="M12 12 c4 -2 9 -1 10 2 c1 3 -3 4 -2 7 c1 3 5 3 4 7 c-1 3 -5 2 -6 6 c-1 2 -4 1 -5 -2 c-1 -4 -4 -5 -5 -9 c-1 -4 1 -9 4 -11z" />
          <path d="M28 9 c4 0 8 2 10 5 c-2 1 -4 0 -6 2 c-1 2 1 4 4 5 c3 1 5 4 3 7 c-2 2 -5 1 -7 4 c-1 2 -3 3 -4 0 c-1 -3 -3 -5 -2 -9 c1 -4 -1 -7 2 -9 z" />
        </g>
        <circle cx="24" cy="24" r="17" fill="none" stroke={OUT} strokeWidth="1.5" />
        <ellipse cx="18" cy="14" rx="8" ry="4" fill={`url(#${id}-shine)`} />
      </g>
    </>
  ),
}

export default function SubstanceIcon({ name, size = 48 }) {
  const draw = ICONS[name]
  if (!draw) return null
  const id = `si-${name}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" style={{ display: 'block', overflow: 'visible' }}>
      <Defs id={id} />
      {draw(id)}
    </svg>
  )
}

export const ICON_NAMES = Object.keys(ICONS)
