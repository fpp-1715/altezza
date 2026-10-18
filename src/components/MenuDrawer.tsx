import { Link } from 'react-router-dom'
import { useState } from 'react'
import { whatsappUrl } from '../lib/config'
import AdminLoginModal from './AdminLoginModal'
import { useAdminAuth } from '../context/AdminAuthContext'

const LINKS = [
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/catalogo', label: 'Catálogo', icon: 'auto_awesome' },
  { to: '/catalogo?grupo=joyas', label: 'Joyas & Alianzas', icon: 'diamond' },
  { to: '/catalogo?cat=relojes', label: 'Relojería', icon: 'watch' },
  { to: '/catalogo?cat=perfumeria', label: 'Perfumería', icon: 'water_drop' },
  { to: '/bolsa', label: 'Bolsa de Compras', icon: 'shopping_bag' },
]

export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-y-0 inset-x-0 mx-auto max-w-[480px] overflow-hidden pointer-events-none">
        <aside
          className={`pointer-events-auto absolute inset-y-0 left-0 w-72 bg-surface-container-lowest shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="h-16 px-5 flex items-center justify-between">
            <span className="font-title-editorial text-title-editorial tracking-[0.2em] text-primary uppercase">
              Altezza
            </span>
            <button
              aria-label="Cerrar menú"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="flex flex-col px-3 gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-[22px]">{l.icon}</span>
                <span className="font-label-md text-label-md">{l.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-5">
            <button
              onClick={onClose}
              className="w-full h-11 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 mb-2"
            >
              <span className="material-symbols-outlined text-[20px]">info</span>
              Acerca de
            </button>

            {/* Administrador — abre modal de login */}
            <AdminLoginTrigger />

            <a
              href={whatsappUrl('Hola Altezza, deseo atención personalizada.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold uppercase tracking-wider flex items-center justify-center gap-2 mt-3"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              Concierge
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}

function AdminLoginTrigger() {
  const [open, setOpen] = useState(false)
  const { user: adminUser, loading, login, logout } = useAdminAuth()

  return (
    <>
      {adminUser ? (
        <div className="flex flex-col gap-2">
          <Link
            to="/admin"
            className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(230,194,118,0.25)]"
          >
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            <span>Panel de Administrador</span>
          </Link>
          <button
            onClick={() => {
              void logout().catch((error: unknown) => {
                console.error('No se pudo cerrar la sesión:', error)
              })
              setOpen(false)
            }}
            className="w-full h-10 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-error font-technical-data text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Cerrar sesión ({adminUser})</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-full h-11 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">
            admin_panel_settings
          </span>
          <span>Acceso Administrador</span>
        </button>
      )}
      <AdminLoginModal open={open} onClose={() => setOpen(false)} onLogin={login} disabled={loading} />
    </>
  )
}
