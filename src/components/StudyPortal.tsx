'use client'

import { useState } from 'react'
import { ExternalLink, Globe, BookOpen, X, Maximize2, Minimize2 } from 'lucide-react'

export const StudyPortal = () => {
  const [showIframe, setShowIframe] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const studyLinks = [
    {
      title: '過去問道場',
      description: '3,200問の過去問でランダム出題',
      url: 'https://www.ap-siken.com/mobile/apkakomon.php',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'blue',
      embedSupported: true
    },
    {
      title: '最新過去問 (令和7年春期)',
      description: '最新の過去問と解説',
      url: 'https://www.ap-siken.com/mobile/kakomon/07_haru/',
      icon: <Globe className="w-6 h-6" />,
      color: 'green',
      embedSupported: true
    },
    {
      title: 'テクノロジ系問題',
      description: '分野別の問題演習',
      url: 'https://www.ap-siken.com/mobile/index_te.html',
      icon: <Globe className="w-6 h-6" />,
      color: 'purple',
      embedSupported: true
    },
    {
      title: 'マネジメント系問題',
      description: 'プロジェクト管理分野',
      url: 'https://www.ap-siken.com/mobile/index_ma.html',
      icon: <Globe className="w-6 h-6" />,
      color: 'orange',
      embedSupported: true
    }
  ]

  const handleLinkClick = (url: string, embedSupported: boolean) => {
    if (embedSupported) {
      setCurrentUrl(url)
      setShowIframe(true)
    } else {
      window.open(url, '_blank')
    }
  }

  const closeIframe = () => {
    setShowIframe(false)
    setIsFullscreen(false)
    setCurrentUrl('')
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

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
    <>
      <div className="space-y-6">
        {/* 学習ポータルヘッダー */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <h2 className="text-xl font-semibold flex items-center">
              <BookOpen className="mr-2" />
              学習ポータル
            </h2>
            <p className="text-blue-100 text-sm mt-1">効率的な学習のためのリソース</p>
          </div>

          {/* 学習リンク集 */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {studyLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleLinkClick(link.url, link.embedSupported)}
                  className={`p-4 rounded-lg bg-gradient-to-br ${getColorClasses(link.color)} text-white transform hover:scale-105 transition-all duration-200 text-left w-full`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {link.icon}
                        <span className="ml-2 font-semibold">{link.title}</span>
                      </div>
                      <p className="text-sm opacity-90">{link.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-2 opacity-80" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 学習のコツ */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">📝 効率的な学習のコツ</h3>
          <ul className="space-y-2 text-yellow-700 text-sm">
            <li>• 学習開始前に必ずタイマーを開始しましょう</li>
            <li>• 25分学習 + 5分休憩のポモドーロテクニックがおすすめ</li>
            <li>• 間違えた問題は必ず解説を読んで理解しましょう</li>
            <li>• 毎日継続することが最も重要です</li>
          </ul>
        </div>
      </div>

      {/* フルスクリーン/モーダル iframe */}
      {showIframe && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
            isFullscreen 
              ? 'w-screen h-screen rounded-none' 
              : 'w-[95vw] h-[90vh] max-w-7xl'
          }`}>
            {/* コントロールバー */}
            <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">AP試験学習サイト</span>
                <span className="text-sm text-gray-500 hidden sm:inline">- 応用情報技術者試験</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title={isFullscreen ? '縮小表示' : 'フルスクリーン'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="新しいタブで開く"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </a>
                <button
                  onClick={closeIframe}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="閉じる"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* iframe */}
            <iframe
              src={currentUrl}
              className="w-full border-0"
              title="AP試験学習サイト"
              sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation allow-popups allow-downloads"
              style={{ 
                height: isFullscreen 
                  ? 'calc(100vh - 60px)' 
                  : 'calc(90vh - 60px)',
                minHeight: '600px'
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
