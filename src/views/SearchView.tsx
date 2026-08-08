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
  const path = entry.dexcomScreenshotUrl ?? entry.foodPhotoUrl
  if (path) {
    return (
      <StorageImage
        path={path}
        alt=""
        className="h-12 w-12 shrink-0 rounded-lg object-cover bg-bg"
      />
    )
  }
  return (
    <div className="h-12 w-12 shrink-0 rounded-lg bg-bg flex items-center justify-center text-muted">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="4" width="15" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="7" cy="8.5" r="1.4" stroke="currentColor" strokeWidth="1.1" />
        <path d="M4 14 L8.5 10 L12 12.5 L16 9" stroke="currentColor" strokeWidth="1.1" />
      </svg>
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
        className="w-full rounded-xl bg-surface shadow-[0_2px_8px_-5px_rgba(0,0,0,0.25)] px-4 py-2.5 text-base text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onFilterPlace(placeFilter === tag ? null : tag)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
              placeFilter === tag
                ? 'bg-accent text-bg font-medium'
                : 'bg-surface text-muted'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {(placeFilter || dateFilter) && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {placeFilter && <>Showing {filtered.length} at <span className="font-medium text-fg">{placeFilter}</span></>}
            {placeFilter && dateFilter && ' · '}
            {dateFilter && <>On <span className="font-medium text-fg">{formatDate(dateFilter)}</span></>}
          </span>
          <button
            onClick={() => {
              onFilterPlace(null)
              onFilterDate(null)
            }}
            className="text-accent"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelectEntry(entry.id)}
            className="text-left rounded-xl bg-surface shadow-[0_3px_10px_-6px_rgba(0,0,0,0.28)] p-4 flex items-center gap-3"
          >
            <EntryThumbnail entry={entry} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-fg">{entry.description}</p>
              <p className="text-xs text-muted mt-1">
                {entry.place.join(', ')} · {formatDate(entry.date)}
              </p>
              {entry.notes && <p className="text-xs text-muted truncate mt-1">{entry.notes}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-dose-fg bg-dose rounded-full px-2 py-0.5 tabular-nums">
                {entry.insulinDose}u
              </p>
              {entry.preBolusMinutes > 0 && (
                <p className="text-[11px] text-muted mt-1.5">pre-bolused {entry.preBolusMinutes}m</p>
              )}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No entries match.</p>
        )}
      </div>
    </div>
  )
}
