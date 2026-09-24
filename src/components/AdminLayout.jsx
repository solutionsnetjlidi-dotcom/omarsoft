import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Wrench, Image, FileText,
  Inbox, Settings, LogOut, Menu, X, Monitor, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'

const navItems = [
  { to: '/admin',          label: 'dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'products',   icon: Package },
  { to: '/admin/services', label: 'services',   icon: Wrench },
  { to: '/admin/media',    label: 'media',      icon: Image },
  { to: '/admin/documents',label: 'documents',  icon: FileText },
  { to: '/admin/requests', label: 'requests',   icon: Inbox },
  { to: '/admin/settings', label: 'settings',   icon: Settings },
]

export default function AdminLayout({ children }) {
  const { signOut } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/admin/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-slate-900 ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-ocean flex items-center justify-center flex-shrink-0">
            <Monitor size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">OMARSOFT</p>
            <p className="text-white/40 text-xs mt-0.5">Back-Office Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-ocean text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {t(`admin.${label}`)}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={17} />
          {t('admin.logout')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="h-full">
          <Sidebar mobile />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb placeholder */}
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span className="font-medium text-slate-800">OMARSOFT</span>
            <ChevronRight size={14} />
            <span>{t('admin.title')}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ocean hover:text-ocean-dark font-medium"
            >
              ↗ Voir le site
            </a>
            <div className="w-8 h-8 rounded-full bg-ocean flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
