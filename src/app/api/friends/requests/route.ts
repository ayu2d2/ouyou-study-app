import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/safe-prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-simple'

// Using shared prisma instance from safe-prisma

// フレンドリクエスト送信
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { receiverUsername } = await request.json()

    if (!receiverUsername) {
      return NextResponse.json({ error: 'ユーザー名が必要です' }, { status: 400 })
    }

    // 受信者を検索
    const receiver = await prisma.user.findUnique({
      where: { username: receiverUsername }
    })

    if (!receiver) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    if (receiver.id === session.user.id) {
      return NextResponse.json({ error: '自分自身にフレンドリクエストは送れません' }, { status: 400 })
    }

    // 既存のフレンドシップをチェック
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: session.user.id }
        ]
      }
    })

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: '既にフレンドです' }, { status: 400 })
      } else if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: 'フレンドリクエストは既に送信済みです' }, { status: 400 })
      }
    }

    // フレンドリクエスト作成
    const friendship = await prisma.friendship.create({
      data: {
        senderId: session.user.id,
        receiverId: receiver.id,
        status: 'pending'
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            totalXP: true,
            level: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'フレンドリクエストを送信しました',
      friendship
    })

  } catch (error) {
    console.error('Friend request error:', error)
    return NextResponse.json(
      { error: 'フレンドリクエストの送信中にエラーが発生しました' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// フレンドリクエスト一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'received'

    let friendships

    if (type === 'sent') {
      // 送信したリクエスト
      friendships = await prisma.friendship.findMany({
        where: {
          senderId: session.user.id,
          status: 'pending'
        },
        include: {
          receiver: {
            select: {
              id: true,
              username: true,
              totalXP: true,
              level: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // 受信したリクエスト
      friendships = await prisma.friendship.findMany({
        where: {
          receiverId: session.user.id,
          status: 'pending'
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              totalXP: true,
              level: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ friendships })

  } catch (error) {
    console.error('Get friend requests error:', error)
    return NextResponse.json(
      { error: 'フレンドリクエストの取得中にエラーが発生しました' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
