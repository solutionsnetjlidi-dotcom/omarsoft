import { Wrench, Wifi, GraduationCap, Megaphone, Monitor } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const ORBIT_ITEMS = [
  { id: 'repair',   icon: Wrench,       labelKey: 'services.tabs.repair',   color: 'text-ocean' },
  { id: 'network',  icon: Wifi,         labelKey: 'services.tabs.network',  color: 'text-emerald-400' },
  { id: 'training', icon: GraduationCap,labelKey: 'services.tabs.training', color: 'text-amber-400' },
  { id: 'media',    icon: Megaphone,    labelKey: 'services.tabs.media',    color: 'text-purple-400' },
  { id: 'support',  icon: Monitor,      labelKey: 'services.tabs.support',  color: 'text-cyan-400' },
  { id: 'ads',      icon: Megaphone,    labelKey: 'services.tabs.ads',      color: 'text-pink-400' },
]

export default function OrbitSystem() {
  const { t } = useLang()

  const handleItemClick = (tabId) => {
    window.dispatchEvent(new CustomEvent('activateServiceTab', { detail: tabId }))
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto">
      {/* Anneaux orbitaux décoratifs */}
      <div className="absolute inset-0 rounded-full border border-ocean/20 animate-[spin_30s_linear_infinite]" />
      <div className="absolute inset-8 rounded-full border border-dashed border-white/10 animate-[spin_25s_linear_infinite_reverse]" />
      <div className="absolute inset-16 rounded-full border border-ocean/10 animate-[spin_20s_linear_infinite]" />

      {/* Logo central OmarSoft */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-ocean/20 blur-2xl animate-pulse" />
          
          {/* Logo image */}
          <div className="relative w-full h-full rounded-full bg-white border-4 border-ocean/30 shadow-2xl shadow-ocean/30 flex items-center justify-center overflow-hidden group cursor-pointer hover:scale-110 transition-transform duration-500">
            <img
              src="/logo-omarsoft.png"
              alt="OmarSoft - Jlidi Network Solutions"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback si l'image ne charge pas
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = `
                  <div class="flex flex-col items-center justify-center">
                    <Monitor size="40" class="text-ocean" />
                    <span class="text-midnight font-bold text-lg mt-2">OmarSoft</span>
                    <span class="text-slate-500 text-xs">Jlidi Network Solutions</span>
                  </div>
                `
              }}
            />
          </div>
        </div>
      </div>

      {/* Conteneur des icônes orbitales avec rotation */}
      <div className="absolute inset-0 animate-[spin_40s_linear_infinite] hover:[animation-play-state:paused]">
        {ORBIT_ITEMS.map((item, index) => {
          const angle = (index * 360) / ORBIT_ITEMS.length
          const radius = 45 // pourcentage du conteneur
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="absolute group"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translate(${radius}%) rotate(-${angle}deg)`,
              }}
              title={t(item.labelKey)}
            >
              {/* Conteneur de l'icône avec zoom au hover */}
              <div className="relative flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-150 hover:z-50">
                {/* Icône */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-midnight/90 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center shadow-xl group-hover:border-ocean/60 group-hover:shadow-ocean/40 transition-all duration-300`}>
                  <item.icon size={28} className={`${item.color} group-hover:scale-110 transition-transform`} />
                </div>
                
                {/* Label */}
                <span className="text-xs font-semibold text-white/80 bg-midnight/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10 whitespace-nowrap opacity-80 group-hover:opacity-100 group-hover:bg-ocean/20 transition-all">
                  {t(item.labelKey)}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}