/**
 * WhatsAppFloat.jsx — Bouton WhatsApp flottant
 * Popup 3 messages rapides · Masqué sur /admin · Animation bounce
 */
import { useState, useEffect } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { openWhatsApp } from '../utils/config'

const MSGS = {
  fr: [
    { emoji:'🖥️', label:'Assistance à distance (AnyDesk)', msg:"Bonjour Omar, j'ai besoin d'une assistance à distance via AnyDesk." },
    { emoji:'💻', label:'Demande de devis produit',         msg:"Bonjour Omar, je souhaite obtenir un devis pour du matériel informatique." },
    { emoji:'🔧', label:'Réparation / Dépannage',          msg:"Bonjour Omar, j'ai besoin d'un service de réparation informatique." },
  ],
  ar: [
    { emoji:'🖥️', label:'دعم عن بُعد (AnyDesk)',  msg:'مرحباً عمر، أحتاج إلى مساعدة عن بُعد عبر AnyDesk.' },
    { emoji:'💻', label:'طلب عرض سعر',             msg:'مرحباً عمر، أريد الحصول على عرض سعر لمعدات معلوماتية.' },
    { emoji:'🔧', label:'صيانة وإصلاح',            msg:'مرحباً عمر، أحتاج إلى خدمة إصلاح وصيانة.' },
  ],
  en: [
    { emoji:'🖥️', label:'Remote assistance (AnyDesk)', msg:'Hello Omar, I need remote assistance via AnyDesk.' },
    { emoji:'💻', label:'Request a quote',              msg:'Hello Omar, I would like a quote for computer equipment.' },
    { emoji:'🔧', label:'Repair / Support',             msg:'Hello Omar, I need a repair or IT support service.' },
  ],
}

function WAIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

export default function WhatsAppFloat() {
  const { lang, isRTL } = useLang()
  const location = useLocation()
  const [open,    setOpen]    = useState(false)
  const [visible, setVisible] = useState(false)

  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) return
    const t = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(t)
  }, [isAdmin])

  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  if (isAdmin || !visible) return null

  const msgs = MSGS[lang] || MSGS.fr
  const posStyle = isRTL ? { left:'20px', right:'auto' } : { right:'20px', left:'auto' }

  return (
    <>
      <style>{`
        @keyframes wa-bounce { 0%,100%{transform:scale(1)} 30%{transform:scale(1.12)} 60%{transform:scale(.96)} }
        @keyframes wa-popup  { from{opacity:0;transform:translateY(10px) scale(.94)} to{opacity:1;transform:none} }
      `}</style>

      <div style={{ position:'fixed', bottom:'24px', zIndex:9999, ...posStyle }}>
        {/* Popup */}
        {open && (
          <div style={{
            position:'absolute', bottom:'68px',
            ...(isRTL ? {left:0} : {right:0}),
            width:'248px',
            background:'#fff', borderRadius:'18px',
            boxShadow:'0 10px 48px rgba(0,0,0,.18)',
            border:'1px solid rgba(0,0,0,.08)',
            overflow:'hidden',
            animation:'wa-popup .22s ease-out',
          }}>
            <div style={{ background:'#25D366', padding:'12px 16px', display:'flex', alignItems:'center', gap:'8px' }}>
              <WAIcon size={18} />
              <span style={{ color:'#fff', fontWeight:700, fontSize:'13px' }}>WhatsApp</span>
              <span style={{ color:'rgba(255,255,255,.7)', fontSize:'11px', marginLeft:'auto' }}>+216 54 421 123</span>
            </div>
            <div style={{ padding:'8px' }}>
              {msgs.map((m, i) => (
                <button key={i}
                  onClick={() => { openWhatsApp(m.msg); setOpen(false) }}
                  style={{
                    width:'100%', textAlign: isRTL ? 'right' : 'left',
                    background:'none', border:'none', cursor:'pointer',
                    padding:'10px 12px', borderRadius:'10px',
                    display:'flex', alignItems:'center', gap:'10px',
                    fontSize:'13px', fontWeight:600, color:'#1e293b',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(37,211,102,.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >
                  <span style={{ fontSize:'18px' }}>{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
            <div style={{ padding:'0 8px 10px' }}>
              <button
                onClick={() => { openWhatsApp(); setOpen(false) }}
                style={{
                  width:'100%', background:'#25D366', color:'#fff',
                  border:'none', borderRadius:'10px', padding:'10px',
                  fontWeight:700, fontSize:'13px', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                }}
              >
                <MessageCircle size={15} />
                {lang === 'ar' ? 'رسالة مباشرة' : lang === 'en' ? 'Direct message' : 'Message direct'}
              </button>
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Contacter via WhatsApp"
          style={{
            width:'56px', height:'56px', borderRadius:'50%',
            background:'#25D366', color:'#fff', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 20px rgba(37,211,102,.45)',
            animation: !open ? 'wa-bounce 3.5s ease-in-out infinite 2s' : 'none',
            transition:'box-shadow .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 28px rgba(37,211,102,.6)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(37,211,102,.45)' }}
        >
          {open ? <X size={24} /> : <WAIcon size={28} />}
        </button>
      </div>
    </>
  )
}
