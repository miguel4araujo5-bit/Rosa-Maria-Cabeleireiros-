import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

const PUSH_TARGET_CACHE = 'rosa-maria-push-target'
const PUSH_TARGET_KEY = '/latest'
const PUSH_TARGET_CONSUMED_KEY = 'rosa_maria_consumed_push_target'

function openPushTarget(value: unknown) {
  if (typeof value !== 'string') return
  if (!value.startsWith('/admin')) return

  window.location.assign(value)
}

async function consumeCachedPushTarget() {
  if (!('caches' in window)) return

  try {
    const cache = await caches.open(PUSH_TARGET_CACHE)
    const response = await cache.match(PUSH_TARGET_KEY)

    if (!response) return

    await cache.delete(PUSH_TARGET_KEY)

    const data = await response.json().catch(() => null)
    const url = typeof data?.url === 'string' ? data.url : ''
    const createdAt = Date.parse(data?.createdAt || '')
    const isFresh = Number.isFinite(createdAt) && Date.now() - createdAt < 1000 * 60 * 10

    if (!url || !isFresh) return

    const consumedKey = `${url}|${data?.createdAt || ''}`

    if (localStorage.getItem(PUSH_TARGET_CONSUMED_KEY) === consumedKey) return

    localStorage.setItem(PUSH_TARGET_CONSUMED_KEY, consumedKey)
    openPushTarget(url)
  } catch {}
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'ROSA_MARIA_OPEN_PUSH_TARGET') {
      openPushTarget(event.data.url)
    }
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => registration.update())
      .catch(() => undefined)

    consumeCachedPushTarget()
    window.setTimeout(() => consumeCachedPushTarget(), 500)
    window.setTimeout(() => consumeCachedPushTarget(), 1500)
  })
}

consumeCachedPushTarget()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
