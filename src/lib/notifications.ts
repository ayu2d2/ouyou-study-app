// Push通知の登録（簡易版）
export async function registerPushNotification(): Promise<string | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported')
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    return 'notification-enabled'
  } catch (error) {
    console.error('Failed to register push notification:', error)
    return null
  }
}

// 学習リマインダー通知
export function sendStudyReminder() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('勉強時間です！', {
      body: '今日の学習目標を達成するために、少し勉強してみませんか？',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'study-reminder'
    })
  }
}

// ストリーク継続通知
export function sendStreakReminder(streak: number) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`${streak}日連続ストリーク継続中！`, {
      body: '素晴らしいです！今日も勉強してストリークを伸ばしましょう！',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'streak-reminder'
    })
  }
}
