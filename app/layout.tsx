import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stackwise — Build Your Financial Stack',
  description:
    'A personalized financial stack builder for young adults. Get your checking, savings, credit, and investing recommendations in minutes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080A0F] text-[#F0F2F8] antialiased">
        {children}
      </body>
    </html>
  )
}
