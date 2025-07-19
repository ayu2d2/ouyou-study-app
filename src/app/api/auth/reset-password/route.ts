import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  console.log('パスワードリセットAPI呼び出し開始')
  
  try {
    const { email } = await request.json()
    console.log('リクエストされたメール:', email)

    if (!email) {
      console.log('エラー: メールアドレスが未提供')
      return NextResponse.json(
        { error: 'メールアドレスは必須です' },
        { status: 400 }
      )
    }

    // ユーザーが存在するかチェック
    const user = await prisma.user.findUnique({
      where: { email }
    })
    console.log('ユーザー検索結果:', user ? 'ユーザー見つかりました' : 'ユーザーが見つかりません')

    if (!user) {
      // セキュリティのため、存在しないメールアドレスでも成功レスポンスを返す
      console.log('存在しないユーザーのため、偽の成功レスポンス')
      return NextResponse.json({
        message: 'パスワードリセットメールを送信しました（該当するアカウントが存在する場合）'
      })
    }

    // 既存の未使用トークンを無効化
    await prisma.passwordResetToken.updateMany({
      where: {
        email,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      data: {
        used: true
      }
    })

    // リセットトークンを生成
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1時間後

    // トークンをデータベースに保存
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt
      }
    })

    // メール送信の設定（開発環境では実際に送信しない）
    if (process.env.NODE_ENV === 'development') {
      console.log('=== パスワードリセットメール（開発環境） ===')
      console.log(`To: ${email}`)
      console.log(`Reset URL: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`)
      console.log('有効期限: 1時間')
      console.log('==========================================')
    } else {
      // 本番環境でのメール送信設定
      // 実際のメール送信コードをここに実装
      // const transporter = nodemailer.createTransporter({ ... })
      // await transporter.sendMail({ ... })
    }

    return NextResponse.json({
      message: 'パスワードリセットメールを送信しました（該当するアカウントが存在する場合）'
    })

  } catch (error) {
    console.error('パスワードリセット要求エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
