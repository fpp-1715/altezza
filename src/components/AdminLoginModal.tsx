import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLoginModal({
  open,
  onClose,
  onCancel,
  onLogin,
  disabled = false,
}: {
  open: boolean
  onClose: () => void
  onCancel?: () => void
  onLogin: (email: string, password: string) => Promise<void>
  disabled?: boolean
}) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const cancel = onCancel ?? onClose

  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!user.trim() || !pass.trim()) {
      setError('Por favor complete su usuario y clave de seguridad')
      return
    }
    try {
      await onLogin(user.trim(), pass)
      setUser('')
      setPass('')
      onClose()
      navigate('/admin')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesión.')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={cancel}
      />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md bg-[#0e0e0e] border border-[#c6a45b]/30 p-8 rounded-2xl shadow-2xl flex flex-col gap-5 text-on-surface"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
            </div>
            <div>
              <h3 className="font-title-editorial text-[20px] text-primary leading-tight">
                Acceso Atelier
              </h3>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                Gestión de Catálogo &amp; Joyería
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={cancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-body-sm text-[13px] text-on-surface-variant">
          Inicie sesión con un correo y contraseña válidos de una cuenta existente para acceder al panel.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">
              Correo electrónico
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                person
              </span>
              <input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                type="email"
                autoComplete="username"
                required
                placeholder="correo@ejemplo.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/60 text-on-surface font-body-sm text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                lock
              </span>
              <input
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                type="password"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/60 text-on-surface font-body-sm text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error-container/30 border border-error/30 flex items-center gap-2 text-error font-body-sm text-[12px]">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={disabled}
            className="flex-1 h-11 rounded-lg bg-primary text-on-primary font-label-md text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(230,194,118,0.25)] hover:bg-primary-fixed transition-colors cursor-pointer disabled:opacity-60"
          >
            <span>{disabled ? 'Verificando…' : 'Ingresar al Panel'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button
            type="button"
            onClick={cancel}
            className="h-11 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-md text-sm text-on-surface-variant transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
