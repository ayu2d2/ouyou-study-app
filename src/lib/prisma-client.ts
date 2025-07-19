// Prismaクライアントを環境に応じて初期化
import { PrismaClient } from '@prisma/client'

// グローバルに Prisma インスタンスを保持（開発環境での接続プール問題を回避）
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 環境に応じたPrismaクライアントの設定
export const prisma = 
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
