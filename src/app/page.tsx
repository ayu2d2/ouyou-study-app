'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BookOpen, Trophy, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // ログイン済みの場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('ログイン中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  // ログイン中の場合はローディング表示
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // すでにログイン済みの場合は何も表示しない（リダイレクト中）
  if (session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 text-center sm:text-left">
            応用情報技術者試験 勉強アプリ
          </h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* 左側: アプリの説明 */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                効率的な学習で<br />
                <span className="text-indigo-600">合格を目指そう</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                応用情報技術者試験の過去問練習と進捗管理ができる学習アプリです。
                友達と一緒に勉強して、お互いの成長を確認できます。
              </p>
            </div>

            {/* 特徴 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">過去問練習</h3>
                  <p className="text-xs sm:text-sm text-gray-600">豊富な過去問で実力アップ</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">ストリーク</h3>
                  <p className="text-xs sm:text-sm text-gray-600">継続学習で習慣化</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">友達機能</h3>
                  <p className="text-xs sm:text-sm text-gray-600">みんなで一緒に成長</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">進捗管理</h3>
                  <p className="text-xs sm:text-sm text-gray-600">学習の可視化</p>
                </div>
              </div>
            </div>
          </div>

          {/* 右側: ログインフォーム */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 order-1 lg:order-2">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                学習を始めましょう
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                アカウントにログインして、効率的な学習を開始
              </p>
            </div>

            {/* ログインフォーム */}
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="パスワードを入力"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.465 8.465M9.878 9.878A3 3 0 105.636 5.636m4.242 4.242L8.465 8.465m4.242 4.242l4.243 4.243m0 0a10.05 10.05 0 003.071-7.029m0 0a9.97 9.97 0 00-1.563-3.029M13.875 18.825L8.465 8.465" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    ログイン状態を保持
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">
                    パスワードを忘れた場合
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>

            {/* デモアカウント情報 */}
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-2">デモアカウント:</p>
              <p className="text-xs text-blue-600">
                メール: demo@example.com<br />
                パスワード: demo123
              </p>
            </div>

            {/* 新規登録リンク */}
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでない場合{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  新規登録
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <p className="text-xs sm:text-sm">
            © 2025 応用情報技術者試験 勉強アプリ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
