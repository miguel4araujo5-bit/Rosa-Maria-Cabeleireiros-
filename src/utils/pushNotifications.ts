import { api } from '../services/api'

export type PushNotificationState =
  | 'unsupported'
  | 'denied'
  | 'active'
  | 'inactive'

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - value.length % 4) % 4)
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

function sameKey(a: ArrayBuffer | null | undefined, b: Uint8Array) {
  if (!a) return false

  const left = new Uint8Array(a)
  if (left.length !== b.length) return false

  for (let i = 0; i < left.length; i++) {
    if (left[i] !== b[i]) return false
  }

  return true
}

export async function readPushNotificationState(): Promise<PushNotificationState> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    !('Notification' in window)
  ) {
    return 'unsupported'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (subscription && Notification.permission === 'granted') {
    return 'active'
  }

  return 'inactive'
}

export async function enablePushNotifications() {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    !('Notification' in window)
  ) {
    throw new Error('Este dispositivo ainda não suporta notificações nesta página. No iPhone, abre a app instalada no Ecrã Principal.')
  }

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission()

  if (permission !== 'granted') {
    throw new Error('As notificações não foram autorizadas.')
  }

  const registration = await navigator.serviceWorker.ready
  const publicKey = await api.getPushPublicKey()
  const applicationServerKey = urlBase64ToUint8Array(publicKey)

  let subscription = await registration.pushManager.getSubscription()

  if (subscription && !sameKey(subscription.options?.applicationServerKey, applicationServerKey)) {
    await subscription.unsubscribe()
    subscription = null
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })
  }

  await api.savePushSubscription(subscription)

  return subscription
}
