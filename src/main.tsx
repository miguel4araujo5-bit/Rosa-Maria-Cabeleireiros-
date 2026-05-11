import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

const PUSH_TARGET_CACHE = 'rosa-maria-push-target'
const PUSH_TARGET_KEY = '/latest'

function openPushTarget(value: unknown) {
  if (typeof value !== 'string') return
  if (!value.startsWith('/admin')) return

  window.location.assign(value)
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
  })
}

if ('caches' in window) {
  caches.open(PUSH_TARGET_CACHE)
    .then(cache => cache.match(PUSH_TARGET_KEY).then(async response => {
      if (!response) return

      await cache.delete(PUSH_TARGET_KEY)

      const data = await response.json().catch(() => null)
      const createdAt = Date.parse(data?.createdAt || '')
      const isFresh = Number.isFinite(createdAt) && Date.now() - createdAt < 1000 * 60 * 5

      if (isFresh) {
        openPushTarget(data?.url)
      }
    }))
    .catch(() => undefined)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
