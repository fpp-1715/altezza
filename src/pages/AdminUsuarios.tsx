import { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  changeAdminUserEmail,
  changeAdminUserPassword,
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
} from '../services/adminUserService'
import type { AdminUser } from '../services/adminUserService'

export default function AdminUsuarios() {
  const { user: currentEmail } = useAdminAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwords, setPasswords] = useState<Record<string, string>>({})
  const [emails, setEmails] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const reload = useCallback(async () => {
    try {
      setUsers(await getAdminUsers())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las cuentas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Altezza Admin — Usuarios'
    let active = true
    void getAdminUsers().then((accounts) => {
      if (active) setUsers(accounts)
    }).catch((e: unknown) => {
      if (active) setError(e instanceof Error ? e.message : 'No se pudieron cargar las cuentas.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const addUser = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await createAdminUser(email.trim(), password)
      setEmail('')
      setPassword('')
      setNotice('Cuenta creada. Ya puede iniciar sesión en el panel.')
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la cuenta.')
    } finally {
      setSaving(false)
    }
  }

  const updatePassword = async (account: AdminUser) => {
    const nextPassword = passwords[account.id] ?? ''
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await changeAdminUserPassword(account.id, nextPassword)
      setPasswords((current) => ({ ...current, [account.id]: '' }))
      setNotice(`Contraseña actualizada para ${account.email}.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar la contraseña.')
    } finally {
      setSaving(false)
    }
  }

  const updateEmail = async (account: AdminUser) => {
    const nextEmail = emails[account.id]?.trim() ?? ''
    if (!nextEmail) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await changeAdminUserEmail(account.id, nextEmail)
      setEmails((current) => ({ ...current, [account.id]: '' }))
      setNotice(`Correo actualizado para ${account.email}.`)
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el correo.')
    } finally {
      setSaving(false)
    }
  }

  const removeUser = async (account: AdminUser) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${account.email}? Esta acción no se puede deshacer.`)) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await deleteAdminUser(account.id)
      setNotice(`Cuenta de ${account.email} eliminada.`)
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar la cuenta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      <header>
        <h1 className="font-title-editorial text-2xl text-primary">Usuarios del panel</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Cada cuenta inicia sesión con su propio correo y contraseña.</p>
      </header>

      {error && <p role="alert" className="rounded-lg border border-error/30 bg-error-container/20 p-3 text-sm text-error">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">{notice}</p>}

      <form onSubmit={addUser} className="flex flex-col gap-3 rounded-xl bg-surface-container p-4">
        <h2 className="font-label-md text-label-md text-on-surface">Agregar cuenta</h2>
        <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
          Correo electrónico
          <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
          Contraseña inicial
          <input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface" />
        </label>
        <button disabled={saving} className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-on-primary disabled:opacity-50">
          {saving ? 'Guardando…' : 'Crear cuenta'}
        </button>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="font-label-md text-label-md text-on-surface">Cuentas existentes</h2>
        {loading ? <p className="text-sm text-on-surface-variant">Cargando cuentas…</p> : users.length === 0 ? (
          <p className="rounded-xl bg-surface-container p-4 text-sm text-on-surface-variant">No se encontraron cuentas.</p>
        ) : users.map((account) => (
          <article key={account.id} className="flex flex-col gap-3 rounded-xl bg-surface-container p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-on-surface">{account.email}</p>
                <p className="mt-1 text-xs text-on-surface-variant">Creada: {new Date(account.created_at).toLocaleDateString()}</p>
              </div>
              {account.email.toLowerCase() !== currentEmail?.toLowerCase() && (
                <button type="button" disabled={saving} onClick={() => void removeUser(account)} className="shrink-0 rounded-lg border border-error/40 px-3 py-2 text-xs text-error disabled:opacity-50">
                  Eliminar
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                autoComplete="email"
                aria-label={`Nuevo correo para ${account.email}`}
                placeholder="Nuevo correo"
                value={emails[account.id] ?? ''}
                onChange={(event) => setEmails((current) => ({ ...current, [account.id]: event.target.value }))}
                className="h-10 min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-xs text-on-surface"
              />
              <button type="button" disabled={saving || !(emails[account.id] ?? '').trim()} onClick={() => void updateEmail(account)} className="rounded-lg bg-surface-container-high px-3 text-xs text-primary disabled:opacity-50">
                Cambiar correo
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                minLength={6}
                autoComplete="new-password"
                aria-label={`Nueva contraseña para ${account.email}`}
                placeholder="Nueva contraseña (mínimo 6)"
                value={passwords[account.id] ?? ''}
                onChange={(event) => setPasswords((current) => ({ ...current, [account.id]: event.target.value }))}
                className="h-10 min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-xs text-on-surface"
              />
              <button type="button" disabled={saving || (passwords[account.id] ?? '').length < 6} onClick={() => void updatePassword(account)} className="rounded-lg bg-surface-container-high px-3 text-xs text-primary disabled:opacity-50">
                Cambiar
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
