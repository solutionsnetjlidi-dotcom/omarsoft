import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Wrench, Inbox, FileText, ArrowRight, TrendingUp, RefreshCw } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase }  from '../../lib/supabaseClient'
import { useLang }   from '../../context/LanguageContext'
import AdminLayout   from '../../components/AdminLayout'

const OCEAN = '#00b4d8'
const GOLD  = '#c9a227'

const STATUS_COLORS = {
  pending:'bg-amber-100 text-amber-700', in_progress:'bg-blue-100 text-blue-700',
  completed:'bg-emerald-100 text-emerald-700', cancelled:'bg-red-100 text-red-700',
}

function last7Days() {
  return Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i))
    return { date:d.toISOString().slice(0,10), label:d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'}), requests:0 }
  })
}

const CustomTooltip = ({active,payload,label})=> active&&payload?.length ? (
  <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-white/10">
    <p className="font-bold mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} style={{color:p.color}}>{p.name} : <strong>{p.value}</strong></p>)}
  </div>
) : null

function StatCard({icon:Icon,label,value,color,sub,onClick}) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:border-ocean/30 hover:shadow-lg hover:shadow-ocean/5 transition-all text-left group w-full">
      <div className={`rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`} style={{width:52,height:52}}>
        <Icon size={22} className="opacity-80"/>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-extrabold text-slate-900 leading-none mb-1">
          {value??<span className="w-8 h-5 bg-slate-200 rounded inline-block animate-pulse"/>}
        </p>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        {sub&&<p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <ArrowRight size={15} className="text-slate-300 group-hover:text-ocean transition-colors flex-shrink-0"/>
    </button>
  )
}

