'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
      } else {
        setError(data.error || 'エラーが発生しました')
      }
    } catch {
      setError('リクエストの送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            href="/auth/signin"
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ログインに戻る
          </Link>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              パスワードをお忘れですか？
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {message}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs">
                  <strong>開発環境:</strong> リセットリンクはコンソールに出力されています。
                </div>
              )}
            </div>
          )}

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
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'リセットリンクを送信中...' : 'リセットリンクを送信'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              アカウントを思い出しましたか？{' '}
              <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                ログイン
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
