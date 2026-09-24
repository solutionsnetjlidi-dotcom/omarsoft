import { useEffect, useState } from 'react'
import { Inbox, MessageCircle, Phone, Clock, ChevronDown, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useLang } from '../../context/LanguageContext'
import { openWhatsApp, config } from '../../utils/config'
import AdminLayout from '../../components/AdminLayout'

const STATUS_OPTIONS = ['pending', 'in_progress', 'completed', 'cancelled']
const TYPE_OPTIONS   = ['anydesk', 'quote', 'training', 'contact']

const STATUS_STYLES = {
  pending:     'bg-amber-100 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:   'bg-red-100 text-red-700 border-red-200',
}
const TYPE_EMOJI = {
  anydesk:  '🖥️',
  quote:    '📋',
  training: '📚',
  contact:  '✉️',
}

function DetailModal({ request, onClose, onUpdate, t }) {
  const [status, setStatus] = useState(request.status)
  const [notes,  setNotes]  = useState(request.admin_notes || '')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('service_requests')
      .update({ status, admin_notes: notes })
      .eq('id', request.id)
    if (!error) {
      setSaved(true)
      onUpdate({ ...request, status, admin_notes: notes })
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  function handleWhatsApp() {
    if (!request.client_phone) return
    const num = request.client_phone.replace(/\D/g, '')
    const msg = `Bonjour ${request.client_name}, suite à votre demande du ${new Date(request.created_at).toLocaleDateString('fr-FR')}, voici notre réponse : `
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function fmtDate(d) {
    return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{TYPE_EMOJI[request.request_type] || '📩'}</span>
            <div>
              <h2 className="font-bold text-slate-900">{request.client_name}</h2>
              <p className="text-slate-400 text-xs">{t(`admin.requests.types.${request.request_type}`)} — {fmtDate(request.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Client info */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            {request.client_email && (
              <div className="flex gap-2 text-slate-600">
                <span className="text-slate-400 w-20 flex-shrink-0">Email :</span>
                <a href={`mailto:${request.client_email}`} className="text-ocean hover:underline">{request.client_email}</a>
              </div>
            )}
            {request.client_phone && (
              <div className="flex gap-2 text-slate-600">
                <span className="text-slate-400 w-20 flex-shrink-0">Tél :</span>
                <a href={`tel:${request.client_phone}`} className="text-ocean hover:underline">{request.client_phone}</a>
              </div>
            )}
            {request.anydesk_id && (
              <div className="flex gap-2 text-slate-600">
                <span className="text-slate-400 w-20 flex-shrink-0">{t('admin.requests.anydesk_id')} :</span>
                <span className="font-mono font-bold text-midnight">{request.anydesk_id}</span>
              </div>
            )}
            {request.requested_service && (
              <div className="flex gap-2 text-slate-600">
                <span className="text-slate-400 w-20 flex-shrink-0">Service :</span>
                <span>{request.requested_service}</span>
              </div>
            )}
          </div>

          {/* Message */}
          {request.message && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Message du client</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed">
                {request.message}
              </div>
            </div>
          )}

          {/* Status update */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('admin.requests.updateStatus')}
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    status === s
                      ? STATUS_STYLES[s]
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t(`admin.requests.statuses.${s}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Admin notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('admin.requests.adminNotes')}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes internes (non visibles par le client)..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean resize-none"
            />
          </div>

          {saved && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm">
              <CheckCircle2 size={15} />{t('common.success')}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            {request.client_phone && (
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <MessageCircle size={15} />WhatsApp
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-ocean hover:bg-ocean-dark text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('common.loading')}</>
                : <><CheckCircle2 size={15} />{t('common.save')}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ManageRequests() {
  const { t } = useLang()
  const [requests,    setRequests]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [selected,    setSelected]    = useState(null)
  const [filterType,  setFilterType]  = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function handleUpdate(updated) {
    setRequests((prev) => prev.map((r) => r.id === updated.id ? updated : r))
    setSelected(updated)
  }

  function fmtDate(d) {
    return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const filtered = requests.filter((r) => {
    const matchType   = filterType === 'all'   || r.request_type === filterType
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchType && matchStatus
  })

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t('admin.requests.title')}</h1>
            {pendingCount > 0 && (
              <p className="text-amber-600 text-sm font-semibold mt-0.5">
                ⚠️ {pendingCount} demande(s) en attente de traitement
              </p>
            )}
          </div>
          <button onClick={load} className="text-sm text-ocean font-medium hover:underline">
            ↻ Rafraîchir
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${filterType === 'all' ? 'bg-midnight text-white border-midnight' : 'bg-white text-slate-600 border-slate-200'}`}>
              Tous les types
            </button>
            {TYPE_OPTIONS.map((tp) => (
              <button key={tp} onClick={() => setFilterType(tp)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${filterType === tp ? 'bg-midnight text-white border-midnight' : 'bg-white text-slate-600 border-slate-200'}`}>
                {TYPE_EMOJI[tp]} {t(`admin.requests.types.${tp}`)}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${filterStatus === 'all' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200'}`}>
              Tous les statuts
            </button>
            {STATUS_OPTIONS.map((st) => (
              <button key={st} onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  filterStatus === st ? STATUS_STYLES[st] : 'bg-white text-slate-600 border-slate-200'
                }`}>
                {t(`admin.requests.statuses.${st}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Requests list */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Inbox size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400">{t('admin.requests.noRequests')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((req) => (
                <button
                  key={req.id}
                  onClick={() => setSelected(req)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50/70 text-left transition-colors group"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    req.status === 'pending' ? 'bg-amber-50' : 'bg-slate-50'
                  }`}>
                    {TYPE_EMOJI[req.request_type] || '📩'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">{req.client_name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_STYLES[req.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {t(`admin.requests.statuses.${req.status}`)}
                      </span>
                      {req.status === 'pending' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-slate-400 text-xs">{t(`admin.requests.types.${req.request_type}`)}</span>
                      {req.anydesk_id && (
                        <span className="text-xs font-mono text-ocean">ID: {req.anydesk_id}</span>
                      )}
                      {req.message && (
                        <span className="text-slate-400 text-xs truncate max-w-xs">{req.message}</span>
                      )}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1 text-slate-400 text-xs justify-end">
                        <Clock size={11} />
                        {fmtDate(req.created_at)}
                      </div>
                      {req.client_phone && (
                        <div className="flex items-center gap-1 text-slate-400 text-xs justify-end mt-0.5">
                          <Phone size={11} />
                          {req.client_phone}
                        </div>
                      )}
                    </div>
                    <ChevronDown size={16} className="text-slate-300 group-hover:text-slate-500 -rotate-90 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-slate-400 text-sm">{filtered.length} demande(s)</p>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          request={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          t={t}
        />
      )}
    </AdminLayout>
  )
}
