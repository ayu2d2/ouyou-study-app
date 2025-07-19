import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()

    // バリデーション
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'メールアドレス、ユーザー名、パスワードは必須です' },
        { status: 400 }
      )
    }

    // パスワードの長さチェック
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      )
    }

    // Vercel環境では簡単なデモ登録のみ
    if (email === 'demo@example.com') {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています（デモ用）' },
        { status: 400 }
      )
    }

    // デモ用のレスポンス
    return NextResponse.json({
      message: 'デモ環境では登録機能は利用できません。ログインは demo@example.com / demo123 をお試しください。',
      user: {
        id: 'demo',
        email,
        username,
        createdAt: new Date()
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'アカウント作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
