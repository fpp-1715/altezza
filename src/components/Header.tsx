import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { MenuDrawer } from './MenuDrawer'

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
      <header className="fixed top-0 inset-x-0 mx-auto max-w-[480px] z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_0_0_rgba(198,164,91,0.2)]">
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            aria-label="Menu Principal"
            onClick={() => setMenuOpen(true)}
            className="w-11 h-11 flex items-center justify-center text-primary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-surface-container-high ring-1 ring-primary/40 flex items-center justify-center font-title-editorial text-[10px] font-bold text-primary tracking-wider">
              A&amp;G
            </span>
            <div className="flex flex-col items-center">
              <span className="font-title-editorial text-title-editorial tracking-[0.2em] text-primary uppercase leading-tight">
                A&amp;G
              </span>
              <span className="font-label-caps text-[9px] uppercase tracking-[0.28em] text-on-surface-variant font-medium">
                Haute Parfumerie
              </span>
            </div>
          </Link>
          <div className="flex items-center">
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
        <div className="h-6 px-4 flex items-center justify-center -mt-1 pb-1">
          <span className="font-label-caps text-label-caps tracking-[0.22em] text-secondary uppercase opacity-85">
            {TITLES[pathname] ?? ''}
          </span>
        </div>
      </header>
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
