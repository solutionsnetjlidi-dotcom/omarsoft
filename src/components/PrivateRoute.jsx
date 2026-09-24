import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Protège les routes admin.
 * Redirige vers /admin/login si l'utilisateur n'est pas authentifié.
 */
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-ocean border-t-transparent rounded-full animate-spin" />
          <span className="text-white/60 text-sm">Vérification de la session...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
