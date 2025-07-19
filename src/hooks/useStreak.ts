'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface StreakData {
  currentStreak: number
  maxStreak: number
  lastStudyDate: string | null
  studyDates: string[]
}

export function useStreak() {
  const { data: session } = useSession()
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    maxStreak: 0,
    lastStudyDate: null,
    studyDates: []
  })

  // ローカルストレージからストリークデータを読み込み
  const loadStreakData = (): StreakData => {
    if (typeof window === 'undefined') return {
      currentStreak: 0,
      maxStreak: 0,
      lastStudyDate: null,
      studyDates: []
    }

    const userKey = session?.user?.email || 'guest'
    const stored = localStorage.getItem(`streak_${userKey}`)
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    return {
      currentStreak: 0,
      maxStreak: 0,
      lastStudyDate: null,
      studyDates: []
    }
  }

  // ストリークデータをローカルストレージに保存
  const saveStreakData = (data: StreakData) => {
    if (typeof window === 'undefined') return
    
    const userKey = session?.user?.email || 'guest'
    localStorage.setItem(`streak_${userKey}`, JSON.stringify(data))
    setStreakData(data)
  }

  // 今日の日付を YYYY-MM-DD 形式で取得
  const getTodayString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // 昨日の日付を YYYY-MM-DD 形式で取得
  const getYesterdayString = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  // 日付の差を計算（日数）
  const getDaysDifference = (date1: string, date2: string): number => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // 学習を記録してストリークを更新
  const recordStudy = () => {
    const today = getTodayString()
    const yesterday = getYesterdayString()
    const currentData = loadStreakData()

    // 今日はまだ学習していない場合のみ更新
    if (!currentData.studyDates.includes(today)) {
      const newStudyDates = [...currentData.studyDates, today]
      let newCurrentStreak = 1

      // 昨日も学習していた場合、ストリークを継続
      if (currentData.lastStudyDate === yesterday) {
        newCurrentStreak = currentData.currentStreak + 1
      } else if (currentData.lastStudyDate && currentData.lastStudyDate !== today) {
        // 昨日学習していない場合、ストリークをリセット
        const daysSinceLastStudy = getDaysDifference(currentData.lastStudyDate, today)
        if (daysSinceLastStudy > 1) {
          newCurrentStreak = 1
        } else {
          newCurrentStreak = currentData.currentStreak + 1
        }
      }

      // 最大ストリークを更新
      const newMaxStreak = Math.max(currentData.maxStreak, newCurrentStreak)

      const newData: StreakData = {
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
        lastStudyDate: today,
        studyDates: newStudyDates.slice(-365) // 直近365日のみ保持
      }

      saveStreakData(newData)
    }
  }

  // ストリークをチェック（連続性を確認）
  const checkStreak = () => {
    const today = getTodayString()
    const yesterday = getYesterdayString()
    const currentData = loadStreakData()

    // 今日学習していない、かつ昨日も学習していない場合
    if (!currentData.studyDates.includes(today) && 
        currentData.lastStudyDate && 
        currentData.lastStudyDate !== yesterday &&
        getDaysDifference(currentData.lastStudyDate, today) > 1) {
      
      // ストリークが途切れた
      const newData: StreakData = {
        ...currentData,
        currentStreak: 0
      }
      saveStreakData(newData)
    }
  }

  // 初期化
  useEffect(() => {
    if (session) {
      const data = loadStreakData()
      setStreakData(data)
      checkStreak()
    }
  }, [session, checkStreak])

  // 学習完了イベントを監視
  useEffect(() => {
    const handleStudyCompleted = (event: CustomEvent) => {
      const { duration } = event.detail
      recordStudy()
    }

    window.addEventListener('studyCompleted', handleStudyCompleted as EventListener)
    
    return () => {
      window.removeEventListener('studyCompleted', handleStudyCompleted as EventListener)
    }
  }, [recordStudy])

  // 今日学習したかどうか
  const hasStudiedToday = () => {
    const today = getTodayString()
    return streakData.studyDates.includes(today)
  }

  return {
    currentStreak: streakData.currentStreak,
    maxStreak: streakData.maxStreak,
    hasStudiedToday: hasStudiedToday(),
    recordStudy,
    checkStreak,
    studyDates: streakData.studyDates
  }
}
