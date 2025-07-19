'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Trophy, Flame } from 'lucide-react'

interface StreakDisplayProps {
  streak: number
  maxStreak: number
}

function StreakDisplay({ 
  streak, 
  maxStreak
}: StreakDisplayProps) {
  const { data: session } = useSession()

  // ストリークのレベル判定
  const getStreakLevel = (streak: number) => {
    if (streak >= 100) return { name: '伝説', color: 'from-purple-500 to-pink-500', emoji: '👑' }
    if (streak >= 50) return { name: 'マスター', color: 'from-yellow-400 to-orange-500', emoji: '🔥' }
    if (streak >= 30) return { name: 'エキスパート', color: 'from-blue-500 to-purple-500', emoji: '⭐' }
    if (streak >= 14) return { name: 'プロ', color: 'from-green-400 to-blue-500', emoji: '💎' }
    if (streak >= 7) return { name: '中級者', color: 'from-yellow-300 to-green-400', emoji: '🏆' }
    if (streak >= 3) return { name: '初心者', color: 'from-blue-300 to-green-300', emoji: '🌱' }
    return { name: 'ビギナー', color: 'from-gray-300 to-blue-300', emoji: '🥉' }
  }

  const streakLevel = getStreakLevel(streak)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      {/* ユーザー情報 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {session?.user?.username || 'ゲスト'}さんの進捗
        </h2>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-2xl">{streakLevel.emoji}</span>
          <span className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${streakLevel.color}`}>
            {streakLevel.name}
          </span>
        </div>
      </div>

      {/* ストリーク情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 現在のストリーク */}
        <div className="text-center">
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white mb-3"
            animate={{ scale: streak > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: streak > 0 ? Infinity : 0, repeatDelay: 2 }}
          >
            <Flame className="w-12 h-12" />
          </motion.div>
          <div className="text-3xl font-bold text-gray-800">{streak}</div>
          <div className="text-sm text-gray-600">連続記録</div>
        </div>

        {/* 最高ストリーク */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white mb-3">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{maxStreak}</div>
          <div className="text-sm text-gray-600">最高記録</div>
        </div>
      </div>
    </div>
  )
}

export default StreakDisplay
