import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CartItem } from '../types'

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  updateQty: (lineId: string, delta: number) => void
  removeItem: (lineId: string) => void
  clear: () => void
  toast: string | null
  showToast: (message: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'ayg-cart-v1'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const addItem = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === item.lineId)
      if (existing) {
        return prev.map((i) => (i.lineId === item.lineId ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { ...item, qty }]
    })
  }, [])

  const updateQty = useCallback((lineId: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.lineId === lineId ? { ...i, qty: Math.max(1, i.qty + delta) } : i)),
    )
  }, [])

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId))
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const showToast = useCallback((message: string) => setToast(message), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.unitPrice, 0),
      addItem,
      updateQty,
      removeItem,
      clear,
      toast,
      showToast,
    }),
    [items, addItem, updateQty, removeItem, clear, toast, showToast],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
