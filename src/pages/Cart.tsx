import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatMoney, whatsappUrl } from '../lib/config'
export default function Cart() {
  const { items, count, subtotal, updateQty, removeItem } = useCart()

  const message =
    `Hola Altezza, quisiera consultar la disponibilidad de estos productos:\n` +
    items.map((i) => `• ${i.qty}x ${i.name} — ${formatMoney(i.qty * i.unitPrice)} USD`).join('\n') +
    `\nTotal: ${formatMoney(subtotal)} USD.\n¿Me confirman si están disponibles? Los recogería en la tienda. Para consultar sobre domicilio, por favor indíquenme las opciones.`

  if (items.length === 0) {
    return (
      <div className="mx-auto flex flex-col items-center text-center gap-3 px-6 py-24 md:min-h-[60vh]">
        <span className="material-symbols-outlined text-[48px] text-outline">shopping_bag</span>
        <p className="font-headline-sm text-headline-sm text-on-surface">Bolsa sin piezas</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">
          Su cofre de compras se encuentra vacío en este momento.
        </p>
        <Link
          to="/catalogo"
          className="mt-3 h-11 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold uppercase tracking-wider flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">west</span>
          Explorar la Colección
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 pt-3 md:px-8 md:pt-8">
      <div>
        <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] block mb-1">
          Selección Privada
        </span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
          Bolsa de Compras{' '}
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            ({count} {count === 1 ? 'pieza seleccionada' : 'piezas seleccionadas'})
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {items.map((i) => (
          <article key={i.lineId} className="flex gap-3 p-3 rounded-xl bg-surface-container-low">
            <Link to={`/producto/${i.productId}`} className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container-lowest shrink-0">
              <img alt={i.name} className="w-full h-full object-cover" src={i.image} />
            </Link>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-label-caps text-[10px] text-primary uppercase tracking-wider block">{i.eyebrow}</span>
                  <h2 className="font-title-editorial text-[15px] leading-snug text-on-surface line-clamp-2">{i.name}</h2>
                </div>
                <button
                  aria-label="Eliminar artículo"
                  onClick={() => removeItem(i.lineId)}
                  className="text-on-surface-variant hover:text-error transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
              <div className="font-technical-data text-[11px] text-on-surface-variant mt-1 leading-snug">
                {i.variant && <p>{i.variant}</p>}
                {i.engraving && <p>Grabado: “{i.engraving}”</p>}
                <p className="text-outline">SKU: {i.sku}</p>
              </div>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <div className="flex items-center rounded-lg bg-surface-container">
                  <button
                    aria-label="Disminuir cantidad"
                    onClick={() => updateQty(i.lineId, -1)}
                    disabled={i.qty <= 1}
                    className="w-8 h-8 text-on-surface disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-label-md text-label-md text-on-surface">{i.qty}</span>
                  <button
                    aria-label="Aumentar cantidad"
                    onClick={() => updateQty(i.lineId, 1)}
                    className="w-8 h-8 text-on-surface"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <span className="font-technical-data text-[10px] text-outline block">{formatMoney(i.unitPrice)} c/u</span>
                  <span className="font-headline-sm text-[16px] text-primary font-semibold">
                    {formatMoney(i.qty * i.unitPrice)} USD
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-xl bg-surface-container p-4 flex flex-col gap-3">
        <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
          <span>Subtotal</span>
          <span className="text-on-surface">{formatMoney(subtotal)} USD</span>
        </div>
        <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
            Recogida en tienda
          </span>
          <span className="text-tertiary shrink-0 ml-2">Coordinar por WhatsApp</span>
        </div>
        <div className="pt-3 border-t border-outline-variant/40 flex items-end justify-between">
          <div>
            <span className="font-label-caps text-[10px] text-secondary uppercase tracking-[0.2em] block">Inversión Final</span>
            <span className="font-title-editorial text-title-editorial text-on-surface">Total Estimado</span>
          </div>
          <span className="font-headline-md text-headline-md text-primary font-semibold">{formatMoney(subtotal)} USD</span>
        </div>
      </section>

      <section className="rounded-xl bg-gradient-to-r from-surface-container to-surface-container-high p-5 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">support_agent</span>
          </div>
          <div>
            <span className="font-label-caps text-[10px] uppercase tracking-[0.25em] text-secondary block">
              Servicio Privado de Concierge
            </span>
            <h3 className="font-title-editorial text-title-editorial text-on-surface">Atención Exclusiva y Pago Asistido</h3>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Confirma la disponibilidad por WhatsApp. Todos los productos se recogen en la tienda; consulta por WhatsApp si deseas información sobre domicilio.
        </p>
        <div className="rounded-lg bg-surface-container-lowest p-3">
          <span className="flex items-center gap-1.5 font-label-caps text-[10px] text-tertiary uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[14px]">chat</span>
            Mensaje oficial generado
          </span>
          <p className="font-technical-data text-[11px] text-on-surface-variant whitespace-pre-line">{message}</p>
        </div>
        <a
          href={whatsappUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 rounded-lg bg-primary text-on-primary font-label-md text-label-md tracking-wider uppercase font-semibold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(230,194,118,0.2)] active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          Enviar Pedido por WhatsApp
        </a>
        <Link
          to="/catalogo"
          className="w-full h-11 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-primary text-[18px]">west</span>
          Continuar Explorando la Colección
        </Link>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center pb-4">
        {[
          { icon: 'verified_user', t: 'Garantía de Casa', s: 'Oro 18K & Joyas GIA' },
          { icon: 'diversity_1', t: 'Atención VIP', s: 'Asesoría individual' },
          { icon: 'lock_clock', t: 'Sello Hermético', s: 'Custodia intacta' },
        ].map((b) => (
          <div key={b.t} className="rounded-xl bg-surface-container-low p-3 flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[22px]">{b.icon}</span>
            <span className="font-label-md text-[12px] text-on-surface">{b.t}</span>
            <span className="font-technical-data text-[10px] text-on-surface-variant">{b.s}</span>
          </div>
        ))}
      </section>
    </div>
  )
}
