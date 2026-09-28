import { Wrench, Wifi, GraduationCap, Megaphone, Monitor } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const ORBIT_ITEMS = [
  { id: 'repair', icon: Wrench, labelKey: 'services.tabs.repair', color: 'bg-ocean', text: 'text-ocean' },
  { id: 'network', icon: Wifi, labelKey: 'services.tabs.network', color: 'bg-emerald-500', text: 'text-emerald-500' },
  { id: 'training', icon: GraduationCap, labelKey: 'services.tabs.training', color: 'bg-amber-500', text: 'text-amber-500' },
  { id: 'media', icon: Megaphone, labelKey: 'services.tabs.media', color: 'bg-purple-500', text: 'text-purple-500' },
]

export default function OrbitSystem() {
  const { t } = useLang()

  const handleItemClick = (tabId) => {
    // 1. Déclenche l'événement pour changer l'onglet dans ServicesAndTraining
    window.dispatchEvent(new CustomEvent('activateServiceTab', { detail: tabId }))
    
    // 2. Scrolle doucement vers la section des services
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto">
      {/* Anneau orbital animé (décoration) */}
      <div className="absolute inset-0 rounded-full border border-ocean/20 animate-[spin_25s_linear_infinite]" />
      <div className="absolute inset-4 rounded-full border border-dashed border-white/10 animate-[spin_30s_linear_infinite_reverse]" />
      
      {/* Glow central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-ocean/10 blur-2xl animate-pulse" />
        <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-midnight border border-ocean/30 flex items-center justify-center shadow-2xl shadow-ocean/20 z-10">
          <Monitor size={32} className="text-ocean" />
        </div>
      </div>

      {/* Icônes orbitales (positionnées en croix pour un clic facile) */}
      {ORBIT_ITEMS.map((item, index) => {
        const positions = [
          'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2', // Haut
          'top-1/2 right-0 translate-x-1/2 -translate-y-1/2', // Droite
          'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', // Bas
          'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2', // Gauche
        ]
        
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`absolute ${positions[index]} group flex flex-col items-center gap-2 transition-transform hover:scale-110 focus:outline-none`}
            title={t(item.labelKey)}
          >
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-midnight border border-white/10 flex items-center justify-center shadow-lg group-hover:border-ocean/50 group-hover:shadow-ocean/20 transition-all duration-300`}>
              <item.icon size={24} className={`${item.text} group-hover:scale-110 transition-transform`} />
            </div>
            <span className="text-xs font-semibold text-white/70 group-hover:text-white bg-midnight/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/5">
              {t(item.labelKey)}
            </span>
          </button>
        )
      })}
    </div>
  )
}