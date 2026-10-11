import Navbar from './components/Navbar'
import MobileRotatePrompt from './components/MobileRotatePrompt'
import './globals.css'

export const metadata = {
  title: 'myClearance',
  description: 'Pharmacokinetic calculators and harm reduction information. No accounts, no tracking.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        background: '#0a0f1e',
        color: '#f0f4ff',
        fontFamily: "'Inter', system-ui, sans-serif",
        minHeight: '100vh',
      }}>
        <MobileRotatePrompt />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
