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

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
  let timer: number | undefined

  const timeout = new Promise<T>((_, reject) => {
    timer = window.setTimeout(() => {
      reject(new Error(message))
    }, milliseconds)
  })

  return Promise.race([
    promise.finally(() => {
      if (timer) window.clearTimeout(timer)
    }),
    timeout,
  ])
}

async function getServiceWorkerRegistration() {
  let registration = await navigator.serviceWorker.getRegistration()

  if (!registration) {
    registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  } else {
    await registration.update().catch(() => null)
  }

  if (registration.active) {
    return registration
  }

  return withTimeout(
    navigator.serviceWorker.ready,
    12000,
    'O service worker ainda não ficou ativo. Fecha a app, abre novamente pelo ícone do Ecrã Principal e tenta outra vez.'
  )
}

async function requestNotificationPermission() {
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'

  return withTimeout(
    Notification.requestPermission(),
    15000,
    'O iPhone não abriu o pedido de permissão. Fecha a app, abre novamente pelo ícone do Ecrã Principal e tenta outra vez.'
  )
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

  try {
    const registration = await getServiceWorkerRegistration()
    const subscription = await registration.pushManager.getSubscription()

    if (subscription && Notification.permission === 'granted') {
      return 'active'
    }

    return 'inactive'
  } catch {
    return 'inactive'
  }
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

  const permission = await requestNotificationPermission()

  if (permission === 'denied') {
    throw new Error('As notificações estão bloqueadas. Ativa-as nas definições do iPhone para esta app.')
  }

  if (permission !== 'granted') {
    throw new Error('As notificações não foram autorizadas.')
  }

  const registration = await getServiceWorkerRegistration()
  const publicKey = await api.getPushPublicKey()
  const applicationServerKey = urlBase64ToUint8Array(publicKey)

  let subscription = await registration.pushManager.getSubscription()

  if (subscription && !sameKey(subscription.options?.applicationServerKey, applicationServerKey)) {
    await subscription.unsubscribe()
    subscription = null
  }

  if (!subscription) {
    subscription = await withTimeout(
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      }),
      15000,
      'Não foi possível criar a subscrição de notificações. Fecha a app, abre novamente pelo ícone do Ecrã Principal e tenta outra vez.'
    )
  }

  await api.savePushSubscription(subscription)

  return subscription
}
