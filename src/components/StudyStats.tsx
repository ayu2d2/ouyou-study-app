'use client'

interface StudyStatsProps {
  studySessions: Array<{
    date: string
    duration: number
    timestamp: number
  }>
  formatTime: (seconds: number) => string
}

export const StudyStats = ({ studySessions, formatTime }: StudyStatsProps) => {
  const getStats = () => {
    const totalSessions = studySessions.length
    const studyDays = new Set(studySessions.map(session => session.date)).size
    const averageSession = totalSessions > 0 
      ? Math.floor(studySessions.reduce((sum, session) => sum + session.duration, 0) / totalSessions)
      : 0
    const longestSession = Math.max(...studySessions.map(s => s.duration), 0)
    
    // 7日間の学習データ
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toDateString()
    }).reverse()
    
    const weeklyData = last7Days.map(date => {
      const daySeconds = studySessions
        .filter(session => session.date === date)
        .reduce((sum, session) => sum + session.duration, 0)
      return {
        date: new Date(date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        minutes: Math.floor(daySeconds / 60)
      }
    })
    
    return {
      totalSessions,
      studyDays,
      averageSession,
      longestSession,
      weeklyData
    }
  }

  const stats = getStats()
  const maxMinutes = Math.max(...stats.weeklyData.map(d => d.minutes), 1)

  // 試験日まで
  const examDate = new Date('2025-10-12')
  const today = new Date()
  const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* 基本統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSessions}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">学習セッション数</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.studyDays}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">学習日数</div>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatTime(stats.averageSession)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">平均セッション時間</div>
        </div>
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{daysUntilExam}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">試験まで残り日数</div>
        </div>
      </div>

      {/* 7日間の学習グラフ */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">過去7日間の学習時間</h3>
        <div className="flex items-end justify-between h-32 space-x-2">
          {stats.weeklyData.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="bg-blue-500 w-full rounded-t transition-all duration-300 min-h-[4px]"
                style={{ 
                  height: `${Math.max((day.minutes / maxMinutes) * 100, 4)}%`
                }}
              ></div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{day.date}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{day.minutes}分</div>
            </div>
          ))}
        </div>
      </div>

      {/* 最長セッション */}
      {stats.longestSession > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-700 dark:text-gray-300">最長学習セッション</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {formatTime(stats.longestSession)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
