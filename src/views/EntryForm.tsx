import { useState } from 'react'
import type { MealEntry } from '../types'
import { uploadMealImage } from '../lib/storage'
import { ImageUploadField } from './ImageUploadField'

const inputClass =
  'w-full rounded-xl bg-surface px-4 py-2.5 text-base text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent'
const labelClass = 'text-sm font-medium text-muted'

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
  const [entryId] = useState(initial?.id ?? crypto.randomUUID())
  const [date, setDate] = useState(initial?.date ?? today())
  const [description, setDescription] = useState(initial?.description ?? '')
  const [place, setPlace] = useState(initial?.place.join(', ') ?? '')
  const [mealTags, setMealTags] = useState(initial?.mealTags.join(', ') ?? '')
  const [insulinDose, setInsulinDose] = useState(initial?.insulinDose?.toString() ?? '')
  const [preBolusMinutes, setPreBolusMinutes] = useState(initial?.preBolusMinutes?.toString() ?? '0')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [foodPhotoFile, setFoodPhotoFile] = useState<File | null>(null)
  const [dexcomFile, setDexcomFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const foodPhotoUrl = foodPhotoFile
        ? await uploadMealImage(entryId, foodPhotoFile, 'food')
        : initial?.foodPhotoUrl
      const dexcomScreenshotUrl = dexcomFile
        ? await uploadMealImage(entryId, dexcomFile, 'dexcom')
        : initial?.dexcomScreenshotUrl

      onSave({
        id: entryId,
        date,
        description,
        place: place.split(',').map((p) => p.trim()).filter(Boolean),
        mealTags: mealTags.split(',').map((t) => t.trim()).filter(Boolean),
        insulinDose: parseFloat(insulinDose) || 0,
        preBolusMinutes: parseInt(preBolusMinutes, 10) || 0,
        foodPhotoUrl,
        dexcomScreenshotUrl,
        notes: notes || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-base font-display [font-variant:small-caps] text-fg">{title}</h2>

      {error && <p className="text-sm text-red-500">{error}</p>}

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
        <ImageUploadField
          label="Food photo"
          existingPath={initial?.foodPhotoUrl}
          onFileSelected={setFoodPhotoFile}
        />
        <ImageUploadField
          label="Dexcom screenshot"
          existingPath={initial?.dexcomScreenshotUrl}
          onFileSelected={setDexcomFile}
        />
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
            className="flex-1 rounded-xl bg-surface text-fg font-medium py-2.5"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-accent text-bg font-medium py-2.5 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save entry'}
        </button>
      </div>
    </form>
  )
}
