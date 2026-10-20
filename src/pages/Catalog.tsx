import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { useCart } from '../context/CartContext'
import { CATEGORIES, JEWELRY_CATEGORIES } from '../data/products'
import { buildCartItem } from '../lib/cart'
import { formatMoney, whatsappUrl } from '../lib/config'
import { useAsync } from '../lib/useAsync'
import { getActiveOffers, offerToProduct } from '../services/offerService'
import { getCategories, getProducts } from '../services/productService'
import type { CategoryInfo } from '../types'
import type { Product } from '../types'

const PAGE_SIZE = 6
const MAX_PRICE = 5000
const CATALOG_FILTERS = [
  { key: 'all', label: 'Todas', categories: [] as Product['category'][] },
  { key: 'oro', label: 'Oro', categories: ['cadenas', 'anillos', 'collares', 'pulseras'] as Product['category'][] },
  { key: 'relojes', label: 'Relojes', categories: ['relojes'] as Product['category'][] },
  { key: 'perfumeria', label: 'Perfumes', categories: ['perfumeria'] as Product['category'][] },
]
const SORTS = {
  exclusivos: 'Más exclusivos',
  recientes: 'Más recientes',
  'precio-desc': 'Precio: Mayor a Menor',
  'precio-asc': 'Precio: Menor a Mayor',
} as const
type SortKey = keyof typeof SORTS

const chipBase = 'px-3 py-1.5 rounded font-label-md text-label-md transition-colors'
const chipOn = 'bg-primary text-on-primary font-semibold'
const chipOff = 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'

const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const isCategoryId = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

function getCategoryLabel(product: Product, categories: CategoryInfo[] | null) {
  if (product.category === 'ofertas') return 'Oferta'
  const label = categories?.find((category) => category.key === product.category)?.label
    ?? CATEGORIES.find((category) => category.key === product.category)?.label
  if (label) return label
  return isCategoryId(product.categoryLabel) ? 'Categoría' : product.categoryLabel || product.category
}

