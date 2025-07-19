'use client'

import { useState } from 'react'
import { Flame, BookOpen, Users, Trophy, Calendar, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const [streak, setStreak] = useState(7) // 7日連続のストリーク例
  const [todayStudyTime, setTodayStudyTime] = useState(45) // 今日の学習時間（分）
  const [questionsToday, setQuestionsToday] = useState(12) // 今日解いた問題数

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          応用情報技術者試験
        </h1>
        <h2 className="text-2xl text-gray-600 mb-4">勉強アプリ</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          友達と一緒に勉強して、お互いのモチベーションを高めよう！
          ストリーク機能で毎日の学習習慣を維持しましょう。
        </p>
      </header>

      {/* ストリーク表示 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Flame className="w-12 h-12 text-orange-500 mr-3" />
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{streak}日連続</h3>
            <p className="text-gray-600">学習ストリーク</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          素晴らしい！継続は力なり 🔥
        </div>
      </div>

      {/* 今日の学習状況 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">今日の学習時間</h3>
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{todayStudyTime}分</div>
          <div className="text-sm text-gray-500">目標: 60分</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${Math.min((todayStudyTime / 60) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">解いた問題数</h3>
            <BookOpen className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">{questionsToday}問</div>
          <div className="text-sm text-gray-500">今日の目標: 20問</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${Math.min((questionsToday / 20) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">正答率</h3>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">75%</div>
          <div className="text-sm text-gray-500">過去7日間の平均</div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-center mb-3">
            <BookOpen className="w-8 h-8 mr-3" />
            <h3 className="text-xl font-semibold">過去問を解く</h3>
          </div>
          <p className="text-blue-100">応用情報技術者試験の過去問にチャレンジ</p>
        </button>

        <button className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-center mb-3">
            <Users className="w-8 h-8 mr-3" />
            <h3 className="text-xl font-semibold">友達と比較</h3>
          </div>
          <p className="text-green-100">友達の学習進捗と自分を比較してみよう</p>
        </button>
      </div>

      {/* 友達ランキング（サンプル） */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-purple-500 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">友達ランキング（今週）</h3>
        </div>
        
        <div className="space-y-3">
          {[
            { name: '田中太郎', streak: 14, score: 850 },
            { name: 'あなた', streak: 7, score: 720 },
            { name: '佐藤花子', streak: 5, score: 680 },
            { name: '山田次郎', streak: 3, score: 420 },
          ].map((friend, index) => (
            <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
              friend.name === 'あなた' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-3 font-medium">{friend.name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Flame className="w-4 h-4 mr-1 text-orange-500" />
                <span className="mr-4">{friend.streak}日</span>
                <span className="font-semibold">{friend.score}pt</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
