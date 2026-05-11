const CACHE_NAME = 'rosa-maria-v8'
const APP_SHELL = ['/', '/manifest.webmanifest', '/favicon.png']

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

self.addEventListener('push', event => {
  let data = {}

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data = { body: event.data.text() }
    }
  }

  const title = data.title || 'Nova marcação recebida'
  const targetUrl = data.url || '/admin?fromPush=1'
  const notificationTag = data.appointmentId
    ? `rosa-maria-marcacao-${data.appointmentId}`
    : `rosa-maria-marcacao-${Date.now()}`

  event.waitUntil(
    self.registration.showNotification(title, {
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
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()

  const data = event.notification.data || {}
  const targetPath = data.url || '/admin?fromPush=1'
  const targetUrl = new URL(targetPath, self.location.origin).href

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clientList => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin)) {
          try {
            if ('navigate' in client) {
              await client.navigate(targetUrl)
            }
            if ('focus' in client) {
              return client.focus()
            }
          } catch {}
        }
      }

      return clients.openWindow(targetUrl)
    })
  )
})
