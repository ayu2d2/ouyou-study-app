'use client'

import { useState, useEffect, useCallback } from 'react'

interface StudyData {
  totalStudyTime: number
  todayStudyTime: number
  lastStudyDate: string
  studySessions: Array<{
    date: string
    duration: number
    timestamp: number
  }>
}

export const useStudyTimer = () => {
  const [isStudying, setIsStudying] = useState(false)
  const [currentSession, setCurrentSession] = useState(0)
  const [studyData, setStudyData] = useState<StudyData>({
    totalStudyTime: 0,
    todayStudyTime: 0,
    lastStudyDate: new Date().toDateString(),
    studySessions: []
  })

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    const savedData = localStorage.getItem('studyData')
    if (savedData) {
      const parsed: StudyData = JSON.parse(savedData)
      const today = new Date().toDateString()
      
      // 日付が変わった場合は今日の学習時間をリセット
      if (parsed.lastStudyDate !== today) {
        parsed.todayStudyTime = 0
        parsed.lastStudyDate = today
      }
      
      setStudyData(parsed)
    }
  }, [])

  // データをローカルストレージに保存する
  const saveData = useCallback((data: StudyData) => {
    localStorage.setItem('studyData', JSON.stringify(data))
    setStudyData(data)
  }, [])

  // タイマー機能
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStudying) {
      interval = setInterval(() => {
        setCurrentSession(prev => prev + 1)
        
        const today = new Date().toDateString()
        setStudyData(prev => {
          const newData = {
            ...prev,
            totalStudyTime: prev.totalStudyTime + 1,
            todayStudyTime: prev.todayStudyTime + 1,
            lastStudyDate: today
          }
          localStorage.setItem('studyData', JSON.stringify(newData))
          return newData
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStudying])

  const toggleStudying = () => {
    if (isStudying) {
      // 学習終了時にセッションデータを保存
      if (currentSession > 0) {
        const sessionData = {
          date: new Date().toDateString(),
          duration: currentSession,
          timestamp: Date.now()
        }
        
        const newData = {
          ...studyData,
          studySessions: [...studyData.studySessions, sessionData]
        }
        
        saveData(newData)
      }
      setCurrentSession(0)
    }
    setIsStudying(!isStudying)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStudyStats = () => {
    const sessions = studyData.studySessions
    const totalSessions = sessions.length
    const averageSession = totalSessions > 0 
      ? Math.floor(sessions.reduce((sum, session) => sum + session.duration, 0) / totalSessions)
      : 0
    
    const studyDays = new Set(sessions.map(session => session.date)).size
    
    return {
      totalSessions,
      averageSession: formatTime(averageSession),
      studyDays,
      longestSession: formatTime(Math.max(...sessions.map(s => s.duration), 0))
    }
  }

  return {
    isStudying,
    currentSession,
    totalStudyTime: studyData.totalStudyTime,
    todayStudyTime: studyData.todayStudyTime,
    toggleStudying,
    formatTime,
    getStudyStats,
    studySessions: studyData.studySessions
  }
}
