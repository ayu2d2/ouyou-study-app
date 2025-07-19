import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // 本番環境でのみ実行
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: '本番環境でのみ実行可能です' }, { status: 403 })
    }

    // シードデータの投入
    console.log('シードデータを投入中...')

    // デモユーザーを作成
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('demo123', 12)
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        username: 'Demo User',
        password: hashedPassword,
      },
    })

    console.log('デモユーザーを作成しました:', demoUser)

    return NextResponse.json({ 
      message: 'データベースの初期化が完了しました',
      user: { email: demoUser.email, username: demoUser.username }
    })

  } catch (error) {
    console.error('データベース初期化エラー:', error)
    return NextResponse.json(
      { 
        error: 'データベースの初期化に失敗しました', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
