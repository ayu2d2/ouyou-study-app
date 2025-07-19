'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useStudyTimer } from '@/hooks/useStudyTimer'
import { StudyPortal } from '@/components/StudyPortal'
import StreakDisplay from '@/components/StreakDisplay'
import UserMenu from '@/components/UserMenu'
import { Clock } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const {
    isStudying,
    currentSession,
    todayStudyTime,
    toggleStudying,
    formatTime,
    studySessions
  } = useStudyTimer()

  console.log('HomePage render:', { session, status })

  // デモ用のデータ（実際にはDBから取得）
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  // 勉強時間からストリークを計算
  useEffect(() => {
    if (session && studySessions.length > 0) {
      // 簡単なストリーク計算（連続勉強日数）
      const today = new Date().toDateString()
      const hasStudiedToday = studySessions.some(session => 
        new Date(session.date).toDateString() === today
      )
      
      // 実際にはDBから取得するが、デモ用に計算
      const currentStreak = hasStudiedToday ? Math.floor(todayStudyTime / 1800) + 1 : 0 // 30分で1ストリーク
      setStreak(Math.min(currentStreak, 100))
      setMaxStreak(Math.max(maxStreak, currentStreak))
    }
  }, [todayStudyTime, studySessions, session, maxStreak])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              応用情報技術者試験 勉強アプリ
            </h1>
            <p className="text-gray-600 mt-1">
              継続は力なり！毎日コツコツ勉強しよう
            </p>
            {/* ログイン状態の表示 */}
            {session && (
              <div className="mt-3 flex items-center space-x-2">
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="font-medium">{session.user.username}</span>
                  <span className="ml-1">でログイン中</span>
                </div>

              </div>
            )}
          </div>
          <UserMenu />
        </header>

        {/* メインコンテンツ */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左カラム: タイマーとストリーク */}
          <div className="lg:col-span-2 space-y-6">
            {/* ストリーク表示（ログイン時のみ） */}
            {session && (
              <StreakDisplay
                streak={streak}
                maxStreak={maxStreak}
              />
            )}

            {/* 今日の勉強時間 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                  <Clock className="w-6 h-6 mr-2 text-blue-500" />
                  今日の勉強時間
                </h2>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-4">
                  <div className="text-6xl font-mono font-bold text-blue-600 mb-2">
                    {formatTime(todayStudyTime)}
                  </div>
                  <div className="text-lg text-blue-500 font-medium">
                    {Math.floor(todayStudyTime / 3600) > 0 ? 
                      `${Math.floor(todayStudyTime / 3600)}時間${Math.floor((todayStudyTime % 3600) / 60)}分` :
                      `${Math.floor(todayStudyTime / 60)}分`
                    }の学習
                  </div>
                </div>

                {/* 勉強状態の表示 */}
                {isStudying ? (
                  <div className="flex items-center justify-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">勉強中</span>
                    <span className="font-mono">{formatTime(currentSession)}</span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    過去問道場を開くと自動でタイマーが開始されます
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右カラム: 過去問ポータル */}
          <div className="space-y-6">
            <StudyPortal 
              onStudyStart={() => !isStudying && toggleStudying()}
              onStudyStop={() => isStudying && toggleStudying()}
              isStudying={isStudying}
              currentSessionTime={currentSession}
              formatTime={formatTime}
            />

            {/* ログインを促すメッセージ（未ログイン時） */}
            {!session && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-3">
                  もっと楽しく勉強しませんか？
                </h3>
                <p className="text-indigo-100 mb-4">
                  アカウントを作成すると、ストリーク機能や友達との進捗共有ができます！
                </p>
                <div className="space-y-2">
                  <a
                    href="/auth/signup"
                    className="block w-full bg-white text-indigo-600 text-center py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    新規登録
                  </a>
                  <a
                    href="/auth/signin"
                    className="block w-full border border-white text-white text-center py-2 rounded-lg font-medium hover:bg-white hover:text-indigo-600 transition-colors"
                  >
                    ログイン
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
