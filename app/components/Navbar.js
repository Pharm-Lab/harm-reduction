'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import XpIcon from './XpIcon'

const LINKS = [
  { href: '/harm-reduction',              label: 'Calculators',  icon: 'chart', exact: true },
  { href: '/harm-reduction/interactions', label: 'Interactions', icon: 'interactions' },
  { href: '/harm-reduction/guide',        label: 'Guide',        icon: 'guide' },
  { href: '/sources',                     label: 'Sources',      icon: 'folder' },
  { href: '/about',                       label: 'About',        icon: 'info' },
]

const CALCULATOR_PATHS = ['alcohol', 'amphetamines', 'cannabis', 'cathinones', 'cocaine', 'ketamine', 'mdma']

function isActive(pathname, link) {
  if (!pathname) return false
  if (link.exact) {
    // Individual calculators count as being inside "Calculators"
    return pathname === link.href || CALCULATOR_PATHS.some(p => pathname === `${link.href}/${p}`)
  }
  return pathname.startsWith(link.href)
}

function Clock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])
  return <span suppressHydrationWarning>{time}</span>
}

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="xp-taskbar" aria-label="Main">
      <Link href="/" className="xp-start">
        <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="xp-start-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" stopOpacity=".3" />
            </linearGradient>
          </defs>
          <path d="M47.56 16.44 A22 22 0 1 0 47.56 47.56" fill="none" stroke="url(#xp-start-fade)" strokeWidth="8" strokeLinecap="round" />
          <circle cx="47.56" cy="16.44" r="7" fill="#fff" />
        </svg>
        <span><span className="my">my</span>Clearance</span>
      </Link>

      <div className="xp-tasks">
        {LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="xp-task"
            aria-current={isActive(pathname, l) ? 'page' : undefined}
          >
            <XpIcon name={l.icon} size={14} />
            <span className="xp-task-label">{l.label}</span>
          </Link>
        ))}
      </div>

      <div className="xp-tray" title="No accounts, no tracking. Nothing you enter leaves your device.">
        <XpIcon name="shield" size={14} />
        <Clock />
      </div>
    </nav>
  )
}
