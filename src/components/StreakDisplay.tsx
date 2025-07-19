'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Star, Zap } from 'lucide-react'
import { getXPToNextLevel, getLevelTitle } from '@/lib/xp-system'

interface StreakDisplayProps {
  streak: number
  maxStreak: number
  totalXP?: number
  level?: number
}

function StreakDisplay({ 
  streak, 
  maxStreak,
  totalXP = 0,
  level = 1
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
  const levelInfo = getLevelTitle(level)
  const xpInfo = getXPToNextLevel(totalXP)

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4">
      {/* ユーザー情報 */}
      <div className="text-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
          {session?.user?.username || 'ゲスト'}さんの進捗
        </h2>
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="flex items-center space-x-1">
            <span className="text-base sm:text-lg">{levelInfo.emoji}</span>
            <span className={`px-2 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r ${levelInfo.color}`}>
              Lv.{level} {levelInfo.title}
            </span>
          </div>
          <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
            <Zap className="w-3 h-3" />
            <span className="font-medium">{totalXP.toLocaleString()} XP</span>
          </div>
        </div>
        
        {/* XP進捗バー */}
        <div className="max-w-xs mx-auto mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Lv.{level}</span>
            <span>Lv.{xpInfo.nextLevel}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${xpInfo.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            次のレベルまで {xpInfo.xpToNext.toLocaleString()} XP
          </div>
        </div>
      </div>

      {/* ストリーク情報 */}
      <div className="flex flex-row justify-center gap-3 sm:gap-6">
        {/* 現在のストリーク */}
        <div className="text-center flex-1 max-w-[100px]">
          <motion.div
            className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white mb-1 mx-auto"
            animate={{ scale: streak > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: streak > 0 ? Infinity : 0, repeatDelay: 2 }}
          >
            <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
          <div className="text-sm sm:text-lg font-bold text-gray-800 mb-1">{streak}</div>
          <div className="text-xs text-gray-600">連続記録</div>
        </div>

        {/* 最高ストリーク */}
        <div className="text-center flex-1 max-w-[100px]">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white mb-1 mx-auto">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-sm sm:text-lg font-bold text-gray-800 mb-1">{maxStreak}</div>
          <div className="text-xs text-gray-600">最高記録</div>
        </div>

        {/* レベル表示 */}
        <div className="text-center flex-1 max-w-[100px]">
          <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${levelInfo.color} text-white mb-1 mx-auto`}>
            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-sm sm:text-lg font-bold text-gray-800 mb-1">{level}</div>
          <div className="text-xs text-gray-600">レベル</div>
        </div>
      </div>
    </div>
  )
}

export default StreakDisplay
