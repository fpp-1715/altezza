import { useEffect, useState } from 'react'
import { formatMoney } from '../lib/config'
import { getProducts } from '../services/productService'
import { uploadProductImage } from '../services/productService'
import { createOffer, getOfferProductNames, getOffers, setOfferStatus } from '../services/offerService'
import type { OfferRecord } from '../services/offerService'
import type { Product } from '../types'

const emptyOffer = {
  name: '',
  subtitle: '',
  description: '',
  discount_label: '',
  original_price: 0,
  offer_price: 0,
  image_url: null as string | null,
  status: 'paused' as const,
}

export default function AdminOfertas() {
  const [offers, setOffers] = useState<OfferRecord[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(emptyOffer)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reload = async () => {
    setLoading(true)
    try {
      const [offerRows, productRows] = await Promise.all([getOffers(), getProducts()])
      setOffers(offerRows)
      setProducts(productRows)
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
      setImagePreview('')
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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const imageUrl = imageFile ? await uploadProductImage(imageFile) : null
      await createOffer({ ...form, image_url: imageUrl }, selectedProducts)
      setForm(emptyOffer)
      setImageFile(null)
      setSelectedProducts([])
      setCreating(false)
      await reload()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'No se pudo crear el combo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <span className="mb-1 block font-label-caps text-[10px] uppercase tracking-widest text-secondary">Campañas de temporada</span>
          <h1 className="font-headline-lg-mobile text-[28px] leading-9 text-on-surface">Ofertas &amp; Combos</h1>
        </div>
        <button onClick={() => setCreating((current) => !current)} className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary">
          <span className="material-symbols-outlined text-[18px]">{creating ? 'close' : 'add'}</span>{creating ? 'Cerrar' : 'Crear combo'}
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl border border-error/40 bg-error-container/20 p-3 text-sm text-error">{error}</p>}

      {creating && (
        <form onSubmit={submit} className="space-y-3 rounded-xl bg-surface-container p-4">
          <h2 className="font-title-editorial text-lg text-on-surface">Nuevo combo</h2>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del combo" className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface placeholder:text-outline" />
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtítulo (opcional)" className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface placeholder:text-outline" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalles de la oferta" rows={3} className="w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface placeholder:text-outline" />
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs text-on-surface-variant">Precio original
              <input required type="number" min="0" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-base text-on-surface" />
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
          <fieldset className="space-y-2">
            <legend className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Productos incluidos — selecciona al menos dos</legend>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg bg-surface-container-lowest p-2">
              {products.map((product) => (
                <label key={product.id} className="flex min-h-10 items-center gap-2 px-1 text-sm text-on-surface">
                  <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={(event) => setSelectedProducts((current) => event.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id))} className="h-4 w-4 accent-primary" />
                  <span className="flex-1 truncate">{product.name}</span><span className="text-xs text-primary">{formatMoney(product.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button disabled={saving} type="submit" className="min-h-12 w-full rounded-lg bg-primary font-semibold text-on-primary disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar combo'}</button>
        </form>
      )}

      {loading ? <p className="rounded-xl bg-surface-container p-8 text-center text-on-surface-variant">Cargando ofertas…</p> : offers.length === 0 ? (
        <p className="rounded-xl bg-surface-container p-8 text-center text-on-surface-variant">No hay ofertas guardadas.</p>
      ) : offers.map((offer) => (
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
            <button onClick={() => void toggleStatus(offer)} className="min-h-11 w-full rounded-lg bg-surface-container-high text-sm font-medium text-primary">
              {offer.status === 'active' ? 'Pausar oferta' : 'Activar oferta'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
