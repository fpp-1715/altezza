import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { whatsappUrl } from '../lib/config'

const itemClass = (active: boolean) =>
  `flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all duration-200 ${
    active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
  }`

const labelClass = 'font-label-caps text-[10px] uppercase tracking-wider'

export function BottomNav() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const isJoyas = pathname === '/catalogo' && params.get('grupo') === 'joyas'
  const isCatalog = pathname === '/catalogo' && !isJoyas

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-[480px] z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_0_0_rgba(198,164,91,0.2)]">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        <Link to="/" className={itemClass(pathname === '/')}>
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className={labelClass}>Inicio</span>
        </Link>
        <Link to="/catalogo" className={itemClass(isCatalog)}>
          <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
          <span className={labelClass}>Catálogo</span>
        </Link>
        <Link to="/catalogo?grupo=joyas" className={itemClass(isJoyas)}>
          <span className="material-symbols-outlined text-[22px]">diamond</span>
          <span className={labelClass}>Joyas</span>
        </Link>
        <a
          href={whatsappUrl('Hola Altezza, deseo atención personalizada.')}
          target="_blank"
          rel="noopener noreferrer"
          className={`${itemClass(false)} hover:text-tertiary`}
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">chat</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary ring-1 ring-surface" />
          </div>
          <span className={labelClass}>WhatsApp</span>
        </a>
        <Link to="/bolsa" className={itemClass(pathname === '/bolsa')}>
          <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
          <span className={labelClass}>Bolsa</span>
        </Link>
      </div>
    </nav>
  )
}
