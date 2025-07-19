import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// API Route内でPrismaクライアントを直接初期化
const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('Registration API called')
    
    const { email, username, password } = await request.json()
    console.log('Request data:', { email, username, password: '***' })

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

    console.log('Prisma client:', !!prisma)
    console.log('Prisma user model:', !!prisma?.user)

    // 既存ユーザーのチェック
    console.log('Checking existing users...')
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    console.log('Existing user check result:', !!existingUser)

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
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // ユーザーを作成
    console.log('Creating user...')
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      }
    })

    console.log('User created successfully:', user.id)

    // パスワードを除いてレスポンス
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  } finally {
    await prisma.$disconnect()
  }
}
