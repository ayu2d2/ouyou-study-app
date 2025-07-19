import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

    // 既存ユーザーのチェック
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に使用されています' },
          { status: 400 }
        )
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'このユーザー名は既に使用されています' },
          { status: 400 }
        )
      }
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      }
    })

    // パスワードを除いてレスポンス
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'アカウントが正常に作成されました！ログインしてください。',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'アカウント作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
