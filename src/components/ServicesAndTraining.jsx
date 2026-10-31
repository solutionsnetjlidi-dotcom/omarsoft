/**
 * ServicesAndTraining.jsx
 * • Écoute l'événement 'omarServiceTab' envoyé par l'orbite → change d'onglet
 * • tr() : essaie plusieurs clés de traduction puis un texte de secours,
 *   pour ne plus jamais afficher une clé brute comme "common.requestService".
 */
import { useEffect, useState } from 'react'
import {
  Wrench, Monitor, Wifi, BookOpen, Camera, TrendingUp,
  CheckCircle2, Clock, MessageCircle, AlertCircle, Send,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useLang } from '../context/LanguageContext'
import { formatPrice } from '../utils/currencyFormatter'
import { openWhatsApp, buildAnydeskMessage, buildServiceMessage } from '../utils/config'

const ICON_MAP = { Wrench, Monitor, Wifi, BookOpen, Camera, TrendingUp }
const TABS = ['service', 'training', 'media']
const REQUEST_FALLBACK = { fr: 'Demander ce service', ar: 'اطلب هذه الخدمة', en: 'Request this service' }

function DynamicIcon({ name, size = 24, className = '' }) {
  const Icon = ICON_MAP[name] || Wrench
  return <Icon size={size} className={className} />
}

