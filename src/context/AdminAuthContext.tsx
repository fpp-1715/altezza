import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AdminAuth = {
  user: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuth | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let mounted = true

    const applySession = async (session: Session | null) => {
      if (!session?.user) {
        if (mounted) setUser(null)
        return
      }
      if (mounted) setUser(session.user.email ?? 'Usuario autenticado')
    }

    void client.auth.getSession().then(({ data, error }) => {
      if (error) console.error('No se pudo recuperar la sesión de Supabase:', error)
      return applySession(data.session)
    }).finally(() => {
      if (mounted) setLoading(false)
    })

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void applySession(session).finally(() => {
          if (mounted) setLoading(false)
        })
      }, 0)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase no está configurado. Revisa las variables de entorno.')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setUser(data.user.email ?? email)
  }

  const logout = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading])
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
