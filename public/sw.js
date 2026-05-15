const CACHE_NAME = 'rosa-maria-v17'
const APP_SHELL = []
const PUSH_TARGET_CACHE = 'rosa-maria-push-target'
const PUSH_TARGET_KEY = '/latest'

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(APP_SHELL.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== PUSH_TARGET_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/')))
    return
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)))
})

function normalizePushTarget(value) {
  try {
    const target = new URL(value || '/admin?fromPush=1', self.location.origin)

    if (target.origin !== self.location.origin) {
      return '/admin?fromPush=1'
    }

    if (!target.pathname.startsWith('/admin')) {
      return '/admin?fromPush=1'
    }

    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return '/admin?fromPush=1'
  }
}

async function getPushTarget() {
  try {
    const subscription = await self.registration.pushManager.getSubscription()
    const endpoint = subscription?.endpoint || ''

    const res = await fetch('/api/admin/push-target', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    })

    if (!res.ok) {
      throw new Error('Push target unavailable')
    }

    return await res.json()
  } catch {
    return {
      title: 'Nova marcação recebida',
      body: 'Toque para abrir o painel.',
      url: '/admin?fromPush=1',
    }
  }
}

async function savePushTarget(targetPath, createdAt) {
  try {
    const cache = await caches.open(PUSH_TARGET_CACHE)
    await cache.put(
      PUSH_TARGET_KEY,
      new Response(JSON.stringify({
        url: normalizePushTarget(targetPath),
        createdAt: createdAt || new Date().toISOString(),
      }), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )
  } catch {}
}

self.addEventListener('push', event => {
  event.waitUntil(
    getPushTarget().then(async data => {
      const title = data.title || 'Nova marcação recebida'
      const targetUrl = normalizePushTarget(data.url || '/admin?fromPush=1')
      const createdAt = new Date().toISOString()
      const notificationTag = data.appointmentId
        ? `rosa-maria-marcacao-${data.appointmentId}`
        : `rosa-maria-marcacao-${Date.now()}`

      await savePushTarget(targetUrl, createdAt)

      return self.registration.showNotification(title, {
        body: data.body || 'Toque para abrir a marcação no painel.',
        icon: '/icon-192.png?v=6',
        badge: '/favicon-32.png?v=6',
        data: {
          url: targetUrl,
          createdAt,
          appointmentId: data.appointmentId || null,
          date: data.date || null,
          time: data.time || null,
        },
          requireInteraction: true,
          tag: notificationTag,
          renotify: true,
          silent: false,
          vibrate: [200, 100, 200],
          timestamp: Date.now(),
        })
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()

  const data = event.notification.data || {}
  const targetPath = normalizePushTarget(data.url || '/admin?fromPush=1')
  const createdAt = data.createdAt || new Date().toISOString()
  const targetUrl = new URL(targetPath, self.location.origin).href

  event.waitUntil(
    savePushTarget(targetPath, createdAt).then(() => {
      return clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin)) {
            try {
              client.postMessage({
                type: 'ROSA_MARIA_OPEN_PUSH_TARGET',
                url: targetPath,
                createdAt,
              })
            } catch {}

            if ('focus' in client) {
              return client.focus()
            }
          }
        }

        return clients.openWindow(targetUrl)
      })
    })
  )
})
