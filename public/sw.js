const CACHE_NAME = 'rosa-maria-v10'
const APP_SHELL = ['/', '/manifest.webmanifest', '/favicon.png']
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
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
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

async function savePushTarget(targetPath) {
  try {
    const cache = await caches.open(PUSH_TARGET_CACHE)
    await cache.put(
      PUSH_TARGET_KEY,
      new Response(JSON.stringify({
        url: targetPath,
        createdAt: new Date().toISOString(),
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
    getPushTarget().then(data => {
      const title = data.title || 'Nova marcação recebida'
      const targetUrl = data.url || '/admin?fromPush=1'
      const notificationTag = data.appointmentId
        ? `rosa-maria-marcacao-${data.appointmentId}`
        : `rosa-maria-marcacao-${Date.now()}`

      return self.registration.showNotification(title, {
        body: data.body || 'Toque para abrir a marcação no painel.',
        icon: '/favicon.png',
        badge: '/favicon.png',
        data: {
          url: targetUrl,
          appointmentId: data.appointmentId || null,
          date: data.date || null,
          time: data.time || null,
        },
        requireInteraction: true,
        tag: notificationTag,
        renotify: true,
      })
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()

  const data = event.notification.data || {}
  const targetPath = data.url || '/admin?fromPush=1'
  const targetUrl = new URL(targetPath, self.location.origin).href

  event.waitUntil(
    savePushTarget(targetPath).then(() => {
      return clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clientList => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin)) {
            try {
              client.postMessage({
                type: 'ROSA_MARIA_OPEN_PUSH_TARGET',
                url: targetPath,
              })

              if ('focus' in client) {
                return client.focus()
              }
            } catch {}
          }
        }

        return clients.openWindow(targetUrl)
      })
    })
  )
})
