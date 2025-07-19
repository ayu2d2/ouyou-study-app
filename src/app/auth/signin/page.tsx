'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const router = useRouter()
  
  // Vercel環境かどうかを判定
  const isVercel = process.env.NODE_ENV === 'production' || process.env.VERCEL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebugInfo('')

    // 詳細ログ出力
    console.log('[SIGNIN ATTEMPT]', JSON.stringify({
      timestamp: new Date().toISOString(),
      email,
      passwordLength: password.length,
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL || false,
      userAgent: navigator.userAgent
    }, null, 2))

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      // レスポンス詳細ログ
      console.log('[SIGNIN RESPONSE]', JSON.stringify({
        timestamp: new Date().toISOString(),
        success: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url
      }, null, 2))

      if (result?.error) {
        // エラータイプを特定してユーザーフレンドリーなメッセージに変換
        let errorMessage = 'ログインに失敗しました'
        
        // NextAuthエラーメッセージから詳細を抽出
        if (result.error.includes('CredentialsSignin')) {
          errorMessage = 'メールアドレスまたはパスワードが正しくありません'
        }

        // 本番環境（Vercel）では詳細情報を表示
        if (isVercel) {
          const debugDetails = `
[デバッグ情報]
時刻: ${new Date().toISOString()}
エラー: ${result.error}
ステータス: ${result.status || 'N/A'}
環境: ${process.env.NODE_ENV}
Vercel: ${process.env.VERCEL || false}
          `.trim()
          setDebugInfo(debugDetails)
        }

        setError(errorMessage)
        console.error('[SIGNIN ERROR]', JSON.stringify({
          timestamp: new Date().toISOString(),
          error: result.error,
          email
        }, null, 2))
      } else if (result?.ok) {
        console.log('[SIGNIN SUCCESS]', JSON.stringify({
          timestamp: new Date().toISOString(),
          email,
          message: 'ログイン成功、セッション更新中...'
        }, null, 2))
        
        // セッションを更新してからリダイレクト
        const session = await getSession()
        console.log('[SESSION UPDATED]', JSON.stringify({
          timestamp: new Date().toISOString(),
          session: !!session,
          userId: session?.user?.id || 'NO_ID',
          email: session?.user?.email || 'NO_EMAIL'
        }, null, 2))
        
        router.push('/')
        router.refresh() // ページを強制更新
      } else {
        const errorMessage = 'ログイン処理で予期しないエラーが発生しました'
        setError(errorMessage)
        
        if (isVercel) {
          const debugDetails = `
[デバッグ情報]
時刻: ${new Date().toISOString()}
予期しない結果: ${JSON.stringify(result)}
          `.trim()
          setDebugInfo(debugDetails)
        }
        
        console.error('[SIGNIN UNEXPECTED]', JSON.stringify({
          timestamp: new Date().toISOString(),
          result,
          email
        }, null, 2))
      }
    } catch (caughtError: unknown) {
      const errorMessage = 'ログイン中にエラーが発生しました'
      setError(errorMessage)
      
      if (isVercel) {
        const debugDetails = `
[デバッグ情報]
時刻: ${new Date().toISOString()}
キャッチエラー: ${caughtError instanceof Error ? caughtError.message : 'Unknown error'}
スタック: ${caughtError instanceof Error ? caughtError.stack : 'No stack trace'}
        `.trim()
        setDebugInfo(debugDetails)
      }
      
      console.error('[SIGNIN CATCH ERROR]', JSON.stringify({
        timestamp: new Date().toISOString(),
        error: caughtError instanceof Error ? caughtError.message : 'Unknown error',
        stack: caughtError instanceof Error ? caughtError.stack : undefined,
        email
      }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('demo@example.com')
    setPassword('demo123')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            勉強を続けてストリークを伸ばそう！
          </p>
        </div>
        
        {/* デモ用のお知らせ */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <p className="text-sm">
            <strong>デモ環境:</strong> 
            <button 
              onClick={handleDemoLogin}
              className="ml-2 underline hover:no-underline"
            >
              demo@example.com / demo123
            </button> 
            でログインできます
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {debugInfo && isVercel && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <details>
                <summary className="cursor-pointer font-medium">デバッグ情報を表示</summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap overflow-x-auto">
                  {debugInfo}
                </pre>
              </details>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="パスワード"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                パスワードをお忘れですか？
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{' '}
              <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                新規登録
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