function CatalogCard({ product, categoryLabel, wished, onWish }: { product: Product; categoryLabel: string; wished: boolean; onWish: () => void }) {
  const { addItem, showToast } = useCart()
  const [added, setAdded] = useState(false)
  const soldOut = product.stockCount === 0

  const add = () => {
    if (soldOut) return
    addItem(buildCartItem(product))
    showToast(`${product.title} agregada a su bolsa`)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  const cardBody = (
    <>
      <div className="relative w-full aspect-square bg-surface-container-lowest overflow-hidden">
        {product.category === 'ofertas' ? (
          <img
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={product.image}
          />
        ) : (
          <Link to={`/producto/${product.id}`}>
            <img
              alt={product.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={product.image}
            />
          </Link>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <span className="rounded-full border border-white/40 bg-black/70 px-3 py-1.5 font-label-caps text-[10px] font-semibold uppercase tracking-wider text-white">
              Agotado
            </span>
          </div>
        )}
        {product.badge && (
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full bg-secondary-container/90 text-on-secondary-container font-label-caps text-[9px] uppercase font-bold tracking-wider">
              {product.badge}
            </span>
          </div>
        )}
        <button
          aria-label="Guardar en lista de deseos"
          aria-pressed={wished}
          onClick={onWish}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-surface/70 backdrop-blur-sm flex items-center justify-center hover:text-primary transition-colors ${wished ? 'text-primary' : 'text-on-surface'}`}
        >
          <span className={`material-symbols-outlined text-[16px] ${wished ? 'filled' : ''}`}>favorite</span>
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
        {product.category === 'ofertas' ? (
          <div className="flex flex-col gap-1">
            <span className="font-label-caps text-[10px] uppercase text-outline tracking-wider truncate">{categoryLabel}</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-light leading-snug line-clamp-1">
              {product.name}
            </h2>
            <p className="line-clamp-2 font-technical-data text-[11px] text-on-surface-variant">{product.description}</p>
            {product.weight && <span className="font-technical-data text-[11px] text-secondary">Peso: {product.weight} g</span>}
          </div>
        ) : (
          <Link to={`/producto/${product.id}`} className="flex flex-col gap-1">
            <span className="font-label-caps text-[10px] uppercase text-outline tracking-wider truncate">{categoryLabel}</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-light leading-snug line-clamp-1">
              {product.name}
            </h2>
            <p className="line-clamp-2 font-technical-data text-[11px] text-on-surface-variant">{product.description}</p>
            {product.weight && <span className="font-technical-data text-[11px] text-secondary">Peso: {product.weight} g</span>}
          </Link>
        )}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              {product.oldPrice && <span className="block font-label-caps text-[9px] uppercase tracking-wider text-secondary">Oferta</span>}
              <span className="font-title-editorial text-title-editorial text-primary">{formatMoney(product.price)}</span>
              {product.oldPrice && <span className="ml-1.5 font-technical-data text-[10px] text-on-surface-variant line-through">{formatMoney(product.oldPrice)}</span>}
            </div>
            <span className="font-technical-data text-[10px] text-outline">USD</span>
          </div>
          <button
            disabled={soldOut}
            onClick={add}
            className={`w-full h-9 rounded-lg flex items-center justify-center gap-1.5 font-label-md text-label-md transition-all ${
              soldOut
                ? 'cursor-not-allowed bg-surface-container-high text-outline'
                : added
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{soldOut ? 'block' : added ? 'check' : 'shopping_bag'}</span>
            <span>{soldOut ? 'Agotado' : added ? 'Añadida' : 'Añadir'}</span>
          </button>
        </div>
      </div>
    </>
  )

  return (
    <article className="flex flex-col bg-surface-container-low rounded-xl overflow-hidden group hover:bg-surface-container transition-all duration-300">
      {cardBody}
    </article>
  )
}

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const { data: products, loading, error } = useAsync(async () => {
    const [catalogProducts, activeOffers] = await Promise.all([getProducts(), getActiveOffers()])
    return [...catalogProducts, ...activeOffers.map(offerToProduct)]
  }, [])
  const { data: categories } = useAsync(getCategories, [])
  const searchRef = useRef<HTMLInputElement>(null)

  const cat = params.get('cat') ?? 'all'
  const grupo = params.get('grupo')
  const sort = (params.get('orden') as SortKey) in SORTS ? (params.get('orden') as SortKey) : 'precio-asc'

  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const [wishes, setWishes] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ayg-wishlist') ?? '[]') as string[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (params.get('buscar')) searchRef.current?.focus()
  }, [params])

  useEffect(() => {
    localStorage.setItem('ayg-wishlist', JSON.stringify(wishes))
  }, [wishes])

  useEffect(() => setVisible(PAGE_SIZE), [cat, grupo, sort, query, maxPrice])

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    next.delete('buscar')
    if (value && value !== 'all') next.set(key, value)
    else next.delete(key)
    if (key === 'cat') next.delete('grupo')
    setParams(next, { replace: true })
  }

  const scoped = useMemo(
    () => (products ?? []).filter((p) => (grupo === 'joyas' ? JEWELRY_CATEGORIES.includes(p.category) : true)),
    [products, grupo],
  )

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    const list = scoped.filter((p) => {
      if (p.category === 'ofertas') return true
      const selectedFilter = CATALOG_FILTERS.find((filter) => filter.key === cat)
      if (selectedFilter && selectedFilter.key !== 'all' && !selectedFilter.categories.includes(p.category)) return false
      const catLabel = getCategoryLabel(p, categories)
      if (q && !normalize(`${p.name} ${p.title} ${p.categoryLabel} ${catLabel} ${p.material ?? ''} ${p.tagline}`).includes(q)) return false
      if (p.price > maxPrice && maxPrice < MAX_PRICE) return false
      return true
    })
    const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
      exclusivos: (a, b) => b.exclusivity - a.exclusivity,
      recientes: (a, b) => b.createdAt.localeCompare(a.createdAt),
      'precio-desc': (a, b) => b.price - a.price,
      'precio-asc': (a, b) => a.price - b.price,
    }
    const categoryOrder = CATEGORIES.filter((item) => item.key !== 'all').map((item) => item.key)
    return [...list].sort((a, b) => {
      const categoryDifference = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
      return categoryDifference || sorters[sort](a, b)
    })
  }, [scoped, categories, cat, query, maxPrice, sort])

  const activeFilters =
    (cat !== 'all' ? 1 : 0) + (maxPrice < MAX_PRICE ? 1 : 0)

  const resetFilters = () => {
    setParam('cat', 'all')
    setMaxPrice(MAX_PRICE)
  }

  const loadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisible((v) => v + PAGE_SIZE)
      setLoadingMore(false)
    }, 500)
  }

  const shown = filtered.slice(0, visible)

  return (
    <div className="flex flex-col w-full">
      <section className="relative px-4 pt-3 pb-4">
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em]">
              Colección Curada {new Date().getFullYear()}
            </span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-light tracking-tight">
            Piezas de <span className="italic text-primary font-normal">Alta Gama</span>
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
            Cadenas, alianzas y joyas de oro elaboradas en fábrica, además de relojería y perfumería.
          </p>
        </div>
      </section>

      <section className="sticky top-[84px] z-30 px-4 py-2.5 bg-surface/95 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-[19px]">search</span>
            </div>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-8 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg placeholder:text-outline/70 focus:outline-none focus:bg-surface-container transition-all"
              placeholder="Buscar anillos, oro 18K, cadenas, perfumes..."
              type="text"
            />
            {query && (
              <button
                aria-label="Limpiar búsqueda"
                onClick={() => {
                  setQuery('')
                  searchRef.current?.focus()
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[17px]">close</span>
              </button>
            )}
          </div>
          <button
            aria-label="Abrir filtros de joyería y perfumería"
            onClick={() => setShowFilters((s) => !s)}
            className={`h-11 px-3.5 flex items-center gap-1.5 hover:bg-surface-container text-on-surface rounded-lg transition-all active:scale-95 ${showFilters ? 'bg-surface-container text-primary' : 'bg-surface-container-low'}`}
          >
            <span className="material-symbols-outlined text-[19px] text-primary">tune</span>
            <span className="font-label-md text-label-md">Filtros</span>
            {activeFilters > 0 && (
              <span className="w-4 h-4 ml-0.5 rounded-full bg-primary text-on-primary font-technical-data text-[10px] font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 -mx-4 px-4 scroll-smooth">
          {CATALOG_FILTERS.map((c) => {
            const active = cat === c.key
            return (
              <button
                key={c.key}
                onClick={() => setParam('cat', c.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-label-caps text-label-caps uppercase transition-colors ${
                  active
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {c.label}
                {c.key === 'all' ? ` (${scoped.length})` : ` (${scoped.filter((product) => c.categories.includes(product.category)).length})`}
              </button>
            )
          })}
        </div>
      </section>

      {showFilters && (
        <section className="flex flex-col px-4 py-4 bg-surface-container-lowest">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">category</span>
              <span className="font-title-editorial text-title-editorial text-on-surface">Filtrar productos</span>
            </div>
            <button
              onClick={resetFilters}
              className="font-label-caps text-label-caps text-primary hover:text-primary-fixed uppercase tracking-wider"
            >
              Restablecer
            </button>
          </div>
          <div className="flex flex-col gap-2 py-2">
            <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Tipo de producto</span>
            <div className="flex flex-wrap gap-2">
              {CATALOG_FILTERS.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setParam('cat', category.key)}
                  className={`${chipBase} ${cat === category.key ? chipOn : chipOff}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 py-2">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Rango Presupuestario</span>
              <span className="font-technical-data text-technical-data text-primary font-medium">
                {maxPrice >= MAX_PRICE ? 'Sin límite' : `Hasta ${formatMoney(maxPrice)} USD`}
              </span>
            </div>
            <input
              type="range"
              min={200}
              max={MAX_PRICE}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-label="Precio máximo"
              className="w-full accent-primary"
            />
            <div className="flex justify-between font-technical-data text-[10px] text-outline">
              <span>$200</span>
              <span>$1,500</span>
              <span>$3,000</span>
              <span>$5,000+</span>
            </div>
          </div>
        </section>
      )}

      <section className="flex items-center justify-between px-4 py-3 bg-surface">
        <div className="flex items-center gap-1.5">
          <span className="font-technical-data text-technical-data text-on-surface-variant">Mostrando</span>
          <span className="font-technical-data text-technical-data text-primary font-semibold">{shown.length}</span>
          <span className="font-technical-data text-technical-data text-on-surface-variant">de {filtered.length} piezas</span>
        </div>
        <div className="relative flex items-center">
          <label className="sr-only" htmlFor="catalog-sort">Ordenar piezas por</label>
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-container-low rounded text-on-surface text-body-sm font-body-sm">
            <span className="material-symbols-outlined text-[17px] text-primary">sort</span>
            <select
              id="catalog-sort"
              value={sort}
              onChange={(e) => setParam('orden', e.target.value)}
              className="bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none cursor-pointer pr-1"
            >
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value} className="bg-surface-container text-on-surface">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-1 md:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-surface-container-low animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="flex flex-col items-center text-center gap-2 py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] text-outline">cloud_off</span>
            <p className="font-title-editorial text-title-editorial text-on-surface">No pudimos cargar el catálogo</p>
            <p className="font-body-sm text-body-sm">{error.message}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-2 py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] text-outline">search_off</span>
            <p className="font-title-editorial text-title-editorial text-on-surface">Sin resultados</p>
            <p className="font-body-sm text-body-sm">Ajuste los filtros o consulte a nuestro Concierge.</p>
            <button
              onClick={() => {
                resetFilters()
                setQuery('')
                setParam('cat', null)
              }}
              className="mt-2 font-label-caps text-label-caps text-primary uppercase tracking-wider"
            >
              Limpiar todo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 md:gap-5">
            {shown.map((p) => (
              <CatalogCard
                key={p.id}
                product={p}
                categoryLabel={getCategoryLabel(p, categories)}
                wished={wishes.includes(p.id)}
                onWish={() =>
                  setWishes((w) => (w.includes(p.id) ? w.filter((id) => id !== p.id) : [...w, p.id]))
                }
              />
            ))}
          </div>
        )}
      </section>

      {filtered.length > shown.length && (
        <section className="flex flex-col items-center gap-3 px-4 py-8">
          <span className="font-technical-data text-technical-data text-on-surface-variant">
            Mostrando {shown.length} de {filtered.length} piezas exclusivas
          </span>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 h-11 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors"
          >
            {loadingMore ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
                <span>Consultando Bóveda...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-primary text-[18px]">cached</span>
                <span>Cargar más piezas</span>
              </>
            )}
          </button>
        </section>
      )}

      <section className="px-4 py-6">
        <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-editorial text-[15px] text-on-surface">¿Busca una pieza en particular?</span>
              <span className="font-body-sm text-[12px] text-on-surface-variant">
                Escríbenos por WhatsApp y te ayudamos a encontrarla
              </span>
            </div>
          </div>
          <a
            aria-label="Contactar al Concierge Privado"
            href={whatsappUrl('Hola Altezza, busco una pieza particular.')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-fixed transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
