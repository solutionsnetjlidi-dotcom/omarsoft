import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }     from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider }    from './context/ThemeContext'
import { CartProvider }     from './context/CartContext'
import PrivateRoute         from './components/PrivateRoute'
import Home                 from './pages/Home'

/* Les pages admin sont chargées à la demande : les visiteurs du site
   ne téléchargent ni l'administration ni les graphiques (recharts). */
const AdminLogin        = lazy(() => import('./pages/Admin/Login'))
const Dashboard         = lazy(() => import('./pages/Admin/Dashboard'))
const ManageProducts    = lazy(() => import('./pages/Admin/ManageProducts'))
const ManageServices    = lazy(() => import('./pages/Admin/ManageServices'))
const ManageMedia       = lazy(() => import('./pages/Admin/ManageMedia'))
const DocumentGenerator = lazy(() => import('./pages/Admin/DocumentGenerator'))
const ManageRequests    = lazy(() => import('./pages/Admin/ManageRequests'))
const AdminSettings     = lazy(() => import('./pages/Admin/Settings'))

const Loading = () => (
  <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a1628' }}>
    <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,.15)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
  </div>
)

const guard = (el) => <PrivateRoute>{el}</PrivateRoute>

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/"                element={<Home />} />
                  <Route path="/admin/login"     element={<AdminLogin />} />
                  <Route path="/admin"           element={guard(<Dashboard />)} />
                  <Route path="/admin/products"  element={guard(<ManageProducts />)} />
                  <Route path="/admin/services"  element={guard(<ManageServices />)} />
                  <Route path="/admin/media"     element={guard(<ManageMedia />)} />
                  <Route path="/admin/documents" element={guard(<DocumentGenerator />)} />
                  <Route path="/admin/requests"  element={guard(<ManageRequests />)} />
                  <Route path="/admin/settings"  element={guard(<AdminSettings />)} />
                  <Route path="*"                element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
