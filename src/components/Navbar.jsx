import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, Globe, ChevronDown } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { openWhatsApp } from '../utils/config'

const SECTIONS = ['products', 'services', 'training', 'media', 'contact']

export default function Navbar() {
  const { t, lang, setLang, SUPPORTED_LANGS } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setLangOpen(false) }, [location])

  function scrollTo(id) {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const langLabels = { fr: 'FR', ar: 'ع', en: 'EN' }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-midnight/97 backdrop-blur-md shadow-xl shadow-black/30 border-b border-gold/10'
                 : 'bg-midnight'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo réel ── */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gold/60 group-hover:ring-gold transition-all duration-300 shadow-lg shadow-gold/20">
                <img
                  src="/logo.png"
                  alt="OmarSoft – Jlidi Network Solutions"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.classList.add('bg-ocean', 'flex', 'items-center', 'justify-center')
                    e.target.parentElement.innerHTML = '<span style="color:white;font-weight:900;font-size:14px">O</span>'
                  }}
                />
              </div>
              <div className="leading-none">
                <div className="flex items-baseline gap-0.5">
                  <span className="font-extrabold text-white text-base tracking-wide">Omar</span>
                  <span className="font-extrabold text-gold text-base tracking-wide">Soft</span>
                </div>
                <p className="text-white/40 text-[9px] mt-0.5 font-medium tracking-widest uppercase hidden sm:block">
                  Jlidi Network Solutions
                </p>
              </div>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {SECTIONS.map((s) => (
                <button key={s} onClick={() => scrollTo(s)}
                  className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  {t(`nav.${s}`)}
                </button>
              ))}
            </nav>

            {/* ── Right controls ── */}
            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <div className="relative">
                <button onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <Globe size={15} />
                  <span>{langLabels[lang]}</span>
                  <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </button>
                {langOpen && (
                  <div className="absolute top-full mt-1 right-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[120px]">
                    {SUPPORTED_LANGS.map((l) => (
                      <button key={l} onClick={() => { setLang(l); setLangOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${l === lang ? 'bg-ocean/10 text-ocean font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {t(`lang.${l}`)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* WhatsApp CTA — gold pour correspondre à la charte */}
              <button onClick={() => openWhatsApp()}
                className="hidden sm:flex items-center gap-2 bg-gold hover:bg-gold-dark text-midnight font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5 active:translate-y-0">
                <Phone size={15} />
                {t('nav.urgentHelp')}
              </button>

              {/* Mobile hamburger */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-midnight-800 border-t border-gold/10">
            <div className="px-4 py-3 space-y-1">
              {SECTIONS.map((s) => (
                <button key={s} onClick={() => scrollTo(s)}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  {t(`nav.${s}`)}
                </button>
              ))}
              <div className="pt-3 border-t border-white/10">
                <button onClick={() => openWhatsApp()}
                  className="flex items-center gap-2 w-full bg-gold text-midnight font-bold text-sm px-4 py-3 rounded-xl">
                  <Phone size={16} />{t('nav.urgentHelp')}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <div className="h-16" />
    </>
  )
}
