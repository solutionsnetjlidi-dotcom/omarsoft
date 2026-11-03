/**
 * SolarSystem.jsx — OmarSoft est le soleil, les services sont des planètes.
 * • Le logo (public/logo.png) est le soleil, avec couronne et rayons animés
 * • 6 planètes sur 3 orbites (vitesses différentes, comme un vrai système solaire)
 * • Un clic / un toucher sur une planète ouvre le service (onglet + défilement)
 * • S'adapte à toutes les largeurs d'écran (échelle automatique)
 * • Souris : pause au survol · Tactile : pause 3 s au toucher · reduced-motion respecté
 */
import { useEffect, useRef, useState } from 'react'
import { Monitor, Wifi, Wrench, BookOpen, Camera, TrendingUp } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

const SIZE = 520
const C = SIZE / 2
const RADII = [112, 162, 212]     // rayon des 3 orbites (px)
const SUN = 124                   // diamètre du soleil (px)
const HIT = 76                    // zone tactile d'une planète (px)
const NAV_OFFSET = 72             // hauteur de la barre fixe du haut (mobile)

const LABELS = {
  fr: ['IT Support', 'Réseaux', 'Réparation', 'Formation', 'Média', 'Meta Ads'],
  ar: ['دعم تقني', 'شبكات', 'إصلاح', 'تكوين', 'ميديا', 'إعلانات ميتا'],
  en: ['IT Support', 'Networks', 'Repair', 'Training', 'Media', 'Meta Ads'],
}

/* o = orbite · a = angle de départ · T = durée d'un tour (s)
   tab = onglet de ServicesAndTraining · scrollTo = section à atteindre */
const PLANETS = [
  { Icon: Monitor,    o: 0, a: 200, T: 20, tab: 'service',  scrollTo: 'assistance', l: '#8defff', b: '#00b4d8', k: '#04485c', g: 'rgba(0,180,216,.55)' },
  { Icon: Wifi,       o: 0, a: 20,  T: 20, tab: 'service',  scrollTo: 'services',   l: '#a5c8ff', b: '#3b82f6', k: '#14306b', g: 'rgba(59,130,246,.5)' },
  { Icon: Wrench,     o: 1, a: 300, T: 32, tab: 'service',  scrollTo: 'services',   l: '#ffe58a', b: '#c9a227', k: '#5c4608', g: 'rgba(201,162,39,.55)' },
  { Icon: BookOpen,   o: 1, a: 120, T: 32, tab: 'training', scrollTo: 'services',   l: '#d6c4ff', b: '#8b5cf6', k: '#33176b', g: 'rgba(139,92,246,.5)', ring: true },
  { Icon: Camera,     o: 2, a: 60,  T: 46, tab: 'media',    scrollTo: 'services',   l: '#ffb3dc', b: '#ec4899', k: '#6b0f3d', g: 'rgba(236,72,153,.5)', moon: true },
  { Icon: TrendingUp, o: 2, a: 240, T: 46, tab: 'media',    scrollTo: 'services',   l: '#9df5cf', b: '#10b981', k: '#06442f', g: 'rgba(16,185,129,.5)' },
]

const STARS = '38px 58px 0 #fff9,92px 410px 0 #fff6,455px 74px 0 #fffb,486px 330px 0 #fff7,22px 262px 0 #fff5,300px 12px 0 #fff8,214px 506px 0 #fff6,402px 480px 0 #fff9,150px 24px 0 #fff5,498px 188px 0 #fff6'

