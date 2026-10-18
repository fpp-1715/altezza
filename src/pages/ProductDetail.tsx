import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { buildCartItem, defaultSelection, metalDisplay, unitPrice } from '../lib/cart'
import type { Selection } from '../lib/cart'
import { formatMoney, whatsappUrl, BRAND } from '../lib/config'
import { useAsync } from '../lib/useAsync'
import { getProduct, getRelatedProducts } from '../services/productService'
import type { MetalOption, Product } from '../types'

const METAL_COLORS: Record<string, string> = {
  'Oro Amarillo': '#E5CD8B',
  'Oro Blanco': '#E6E8EA',
  'Oro Rosa': '#E8B4A0',
  'Platino 950': '#C9CED6',
}

const ACCORDIONS = [
  {
    icon: 'cleaning_services',
    title: 'Cuidados y Mantenimiento',
    body: [
      'Para preservar el brillo original, recomendamos limpiar la pieza periódicamente con agua tibia, jabón de pH neutro y un cepillo de cerdas ultrasuaves.',
      'Todos nuestros clientes disfrutan de mantenimiento y pulido anual gratuito de por vida en nuestra tienda Altezza.',
    ],
  },
  {
    icon: 'workspace_premium',
    title: 'Garantía de Oro de por Vida',
    body: ['Todas nuestras piezas de oro cuentan con garantía de por vida sobre el oro.'],
  },
  {
    icon: 'redeem',
    title: 'Entrega y recogida',
    body: [
      'Los productos se recogen en la tienda. Coordina la disponibilidad y la recogida por WhatsApp.',
      'Para consultar sobre domicilio, escríbenos por WhatsApp.',
    ],
  },
]

const SIZE_GUIDE = [
  ['Talla 5', '9 - 10', '15.7 mm'],
  ['Talla 6', '12', '16.5 mm'],
  ['Talla 7 (Más habitual)', '14 - 15', '17.3 mm'],
  ['Talla 8', '17', '18.2 mm'],
  ['Talla 9', '20', '19.0 mm'],
]

