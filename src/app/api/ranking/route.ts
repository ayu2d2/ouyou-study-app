import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-simple'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'weekly' // weekly, monthly, allTime
    const category = url.searchParams.get('category') || 'xp' // xp, studyTime, problems
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // 期間の計算
    const now = new Date()
    let period = 'all'
    let dateFilter = {}

    if (type === 'weekly') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const year = startOfWeek.getFullYear()
      const weekNumber = Math.ceil((startOfWeek.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
      period = `${year}-W${weekNumber.toString().padStart(2, '0')}`
      
      dateFilter = {
        createdAt: {
          gte: startOfWeek
        }
      }
    } else if (type === 'monthly') {
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      period = `${year}-${month}`
      
      const startOfMonth = new Date(year, now.getMonth(), 1)
      dateFilter = {
        createdAt: {
          gte: startOfMonth
        }
      }
    }

    let orderBy = {}
    let selectField = 'totalXP'

    switch (category) {
      case 'studyTime':
        orderBy = { totalStudyTime: 'desc' }
        selectField = 'totalStudyTime'
        break
      case 'problems':
        orderBy = { totalProblems: 'desc' }
        selectField = 'totalProblems'
        break
      case 'xp':
      default:
        orderBy = { totalXP: 'desc' }
        selectField = 'totalXP'
        break
    }

    // ランキングデータ取得
    const users = await prisma.user.findMany({
      where: dateFilter,
      select: {
        id: true,
        username: true,
        totalXP: true,
        level: true,
        totalStudyTime: true,
        totalProblems: true,
        totalCorrect: true,
        createdAt: true
      },
      orderBy,
      take: limit
    })

    // ランキング作成
    const ranking = users.map((user, index) => ({
      rank: index + 1,
      user: {
        id: user.id,
        username: user.username,
        totalXP: user.totalXP,
        level: user.level,
        totalStudyTime: user.totalStudyTime,
        totalProblems: user.totalProblems,
        totalCorrect: user.totalCorrect,
        accuracy: user.totalProblems > 0 
          ? Math.round((user.totalCorrect / user.totalProblems) * 100) 
          : 0
      },
      score: user[selectField as keyof typeof user] as number,
      isMe: user.id === session.user.id
    }))

    // 自分のランキングを取得（トップ50に入っていない場合）
    const myRanking = ranking.find(r => r.isMe)
    let myRank = null

    if (!myRanking) {
      const allUsers = await prisma.user.findMany({
        where: dateFilter,
        select: {
          id: true,
          [selectField]: true
        },
        orderBy
      })

      const myIndex = allUsers.findIndex(user => user.id === session.user.id)
      if (myIndex !== -1) {
        const me = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            username: true,
            totalXP: true,
            level: true,
            totalStudyTime: true,
            totalProblems: true,
            totalCorrect: true
          }
        })

        if (me) {
          myRank = {
            rank: myIndex + 1,
            user: {
              ...me,
              accuracy: me.totalProblems > 0 
                ? Math.round((me.totalCorrect / me.totalProblems) * 100) 
                : 0
            },
            score: me[selectField as keyof typeof me] as number,
            isMe: true
          }
        }
      }
    }

    return NextResponse.json({
      ranking,
      myRank: myRanking || myRank,
      type,
      category,
      period,
      total: users.length
    })

  } catch (error) {
    console.error('Get ranking error:', error)
    return NextResponse.json(
      { error: 'ランキングの取得中にエラーが発生しました' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
