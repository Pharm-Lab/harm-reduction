// Small 16px icons in the XP spirit, drawn as SVG so they stay crisp.
// `light` draws a white-outline version for use on title bars.
export default function XpIcon({ name, light = false, size = 16 }) {
  const stroke = light ? '#fff' : '#a78bfa'
  const common = { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': true, focusable: 'false' }
  switch (name) {
    case 'chart':
      return <svg {...common}><rect x="1" y="2" width="14" height="12" fill="#2b2f45" stroke={stroke} /><path d="M3 11 C5 4 7 4 8 7 S11 11 13 10" fill="none" stroke={stroke} strokeWidth="1.5" /></svg>
    case 'interactions':
      return <svg {...common}><circle cx="5.5" cy="8" r="4.2" fill="#f5a623" /><circle cx="10.5" cy="8" r="4.2" fill="#4fa3ff" fillOpacity=".85" /></svg>
    case 'guide':
      return <svg {...common}><path d="M2 1.5h8.5l3.5 3.5v9.5H2z" fill="#f3f3f8" stroke="#6b7091" strokeWidth=".8" /><path d="M10.5 1.5V5H14" fill="#c9cbe0" /><path d="M4 7.5h8M4 9.5h8M4 11.5h6" stroke="#4a5274" /></svg>
    case 'folder':
      return <svg {...common}><path d="M1 3.5h5l1.2 1.5H15v8.5H1z" fill="#e8b93a" /><path d="M1 6h14v7.5H1z" fill="#f5c84a" /></svg>
    case 'info':
      return <svg {...common}><circle cx="8" cy="8" r="7" fill="#2f6fdb" stroke={light ? '#fff' : '#123a85'} strokeWidth=".8" /><path d="M8 7v5" stroke="#fff" strokeWidth="2" /><circle cx="8" cy="4.5" r="1.1" fill="#fff" /></svg>
    case 'shield':
      return <svg {...common}><path d="M8 1l6 2v5c0 4-3 6-6 7-3-1-6-3-6-7V3z" fill="#2fb34a" stroke="#0b5a1e" /><path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.6" fill="none" /></svg>
    default:
      return <svg {...common}><rect x="1.5" y="1.5" width="13" height="13" fill="#2b2f45" stroke={stroke} /></svg>
  }
}