function Related({ product }: { product: Product }) {
  const { data } = useAsync(() => getRelatedProducts(product), [product.id])
  if (!data?.length) return null
  return (
    <section className="mt-10">
      <div className="px-4 flex items-end justify-between mb-4">
        <div>
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] block">
            Conjuntos del Atelier
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Piezas que complementan tu elección</h3>
        </div>
        <span className="font-technical-data text-technical-data text-on-surface-variant shrink-0 ml-2">
          {data.length} creaciones
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 snap-x">
        {data.map((r) => (
          <Link
            key={r.id}
            to={`/producto/${r.id}`}
            className="flex-shrink-0 w-44 snap-start bg-surface-container rounded-xl overflow-hidden flex flex-col"
          >
            <img alt={r.name} loading="lazy" className="w-full aspect-square object-cover" src={r.image} />
            <div className="p-3 flex flex-col gap-1 flex-1">
              <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider">{r.categoryLabel}</span>
              <h4 className="font-title-editorial text-[14px] leading-snug text-on-surface line-clamp-2">{r.name}</h4>
              <span className="font-headline-sm text-[15px] text-primary font-semibold mt-auto pt-1">
                {formatMoney(r.price)} USD
              </span>
              <span className="mt-2 h-8 rounded-lg bg-surface-container-high text-on-surface font-label-md text-[12px] flex items-center justify-center">
                Ver detalles
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProductView({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { addItem, showToast } = useCart()
  const [imgIdx, setImgIdx] = useState(0)
  const [sel, setSel] = useState<Selection>(() => defaultSelection(product))
  const [engraveOn, setEngraveOn] = useState(false)
  const [engraving, setEngraving] = useState('')
  const [openAcc, setOpenAcc] = useState<number | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)

  const images = [product.image, ...(product.gallery?.map((g) => g.src) ?? [])]
  const thumbs = product.gallery ?? []
  const currentSel: Selection = { ...sel, engraving: engraveOn ? engraving : undefined }
  const price = unitPrice(product, currentSel)
  const selectedMetalLabel = sel.metal ? metalDisplay(sel.metal) : product.material

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url })
      } catch {
        /* cancelado por el usuario */
      }
    } else {
      await navigator.clipboard?.writeText(url)
      showToast('Enlace copiado')
    }
  }

  const add = () => {
    addItem(buildCartItem(product, currentSel))
    showToast(`${product.name} añadida a su bolsa`)
  }

  const consult = whatsappUrl(
    `Hola Altezza, deseo asesoramiento personalizado sobre ${product.title} (Ref: ${product.sku})`,
  )
  const specialMeasureConsult = whatsappUrl(
    `Hola Altezza, quisiera consultar por medidas especiales o medias tallas para ${product.title} (Ref: ${product.sku}). ¿Podrían asesorarme sobre las opciones disponibles?`,
  )

  const pickMetal = (m: MetalOption) => setSel((s) => ({ ...s, metal: m }))

  return (
    <div className="flex flex-col w-full pb-12">
      <header className="fixed top-0 inset-x-0 mx-auto max-w-[480px] z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_0_0_rgba(198,164,91,0.2)]">
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            aria-label="Volver"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/catalogo'))}
            className="w-11 h-11 flex items-center justify-center text-primary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col items-center flex-1 mx-2 overflow-hidden text-center">
            <h1 className="font-title-editorial text-title-editorial text-on-surface truncate tracking-wide max-w-[200px]">
              Detalle De Pieza
            </h1>
            <span className="font-label-caps text-[9px] uppercase tracking-[0.22em] text-primary">{BRAND.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              aria-label="Bolsa de Compras"
              to="/bolsa"
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">local_mall</span>
            </Link>
            <button
              aria-label="Compartir pieza"
              onClick={share}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
        </div>
      </header>

      <section className="w-full relative px-4 pt-4 flex flex-col gap-3">
        <div className="relative w-full aspect-[4/5] bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
          <img
            alt={product.title}
            className="w-full h-full object-cover transition-opacity duration-300"
            src={images[imgIdx] ?? product.image}
          />
          <div className="absolute top-3 left-3 bg-surface-container-lowest/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-primary text-[14px]">verified</span>
            <span className="font-technical-data text-technical-data text-primary uppercase">Altezza</span>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${i === imgIdx ? 'w-5 bg-primary' : 'w-1.5 bg-surface-variant'}`}
                />
              ))}
            </div>
          )}
        </div>
        {thumbs.length > 0 && (
          <div className="grid grid-cols-4 gap-2 w-full">
            {thumbs.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setImgIdx(i + 1)}
                aria-label={t.label}
                className={`aspect-square rounded-lg overflow-hidden bg-surface-container p-0.5 transition-all outline-none ${imgIdx === i + 1 ? '' : 'opacity-60'}`}
              >
                <div className="w-full h-full rounded-md overflow-hidden bg-surface-container-low">
                  <img alt={t.label} className="w-full h-full object-cover" src={t.src} />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="px-4 mt-6 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em]">
            {product.categoryLabel}
          </span>
          <span className="font-technical-data text-technical-data text-outline shrink-0">SKU: {product.sku}</span>
        </div>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight">{product.title}</h2>
        <div className="flex items-baseline justify-between mt-1 gap-2 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md text-primary tracking-tight font-semibold">
              {formatMoney(price)} USD
            </span>
            {product.oldPrice && (
              <span className="font-technical-data text-technical-data text-on-surface-variant line-through opacity-60">
                {formatMoney(product.oldPrice)} USD
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/10">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="font-label-caps text-label-caps text-tertiary">{product.stockLabel}</span>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">{product.description}</p>
      </section>

      {(product.metals || product.sizes || product.engravable) && (
        <section className="px-4 mt-8 flex flex-col gap-6">
          {product.metals && (
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Pureza &amp; Metal</label>
                <span className="font-technical-data text-technical-data text-primary font-medium">{selectedMetalLabel}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {product.metals.map((m) => {
                  const active = sel.metal?.name === m.name
                  return (
                    <button
                      key={m.name}
                      onClick={() => pickMetal(m)}
                      className={`flex items-center gap-2.5 p-3 rounded-lg transition-all text-left ${active ? 'bg-surface-container-high' : 'bg-surface-container opacity-70 hover:opacity-100'}`}
                    >
                      <span
                        className="w-5 h-5 rounded-full shadow-inner shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: METAL_COLORS[m.name] }}
                      >
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-on-primary opacity-80" />}
                      </span>
                      <div className="min-w-0 flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface truncate">{m.name}</span>
                        <span className="font-technical-data text-technical-data text-on-surface-variant">{m.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {product.sizes && (
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Talla de Anillo (US / España)
                </label>
                <button
                  onClick={() => setGuideOpen(true)}
                  className="flex items-center gap-1 font-technical-data text-technical-data text-primary"
                >
                  <span className="material-symbols-outlined text-[16px]">straighten</span>
                  Guía de Tallas
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((s) => {
                  const active = sel.size === s.size
                  return (
                    <button
                      key={s.size}
                      onClick={() => setSel((x) => ({ ...x, size: s.size }))}
                      className={`py-2.5 rounded-lg font-label-md text-label-md flex flex-col items-center justify-center transition-colors ${active ? 'bg-primary text-on-primary font-semibold shadow-md' : 'bg-surface-container text-on-surface'}`}
                    >
                      <span>{s.size}</span>
                      <span className={`font-technical-data text-[10px] ${active ? 'text-on-primary opacity-80' : 'text-outline'}`}>
                        {s.mm}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="flex items-start gap-1.5 font-technical-data text-technical-data text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                <span>
                  ¿Buscas una medida especial o media talla? Tenemos varias opciones para que encuentres el ajuste perfecto.{' '}
                  <a
                    href={specialMeasureConsult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-on-surface transition-colors"
                  >
                    Escríbenos por WhatsApp
                  </a>{' '}
                  y nuestro equipo te asesorará personalmente.
                </span>
              </div>
            </div>
          )}

          {product.engravable && (
            <div className="rounded-xl bg-surface-container-low p-4 flex flex-col gap-3">
              <button onClick={() => setEngraveOn((v) => !v)} className="flex items-center gap-3 text-left" aria-pressed={engraveOn}>
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${engraveOn ? 'bg-primary text-on-primary' : 'bg-surface-container text-transparent'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </span>
                <span className="font-label-md text-label-md text-on-surface flex-1">Añadir grabado láser interior</span>
                <span className="font-label-caps text-[10px] text-tertiary uppercase">Cortesía</span>
              </button>
              {engraveOn && (
                <>
                  <div className="relative">
                    <input
                      value={engraving}
                      maxLength={28}
                      onChange={(e) => setEngraving(e.target.value)}
                      placeholder="Texto, fecha o iniciales..."
                      className="w-full h-11 px-3 pr-14 bg-surface-container text-on-surface font-body-sm text-body-sm rounded-lg placeholder:text-outline/70 focus:outline-none"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center font-technical-data text-[10px] text-outline">
                      {engraving.length}/28
                    </span>
                  </div>
                  <div className="rounded-lg bg-surface-container-lowest p-3 text-center">
                    <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider block mb-1">
                      Previsualización de grabado al diamante:
                    </span>
                    <span className="font-title-editorial italic text-primary">
                      {engraving.trim() ? `“${engraving}”` : '“Sin grabado”'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}

      <section className="px-4 mt-8 flex flex-col gap-3">
        <button
          onClick={add}
          className="w-full h-12 rounded-lg bg-primary text-on-primary font-label-md text-label-md tracking-wider uppercase font-semibold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(230,194,118,0.2)] active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">local_mall</span>
          Añadir a la Bolsa — {formatMoney(price)} USD
        </button>
        <a
          href={consult}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-11 rounded-lg bg-surface-container-high text-on-surface font-label-md text-[13px] flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors text-center px-3"
        >
          <span className="material-symbols-outlined text-tertiary text-[20px]">chat</span>
          Consultar con Concierge por WhatsApp
        </a>
        <div className="flex items-center justify-center gap-6 font-technical-data text-technical-data text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]">security</span>
            Recogida en tienda
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]">restart_alt</span>
            Devolución a 30 días
          </span>
        </div>
      </section>

      <section className="px-4 mt-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Especificaciones de Taller</h3>
          <span className="flex items-center gap-1 font-label-caps text-[10px] text-primary uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            Garantía de oro de por vida
          </span>
        </div>
        <dl className="rounded-xl bg-surface-container-low divide-y divide-outline-variant/30">
          {product.specs.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-4 py-3">
              <dt className="font-label-caps text-[10px] text-outline uppercase tracking-wider shrink-0 pt-0.5">{k}</dt>
              <dd className="font-body-sm text-body-sm text-on-surface text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-4 mt-8 flex flex-col gap-2">
        {ACCORDIONS.map((a, i) => {
          const open = openAcc === i
          return (
            <div key={a.title} className="rounded-xl bg-surface-container-low overflow-hidden">
              <button
                onClick={() => setOpenAcc(open ? null : i)}
                aria-expanded={open}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span className="material-symbols-outlined text-primary text-[22px]">{a.icon}</span>
                <span className="font-label-md text-label-md text-on-surface flex-1">{a.title}</span>
                <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              {open && (
                <div className="px-4 pb-4 flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
                  {a.body.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </section>

      <Related product={product} />

      {guideOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70" onClick={() => setGuideOpen(false)}>
          <div
            className="w-full max-w-[480px] bg-surface-container rounded-t-2xl p-5 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">straighten</span>
                <h4 className="font-title-editorial text-title-editorial text-on-surface">Guía de Tallas Altezza</h4>
              </div>
              <button aria-label="Cerrar" onClick={() => setGuideOpen(false)} className="text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Mida el diámetro interno de un anillo existente que le ajuste a la perfección en milímetros exactos.
            </p>
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="font-label-caps text-[10px] text-outline uppercase tracking-wider">
                <tr>
                  <th className="py-2">US / INT</th>
                  <th>España / EU</th>
                  <th>Diámetro (mm)</th>
                </tr>
              </thead>
              <tbody className="text-on-surface">
                {SIZE_GUIDE.map((r) => (
                  <tr key={r[0]} className="border-t border-outline-variant/30">
                    {r.map((c) => (
                      <td key={c} className="py-2">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setGuideOpen(false)}
              className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold uppercase tracking-wider"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductDetail() {
  const { id = '' } = useParams()
  const { data: product, loading, error } = useAsync(() => getProduct(id), [id])

  useEffect(() => {
    if (product) document.title = `${product.name} — ${BRAND.name}`
    return () => {
      document.title = BRAND.name
    }
  }, [product])

  if (loading) {
    return <div className="px-4 pt-6"><div className="aspect-[4/5] rounded-xl bg-surface-container animate-pulse" /></div>
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center text-center gap-3 px-6 py-24">
        <span className="material-symbols-outlined text-[44px] text-outline">cloud_off</span>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">No pudimos cargar esta pieza</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{error.message}</p>
        <Link to="/catalogo" className="font-label-caps text-label-caps text-primary uppercase tracking-wider">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center text-center gap-3 px-6 py-24">
        <span className="material-symbols-outlined text-[44px] text-outline">diamond</span>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Pieza no encontrada</h1>
        <Link to="/catalogo" className="font-label-caps text-label-caps text-primary uppercase tracking-wider">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  return <ProductView key={product.id} product={product} />
}
