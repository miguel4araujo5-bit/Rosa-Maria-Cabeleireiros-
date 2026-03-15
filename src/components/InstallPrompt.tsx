import { useEffect, useState } from 'react'

type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isAndroidDevice() {
  return /Android/i.test(window.navigator.userAgent)
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (standalone) {
      setIsInstalled(true)
      return
    }

    const onBeforeInstallPrompt = (event: Event) => {
      if (!isAndroidDevice()) return
      event.preventDefault()
      setDeferredPrompt(event as DeferredPromptEvent)
      setIsDismissed(false)
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setIsDismissed(true)
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
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  const handleLater = () => {
    setIsDismissed(true)
  }

  if (isInstalled || isDismissed || !deferredPrompt || !isAndroidDevice()) return null

  return (
    <div className="fixed bottom-5 left-4 right-4 z-[70] md:left-auto md:right-6 md:w-[360px]">
      <div className="rounded-2xl border border-[#e8dfcf] bg-[#f6f1e8]/95 backdrop-blur-md shadow-[0_15px_50px_rgba(0,0,0,0.12)] p-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] font-bold text-[#b8860b]">
            Instale a Aplicação
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#2b2b2b]">
            Deseja instalar a aplicação?
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 rounded-xl bg-[#b8860b] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            Sim
          </button>
          <button
            type="button"
            onClick={handleLater}
            className="flex-1 rounded-xl border border-[#d8c9b0] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6254] transition hover:bg-[#fbf7f0] active:scale-[0.98]"
          >
            Mais tarde
          </button>
        </div>
      </div>
    </div>
  )
}
