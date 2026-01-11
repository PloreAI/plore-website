import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plore',
  description: 'A modern AI chat interface',
  icons: {
    icon: '/plore-icon.png',
    apple: '/plore-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
