import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

const PUSH_TARGET_CACHE = 'rosa-maria-push-target'
const PUSH_TARGET_KEY = '/latest'
const PUSH_TARGET_CONSUMED_KEY = 'rosa_maria_consumed_push_target'

function isAdminTarget(value: unknown) {
  return typeof value === 'string' && value.startsWith('/admin')
}

function isFreshTarget(createdAt: unknown) {
  const timestamp = Date.parse(String(createdAt || ''))
  return Number.isFinite(timestamp) && Date.now() - timestamp < 1000 * 60 * 10
}

function wasConsumed(url: string, createdAt: string) {
  return localStorage.getItem(PUSH_TARGET_CONSUMED_KEY) === `${url}|${createdAt}`
}

function markConsumed(url: string, createdAt: string) {
  localStorage.setItem(PUSH_TARGET_CONSUMED_KEY, `${url}|${createdAt}`)
}

function openPushTarget(url: unknown, createdAt: unknown) {
  if (!isAdminTarget(url)) return
  if (!isFreshTarget(createdAt)) return

  const targetUrl = String(url)
  const targetCreatedAt = String(createdAt || '')

  if (wasConsumed(targetUrl, targetCreatedAt)) return

  markConsumed(targetUrl, targetCreatedAt)

  if (`${window.location.pathname}${window.location.search}` === targetUrl) return

  window.location.replace(targetUrl)
}

async function consumeCachedPushTarget() {
  if (!('caches' in window)) return

  try {
    const cache = await caches.open(PUSH_TARGET_CACHE)
    const response = await cache.match(PUSH_TARGET_KEY)

    if (!response) return

    await cache.delete(PUSH_TARGET_KEY)

    const data = await response.json().catch(() => null)

    openPushTarget(data?.url, data?.createdAt)
  } catch {}
}

function wait(milliseconds: number) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds))
}

async function getCurrentPushEndpoint() {
  if (!('serviceWorker' in navigator)) return ''
  if (!('PushManager' in window)) return ''

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription?.endpoint || ''
  } catch {
    return ''
  }
}

async function consumeServerPushTarget() {
  try {
    const endpoint = await getCurrentPushEndpoint()

    if (!endpoint) return

    const res = await fetch('/api/admin/push-target', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    })

    if (!res.ok) return

    const data = await res.json().catch(() => null)

    openPushTarget(data?.url, data?.createdAt)
  } catch {}
}

async function checkPushTargets() {
  await consumeCachedPushTarget()
  await consumeServerPushTarget()
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'ROSA_MARIA_OPEN_PUSH_TARGET') {
      openPushTarget(event.data.url, new Date().toISOString())
    }
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => registration.update())
      .catch(() => undefined)

    checkPushTargets()
    wait(500).then(checkPushTargets)
    wait(1500).then(checkPushTargets)
    wait(3000).then(checkPushTargets)
  })

  window.addEventListener('focus', () => {
    checkPushTargets()
  })

  window.addEventListener('pageshow', () => {
    checkPushTargets()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkPushTargets()
    }
  })
}

checkPushTargets()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
