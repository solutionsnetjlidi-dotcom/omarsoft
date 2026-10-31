/**
 * OrbitSystem.jsx — orbite animée, identique sur ordinateur, tablette et téléphone.
 * • Se met à l'échelle automatiquement selon la largeur disponible (ResizeObserver)
 * • Un clic / un toucher sur une icône ouvre le service : onglet + défilement
 * • Souris : l'orbite se met en pause au survol
 * • Tactile : l'orbite se met en pause 3 s au toucher, pour viser une icône facilement
 */
import { useEffect, useRef, useState } from 'react'
import { Monitor, Wifi, Wrench, BookOpen, Camera, TrendingUp } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const SIZE = 520          // taille de référence (px)
const RADIUS = 180        // rayon de l'orbite (px)
const CARD = 90           // taille d'une carte (px)
const NAV_OFFSET = 72     // hauteur de la barre fixe du haut

const LABELS = {
  fr: ['IT Support', 'Réseaux', 'Réparation', 'Formation', 'Média', 'Meta Ads'],
  ar: ['دعم تقني', 'شبكات', 'إصلاح', 'تكوين', 'ميديا', 'إعلانات ميتا'],
  en: ['IT Support', 'Networks', 'Repair', 'Training', 'Media', 'Meta Ads'],
}

/* tab = onglet de ServicesAndTraining · scrollTo = id de la section à atteindre */
const SERVICES = [
  { Icon: Monitor,    color: '#00b4d8', glow: 'rgba(0,180,216,.6)',   tab: 'service',  scrollTo: 'assistance' },
  { Icon: Wifi,       color: '#00b4d8', glow: 'rgba(0,180,216,.6)',   tab: 'service',  scrollTo: 'services' },
  { Icon: Wrench,     color: '#c9a227', glow: 'rgba(201,162,39,.6)',  tab: 'service',  scrollTo: 'services' },
  { Icon: BookOpen,   color: '#8b5cf6', glow: 'rgba(139,92,246,.6)',  tab: 'training', scrollTo: 'services' },
  { Icon: Camera,     color: '#ec4899', glow: 'rgba(236,72,153,.6)',  tab: 'media',    scrollTo: 'services' },
  { Icon: TrendingUp, color: '#00b4d8', glow: 'rgba(0,180,216,.6)',   tab: 'media',    scrollTo: 'services' },
]

const CSS = `
@keyframes omSpin{to{transform:rotate(360deg)}}
@keyframes omSpinRev{to{transform:rotate(-360deg)}}
@keyframes omFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes omRing{0%,100%{opacity:.25}50%{opacity:.6}}
@keyframes omGlow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}
.om-orbit{animation:omSpin 22s linear infinite}
.om-counter{animation:omSpinRev 22s linear infinite}
.om-card{transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s,border-color .3s;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.om-card:active{transform:scale(.94)}
@media (hover:hover){
  .om-sys:hover .om-orbit,.om-sys:hover .om-counter{animation-play-state:paused}
  .om-card:hover{transform:scale(1.2);border-color:var(--c);box-shadow:0 6px 30px var(--g)}
}
.om-sys.om-paused .om-orbit,.om-sys.om-paused .om-counter{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){
  .om-orbit,.om-counter,.om-float,.om-gold,.om-disc,.om-ring,.om-glow{animation:none!important}
}`

