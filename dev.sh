#!/bin/bash
# 開発環境用のスクリプト - SQLiteを使用

# 開発用の環境変数を設定
export DATABASE_URL="file:./dev.db"

# Prismaスキーマを一時的にSQLite用に変更
sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

# 開発サーバーを起動
npm run dev

# 終了時にスキーマを元に戻す
trap 'sed -i.bak "s/provider = \"sqlite\"/provider = \"postgresql\"/" prisma/schema.prisma' EXIT
