import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createProduct, getAdminCategories, getProduct, getProducts, updateProduct, uploadProductImage } from '../services/productService'
import { formatMoney } from '../lib/config'
import type { CategoryKey, Product } from '../types'

const DEFAULT_CATEGORY_OPTIONS: { key: CategoryKey; label: string }[] = [
  { key: 'cadenas', label: 'Cadenas' },
  { key: 'anillos', label: 'Anillos y alianzas' },
  { key: 'collares', label: 'Collares' },
  { key: 'pulseras', label: 'Pulseras' },
  { key: 'relojes', label: 'Relojes' },
  { key: 'perfumeria', label: 'Perfumería' },
]

const JEWELRY_CATEGORIES: CategoryKey[] = ['cadenas', 'anillos', 'collares', 'pulseras']

const emptyProduct: Partial<Product> = {
  name: '',
  title: '',
  category: 'anillos',
  price: 0,
  description: '',
  image: '',
  weight: '',
}

export default function AdminProductoForm() {
  const { id = '' } = useParams()
  const isNew = !id || id === 'nuevo'
  const navigate = useNavigate()
  const [form, setForm] = useState<Partial<Product>>(emptyProduct)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORY_OPTIONS)
  const [offerPrice, setOfferPrice] = useState<number | ''>('')

  useEffect(() => {
    void getAdminCategories()
      .then((categories) => {
        const categoriesFromDb = categories
          .filter((category) => category.active)
          .map((category) => ({ key: category.id as CategoryKey, label: category.name }))
        if (categoriesFromDb.length > 0) {
          setCategoryOptions(categoriesFromDb)
          setForm((current) => ({
            ...current,
            category: current.category && categoriesFromDb.some((option) => option.key === current.category)
              ? current.category
              : categoriesFromDb[0].key,
          }))
        }
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('')
      return
    }
    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  useEffect(() => {
    document.title = isNew ? 'Nuevo producto — Administrador' : 'Editar producto — Administrador'
    if (isNew) {
      setForm(emptyProduct)
      setOfferPrice('')
      setLoading(false)
      return
    }

    setLoading(true)
    getProduct(id)
      .then((product) => {
        if (!product) {
          setError('No se encontró este producto.')
          return
        }
        setForm({ ...product, price: product.oldPrice ?? product.price })
        setOfferPrice(product.oldPrice ? product.price : '')
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el producto.'))
      .finally(() => setLoading(false))
  }, [id, isNew])

  const updateField = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    const name = form.name?.trim() ?? ''
    const details = form.description?.trim() ?? ''
    const regularPrice = Number(form.price)
    const discountedPrice = offerPrice === '' ? undefined : Number(offerPrice)
    const category = form.category
    const image = form.image?.trim() ?? ''

    if (!name || !details || !category || (!image && !imageFile)) {
      setError('Completa nombre, detalles, categoría e imagen.')
      return
    }
    if (!Number.isFinite(regularPrice) || regularPrice < 0) {
      setError('El precio debe ser un número igual o mayor que cero.')
      return
    }
    if (discountedPrice !== undefined && (!Number.isFinite(discountedPrice) || discountedPrice < 0 || discountedPrice >= regularPrice)) {
      setError('El precio de oferta debe ser igual o mayor que cero y menor que el precio regular.')
      return
    }

    setSaving(true)
    try {
      const savedImage = imageFile ? await uploadProductImage(imageFile) : image
      const products = await getProducts()
      const existing = products.find((product) => product.id === id)
      const product: Product = {
        ...existing,
        ...form,
        id: isNew ? `prod-${Date.now()}` : id,
        sku: existing?.sku ?? `AG-${Date.now().toString(36).toUpperCase()}`,
        name,
        title: name,
        category,
        categoryLabel: categoryOptions.find((option) => option.key === category)?.label ?? category,
        tagline: details,
        description: details,
        price: discountedPrice ?? regularPrice,
        oldPrice: discountedPrice === undefined ? undefined : regularPrice,
        image: savedImage,
        detailLabel: form.weight?.trim() ? `Peso: ${form.weight.trim()} g` : '',
        weight: JEWELRY_CATEGORIES.includes(category) ? (form.weight?.trim() || undefined) : undefined,
        createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
        specs: form.weight?.trim() && JEWELRY_CATEGORIES.includes(category) ? [['Peso', `${form.weight.trim()} g`]] : [],
        featured: existing?.featured ?? false,
        exclusivity: existing?.exclusivity ?? 0,
        availability: existing?.availability ?? 'boveda',
        stockLabel: existing?.stockLabel ?? 'Disponible',
      }

      if (isNew) {
        await createProduct(product)
      } else {
        const updated = await updateProduct(id, product)
        if (!updated) throw new Error('No se encontró el producto que intentas actualizar.')
      }
      navigate('/admin/productos')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el producto.')
    } finally {
      setSaving(false)
    }
  }

  const hasWeight = Boolean(form.category && JEWELRY_CATEGORIES.includes(form.category))

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Cargando producto…</div>
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-screen-xl space-y-4 px-4 py-4 pb-28 md:px-0 md:py-8">
      <header className="flex items-center gap-3">
        <Link
          to="/admin/productos"
          aria-label="Volver al catálogo"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="font-label-caps text-[10px] uppercase tracking-widest text-primary">Modo rápido · catálogo</p>
          <h1 className="truncate font-headline-lg-mobile text-[25px] leading-8">
            {isNew ? 'Agregar producto' : 'Editar producto'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="hidden min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 font-semibold text-on-primary disabled:opacity-60 sm:flex"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 space-y-0 lg:grid-cols-2">
        <label className="block space-y-2 rounded-xl bg-surface-container-low p-3.5 shadow-sm">
          <span className="flex justify-between font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant"><span>Nombre del producto</span><span className="text-primary">Obligatorio</span></span>
          <input
            autoComplete="off"
            required
            value={form.name ?? ''}
            onChange={(event) => updateField('name', event.target.value)}
            className="min-h-12 w-full rounded-lg bg-surface-container-lowest px-3.5 text-base text-on-surface shadow-inner outline-none placeholder:text-outline/50 focus:bg-surface-container-high"
            placeholder="Nombre del producto"
          />
        </label>

        <section className="space-y-2 rounded-xl bg-surface-container-low p-3.5 shadow-sm">
          <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Categoría</span>
          <div className="grid grid-cols-2 gap-2">
            {categoryOptions.map((option) => {
              const active = form.category === option.key
              return <button key={option.key} type="button" aria-pressed={active} onClick={() => updateField('category', option.key)} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-sm transition-colors ${active ? 'bg-primary font-medium text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-[18px]">{option.key === 'perfumeria' ? 'spa' : option.key === 'relojes' ? 'watch' : 'diamond'}</span>
                {option.label}
              </button>
            })}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-2 rounded-xl bg-surface-container-low p-3.5 shadow-sm">
            <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Precio regular (USD)</span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.price ?? ''}
              onChange={(event) => updateField('price', Number(event.target.value))}
              className="min-h-12 w-full rounded-lg bg-surface-container-lowest px-3 text-base text-on-surface outline-none focus:bg-surface-container-high"
              placeholder="0.00"
            />
          </label>
          <label className="block space-y-2 rounded-xl bg-surface-container-low p-3.5 shadow-sm">
            <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Oferta (USD)</span>
            <input
              type="number"
              min="0"
              max={form.price ?? undefined}
              step="0.01"
              inputMode="decimal"
              value={offerPrice}
              onChange={(event) => setOfferPrice(event.target.value === '' ? '' : Number(event.target.value))}
              className="min-h-12 w-full rounded-lg bg-surface-container-lowest px-3 text-base text-on-surface outline-none focus:bg-surface-container-high"
              placeholder="Opcional"
            />
          </label>
        </div>
        {hasWeight && (
          <label className="block space-y-2 rounded-xl bg-surface-container-low p-3.5 shadow-sm">
            <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Peso de la joya (g)</span>
            <input value={form.weight ?? ''} onChange={(event) => updateField('weight', event.target.value)} className="min-h-12 w-full rounded-lg bg-surface-container-lowest px-3 text-base text-on-surface outline-none focus:bg-surface-container-high" placeholder="Ej. 5 g" />
          </label>
        )}

        <label className="block space-y-2 rounded-xl bg-surface-container-low p-3.5 shadow-sm">
          <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Detalles o descripción</span>
          <textarea
            required
            rows={5}
            value={form.description ?? ''}
            onChange={(event) => updateField('description', event.target.value)}
            className="w-full rounded-lg bg-surface-container-lowest px-3.5 py-3 text-base text-on-surface outline-none focus:bg-surface-container-high"
            placeholder="Escribe los detalles relevantes del producto..."
          />
        </label>

        <label className="block space-y-2 rounded-xl bg-surface-container-low p-3.5 shadow-sm">
          <span className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">Foto del producto</span>
          <span className="text-xs text-on-surface-variant">Selecciona una foto desde tu dispositivo o toma una ahora.</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="block min-h-12 w-full rounded-lg bg-surface-container-lowest text-sm text-on-surface file:mr-3 file:min-h-12 file:border-0 file:bg-primary file:px-3 file:font-medium file:text-on-primary"
          />
          {form.image && !imageFile && (
            <button type="button" onClick={() => updateField('image', '')} className="text-left text-xs text-error">
              Quitar foto actual
            </button>
          )}
        </label>

        {(imagePreview || form.image) && (
          <div className="flex items-center gap-3 rounded-xl bg-surface-container p-3">
            <img src={imagePreview || form.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="font-medium">{form.name || 'Vista previa'}</p>
              <p className="text-sm text-primary">{formatMoney(offerPrice === '' ? Number(form.price) || 0 : offerPrice)} USD</p>
              {offerPrice !== '' && <p className="text-xs text-on-surface-variant line-through">{formatMoney(Number(form.price) || 0)} USD</p>}
              {form.weight && <p className="text-xs text-on-surface-variant">Peso: {form.weight} g</p>}
            </div>
          </div>
        )}
      </section>

      {error && (
        <p role="alert" className="rounded-lg border border-error/40 bg-error-container/20 p-3 text-sm text-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="fixed inset-x-0 bottom-0 z-50 flex min-h-[76px] items-center bg-surface-container-low/95 px-3 pb-[env(safe-area-inset-bottom)] pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md disabled:opacity-60 sm:hidden"
      >
        <span className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary font-headline-sm text-[16px] font-semibold text-on-primary shadow-lg active:scale-[0.98]">
          <span className="material-symbols-outlined text-[22px]">verified</span>
          {saving ? 'Guardando…' : isNew ? 'Guardar producto en catálogo' : 'Guardar cambios'}
        </span>
      </button>
    </form>
  )
}
