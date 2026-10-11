import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Wrench, Image, FileText, Inbox, Settings, LogOut, Menu, X, Monitor, ChevronRight, Bell } from 'lucide-react'
import { useAuth }  from '../context/AuthContext'
import { useLang }  from '../context/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { requestPermission, canNotify, notifyNewRequest, createToast } from '../utils/notifications'

const NAV = [
  { to:'/admin',           label:'dashboard',  icon:LayoutDashboard, end:true },
  { to:'/admin/products',  label:'products',   icon:Package },
  { to:'/admin/services',  label:'services',   icon:Wrench },
  { to:'/admin/media',     label:'media',      icon:Image },
  { to:'/admin/documents', label:'documents',  icon:FileText },
  { to:'/admin/requests',  label:'requests',   icon:Inbox },
  { to:'/admin/settings',  label:'settings',   icon:Settings },
]

export default function AdminLayout({ children }) {
  const { signOut } = useAuth()
  const { t }       = useLang()
  const navigate    = useNavigate()
  const [open,         setOpen]         = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [notifOk,      setNotifOk]      = useState(canNotify())

  // Load initial pending count
  useEffect(()=>{
    supabase.from('service_requests').select('id',{count:'exact',head:true}).eq('status','pending')
      .then(({count})=>setPendingCount(count??0))
  },[])

  // Realtime subscription
  useEffect(()=>{
    const ch = supabase.channel('admin-realtime')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'service_requests'},(payload)=>{
        setPendingCount(c=>c+1)
        if(canNotify()) notifyNewRequest(payload.new)
        else createToast(`🔔 Nouvelle demande de ${payload.new.client_name||'client'}`, 'request')
      })
      .subscribe()
    return ()=>supabase.removeChannel(ch)
  },[])

  async function enableNotifs() {
    const ok = await requestPermission()
    setNotifOk(ok)
    createToast(ok ? '🔔 Alertes navigateur activées !' : '⚠️ Permission refusée — autorisez les notifications dans le navigateur.', ok?'success':'warning')
  }

  async function handleLogout() { await signOut(); navigate('/admin/login') }

  const SidebarInner = ()=>(
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ocean flex items-center justify-center"><Monitor size={17} className="text-white"/></div>
          <div>
            <p className="font-bold text-sm leading-none"><span className="text-white">Omar</span><span className="text-amber-400">Soft</span></p>
            <p className="text-white/35 text-[9px] mt-0.5 tracking-widest uppercase font-semibold">Back-Office</p>
          </div>
        </div>
        <button onClick={()=>setOpen(false)} className="lg:hidden w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white">
          <X size={14}/>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({to,label,icon:Icon,end})=>(
          <NavLink key={to} to={to} end={end} onClick={()=>setOpen(false)}
            className={({isActive})=>`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${isActive?'bg-ocean text-white':'text-white/55 hover:bg-white/10 hover:text-white'}`}>
            <Icon size={17}/>
            {t(`admin.${label}`)}
            {label==='requests' && pendingCount>0 && (
              <span className="ml-auto bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {pendingCount>99?'99+':pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Notification toggle */}
      {!notifOk && (
        <div className="px-3 pb-2">
          <button onClick={enableNotifs} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-400/10 border border-amber-400/20 transition-all">
            <Bell size={13}/>Activer les alertes
          </button>
        </div>
      )}
      {notifOk && (
        <div className="px-5 pb-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-emerald-400 text-xs font-semibold">Alertes activées</span>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={16}/>{t('admin.logout')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 fixed inset-y-0 left-0 z-30"><SidebarInner/></div>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={()=>setOpen(false)}/>}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:hidden ${open?'translate-x-0':'-translate-x-full'}`}>
        <SidebarInner/>
      </div>

      {/* Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20">
          <button onClick={()=>setOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"><Menu size={20}/></button>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span className="font-semibold text-slate-800">OmarSoft</span>
            <ChevronRight size={13}/>
            <span>{t('admin.title')}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {pendingCount>0 && (
              <button onClick={()=>navigate('/admin/requests')} className="flex items-center gap-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
                <Bell size={13} className="animate-pulse"/>{pendingCount} en attente
              </button>
            )}
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-xs text-ocean hover:text-ocean-dark font-medium">↗ Site</a>
            <div className="w-8 h-8 rounded-full bg-ocean flex items-center justify-center">
              <span className="text-white text-xs font-bold">O</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
