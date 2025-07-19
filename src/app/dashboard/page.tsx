'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useStudyTimer } from '@/hooks/useStudyTimer'
import { useStreak } from '@/hooks/useStreak'
import { StudyPortal } from '@/components/StudyPortal'
import UserMenu from '@/components/UserMenu'
import Ranking from '@/components/Ranking'
import { Clock, Users, Trophy } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const {
    isStudying,
    currentSession,
    todayStudyTime,
    toggleStudying,
    formatTime,
    studySessions
  } = useStudyTimer()
  
  const {
    currentStreak,
    maxStreak,
    hasStudiedToday
  } = useStreak()

  // 未ログインの場合はトップページにリダイレクト
  useEffect(() => {
    // 一時的にコメントアウト - ログイン機能をテストするため
    // if (status !== 'loading' && !session) {
    //   router.push('/')
    // }
  }, [session, status, router])

  // ローディング中
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 未ログインの場合は何も表示しない（リダイレクト中）
  // 一時的にコメントアウト - ログイン機能をテストするため
  // if (!session) {
  //   return null
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* ヘッダー */}
        <header className="flex justify-between items-start mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              応用情報技術者試験 勉強アプリ
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              継続は力なり！毎日コツコツ勉強しよう
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* フレンドボタン */}
            <button
              onClick={() => router.push('/friends')}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg flex items-center transition-colors"
            >
              <Users className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">フレンド</span>
            </button>
            
            {/* 連続記録表示 */}
            <div className="flex items-center bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🔥</span>
                </div>
                <div className="text-sm font-semibold">
                  {currentStreak}日連続
                </div>
              </div>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* メインコンテンツ */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 左カラム: 勉強時間 */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* 今日の勉強時間 */}
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                  今日の勉強時間
                </h2>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 mb-3">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-blue-600 mb-1">
                    {formatTime(todayStudyTime)}
                  </div>
                  <div className="text-sm sm:text-base text-blue-500 font-medium">
                    {Math.floor(todayStudyTime / 3600) > 0 ? 
                      `${Math.floor(todayStudyTime / 3600)}時間${Math.floor((todayStudyTime % 3600) / 60)}分${todayStudyTime % 60}秒` :
                      Math.floor(todayStudyTime / 60) > 0 ?
                        `${Math.floor(todayStudyTime / 60)}分${todayStudyTime % 60}秒` :
                        `${todayStudyTime}秒`
                    }の学習
                  </div>
                </div>

                {/* 勉強状態の表示 */}
                {isStudying ? (
                  <div className="flex items-center justify-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">勉強中</span>
                    <span className="font-mono">{formatTime(currentSession)}</span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs text-center px-2">
                    過去問道場を開くと自動でタイマーが開始されます
                  </div>
                )}
              </div>
            </div>

            {/* ストリーク情報 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-orange-500" />
                学習ストリーク
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {currentStreak}
                  </div>
                  <div className="text-sm text-gray-600">現在のストリーク</div>
                  <div className="text-xs text-gray-500">連続学習日数</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {maxStreak}
                  </div>
                  <div className="text-sm text-gray-600">最大ストリーク</div>
                  <div className="text-xs text-gray-500">過去最高記録</div>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                {hasStudiedToday ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>今日の学習完了！</span>
                  </div>
                ) : (
                  <div className="text-orange-600 text-sm">
                    今日はまだ学習していません
                    <div className="text-xs text-gray-500 mt-1">
                      10分以上の学習でストリークカウント
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右カラム: 過去問ポータル */}
          <div className="space-y-4 sm:space-y-6">
            <StudyPortal 
              onStudyStart={() => !isStudying && toggleStudying()}
              onStudyStop={() => isStudying && toggleStudying()}
              isStudying={isStudying}
              currentSessionTime={currentSession}
              formatTime={formatTime}
            />
          </div>
        </div>

        {/* ランキング */}
        <div className="mt-6 max-w-4xl mx-auto">
          <Ranking currentStudyTime={todayStudyTime} />
        </div>
      </div>
    </div>
  )
}
