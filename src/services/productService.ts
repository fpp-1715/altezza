import { CATEGORIES, PRODUCTS } from '../data/products'
import type { CategoryInfo, Product } from '../types'
import { supabase } from '../lib/supabase'

// Almacenamiento local persistente para soporte CRUD completo
const STORAGE_KEY = 'ayg_products_v1'

function loadStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Error loading products from localStorage:', err)
  }
  return [...PRODUCTS]
}

function saveStoredProducts(items: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

let memoryProducts: Product[] = loadStoredProducts()

const delay = <T,>(value: T, ms = 80): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

export async function getProducts(): Promise<Product[]> {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('active', true).or('stock_count.is.null,stock_count.gt.0')
    if (error) throw presentDatabaseError(error)
    return (data ?? []).map(fromDatabase)
  }
  return delay(memoryProducts.filter((product) => product.active !== false && product.stockCount !== 0))
}

export async function getAdminProducts(): Promise<Product[]> {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*')
    if (error) throw presentDatabaseError(error)
    return (data ?? []).map(fromDatabase)
  }
  return delay([...memoryProducts])
}

export async function getProduct(id: string): Promise<Product | null> {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).eq('active', true).or('stock_count.is.null,stock_count.gt.0').maybeSingle()
    if (error) throw presentDatabaseError(error)
    return data ? fromDatabase(data) : null
  }
  return delay(memoryProducts.find((p) => p.id === id && p.active !== false && p.stockCount !== 0) ?? null)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('featured', true).eq('active', true).or('stock_count.is.null,stock_count.gt.0')
    if (error) throw presentDatabaseError(error)
    return (data ?? []).map(fromDatabase)
  }
  return delay(memoryProducts.filter((p) => p.featured && p.active !== false && p.stockCount !== 0))
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').neq('id', product.id).eq('active', true).or('stock_count.is.null,stock_count.gt.0').limit(limit * 3)
    if (error) throw presentDatabaseError(error)
    const others = (data ?? []).map(fromDatabase)
    return [
      ...others.filter((item) => item.category !== product.category),
      ...others.filter((item) => item.category === product.category),
    ].slice(0, limit)
  }
  const others = memoryProducts.filter((p) => p.id !== product.id && p.active !== false && p.stockCount !== 0)
  const different = others.filter((p) => p.category !== product.category)
  const same = others.filter((p) => p.category === product.category)
  return delay([...different, ...same].slice(0, limit))
}

export async function getCategories(): Promise<CategoryInfo[]> {
  if (supabase) {
    const { data, error } = await supabase.from('categories').select('id, name').eq('active', true).order('sort_order')
    if (error) throw presentDatabaseError(error)
    return [{ key: 'all', label: 'Todas' }, ...(data ?? []).map((item) => ({
      key: item.id as CategoryInfo['key'],
      label: item.name,
    }))]
  }
  return delay(CATEGORIES)
}

export type AdminCategory = { id: Product['category']; name: string; sort_order: number; active: boolean }

export async function getAdminCategories(): Promise<AdminCategory[]> {
  if (!supabase) return CATEGORIES.filter((item) => item.key !== 'all').map((item, index) => ({
    id: item.key as Product['category'], name: item.label, sort_order: index, active: true,
  }))
  const { data, error } = await supabase.from('categories').select('id, name, sort_order, active').order('sort_order')
  if (error) throw presentDatabaseError(error)
  return (data ?? []).map((item) => ({
    id: item.id as Product['category'],
    name: String(item.name),
    sort_order: Number(item.sort_order),
    active: Boolean(item.active),
  }))
}

export async function updateCategory(id: Product['category'], changes: { name?: string; active?: boolean }) {
  if (!supabase) throw new Error('La gestión de categorías requiere conexión con Supabase.')
  const { error } = await supabase.from('categories').update(changes).eq('id', id)
  if (error) throw presentDatabaseError(error)
}

export async function createCategory(category: AdminCategory) {
  if (!supabase) throw new Error('La gestión de categorías requiere conexión con Supabase.')
  const { error } = await supabase.from('categories').insert(category)
  if (error) throw presentDatabaseError(error)
}

export async function deleteCategory(id: Product['category']) {
  if (!supabase) throw new Error('La gestión de categorías requiere conexión con Supabase.')
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
    if (key in product) row[column] = product[key]
  }
  if ('createdAt' in product) row.created_at = product.createdAt
  return row
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado; no se puede subir la imagen.')
  if (!file.type.startsWith('image/')) throw new Error('Selecciona un archivo de imagen válido.')

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const path = `${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
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
  if (supabase) {
    const { data, error } = await supabase.from('products').insert(toDatabase(product)).select('*').single()
    if (error) throw presentDatabaseError(error)
    return fromDatabase(data)
  }
  if (memoryProducts.some((item) => item.sku.toLowerCase() === product.sku.toLowerCase())) {
    throw new Error(`Ya existe un producto con el SKU ${product.sku}.`)
  }
  const nextProducts = [product, ...memoryProducts]
  saveStoredProducts(nextProducts)
  memoryProducts = nextProducts
  return delay(product)
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (supabase) {
    const { data, error } = await supabase.from('products').update(toDatabase(updates)).eq('id', id).select('*').maybeSingle()
    if (error) throw presentDatabaseError(error)
    return data ? fromDatabase(data) : null
  }
  const index = memoryProducts.findIndex((p) => p.id === id)
  if (index === -1) return null
  const updated = { ...memoryProducts[index], ...updates }
  if (memoryProducts.some((item) => item.id !== id && item.sku.toLowerCase() === updated.sku.toLowerCase())) {
    throw new Error(`Ya existe un producto con el SKU ${updated.sku}.`)
  }
  const nextProducts = [...memoryProducts]
  nextProducts[index] = updated
  saveStoredProducts(nextProducts)
  memoryProducts = nextProducts
  return delay(updated)
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (supabase) {
    const { data, error } = await supabase.from('products').delete().eq('id', id).select('id')
    if (error) throw presentDatabaseError(error)
    return Boolean(data?.length)
  }
  const prevLen = memoryProducts.length
  const nextProducts = memoryProducts.filter((p) => p.id !== id)
  if (nextProducts.length !== prevLen) {
    saveStoredProducts(nextProducts)
    memoryProducts = nextProducts
    return delay(true)
  }

  return delay(false)
}

export async function duplicateProduct(id: string): Promise<Product | null> {
  const original = supabase
    ? await getProduct(id)
    : memoryProducts.find((p) => p.id === id)
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
