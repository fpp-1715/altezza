import { useEffect, useMemo, useState } from 'react'
import { formatMoney } from '../lib/config'
import { getCategories, getProducts, uploadProductImage } from '../services/productService'
import { createOffer, deleteOffer, getOfferProductNames, getOffers, setOfferStatus, updateOffer } from '../services/offerService'
import type { OfferRecord } from '../services/offerService'
import type { CategoryInfo } from '../types'
import type { Product } from '../types'

type OfferForm = {
  name: string
  subtitle: string
  description: string
  discount_label: string
  original_price: number
  offer_price: number
  image_url: string | null
  status: 'active' | 'paused'
}

const emptyOffer: OfferForm = {
  name: '',
  subtitle: '',
  description: '',
  discount_label: '',
  original_price: 0,
  offer_price: 0,
  image_url: null,
  status: 'paused',
}

export default function AdminOfertas() {
  const [offers, setOffers] = useState<OfferRecord[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [form, setForm] = useState(emptyOffer)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectorQuery, setSelectorQuery] = useState('')
  const [selectorCategory, setSelectorCategory] = useState<'all' | string>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectorOptions = useMemo(
    () => [{ key: 'all', label: 'Todas' }, ...categories.filter((category) => category.key !== 'all')],
    [categories],
  )

  const filteredSelectorProducts = useMemo(() => {
    const term = selectorQuery.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = selectorCategory === 'all' || product.category === selectorCategory
      const matchesQuery = !term || `${product.name} ${product.title} ${product.categoryLabel}`.toLowerCase().includes(term)
      return matchesCategory && matchesQuery
    })
  }, [products, selectorCategory, selectorQuery])

  const originalPriceTotal = useMemo(
    () => selectedProducts.reduce((total, productId) => {
      const product = products.find((item) => item.id === productId)
      if (!product) return total
      return total + (product.oldPrice != null && product.oldPrice > product.price ? product.oldPrice : product.price)
    }, 0),
    [products, selectedProducts],
  )

  const resetForm = () => {
    setForm(emptyOffer)
    setImageFile(null)
    setImagePreview('')
    setSelectedProducts([])
    setEditingId(null)
    setSelectorOpen(false)
    setSelectorQuery('')
    setSelectorCategory('all')
  }

  const openCreateForm = () => {
    resetForm()
    setCreating(true)
  }

  const openEditForm = (offer: OfferRecord) => {
    setForm({
      name: offer.name,
      subtitle: offer.subtitle,
      description: offer.description,
      discount_label: offer.discount_label,
      original_price: offer.original_price,
      offer_price: offer.offer_price,
      image_url: offer.image_url,
      status: offer.status,
    })
    setSelectedProducts(offer.product_ids)
    setImageFile(null)
    setImagePreview(offer.image_url ?? '')
    setEditingId(offer.id)
    setCreating(true)
    setSelectorOpen(false)
    setSelectorQuery('')
    setSelectorCategory('all')
  }

  const reload = async () => {
    setLoading(true)
    try {
      const [offerRows, productRows, categoryRows] = await Promise.all([getOffers(), getProducts(), getCategories()])
      setOffers(offerRows)
      setProducts(productRows)
      setCategories(categoryRows)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las ofertas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Altezza Admin — Ofertas y combos'
    void reload()
  }, [])

  useEffect(() => {
    if (!imageFile) {
      setImagePreview((current) => current)
      return
    }
    const previewUrl = URL.createObjectURL(imageFile)
    setImagePreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [imageFile])

  const toggleStatus = async (offer: OfferRecord) => {
    setError('')
    try {
      const status = offer.status === 'active' ? 'paused' : 'active'
      await setOfferStatus(offer.id, status)
      setOffers((current) => current.map((item) => item.id === offer.id ? { ...item, status } : item))
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'No se pudo actualizar el estado.')
    }
  }

  const toggleSelectedProduct = (productId: string) => {
    setSelectedProducts((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId])
  }

  const removeOffer = async (offer: OfferRecord) => {
    const confirmed = window.confirm(`¿Seguro que quieres eliminar el combo "${offer.name}"?`)
    if (!confirmed) return
    setError('')
    try {
      await deleteOffer(offer.id)
      setOffers((current) => current.filter((item) => item.id !== offer.id))
      if (editingId === offer.id) {
        setCreating(false)
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el combo.')
    }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (selectedProducts.length < 2) {
        throw new Error('Selecciona al menos dos productos para crear un combo.')
      }

      const imageUrl = imageFile ? await uploadProductImage(imageFile) : form.image_url ?? null
      const payload = { ...form, original_price: originalPriceTotal, image_url: imageUrl }

      if (editingId) {
        await updateOffer(editingId, payload, selectedProducts)
      } else {
        await createOffer(payload, selectedProducts)
      }

      setCreating(false)
      resetForm()
      await reload()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el combo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 px-4 py-4 md:px-0 md:py-8">
      <header className="flex items-end justify-between gap-3">
        <div>
          <span className="mb-1 block font-label-caps text-[10px] uppercase tracking-widest text-secondary">Campañas de temporada</span>
          <h1 className="font-headline-lg-mobile text-[28px] leading-9 text-on-surface">Ofertas &amp; Combos</h1>
        </div>
        <button onClick={() => (creating ? setCreating(false) : openCreateForm())} className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary">
          <span className="material-symbols-outlined text-[18px]">{creating ? 'close' : 'add'}</span>{creating ? 'Cerrar' : 'Crear combo'}
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl border border-error/40 bg-error-container/20 p-3 text-sm text-error">{error}</p>}

      {creating && (
        <form onSubmit={submit} className="space-y-3 rounded-xl bg-surface-container p-4">
          <h2 className="font-title-editorial text-lg text-on-surface">{editingId ? 'Editar combo' : 'Nuevo combo'}</h2>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectorOpen(true)}
              className="flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 text-left text-primary transition-colors hover:bg-primary/15"
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[26px]">add_shopping_cart</span>
                <span>
                  <span className="block font-semibold">Seleccionar productos</span>
                  <span className="mt-0.5 block text-xs text-on-surface-variant">Añade todos los productos que incluirá el combo</span>
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-on-primary">
                {selectedProducts.length}
              </span>
            </button>
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedProducts.map((selectedId) => {
                  const product = products.find((item) => item.id === selectedId)
                  if (!product) return null
                  return (
                    <button key={selectedId} type="button" onClick={() => toggleSelectedProduct(selectedId)} className="rounded-full border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs text-on-surface">
                      {product.name} ×
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del combo" className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface placeholder:text-outline" />
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtítulo (opcional)" className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface placeholder:text-outline" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalles de la oferta" rows={3} className="w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface placeholder:text-outline" />
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs text-on-surface-variant">Precio original
              <input readOnly type="number" value={originalPriceTotal} className="min-h-11 w-full cursor-not-allowed rounded-lg bg-surface-container-lowest px-3 text-base text-on-surface" />
            </label>
            <label className="space-y-1 text-xs text-on-surface-variant">Precio del combo
              <input required type="number" min="0" step="0.01" value={form.offer_price} onChange={(e) => setForm({ ...form, offer_price: Number(e.target.value) })} className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-base text-on-surface" />
            </label>
          </div>
          <input value={form.discount_label} onChange={(e) => setForm({ ...form, discount_label: e.target.value })} placeholder="Etiqueta del descuento (opcional)" className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface placeholder:text-outline" />
          <label className="block space-y-1 text-xs text-on-surface-variant">Foto del combo (opcional)
            <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="block min-h-11 w-full rounded-lg bg-surface-container-lowest text-sm text-on-surface file:mr-3 file:min-h-11 file:border-0 file:bg-primary file:px-3 file:font-medium file:text-on-primary" />
          </label>
          {imagePreview && <img src={imagePreview} alt="Vista previa de la foto del combo" className="aspect-[16/9] w-full rounded-lg object-cover" />}

          {selectorOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-4xl rounded-2xl bg-surface-container p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="font-title-editorial text-base text-on-surface">Selecciona los productos del combo</h3>
                  <button type="button" onClick={() => setSelectorOpen(false)} className="rounded-lg bg-surface-container-high px-3 py-2 text-sm font-medium text-on-surface">Cerrar</button>
                </div>

                <div className="mb-3 flex flex-col gap-3">
                  <input
                    value={selectorQuery}
                    onChange={(e) => setSelectorQuery(e.target.value)}
                    placeholder="Buscar por nombre o categoría"
                    className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface placeholder:text-outline"
                  />
                  <div className="flex flex-wrap gap-2">
                    {selectorOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setSelectorCategory(option.key)}
                        className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wide ${selectorCategory === option.key ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
                  {filteredSelectorProducts.map((product) => {
                    const selected = selectedProducts.includes(product.id)
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleSelectedProduct(product.id)}
                        className={`overflow-hidden rounded-xl border text-left transition-all ${selected ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface-container-low'}`}
                      >
                        <div className="relative">
                          <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
                          {selected && <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-[9px] font-bold uppercase text-on-primary">Seleccionado</span>}
                        </div>
                        <div className="space-y-1 p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-primary">{product.categoryLabel}</span>
                            <span className="text-[10px] text-on-surface-variant">{formatMoney(product.price)}</span>
                          </div>
                          <p className="line-clamp-2 text-sm text-on-surface">{product.name}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm text-on-surface-variant">{selectedProducts.length} productos seleccionados</span>
                  <button type="button" onClick={() => setSelectorOpen(false)} className="min-h-11 rounded-lg bg-primary px-4 font-medium text-on-primary">Listo</button>
                </div>
              </div>
            </div>
          )}

          <button disabled={saving} type="submit" className="min-h-12 w-full rounded-lg bg-primary font-semibold text-on-primary disabled:opacity-60">{saving ? 'Guardando…' : editingId ? 'Actualizar combo' : 'Guardar combo'}</button>
        </form>
      )}

      {loading ? <p className="rounded-xl bg-surface-container p-8 text-center text-on-surface-variant">Cargando ofertas…</p> : offers.length === 0 ? (
        <p className="rounded-xl bg-surface-container p-8 text-center text-on-surface-variant">No hay ofertas guardadas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {offers.map((offer) => (
        <article key={offer.id} className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low shadow-lg">
          {offer.image_url && <img src={offer.image_url} alt="" className="aspect-[16/9] w-full object-cover" />}
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-title-editorial text-base font-semibold text-on-surface">{offer.name}</h2>
              <span className={`shrink-0 rounded-full px-2.5 py-1 font-label-caps text-[9px] uppercase ${offer.status === 'active' ? 'bg-tertiary-container/80 text-on-tertiary-container' : 'bg-surface-container-high text-outline'}`}>{offer.status === 'active' ? 'Activa' : 'Pausada'}</span>
            </div>
            {offer.subtitle && <p className="text-sm text-on-surface-variant">{offer.subtitle}</p>}
            {offer.description && <p className="text-sm text-on-surface-variant">{offer.description}</p>}
            <div className="space-y-1 rounded-lg bg-surface-container p-3">
              <span className="font-label-caps text-[9px] uppercase tracking-wider text-outline">Productos incluidos</span>
              {getOfferProductNames(offer, products).map((name) => <p key={name} className="text-sm text-on-surface">{name}</p>)}
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-headline-sm text-xl font-bold text-primary">{formatMoney(offer.offer_price)} USD</span>
              <span className="text-xs text-outline line-through">{formatMoney(offer.original_price)} USD</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => void toggleStatus(offer)} className="min-h-11 rounded-lg bg-surface-container-high text-sm font-medium text-primary">
                {offer.status === 'active' ? 'Pausar' : 'Activar'}
              </button>
              <button onClick={() => openEditForm(offer)} className="min-h-11 rounded-lg bg-surface-container-high text-sm font-medium text-on-surface">
                Editar
              </button>
              <button onClick={() => void removeOffer(offer)} className="col-span-2 min-h-11 rounded-lg border border-error/40 bg-error-container/10 text-sm font-medium text-error">
                Eliminar combo
              </button>
            </div>
          </div>
        </article>
        ))}
        </div>
      )}
    </div>
  )
}
