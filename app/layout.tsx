import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Stackwise — Build Your Financial Stack',
  description:
    'A personalized financial stack builder for young adults. Get your checking, savings, credit, and investing recommendations in minutes.',
  openGraph: {
    title: 'Stackwise — Build Your Financial Stack',
    description:
      'Answer 8 questions. Get matched to the right accounts across checking, savings, credit, and investing.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080A0F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#080A0F] text-[#F0F2F8] antialiased">
        {children}
      </body>
    </html>
  )
}
