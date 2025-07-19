'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Trophy, Medal, Crown, Clock, List, BarChart3 } from 'lucide-react'

interface RankingUser {
  rank: number
  user: {
    id: string
    username: string
    totalStudyTime: number
  }
  score: number
  isMe: boolean
}

interface RankingData {
  ranking: RankingUser[]
  myRank: RankingUser | null
  type: string
  category: string
  period: string
  total: number
}

export default function Ranking() {
  const { data: session } = useSession()
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'today' | 'weekly' | 'monthly' | 'allTime'>('today')
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')

  useEffect(() => {
    if (session) {
      loadRanking()
    }
  }, [session, selectedType])

  const loadRanking = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/ranking?type=${selectedType}&category=studyTime&limit=50`
      )
      
      if (response.ok) {
        const data = await response.json()
        setRankingData(data)
      } else {
        console.error('Failed to load ranking')
        // デモ用のダミーデータ
        setRankingData({
          ranking: [
            {
              rank: 1,
              user: { id: '1', username: '田中太郎', totalStudyTime: selectedType === 'today' ? 3600 : 7200 },
              score: selectedType === 'today' ? 3600 : 7200,
              isMe: false
            },
            {
              rank: 2,
              user: { id: '2', username: '佐藤花子', totalStudyTime: selectedType === 'today' ? 2700 : 6300 },
              score: selectedType === 'today' ? 2700 : 6300,
              isMe: false
            },
            {
              rank: 3,
              user: { id: '3', username: session?.user?.username || 'あなた', totalStudyTime: selectedType === 'today' ? 1800 : 5400 },
              score: selectedType === 'today' ? 1800 : 5400,
              isMe: true
            },
            {
              rank: 4,
              user: { id: '4', username: '山田次郎', totalStudyTime: selectedType === 'today' ? 1200 : 4500 },
              score: selectedType === 'today' ? 1200 : 4500,
              isMe: false
            },
            {
              rank: 5,
              user: { id: '5', username: '鈴木美咲', totalStudyTime: selectedType === 'today' ? 900 : 3600 },
              score: selectedType === 'today' ? 900 : 3600,
              isMe: false
            }
          ],
          myRank: {
            rank: 3,
            user: { id: '3', username: session?.user?.username || 'あなた', totalStudyTime: selectedType === 'today' ? 1800 : 5400 },
            score: selectedType === 'today' ? 1800 : 5400,
            isMe: true
          },
          type: selectedType,
          category: 'studyTime',
          period: selectedType,
          total: selectedType === 'today' ? 15 : 10
        })
      }
    } catch (error) {
      console.error('Error loading ranking:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>
    }
  }

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}時間${minutes}分${remainingSeconds}秒`
    } else if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`
    }
    return `${remainingSeconds}秒`
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'today': return '今日'
      case 'weekly': return '今週'
      case 'monthly': return '今月'
      case 'allTime': return '全期間'
      default: return type
    }
  }

  const getBarWidth = (score: number, maxScore: number) => {
    if (maxScore === 0) return 0
    return Math.max((score / maxScore) * 100, 2) // 最小2%の幅を確保
  }

  const maxScore = rankingData ? Math.max(...rankingData.ranking.map(r => r.score)) : 0

  if (!session) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">ログインしてランキングを確認しましょう</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          学習時間ランキング
        </h2>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'chart'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 期間選択 */}
      <div className="mb-4">
        <div className="flex space-x-1">
          {(['today', 'weekly', 'monthly', 'allTime'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : rankingData?.ranking.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">まだランキングデータがありません</p>
          <p className="text-sm text-gray-400 mt-1">学習を始めてランキングに参加しましょう！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* 自分のランク（上位10位以外の場合） */}
          {rankingData?.myRank && rankingData.myRank.rank > 10 && (
            <>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full text-sm font-bold">
                      {rankingData.myRank.rank}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rankingData.myRank.user.username}</p>
                      <p className="text-sm text-gray-600">あなたの順位</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatStudyTime(rankingData.myRank.score)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 my-3"></div>
            </>
          )}

          {/* ランキングリスト */}
          {viewMode === 'list' ? (
            // リスト表示
            rankingData?.ranking.map((entry) => (
              <div
                key={entry.user.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  entry.isMe
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <p className={`font-medium ${entry.isMe ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {entry.user.username}
                      {entry.isMe && <span className="text-xs text-indigo-600 ml-1">(あなた)</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${entry.isMe ? 'text-indigo-900' : 'text-gray-900'}`}>
                    {formatStudyTime(entry.score)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            // 棒グラフ表示
            <div className="space-y-3">
              {rankingData?.ranking.map((entry) => (
                <div
                  key={entry.user.id}
                  className={`p-3 rounded-lg ${
                    entry.isMe
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-6 h-6">
                        {getRankIcon(entry.rank)}
                      </div>
                      <p className={`font-medium text-sm ${entry.isMe ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {entry.user.username}
                        {entry.isMe && <span className="text-xs text-indigo-600 ml-1">(あなた)</span>}
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${entry.isMe ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {formatStudyTime(entry.score)}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        entry.isMe
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                          : entry.rank === 1
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : entry.rank === 2
                          ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                          : entry.rank === 3
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                          : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${getBarWidth(entry.score, maxScore)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {rankingData && rankingData.total > rankingData.ranking.length && (
            <div className="text-center py-3">
              <p className="text-sm text-gray-500">
                全{rankingData.total}人中 上位{rankingData.ranking.length}人を表示
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
