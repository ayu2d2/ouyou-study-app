import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, title } = await request.json()

    // 簡易版：通知の送信ログ
    console.log('Notification request:', { title, message })

    return NextResponse.json({ 
      success: true, 
      message: 'Notification logged successfully' 
    })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// 通知設定の保存
export async function PUT(request: NextRequest) {
  try {
    const { userId, settings } = await request.json()

    // 簡易版：設定の保存ログ
    console.log('Saving notification settings for user:', userId, settings)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings save error:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
