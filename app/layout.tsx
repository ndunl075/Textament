import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Textament - Daily Wisdom & Drive',
  description: 'Receive daily Bible verses and motivational quotes via SMS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

