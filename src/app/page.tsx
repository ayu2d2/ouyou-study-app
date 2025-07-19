'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useStudyTimer } from '@/hooks/useStudyTimer'
import { StudyPortal } from '@/components/StudyPortal'
import StreakDisplay from '@/components/StreakDisplay'
import UserMenu from '@/components/UserMenu'
import { Play, Pause, Calendar, Clock, TrendingUp } from 'lucide-react'

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
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  🎯 レベル {level}
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
                studyTime={todayStudyTime}
                level={level}
                exp={exp}
                maxExp={maxExp}
              />
            )}

            {/* 勉強タイマー */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                  <Clock className="w-6 h-6 mr-2 text-indigo-500" />
                  勉強タイマー
                </h2>
                
                <div className="text-6xl font-mono font-bold text-gray-800 mb-6">
                  {formatTime(currentSession)}
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={toggleStudying}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      isStudying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isStudying ? (
                      <>
                        <Pause className="w-5 h-5" />
                        <span>終了</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>開始</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 今日の勉強時間 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-700">今日の勉強時間</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {formatTime(todayStudyTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右カラム: 過去問ポータル */}
          <div className="space-y-6">
            <StudyPortal 
              onStudyStart={() => !isStudying && toggleStudying()}
              onStudyStop={() => isStudying && toggleStudying()}
              isStudying={isStudying}
            />
            
            {/* 今日の目標 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                今日の目標
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">勉強時間</span>
                  <span className="font-medium">2時間</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((todayStudyTime / 7200) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="text-sm text-gray-500 text-center">
                  {Math.floor((todayStudyTime / 7200) * 100)}% 完了
                </div>
              </div>
            </div>

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
