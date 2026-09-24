import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Wifi, Monitor, Wrench, BookOpen, Camera, TrendingUp } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { openWhatsApp } from '../utils/config'

const STATS = [
  { key: 'experience', value: 4 },
  { key: 'clients',    value: 200, plus: true },
  { key: 'repairs',    value: 500, plus: true },
  { key: 'deployments',value: 80,  plus: true },
]

const SERVICE_ICONS = [
  { Icon: Monitor,     color: '#00b4d8', label: 'IT Support' },
  { Icon: Wifi,        color: '#f5a623', label: 'Réseaux'    },
  { Icon: Wrench,      color: '#10b981', label: 'Réparation' },
  { Icon: BookOpen,    color: '#8b5cf6', label: 'Formation'  },
  { Icon: Camera,      color: '#f43f5e', label: 'Média'      },
  { Icon: TrendingUp,  color: '#00b4d8', label: 'Meta Ads'   },
]

// Animated counter hook
function useCounter(target, duration = 1600, shouldStart = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!shouldStart) return
    const start = performance.now()
    function step(now) {
      const pct = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - pct, 3) // ease-out-cubic
      setValue(Math.floor(ease * target))
      if (pct < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, shouldStart])
  return value
}

function StatCard({ statKey, target, plus }) {
  const { t } = useLang()
  const [started, setStarted] = useState(false)
  const ref = useRef(null)
  const val = useCounter(target, 1600, started)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true) },
      { threshold: 0.4 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center lg:text-left">
      <div className="text-3xl font-extrabold text-white leading-none">
        {val}{plus && '+'}
      </div>
      <div className="text-white/50 text-sm mt-1 font-medium">
        {t(`hero.stats.${statKey}`)}
      </div>
    </div>
  )
}

export default function HeroSection() {
  const { t } = useLang()

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-midnight min-h-[92vh] flex items-center"
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#00b4d8 1px, transparent 1px), linear-gradient(90deg, #00b4d8 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-ocean/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-brand/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Text content ── */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-ocean/15 border border-ocean/30 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-ocean animate-pulse" />
              <span className="text-ocean text-sm font-semibold">{t('hero.eyebrow')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-2">
              {t('hero.title')}
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6 gradient-text">
              {t('hero.titleAccent')}
            </h1>

            <p className="text-white/60 text-lg leading-relaxed max-w-xl mb-10">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-14">
              <button
                onClick={() => {
                  const el = document.getElementById('services')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center justify-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-ocean/30 hover:shadow-ocean/50 hover:-translate-y-0.5"
              >
                {t('hero.ctaPrimary')}
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => openWhatsApp()}
                className="flex items-center justify-center gap-2 bg-amber-brand hover:bg-amber-dark text-midnight font-bold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
              >
                {t('hero.ctaSecondary')}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10">
              {STATS.map((s) => (
                <StatCard key={s.key} statKey={s.key} target={s.value} plus={s.plus} />
              ))}
            </div>
          </div>

          {/* ── Right: Icon grid ── */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-[420px] h-[420px]">
              {/* Central circle */}
              <div className="absolute inset-0 m-auto w-28 h-28 rounded-full bg-ocean/20 border-2 border-ocean/40 flex items-center justify-center z-10">
                <div className="text-center">
                  <Monitor size={28} className="text-ocean mx-auto mb-1" />
                  <span className="text-white text-xs font-bold block">IT</span>
                </div>
              </div>
              {/* Orbiting ring */}
              <div className="absolute inset-0 m-auto w-64 h-64 rounded-full border border-white/10 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-0 m-auto w-80 h-80 rounded-full border border-white/5" />

              {/* Service icon cards placed around the circle */}
              {SERVICE_ICONS.map(({ Icon, color, label }, i) => {
                const angle = (i * 360) / SERVICE_ICONS.length - 90
                const radius = 168
                const x = 210 + radius * Math.cos((angle * Math.PI) / 180)
                const y = 210 + radius * Math.sin((angle * Math.PI) / 180)
                return (
                  <div
                    key={i}
                    style={{ left: x - 30, top: y - 30, position: 'absolute' }}
                    className="w-[60px] h-[60px] rounded-2xl bg-midnight-700 border border-white/10 hover:border-white/30 flex flex-col items-center justify-center gap-1 transition-all hover:scale-110 cursor-default group"
                  >
                    <Icon size={20} style={{ color }} />
                    <span className="text-white/50 text-[8px] font-medium group-hover:text-white/80">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 fill-white">
          <path d="M0,60 C360,0 1080,60 1440,30 L1440,60 Z" />
        </svg>
      </div>
    </section>
  )
}
