import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

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
      <body className="font-sans antialiased">
        {children}
        <Toaster 
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            className: 'sm:max-w-md',
            style: {
              maxWidth: 'calc(100vw - 2rem)',
            },
          }}
        />
      </body>
    </html>
  )
}