export default function OrbitSystem() {
  const { lang } = useLang()
  const labels = LABELS[lang] || LABELS.fr
  const wrapRef = useRef(null)
  const timer = useRef(null)
  const [scale, setScale] = useState(1)
  const [paused, setPaused] = useState(false)

  /* Mise à l'échelle selon la largeur du conteneur */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / SIZE))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { ro.disconnect(); clearTimeout(timer.current) }
  }, [])

  /* Tactile : pause 3 s pour pouvoir viser une icône qui bouge */
  function onPointerDown(e) {
    if (e.pointerType !== 'touch') return
    setPaused(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPaused(false), 3000)
  }

  function open(svc) {
    window.dispatchEvent(new CustomEvent('omarServiceTab', { detail: { tab: svc.tab } }))
    setTimeout(() => {
      const el = document.getElementById(svc.scrollTo) || document.getElementById('services')
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET, behavior: 'smooth' })
    }, 80)
  }

  const c = SIZE / 2
  return (
    <div
      ref={wrapRef}
      style={{ width: '100%', maxWidth: SIZE, aspectRatio: '1 / 1', margin: '0 auto', position: 'relative' }}
    >
      <style>{CSS}</style>
      <div
        className={`om-sys${paused ? ' om-paused' : ''}`}
        onPointerDown={onPointerDown}
        style={{ position: 'absolute', top: 0, left: 0, width: SIZE, height: SIZE, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* Halo + anneaux */}
        <div className="om-glow" style={{ position: 'absolute', left: c - 80, top: c - 80, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,180,216,.18),transparent 70%)', animation: 'omGlow 3s ease-in-out infinite', pointerEvents: 'none' }} />
        <div className="om-ring" style={{ position: 'absolute', left: c - RADIUS, top: c - RADIUS, width: RADIUS * 2, height: RADIUS * 2, borderRadius: '50%', border: '1px dashed rgba(0,180,216,.25)', animation: 'omRing 5s ease-in-out infinite', pointerEvents: 'none' }} />
        <div className="om-ring" style={{ position: 'absolute', left: c - 105, top: c - 105, width: 210, height: 210, borderRadius: '50%', border: '1px dashed rgba(0,180,216,.14)', animation: 'omRing 5s ease-in-out infinite 2.5s', pointerEvents: 'none' }} />

        {/* Logo central : anneau doré qui tourne */}
        <div className="om-gold" style={{ position: 'absolute', left: c - 58, top: c - 58, width: 116, height: 116, borderRadius: '50%', zIndex: 5, background: 'conic-gradient(#7a5c0e,#c9a227,#f5e088,#e8c84a,#c9a227,#a07d1c,#c9a227,#f5e088,#c9a227,#7a5c0e,#c9a227)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'omSpin 5s linear infinite', boxShadow: '0 0 28px rgba(201,162,39,.5),0 0 60px rgba(201,162,39,.2)' }}>
          <div className="om-disc" style={{ width: 102, height: 102, borderRadius: '50%', background: 'radial-gradient(ellipse at 35% 35%,#122040,#0a1628 60%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, animation: 'omSpinRev 5s linear infinite' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" stroke="#00b4d8" strokeWidth="1.4" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="#00b4d8" strokeWidth="1.2" />
              <path d="M12 3a14 14 0 0 1 3.5 9A14 14 0 0 1 12 21A14 14 0 0 1 8.5 12A14 14 0 0 1 12 3z" stroke="#00b4d8" strokeWidth="1.2" />
              <polyline points="14 7 18 7 18 11" stroke="#c9a227" strokeWidth="1.8" />
              <line x1="18" y1="7" x2="12.5" y2="12.5" stroke="#c9a227" strokeWidth="1.8" />
            </svg>
            <div style={{ lineHeight: 1, fontSize: 15, fontWeight: 900 }}>
              <span style={{ color: '#fff' }}>Omar</span><span style={{ color: '#c9a227' }}>Soft</span>
            </div>
            <div style={{ fontSize: 7, color: 'rgba(0,180,216,.85)', letterSpacing: '1.5px', fontWeight: 700 }}>JLIDI</div>
          </div>
        </div>

        {/* Icônes en orbite */}
        <div className="om-orbit" style={{ position: 'absolute', inset: 0 }}>
          {SERVICES.map((svc, i) => {
            const a = ((-90 + i * 60) * Math.PI) / 180
            const { Icon } = svc
            return (
              <div key={i} style={{ position: 'absolute', width: CARD, height: CARD, left: c + RADIUS * Math.cos(a) - CARD / 2, top: c + RADIUS * Math.sin(a) - CARD / 2 }}>
                <div className="om-counter" style={{ width: '100%', height: '100%' }}>
                  <div className="om-float" style={{ width: '100%', height: '100%', animation: `omFloat ${2.6 + (i % 4) * 0.2}s ease-in-out infinite ${i * 0.5}s` }}>
                    <div
                      role="button" tabIndex={0} aria-label={labels[i]}
                      className="om-card"
                      onClick={() => open(svc)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open(svc))}
                      style={{ '--c': svc.color, '--g': svc.glow, width: '100%', height: '100%', borderRadius: 20, background: 'rgba(10,24,50,.92)', border: '1px solid rgba(0,180,216,.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', outline: 'none' }}
                    >
                      <Icon size={28} color={svc.color} strokeWidth={1.6} />
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,.88)', textAlign: 'center', lineHeight: 1.2, pointerEvents: 'none' }}>{labels[i]}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
