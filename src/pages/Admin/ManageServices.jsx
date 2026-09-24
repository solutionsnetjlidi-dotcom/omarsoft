import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, X, AlertCircle, CheckCircle2, Wrench } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useLang } from '../../context/LanguageContext'
import { formatTND } from '../../utils/currencyFormatter'
import AdminLayout from '../../components/AdminLayout'

const CATEGORIES  = ['service', 'training', 'media']
const PRICE_TYPES = ['fixed', 'per_hour', 'custom', 'free']
const ICON_NAMES  = ['Wrench','Monitor','Wifi','BookOpen','Camera','TrendingUp','Shield','Tool','Settings','Globe','Zap','Star']

const EMPTY_FORM = {
  name_fr: '', name_ar: '', name_en: '',
  description_fr: '', description_ar: '', description_en: '',
  price_tnd: '', price_type: 'fixed', icon_name: 'Wrench',
  category: 'service', duration: '',
  features_fr: [''], features_ar: [''], features_en: [''],
  is_visible: true, sort_order: 0,
}

function FeatureList({ label, values, onChange, dir = 'ltr', placeholder }) {
  function setVal(i, v) {
    const next = [...values]
    next[i] = v
    onChange(next)
  }
  function addRow()      { onChange([...values, '']) }
  function removeRow(i)  { onChange(values.filter((_, idx) => idx !== i)) }

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              dir={dir}
              value={v}
              onChange={(e) => setVal(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean"
            />
            {values.length > 1 && (
              <button type="button" onClick={() => removeRow(i)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addRow} className="text-ocean text-xs font-medium hover:underline">+ Ajouter</button>
      </div>
    </div>
  )
}

function ServiceModal({ service, onSave, onClose, t }) {
  const [form,   setForm]   = useState(service || EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)
  const [tab,    setTab]    = useState('fr')

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name_fr) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        price_tnd:  form.price_tnd ? parseFloat(form.price_tnd) : null,
        sort_order: parseInt(form.sort_order) || 0,
        // Filter out empty feature strings
        features_fr: form.features_fr.filter(Boolean),
        features_ar: form.features_ar.filter(Boolean),
        features_en: form.features_en.filter(Boolean),
      }
      if (service?.id) {
        const { error } = await supabase.from('services').update(payload).eq('id', service.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('services').insert(payload)
        if (error) throw error
      }
      onSave()
    } catch (err) {
      setError(err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean'
  const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-lg text-slate-900">
            {service?.id ? 'Modifier le service' : 'Ajouter un service'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Category / Icon / Price type */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Catégorie *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`services.categories.${c}`)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Icône Lucide</label>
              <select value={form.icon_name} onChange={(e) => set('icon_name', e.target.value)} className={inputCls}>
                {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Type de prix</label>
              <select value={form.price_type} onChange={(e) => set('price_type', e.target.value)} className={inputCls}>
                {PRICE_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{t(`admin.services.priceType.${pt}`)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price / Duration / Sort */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Prix (TND)</label>
              <input
                type="number" min="0" step="0.001"
                value={form.price_tnd}
                onChange={(e) => set('price_tnd', e.target.value)}
                className={inputCls} placeholder="0.000"
                disabled={form.price_type === 'custom' || form.price_type === 'free'}
              />
            </div>
            <div>
              <label className={labelCls}>{t('admin.services.duration')}</label>
              <input value={form.duration} onChange={(e) => set('duration', e.target.value)} className={inputCls} placeholder="ex: 2–4 heures" />
            </div>
            <div>
              <label className={labelCls}>Ordre d'affichage</label>
              <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Language tabs */}
          <div>
            <div className="flex gap-1 border border-slate-200 rounded-xl p-1 mb-4 w-fit">
              {['fr','ar','en'].map((l) => (
                <button type="button" key={l} onClick={() => setTab(l)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === l ? 'bg-midnight text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {tab === 'fr' && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Nom (Français) *</label>
                  <input required value={form.name_fr} onChange={(e) => set('name_fr', e.target.value)} className={inputCls} placeholder="Nom du service en français" />
                </div>
                <div>
                  <label className={labelCls}>Description (Français)</label>
                  <textarea rows={3} value={form.description_fr} onChange={(e) => set('description_fr', e.target.value)} className={`${inputCls} resize-none`} placeholder="Description complète..." />
                </div>
                <FeatureList
                  label="Fonctionnalités (FR)"
                  values={form.features_fr.length ? form.features_fr : ['']}
                  onChange={(v) => set('features_fr', v)}
                  placeholder="Ex: Diagnostic complet inclus"
                />
              </div>
            )}

            {tab === 'ar' && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>الاسم (العربية)</label>
                  <input dir="rtl" value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} className={`${inputCls} text-right`} placeholder="اسم الخدمة بالعربية" />
                </div>
                <div>
                  <label className={labelCls}>الوصف (العربية)</label>
                  <textarea dir="rtl" rows={3} value={form.description_ar} onChange={(e) => set('description_ar', e.target.value)} className={`${inputCls} resize-none text-right`} />
                </div>
                <FeatureList
                  label="الميزات (AR)"
                  values={form.features_ar.length ? form.features_ar : ['']}
                  onChange={(v) => set('features_ar', v)}
                  dir="rtl"
                  placeholder="مثال: تشخيص كامل مشمول"
                />
              </div>
            )}

            {tab === 'en' && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Name (English)</label>
                  <input value={form.name_en} onChange={(e) => set('name_en', e.target.value)} className={inputCls} placeholder="Service name in English" />
                </div>
                <div>
                  <label className={labelCls}>Description (English)</label>
                  <textarea rows={3} value={form.description_en} onChange={(e) => set('description_en', e.target.value)} className={`${inputCls} resize-none`} />
                </div>
                <FeatureList
                  label="Features (EN)"
                  values={form.features_en.length ? form.features_en : ['']}
                  onChange={(v) => set('features_en', v)}
                  placeholder="Ex: Full diagnosis included"
                />
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <button type="button" onClick={() => set('is_visible', !form.is_visible)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.is_visible ? 'bg-ocean' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_visible ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm font-medium text-slate-700">
              {form.is_visible ? t('common.visible') : t('common.hidden')}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={15} />{error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-ocean hover:bg-ocean-dark text-white font-bold py-2.5 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('common.loading')}</>
                : t('common.save')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ManageServices() {
  const { t } = useLang()
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)
  const [toast,    setToast]    = useState(null)
  const [activeTab, setActiveTab] = useState('service')

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('sort_order').order('created_at')
    setServices(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function showToast(msg, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function toggleVisibility(svc) {
    await supabase.from('services').update({ is_visible: !svc.is_visible }).eq('id', svc.id)
    setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, is_visible: !s.is_visible } : s))
    showToast(t('common.success'))
  }

  async function deleteSvc(svc) {
    if (!window.confirm('Confirmer la suppression ?')) return
    await supabase.from('services').delete().eq('id', svc.id)
    setServices((prev) => prev.filter((s) => s.id !== svc.id))
    showToast(t('common.success'))
  }

  const tabItems = services.filter((s) => s.category === activeTab)

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-slate-900">{t('admin.services.title')}</h1>
          <button
            onClick={() => setModal({ ...EMPTY_FORM, category: activeTab })}
            className="flex items-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md"
          >
            <Plus size={18} />Ajouter
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
                activeTab === cat ? 'bg-midnight text-white border-midnight' : 'bg-white text-slate-600 border-slate-200 hover:border-midnight/40'
              }`}>
              {t(`services.categories.${cat}`)}
              <span className="ml-2 text-xs opacity-60">({services.filter((s) => s.category === cat).length})</span>
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse space-y-3 h-40">
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : tabItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <Wrench size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm">{t('common.noData')}</p>
            <button onClick={() => setModal({ ...EMPTY_FORM, category: activeTab })} className="mt-4 text-ocean text-sm font-medium hover:underline">
              + Ajouter le premier service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabItems.map((svc) => (
              <div key={svc.id} className="bg-white rounded-2xl border border-slate-100 hover:border-ocean/30 hover:shadow-md transition-all p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{svc.name_fr}</h3>
                    {svc.name_ar && <p className="text-slate-400 text-xs mt-0.5 line-clamp-1" dir="rtl">{svc.name_ar}</p>}
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${svc.is_visible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {svc.is_visible ? 'Visible' : 'Masqué'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {svc.price_tnd && (
                    <span className="font-semibold text-midnight">
                      {formatTND(svc.price_tnd)}
                      {svc.price_type === 'per_hour' ? ' /h' : ''}
                    </span>
                  )}
                  {svc.duration && <span className="text-slate-400">· {svc.duration}</span>}
                  <span className="ml-auto text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">{svc.icon_name}</span>
                </div>

                <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
                  <button onClick={() => toggleVisibility(svc)} title="Basculer visibilité"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
                    {svc.is_visible ? <><EyeOff size={13} />Masquer</> : <><Eye size={13} />Afficher</>}
                  </button>
                  <button onClick={() => setModal(svc)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium bg-ocean/10 text-ocean rounded-lg hover:bg-ocean/20 transition-colors">
                    <Pencil size={13} />{t('common.edit')}
                  </button>
                  <button onClick={() => deleteSvc(svc)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <ServiceModal service={modal?.id ? modal : null} onSave={() => { setModal(null); load(); showToast(t('common.success')) }} onClose={() => setModal(null)} t={t} />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm ${toast.ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
          <CheckCircle2 size={17} />{toast.msg}
        </div>
      )}
    </AdminLayout>
  )
}
