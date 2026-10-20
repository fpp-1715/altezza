import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const onProducts = location.pathname.startsWith('/admin/productos')

  const handleLogout = () => {
    void logout().then(() => navigate('/')).catch((error: unknown) => {
      console.error('No se pudo cerrar la sesión:', error)
    })
  }

  return (
    <div className="min-h-screen bg-[#131313] text-on-surface antialiased">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/10 bg-surface-container-low/95 pt-[env(safe-area-inset-top)] shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
          <Link to="/admin/productos" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-surface-container text-sm font-bold text-primary">AL</div>
            <div>
              <div className="font-title-editorial text-[17px] tracking-wide text-primary">Altezza Admin</div>
              <div className="font-label-caps text-[9px] uppercase tracking-widest text-outline">
                {onProducts ? 'Productos' : location.pathname === '/admin/categorias' ? 'Categorías' : location.pathname === '/admin/usuarios' ? 'Usuarios' : 'Ofertas'}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-28 truncate rounded-full bg-surface-container-high px-3 py-1 font-technical-data text-[10px] text-on-surface-variant sm:block">{user}</span>
            <button onClick={handleLogout} aria-label="Cerrar sesión" className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-screen overflow-x-hidden px-0 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(4rem+env(safe-area-inset-top))] md:ml-60 md:px-6 md:pb-8 md:pt-20 lg:px-10">
        <div key={`${location.pathname}${location.search}`} className="page-enter">
          {children}
        </div>
      </main>

      <nav aria-label="Navegación de administración" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-primary/10 bg-surface-container-low/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.7)] backdrop-blur-xl md:hidden">
        {[
          { to: '/admin/productos', label: 'Productos', icon: 'diamond', active: onProducts },
          { to: '/admin/productos/nuevo', label: 'Añadir', icon: 'add_circle', active: location.pathname.endsWith('/nuevo') },
          { to: '/admin/categorias', label: 'Categorías', icon: 'folder_special', active: location.pathname === '/admin/categorias' },
          { to: '/admin/ofertas', label: 'Ofertas', icon: 'sell', active: location.pathname === '/admin/ofertas' },
          { to: '/admin/usuarios', label: 'Usuarios', icon: 'manage_accounts', active: location.pathname === '/admin/usuarios' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[10px] ${item.active ? 'font-medium text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <nav aria-label="Navegación de administración" className="fixed bottom-0 left-0 top-16 z-40 hidden w-60 flex-col gap-2 border-r border-primary/10 bg-surface-container-low/95 p-4 shadow-lg backdrop-blur-xl md:flex">
        {[
          { to: '/admin/productos', label: 'Productos', icon: 'diamond', active: onProducts },
          { to: '/admin/productos/nuevo', label: 'Añadir producto', icon: 'add_circle', active: location.pathname.endsWith('/nuevo') },
          { to: '/admin/categorias', label: 'Categorías', icon: 'folder_special', active: location.pathname === '/admin/categorias' },
          { to: '/admin/ofertas', label: 'Ofertas y combos', icon: 'sell', active: location.pathname === '/admin/ofertas' },
          { to: '/admin/usuarios', label: 'Usuarios', icon: 'manage_accounts', active: location.pathname === '/admin/usuarios' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${item.active ? 'bg-primary/10 font-medium text-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-[21px]">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
