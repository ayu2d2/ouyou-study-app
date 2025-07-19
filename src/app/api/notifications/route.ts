import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// VAPID設定
webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'test@example.com'),
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const { subscription, message, title } = await request.json()

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription is required' },
        { status: 400 }
      )
    }

    const payload = JSON.stringify({
      title: title || '応用情報勉強アプリ',
      body: message || '学習の時間です！',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: '/',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: 'アプリを開く'
        },
        {
          action: 'close',
          title: '閉じる'
        }
      ]
    })

    await webpush.sendNotification(subscription, payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// プッシュ通知の購読を保存
export async function PUT(request: NextRequest) {
  try {
    const { subscription, userId } = await request.json()

    // ここでデータベースに購読情報を保存
    // 実際の実装では Prisma を使用してユーザーの購読情報を更新
    console.log('Saving subscription for user:', userId)
    console.log('Subscription:', subscription)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscription save error:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}
