'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import StreakDisplay from '@/components/StreakDisplay'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProgressPage() {
  const { data: session } = useSession()
  
  // デモ用のデータ（実際にはDBから取得）
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const [level, setLevel] = useState(1)

  // ユーザーデータを取得
  useEffect(() => {
    if (session?.user?.email) {
      // 実際のDBからユーザーデータを取得する処理をここに追加
      // 今はデモ用のダミーデータ
      setStreak(7)
      setMaxStreak(15)
      setTotalXP(1250)
      setLevel(4)
    }
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">学習進捗を確認するにはログインしてください。</p>
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
              学習進捗
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              あなたの学習状況とレベル情報
            </p>
          </div>
        </header>

        {/* 進捗表示 */}
        <div className="max-w-4xl mx-auto">
          <StreakDisplay 
            streak={streak} 
            maxStreak={maxStreak}
            totalXP={totalXP}
            level={level}
          />

          {/* 追加の統計情報 */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">学習統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">総学習時間</span>
                  <span className="font-semibold">24時間30分</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">解いた問題数</span>
                  <span className="font-semibold">342問</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">正答率</span>
                  <span className="font-semibold">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均学習時間/日</span>
                  <span className="font-semibold">45分</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">達成バッジ</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">🏆</span>
                  </div>
                  <p className="text-xs text-gray-600">初回学習</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">📚</span>
                  </div>
                  <p className="text-xs text-gray-600">100問達成</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">🔥</span>
                  </div>
                  <p className="text-xs text-gray-600">7日連続</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
