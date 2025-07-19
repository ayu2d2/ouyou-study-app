import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 認証・デバッグ情報を提供
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL || false,
      url: request.url,
      headers: {
        'user-agent': request.headers.get('user-agent'),
        'host': request.headers.get('host'),
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-real-ip': request.headers.get('x-real-ip')
      },
      env_vars: {
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL || 'NOT_SET',
        VERCEL_ENV: process.env.VERCEL_ENV || 'NOT_SET'
      }
    }

    console.log('[DEBUG API CALLED]', JSON.stringify(debugInfo, null, 2))

    return NextResponse.json(debugInfo)
  } catch (error: unknown) {
    console.error('[DEBUG API ERROR]', error)
    return NextResponse.json(
      { 
        error: 'Debug info retrieval failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}