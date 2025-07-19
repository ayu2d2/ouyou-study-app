'use client'

import { useState } from 'react'
import { ExternalLink, Globe, BookOpen } from 'lucide-react'

export const StudyPortal = () => {
  const [showIframe, setShowIframe] = useState(false)

  const studyLinks = [
    {
      title: '過去問道場',
      description: '3,200問の過去問でランダム出題',
      url: 'https://www.ap-siken.com/apkakomon.php',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: '最新過去問 (令和7年春期)',
      description: '最新の過去問と解説',
      url: 'https://www.ap-siken.com/kakomon/07_haru/',
      icon: <Globe className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'テクノロジ系問題',
      description: '分野別の問題演習',
      url: 'https://www.ap-siken.com/index_te.html',
      icon: <Globe className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'マネジメント系問題',
      description: 'プロジェクト管理分野',
      url: 'https://www.ap-siken.com/index_ma.html',
      icon: <Globe className="w-6 h-6" />,
      color: 'orange'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* 過去問道場の埋め込み表示 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h2 className="text-xl font-semibold flex items-center">
            <BookOpen className="mr-2" />
            学習ポータル
          </h2>
          <p className="text-blue-100 text-sm mt-1">効率的な学習のためのリソース</p>
        </div>

        {/* 埋め込みフレーム切り替え */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowIframe(!showIframe)}
            className="flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Globe className="mr-2 w-4 h-4" />
            {showIframe ? '埋め込み表示を閉じる' : '過去問道場を埋め込み表示'}
          </button>
        </div>

        {/* 埋め込み iframe */}
        {showIframe && (
          <div className="relative">
            <iframe
              src="https://www.ap-siken.com/apkakomon.php"
              className="w-full h-96 border-0"
              title="AP試験過去問道場"
              sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation"
            />
            <div className="absolute top-2 right-2">
              <a
                href="https://www.ap-siken.com/apkakomon.php"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/90 hover:bg-white text-gray-700 px-3 py-1 rounded-lg text-sm flex items-center shadow-md"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                新しいタブで開く
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 学習リンク集 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studyLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-6 rounded-xl shadow-lg bg-gradient-to-br ${getColorClasses(link.color)} text-white transform hover:scale-105 transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {link.icon}
                  <h3 className="text-lg font-semibold ml-2">{link.title}</h3>
                </div>
                <p className="text-white/90 text-sm">{link.description}</p>
              </div>
              <ExternalLink className="w-5 h-5 opacity-75" />
            </div>
          </a>
        ))}
      </div>

      {/* 学習のコツ */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-3">📝 効率的な学習のコツ</h3>
        <ul className="space-y-2 text-yellow-700 dark:text-yellow-300 text-sm">
          <li>• 学習開始前に必ずタイマーを開始しましょう</li>
          <li>• 25分学習 + 5分休憩のポモドーロテクニックがおすすめ</li>
          <li>• 間違えた問題は必ず解説を読んで理解しましょう</li>
          <li>• 毎日継続することが最も重要です</li>
        </ul>
      </div>
    </div>
  )
}
