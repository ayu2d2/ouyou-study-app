'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { User, LogOut, Settings, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface UserMenuProps {
  className?: string
}

export default function UserMenu({ className = '' }: UserMenuProps) {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  console.log('UserMenu render:', { session, status })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.user-menu')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Link
          href="/auth/signin"
          className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          ログイン
        </Link>
        <Link
          href="/auth/signup"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          新規登録
        </Link>
      </div>
    )
  }

  return (
    <div className={`relative user-menu ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 bg-white shadow-sm"
      >
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {/* オンライン状態インジケーター */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
        <div className="text-left hidden sm:block">
          <div className="font-medium text-gray-800 text-sm">
            {session.user.username}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {session.user.username}
            </p>
            <p className="text-sm text-gray-500">
              {session.user.email}
            </p>
            <div className="text-xs text-green-600 flex items-center mt-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
              ログイン中
            </div>
          </div>
          
          <div className="py-2">
            <Link
              href="/progress"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              学習進捗
            </Link>

            <Link
              href="/friends"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Users className="w-4 h-4 mr-3" />
              フレンド
            </Link>
            
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3" />
              プロフィール設定
            </Link>
          </div>
          
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: '/' })
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
