import { CATEGORIES } from '../data/products'
import type { CategoryInfo, CategoryKind, Product } from '../types'
import { supabase } from '../lib/supabase'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (o VITE_SUPABASE_PUBLISHABLE_KEY) en Vercel y vuelve a desplegar.')
  }
  return supabase
}

const delay = <T,>(value: T, ms = 80): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

export async function getProducts(): Promise<Product[]> {
  const client = requireSupabase()
  const { data, error } = await client.from('products').select('*')
  if (error) throw presentDatabaseError(error)
  return (data ?? [])
    .filter((row) => row.active === undefined || Boolean(row.active))
    .filter((row) => row.stock_count == null || Number(row.stock_count) > 0)
    .map(fromDatabase)
}

export async function getAdminProducts(): Promise<Product[]> {
  const client = requireSupabase()
  const { data, error } = await client.from('products').select('*')
  if (error) throw presentDatabaseError(error)
  return (data ?? []).map(fromDatabase)
}

export async function getProduct(id: string): Promise<Product | null> {
  const client = requireSupabase()
  const { data, error } = await client.from('products').select('*').eq('id', id).maybeSingle()
  if (error) throw presentDatabaseError(error)
  if (!data) return null
  const product = fromDatabase(data)
  if (product.active === false) return null
  if (product.stockCount != null && product.stockCount <= 0) return null
  return product
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const client = requireSupabase()
  const { data, error } = await client.from('products').select('*')
  if (error) throw presentDatabaseError(error)
  return (data ?? [])
    .filter((row) => Boolean(row.featured))
    .filter((row) => row.active === undefined || Boolean(row.active))
    .filter((row) => row.stock_count == null || Number(row.stock_count) > 0)
    .map(fromDatabase)
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const client = requireSupabase()
  const { data, error } = await client.from('products').select('*')
  if (error) throw presentDatabaseError(error)
  const others = (data ?? [])
    .filter((row) => row.id !== product.id)
    .filter((row) => row.active === undefined || Boolean(row.active))
    .filter((row) => row.stock_count == null || Number(row.stock_count) > 0)
    .map(fromDatabase)
  return [
    ...others.filter((item) => item.category !== product.category),
    ...others.filter((item) => item.category === product.category),
  ].slice(0, limit)
}

export async function getCategories(): Promise<CategoryInfo[]> {
  if (supabase) {
    const { data, error } = await supabase.from('categories').select('*')
    if (error) throw presentDatabaseError(error)
    const categories = ((data ?? []) as Array<Record<string, unknown>>)
      .filter((item) => item.active === undefined || Boolean(item.active))
      .map((item) => ({
      key: item.id as CategoryInfo['key'],
      label: String(item.name),
      sortOrder: Number(item.sort_order ?? 0),
    }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ key, label }) => ({ key, label }))
    return [{ key: 'all', label: 'Todas' }, ...categories]
  }
  return delay(CATEGORIES)
}

export type AdminCategory = { id: Product['category']; name: string; sort_order: number; active: boolean; kind?: CategoryKind }

function inferCategoryKind(id: string): CategoryKind {
  const normalized = String(id).toLowerCase()
  if (normalized.includes('reloj')) return 'relojes'
  if (normalized.includes('perfume') || normalized.includes('perfumeria')) return 'perfumeria'
  return 'oro'
}

