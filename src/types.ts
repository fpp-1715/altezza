export type CategoryKey = string
export type CategoryKind = 'oro' | 'relojes' | 'perfumeria'

export type Availability = 'boveda' | 'encargo'

export interface MetalOption {
  name: string
  label: string
  priceDelta: number
}

export interface SizeOption {
  size: string
  mm: string
}

export interface Product {
  id: string
  sku: string
  name: string
  title: string
  category: CategoryKey
  categoryLabel: string
  tagline: string
  description: string
  weight?: string
  price: number
  oldPrice?: number
  image: string
  gallery?: { src: string; label: string }[]
  badge?: string
  metal?: string
  karat?: number
  material?: string
  sizeLabel?: string
  detailLabel: string
  availability: Availability
  stockLabel: string
  featured?: boolean
  exclusivity: number
  createdAt: string
  specs: [string, string][]
  metals?: MetalOption[]
  sizes?: SizeOption[]
  engravable?: boolean
  stockCount?: number
  active?: boolean
}

export interface CategoryInfo {
  key: CategoryKey | 'all'
  label: string
}

export interface CartItem {
  lineId: string
  productId: string
  sku: string
  name: string
  image: string
  eyebrow: string
  variant?: string
  engraving?: string
  unitPrice: number
  qty: number
}