const CSS = `
@keyframes solSpin{to{transform:rotate(360deg)}}
@keyframes solSpinRev{to{transform:rotate(-360deg)}}
@keyframes solFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes solPulse{0%,100%{opacity:.7;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}}
@keyframes solTwinkle{0%,100%{opacity:.25}50%{opacity:1}}
.sol-orbit{position:absolute;left:50%;top:50%;width:0;height:0;animation:solSpin var(--T) linear infinite;animation-delay:var(--d)}
.sol-slot{position:absolute;left:0;top:0;width:0;height:0}
.sol-counter{position:absolute;left:0;top:0;width:0;height:0;animation:solSpinRev var(--T) linear infinite;animation-delay:var(--d)}
.sol-float{position:absolute;left:${-HIT / 2}px;top:${-HIT / 2}px;width:${HIT}px;height:${HIT}px;animation:solFloat 4.2s ease-in-out infinite}
.sol-hit{position:relative;width:100%;height:100%;display:grid;place-items:center;background:none;border:0;padding:0;cursor:pointer;outline:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent;border-radius:50%}
.sol-planet{position:relative;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;color:#fff;
  background:radial-gradient(circle at 32% 28%,var(--l),var(--b) 55%,var(--k) 100%);
  box-shadow:inset -6px -8px 14px rgba(0,0,0,.45),inset 3px 3px 8px rgba(255,255,255,.25),0 0 18px var(--g);
  transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s}
.sol-planet svg{filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}
.sol-name{position:absolute;left:50%;top:calc(50% + 32px);transform:translateX(-50%);white-space:nowrap;font-size:10.5px;font-weight:700;color:rgba(255,255,255,.92);text-shadow:0 1px 4px rgba(0,0,0,.9);pointer-events:none}
.sol-hit:focus-visible .sol-planet{outline:2px solid #fff;outline-offset:3px}
.sol-hit:active .sol-planet{transform:scale(.92)}
.sol-ring{position:absolute;left:-15px;right:-15px;top:50%;height:24px;margin-top:-12px;border:3px solid rgba(245,224,136,.8);border-radius:50%;transform:rotate(-22deg);pointer-events:none;box-shadow:0 0 8px rgba(245,224,136,.35)}
.sol-moon{position:absolute;left:50%;top:50%;width:0;height:0;animation:solSpin 7s linear infinite;pointer-events:none}
.sol-moon::after{content:'';position:absolute;left:40px;top:-5px;width:10px;height:10px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#9aa5b8)}
.sol-orbit-line{position:absolute;border-radius:50%;border:1px solid rgba(201,162,39,.18);pointer-events:none}
.sol-rays{position:absolute;left:50%;top:50%;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;pointer-events:none;
  background:repeating-conic-gradient(rgba(255,206,84,.38) 0 3deg,transparent 3deg 12deg);
  -webkit-mask-image:radial-gradient(circle,#000 28%,transparent 68%);mask-image:radial-gradient(circle,#000 28%,transparent 68%);
  animation:solSpin 70s linear infinite}
.sol-stars{position:absolute;left:0;top:0;width:2px;height:2px;border-radius:50%;background:#fff;pointer-events:none;box-shadow:${STARS};animation:solTwinkle 5s ease-in-out infinite}
@media (hover:hover){
  .sol-sys:hover .sol-orbit,.sol-sys:hover .sol-counter{animation-play-state:paused}
  .sol-hit:hover .sol-planet{transform:scale(1.2);box-shadow:inset -6px -8px 14px rgba(0,0,0,.45),inset 3px 3px 8px rgba(255,255,255,.3),0 0 34px var(--g)}
}
.sol-sys.sol-paused .sol-orbit,.sol-sys.sol-paused .sol-counter{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){
  .sol-orbit,.sol-counter,.sol-float,.sol-rays,.sol-moon,.sol-stars,.sol-corona{animation:none!important}
}`

export default function SolarSystem() {
  const { lang } = useLang()
  const labels = LABELS[lang] || LABELS.fr
  const wrapRef = useRef(null)
  const timer = useRef(null)
  const [scale, setScale] = useState(1)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / SIZE))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { ro.disconnect(); clearTimeout(timer.current) }
  }, [])

  function onPointerDown(e) {
    if (e.pointerType !== 'touch') return
    setPaused(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPaused(false), 3000)
  }

  function open(p) {
    window.dispatchEvent(new CustomEvent('omarServiceTab', { detail: { tab: p.tab } }))
    setTimeout(() => {
      const el = document.getElementById(p.scrollTo) || document.getElementById('services')
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET, behavior: 'smooth' })
    }, 80)
  }

  return (
    <div ref={wrapRef} style={{ width: '100%', maxWidth: SIZE, aspectRatio: '1 / 1', margin: '0 auto', position: 'relative' }}>
      <style>{CSS}</style>
      <div
        className={`sol-sys${paused ? ' sol-paused' : ''}`}
        onPointerDown={onPointerDown}
        style={{ position: 'absolute', top: 0, left: 0, width: SIZE, height: SIZE, transform: `scale(${scale})`, transformOrigin: 'top left', direction: 'ltr' }}
      >
        <i className="sol-stars" />

        {/* Orbites */}
        {RADII.map((r) => (
          <div key={r} className="sol-orbit-line" style={{ left: C - r, top: C - r, width: r * 2, height: r * 2 }} />
        ))}

        {/* Soleil : couronne, rayons, puis le logo */}
        <div className="sol-corona" style={{ position: 'absolute', left: '50%', top: '50%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,196,60,.5) 0%,rgba(201,162,39,.22) 38%,transparent 70%)', animation: 'solPulse 4s ease-in-out infinite', pointerEvents: 'none' }} />
        <div className="sol-rays" />
        <img
          src="/logo.png" alt="OmarSoft – Jlidi Network Solutions" width={SUN} height={SUN} draggable={false}
          style={{ position: 'absolute', left: C - SUN / 2, top: C - SUN / 2, width: SUN, height: SUN, borderRadius: '50%', zIndex: 6, boxShadow: '0 0 30px rgba(255,196,60,.65),0 0 70px rgba(201,162,39,.35)', userSelect: 'none' }}
        />

        {/* Planètes */}
        {PLANETS.map((p, i) => {
          const { Icon } = p
          const style = { '--T': `${p.T}s`, '--d': `${-(p.a / 360) * p.T}s`, zIndex: 8 }
          return (
            <div key={i} className="sol-orbit" style={style}>
              <div className="sol-slot" style={{ transform: `translateX(${RADII[p.o]}px)` }}>
                <div className="sol-counter">
                  <div className="sol-float" style={{ animationDelay: `${i * -0.7}s` }}>
                    <button type="button" className="sol-hit" aria-label={labels[i]} onClick={() => open(p)}>
                      <span className="sol-planet" style={{ '--l': p.l, '--b': p.b, '--k': p.k, '--g': p.g }}>
                        {p.ring && <i className="sol-ring" />}
                        <Icon size={25} strokeWidth={1.8} />
                        {p.moon && <i className="sol-moon" />}
                      </span>
                      <span className="sol-name">{labels[i]}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
