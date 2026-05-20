import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import OkapiLogo from './OkapiLogo'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-float">
            <OkapiLogo size={48} showText={false} />
          </div>
          <div className="w-7 h-7 border-2 border-electric-500 border-t-transparent rounded-full animate-spin opacity-70" />
        </div>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
