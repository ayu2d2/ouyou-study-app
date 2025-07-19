import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-simple'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'today'
    const category = searchParams.get('category') || 'studyTime'
    const currentStudyTime = parseInt(searchParams.get('currentStudyTime') || '0')
    
    // フレンドデータを取得
    const friendsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/friends`, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    })

    let friends = []
    if (friendsResponse.ok) {
      const friendsData = await friendsResponse.json()
      friends = friendsData.friends || []
    }

    // 実際のユーザーとフレンドを含むランキングを作成
    const generateRanking = (userStudyTime: number = 0) => {
      const users = [
        { 
          id: session.user.id, 
          username: session.user.username || 'あなた', 
          studyTime: userStudyTime 
        },
        // フレンドの学習時間を追加（ダミーデータとして今日の学習時間を生成）
        ...friends.map((friend: { id: string; username: string }) => ({
          id: friend.id,
          username: friend.username,
          studyTime: Math.floor(Math.random() * 7200) + 600 // 10分-2時間のランダム
        }))
      ]

      // 学習時間順にソート
      users.sort((a, b) => b.studyTime - a.studyTime)

      const ranking = users.map((user, index) => ({
        rank: index + 1,
        user: {
          id: user.id,
          username: user.username,
          totalStudyTime: user.studyTime
        },
        score: user.studyTime,
        isMe: user.id === session.user.id
      }))

      const myRank = ranking.find(item => item.isMe) || null

      return {
        ranking,
        myRank,
        type,
        category,
        period: new Date().toISOString().split('T')[0],
        total: ranking.length
      }
    }

    // 実際の学習時間を使用してランキングを生成
    const rankingData = generateRanking(currentStudyTime)

    return NextResponse.json(rankingData)

  } catch (error) {
    console.error('ランキング取得エラー:', error)
    return NextResponse.json(
      { error: 'ランキングの取得に失敗しました' },
      { status: 500 }
    )
  }
}
