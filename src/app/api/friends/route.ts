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
      const friend = friendship.senderId === session.user.id 
        ? friendship.receiver 
        : friendship.sender

      return {
        id: friend.id,
        username: friend.username,
        totalXP: friend.totalXP,
        level: friend.level,
        totalStudyTime: friend.totalStudyTime,
        totalProblems: friend.totalProblems,
        totalCorrect: friend.totalCorrect,
        accuracy: friend.totalProblems > 0 
          ? Math.round((friend.totalCorrect / friend.totalProblems) * 100) 
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
