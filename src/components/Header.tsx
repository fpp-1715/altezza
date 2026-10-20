import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { MenuDrawer } from './MenuDrawer'
import { BRAND } from '../lib/config'

const TITLES: Record<string, string> = {
  '/': 'Inicio',
  '/catalogo': 'Catálogo',
  '/bolsa': 'Bolsa',
}

export function Header() {
  const { count } = useCart()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(198,164,91,0.2)]">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:h-20 md:px-8">
          <button
            aria-label="Menu Principal"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center text-primary transition-colors hover:text-on-surface md:hidden"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-surface-container-high ring-1 ring-primary/40 flex items-center justify-center font-title-editorial text-[10px] font-bold text-primary tracking-wider">
              AL
            </span>
            <div className="flex flex-col items-center">
              <span className="font-title-editorial text-title-editorial tracking-[0.2em] text-primary uppercase leading-tight">
                {BRAND.name}
              </span>
              {BRAND.tagline ? (
                <span className="font-label-caps text-[9px] uppercase tracking-[0.28em] text-on-surface-variant font-medium">
                  {BRAND.tagline}
                </span>
              ) : null}
            </div>
          </Link>
          <nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">
            <Link to="/" className="font-label-caps text-[11px] uppercase tracking-[0.16em] text-on-surface-variant transition-colors hover:text-primary">Inicio</Link>
            <Link to="/catalogo" className="font-label-caps text-[11px] uppercase tracking-[0.16em] text-on-surface-variant transition-colors hover:text-primary">Catálogo</Link>
            <Link to="/catalogo?grupo=joyas" className="font-label-caps text-[11px] uppercase tracking-[0.16em] text-on-surface-variant transition-colors hover:text-primary">Joyas</Link>
            <a href="https://wa.me/5353765926" target="_blank" rel="noopener noreferrer" className="font-label-caps text-[11px] uppercase tracking-[0.16em] text-on-surface-variant transition-colors hover:text-primary">WhatsApp</a>
          </nav>
          <div className="flex items-center">
            <Link
              to="/admin"
              className="mr-2 hidden min-h-10 items-center gap-2 rounded-lg border border-primary/40 px-4 font-label-caps text-[11px] uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-on-primary md:flex"
            >
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              Administrar
            </Link>
            <button
              aria-label="Buscar"
              onClick={() => navigate('/catalogo?buscar=1')}
              className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
            <Link
              aria-label="Bolsa de Compras"
              to="/bolsa"
              className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-primary relative transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">local_mall</span>
              {count > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-on-primary font-technical-data text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(230,194,118,0.5)]">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="flex h-6 items-center justify-center px-4 pb-1 -mt-1 md:hidden">
          <span className="font-label-caps text-label-caps tracking-[0.22em] text-secondary uppercase opacity-85">
            {TITLES[pathname] ?? ''}
          </span>
        </div>
      </header>
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
