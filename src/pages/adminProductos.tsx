import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, getAdminProducts, updateProduct } from '../services/productService'
import { formatMoney } from '../lib/config'
import type { CategoryKey, Product } from '../types'

const FILTERS: { key: CategoryKey | 'all'; label: string; includes: CategoryKey[] }[] = [
  { key: 'all', label: 'Todos', includes: [] },
  { key: 'anillos', label: 'Joyería', includes: ['anillos', 'cadenas', 'collares', 'pulseras'] },
  { key: 'relojes', label: 'Relojes', includes: ['relojes'] },
  { key: 'perfumeria', label: 'Perfumería', includes: ['perfumeria'] },
]

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryKey | 'all'>('all')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadProducts = () => {
    setLoading(true)
    getAdminProducts()
      .then(setProducts)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el catálogo.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    document.title = 'Altezza Admin — Productos'
    loadProducts()
  }, [])

  const filtered = useMemo(() => products.filter((product) => {
    const term = search.trim().toLocaleLowerCase()
    const matchesSearch = !term || [product.name, product.sku, product.description]
      .some((value) => value?.toLocaleLowerCase().includes(term))
    const selected = FILTERS.find((item) => item.key === category)
    const matchesCategory = category === 'all' || Boolean(selected?.includes.includes(product.category))
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    const categoryOrder = ['cadenas', 'anillos', 'collares', 'pulseras', 'relojes', 'perfumeria']
    return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.price - b.price
  }), [products, search, category])

  const setProductState = async (product: Product, state: 'sold' | 'visible' | 'hidden') => {
    setError('')
    try {
      const changes = state === 'sold'
        ? { active: true, stockCount: 0 }
        : state === 'hidden'
          ? { active: false }
          : { active: true, stockCount: 1 }
      const updated = await updateProduct(product.id, changes)
      if (!updated) throw new Error('El producto no se encontró en la base de datos.')
      setProducts((current) => current.map((item) => item.id === product.id ? updated : item))
      setNotice(state === 'sold' ? `${product.name} marcado como vendido.` : state === 'hidden' ? `${product.name} ya no se muestra en el catálogo.` : `${product.name} está visible y disponible en el catálogo.`)
      window.setTimeout(() => setNotice(''), 3000)
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'No se pudo cambiar el estado del producto.')
    }
  }

  const remove = async (product: Product) => {
    if (!window.confirm(`¿Eliminar "${product.name}" del catálogo? Esta acción no se puede deshacer.`)) return
    try {
      const deleted = await deleteProduct(product.id)
      if (!deleted) throw new Error('El producto ya no está disponible.')
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setNotice(`${product.name} se eliminó del catálogo.`)
      window.setTimeout(() => setNotice(''), 3000)
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'No se pudo eliminar el producto.')
    }
  }

  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 px-4 py-4 md:px-0 md:py-8">
      <div className="flex items-end justify-between gap-2">
        <div>
          <span className="mb-1 block font-label-caps text-[10px] uppercase tracking-widest text-primary">Inventario</span>
          <h1 className="font-headline-lg-mobile text-[28px] leading-9 text-on-surface">Catálogo de Productos</h1>
        </div>
        <span className="shrink-0 rounded-full bg-surface-container-high px-3 py-1 font-technical-data text-[11px] text-tertiary">
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <Link to="/admin/productos/nuevo" className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-label-md font-semibold text-on-primary shadow-lg shadow-primary/15 transition-transform active:scale-[0.98]">
        <span className="material-symbols-outlined text-[24px]">add_circle</span>
        <span>Añadir Nuevo Producto</span>
      </Link>

      <div className="space-y-3">
        <label className="relative flex items-center">
          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-outline">search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-12 w-full rounded-xl bg-surface-container pl-11 pr-4 text-base text-on-surface placeholder:text-outline focus:bg-surface-container-high focus:outline-none" placeholder="Buscar por nombre o detalles..." />
        </label>
        <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
          {FILTERS.map((filter) => {
            const count = filter.key === 'all' ? products.length : products.filter((product) => filter.includes.includes(product.category)).length
            const active = category === filter.key
            return (
              <button key={filter.key} onClick={() => setCategory(filter.key)} className={`shrink-0 rounded-full px-4 py-2 font-label-caps text-[11px] transition-colors ${active ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`}>
                {filter.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-error/40 bg-error-container/20 p-3 text-sm text-error">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-tertiary/10 p-3 text-sm text-tertiary">{notice}</p>}
      <p className="font-technical-data text-[11px] text-outline">Mostrando {filtered.length} de {products.length} productos</p>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
        {loading ? (
          <div className="rounded-xl bg-surface-container p-8 text-center text-on-surface-variant">Cargando catálogo…</div>
        ) : filtered.map((product) => (
          <article key={product.id} className={`flex flex-col gap-3 rounded-xl bg-surface-container p-3 shadow-md ${product.active === false || product.stockCount === 0 ? 'opacity-75' : ''}`}>
            <div className="flex min-w-0 gap-3">
              <img src={product.image} alt={product.name} className="h-20 w-20 shrink-0 rounded-lg bg-surface-container-lowest object-cover" />
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate font-label-caps text-[10px] uppercase text-outline">{product.categoryLabel || product.category}</span>
                    {product.featured && <span className="material-symbols-outlined text-[16px] text-primary" aria-label="Destacado">star</span>}
                  </div>
                  <h2 className="mt-0.5 truncate font-title-editorial text-[16px] text-on-surface">{product.name}</h2>
                  {(product.active === false || product.stockCount === 0) && <p className="mt-1 text-xs font-semibold text-secondary">{product.active === false ? 'No visible' : 'Vendido'}</p>}
                  <p className="mt-0.5 line-clamp-2 font-body-sm text-[12px] text-on-surface-variant">{product.description}</p>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <div>
                    {product.oldPrice && <span className="block font-label-caps text-[9px] uppercase tracking-wider text-secondary">Oferta</span>}
                    <span className="font-headline-sm text-[19px] font-semibold text-primary">{formatMoney(product.price)} <span className="font-technical-data text-[10px] font-normal text-outline">USD</span></span>
                    {product.oldPrice && <span className="ml-1.5 font-technical-data text-[10px] text-on-surface-variant line-through">{formatMoney(product.oldPrice)}</span>}
                  </div>
                  {product.weight && <span className="shrink-0 font-technical-data text-[10px] text-on-surface-variant">Peso: {product.weight} g</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-outline-variant/10 pt-2">
              {product.stockCount === 0 ? (
                <button onClick={() => void setProductState(product, 'visible')} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-tertiary/10 font-label-md text-[13px] text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">inventory</span>Marcar disponible
                </button>
              ) : product.active === false ? (
                <button onClick={() => void setProductState(product, 'visible')} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-tertiary/10 font-label-md text-[13px] text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>Hacer visible
                </button>
              ) : (
                <>
                  <button onClick={() => void setProductState(product, 'sold')} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-container-highest font-label-md text-[13px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">sell</span>Vendido
                  </button>
                  <button onClick={() => void setProductState(product, 'hidden')} className="flex h-10 w-11 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant" aria-label={`Ocultar ${product.name}`}>
                    <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                  </button>
                </>
              )}
              <Link to={`/admin/productos/${product.id}`} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-container-highest font-label-md text-[13px] text-on-surface active:bg-surface-bright">
                <span className="material-symbols-outlined text-[18px] text-primary">edit</span>Editar
              </Link>
              <button onClick={() => void remove(product)} aria-label={`Eliminar ${product.name}`} className="flex h-10 w-12 items-center justify-center rounded-lg bg-surface-container-highest text-error active:bg-error-container/40">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </article>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="rounded-xl bg-surface-container p-8 text-center text-on-surface-variant">
            {search ? 'No se encontraron productos con esa búsqueda.' : 'Todavía no hay productos en esta categoría.'}
          </div>
        )}
      </div>
    </div>
  )
}
