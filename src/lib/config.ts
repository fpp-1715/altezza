export const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '5353765926'

export const BRAND = {
  name: 'Altezza',
  // tagline left intentionally blank per user request
  tagline: '',
  // no public email provided
  email: '',
  address: 'Villuendas #54, dentro del taller Otro Nivel',
}

export const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

export const formatMoney = (value: number) => '$' + value.toLocaleString('en-US')
