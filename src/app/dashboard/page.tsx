'use client'

import { useEffect } from 'react'
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
    formatTime
  } = useStudyTimer()
  
  const {
    currentStreak,
    maxStreak,
    hasStudiedToday
  } = useStreak()

  // 未ログインの場合はトップページにリダイレクト
  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/')
    }
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
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
        {/* ヘッダー */}
        <header className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex-1 w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              応用情報技術者試験 勉強アプリ
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
              継続は力なり！毎日コツコツ勉強しよう
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* フレンドボタン */}
            <button
              onClick={() => router.push('/friends')}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center transition-colors text-sm"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="font-medium">フレンド</span>
            </button>
            
            {/* 連続記録表示 */}
            <div className="flex items-center bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🔥</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold">
                  {currentStreak}日連続
                </div>
              </div>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* メインコンテンツ */}
        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* 左カラム: 勉強時間とストリーク */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">{/* 今日の勉強時間 */}
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
              <div className="text-center">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                  今日の勉強時間
                </h2>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-2 sm:p-3 lg:p-4 mb-2 sm:mb-3">
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-mono font-bold text-blue-600 mb-1">
                    {formatTime(todayStudyTime)}
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base text-blue-500 font-medium">
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
                  <div className="flex items-center justify-center space-x-2 bg-green-100 text-green-800 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm">
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
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-500" />
                学習ストリーク
              </h3>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                    {currentStreak}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">現在のストリーク</div>
                  <div className="text-xs text-gray-500">連続学習日数</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">
                    {maxStreak}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">最大ストリーク</div>
                  <div className="text-xs text-gray-500">過去最高記録</div>
                </div>
              </div>
              
              <div className="mt-2 sm:mt-3 text-center">
                {hasStudiedToday ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600 text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>今日の学習完了！</span>
                  </div>
                ) : (
                  <div className="text-orange-600 text-xs sm:text-sm">
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
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
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
        <div className="mt-4 sm:mt-6 max-w-4xl mx-auto">
          <Ranking currentStudyTime={todayStudyTime} />
        </div>
      </div>
    </div>
  )
}
