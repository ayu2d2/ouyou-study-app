'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Users, UserPlus, Crown, Zap, Clock, Target, Trash2 } from 'lucide-react'
import { getLevelTitle } from '@/lib/xp-system'

interface Friend {
  id: string
  username: string
  totalXP: number
  level: number
  totalStudyTime: number
  totalProblems: number
  totalCorrect: number
  accuracy: number
  friendshipId: string
  friendSince: string
}

interface FriendRequest {
  id: string
  sender?: {
    id: string
    username: string
    totalXP: number
    level: number
  }
  receiver?: {
    id: string
    username: string
    totalXP: number
    level: number
  }
  createdAt: string
}

export default function FriendsList() {
  const { data: session } = useSession()
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [newFriendUsername, setNewFriendUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingFriend, setAddingFriend] = useState(false)
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends')

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // フレンド一覧取得
      const friendsResponse = await fetch('/api/friends')
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json()
        setFriends(friendsData.friends || [])
      }

      // 受信したフレンドリクエスト取得
      const requestsResponse = await fetch('/api/friends/requests?type=received')
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setFriendRequests(requestsData.friendships || [])
      }

      // 送信したフレンドリクエスト取得
      const sentResponse = await fetch('/api/friends/requests?type=sent')
      if (sentResponse.ok) {
        const sentData = await sentResponse.json()
        setSentRequests(sentData.friendships || [])
      }

    } catch (error) {
      console.error('データ読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async () => {
    if (!newFriendUsername.trim()) return

    try {
      setAddingFriend(true)
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverUsername: newFriendUsername })
      })

      const data = await response.json()

      if (response.ok) {
        setNewFriendUsername('')
        alert('フレンドリクエストを送信しました！')
        loadData() // データを再読み込み
      } else {
        alert(data.error || 'エラーが発生しました')
      }
    } catch (error) {
      console.error('フレンドリクエスト送信エラー:', error)
      alert('フレンドリクエストの送信に失敗しました')
    } finally {
      setAddingFriend(false)
    }
  }

  const respondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        loadData() // データを再読み込み
      } else {
        alert(data.error || 'エラーが発生しました')
      }
    } catch (error) {
      console.error('フレンドリクエスト応答エラー:', error)
      alert('処理に失敗しました')
    }
  }

  const removeFriend = async (friendId: string) => {
    if (!confirm('このフレンドを削除しますか？')) return

    try {
      const response = await fetch('/api/friends', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      })

      const data = await response.json()

      if (response.ok) {
        alert('フレンドを削除しました')
        loadData() // データを再読み込み
      } else {
        alert(data.error || 'エラーが発生しました')
      }
    } catch (error) {
      console.error('フレンド削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}時間${minutes}分`
    }
    return `${minutes}分`
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">フレンド機能を利用するにはログインが必要です</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <Users className="w-5 h-5 mr-2 text-indigo-600" />
          フレンド
        </h2>
      </div>

      {/* タブ */}
      <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'friends'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          フレンド ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          リクエスト ({friendRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'add'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          追加
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">読み込み中...</p>
        </div>
      ) : (
        <>
          {/* フレンド一覧 */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">まだフレンドがいません</p>
                  <p className="text-sm text-gray-500">フレンドを追加して一緒に勉強しましょう！</p>
                </div>
              ) : (
                friends.map((friend) => {
                  const levelInfo = getLevelTitle(friend.level)
                  return (
                    <div key={friend.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-white text-xl`}>
                            {levelInfo.emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{friend.username}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Crown className="w-4 h-4 mr-1" />
                                Lv.{friend.level}
                              </span>
                              <span className="flex items-center">
                                <Zap className="w-4 h-4 mr-1" />
                                {friend.totalXP.toLocaleString()} XP
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatTime(friend.totalStudyTime)}
                              </span>
                              <span className="flex items-center">
                                <Target className="w-4 h-4 mr-1" />
                                {friend.accuracy}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFriend(friend.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="フレンドを削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* フレンドリクエスト */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {friendRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">新しいフレンドリクエストはありません</p>
                </div>
              ) : (
                friendRequests.map((request) => {
                  const sender = request.sender!
                  const levelInfo = getLevelTitle(sender.level)
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-white`}>
                            {levelInfo.emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{sender.username}</h3>
                            <p className="text-sm text-gray-600">Lv.{sender.level} • {sender.totalXP.toLocaleString()} XP</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => respondToRequest(request.id, 'accept')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => respondToRequest(request.id, 'decline')}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                          >
                            拒否
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              {/* 送信済みリクエスト */}
              {sentRequests.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">送信済みリクエスト</h3>
                  <div className="space-y-3">
                    {sentRequests.map((request) => {
                      const receiver = request.receiver!
                      return (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">{receiver.username}</span>
                            <span className="text-sm text-gray-500">送信済み</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* フレンド追加 */}
          {activeTab === 'add' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザー名でフレンドを検索
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFriendUsername}
                    onChange={(e) => setNewFriendUsername(e.target.value)}
                    placeholder="ユーザー名を入力"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && sendFriendRequest()}
                  />
                  <button
                    onClick={sendFriendRequest}
                    disabled={addingFriend || !newFriendUsername.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {addingFriend ? '送信中...' : '追加'}
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">フレンド機能について</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• フレンドの学習進捗を確認できます</li>
                  <li>• XPやレベル、学習時間を比較できます</li>
                  <li>• お互いのモチベーション向上につながります</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
