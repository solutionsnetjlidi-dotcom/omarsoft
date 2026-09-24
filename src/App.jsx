import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }     from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import PrivateRoute         from './components/PrivateRoute'

// Public
import Home from './pages/Home'

// Admin
import AdminLogin       from './pages/Admin/Login'
import Dashboard        from './pages/Admin/Dashboard'
import ManageProducts   from './pages/Admin/ManageProducts'
import ManageServices   from './pages/Admin/ManageServices'
import ManageMedia      from './pages/Admin/ManageMedia'
import DocumentGenerator from './pages/Admin/DocumentGenerator'
import ManageRequests   from './pages/Admin/ManageRequests'
import AdminSettings    from './pages/Admin/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<Home />} />

            {/* ── Admin login (public) ── */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ── Protected admin routes ── */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <PrivateRoute>
                  <ManageProducts />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <PrivateRoute>
                  <ManageServices />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/media"
              element={
                <PrivateRoute>
                  <ManageMedia />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/documents"
              element={
                <PrivateRoute>
                  <DocumentGenerator />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <PrivateRoute>
                  <ManageRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PrivateRoute>
                  <AdminSettings />
                </PrivateRoute>
              }
            />

            {/* ── Catch-all redirect ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
