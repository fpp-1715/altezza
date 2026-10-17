import type { CartItem, MetalOption, Product } from '../types'

export const metalDisplay = (m: MetalOption) =>
  m.label.endsWith('Quilates') ? `${m.name} ${parseInt(m.label, 10)}K` : m.name

export interface Selection {
  metal?: MetalOption
  size?: string
  engraving?: string
}

export function defaultSelection(product: Product): Selection {
  return {
    metal: product.metals?.[0],
    size: product.sizes ? (product.sizes.find((s) => s.size === '7') ?? product.sizes[0]).size : undefined,
  }
}

export const unitPrice = (product: Product, sel: Selection) =>
  product.price + (sel.metal?.priceDelta ?? 0)

export function buildCartItem(
  product: Product,
  sel: Selection = defaultSelection(product),
): Omit<CartItem, 'qty'> {
  const engraving = sel.engraving?.trim() || undefined
  const variantParts = [
    sel.metal ? metalDisplay(sel.metal) : product.material,
    sel.size ? `Talla ${sel.size}` : undefined,
  ].filter(Boolean)

  return {
    lineId: [product.id, sel.metal?.name, sel.size, engraving].filter(Boolean).join('|'),
    productId: product.id,
    sku: product.sku,
    name: product.title,
    image: product.image,
    eyebrow: product.categoryLabel,
    variant: variantParts.join(' · ') || undefined,
    engraving,
    unitPrice: unitPrice(product, sel),
  }
}
