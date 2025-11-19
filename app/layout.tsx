import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Imitate Tweet',
  description: 'Generate tweets by imitating your favorite Twitter users',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <AuthProvider>
          <Header />
          <main className="py-6">{children}</main>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
