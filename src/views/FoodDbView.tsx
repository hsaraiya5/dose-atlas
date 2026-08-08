import { useEffect, useMemo, useState } from 'react'
import type { FoodDbEntry } from '../types'
import { listFoodDb, createFoodDbItem, updateFoodDbItem, deleteFoodDbItem } from '../lib/foodDb'
import { FoodDbForm } from './FoodDbForm'

type Screen = { screen: 'list' } | { screen: 'add' } | { screen: 'edit'; id: string }

export function FoodDbView() {
  const [items, setItems] = useState<FoodDbEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>({ screen: 'list' })
  const [query, setQuery] = useState('')

  useEffect(() => {
    listFoodDb()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) => item.name.toLowerCase().includes(q) || item.notes?.toLowerCase().includes(q),
    )
  }, [items, query])

  async function handleSave(item: FoodDbEntry) {
    try {
      const exists = items.some((i) => i.id === item.id)
      const saved = exists ? await updateFoodDbItem(item) : await createFoodDbItem(item)
      setItems((prev) => (exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved]))
      setScreen({ screen: 'list' })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFoodDbItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      setScreen({ screen: 'list' })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  if (loading) {
    return <p className="text-sm text-muted text-center py-8">Loading...</p>
  }

  if (screen.screen === 'add') {
    return <FoodDbForm onSave={handleSave} onCancel={() => setScreen({ screen: 'list' })} />
  }

  if (screen.screen === 'edit') {
    const item = items.find((i) => i.id === screen.id)
    if (!item) return null
    return (
      <FoodDbForm
        initial={item}
        onSave={handleSave}
        onCancel={() => setScreen({ screen: 'list' })}
        onDelete={() => handleDelete(item.id)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <input
        type="text"
        placeholder="Search food DB..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl bg-surface shadow-[0_2px_8px_-5px_rgba(0,0,0,0.25)] px-4 py-2.5 text-base text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />

      <button
        onClick={() => setScreen({ screen: 'add' })}
        className="rounded-xl bg-surface text-accent font-medium py-2.5"
      >
        + Add food item
      </button>

      <div className="flex flex-col gap-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen({ screen: 'edit', id: item.id })}
            className="text-left rounded-xl bg-surface shadow-[0_3px_10px_-6px_rgba(0,0,0,0.28)] p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-base font-semibold text-fg">{item.name}</p>
              {item.notes && <p className="text-xs text-muted mt-1">{item.notes}</p>}
            </div>
            <div className="text-right shrink-0">
              {item.typicalDose !== undefined && (
                <p className="text-sm font-semibold text-dose tabular-nums">{item.typicalDose}u</p>
              )}
              {item.carbs !== undefined && <p className="text-[11px] text-muted mt-1">{item.carbs}g carbs</p>}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No matches.</p>
        )}
      </div>
    </div>
  )
}
