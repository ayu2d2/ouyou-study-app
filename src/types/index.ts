export interface User {
  id: string
  email: string
  name?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface StudySession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  duration?: number
  questions: number
  correct: number
  category?: string
  createdAt: Date
}

export interface Streak {
  id: string
  userId: string
  date: Date
  count: number
}

export interface Question {
  id: string
  content: string
  choices: string[]
  correctAnswer: string
  explanation?: string
  category: string
  difficulty: string
  year?: number
}

export interface Answer {
  id: string
  userId: string
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent?: number
  answeredAt: Date
}

export interface Friendship {
  id: string
  requesterId: string
  requesteeId: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED'
  createdAt: Date
  acceptedAt?: Date
}

export interface NotificationSettings {
  id: string
  userId: string
  studyReminder: boolean
  friendActivity: boolean
  streakReminder: boolean
  weeklyReport: boolean
  reminderTime: string
}

export interface StudyStats {
  totalStudyTime: number
  totalQuestions: number
  correctAnswers: number
  currentStreak: number
  longestStreak: number
  weeklyStats: {
    date: string
    studyTime: number
    questions: number
  }[]
}

export interface LeaderboardEntry {
  userId: string
  name: string
  image?: string
  studyTime: number
  streak: number
  score: number
  rank: number
}
