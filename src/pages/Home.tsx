import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { IMG } from '../data/images'
import { MASTER_CATEGORIES } from '../data/products'
import { formatMoney, whatsappUrl } from '../lib/config'
import { useAsync } from '../lib/useAsync'
import { getActiveOffers, offerToProduct } from '../services/offerService'
import { getProducts } from '../services/productService'

const PILLARS = [
  { icon: 'verified', title: 'Garantía de oro de por vida', text: 'Cada pieza de oro cuenta con garantía de por vida.' },
  { icon: 'workspace_premium', title: 'Calidad y diseño', text: 'Joyería de oro y diseños seleccionados, elaborados en fábrica.' },
  { icon: 'storefront', title: 'Recogida en tienda', text: 'Consulta la disponibilidad y coordina la recogida por WhatsApp. Para domicilio, consúltanos por WhatsApp.' },
]

export default function Home() {
  const { data: products, loading: featuredLoading, error: featuredError } = useAsync(async () => {
    const [catalogProducts, activeOffers] = await Promise.all([getProducts(), getActiveOffers()])
    const offerProducts = catalogProducts.filter((product) => product.oldPrice && product.oldPrice > product.price)
    return [...offerProducts, ...activeOffers.map(offerToProduct)]
  }, [])
  const cards = products ?? []

  return (
    <div className="flex flex-col w-full">
      <section className="relative w-full overflow-hidden bg-surface-container-lowest">
        <div className="relative w-full h-[520px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${IMG.hero}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/80 via-transparent to-transparent" />
          <div className="relative h-full px-5 pb-8 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.25em]">
                Joyería / Relojería / Perfumería
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight mb-3">
              La elegancia está <br />
              <span className="italic font-normal text-primary">en los detalles</span>
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[320px] mb-6 leading-relaxed">
              Joyas, relojes y fragancias seleccionados para acompañar tus momentos más trascendentes.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                to="/catalogo"
                className="w-full h-12 rounded-lg bg-primary text-on-primary font-label-md text-label-md tracking-wider uppercase font-semibold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(230,194,118,0.2)] transition-all duration-200 active:scale-[0.98]"
              >
                <span>Ver catálogo</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                to="/catalogo?orden=recientes"
                className="w-full h-11 rounded-lg bg-surface-container-high/60 backdrop-blur-md text-on-surface font-label-md text-label-md tracking-wider uppercase font-medium flex items-center justify-center gap-2 hover:bg-surface-variant transition-all duration-200"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                <span>Descubrir novedades</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-surface">
        <div className="px-5 mb-4 flex items-center justify-between">
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] block">
              Curaduría Exclusiva
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Categorías Maestras</h2>
          </div>
          <span className="font-technical-data text-technical-data text-on-surface-variant">4 Universos</span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 no-scrollbar py-1 snap-x">
          {MASTER_CATEGORIES.map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="flex-shrink-0 w-36 snap-start flex flex-col items-center group"
            >
              <div className="relative w-36 h-48 rounded-xl overflow-hidden bg-surface-container shadow-md group-hover:shadow-[0_4px_16px_rgba(230,194,118,0.15)] transition-all duration-300">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${c.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent" />
                <div className="absolute bottom-3 inset-x-3 text-center">
                  <span className="font-label-caps text-[10px] text-primary uppercase tracking-[0.18em] block mb-0.5">
                    {c.eyebrow}
                  </span>
                  <span className="font-title-editorial text-title-editorial text-on-surface leading-tight block">
                    {c.title}
                  </span>
                  <span className="font-technical-data text-[10px] text-on-surface-variant block mt-0.5">
                    {c.sub}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-6 px-5 bg-surface-container-low">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] block mb-1">
              Selección de Joyería y Perfumería
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Piezas Destacadas</h2>
          </div>
          <Link
            to="/catalogo"
            className="font-label-caps text-label-caps text-primary uppercase tracking-[0.18em] hover:text-on-surface flex items-center gap-1 transition-colors"
          >
            <span>Ver Todo</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>
        <div className="flex snap-x gap-3 overflow-x-auto px-0 pb-1 no-scrollbar">
          {featuredError ? (
            <p role="alert" className="py-4 font-body-sm text-body-sm text-on-surface-variant">
              No pudimos cargar los productos destacados desde Supabase: {featuredError.message}
            </p>
          ) : cards.length > 0
            ? cards.map((product) => {
                const card = (
                  <div className="group w-36 shrink-0 snap-start">
                    <div className="relative h-48 w-36 overflow-hidden rounded-xl bg-surface-container shadow-md transition-all duration-300 group-hover:shadow-[0_4px_16px_rgba(230,194,118,0.15)]">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent" />
                      <div className="absolute inset-x-3 bottom-3 text-center">
                        <span className="mb-0.5 block truncate font-label-caps text-[10px] uppercase tracking-[0.18em] text-primary">
                          {product.categoryLabel}
                        </span>
                        <span className="block line-clamp-2 font-title-editorial text-sm leading-tight text-on-surface">
                          {product.name}
                        </span>
                        <span className="mt-0.5 block font-label-caps text-[9px] uppercase tracking-wider text-secondary">Oferta</span>
                        <span className="mt-0.5 block font-technical-data text-[10px] text-on-surface-variant">
                          {formatMoney(product.price)} USD
                        </span>
                        <span className="block font-technical-data text-[9px] text-on-surface-variant line-through">{formatMoney(product.oldPrice ?? product.price)} USD</span>
                      </div>
                    </div>
                  </div>
                )

                return product.category === 'ofertas' ? (
                  <div key={product.id} className="shrink-0 snap-start">{card}</div>
                ) : (
                  <Link key={product.id} to={`/producto/${product.id}`} className="shrink-0 snap-start">
                    {card}
                  </Link>
                )
              })
            : featuredLoading ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 w-36 shrink-0 rounded-xl bg-surface-container animate-pulse" />
              )) : (
                <div className="py-4 font-body-sm text-body-sm text-on-surface-variant">
                  No hay productos en oferta en este momento.
                </div>
              )}
        </div>
      </section>

      <section className="relative w-full bg-surface-container-lowest">
        <div className="relative h-[430px] w-full">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${IMG.bodas}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/40 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-center items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary shadow-[0_0_12px_rgba(230,194,118,0.2)]">
              <span className="material-symbols-outlined text-[20px]">diamond</span>
            </div>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.25em] mb-1.5">
              Uniones Perpetuas
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
              Alianzas y Anillos <br />
              <span className="italic text-primary">de Matrimonio</span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[290px] mb-6 leading-relaxed">
              Cadenas, alianzas y anillos de oro elaborados en fábrica para acompañar momentos especiales.
            </p>
            <Link
              to="/catalogo?cat=anillos"
              className="w-full max-w-[280px] h-12 rounded-lg bg-surface-container-high/90 backdrop-blur-md text-on-surface font-label-md text-label-md tracking-wider uppercase font-semibold flex items-center justify-center gap-2 hover:bg-surface-variant active:scale-95 transition-all duration-200 shadow-lg"
            >
              <span className="text-primary font-bold">✦</span>
              <span>Ver Alianzas &amp; Asesoría</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 px-5 bg-surface-container-low">
        <div className="text-center mb-6">
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.22em] block mb-1">
            Compromiso Altezza
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Distinción &amp; Garantía</h3>
        </div>
        <div className="flex flex-col gap-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="p-4 rounded-xl bg-surface-container flex items-center gap-3.5 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary">
                <span className="material-symbols-outlined text-[24px]">{p.icon}</span>
              </div>
              <div className="flex flex-col">
                <h4 className="font-label-md text-label-md text-on-surface font-semibold">{p.title}</h4>
                <p className="font-technical-data text-technical-data text-on-surface-variant">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-surface-container to-surface-container-high flex flex-col items-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-primary/5 pointer-events-none" />
          <div className="w-10 h-10 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center mb-2.5">
            <span className="material-symbols-outlined text-[22px]">support_agent</span>
          </div>
          <span className="font-label-caps text-[10px] uppercase tracking-[0.25em] text-secondary mb-1">
            Servicio Privado de Concierge
          </span>
          <h3 className="font-title-editorial text-title-editorial text-on-surface mb-2 font-medium">
            ¿Desea una atención a la medida?
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 max-w-[280px]">
            Nuestros asesores de alta joyería y maestros perfumistas le asisten en tiempo real.
          </p>
          <a
            href={whatsappUrl('Hola Altezza, deseo una atención a la medida.')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(230,194,118,0.25)] active:scale-[0.98] transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>Atención Concierge por WhatsApp</span>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
