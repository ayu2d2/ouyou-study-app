// Prismaから生成される型定義
export interface StudySession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date | null
  duration?: number | null
  category: string
  questions: number
  correct: number
}

export interface Streak {
  id: string
  userId: string
  date: Date
  count: number
}

export interface Friendship {
  id: string
  requesterId: string
  requesteeId: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED'
  createdAt: Date
  acceptedAt?: Date | null
  requester?: User
  requestee?: User
}

export interface User {
  id: string
  name?: string | null
  email?: string | null
}

export interface StudyStats {
  totalStudyTime: number
  totalQuestions: number
  correctAnswers: number
  currentStreak: number
  longestStreak: number
  weeklyStats: WeeklyStats[]
}

export interface WeeklyStats {
  date: string
  studyTime: number
  questions: number
}

export interface FriendRanking {
  id: string
  name: string
  studyTime: number
  streak: number
  rank: number
  sessionsToday: number
}
