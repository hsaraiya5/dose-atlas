import { useState } from 'react'
import type { MealEntry } from '../types'

const inputClass =
  'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-purple-500'
const labelClass = 'text-sm font-medium text-neutral-600 dark:text-neutral-300'

function today() {
  // Local calendar date, not UTC - toISOString() would roll over a day early/late
  // depending on timezone (e.g. shows tomorrow's date in the evening in US timezones).
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function EntryForm({
  title,
  initial,
  onSave,
  onCancel,
}: {
  title: string
  initial?: MealEntry
  onSave: (entry: MealEntry) => void
  onCancel: () => void
}) {
  const [date, setDate] = useState(initial?.date ?? today())
  const [description, setDescription] = useState(initial?.description ?? '')
  const [place, setPlace] = useState(initial?.place.join(', ') ?? '')
  const [mealTags, setMealTags] = useState(initial?.mealTags.join(', ') ?? '')
  const [insulinDose, setInsulinDose] = useState(initial?.insulinDose?.toString() ?? '')
  const [preBolusMinutes, setPreBolusMinutes] = useState(initial?.preBolusMinutes?.toString() ?? '0')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      date,
      description,
      place: place.split(',').map((p) => p.trim()).filter(Boolean),
      mealTags: mealTags.split(',').map((t) => t.trim()).filter(Boolean),
      insulinDose: parseFloat(insulinDose) || 0,
      preBolusMinutes: parseInt(preBolusMinutes, 10) || 0,
      foodPhotoUrl: initial?.foodPhotoUrl,
      dexcomScreenshotUrl: initial?.dexcomScreenshotUrl,
      notes: notes || undefined,
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-base font-semibold">{title}</h2>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Date</label>
        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Description</label>
        <textarea
          className={inputClass}
          rows={2}
          placeholder="e.g. Chicken tikka, rice, side salad"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Place</label>
        <input
          className={inputClass}
          placeholder="e.g. Ambar"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Meal tags</label>
        <input
          className={inputClass}
          placeholder="e.g. chicken, rice"
          value={mealTags}
          onChange={(e) => setMealTags(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Insulin dose (units)</label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            className={inputClass}
            placeholder="7"
            value={insulinDose}
            onChange={(e) => setInsulinDose(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Pre-bolused (min before)</label>
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            className={inputClass}
            value={preBolusMinutes}
            onChange={(e) => setPreBolusMinutes(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 py-6 text-sm text-neutral-400 cursor-pointer">
          📷 Food photo
          <input type="file" accept="image/*" className="hidden" />
        </label>
        <label className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 py-6 text-sm text-neutral-400 cursor-pointer">
          📈 Dexcom screenshot
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Notes</label>
        <textarea
          className={inputClass}
          rows={2}
          placeholder="e.g. went for a walk 30 min after"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-3 mt-2">
        {initial && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 font-medium py-2.5"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-1 rounded-lg bg-purple-600 text-white font-medium py-2.5 hover:bg-purple-700 transition-colors"
        >
          Save entry
        </button>
      </div>
    </form>
  )
}
