import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type PrismaStudySession = {
  id: string
  userId: string
  startTime: Date
  endTime: Date | null
  duration: number | null
  category: string | null
  questions: number
  correct: number
}

type PrismaStreak = {
  id: string
  userId: string
  date: Date
  count: number
}

type PrismaFriendship = {
  id: string
  requesterId: string
  requesteeId: string
  status: string
  createdAt: Date
  acceptedAt: Date | null
}

// フレンドランキングの取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'

    // データベースからフレンドリストを取得
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { requesteeId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        requester: true,
        requestee: true
      }
    })

    // フレンドのユーザーIDを抽出
    const friendIds = friendships.map((f: PrismaFriendship) => 
      f.requesterId === userId ? f.requesteeId : f.requesterId
    )

    // 自分も含める
    const allUserIds = [userId, ...friendIds]

    // 各ユーザーの学習統計を取得
    const userStats = await Promise.all(
      allUserIds.map(async (id) => {
        const sessions = await prisma.studySession.findMany({
          where: { userId: id },
          orderBy: { startTime: 'desc' }
        })

        const streaks = await prisma.streak.findMany({
          where: { userId: id },
          orderBy: { date: 'desc' }
        })

        const totalStudyTime = sessions.reduce((sum: number, session: PrismaStudySession) => {
          return sum + (session.duration || 0)
        }, 0)

        const currentStreak = calculateCurrentStreak(streaks.map((s: PrismaStreak) => s.date))

        return {
          id,
          name: id === userId ? 'あなた' : `ユーザー${id.slice(-4)}`,
          studyTime: totalStudyTime,
          streak: currentStreak,
          sessionsToday: sessions.filter((s: PrismaStudySession) => {
            const today = new Date()
            const sessionDate = new Date(s.startTime)
            return sessionDate.toDateString() === today.toDateString()
          }).length
        }
      })
    )

    // ランキング順にソート（学習時間でソート）
    const rankedFriends = userStats
      .sort((a, b) => b.studyTime - a.studyTime)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }))

    return NextResponse.json(rankedFriends)
  } catch (error) {
    console.error('Friends ranking error:', error)
    
    // フォールバックデータ
    const fallbackRanking = [
      { id: 'demo-user', name: 'あなた', studyTime: 320, streak: 7, rank: 1, sessionsToday: 2 },
      { id: 'friend1', name: 'ユーザー001', studyTime: 280, streak: 5, rank: 2, sessionsToday: 1 },
      { id: 'friend2', name: 'ユーザー002', studyTime: 245, streak: 12, rank: 3, sessionsToday: 3 },
      { id: 'friend3', name: 'ユーザー003', studyTime: 210, streak: 3, rank: 4, sessionsToday: 1 },
      { id: 'friend4', name: 'ユーザー004', studyTime: 185, streak: 8, rank: 5, sessionsToday: 0 }
    ]
    
    return NextResponse.json(fallbackRanking)
  }
}

// フレンド追加
export async function POST(request: NextRequest) {
  try {
    const { userId, friendId } = await request.json()

    // 既存の友達関係をチェック
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, requesteeId: friendId },
          { requesterId: friendId, requesteeId: userId }
        ]
      }
    })

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'すでに友達リクエストが送信されているか、友達です' },
        { status: 400 }
      )
    }

    // 新しい友達リクエストを作成
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: userId,
        requesteeId: friendId,
        status: 'PENDING',
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'フレンドリクエストを送信しました',
      friendship
    })
  } catch (error) {
    console.error('Add friend error:', error)
    
    return NextResponse.json({
      message: 'フレンドリクエストを送信しました（デモモード）'
    })
  }
}

function calculateCurrentStreak(dates: Date[]): number {
  if (dates.length === 0) return 0
  
  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime())
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  const currentDate = new Date(today)
  
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
