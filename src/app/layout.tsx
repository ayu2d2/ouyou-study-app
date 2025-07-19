import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '応用情報技術者試験 勉強アプリ',
  description: '友達と一緒に応用情報技術者試験の勉強をしよう！ストリーク機能と進捗比較で楽しく学習',
  keywords: ['応用情報技術者試験', '勉強', '過去問', 'ストリーク', '友達'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '応用情報勉強アプリ',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: '応用情報技術者試験 勉強アプリ',
    title: '応用情報技術者試験 勉強アプリ',
    description: '友達と一緒に応用情報技術者試験の勉強をしよう！',
  },
  twitter: {
    card: 'summary',
    title: '応用情報技術者試験 勉強アプリ',
    description: '友達と一緒に応用情報技術者試験の勉強をしよう！',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="応用情報勉強" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
