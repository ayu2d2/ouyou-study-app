'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Flame, BookOpen, Users, TrendingUp, 
  Bell, Play, Target, Award, Clock, StopCircle, LogOut, User
} from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'
import { registerPushNotification } from '@/lib/notifications'

interface StudyStats {
  totalStudyTime: number
  totalQuestions: number
  correctAnswers: number
  currentStreak: number
  longestStreak: number
  weeklyStats: Array<{
    date: string
    studyTime: number
    questions: number
  }>
}

interface FriendRanking {
  id: string
  name: string
  studyTime: number
  streak: number
  rank: number
  sessionsToday: number
}

interface StudySession {
  id?: string
  userId: string
  startTime: Date
  category: string
  questions: number
  correct: number
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // 認証チェック
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])
  
  // 現在のユーザーID
  const currentUserId = session?.user?.id || 'demo-user'
  
  const [stats, setStats] = useState<StudyStats>({
    totalStudyTime: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyStats: []
  })
  
  const [friends, setFriends] = useState<FriendRanking[]>([])
  const [showFriends, setShowFriends] = useState(false)
  const [isStudying, setIsStudying] = useState(false)
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0) // リアルタイム学習時間（秒）
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 通知許可の確認
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
    
    // 初期データの読み込み
    if (currentUserId && currentUserId !== 'demo-user') {
      loadStudyStats()
      loadFriends()
    }
  }, [currentUserId])

  // 学習時間のリアルタイム更新
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isStudying && studyStartTime) {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - studyStartTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    } else {
      setElapsedTime(0)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isStudying, studyStartTime])

  // 学習統計を読み込む
  const loadStudyStats = async () => {
    try {
      const response = await fetch(`/api/study?userId=${currentUserId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to load study stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 友達ランキングを読み込む
  const loadFriends = async () => {
    try {
      const response = await fetch(`/api/friends?userId=${currentUserId}`)
      if (response.ok) {
        const data = await response.json()
        setFriends(data)
      }
    } catch (error) {
      console.error('Failed to load friends:', error)
    }
  }

  // 学習セッション開始
  const handleStartStudy = async () => {
    try {
      const response = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUserId,
          category: 'general'
        })
      })
      
      if (response.ok) {
        const session = await response.json()
        setCurrentSession(session)
        setIsStudying(true)
        setStudyStartTime(new Date())
        setElapsedTime(0)
        
        // 学習開始の通知
        if (notificationsEnabled) {
          new Notification('学習開始！', {
            body: '今日も頑張りましょう！',
            icon: '/icon-192x192.png'
          })
        }
      }
    } catch (error) {
      console.error('Failed to start study session:', error)
    }
  }

  // 学習セッション終了
  const handleStopStudy = async () => {
    if (!currentSession || !studyStartTime) return
    
    const duration = Math.floor((Date.now() - studyStartTime.getTime()) / 1000 / 60) // 分単位
    const questions = Math.floor(Math.random() * 10) + 5 // デモ用ランダム
    const correct = Math.floor(questions * (0.6 + Math.random() * 0.3)) // デモ用60-90%正解
    
    try {
      const response = await fetch('/api/study', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          questions,
          correct,
          duration
        })
      })
      
      if (response.ok) {
        setIsStudying(false)
        setCurrentSession(null)
        setStudyStartTime(null)
        setElapsedTime(0)
        
        // 学習終了の通知
        if (notificationsEnabled && duration > 0) {
          new Notification('学習完了！', {
            body: `${duration}分間お疲れ様でした！${questions}問中${correct}問正解です。`,
            icon: '/icon-192x192.png'
          })
        }
        
        // 統計を再読み込み
        loadStudyStats()
        loadFriends()
      }
    } catch (error) {
      console.error('Failed to end study session:', error)
    }
  }

  const handleEnableNotifications = async () => {
    const subscription = await registerPushNotification()
    if (subscription) {
      setNotificationsEnabled(true)
      // ここで subscription をサーバーに送信
      console.log('Push subscription:', subscription)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  // 認証ローディング中の表示
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 max-w-6xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ヘッダー */}
      <motion.header className="text-center mb-8" variants={itemVariants}>
        <div className="relative">
          {/* ユーザー情報とログアウト */}
          <div className="absolute top-0 right-0 flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="プロフィール"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
              <span className="text-sm font-medium">
                {session?.user?.name || session?.user?.email || 'ユーザー'}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            応用情報技術者試験
          </h1>
          <h2 className="text-3xl text-gray-700 mb-4 font-medium">勉強アプリ</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            友達と一緒に勉強して、お互いのモチベーションを高めよう！<br />
            ストリーク機能で毎日の学習習慣を維持しましょう。
          </p>
        </div>
      </motion.header>

      {/* 通知設定 */}
      {!notificationsEnabled && (
        <motion.div 
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between"
          variants={itemVariants}
        >
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-amber-600 mr-3" />
            <span className="text-amber-800">学習リマインダーを有効にしてみませんか？</span>
          </div>
          <button
            onClick={handleEnableNotifications}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            有効にする
          </button>
        </motion.div>
      )}

      {/* ストリーク表示 */}
      <motion.div 
        className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl shadow-xl p-8 mb-8 text-white text-center relative overflow-hidden"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <motion.div 
            className="flex items-center justify-center mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-16 h-16 mr-4 drop-shadow-lg" />
            <div>
              <h3 className="text-5xl font-bold mb-1">{stats.currentStreak}日連続</h3>
              <p className="text-orange-100 text-xl">学習ストリーク</p>
            </div>
          </motion.div>
          <div className="text-lg text-orange-100">
            素晴らしい！この調子で頑張りましょう 🔥
          </div>
        </div>
      </motion.div>

      {/* 学習コントロール */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800">今日の学習</h3>
          <div className="flex gap-2">
            {!isStudying ? (
              <button
                onClick={handleStartStudy}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
              >
                <Play className="w-5 h-5" />
                学習開始
              </button>
            ) : (
              <button
                onClick={handleStopStudy}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
              >
                <StopCircle className="w-5 h-5" />
                学習終了
              </button>
            )}
            <button
              onClick={() => setShowFriends(!showFriends)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
            >
              <Users className="w-5 h-5" />
              {showFriends ? '統計表示' : '友達と比較'}
            </button>
          </div>
        </div>
        
        {isStudying && (
          <motion.div 
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-800">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                学習中... 頑張って！
              </div>
              <div className="text-green-700 font-mono text-lg">
                {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
              </div>
            </div>
            <div className="mt-2 w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((elapsedTime / 1800) * 100, 100)}%` }} // 30分で100%
              />
            </div>
            <div className="text-xs text-green-600 mt-1">
              目標: 30分 ({Math.floor((elapsedTime / 1800) * 100)}%)
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 学習統計または友達比較 */}
      {!showFriends ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div className="bg-white rounded-xl shadow-lg p-6" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">総学習時間</h3>
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatDuration(stats.totalStudyTime)}
            </div>
            <div className="text-sm text-gray-500 mb-2">累計学習時間</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.totalStudyTime / 1000) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-xl shadow-lg p-6" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">解いた問題</h3>
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalQuestions}問</div>
            <div className="text-sm text-gray-500 mb-2">累計問題数</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.totalQuestions / 500) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-xl shadow-lg p-6" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">正答率</h3>
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500">全体正答率</div>
          </motion.div>

          <motion.div className="bg-white rounded-xl shadow-lg p-6" variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">最長ストリーク</h3>
              <Award className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.longestStreak}日</div>
            <div className="text-sm text-gray-500">過去最高記録</div>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          variants={itemVariants}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6">友達ランキング</h3>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">読み込み中...</div>
          ) : (
            <div className="space-y-4">
              {friends.map((friend, index) => (
                <div 
                  key={friend.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl",
                    friend.id === currentUserId 
                      ? "bg-blue-50 border-2 border-blue-200" 
                      : "bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                      index < 3 ? "bg-gradient-to-r from-yellow-400 to-orange-500" : "bg-gray-400"
                    )}>
                      {friend.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{friend.name}</div>
                      <div className="text-sm text-gray-500">
                        {friend.streak}日連続 • 今日{friend.sessionsToday}回
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      {formatDuration(friend.studyTime)}
                    </div>
                    <div className="text-sm text-gray-500">総学習時間</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* アクションボタン */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 mr-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold">過去問を解く</h3>
          </div>
          <p className="text-blue-100 text-lg">応用情報技術者試験の過去問にチャレンジ</p>
        </motion.button>

        <motion.button 
          className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Users className="w-12 h-12 mr-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold">友達と比較</h3>
          </div>
          <p className="text-green-100 text-lg">友達の学習進捗と自分を比較してみよう</p>
        </motion.button>
      </div>

      {/* 友達ランキング */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg p-8"
        variants={itemVariants}
      >
        <div className="flex items-center mb-6">
          <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
          <h3 className="text-2xl font-bold text-gray-800">友達ランキング（今週）</h3>
        </div>
        
        <div className="space-y-4">
          {[
            { name: '田中太郎', streak: 14, score: 850, change: '+2' },
            { name: 'あなた', streak: 7, score: 720, change: '+1' },
            { name: '佐藤花子', streak: 5, score: 680, change: '-1' },
            { name: '山田次郎', streak: 3, score: 420, change: '0' },
          ].map((friend, index) => (
            <motion.div 
              key={index} 
              className={cn(
                "flex items-center justify-between p-4 rounded-xl transition-all",
                friend.name === 'あなた' 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100'
              )}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4",
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md' :
                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md' :
                  'bg-gray-200 text-gray-600'
                )}>
                  {index + 1}
                </div>
                <div>
                  <span className="font-bold text-lg">{friend.name}</span>
                  {friend.name === 'あなた' && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      YOU
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Flame className="w-5 h-5 mr-1 text-orange-500" />
                <span className="mr-6 font-medium">{friend.streak}日</span>
                <span className="font-bold text-lg mr-2">{friend.score}pt</span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  friend.change.startsWith('+') ? 'bg-green-100 text-green-800' :
                  friend.change.startsWith('-') ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-600'
                )}>
                  {friend.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
