import { useEffect, useState } from 'react'

type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as DeferredPromptEvent)
      setIsVisible(true)
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      setIsVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setIsVisible(false)
    }
    setDeferredPrompt(null)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (isInstalled || !isVisible) return null

  return (
    <div className="fixed bottom-5 left-4 right-4 z-[70] md:left-auto md:right-6 md:w-[360px]">
      <div className="rounded-2xl border border-[#e8dfcf] bg-[#f6f1e8]/95 backdrop-blur-md shadow-[0_15px_50px_rgba(0,0,0,0.12)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] font-bold text-[#b8860b]">
              Instalar app
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#2b2b2b]">
              Adicione Rosa Maria ao ecrã principal para acesso mais rápido.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 text-[#8a7f72] hover:text-[#2b2b2b] text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 rounded-xl bg-[#b8860b] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-[#d8c9b0] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6254] transition hover:bg-[#fbf7f0] active:scale-[0.98]"
          >
            Depois
          </button>
        </div>
      </div>
    </div>
  )
}