function categoryFromDatabase(row: Record<string, unknown>): AdminCategory {
  return {
    id: String(row.id) as Product['category'],
    name: String(row.name),
    sort_order: Number(row.sort_order ?? 0),
    active: row.active === undefined ? true : Boolean(row.active),
    kind: (row.kind as CategoryKind | undefined) ?? inferCategoryKind(String(row.id)),
  }
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  if (!supabase) return CATEGORIES.filter((item) => item.key !== 'all').map((item, index) => ({
    id: item.key as Product['category'], name: item.label, sort_order: index, active: true, kind: inferCategoryKind(item.key),
  }))

  const { data, error } = await supabase.from('categories').select('*')
  if (error) throw presentDatabaseError(error)
  return ((data ?? []) as Array<Record<string, unknown>>)
    .map(categoryFromDatabase)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export async function updateCategory(id: Product['category'], changes: { name?: string; active?: boolean; kind?: CategoryKind }) {
  if (!supabase) throw new Error('La gestión de categorías requiere conexión con Supabase.')
  const payload = { ...changes }
  if (payload.kind === undefined) delete payload.kind

  try {
    const { error } = await supabase.from('categories').update(payload).eq('id', id)
    if (error) throw presentDatabaseError(error)
  } catch (error) {
    if (error instanceof Error && /kind|column/i.test(error.message)) {
      const { error: fallbackError } = await supabase.from('categories').update({ name: payload.name, active: payload.active }).eq('id', id)
      if (fallbackError) throw presentDatabaseError(fallbackError)
      return
    }
    throw error
  }
}

export async function createCategory(category: Omit<AdminCategory, 'id'>) {
  if (!supabase) throw new Error('La gestión de categorías requiere conexión con Supabase.')
  const payload: Record<string, unknown> = {
    name: category.name,
    sort_order: category.sort_order,
    active: category.active,
    kind: category.kind,
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { error } = await supabase.from('categories').insert(payload)
    if (!error) return

    const message = error.message.toLowerCase()
    const optionalColumn = (['kind', 'sort_order', 'active'] as const).find((column) =>
      column in payload
      && message.includes(column)
      && (message.includes('column') || message.includes('schema cache') || error.code === 'PGRST204'),
    )
    if (optionalColumn) {
      delete payload[optionalColumn]
      continue
    }

    if (!('id' in payload) && error.code === '23502' && /column\s+["']?id["']?/i.test(error.message)) {
      payload.id = crypto.randomUUID()
      continue
    }

    throw presentDatabaseError(error)
  }

  throw new Error('No se pudo crear la categoría con las columnas disponibles en Supabase.')
}

export async function countProductsInCategory(id: Product['category']): Promise<number> {
  if (!supabase) return 0
  const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category_id', id)
  if (error) throw presentDatabaseError(error)
  return Number(count ?? 0)
}

export async function deleteCategory(id: Product['category']) {
  if (!supabase) throw new Error('La gestión de categorías requiere conexión con Supabase.')
  const productCount = await countProductsInCategory(id)
  if (productCount > 0) {
    throw new Error(`No se puede eliminar esta categoría porque tiene ${productCount} producto(s) asociado(s).`)
  }
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw presentDatabaseError(error)
}

function fromDatabase(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    sku: String(row.sku),
    name: String(row.name),
    title: String(row.title),
    category: row.category_id as Product['category'],
    categoryLabel: String(row.category_label),
    description: String(row.description ?? ''),
    tagline: String(row.tagline ?? ''),
    price: Number(row.price),
    oldPrice: row.old_price == null ? undefined : Number(row.old_price),
    weight: row.weight == null ? undefined : String(row.weight),
    image: String(row.image_url),
    gallery: (row.gallery ?? []) as Product['gallery'],
    badge: row.badge == null ? undefined : String(row.badge),
    material: row.material == null ? undefined : String(row.material),
    metal: row.metal == null ? undefined : String(row.metal),
    karat: row.karat == null ? undefined : Number(row.karat),
    sizeLabel: row.size_label == null ? undefined : String(row.size_label),
    detailLabel: String(row.detail_label ?? ''),
    availability: row.availability as Product['availability'],
    stockLabel: String(row.stock_label),
    stockCount: row.stock_count == null ? undefined : Number(row.stock_count),
    active: row.active === undefined ? true : Boolean(row.active),
    featured: Boolean(row.featured),
    exclusivity: Number(row.exclusivity ?? 0),
    createdAt: typeof row.created_at === 'string' ? row.created_at.slice(0, 10) : '',
    specs: (row.specs ?? []) as Product['specs'],
    metals: (row.metals ?? []) as Product['metals'],
    sizes: (row.sizes ?? []) as Product['sizes'],
    engravable: Boolean(row.engravable),
  }
}

function toDatabase(product: Partial<Product>) {
  const row: Record<string, unknown> = {}
  const fields: [keyof Product, string][] = [
    ['id', 'id'], ['sku', 'sku'], ['name', 'name'], ['title', 'title'],
    ['category', 'category_id'], ['categoryLabel', 'category_label'],
    ['description', 'description'], ['tagline', 'tagline'], ['price', 'price'],
    ['oldPrice', 'old_price'], ['weight', 'weight'], ['image', 'image_url'],
    ['gallery', 'gallery'], ['badge', 'badge'], ['material', 'material'],
    ['metal', 'metal'], ['karat', 'karat'], ['sizeLabel', 'size_label'],
    ['detailLabel', 'detail_label'], ['availability', 'availability'],
    ['stockLabel', 'stock_label'], ['stockCount', 'stock_count'],
    ['active', 'active'],
    ['featured', 'featured'], ['exclusivity', 'exclusivity'],
    ['specs', 'specs'], ['metals', 'metals'], ['sizes', 'sizes'],
    ['engravable', 'engravable'],
  ]
  for (const [key, column] of fields) {
    if (key in product) {
      row[column] = key === 'oldPrice' && product[key] === undefined ? null : product[key]
    }
  }
  if ('createdAt' in product) row.created_at = product.createdAt
  return row
}

async function compressProductImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Selecciona un archivo de imagen válido.')

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('No se pudo abrir esta imagen. Prueba con una foto JPG, PNG o WebP.')
  }

  try {
    const maxDimension = 1400
    let scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')

    for (let attempt = 0; attempt < 4; attempt += 1) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('El navegador no pudo preparar la imagen.')
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => result ? resolve(result) : reject(new Error('No se pudo comprimir la imagen.')),
          'image/webp',
          Math.max(0.68, 0.84 - attempt * 0.05),
        )
      })
      if (blob.size <= 500 * 1024 || attempt === 3) return blob
      scale *= 0.82
    }
  } finally {
    bitmap.close()
  }

  throw new Error('No se pudo comprimir la imagen.')
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado; no se puede subir la imagen.')
  const compressedImage = await compressProductImage(file)

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const extension = compressedImage.type === 'image/webp' ? 'webp' : compressedImage.type === 'image/png' ? 'png' : 'jpg'
  const path = `${crypto.randomUUID()}-${safeName.replace(/\.[^.]+$/, '')}.${extension}`
  const { error } = await supabase.storage.from('product-images').upload(path, compressedImage, {
    cacheControl: '3600',
    contentType: compressedImage.type,
    upsert: false,
  })
  if (error) {
    if (error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('permission')) {
      throw new Error('Supabase denegó la subida de la imagen. Verifica la política RLS del bucket product-images para administradores.')
    }
    if (error.message.toLowerCase().includes('bucket not found')) {
      throw new Error('No existe el bucket product-images en este proyecto Supabase. Créalo y configura sus políticas de Storage.')
    }
    throw error
  }
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

