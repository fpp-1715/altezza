import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import AdminLoginModal from '../components/AdminLoginModal'

export default function AdminLoginPage() {
  const { login, loading } = useAdminAuth()
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#131313] px-4 text-on-surface">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-5 block text-center font-title-editorial text-xl tracking-widest text-primary">Altezza</Link>
        {!isSupabaseConfigured && (
          <p role="alert" className="mb-4 rounded-lg border border-error/30 bg-error-container/20 p-3 text-sm text-error">
            Falta configurar la URL y la clave publicable de Supabase en las variables de entorno.
          </p>
        )}
        <AdminLoginModal
          open
          onClose={() => {}}
          onCancel={() => navigate('/')}
          onLogin={login}
          disabled={loading || !isSupabaseConfigured}
        />
      </div>
    </main>
  )
}
