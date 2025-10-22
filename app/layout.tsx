import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Translator',
  description: 'Fast, privacy-friendly translator',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900 antialiased">{children}</body>
    </html>
  )
}
