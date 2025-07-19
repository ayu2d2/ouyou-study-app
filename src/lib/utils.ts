import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}時間${remainingMinutes}分` : `${hours}時間`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0
  
  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime())
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let currentDate = new Date(today)
  
  for (const date of sortedDates) {
    const studyDate = new Date(date)
    studyDate.setHours(0, 0, 0, 0)
    
    if (studyDate.getTime() === currentDate.getTime()) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (studyDate.getTime() < currentDate.getTime()) {
      break
    }
  }
  
  return streak
}

export function getStudyScore(studyTime: number, correctAnswers: number, streak: number): number {
  return Math.floor(studyTime * 2 + correctAnswers * 10 + streak * 5)
}
