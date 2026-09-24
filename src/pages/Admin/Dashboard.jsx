import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Wrench, Inbox, FileText, Plus, ArrowRight, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useLang } from '../../context/LanguageContext'
import AdminLayout from '../../components/AdminLayout'

const STATUS_COLORS = {
  pending:     'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-red-100 text-red-700',
}

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-4 hover:border-ocean/30 hover:shadow-lg hover:shadow-ocean/5 transition-all text-left group"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={24} className="opacity-80" />
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-extrabold text-slate-900 leading-none mb-1">
          {value ?? <span className="w-8 h-6 bg-slate-200 rounded animate-pulse inline-block" />}
        </p>
        <p className="text-slate-500 text-sm font-medium truncate">{label}</p>
      </div>
      <ArrowRight size={16} className="text-slate-300 group-hover:text-ocean ml-auto flex-shrink-0 transition-colors" />
    </button>
  )
}

export default function Dashboard() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [stats,    setStats]   = useState({})
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      const [prods, servs, reqs, docs] = await Promise.all([
        supabase.from('products')          .select('id', { count: 'exact', head: true }).eq('is_visible', true),
        supabase.from('services')          .select('id', { count: 'exact', head: true }).eq('is_visible', true),
        supabase.from('service_requests')  .select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('invoices_and_quotes').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        products: prods.count   ?? 0,
        services: servs.count   ?? 0,
        pending:  reqs.count    ?? 0,
        documents: docs.count   ?? 0,
      })

      // Recent requests
      const { data } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)
      setRequests(data || [])
      setLoading(false)
    }
    load()
  }, [])

  function fmtDate(d) {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t('admin.title')}</h1>
            <p className="text-slate-500 text-sm mt-0.5">Bienvenue, Omar 👋</p>
          </div>
          <div className="text-sm text-slate-400 flex items-center gap-1.5">
            <Clock size={13} />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            label={t('admin.stats.totalProducts')}
            value={stats.products}
            color="bg-ocean/10 text-ocean"
            onClick={() => navigate('/admin/products')}
          />
          <StatCard
            icon={Wrench}
            label={t('admin.stats.totalServices')}
            value={stats.services}
            color="bg-indigo-50 text-indigo-600"
            onClick={() => navigate('/admin/services')}
          />
          <StatCard
            icon={Inbox}
            label={t('admin.stats.pendingRequests')}
            value={stats.pending}
            color="bg-amber-50 text-amber-600"
            onClick={() => navigate('/admin/requests')}
          />
          <StatCard
            icon={FileText}
            label={t('admin.stats.totalDocuments')}
            value={stats.documents}
            color="bg-emerald-50 text-emerald-600"
            onClick={() => navigate('/admin/documents')}
          />
        </div>

        {/* Content row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent requests */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">{t('admin.stats.recentRequests')}</h2>
              <button
                onClick={() => navigate('/admin/requests')}
                className="text-ocean text-sm font-medium hover:underline"
              >
                {t('admin.stats.viewRequests')}
              </button>
            </div>
            {loading ? (
              <div className="divide-y divide-slate-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                <Inbox size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">{t('admin.requests.noRequests')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => navigate('/admin/requests')}
                    className="px-6 py-3.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-sm">
                      {req.request_type === 'anydesk'  ? '🖥️' :
                       req.request_type === 'quote'    ? '📋' :
                       req.request_type === 'training' ? '📚' : '✉️'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm truncate">{req.client_name}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-600'}`}>
                          {t(`admin.requests.statuses.${req.status}`)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs truncate mt-0.5">
                        {t(`admin.requests.types.${req.request_type}`)} — {fmtDate(req.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-bold text-slate-900 mb-4">{t('admin.stats.quickActions')}</h2>
            <div className="space-y-3">
              {[
                { label: t('admin.stats.newProduct'),  to: '/admin/products',  icon: Package,    color: 'bg-ocean text-white'     },
                { label: t('admin.stats.newDocument'), to: '/admin/documents', icon: FileText,   color: 'bg-midnight text-white'  },
                { label: t('admin.stats.viewRequests'),to: '/admin/requests',  icon: Inbox,      color: 'bg-amber-500 text-white' },
                { label: t('admin.services'),          to: '/admin/services',  icon: Wrench,     color: 'bg-indigo-500 text-white'},
              ].map(({ label, to, icon: Icon, color }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon size={15} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <ArrowRight size={14} className="text-slate-300 ml-auto" />
                </button>
              ))}
            </div>

            {/* Performance mini-chart placeholder */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-ocean" />
                <span className="text-xs font-semibold text-slate-600">Activité ce mois</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {[30, 60, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-ocean/20 hover:bg-ocean/40 transition-colors"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-slate-400">
                {['L','M','M','J','V','S','D'].map((d, i) => <span key={i}>{d}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
