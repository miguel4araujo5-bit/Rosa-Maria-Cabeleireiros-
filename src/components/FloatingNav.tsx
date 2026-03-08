import { Navigation } from 'lucide-react'

export default function FloatingNav() {
  return (
    <a
      href="https://waze.com/ul?q=Rua%20de%20Cinco%20de%20Outubro%205498%20São%20Mamede%20de%20Infesta"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir localização no Waze"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-brand-gold px-5 py-4 text-sm font-bold text-black shadow-xl transition-all hover:scale-105"
    >
      <Navigation size={20} />
      Como chegar
    </a>
  )
}
