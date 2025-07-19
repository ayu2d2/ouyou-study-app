import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '応用情報技術者試験 勉強アプリ',
  description: '友達と一緒に応用情報技術者試験の勉強をしよう！ストリーク機能と進捗比較で楽しく学習',
  keywords: ['応用情報技術者試験', '勉強', '過去問', 'ストリーク', '友達'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </div>
      </body>
    </html>
  )
}
