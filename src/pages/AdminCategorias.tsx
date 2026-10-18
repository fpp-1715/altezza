import { useEffect, useState } from 'react'
import { createCategory, deleteCategory, getAdminCategories, updateCategory } from '../services/productService'
import type { AdminCategory } from '../services/productService'
import type { CategoryKey } from '../types'

const CATEGORY_CHOICES: { id: CategoryKey; label: string }[] = [
  { id: 'cadenas', label: 'Cadenas' },
  { id: 'anillos', label: 'Anillos y alianzas' },
  { id: 'collares', label: 'Collares' },
  { id: 'pulseras', label: 'Pulseras' },
  { id: 'relojes', label: 'Relojes' },
  { id: 'perfumeria', label: 'Perfumería' },
]

export default function AdminCategorias() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [newId, setNewId] = useState<CategoryKey | ''>('')
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')

  const reload = () => getAdminCategories().then(setCategories).catch((e: unknown) => {
    setError(e instanceof Error ? e.message : 'No se pudieron cargar las categorías.')
  }).finally(() => setLoading(false))

  useEffect(() => {
    document.title = 'Altezza Admin — Categorías'
    void reload()
  }, [])

  const save = async (category: AdminCategory, changes: { name?: string; active?: boolean }) => {
    setSavingId(category.id)
    setError('')
    try {
      await updateCategory(category.id, changes)
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar la categoría.')
    } finally {
      setSavingId('')
    }
  }

  const add = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newId || !newName.trim()) return
    setError('')
    try {
      await createCategory({ id: newId, name: newName.trim(), sort_order: categories.length + 1, active: true })
      setNewId('')
      setNewName('')
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la categoría.')
    }
  }

  const remove = async (category: AdminCategory) => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"? Si tiene productos asociados, Supabase rechazará la operación.`)) return
    setError('')
    try {
      await deleteCategory(category.id)
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar la categoría.')
    }
  }

  const unusedChoices = CATEGORY_CHOICES.filter((choice) => !categories.some((category) => category.id === choice.id))

  return (
    <section className="space-y-4 px-4 py-4">
      <header>
        <span className="mb-1 block font-label-caps text-[10px] uppercase tracking-widest text-primary">Organización</span>
        <h1 className="font-headline-lg-mobile text-[28px] leading-9 text-on-surface">Categorías</h1>
      </header>

      {error && <p role="alert" className="rounded-xl border border-error/40 bg-error-container/20 p-3 text-sm text-error">{error}</p>}

      {unusedChoices.length > 0 && (
        <form onSubmit={add} className="space-y-3 rounded-xl bg-surface-container p-4">
          <h2 className="font-title-editorial text-base text-on-surface">Añadir categoría</h2>
          <select value={newId} onChange={(event) => setNewId(event.target.value as CategoryKey | '')} required className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface">
            <option value="">Seleccionar categoría disponible</option>
            {unusedChoices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
          </select>
          <input value={newName} onChange={(event) => setNewName(event.target.value)} required placeholder="Nombre visible" className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface placeholder:text-outline" />
          <button type="submit" className="min-h-11 w-full rounded-lg bg-primary font-medium text-on-primary">Guardar categoría</button>
        </form>
      )}

      {loading ? <p className="p-6 text-center text-on-surface-variant">Cargando categorías…</p> : categories.map((category) => (
        <article key={category.id} className="space-y-3 rounded-xl bg-surface-container p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-technical-data text-[11px] uppercase text-outline">{category.id}</span>
            <span className={`rounded-full px-2.5 py-1 text-[10px] ${category.active ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container-high text-outline'}`}>{category.active ? 'Activa' : 'Inactiva'}</span>
          </div>
          <input aria-label={`Nombre de ${category.id}`} defaultValue={category.name} key={`${category.id}-${category.name}`} onBlur={(event) => {
            const name = event.currentTarget.value.trim()
            if (name && name !== category.name) void save(category, { name })
          }} className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-base text-on-surface" />
          <div className="grid grid-cols-2 gap-2">
            <button disabled={savingId === category.id} onClick={() => void save(category, { active: !category.active })} className="min-h-10 rounded-lg bg-surface-container-highest text-sm text-on-surface disabled:opacity-50">
              {category.active ? 'Desactivar' : 'Activar'}
            </button>
            <button onClick={() => void remove(category)} className="min-h-10 rounded-lg bg-surface-container-highest text-sm text-error">Eliminar</button>
          </div>
        </article>
      ))}
    </section>
  )
}
