'use client'

import { useSession } from 'next-auth/react'
import FriendsList from '@/components/FriendsList'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FriendsPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">フレンド機能を利用するにはログインしてください。</p>
          <Link
            href="/auth/signin"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* ヘッダー */}
        <header className="flex items-center mb-6 sm:mb-8">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            戻る
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              フレンド
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              友達と一緒に学習を頑張ろう
            </p>
          </div>
        </header>

        {/* フレンドリスト */}
        <div className="max-w-4xl mx-auto">
          <FriendsList />
        </div>
      </div>
    </div>
  )
}