function presentDatabaseError(error: { code?: string; message: string }) {
  const message = error.message.toLowerCase()
  if (error.code === '42501' || message.includes('row-level security') || message.includes('permission denied')) {
    return new Error('Supabase denegó la operación por permisos. Verifica que la sesión sea administradora y las políticas RLS.')
  }
  return error
}

// Operaciones CRUD para el panel de administración
export async function createProduct(product: Product): Promise<Product> {
  const client = requireSupabase()
  const { data, error } = await client.from('products').insert(toDatabase(product)).select('*').single()
  if (error) throw presentDatabaseError(error)
  return fromDatabase(data)
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const client = requireSupabase()
  const { data, error } = await client.from('products').update(toDatabase(updates)).eq('id', id).select('*').maybeSingle()
  if (error) throw presentDatabaseError(error)
  return data ? fromDatabase(data) : null
}

export async function deleteProduct(id: string): Promise<boolean> {
  const client = requireSupabase()
  const { data, error } = await client.from('products').delete().eq('id', id).select('id')
  if (error) throw presentDatabaseError(error)
  return Boolean(data?.length)
}

export async function duplicateProduct(id: string): Promise<Product | null> {
  requireSupabase()
  const original = await getProduct(id)
  if (!original) return null
  const newId = `${original.id}-copy-${Date.now().toString(36)}`
  const cloned: Product = {
    ...original,
    id: newId,
    sku: `${original.sku}-CP`,
    name: `${original.name} (Copia)`,
    title: `${original.title} (Copia)`,
    createdAt: new Date().toISOString().split('T')[0],
  }
  return createProduct(cloned)
}
