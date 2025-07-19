'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useStudyTimer } from '@/hooks/useStudyTimer'
import { StudyStats } from '@/components/StudyStats'
import { StudyPortal } from '@/components/StudyPortal'
import StreakDisplay from '@/components/StreakDisplay'
import UserMenu from '@/components/UserMenu'
import { Play, Pause, Square, Calendar, Clock, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const { data: session } = useSession()
  const {
    isStudying,
    currentSession,
    totalStudyTime,
    todayStudyTime,
    toggleStudying,
    formatTime,
    studySessions
  } = useStudyTimer()

  // デモ用のデータ（実際にはDBから取得）
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [exp, setExp] = useState(0)
  const [maxExp, setMaxExp] = useState(100)

  // 勉強時間からストリークとレベルを計算
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
      
      // レベルとEXP計算（1時間で10EXP）
      const totalExp = Math.floor(todayStudyTime / 360) // 6分で1EXP
      const newLevel = Math.floor(totalExp / 100) + 1
      const currentExp = totalExp % 100
      
      setLevel(newLevel)
      setExp(currentExp)
    }
  }, [todayStudyTime, studySessions, session, maxStreak])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            📚 AP試験 学習管理アプリ
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            応用情報技術者試験の効率的な学習をサポート
          </p>
        </div>

        {/* 学習時間計測パネル */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Clock className="mr-2" />
              学習時間計測
            </h2>
            <button
              onClick={toggleStudying}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                isStudying
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
              }`}
            >
              {isStudying ? (
                <>
                  <Pause className="mr-2" size={20} />
                  学習終了
                </>
              ) : (
                <>
                  <Play className="mr-2" size={20} />
                  学習開始
                </>
              )}
            </button>
          </div>

          {/* 時間表示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl text-center border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">現在のセッション</h3>
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">
                {formatTime(currentSession)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl text-center border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">今日の学習時間</h3>
              <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                {formatTime(todayStudyTime)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl text-center border border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">累計学習時間</h3>
              <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">
                {formatTime(totalStudyTime)}
              </p>
            </div>
          </div>

          {/* 学習状態インジケーター */}
          {isStudying && (
            <div className="flex items-center justify-center p-4 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-300 dark:border-green-700">
              <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-700 dark:text-green-300 font-medium">学習中... 集中して頑張りましょう！</span>
            </div>
          )}
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左カラム: 過去問道場 */}
          <div>
            <StudyPortal />
          </div>

          {/* 右カラム: 統計・進捗 */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center mb-6">
                <TrendingUp className="mr-2" />
                学習統計
              </h2>
              <StudyStats 
                totalStudyTime={totalStudyTime}
                todayStudyTime={todayStudyTime}
                studySessions={studySessions}
                formatTime={formatTime}
              />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            頑張って応用情報技術者試験に合格しましょう！ 🎯
          </p>
        </div>
      </div>
    </div>
  )
}
