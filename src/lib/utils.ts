import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 日付フォーマット用のユーティリティ関数
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

// 時間フォーマット用のユーティリティ関数
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// ストリーク計算
export function calculateStreak(studySessions: { date: Date }[]): number {
  if (studySessions.length === 0) return 0
  
  const sortedSessions = studySessions
    .map(session => new Date(session.date.toDateString()))
    .sort((a, b) => b.getTime() - a.getTime())
  
  const uniqueDates = Array.from(new Set(sortedSessions.map(date => date.getTime())))
    .map(timestamp => new Date(timestamp))
  
  if (uniqueDates.length === 0) return 0
  
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = uniqueDates[i]
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    
    if (currentDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}
