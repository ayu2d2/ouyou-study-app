import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// 環境変数を明示的に読み込み
dotenv.config({ path: '.env.local' })

async function checkDemoUser() {
  try {
    console.log('🔧 環境変数を確認中...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Set' : 'Not set')
    
    if (process.env.DATABASE_URL) {
      console.log('DATABASE_URL プレビュー:', process.env.DATABASE_URL.substring(0, 50) + '...')
    }
    
    console.log('📞 データベースに接続中...')
    
    const prisma = new PrismaClient()
    
    // データベース接続確認
    await prisma.$connect()
    console.log('✅ データベース接続成功')
    
    // 既存のデモユーザーを確認
    console.log('🔍 デモユーザーを検索中...')
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })
    
    if (existingUser) {
      console.log('✅ デモユーザーが見つかりました:')
      console.log(`  ID: ${existingUser.id}`)
      console.log(`  Email: ${existingUser.email}`)
      console.log(`  Username: ${existingUser.username}`)
      console.log(`  Created: ${existingUser.createdAt}`)
      
      // パスワードをテスト
      const isValid = await bcrypt.compare('demo123', existingUser.password)
      console.log(`  Password valid: ${isValid}`)
      
      if (!isValid) {
        console.log('🔧 パスワードを更新中...')
        const hashedPassword = await bcrypt.hash('demo123', 12)
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { password: hashedPassword }
        })
        console.log('✅ パスワードを更新しました')
      }
    } else {
      console.log('⚠️ デモユーザーが見つかりません。作成中...')
      const hashedPassword = await bcrypt.hash('demo123', 12)
      
      const newUser = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          username: 'デモユーザー',
          password: hashedPassword
        }
      })
      
      console.log('✅ デモユーザーを作成しました:')
      console.log(`  ID: ${newUser.id}`)
      console.log(`  Email: ${newUser.email}`)
      console.log(`  Username: ${newUser.username}`)
    }
    
    // 全ユーザー数を確認
    const userCount = await prisma.user.count()
    console.log(`📊 合計ユーザー数: ${userCount}`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  } finally {
    console.log('📤 データベース接続を切断しました')
  }
}

checkDemoUser()
