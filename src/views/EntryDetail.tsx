import { useState } from 'react'
import type { MealEntry } from '../types'
import { StorageImage } from './StorageImage'

function formatDate(iso: string) {
  // Parse as local date components, not UTC - `new Date(iso)` treats "YYYY-MM-DD"
  // as UTC midnight, which can display as the previous day in US timezones.
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function EntryDetail({
  entry,
  onBack,
  onEdit,
  onDelete,
  onSelectPlace,
  onSelectDate,
}: {
  entry: MealEntry
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onSelectPlace: (place: string) => void
  onSelectDate: (date: string) => void
}) {
  const [lightbox, setLightbox] = useState<{ path: string; alt: string } | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted">← Back</button>
        <button
          onClick={onEdit}
          className="text-sm font-medium text-accent"
        >
          Edit
        </button>
      </div>

      <div>
        <h2 className="text-lg font-display [font-variant:small-caps] text-fg">{entry.description}</h2>
        <button
          onClick={() => onSelectDate(entry.date)}
          className="text-sm text-muted underline decoration-dotted"
        >
          {formatDate(entry.date)}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {entry.place.map((p) => (
          <button
            key={p}
            onClick={() => onSelectPlace(p)}
            className="rounded-full px-3 py-1 text-sm bg-surface text-accent font-medium"
          >
            {p}
          </button>
        ))}
        {entry.mealTags.map((t) => (
          <span
            key={t}
            className="rounded-full px-3 py-1 text-sm bg-surface text-muted"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface shadow-[0_3px_10px_-6px_rgba(0,0,0,0.28)] p-3">
          <p className="text-xs text-muted">Insulin dose</p>
          <p className="text-lg font-semibold text-dose tabular-nums">{entry.insulinDose}u</p>
        </div>
        <div className="rounded-xl bg-surface shadow-[0_3px_10px_-6px_rgba(0,0,0,0.28)] p-3">
          <p className="text-xs text-muted">Pre-bolused</p>
          <p className="text-lg font-semibold text-fg">
            {entry.preBolusMinutes > 0 ? `${entry.preBolusMinutes} min` : 'No'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {entry.foodPhotoUrl ? (
          <StorageImage
            path={entry.foodPhotoUrl}
            alt="Food"
            className="h-28 rounded-xl object-cover bg-surface cursor-pointer"
            onClick={() => setLightbox({ path: entry.foodPhotoUrl!, alt: 'Food' })}
          />
        ) : (
          <div className="h-28 rounded-xl bg-surface flex items-center justify-center text-muted text-sm">
            No food photo
          </div>
        )}
        {entry.dexcomScreenshotUrl ? (
          <StorageImage
            path={entry.dexcomScreenshotUrl}
            alt="Dexcom graph"
            className="h-28 rounded-xl object-cover bg-surface cursor-pointer"
            onClick={() => setLightbox({ path: entry.dexcomScreenshotUrl!, alt: 'Dexcom graph' })}
          />
        ) : (
          <div className="h-28 rounded-xl bg-surface flex items-center justify-center text-muted text-sm">
            No Dexcom graph
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <StorageImage
            path={lightbox.path}
            alt={lightbox.alt}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}

      {entry.notes && (
        <div>
          <p className="text-xs text-muted mb-1">Notes</p>
          <p className="text-sm text-fg">{entry.notes}</p>
        </div>
      )}

      <button onClick={onDelete} className="text-sm text-red-500 mt-2">
        Delete entry
      </button>
    </div>
  )
}
