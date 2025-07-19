// 開発環境用のスクリプト
// 環境に応じてPrismaスキーマを動的に調整

const fs = require('fs')
const path = require('path')

const isDevelopment = process.env.NODE_ENV === 'development'
const schemaPath = path.join(__dirname, 'prisma/schema.prisma')

let schemaContent = fs.readFileSync(schemaPath, 'utf8')

if (isDevelopment && process.env.DATABASE_URL?.includes('file:')) {
  // 開発環境でSQLiteを使用する場合
  schemaContent = schemaContent.replace(
    'provider = "postgresql"',
    'provider = "sqlite"'
  )
} else {
  // 本番環境またはPostgreSQL使用時
  schemaContent = schemaContent.replace(
    'provider = "sqlite"',
    'provider = "postgresql"'
  )
}

fs.writeFileSync(schemaPath, schemaContent)
console.log(`Prisma schema updated for ${isDevelopment ? 'development' : 'production'} environment`)
