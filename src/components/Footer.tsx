import { Link } from 'react-router-dom'
import { BRAND, whatsappUrl } from '../lib/config'

export function Footer() {
  return (
    <footer className="pt-10 pb-8 px-5 bg-surface-container-lowest text-on-surface-variant">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3 text-primary">
          <span className="font-title-editorial text-[20px] font-bold tracking-[0.15em]">A&amp;G</span>
        </div>
        <span className="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase block font-semibold">
          Joyería | Perfumería
        </span>
        <p className="font-technical-data text-technical-data text-on-surface-variant/70 mt-1 max-w-[240px]">
          Maison fundada sobre la devoción a las proporciones áureas y las esencias más puras.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8 text-left">
        <div>
          <h5 className="font-label-caps text-[11px] text-on-surface uppercase tracking-[0.18em] mb-3 font-semibold">
            Boutique &amp; Cita
          </h5>
          <ul className="flex flex-col gap-2 font-body-sm text-[13px] text-on-surface-variant">
            <li>{BRAND.address}</li>
            <li>Lun a Sáb: 11:00 - 19:30</li>
            <li>Citas privadas con reserva</li>
            <li>{BRAND.email}</li>
          </ul>
        </div>
        <div>
          <h5 className="font-label-caps text-[11px] text-on-surface uppercase tracking-[0.18em] mb-3 font-semibold">
            Colecciones
          </h5>
          <ul className="flex flex-col gap-2 font-body-sm text-[13px] text-on-surface-variant">
            <li><Link className="hover:text-primary transition-colors" to="/catalogo?cat=anillos">Alianzas y Bodas</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/catalogo?cat=cadenas">Cadenas Macizas</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/catalogo?cat=relojes">Horlogerie Suizo</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/catalogo?cat=perfumeria">Perfumes de Extrait</Link></li>
          </ul>
        </div>
      </div>
      <div className="pt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          {[
            { label: 'Instagram', icon: 'photo_camera', href: 'https://instagram.com' },
            { label: 'Ubicación Boutique', icon: 'location_on', href: `https://maps.google.com/?q=${encodeURIComponent(BRAND.address)}` },
            { label: 'Email Maison', icon: 'mail', href: `mailto:${BRAND.email}` },
            { label: 'WhatsApp', icon: 'chat', href: whatsappUrl('Hola A&G, deseo información.') },
          ].map((s) => (
            <a
              key={s.label}
              aria-label={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
            </a>
          ))}
        </div>
        <div className="text-center font-technical-data text-[11px] text-on-surface-variant/50">
          <p>© {new Date().getFullYear()} A&amp;G Haute Joaillerie &amp; Parfumerie. Todos los derechos reservados.</p>
          <p className="mt-0.5">Certificación gemológica internacional y metales éticos.</p>
        </div>
      </div>
    </footer>
  )
}
