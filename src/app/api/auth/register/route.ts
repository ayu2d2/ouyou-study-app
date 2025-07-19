import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { validateEmail, logAuthenticationAttempt } from '@/lib/auth-errors'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const startTime = new Date().toISOString()
  let email = ''
  
  try {
    const { email: reqEmail, username, password } = await request.json()
    email = reqEmail || ''

    // 詳細ログ出力
    logAuthenticationAttempt(email, 'REGISTRATION_START', {
      hasEmail: !!reqEmail,
      hasUsername: !!username,
      hasPassword: !!password,
      emailLength: reqEmail?.length || 0,
      usernameLength: username?.length || 0,
      passwordLength: password?.length || 0
    })

    // バリデーション
    if (!reqEmail || !username || !password) {
      logAuthenticationAttempt(email, 'REGISTRATION_VALIDATION_FAILED', {
        missingFields: {
          email: !reqEmail,
          username: !username,
          password: !password
        }
      })
      return NextResponse.json(
        { 
          error: 'メールアドレス、ユーザー名、パスワードは必須です',
          details: process.env.NODE_ENV === 'production' ? `Missing fields at ${startTime}` : undefined
        },
        { status: 400 }
      )
    }

    // メールアドレス形式チェック
    if (!validateEmail(reqEmail)) {
      logAuthenticationAttempt(email, 'REGISTRATION_EMAIL_INVALID', {
        providedEmail: reqEmail
      })
      return NextResponse.json(
        { 
          error: 'メールアドレスの形式が正しくありません',
          details: process.env.NODE_ENV === 'production' ? `Invalid email format: ${reqEmail} at ${startTime}` : undefined
        },
        { status: 400 }
      )
    }

    // パスワードの長さチェック
    if (password.length < 6) {
      logAuthenticationAttempt(email, 'REGISTRATION_PASSWORD_TOO_SHORT', {
        passwordLength: password.length
      })
      return NextResponse.json(
        { 
          error: 'パスワードは6文字以上で入力してください',
          details: process.env.NODE_ENV === 'production' ? `Password length: ${password.length} at ${startTime}` : undefined
        },
        { status: 400 }
      )
    }

    logAuthenticationAttempt(email, 'REGISTRATION_VALIDATION_PASSED')

    // ユーザーの存在チェック
    logAuthenticationAttempt(email, 'REGISTRATION_DB_CHECK_START')
    
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: reqEmail }
    })

    if (existingUserByEmail) {
      logAuthenticationAttempt(email, 'REGISTRATION_EMAIL_EXISTS', {
        existingUserId: existingUserByEmail.id
      })
      return NextResponse.json(
        { 
          error: 'このメールアドレスは既に使用されています',
          details: process.env.NODE_ENV === 'production' ? `Email already exists: ${reqEmail} at ${startTime}` : undefined
        },
        { status: 400 }
      )
    }

    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUserByUsername) {
      logAuthenticationAttempt(email, 'REGISTRATION_USERNAME_EXISTS', {
        existingUserId: existingUserByUsername.id
      })
      return NextResponse.json(
        { 
          error: 'このユーザー名は既に使用されています',
          details: process.env.NODE_ENV === 'production' ? `Username already exists: ${username} at ${startTime}` : undefined
        },
        { status: 400 }
      )
    }

    logAuthenticationAttempt(email, 'REGISTRATION_UNIQUENESS_VERIFIED')

    // パスワードのハッシュ化
    logAuthenticationAttempt(email, 'REGISTRATION_PASSWORD_HASH_START')
    const hashedPassword = await bcrypt.hash(password, 12)
    logAuthenticationAttempt(email, 'REGISTRATION_PASSWORD_HASH_COMPLETE')

    // ユーザー作成
    logAuthenticationAttempt(email, 'REGISTRATION_USER_CREATE_START')
    const user = await prisma.user.create({
      data: {
        email: reqEmail,
        username,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    })

    logAuthenticationAttempt(email, 'REGISTRATION_SUCCESS', {
      userId: user.id,
      username: user.username
    })

    return NextResponse.json({
      message: 'アカウントが正常に作成されました',
      user
    })

  } catch (error: unknown) {
    console.error('[REGISTRATION ERROR]', JSON.stringify({
      timestamp: new Date().toISOString(),
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL || false
    }, null, 2))
    
    return NextResponse.json(
      { 
        error: 'アカウント作成中にエラーが発生しました',
        details: process.env.NODE_ENV === 'production' ? 
          `Registration failed at ${startTime}. Error: ${error instanceof Error ? error.message : 'Unknown error'}` : 
          undefined
      },
      { status: 500 }
    )
  }
}
