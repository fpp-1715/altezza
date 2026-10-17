export const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '34600000000'

export const BRAND = {
  name: 'A&G',
  tagline: 'Haute Parfumerie',
  email: 'concierge@ayg-luxe.com',
  address: 'Av. Alvear 1890, Recoleta',
}

export const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

export const formatMoney = (value: number) => '$' + value.toLocaleString('en-US')
