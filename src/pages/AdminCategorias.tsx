import { useEffect, useState } from 'react'
import { createCategory, deleteCategory, getAdminCategories, updateCategory } from '../services/productService'
import type { AdminCategory } from '../services/productService'
import type { CategoryKind } from '../types'

const CATEGORY_TYPES: { value: CategoryKind; label: string }[] = [
  { value: 'oro', label: 'Oro / joyería' },
  { value: 'relojes', label: 'Relojes' },
  { value: 'perfumeria', label: 'Perfumería' },
]

const normalizeCategoryId = (value: string) => value
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')

const buildCategoryId = (name: string, existing: AdminCategory[]) => {
  const base = normalizeCategoryId(name) || 'categoria'
  const used = new Set(existing.map((category) => category.id))
  const candidates = [base, `${base}-${Date.now().toString().slice(-4)}`]

  for (const candidate of candidates) {
    if (!used.has(candidate)) return candidate
  }

  let index = 1
  let id = `${base}-${Date.now().toString().slice(-4)}-${index}`
  while (used.has(id)) {
    index += 1
    id = `${base}-${Date.now().toString().slice(-4)}-${index}`
  }
  return id
}

export default function AdminCategorias() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [newName, setNewName] = useState('')
  const [newKind, setNewKind] = useState<CategoryKind>('oro')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')
  const [draftNames, setDraftNames] = useState<Record<string, string>>({})
  const [draftKinds, setDraftKinds] = useState<Record<string, CategoryKind>>({})

  const reload = () => getAdminCategories().then((nextCategories) => {
    setCategories(nextCategories)
    setDraftNames(Object.fromEntries(nextCategories.map((category) => [category.id, category.name])))
    setDraftKinds(Object.fromEntries(nextCategories.map((category) => [category.id, category.kind ?? 'oro'])))
  }).catch((e: unknown) => {
    setError(e instanceof Error ? e.message : 'No se pudieron cargar las categorías.')
  }).finally(() => setLoading(false))

  useEffect(() => {
    document.title = 'Altezza Admin — Categorías'
    void reload()
  }, [])

  const save = async (category: AdminCategory, changes: { name?: string; active?: boolean; kind?: CategoryKind }) => {
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
    const trimmedName = newName.trim()
    if (!trimmedName) return
    const generatedId = buildCategoryId(trimmedName, categories)
    setError('')
    try {
      await createCategory({
        id: generatedId as AdminCategory['id'],
        name: trimmedName,
        sort_order: categories.length + 1,
        active: true,
        kind: newKind,
      })
      setNewName('')
      setNewKind('oro')
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la categoría.')
    }
  }

  const remove = async (category: AdminCategory) => {
    const confirmed = window.confirm(`¿Seguro que quieres eliminar la categoría "${category.name}"?\n\nSi tiene productos asociados, no se podrá borrar.`)
    if (!confirmed) return
    setError('')
    try {
      await deleteCategory(category.id)
      await reload()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo eliminar la categoría.'
      setError(message)
    }
  }

  return (
    <section className="space-y-4 px-4 py-4">
      <header>
        <span className="mb-1 block font-label-caps text-[10px] uppercase tracking-widest text-primary">Organización</span>
        <h1 className="font-headline-lg-mobile text-[28px] leading-9 text-on-surface">Categorías</h1>
      </header>

      {error && <p role="alert" className="rounded-xl border border-error/40 bg-error-container/20 p-3 text-sm text-error">{error}</p>}

      <form onSubmit={add} className="space-y-3 rounded-xl bg-surface-container p-4">
        <h2 className="font-title-editorial text-base text-on-surface">Añadir categoría</h2>
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          required
          placeholder="Nombre de la categoría"
          className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface placeholder:text-outline"
        />
        <select
          value={newKind}
          onChange={(event) => setNewKind(event.target.value as CategoryKind)}
          className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface"
        >
          {CATEGORY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <button type="submit" className="min-h-11 w-full rounded-lg bg-primary font-medium text-on-primary">Guardar categoría</button>
      </form>

      {loading ? <p className="p-6 text-center text-on-surface-variant">Cargando categorías…</p> : categories.map((category) => (
        <article key={category.id} className="space-y-3 rounded-xl bg-surface-container p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-technical-data text-[11px] uppercase text-outline">{category.id}</span>
            <span className={`rounded-full px-2.5 py-1 text-[10px] ${category.active ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container-high text-outline'}`}>{category.active ? 'Activa' : 'Inactiva'}</span>
          </div>
          <input
            aria-label={`Nombre de ${category.id}`}
            value={draftNames[category.id] ?? category.name}
            onChange={(event) => {
              const nextValue = event.target.value
              setDraftNames((current) => ({ ...current, [category.id]: nextValue }))
            }}
            onBlur={(event) => {
              const name = event.currentTarget.value.trim()
              const currentName = category.name.trim()
              if (!name) {
                setDraftNames((current) => ({ ...current, [category.id]: currentName }))
                return
              }
              const kind = draftKinds[category.id] ?? category.kind ?? 'oro'
              if (name !== currentName || kind !== (category.kind ?? 'oro')) void save(category, { name, kind })
              else setDraftNames((current) => ({ ...current, [category.id]: currentName }))
            }}
            className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-base text-on-surface"
          />
          <select
            value={draftKinds[category.id] ?? category.kind ?? 'oro'}
            onChange={(event) => {
              const nextKind = event.target.value as CategoryKind
              setDraftKinds((current) => ({ ...current, [category.id]: nextKind }))
            }}
            onBlur={() => {
              const name = (draftNames[category.id] ?? category.name).trim()
              const kind = draftKinds[category.id] ?? category.kind ?? 'oro'
              if (name && (name !== category.name || kind !== (category.kind ?? 'oro'))) {
                void save(category, { name, kind })
              }
            }}
            className="min-h-11 w-full rounded-lg bg-surface-container-lowest px-3 text-on-surface"
          >
            {CATEGORY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
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
