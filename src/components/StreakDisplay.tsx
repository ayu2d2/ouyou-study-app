'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Users, Clock, TrendingUp, Target } from 'lucide-react'

interface StreakDisplayProps {
  streak: number
  maxStreak: number
  studyTime: number
  level: number
  exp: number
  maxExp: number
}

export default function StreakDisplay({ 
  streak, 
  maxStreak, 
  studyTime, 
  level, 
  exp, 
  maxExp 
}: StreakDisplayProps) {
  const { data: session } = useSession()
  
  const expPercentage = (exp / maxExp) * 100

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

      {/* ストリーク表示 */}
      <motion.div 
        className="text-center mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Flame className={`w-12 h-12 ${streak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
          <div>
            <div className="text-4xl font-bold text-gray-800">{streak}</div>
            <div className="text-sm text-gray-600">日連続</div>
          </div>
        </div>
        
        {streak > 0 && (
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-green-600 font-medium">
              🎉 素晴らしい！{streak}日連続で勉強中！
            </p>
            {streak >= 7 && (
              <p className="text-blue-600 text-sm mt-1">
                継続は力なり！この調子で頑張りましょう！
              </p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* レベルとEXP */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-800">レベル {level}</span>
          </div>
          <span className="text-sm text-gray-600">{exp}/{maxExp} EXP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${expPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-600">{Math.floor(studyTime / 3600)}h</div>
          <div className="text-xs text-gray-600">今日の勉強時間</div>
        </div>
        
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-orange-600">{streak}</div>
          <div className="text-xs text-gray-600">現在のストリーク</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Trophy className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-green-600">{maxStreak}</div>
          <div className="text-xs text-gray-600">最高ストリーク</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-purple-600">{level}</div>
          <div className="text-xs text-gray-600">レベル</div>
        </div>
      </div>

      {/* 次の目標 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
          次の目標
        </h3>
        <div className="space-y-2 text-sm">
          {streak < 7 && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>7日連続勉強でブロンズバッジ獲得！ (あと{7 - streak}日)</span>
            </div>
          )}
          {streak >= 7 && streak < 14 && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>14日連続勉強でシルバーバッジ獲得！ (あと{14 - streak}日)</span>
            </div>
          )}
          {streak >= 14 && streak < 30 && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>30日連続勉強でゴールドバッジ獲得！ (あと{30 - streak}日)</span>
            </div>
          )}
          {level < 10 && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>レベル{level + 1}まであと{maxExp - exp} EXP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
