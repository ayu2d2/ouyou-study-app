import { NextResponse } from 'next/server'

export async function GET() {
  // セキュリティのため、本番環境では無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Production debug disabled' }, { status: 403 })
  }

  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    DATABASE_URL_TYPE: process.env.DATABASE_URL?.includes('postgres') ? 'PostgreSQL' : 
                       process.env.DATABASE_URL?.includes('file:') ? 'SQLite' : 'Unknown',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET
  })
}
