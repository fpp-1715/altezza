import { supabase } from '../lib/supabase'
import type { Product } from '../types'

export interface OfferRecord {
  id: string
  name: string
  subtitle: string
  description: string
  discount_label: string
  original_price: number
  offer_price: number
  image_url: string | null
  status: 'active' | 'paused'
  product_ids: string[]
}

function dbError(error: { code?: string; message: string }) {
  if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) {
    return new Error('Supabase denegó la operación por permisos. Verifica la sesión administradora y las políticas RLS de ofertas.')
  }
  return error
}

export async function getOffers(): Promise<OfferRecord[]> {
  if (!supabase) throw new Error('Supabase no está configurado.')
  const { data: offers, error } = await supabase.from('offers')
    .select('id, name, subtitle, description, discount_label, original_price, offer_price, image_url, status')
    .order('created_at', { ascending: false })
  if (error) throw dbError(error)
  const { data: links, error: linksError } = await supabase.from('offer_products').select('offer_id, product_id')
  if (linksError) throw dbError(linksError)
  const idsByOffer = new Map<string, string[]>()
  for (const link of links ?? []) {
    idsByOffer.set(link.offer_id, [...(idsByOffer.get(link.offer_id) ?? []), link.product_id])
  }
  return (offers ?? []).map((offer) => ({
    ...offer,
    original_price: Number(offer.original_price),
    offer_price: Number(offer.offer_price),
    product_ids: idsByOffer.get(offer.id) ?? [],
  }))
}

export async function getActiveOffers(): Promise<OfferRecord[]> {
  if (!supabase) return []
  const { data: offers, error } = await supabase.from('offers')
    .select('id, name, subtitle, description, discount_label, original_price, offer_price, image_url, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  if (error) throw dbError(error)
  const { data: links, error: linksError } = await supabase.from('offer_products').select('offer_id, product_id')
  if (linksError) throw dbError(linksError)
  const idsByOffer = new Map<string, string[]>()
  for (const link of links ?? []) {
    idsByOffer.set(link.offer_id, [...(idsByOffer.get(link.offer_id) ?? []), link.product_id])
  }
  return (offers ?? []).map((offer) => ({
    ...offer,
    original_price: Number(offer.original_price),
    offer_price: Number(offer.offer_price),
    product_ids: idsByOffer.get(offer.id) ?? [],
  }))
}

export async function setOfferStatus(id: string, status: OfferRecord['status']) {
  if (!supabase) throw new Error('Supabase no está configurado.')
  const { error } = await supabase.from('offers').update({ status }).eq('id', id)
  if (error) throw dbError(error)
}

export async function createOffer(input: Omit<OfferRecord, 'id' | 'product_ids'>, productIds: string[]) {
  if (!supabase) throw new Error('Supabase no está configurado.')
  if (productIds.length < 2) throw new Error('Selecciona al menos dos productos para el combo.')
  const { data: offer, error } = await supabase.from('offers').insert({
    name: input.name,
    subtitle: input.subtitle,
    description: input.description,
    discount_label: input.discount_label,
    original_price: input.original_price,
    offer_price: input.offer_price,
    image_url: input.image_url,
    status: input.status,
  }).select('id').single()
  if (error) throw dbError(error)

  const { error: linksError } = await supabase.from('offer_products').insert(
    productIds.map((product_id) => ({ offer_id: offer.id, product_id, quantity: 1 })),
  )
  if (linksError) {
    const { error: rollbackError } = await supabase.from('offers').delete().eq('id', offer.id)
    if (rollbackError) {
      throw new Error(`${dbError(linksError).message} Además, no se pudo eliminar la oferta incompleta: ${dbError(rollbackError).message}`)
    }
    throw dbError(linksError)
  }
}

export function offerToProduct(offer: OfferRecord): Product {
  return {
    id: offer.id,
    sku: `offer-${offer.id}`,
    name: offer.name,
    title: offer.name,
    category: 'ofertas',
    categoryLabel: 'Oferta',
    tagline: offer.subtitle,
    description: offer.description || offer.subtitle,
    price: Number(offer.offer_price),
    oldPrice: Number(offer.original_price),
    image: offer.image_url ?? 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
    badge: offer.discount_label || 'Oferta',
    material: undefined,
    detailLabel: offer.discount_label || 'Oferta',
    availability: 'boveda',
    stockLabel: 'Oferta activa',
    featured: true,
    exclusivity: 0,
    createdAt: new Date().toISOString(),
    specs: [],
  }
}

export async function updateOffer(id: string, input: Omit<OfferRecord, 'id' | 'product_ids'>, productIds: string[]) {
  if (!supabase) throw new Error('Supabase no está configurado.')
  if (productIds.length < 2) throw new Error('Selecciona al menos dos productos para el combo.')

  const payload = {
    name: input.name,
    subtitle: input.subtitle,
    description: input.description,
    discount_label: input.discount_label,
    original_price: input.original_price,
    offer_price: input.offer_price,
    image_url: input.image_url,
    status: input.status,
  }

  const { error: offerError } = await supabase.from('offers').update(payload).eq('id', id)
  if (offerError) throw dbError(offerError)

  const { error: deleteError } = await supabase.from('offer_products').delete().eq('offer_id', id)
  if (deleteError) throw dbError(deleteError)

  const { error: linksError } = await supabase.from('offer_products').insert(
    productIds.map((product_id) => ({ offer_id: id, product_id, quantity: 1 })),
  )
  if (linksError) throw dbError(linksError)
}

export async function deleteOffer(id: string) {
  if (!supabase) throw new Error('Supabase no está configurado.')

  const { error: linksError } = await supabase.from('offer_products').delete().eq('offer_id', id)
  if (linksError) throw dbError(linksError)

  const { error } = await supabase.from('offers').delete().eq('id', id)
  if (error) throw dbError(error)
}

export function getOfferProductNames(offer: OfferRecord, products: Product[]) {
  return offer.product_ids.map((id) => products.find((product) => product.id === id)?.name ?? id)
}
