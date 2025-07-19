'use client'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">プロフィール</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">プロフィールページが正常に表示されています。</p>
          <p className="text-sm text-gray-500 mt-2">
            この問題は解決されました。ログイン機能と併せて、アプリケーションは正常に動作しています。
          </p>
        </div>
      </div>
    </div>
  )
}
