import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }     from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider }    from './context/ThemeContext'
import { CartProvider }     from './context/CartContext'
import PrivateRoute         from './components/PrivateRoute'
import Home                 from './pages/Home'
import AdminLogin           from './pages/Admin/Login'
import Dashboard            from './pages/Admin/Dashboard'
import ManageProducts       from './pages/Admin/ManageProducts'
import ManageServices       from './pages/Admin/ManageServices'
import ManageMedia          from './pages/Admin/ManageMedia'
import DocumentGenerator    from './pages/Admin/DocumentGenerator'
import ManageRequests       from './pages/Admin/ManageRequests'
import AdminSettings        from './pages/Admin/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route path="/"                element={<Home />} />
                <Route path="/admin/login"     element={<AdminLogin />} />
                <Route path="/admin"           element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/admin/products"  element={<PrivateRoute><ManageProducts /></PrivateRoute>} />
                <Route path="/admin/services"  element={<PrivateRoute><ManageServices /></PrivateRoute>} />
                <Route path="/admin/media"     element={<PrivateRoute><ManageMedia /></PrivateRoute>} />
                <Route path="/admin/documents" element={<PrivateRoute><DocumentGenerator /></PrivateRoute>} />
                <Route path="/admin/requests"  element={<PrivateRoute><ManageRequests /></PrivateRoute>} />
                <Route path="/admin/settings"  element={<PrivateRoute><AdminSettings /></PrivateRoute>} />
                <Route path="*"                element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
