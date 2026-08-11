import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro, Inter } from 'next/font/google'
import { TripProvider } from '@/components/trip-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-be-vietnam' })

export const metadata: Metadata = {
  title: 'Lakbay Albay | Explore Albay',
  description: 'Discover attractions, food, culture, local businesses, and community experiences across Albay.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F7F5EF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`bg-background ${inter.variable} ${beVietnamPro.variable}`}>
      <body className="font-sans antialiased">
        <TripProvider>{children}</TripProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
