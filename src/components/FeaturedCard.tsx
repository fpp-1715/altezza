import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { buildCartItem } from '../lib/cart'
import { formatMoney } from '../lib/config'
import type { Product } from '../types'

export function FeaturedCard({ product }: { product: Product }) {
  const { addItem, showToast } = useCart()

  const quickAdd = () => {
    addItem(buildCartItem(product))
    showToast(`${product.name} agregada a su bolsa`)
  }

  return (
    <article className="bg-surface-container rounded-xl overflow-hidden flex flex-col justify-between shadow-sm group">
      <div className="relative w-full aspect-square bg-surface-container-lowest overflow-hidden">
        <Link to={`/producto/${product.id}`} aria-label={product.name}>
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${product.image}')` }}
          />
        </Link>
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded-full pointer-events-none">
            <span className="font-label-caps text-[9px] text-primary uppercase font-bold tracking-wider">
              {product.badge}
            </span>
          </div>
        )}
        <button
          aria-label="Añadir a la bolsa"
          onClick={quickAdd}
          type="button"
          className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-container-highest/90 backdrop-blur-md text-on-surface flex items-center justify-center hover:bg-primary hover:text-on-primary active:scale-90 transition-all duration-200 shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
      <Link to={`/producto/${product.id}`} className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
            {product.categoryLabel}
          </span>
          <h3 className="font-title-editorial text-[15px] leading-snug text-on-surface line-clamp-2 mb-1.5 font-medium">
            {product.name}
          </h3>
          <p className="font-technical-data text-[11px] text-on-surface-variant/80 mb-2">{product.tagline}</p>
        </div>
        <div className="pt-2 flex items-baseline justify-between bg-surface-container-low/50 -mx-3.5 -mb-3.5 px-3.5 py-2.5">
          <span className="font-headline-sm text-[16px] text-primary font-semibold">
            {formatMoney(product.price)}{' '}
            <span className="font-technical-data text-[10px] font-normal text-on-surface-variant">USD</span>
          </span>
          <span className="font-technical-data text-[10px] text-secondary">{product.detailLabel}</span>
        </div>
      </Link>
    </article>
  )
}
