import Navbar from './components/Navbar'
import MobileRotatePrompt from './components/MobileRotatePrompt'
import './globals.css'

export const metadata = {
  title: 'myClearance',
  description: 'Pharmacokinetic calculators and harm reduction information. No accounts, no tracking.',
}

export const viewport = {
  themeColor: '#241a5e',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MobileRotatePrompt />
        <Navbar />
        <div className="xp-skin">{children}</div>
      </body>
    </html>
  )
}
