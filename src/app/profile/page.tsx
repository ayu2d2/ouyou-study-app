'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Camera, Save, Trash2, User } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState({
    username: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchProfile();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile({
          username: data.username || '',
          email: data.email || ''
        });
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: profile.username
        })
      });

      if (response.ok) {
        setMessage('プロフィールを更新しました');
      } else {
        const errorData = await response.json();
        setMessage(`エラー: ${errorData.message}`);
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      setMessage('プロフィールの更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('アカウントを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE'
      });

      if (response.ok) {
        window.location.href = '/api/auth/signout';
      } else {
        setMessage('アカウント削除に失敗しました');
      }
    } catch (error) {
      console.error('アカウント削除エラー:', error);
      setMessage('アカウント削除に失敗しました');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Link
            href="/auth/signin"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            戻る
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">プロフィール設定</h1>
            <p className="text-gray-600 mt-1">アカウント情報を管理できます</p>
          </div>
        </div>

        {/* メッセージ */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('エラー') || message.includes('失敗')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8">
            {/* 基本情報 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-800">基本情報</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* プロフィール画像 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プロフィール画像
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <button
                      type="button"
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      画像を変更（準備中）
                    </button>
                  </div>
                </div>

                {/* ユーザー名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ユーザー名
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="ユーザー名を入力"
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="メールアドレス"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">メールアドレスは変更できません</p>
                </div>

                {/* 準備中の機能 */}
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">準備中の機能</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 自己紹介文の設定</li>
                      <li>• プライバシー設定</li>
                      <li>• 通知設定</li>
                      <li>• プロフィール画像のアップロード</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作ボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? '保存中...' : '変更を保存'}
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                アカウント削除
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
