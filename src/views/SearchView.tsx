import { useMemo, useState } from 'react'
import type { MealEntry } from '../types'
import { StorageImage } from './StorageImage'

function formatDate(iso: string) {
  // Parse as local date components, not UTC - `new Date(iso)` treats "YYYY-MM-DD"
  // as UTC midnight, which can display as the previous day in US timezones.
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function EntryThumbnail({ entry }: { entry: MealEntry }) {
  const path = entry.foodPhotoUrl ?? entry.dexcomScreenshotUrl
  if (path) {
    return (
      <StorageImage
        path={path}
        alt=""
        className="h-12 w-12 shrink-0 rounded-md object-cover bg-neutral-100 dark:bg-neutral-800"
      />
    )
  }
  return (
    <div className="h-12 w-12 shrink-0 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 text-xs">
      🍽️
    </div>
  )
}

export function SearchView({
  entries,
  placeFilter,
  dateFilter,
  onFilterPlace,
  onFilterDate,
  onSelectEntry,
}: {
  entries: MealEntry[]
  placeFilter: string | null
  dateFilter: string | null
  onFilterPlace: (place: string | null) => void
  onFilterDate: (date: string | null) => void
  onSelectEntry: (id: string) => void
}) {
  const [query, setQuery] = useState('')

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    entries.forEach((e) => e.place.forEach((p) => tags.add(p)))
    return Array.from(tags)
  }, [entries])

  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        const matchesQuery = query.trim() === '' ||
          e.description.toLowerCase().includes(query.toLowerCase()) ||
          e.mealTags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
        const matchesPlace = !placeFilter || e.place.includes(placeFilter)
        const matchesDate = !dateFilter || e.date === dateFilter
        return matchesQuery && matchesPlace && matchesDate
      })
      .sort((a, b) => b.date.localeCompare(a.date)) // timeline: most recent first
  }, [entries, query, placeFilter, dateFilter])

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search meals..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onFilterPlace(placeFilter === tag ? null : tag)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm border transition-colors ${
              placeFilter === tag
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {(placeFilter || dateFilter) && (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>
            {placeFilter && <>Showing {filtered.length} at <span className="font-medium">{placeFilter}</span></>}
            {placeFilter && dateFilter && ' · '}
            {dateFilter && <>On <span className="font-medium">{formatDate(dateFilter)}</span></>}
          </span>
          <button
            onClick={() => {
              onFilterPlace(null)
              onFilterDate(null)
            }}
            className="text-purple-600 dark:text-purple-400"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelectEntry(entry.id)}
            className="text-left rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 flex items-center gap-3"
          >
            <EntryThumbnail entry={entry} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.description}</p>
              <p className="text-xs text-neutral-500">
                {entry.place.join(', ')} · {formatDate(entry.date)}
              </p>
              {entry.notes && <p className="text-xs text-neutral-400 truncate mt-0.5">{entry.notes}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{entry.insulinDose}u</p>
              {entry.preBolusMinutes > 0 && <p className="text-[11px] text-neutral-400">pre-bolused</p>}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">No entries match.</p>
        )}
      </div>
    </div>
  )
}
