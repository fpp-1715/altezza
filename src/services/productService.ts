import { CATEGORIES, PRODUCTS } from '../data/products'
import type { CategoryInfo, Product } from '../types'

// Capa de acceso a datos. Al conectar Supabase solo hay que reemplazar
// el cuerpo de estas funciones (por ejemplo con supabase.from('products')).

const delay = <T,>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

export async function getProducts(): Promise<Product[]> {
  return delay(PRODUCTS)
}

export async function getProduct(id: string): Promise<Product | null> {
  return delay(PRODUCTS.find((p) => p.id === id) ?? null)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return delay(PRODUCTS.filter((p) => p.featured))
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const others = PRODUCTS.filter((p) => p.id !== product.id)
  const different = others.filter((p) => p.category !== product.category)
  const same = others.filter((p) => p.category === product.category)
  return delay([...different, ...same].slice(0, limit))
}

export async function getCategories(): Promise<CategoryInfo[]> {
  return delay(CATEGORIES)
}
