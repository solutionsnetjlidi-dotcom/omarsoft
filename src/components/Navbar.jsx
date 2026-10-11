import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Menu, Phone, ChevronRight, Sun, Moon } from 'lucide-react'
import { useLang }  from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { openWhatsApp } from '../utils/config'

const NAV_ITEMS = [
  { id:'home',     emoji:'🏠' },
  { id:'products', emoji:'💻' },
  { id:'services', emoji:'🔧' },
  { id:'training', emoji:'📚' },
  { id:'media',    emoji:'🎬' },
  { id:'contact',  emoji:'📞' },
]

const LANGS = [
  { code:'fr', flag:'🇫🇷', label:'Français' },
  { code:'ar', flag:'🇹🇳', label:'العربية' },
  { code:'en', flag:'🇬🇧', label:'English'  },
]

function Flag({ emoji, size=24 }) {
  return (
    <span style={{
      fontSize:size, lineHeight:1, display:'block',
      fontFamily:'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
    }}>
      {emoji}
    </span>
  )
}

function SidebarContent({ onClose }) {
  const { t, lang, setLang }  = useLang()
  const { isDark, toggleTheme } = useTheme()

  function scrollTo(id) {
    onClose?.()
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' })
    }, 50)
  }

  return (
    <div className="flex flex-col h-full bg-midnight dark:bg-slate-900">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-gold/60 group-hover:ring-gold transition-all flex-shrink-0">
            <img src="/logo.png" alt="OmarSoft" className="w-full h-full object-cover"
              onError={e=>{e.target.style.display='none';e.target.parentElement.innerHTML='<span style="font-size:18px;color:#c9a227;font-weight:900;width:100%;height:100%;display:flex;align-items:center;justify-content:center">O</span>'}}/>
          </div>
          <div className="leading-none">
            <div className="font-extrabold text-[15px]">
              <span className="text-white">Omar</span><span className="text-gold">Soft</span>
            </div>
            <p className="text-white/35 text-[9px] mt-0.5 tracking-widest uppercase font-semibold">Jlidi Network</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all">
          <X size={16}/>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="px-3 mb-2 text-white/25 text-[10px] font-bold uppercase tracking-widest">Menu</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({id,emoji})=>(
            <button key={id} onClick={()=>scrollTo(id)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all text-left group">
              <span className="text-base w-6 text-center select-none">{emoji}</span>
              <span className="flex-1">{t(`nav.${id}`)}</span>
              <ChevronRight size={13} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all"/>
            </button>
          ))}
        </div>
      </nav>

      {/* Dark mode toggle */}
      <div className="px-4 pb-3">
        <button onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all">
          {isDark
            ? <><Sun size={16} className="text-amber-400"/><span>Mode clair</span></>
            : <><Moon size={16} className="text-ocean"/><span>Mode sombre</span></>
          }
          <div className={`ml-auto w-9 h-5 rounded-full transition-colors ${isDark?'bg-ocean':'bg-white/20'} relative flex-shrink-0`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDark?'translate-x-4':'translate-x-0.5'}`}/>
          </div>
        </button>
      </div>

      {/* WhatsApp */}
      <div className="px-4 pb-3">
        <button onClick={()=>{openWhatsApp();onClose?.()}}
          className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold-dark text-midnight font-bold text-sm py-3 rounded-xl transition-all hover:-translate-y-0.5">
          <Phone size={15}/>{t('nav.urgentHelp')}
        </button>
      </div>

      {/* Flags */}
      <div className="px-4 pb-5 pt-4 border-t border-white/10">
        <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">Langue · اللغة</p>
        <div className="grid grid-cols-3 gap-2">
          {LANGS.map(({code,flag,label})=>(
            <button key={code} onClick={()=>setLang(code)} title={label}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all
                ${lang===code ? 'bg-ocean/20 border-ocean/60' : 'border-white/10 hover:bg-white/10 hover:border-white/25'}`}>
              <Flag emoji={flag} size={22}/>
              <span className={`text-[9px] font-bold uppercase tracking-wider leading-none ${lang===code?'text-ocean':'text-white/40'}`}>
                {code==='ar'?'عر':code.toUpperCase()}
              </span>
              {lang===code && <span className="w-1 h-1 rounded-full bg-ocean"/>}
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

  useEffect(()=>{ setOpen(false) }, [location])
  useEffect(()=>{
    document.body.style.overflow = open ? 'hidden' : ''
    return ()=>{ document.body.style.overflow='' }
  }, [open])

  const currentFlag = LANGS.find(l=>l.code===lang)?.flag || '🇫🇷'

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center px-4 gap-3 bg-midnight/97 backdrop-blur-md border-b border-white/8">
        <button onClick={()=>setOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
          <Menu size={20}/>
        </button>
        <div className="flex-1 flex justify-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gold/60">
              <img src="/logo.png" alt="OmarSoft" className="w-full h-full object-cover"
                onError={e=>{e.target.style.display='none'}}/>
            </div>
            <span className="font-extrabold text-sm"><span className="text-white">Omar</span><span className="text-gold">Soft</span></span>
          </Link>
        </div>
        <button onClick={()=>setOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all">
          <span style={{fontSize:'18px',fontFamily:'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'}}>{currentFlag}</span>
        </button>
      </div>

      {/* Backdrop */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={()=>setOpen(false)}/>}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}
        style={{boxShadow:'4px 0 32px rgba(0,0,0,.4)'}}>
        <SidebarContent onClose={()=>setOpen(false)}/>
      </aside>
    </>
  )
}
