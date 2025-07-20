const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkAndCreateUser() {
  try {
    console.log('データベース接続テスト中...')
    
    // 既存のユーザーを確認
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })
    
    if (existingUser) {
      console.log('デモユーザーが既に存在します:', existingUser.email)
      console.log('ユーザーID:', existingUser.id)
      console.log('ユーザー名:', existingUser.username)
      console.log('作成日:', existingUser.createdAt)
      
      // パスワードをリセット
      const hashedPassword = await bcrypt.hash('demo123', 12)
      const updatedUser = await prisma.user.update({
        where: { email: 'demo@example.com' },
        data: { password: hashedPassword }
      })
      console.log('パスワードをリセットしました')
      
    } else {
      console.log('デモユーザーが存在しません。新規作成します...')
      
      // デモユーザーを作成
      const hashedPassword = await bcrypt.hash('demo123', 12)
      const newUser = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          username: 'Demo User',
          password: hashedPassword,
        }
      })
      console.log('デモユーザーを作成しました:', newUser.email)
    }
    
    // すべてのユーザーを表示
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    })
    console.log('データベース内のユーザー一覧:')
    console.table(allUsers)
    
  } catch (error) {
    console.error('エラー:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateUser()
