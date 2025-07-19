// Push通知の登録
export async function registerPushNotification(): Promise<string | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('Service Worker registered:', registration)

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      console.error('VAPID public key not found')
      return null
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })

    return JSON.stringify(subscription)
  } catch (error) {
    console.error('Failed to register push notification:', error)
    return null
  }
}

// Base64 URL文字列をUint8Arrayに変換
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
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
