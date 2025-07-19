import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-simple'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 簡単なダミーランキングデータを返す
    const dummyRanking = {
      ranking: [
        {
          rank: 1,
          user: {
            id: session.user.id,
            username: session.user.username || 'あなた',
            totalStudyTime: 3600
          },
          score: 3600,
          isMe: true
        }
      ],
      myRank: {
        rank: 1,
        user: {
          id: session.user.id,
          username: session.user.username || 'あなた',
          totalStudyTime: 3600
        },
        score: 3600,
        isMe: true
      },
      type: 'today',
      category: 'studyTime',
      period: new Date().toISOString().split('T')[0],
      total: 1
    }

    return NextResponse.json(dummyRanking)

  } catch (error) {
    console.error('ランキング取得エラー:', error)
    return NextResponse.json(
      { error: 'ランキングの取得に失敗しました' },
      { status: 500 }
    )
  }
}
