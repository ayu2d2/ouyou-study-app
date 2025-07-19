import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-simple'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { action } = await request.json() // 'accept' or 'decline'
    const { id: friendshipId } = await params

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: '無効なアクションです' }, { status: 400 })
    }

    // フレンドリクエストを検索
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            totalXP: true,
            level: true
          }
        }
      }
    })

    if (!friendship) {
      return NextResponse.json({ error: 'フレンドリクエストが見つかりません' }, { status: 404 })
    }

    if (friendship.receiverId !== session.user.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    if (friendship.status !== 'pending') {
      return NextResponse.json({ error: 'このリクエストは既に処理済みです' }, { status: 400 })
    }

    // ステータス更新
    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: {
        status: action === 'accept' ? 'accepted' : 'declined',
        updatedAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            totalXP: true,
            level: true
          }
        }
      }
    })

    const message = action === 'accept' 
      ? 'フレンドリクエストを承認しました' 
      : 'フレンドリクエストを拒否しました'

    return NextResponse.json({
      message,
      friendship: updatedFriendship
    })

  } catch (error) {
    console.error('Friend request response error:', error)
    return NextResponse.json(
      { error: 'フレンドリクエストの処理中にエラーが発生しました' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
