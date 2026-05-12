function PushNotificationNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const pendingKey = 'rosa_maria_pending_push_target'
    const consumedKey = 'rosa_maria_consumed_push_target'

    const openPendingTarget = () => {
      try {
        const raw = localStorage.getItem(pendingKey)
        if (!raw) return

        const data = JSON.parse(raw)
        const url = typeof data?.url === 'string' ? data.url : ''
        const createdAt = String(data?.createdAt || '')
        const timestamp = Date.parse(createdAt)
        const isFresh = Number.isFinite(timestamp) && Date.now() - timestamp < 1000 * 60 * 10

        if (!url.startsWith('/admin') || !isFresh) {
          localStorage.removeItem(pendingKey)
          return
        }

        const consumedValue = `${url}|${createdAt}`

        if (localStorage.getItem(consumedKey) === consumedValue) {
          localStorage.removeItem(pendingKey)
          return
        }

        if (`${location.pathname}${location.search}` === url) {
          localStorage.setItem(consumedKey, consumedValue)
          localStorage.removeItem(pendingKey)
          return
        }

        navigate(url, { replace: true })

        window.setTimeout(() => {
          localStorage.setItem(consumedKey, consumedValue)
          localStorage.removeItem(pendingKey)
        }, 700)
      } catch {
        localStorage.removeItem(pendingKey)
      }
    }

    openPendingTarget()

    const onPushTarget = () => openPendingTarget()

    window.addEventListener('rosa-maria-push-target', onPushTarget)
    window.addEventListener('focus', onPushTarget)
    window.addEventListener('pageshow', onPushTarget)

    const timers = [
      window.setTimeout(openPendingTarget, 300),
      window.setTimeout(openPendingTarget, 1000),
      window.setTimeout(openPendingTarget, 2500),
    ]

    return () => {
      window.removeEventListener('rosa-maria-push-target', onPushTarget)
      window.removeEventListener('focus', onPushTarget)
      window.removeEventListener('pageshow', onPushTarget)
      timers.forEach(timer => window.clearTimeout(timer))
    }
  }, [navigate, location.pathname, location.search])

  return null
}