/* ── Formulaire AnyDesk ───────────────────────────── */
function AnyDeskSection({ t }) {
  const [form, setForm] = useState({ name: '', phone: '', anydeskId: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.anydeskId) return
    setSaving(true)
    try {
      await supabase.from('service_requests').insert({
        request_type: 'anydesk', client_name: form.name, client_phone: form.phone,
        anydesk_id: form.anydeskId, message: form.description,
      })
    } catch (_) { /* la demande part quand même par WhatsApp */ }
    openWhatsApp(buildAnydeskMessage(form))
    setSent(true)
    setSaving(false)
  }

  const input = 'w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-ocean'

  return (
    <div className="bg-midnight rounded-3xl p-8 lg:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-ocean/20 border border-ocean/30 flex items-center justify-center">
            <Monitor size={20} className="text-ocean" />
          </div>
          <h3 className="text-2xl font-extrabold text-white">{t('anydesk.title')}</h3>
        </div>
        <p className="text-white/60 mb-8 leading-relaxed">{t('anydesk.subtitle')}</p>

        {sent ? (
          <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-6 py-4">
            <CheckCircle2 size={22} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-300 font-semibold">{t('contact.sent')}</p>
              <p className="text-white/50 text-sm mt-0.5">{t('anydesk.tools')}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={`${t('anydesk.namePlaceholder')} *`} className={input} />
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder={t('anydesk.phonePlaceholder')} className={input} />
            <input required value={form.anydeskId} onChange={(e) => set('anydeskId', e.target.value)} placeholder={`${t('anydesk.placeholder')} *`} className={`sm:col-span-2 font-mono ${input}`} />
            <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder={t('anydesk.descPlaceholder')} className={`sm:col-span-2 resize-none ${input}`} />
            <button type="submit" disabled={saving} className="sm:col-span-2 flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-midnight font-bold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60">
              <Send size={17} />{saving ? t('common.loading') : t('anydesk.submit')}
            </button>
            <p className="sm:col-span-2 text-white/40 text-xs text-center">{t('anydesk.tools')}</p>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Carte service ────────────────────────────────── */
function ServiceCard({ service, lang, t, tr, getName, getDesc }) {
  const name = getName(service)
  const desc = getDesc(service)
  const features = service[`features_${lang}`] || service.features_fr || []
  const perHour = service.price_type === 'per_hour' ? t('services.perHour') : ''

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-ocean/30 hover:shadow-xl hover:shadow-ocean/5 transition-all duration-300 flex flex-col overflow-hidden group">
      <div className="p-6 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-ocean/10 group-hover:bg-ocean/20 flex items-center justify-center mb-4 transition-colors">
          <DynamicIcon name={service.icon_name} size={22} className="text-ocean" />
        </div>
        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 leading-snug group-hover:text-ocean transition-colors">{name}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">{desc}</p>
        {features.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {features.slice(0, 4).map((feat, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <CheckCircle2 size={14} className="text-ocean flex-shrink-0 mt-0.5" />{feat}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="px-6 pb-6 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          {service.price_tnd ? (
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-midnight dark:text-white">{formatPrice(service.price_tnd, lang)}</span>
              {perHour && <span className="text-slate-400 text-sm">{perHour}</span>}
            </div>
          ) : (
            <span className="text-ocean font-semibold text-sm">{tr(['services.onQuote'], lang === 'ar' ? 'حسب الطلب' : lang === 'en' ? 'On quote' : 'Sur devis')}</span>
          )}
          {service.duration && (
            <div className="flex items-center gap-1 text-slate-400 text-xs"><Clock size={12} />{service.duration}</div>
          )}
        </div>
        <button
          onClick={() => openWhatsApp(buildServiceMessage({ serviceName: name }))}
          className="w-full flex items-center justify-center gap-2 bg-midnight hover:bg-midnight-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <MessageCircle size={15} />
          {tr(['services.requestService', 'common.requestService'], REQUEST_FALLBACK[lang] || REQUEST_FALLBACK.fr)}
        </button>
      </div>
    </div>
  )
}

/* ── Composant principal ──────────────────────────── */
export default function ServicesAndTraining() {
  const { t, lang, getName, getDesc } = useLang()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('service')
  const [highlighted, setHighlighted] = useState(null)

  /* Renvoie la première traduction trouvée, sinon le texte de secours */
  function tr(keys, fallback) {
    for (const k of keys) {
      const v = t(k)
      if (v && v !== k) return v
    }
    return fallback
  }

  /* Clic sur l'orbite → change l'onglet */
  useEffect(() => {
    let timer
    function onOrbit(e) {
      const tab = e.detail?.tab
      if (!TABS.includes(tab)) return
      setActiveTab(tab)
      setHighlighted(tab)
      clearTimeout(timer)
      timer = setTimeout(() => setHighlighted(null), 1200)
    }
    window.addEventListener('omarServiceTab', onOrbit)
    return () => { window.removeEventListener('omarServiceTab', onOrbit); clearTimeout(timer) }
  }, [])

  useEffect(() => {
    supabase.from('services').select('*').eq('is_visible', true).order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setServices(data || [])
        setLoading(false)
      })
  }, [])

  const tabServices = services.filter((s) => s.category === activeTab)

  return (
    <section id="services" className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-ocean font-semibold text-sm mb-3 uppercase tracking-wider">
            <Wrench size={15} />{t('services.title')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight dark:text-white mb-4">{t('services.subtitle')}</h2>
        </div>

        <div className="flex gap-2 justify-center mb-10 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                activeTab === tab
                  ? 'bg-midnight text-white border-midnight shadow-lg shadow-midnight/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-midnight/40'
              } ${highlighted === tab ? 'ring-2 ring-ocean ring-offset-2' : ''}`}
            >
              {t(`services.categories.${tab}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 animate-pulse space-y-4 h-52">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 px-5 py-4 rounded-xl border border-red-200">
            <AlertCircle size={18} /><span className="text-sm">{error}</span>
          </div>
        ) : tabServices.length === 0 ? (
          <p className="text-center text-slate-400 py-12">{t('common.noData')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tabServices.map((s) => (
              <ServiceCard key={s.id} service={s} lang={lang} t={t} tr={tr} getName={getName} getDesc={getDesc} />
            ))}
          </div>
        )}

        {/* id="assistance" : cible du clic sur l'icône IT Support */}
        <div className="mt-16 scroll-mt-20" id="assistance">
          <AnyDeskSection t={t} />
        </div>
      </div>
    </section>
  )
}
