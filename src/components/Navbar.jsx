import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Menu, Phone, ChevronRight, Sun, Moon } from 'lucide-react'
import { useLang }  from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { openWhatsApp } from '../utils/config'

const NAV_ITEMS = [
  { id: 'home',     emoji: '🏠' },
  { id: 'products', emoji: '💻' },
  { id: 'services', emoji: '🔧' },
  { id: 'training', emoji: '📚' },
  { id: 'media',    emoji: '🎬' },
  { id: 'contact',  emoji: '📞' },
]

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
]

/* Drapeaux en SVG : s'affichent partout, y compris sous Windows
   (les emojis de drapeaux y apparaissent comme "FR", "TN", "GB"). */
function FlagIcon({ code, width = 30, height = 20 }) {
  const box = {
    width, height, display: 'block', borderRadius: 3, overflow: 'hidden',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.15)', flexShrink: 0,
  }

  if (code === 'fr') {
    return (
      <svg viewBox="0 0 3 2" style={box} aria-hidden="true">
        <rect width="1" height="2" fill="#0055a4" />
        <rect x="1" width="1" height="2" fill="#ffffff" />
        <rect x="2" width="1" height="2" fill="#ef4135" />
      </svg>
    )
  }

  if (code === 'ar') {
    /* Tunisie : fond rouge, disque blanc, croissant et étoile rouges */
    return (
      <svg viewBox="0 0 3 2" style={box} aria-hidden="true">
        <rect width="3" height="2" fill="#e70013" />
        <circle cx="1.5" cy="1" r="0.52" fill="#ffffff" />
        <circle cx="1.5" cy="1" r="0.38" fill="#e70013" />
        <circle cx="1.56" cy="1" r="0.3" fill="#ffffff" />
        <path
          d="M1.56 .83L1.601 .943 1.722 .947 1.627 1.022 1.66 1.138 1.56 1.07 1.46 1.138 1.493 1.022 1.398 .947 1.519 .943Z"
          fill="#e70013"
        />
      </svg>
    )
  }

  /* Royaume-Uni */
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="none" style={box} aria-hidden="true">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0L60 30M60 0L0 30" stroke="#ffffff" strokeWidth="6" />
      <path d="M0 0L60 30M60 0L0 30" stroke="#c8102e" strokeWidth="2" />
      <path d="M30 0v30M0 15h60" stroke="#ffffff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  )
}

function SidebarContent({ onClose }) {
  const { t, lang, setLang }    = useLang()
  const { isDark, toggleTheme } = useTheme()

  function scrollTo(id) {
    onClose?.()
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <div className="flex flex-col h-full bg-midnight dark:bg-slate-900">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
          <div className="w-11 h-11 flex-shrink-0 transition-transform group-hover:scale-105">
            <img
              src="/logo.png" alt="OmarSoft" className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
          <div className="leading-none">
            <div className="font-extrabold text-[15px]">
              <span className="text-white">Omar</span><span className="text-gold">Soft</span>
            </div>
            <p className="text-white/35 text-[9px] mt-0.5 tracking-widest uppercase font-semibold">
              Jlidi Network
            </p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
          aria-label="Fermer le menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="px-3 mb-2 text-white/25 text-[10px] font-bold uppercase tracking-widest">Menu</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ id, emoji }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all text-start group"
            >
              <span className="text-base w-6 text-center select-none">{emoji}</span>
              <span className="flex-1">{t(`nav.${id}`)}</span>
              <ChevronRight size={13} className="text-white/20 group-hover:text-white/50 transition-all rtl:rotate-180" />
            </button>
          ))}
        </div>
      </nav>

      {/* Mode sombre / clair */}
      <div className="px-4 pb-3">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          {isDark
            ? <><Sun size={16} className="text-amber-400" /><span>Mode clair</span></>
            : <><Moon size={16} className="text-ocean" /><span>Mode sombre</span></>}
        </button>
      </div>

      {/* WhatsApp */}
      <div className="px-4 pb-3">
        <button
          onClick={() => { openWhatsApp(); onClose?.() }}
          className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold-dark text-midnight font-bold text-sm py-3 rounded-xl transition-all hover:-translate-y-0.5"
        >
          <Phone size={15} />
          {t('nav.urgentHelp')}
        </button>
      </div>

      {/* Langues : drapeaux SVG */}
      <div className="px-4 pb-5 pt-4 border-t border-white/10">
        <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
          Langue · اللغة
        </p>
        <div className="grid grid-cols-3 gap-2">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              title={label}
              aria-label={label}
              aria-pressed={lang === code}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all ${
                lang === code
                  ? 'bg-ocean/20 border-ocean/60'
                  : 'border-white/10 hover:bg-white/10 hover:border-white/25'
              }`}
            >
              <FlagIcon code={code} />
              <span className={`text-[9px] font-bold uppercase tracking-wider leading-none ${
                lang === code ? 'text-ocean' : 'text-white/40'
              }`}>
                {code === 'ar' ? 'عر' : code.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { lang } = useLang()
  const location = useLocation()

  useEffect(() => { setOpen(false) }, [location])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Barre du haut (mobile / tablette) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center px-4 gap-3 bg-midnight border-b border-white/10">
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 flex justify-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8">
              <img src="/logo.png" alt="OmarSoft" className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </div>
            <span className="font-extrabold text-sm">
              <span className="text-white">Omar</span><span className="text-gold">Soft</span>
            </span>
          </Link>
        </div>

        {/* Drapeau de la langue active : ouvre le menu */}
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          aria-label="Changer de langue"
        >
          <FlagIcon code={lang} width={24} height={16} />
        </button>
      </div>

      {/* Fond sombre derrière le menu */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar : fixe sur ordinateur, coulissante sur mobile.
          start-0 = gauche en FR/EN, droite en arabe (RTL). */}
      <aside
        className={`fixed top-0 start-0 h-full z-50 w-64 transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:rtl:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}`}
        style={{ boxShadow: '4px 0 32px rgba(0,0,0,.4)' }}
      >
        <SidebarContent onClose={() => setOpen(false)} />
      </aside>
    </>
  )
}
