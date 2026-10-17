import { useCart } from '../context/CartContext'

export function Toast() {
  const { toast } = useCart()
  return (
    <div
      role="status"
      className={`fixed bottom-20 inset-x-0 mx-auto w-max max-w-[90%] px-4 py-2.5 rounded-lg bg-surface-container-highest/95 backdrop-blur-md shadow-xl text-on-surface font-body-sm text-body-sm flex items-center gap-2 pointer-events-none transition-opacity duration-300 z-[70] ${toast ? 'opacity-100' : 'opacity-0'}`}
    >
      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
      <span>{toast}</span>
    </div>
  )
}
