import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'トークンと新しいパスワードは必須です' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上である必要があります' },
        { status: 400 }
      )
    }

    // トークンを検証
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: '無効なトークンです' },
        { status: 400 }
      )
    }

    if (resetToken.used) {
      return NextResponse.json(
        { error: 'このトークンは既に使用されています' },
        { status: 400 }
      )
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'トークンの有効期限が切れています' },
        { status: 400 }
      )
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // パスワードを更新
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // トークンを使用済みにマーク
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    })

    return NextResponse.json({
      message: 'パスワードが正常に更新されました'
    })

  } catch (error) {
    console.error('パスワードリセットエラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
