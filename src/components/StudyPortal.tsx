'use client'

import { useState, useEffect, useRef } from 'react'
import { ExternalLink, Globe, BookOpen, X, Maximize2, Minimize2, ZoomIn, ZoomOut, Monitor } from 'lucide-react'

export const StudyPortal = () => {
  const [showIframe, setShowIframe] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [autoResize, setAutoResize] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const studyLinks = [
    {
      title: '過去問道場',
      description: '3,200問の過去問でランダム出題',
      url: 'https://www.ap-siken.com/s/apkakomon.php',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'blue',
      embedSupported: true
    },
    {
      title: '最新過去問 (令和7年春期)',
      description: '最新の過去問と解説',
      url: 'https://www.ap-siken.com/s/kakomon/07_haru/',
      icon: <Globe className="w-6 h-6" />,
      color: 'green',
      embedSupported: true
    },
    {
      title: 'テクノロジ系問題',
      description: '分野別の問題演習',
      url: 'https://www.ap-siken.com/s/index_te.html',
      icon: <Globe className="w-6 h-6" />,
      color: 'purple',
      embedSupported: true
    },
    {
      title: 'マネジメント系問題',
      description: 'プロジェクト管理分野',
      url: 'https://www.ap-siken.com/s/index_ma.html',
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
    setZoomLevel(100)
    setAutoResize(true)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 150))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 70))
  }

  const resetZoom = () => {
    setZoomLevel(100)
  }

  const toggleAutoResize = () => {
    setAutoResize(!autoResize)
  }

  // iframeが読み込まれた後に自動リサイズのスタイルを適用
  useEffect(() => {
    if (showIframe && iframeRef.current && autoResize) {
      const iframe = iframeRef.current
      
      const applyResponsiveStyles = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            // 既存のスタイルを削除
            const existingStyle = iframeDoc.getElementById('responsive-injected-style')
            if (existingStyle) {
              existingStyle.remove()
            }

            // レスポンシブ用のスタイルを注入
            const style = iframeDoc.createElement('style')
            style.id = 'responsive-injected-style'
            style.textContent = `
              /* 全体的なレスポンシブ調整 */
              * {
                max-width: 100% !important;
                box-sizing: border-box !important;
              }
              
              body {
                transform-origin: top left !important;
                width: 100% !important;
                overflow-x: auto !important;
                margin: 0 !important;
                padding: 10px !important;
              }
              
              /* テーブル調整 */
              table {
                width: 100% !important;
                table-layout: fixed !important;
                border-collapse: collapse !important;
              }
              
              td, th {
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
                max-width: 100% !important;
              }
              
              /* コンテナ調整 */
              .container, .main, .content, div[width] {
                max-width: 100% !important;
                width: 100% !important;
              }
              
              /* フォーム要素調整 */
              input, select, textarea {
                max-width: 100% !important;
                width: 100% !important;
              }
              
              /* 固定幅要素の調整 */
              .fixed-width, [width] {
                width: auto !important;
                max-width: 100% !important;
              }
              
              /* 画像調整 */
              img {
                max-width: 100% !important;
                height: auto !important;
              }
              
              /* ナビゲーション調整 */
              .nav, .navigation, .menu {
                flex-wrap: wrap !important;
                overflow-x: auto !important;
              }
              
              /* フォントサイズの最適化 */
              body, div, span, p, td, th {
                font-size: clamp(12px, 2.5vw, 16px) !important;
                line-height: 1.4 !important;
              }
              
              /* モバイル対応のメディアクエリ */
              @media (max-width: 768px) {
                body {
                  font-size: 14px !important;
                }
                table {
                  font-size: 12px !important;
                }
              }
            `
            iframeDoc.head.appendChild(style)

            // ビューポートメタタグを追加/更新
            let viewport = iframeDoc.querySelector('meta[name="viewport"]')
            if (!viewport) {
              viewport = iframeDoc.createElement('meta')
              viewport.setAttribute('name', 'viewport')
              iframeDoc.head.appendChild(viewport)
            }
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=3, user-scalable=yes')
          }
        } catch (error) {
          console.log('Cross-origin restrictions prevent iframe styling:', error)
        }
      }

      // iframeの読み込み完了を待つ
      const handleLoad = () => {
        setTimeout(applyResponsiveStyles, 100) // 少し遅延を追加
      }

      iframe.addEventListener('load', handleLoad)
      
      // 既に読み込まれている場合は即座に適用
      if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
        handleLoad()
      }
      
      return () => {
        iframe.removeEventListener('load', handleLoad)
      }
    }
  }, [showIframe, autoResize])

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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
            isFullscreen 
              ? 'w-screen h-screen rounded-none' 
              : 'w-[98vw] h-[95vh] max-w-none'
          }`}>
            {/* コントロールバー */}
            <div className="flex items-center justify-between p-3 bg-gray-100 border-b shrink-0">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">AP試験学習サイト</span>
                <span className="text-sm text-gray-500 hidden sm:inline">- 応用情報技術者試験</span>
              </div>
              <div className="flex items-center space-x-1">
                {/* 自動リサイズ切り替え */}
                <button
                  onClick={toggleAutoResize}
                  className={`p-2 rounded-lg transition-colors mr-2 ${
                    autoResize 
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  title={autoResize ? '自動調整: ON' : '自動調整: OFF'}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                {/* ズームコントロール */}
                <div className="flex items-center space-x-1 mr-2 border-r pr-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="縮小"
                    disabled={zoomLevel <= 70}
                  >
                    <ZoomOut className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="px-2 py-1 hover:bg-gray-200 rounded text-xs font-medium text-gray-600"
                    title="リセット"
                  >
                    {zoomLevel}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="拡大"
                    disabled={zoomLevel >= 150}
                  >
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
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
              ref={iframeRef}
              src={currentUrl}
              className="w-full border-0"
              title="AP試験学習サイト"
              sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation allow-popups allow-downloads"
              style={{ 
                height: isFullscreen 
                  ? 'calc(100vh - 60px)' 
                  : 'calc(95vh - 120px)',
                minHeight: isFullscreen ? '600px' : '700px',
                transform: autoResize 
                  ? `scale(${zoomLevel / 100})`
                  : `scale(${zoomLevel / 100})`,
                transformOrigin: 'top left',
                width: autoResize 
                  ? `${100 / (zoomLevel / 100)}%`
                  : `${100 / (zoomLevel / 100)}%`,
                border: autoResize ? '1px solid #e5e7eb' : 'none'
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
