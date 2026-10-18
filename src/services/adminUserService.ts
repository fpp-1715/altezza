import { supabase } from '../lib/supabase'

export type AdminUser = {
  id: string
  email: string
  created_at: string
}

async function invoke<T>(body: Record<string, string>) {
  if (!supabase) throw new Error('Supabase no está configurado.')
  const { data, error } = await supabase.functions.invoke<{ data?: T; error?: string }>('admin-users', { body })
  if (error) {
    let message = error.message
    if ('context' in error && error.context instanceof Response) {
      try {
        const payload = await error.context.clone().json() as { error?: string }
        if (payload.error) message = payload.error
      } catch {
        // Keep the SDK error message when the response body is not JSON.
      }
    }
    throw new Error(`No se pudo gestionar el usuario: ${message}`)
  }
  if (!data || data.error) throw new Error(data?.error ?? 'La función de gestión de usuarios devolvió una respuesta inválida.')
  return data.data as T
}

export const getAdminUsers = () => invoke<AdminUser[]>({ action: 'list' })
export const createAdminUser = (email: string, password: string) => invoke<AdminUser>({ action: 'create', email, password })
export const changeAdminUserEmail = (userId: string, email: string) =>
  invoke<AdminUser>({ action: 'update_email', userId, email })
export const changeAdminUserPassword = (userId: string, password: string) =>
  invoke<AdminUser>({ action: 'update_password', userId, password })
export const deleteAdminUser = (userId: string) => invoke<{ id: string }>({ action: 'delete', userId })