export default function Dashboard() {
  const { t }    = useLang()
  const navigate = useNavigate()
  const [stats,     setStats]     = useState({})
  const [requests,  setRequests]  = useState([])
  const [chartData, setChartData] = useState(last7Days())
  const [catData,   setCatData]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [updated,   setUpdated]   = useState(new Date())

  const load = useCallback(async ()=>{
    setLoading(true)
    try {
      const [p,s,r,d] = await Promise.all([
        supabase.from('products').select('id',{count:'exact',head:true}).eq('is_visible',true),
        supabase.from('services').select('id',{count:'exact',head:true}).eq('is_visible',true),
        supabase.from('service_requests').select('id',{count:'exact',head:true}).eq('status','pending'),
        supabase.from('invoices_and_quotes').select('id',{count:'exact',head:true}),
      ])
      setStats({products:p.count??0, services:s.count??0, pending:r.count??0, documents:d.count??0})

      const {data:recentReqs} = await supabase.from('service_requests').select('*').order('created_at',{ascending:false}).limit(8)
      setRequests(recentReqs||[])

      // Chart 7 days
      const since = new Date(); since.setDate(since.getDate()-6)
      const {data:reqs7} = await supabase.from('service_requests').select('created_at').gte('created_at',since.toISOString())
      const days = last7Days()
      ;(reqs7||[]).forEach(r=>{ const found=days.find(x=>x.date===r.created_at.slice(0,10)); if(found) found.requests++ })
      setChartData(days)

      // Products by category
      const {data:allP} = await supabase.from('products').select('category')
      const map={}
      ;(allP||[]).forEach(p=>{ map[p.category]=(map[p.category]||0)+1 })
      setCatData(Object.entries(map).map(([name,value])=>({name:name.charAt(0).toUpperCase()+name.slice(1),value})))

      setUpdated(new Date())
    } finally { setLoading(false) }
  },[])

  useEffect(()=>{ load() },[load])

  // Realtime
  useEffect(()=>{
    const ch = supabase.channel('dash-live')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'service_requests'},()=>load())
      .subscribe()
    return ()=>supabase.removeChannel(ch)
  },[load])

  const fmtDate = d => new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t('admin.title')}</h1>
            <p className="text-slate-500 text-sm mt-0.5">Bonjour Omar 👋 — {updated.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</p>
          </div>
          <button onClick={load} disabled={loading} className="flex items-center gap-2 text-sm text-ocean font-semibold disabled:opacity-50 hover:text-ocean-dark transition-colors">
            <RefreshCw size={15} className={loading?'animate-spin':''}/> Actualiser
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package}  label={t('admin.stats.totalProducts')}  value={stats.products}  color="bg-ocean/10 text-ocean"         sub="Produits actifs"     onClick={()=>navigate('/admin/products')}/>
          <StatCard icon={Wrench}   label={t('admin.stats.totalServices')}  value={stats.services}  color="bg-indigo-50 text-indigo-600"  sub="Services visibles"   onClick={()=>navigate('/admin/services')}/>
          <StatCard icon={Inbox}    label={t('admin.stats.pendingRequests')} value={stats.pending}  color="bg-amber-50 text-amber-600"    sub={stats.pending>0?'⚠️ En attente':'✅ Tout traité'} onClick={()=>navigate('/admin/requests')}/>
          <StatCard icon={FileText} label={t('admin.stats.totalDocuments')} value={stats.documents} color="bg-emerald-50 text-emerald-600" sub="Documents émis"       onClick={()=>navigate('/admin/documents')}/>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Area chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <div><h2 className="font-bold text-slate-900">Demandes clients</h2><p className="text-slate-400 text-xs mt-0.5">7 derniers jours</p></div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold bg-emerald-50 px-3 py-1.5 rounded-full">
                <TrendingUp size={12}/> Temps réel
              </div>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={chartData} margin={{top:4,right:4,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="gradOcean" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={OCEAN} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={OCEAN} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="label" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="requests" name="Demandes" stroke={OCEAN} strokeWidth={2.5}
                  fill="url(#gradOcean)" dot={{r:4,fill:OCEAN,strokeWidth:0}} activeDot={{r:6,fill:OCEAN}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="mb-5"><h2 className="font-bold text-slate-900">Par catégorie</h2><p className="text-slate-400 text-xs mt-0.5">Répartition produits</p></div>
            {catData.length===0
              ? <div className="flex items-center justify-center h-48 text-slate-300 text-sm">Aucun produit</div>
              : <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={catData} margin={{top:4,right:4,left:-24,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="name" tick={{fontSize:9,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="value" name="Produits" fill={GOLD} radius={[6,6,0,0]} maxBarSize={36}/>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        {/* Recent requests */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">{t('admin.stats.recentRequests')}</h2>
            <button onClick={()=>navigate('/admin/requests')} className="text-ocean text-sm font-semibold hover:underline">Voir tout →</button>
          </div>
          {loading?(
            <div className="divide-y divide-slate-50">
              {[1,2,3].map(i=>(
                <div key={i} className="px-6 py-4 flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex-shrink-0"/>
                  <div className="flex-1 space-y-2 py-1"><div className="h-3 bg-slate-100 rounded w-1/4"/><div className="h-3 bg-slate-100 rounded w-2/3"/></div>
                </div>
              ))}
            </div>
          ):requests.length===0?(
            <div className="px-6 py-12 text-center"><Inbox size={28} className="mx-auto text-slate-300 mb-2"/><p className="text-slate-400 text-sm">{t('admin.requests.noRequests')}</p></div>
          ):(
            <div className="divide-y divide-slate-50">
              {requests.map(req=>(
                <div key={req.id} onClick={()=>navigate('/admin/requests')}
                  className="px-6 py-3.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-base flex-shrink-0">
                    {req.request_type==='anydesk'?'🖥️':req.request_type==='quote'?'📋':req.request_type==='training'?'📚':'✉️'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{req.client_name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${STATUS_COLORS[req.status]||'bg-slate-100 text-slate-600'}`}>
                        {t(`admin.requests.statuses.${req.status}`)}
                      </span>
                      {req.status==='pending'&&<span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>}
                    </div>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{t(`admin.requests.types.${req.request_type}`)} — {fmtDate(req.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
