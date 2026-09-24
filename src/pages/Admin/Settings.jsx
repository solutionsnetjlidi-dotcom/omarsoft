import { useEffect, useState } from 'react'
import { Save, CheckCircle2, AlertCircle, Settings } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useLang } from '../../context/LanguageContext'
import AdminLayout from '../../components/AdminLayout'

const SETTINGS_FIELDS = [
  { key: 'company_name',     label: 'Nom de l\'entreprise (FR)',  type: 'text'   },
  { key: 'company_name_ar',  label: 'Nom de l\'entreprise (AR)',  type: 'text',  dir: 'rtl' },
  { key: 'company_brand',    label: 'Nom de marque (OMARSOFT)',   type: 'text'   },
  { key: 'company_address',  label: 'Adresse complète',          type: 'text'   },
  { key: 'company_phone',    label: 'Téléphone',                  type: 'text'   },
  { key: 'company_whatsapp', label: 'WhatsApp (avec +216...)',    type: 'text'   },
  { key: 'company_email',    label: 'Email de contact',           type: 'email'  },
  { key: 'company_rc',       label: 'Registre du Commerce (RC)',  type: 'text'   },
  { key: 'company_mf',       label: 'Matricule Fiscal (MF)',      type: 'text'   },
  { key: 'anydesk_id',       label: 'ID AnyDesk de l\'entreprise', type: 'text'  },
  { key: 'exchange_rate_eur', label: '1 TND = EUR (taux)',        type: 'number' },
  { key: 'exchange_rate_usd', label: '1 TND = USD (taux)',        type: 'number' },
  { key: 'tva_rate',         label: 'Taux TVA par défaut (%)',    type: 'number' },
]

export default function AdminSettings() {
  const { t } = useLang()
  const [values,  setValues]  = useState({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('company_settings').select('*')
      if (data) {
        const map = {}
        data.forEach(({ key, value }) => { map[key] = value || '' })
        setValues(map)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const upserts = Object.entries(values).map(([key, value]) => ({ key, value }))
      const { error } = await supabase
        .from('company_settings')
        .upsert(upserts, { onConflict: 'key' })
      if (error) throw error
      setToast({ msg: t('admin.settings.saved'), ok: true })
    } catch (err) {
      setToast({ msg: err.message || t('common.error'), ok: false })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3500)
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean bg-white'

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">{t('admin.settings.title')}</h1>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-md"
          >
            <Save size={16} />
            {saving ? t('common.loading') : t('admin.settings.save')}
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6 pb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-ocean/10 flex items-center justify-center">
                <Settings size={16} className="text-ocean" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Paramètres de l'entreprise</p>
                <p className="text-slate-400 text-xs">Ces valeurs s'affichent sur tous les documents commerciaux.</p>
              </div>
            </div>

            <div className="space-y-5">
              {SETTINGS_FIELDS.map(({ key, label, type, dir }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type || 'text'}
                    dir={dir || 'ltr'}
                    value={values[key] || ''}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    step={type === 'number' ? '0.001' : undefined}
                    className={`${inputCls} ${dir === 'rtl' ? 'text-right' : ''}`}
                  />
                </div>
              ))}
            </div>

            {/* Taglines */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-700 text-sm">Slogans par langue</h3>
              {[
                { key: 'company_tagline_fr', label: 'Slogan (Français)' },
                { key: 'company_tagline_ar', label: 'Slogan (Arabe)',    dir: 'rtl' },
                { key: 'company_tagline_en', label: 'Slogan (Anglais)'  },
              ].map(({ key, label, dir }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    dir={dir || 'ltr'}
                    value={values[key] || ''}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    className={`${inputCls} ${dir === 'rtl' ? 'text-right' : ''}`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-midnight hover:bg-midnight-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? t('common.loading') : t('admin.settings.save')}
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm transition-all ${toast.ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.ok ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          {toast.msg}
        </div>
      )}
    </AdminLayout>
  )
}
