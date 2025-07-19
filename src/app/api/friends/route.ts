import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-simple'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 承認済みのフレンドを取得
    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [
              { senderId: session.user.id },
              { receiverId: session.user.id }
            ]
          },
          { status: 'accepted' }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            totalXP: true,
            level: true,
            totalStudyTime: true,
            totalProblems: true,
            totalCorrect: true,
            createdAt: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            totalXP: true,
            level: true,
            totalStudyTime: true,
            totalProblems: true,
            totalCorrect: true,
            createdAt: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // フレンドの情報を整理
    const friends = friendships.map(friendship => {
      // Prismaのincludeで取得したリレーションデータにアクセス
      const friendData = friendship.senderId === session.user.id 
        ? (friendship as unknown as { receiver: { id: string; username: string; totalXP: number; level: number; totalStudyTime: number; totalProblems: number; totalCorrect: number; createdAt: Date } }).receiver
        : (friendship as unknown as { sender: { id: string; username: string; totalXP: number; level: number; totalStudyTime: number; totalProblems: number; totalCorrect: number; createdAt: Date } }).sender

      return {
        id: friendData.id,
        username: friendData.username,
        totalXP: friendData.totalXP,
        level: friendData.level,
        totalStudyTime: friendData.totalStudyTime,
        totalProblems: friendData.totalProblems,
        totalCorrect: friendData.totalCorrect,
        accuracy: friendData.totalProblems > 0 
          ? Math.round((friendData.totalCorrect / friendData.totalProblems) * 100) 
          : 0,
        friendshipId: friendship.id,
        friendSince: friendship.createdAt
      }
    })

    return NextResponse.json({ friends })

  } catch (error) {
    console.error('Get friends error:', error)
    return NextResponse.json(
      { error: 'フレンド一覧の取得中にエラーが発生しました' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// フレンド削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { friendId } = await request.json()

    if (!friendId) {
      return NextResponse.json({ error: 'フレンドIDが必要です' }, { status: 400 })
    }

    // フレンドシップを検索して削除
    const deletedFriendship = await prisma.friendship.deleteMany({
      where: {
        AND: [
          {
            OR: [
              { senderId: session.user.id, receiverId: friendId },
              { senderId: friendId, receiverId: session.user.id }
            ]
          },
          { status: 'accepted' }
        ]
      }
    })

    if (deletedFriendship.count === 0) {
      return NextResponse.json({ error: 'フレンド関係が見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ message: 'フレンドを削除しました' })

  } catch (error) {
    console.error('Delete friend error:', error)
    return NextResponse.json(
      { error: 'フレンド削除中にエラーが発生しました' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
