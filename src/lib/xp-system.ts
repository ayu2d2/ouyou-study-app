// XPシステムの計算ロジック

export interface XPGain {
  studyTime: number // 1分につき1XP
  problemSolved: number // 1問につき5XP
  correctAnswer: number // 正解1問につき追加3XP
  dailyStreak: number // 連続学習ボーナス
}

export const XP_RATES: XPGain = {
  studyTime: 1, // 1分 = 1XP
  problemSolved: 5, // 1問 = 5XP
  correctAnswer: 3, // 正解 = 追加3XP
  dailyStreak: 10, // 連続日数ボーナス = 10XP
}

// レベル計算（二次関数ベース）
export function calculateLevelFromXP(totalXP: number): number {
  // レベル n に必要なXP = n * 100
  return Math.floor(Math.sqrt(totalXP / 100)) + 1
}

// 指定レベルに必要なXP
export function getXPRequiredForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

// 次のレベルまでのXP
export function getXPToNextLevel(currentXP: number): {
  currentLevel: number
  nextLevel: number
  xpToNext: number
  progress: number // 0-100%
} {
  const currentLevel = calculateLevelFromXP(currentXP)
  const nextLevel = currentLevel + 1
  const currentLevelXP = getXPRequiredForLevel(currentLevel)
  const nextLevelXP = getXPRequiredForLevel(nextLevel)
  const xpToNext = nextLevelXP - currentXP
  const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100

  return {
    currentLevel,
    nextLevel,
    xpToNext,
    progress: Math.max(0, Math.min(100, progress))
  }
}

// 学習セッションからXP計算
export function calculateSessionXP(
  durationMinutes: number,
  problemsSolved: number,
  correctAnswers: number,
  streakBonus: number = 0
): number {
  const studyXP = Math.floor(durationMinutes * XP_RATES.studyTime)
  const problemXP = problemsSolved * XP_RATES.problemSolved
  const correctXP = correctAnswers * XP_RATES.correctAnswer
  const streakXP = streakBonus * XP_RATES.dailyStreak

  return studyXP + problemXP + correctXP + streakXP
}

// レベルに応じたタイトル
export function getLevelTitle(level: number): {
  title: string
  color: string
  emoji: string
} {
  if (level >= 50) return { title: 'グランドマスター', color: 'from-purple-500 to-pink-500', emoji: '👑' }
  if (level >= 40) return { title: 'マスター', color: 'from-yellow-400 to-orange-500', emoji: '🔥' }
  if (level >= 30) return { title: 'エキスパート', color: 'from-blue-500 to-purple-500', emoji: '⭐' }
  if (level >= 20) return { title: 'アドバンス', color: 'from-green-400 to-blue-500', emoji: '💎' }
  if (level >= 15) return { title: 'プロフェッショナル', color: 'from-indigo-400 to-purple-400', emoji: '🎯' }
  if (level >= 10) return { title: '上級者', color: 'from-yellow-300 to-green-400', emoji: '🏆' }
  if (level >= 5) return { title: '中級者', color: 'from-blue-300 to-green-300', emoji: '🌱' }
  return { title: '初心者', color: 'from-gray-300 to-blue-300', emoji: '🥉' }
}
