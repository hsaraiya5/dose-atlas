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
        <button onClick={onBack} className="text-sm text-neutral-500">← Back</button>
        <button
          onClick={onEdit}
          className="text-sm font-medium text-purple-600 dark:text-purple-400"
        >
          Edit
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold">{entry.description}</h2>
        <button
          onClick={() => onSelectDate(entry.date)}
          className="text-sm text-neutral-500 underline decoration-dotted"
        >
          {formatDate(entry.date)}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {entry.place.map((p) => (
          <button
            key={p}
            onClick={() => onSelectPlace(p)}
            className="rounded-full px-3 py-1 text-sm border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400"
          >
            📍 {p}
          </button>
        ))}
        {entry.mealTags.map((t) => (
          <span
            key={t}
            className="rounded-full px-3 py-1 text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
          <p className="text-xs text-neutral-400">Insulin dose</p>
          <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{entry.insulinDose}u</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
          <p className="text-xs text-neutral-400">Pre-bolused</p>
          <p className="text-lg font-semibold">
            {entry.preBolusMinutes > 0 ? `${entry.preBolusMinutes} min` : 'No'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {entry.foodPhotoUrl ? (
          <StorageImage
            path={entry.foodPhotoUrl}
            alt="Food"
            className="h-28 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
            onClick={() => setLightbox({ path: entry.foodPhotoUrl!, alt: 'Food' })}
          />
        ) : (
          <div className="h-28 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 text-sm">
            📷 No food photo
          </div>
        )}
        {entry.dexcomScreenshotUrl ? (
          <StorageImage
            path={entry.dexcomScreenshotUrl}
            alt="Dexcom graph"
            className="h-28 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
            onClick={() => setLightbox({ path: entry.dexcomScreenshotUrl!, alt: 'Dexcom graph' })}
          />
        ) : (
          <div className="h-28 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 text-sm">
            📈 No Dexcom graph
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
          <p className="text-xs text-neutral-400 mb-1">Notes</p>
          <p className="text-sm">{entry.notes}</p>
        </div>
      )}

      <button onClick={onDelete} className="text-sm text-red-500 mt-2">
        Delete entry
      </button>
    </div>
  )
}
