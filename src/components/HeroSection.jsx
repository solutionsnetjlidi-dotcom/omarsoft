import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { openWhatsApp } from '../utils/config'
import OrbitSystem from './OrbitSystem'

const STATS = [
  { key: 'experience',  value: 4 },
  { key: 'clients',     value: 200, plus: true },
  { key: 'repairs',     value: 500, plus: true },
  { key: 'deployments', value: 80,  plus: true },
]

function useCounter(target, duration = 1600, start = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    const t0 = performance.now()
    let raf
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])
  return val
}

function StatCard({ statKey, target, plus }) {
  const { t } = useLang()
  const [go, setGo] = useState(false)
  const ref = useRef(null)
  const val = useCounter(target, 1600, go)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true) }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className="text-start">
      <div className="text-3xl font-extrabold text-white leading-none">{val}{plus && '+'}</div>
      <div className="text-white/50 text-sm mt-1 font-medium">{t(`hero.stats.${statKey}`)}</div>
    </div>
  )
}

export default function HeroSection() {
  const { t } = useLang()

  return (
    <section id="home" className="relative overflow-hidden bg-midnight dark:bg-slate-950 min-h-[92vh] flex items-center">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#00b4d8 1px,transparent 1px),linear-gradient(90deg,#00b4d8 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-ocean/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Texte */}
          <div>
            <div className="inline-flex items-center gap-2 bg-ocean/15 border border-ocean/30 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-ocean animate-pulse" />
              <span className="text-ocean text-sm font-semibold">{t('hero.eyebrow')}</span>
            </div>

            {/* Titre seul : la ligne « au cœur de Djerba » est supprimée */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              {t('hero.title')}
            </h1>

            <p className="text-white/60 text-lg leading-relaxed max-w-xl mb-10">{t('hero.subtitle')}</p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <button
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-ocean/30 hover:-translate-y-0.5"
              >
                {t('hero.ctaPrimary')}<ArrowRight size={18} className="rtl:rotate-180" />
              </button>
              <button
                onClick={() => openWhatsApp()}
                className="flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-midnight font-bold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
              >
                {t('hero.ctaSecondary')}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10">
              {STATS.map((s) => <StatCard key={s.key} statKey={s.key} target={s.value} plus={s.plus} />)}
            </div>
          </div>

          {/* Orbite : visible et identique sur tous les appareils */}
          <div className="flex items-center justify-center">
            <OrbitSystem />
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-10 lg:h-12 fill-white dark:fill-slate-900">
          <path d="M0,60 C360,0 1080,60 1440,30 L1440,60 Z" />
        </svg>
      </div>
    </section>
  )
}
