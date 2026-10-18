import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/productService'
import type { Product } from '../types'
import { formatMoney } from '../lib/config'

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Altezza Admin — Dashboard Ejecutivo'
    getProducts().then((p) => {
      setProducts(p)
      setLoading(false)
    })
  }, [])

  const totalValue = products.reduce((acc, p) => acc + (p.price || 0), 0)
  const bovedaCount = products.filter((p) => p.availability === 'boveda').length
  const encargoCount = products.filter((p) => p.availability === 'encargo').length
  const featuredCount = products.filter((p) => p.featured).length

  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto space-y-8">
      {/* Header & Executive Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#c6a45b]/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">
              Centro de Operaciones Atelier
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface mt-1">
            Dashboard Ejecutivo &amp; Resumen
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Supervisión integral de piezas de alta joyería, perfumería exclusiva e inventario tasado.
          </p>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/productos"
            className="px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:text-primary hover:bg-surface-variant font-label-md text-label-md flex items-center gap-2 border border-outline-variant/40 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            <span>Ver Catálogo Completo</span>
          </Link>
          <Link
            to="/admin/productos/nuevo"
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold tracking-wider flex items-center gap-2 shadow-[0_4px_16px_rgba(230,194,118,0.25)] hover:bg-primary-fixed transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Añadir Nueva Pieza</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Piezas en Bóveda / Catálogo */}
        <div className="relative flex flex-col justify-between p-6 rounded-xl bg-surface-container-low shadow-md overflow-hidden group hover:bg-surface-container transition-colors border border-outline-variant/30">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
              Total Colección
            </span>
            <span className="p-2 rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[20px]">diamond</span>
            </span>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display-hero text-[40px] text-on-surface font-normal">
                {loading ? '...' : products.length}
              </span>
              <span className="font-body-sm text-outline">obras registradas</span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest font-technical-data text-[11px] text-tertiary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> {bovedaCount} Inmediatas
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest font-technical-data text-[11px] text-secondary">
                {encargoCount} Por Encargo
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 text-outline font-technical-data text-technical-data border-t border-outline-variant/20">
            <span>Disponibilidad Inmediata</span>
            <span className="text-on-surface font-medium">
              {products.length > 0 ? `${Math.round((bovedaCount / products.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* KPI 2: Valuación Tasada del Inventario */}
        <div className="relative flex flex-col justify-between p-6 rounded-xl bg-surface-container-low shadow-md overflow-hidden group hover:bg-surface-container transition-colors border border-outline-variant/30">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
              Valuación Tasada
            </span>
            <span className="p-2 rounded-lg bg-surface-container-high text-secondary">
              <span className="material-symbols-outlined text-[20px]">assured_workload</span>
            </span>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-1">
              <span className="font-title-editorial text-[28px] text-primary">$</span>
              <span className="font-display-hero text-[40px] text-on-surface font-normal">
                {loading ? '...' : totalValue.toLocaleString('en-US')}
              </span>
              <span className="font-technical-data text-outline text-[12px] ml-1">USD</span>
            </div>
            <p className="font-technical-data text-technical-data text-outline mt-2 flex items-center gap-1.5">
              <span className="text-tertiary flex items-center">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +3.8%
              </span>
              estimado de valor de mercado
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 text-outline font-technical-data text-technical-data border-t border-outline-variant/20">
            <span>Margen Promedio Joyas</span>
            <span className="text-secondary font-medium">42.5%</span>
          </div>
        </div>

        {/* KPI 3: Destacados de Bóveda */}
        <div className="relative flex flex-col justify-between p-6 rounded-xl bg-surface-container-low shadow-md overflow-hidden group hover:bg-surface-container transition-colors border border-outline-variant/30">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
              Selección Curada
            </span>
            <span className="p-2 rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </span>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-3">
              <span className="font-display-hero text-[40px] text-on-surface font-normal">
                {loading ? '...' : featuredCount}
              </span>
              <span className="font-body-sm text-outline">piezas en portada</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-technical-data text-[12px] text-secondary bg-secondary-container/40 px-2.5 py-0.5 rounded-full">
                Exhibición VIP
              </span>
              <span className="font-technical-data text-technical-data text-outline">Portada Home</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 text-outline font-technical-data text-technical-data border-t border-outline-variant/20">
            <span>Canal Principal</span>
            <span className="text-on-surface">Maison Atelier</span>
          </div>
        </div>

        {/* KPI 4: Concierge WhatsApp */}
        <div className="relative flex flex-col justify-between p-6 rounded-xl bg-surface-container-low shadow-md overflow-hidden group hover:bg-surface-container transition-colors border border-outline-variant/30">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
              Concierge WhatsApp
            </span>
            <span className="p-2 rounded-lg bg-surface-container-high text-tertiary">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </span>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display-hero text-[40px] text-on-surface font-normal">
                +53 53765926
              </span>
            </div>
            <p className="font-technical-data text-technical-data text-outline mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              Línea Directa de Pedidos
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 text-outline font-technical-data text-technical-data border-t border-outline-variant/20">
            <span>Modalidad</span>
            <span className="text-on-surface">Cita y Entrega Asistida</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (60% Recent Products / 40% Inventory & Quick Tools) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Products Overview (7 Cols) */}
        <div className="lg:col-span-8 bg-surface-container-low p-6 rounded-2xl shadow-lg border border-outline-variant/30 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-title-editorial text-[20px] text-on-surface font-semibold">
                Piezas Recientes en Bóveda
              </h2>
              <p className="font-technical-data text-technical-data text-on-surface-variant">
                Últimas incorporaciones al catálogo con acceso rápido de edición y visualización.
              </p>
            </div>
            <Link
              to="/admin/productos"
              className="font-label-caps text-[11px] text-primary uppercase tracking-wider hover:underline flex items-center gap-1"
            >
              <span>Ver todas ({products.length})</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container text-outline font-label-caps text-[10px] tracking-wider uppercase border-b border-outline-variant/40">
                <tr>
                  <th className="py-3 px-3">Pieza</th>
                  <th className="py-3 px-4">Nombre &amp; SKU</th>
                  <th className="py-3 px-3">Categoría</th>
                  <th className="py-3 px-3 text-right">Precio Base</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-sm text-[13px]">
                {products.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container transition-colors">
                    <td className="py-3 px-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden border border-outline-variant/40">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface hover:text-primary transition-colors">
                          {p.name}
                        </span>
                        <span className="font-technical-data text-[11px] text-primary font-mono">
                          {p.sku}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded bg-surface-container font-technical-data text-[11px] text-on-surface-variant">
                        {p.categoryLabel || p.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-primary">
                      {formatMoney(p.price)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-technical-data text-[10px] ${
                          p.availability === 'boveda'
                            ? 'bg-tertiary-container/30 text-tertiary border border-tertiary/30'
                            : 'bg-secondary-container/40 text-secondary border border-secondary/30'
                        }`}
                      >
                        {p.availability === 'boveda' ? 'Inmediata' : 'Por Encargo'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/admin/productos/${p.id}`}
                        className="p-1.5 rounded-lg bg-surface-container text-on-surface hover:text-primary hover:bg-surface-container-high transition-colors inline-flex items-center"
                        title="Editar Pieza"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Status & Category Distribution (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Action Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-container-low to-surface-container border border-primary/20 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">sparkles</span>
              </div>
              <div>
                <h3 className="font-title-editorial text-[17px] text-primary font-semibold">
                  Acciones Rápidas
                </h3>
                <span className="font-technical-data text-[11px] text-outline">
                  Gestión del inventario
                </span>
              </div>
            </div>
            <p className="font-body-sm text-[13px] text-on-surface-variant">
              Incorpore nuevas gemas, relojes o perfumes directamente o revise la configuración de promociones de temporada.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/admin/productos/nuevo"
                className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-md text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Crear Nuevo Producto</span>
              </Link>
              <Link
                to="/admin/ofertas"
                className="w-full h-11 rounded-lg bg-surface-container-high text-on-surface font-label-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">percent</span>
                <span>Gestionar Ofertas &amp; Sets</span>
              </Link>
            </div>
          </div>

          {/* Boutique Details Card */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
            <h3 className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
              Datos de la Tienda
            </h3>
            <div className="space-y-3 font-body-sm text-[13px]">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">
                  location_on
                </span>
                <div>
                  <span className="text-on-surface font-medium block">Ubicación Física:</span>
                  <span className="text-on-surface-variant">
                    Villuendas #54 entre Padre Chao y Trista, dentro del taller de teléfonos Otro Nivel
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
                  chat
                </span>
                <div>
                  <span className="text-on-surface font-medium block">Línea WhatsApp:</span>
                  <span className="text-on-surface-variant">+53 53765926</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
                  database
                </span>
                <div>
                  <span className="text-on-surface font-medium block">Persistencia Local:</span>
                  <span className="text-tertiary font-technical-data text-[12px]">
                    Activa (localStorage ayg_products_v1)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
