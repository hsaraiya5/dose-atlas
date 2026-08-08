import { useState } from 'react'
import type { FoodDbEntry } from '../types'

const inputClass =
  'w-full rounded-xl bg-surface px-4 py-2.5 text-base text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent'
const labelClass = 'text-sm font-medium text-muted'

export function FoodDbForm({
  initial,
  onSave,
  onCancel,
  onDelete,
}: {
  initial?: FoodDbEntry
  onSave: (item: FoodDbEntry) => void
  onCancel: () => void
  onDelete?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [carbs, setCarbs] = useState(initial?.carbs?.toString() ?? '')
  const [typicalDose, setTypicalDose] = useState(initial?.typicalDose?.toString() ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name,
      carbs: carbs ? parseFloat(carbs) : undefined,
      typicalDose: typicalDose ? parseFloat(typicalDose) : undefined,
      notes: notes || undefined,
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-base font-display [font-variant:small-caps] text-fg">{initial ? 'Edit food item' : 'Add food item'}</h2>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Name</label>
        <input className={inputClass} placeholder="e.g. Poha" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Carbs (g)</label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            className={inputClass}
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Typical dose (units)</label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            className={inputClass}
            value={typicalDose}
            onChange={(e) => setTypicalDose(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Notes</label>
        <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-surface text-fg font-medium py-2.5"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-accent text-bg font-medium py-2.5"
        >
          Save
        </button>
      </div>

      {onDelete && (
        <button type="button" onClick={onDelete} className="text-sm text-red-500">
          Delete item
        </button>
      )}
    </form>
  )
}
