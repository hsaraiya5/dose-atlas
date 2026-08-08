import { useMemo, useState } from 'react'
import type { FoodDbEntry } from '../types'

export function FoodDbView({ items }: { items: FoodDbEntry[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) => item.name.toLowerCase().includes(q) || item.notes?.toLowerCase().includes(q),
    )
  }, [items, query])

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search food DB..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <button className="rounded-lg border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-medium py-2.5">
        + Add food item
      </button>

      <div className="flex flex-col gap-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              {item.notes && <p className="text-xs text-neutral-400 mt-0.5">{item.notes}</p>}
            </div>
            <div className="text-right shrink-0">
              {item.typicalDose !== undefined && (
                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{item.typicalDose}u</p>
              )}
              {item.carbs !== undefined && <p className="text-[11px] text-neutral-400">{item.carbs}g carbs</p>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">No matches.</p>
        )}
      </div>
    </div>
  )
}
