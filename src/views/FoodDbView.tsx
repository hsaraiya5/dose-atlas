import type { FoodDbEntry } from '../types'

export function FoodDbView({ items }: { items: FoodDbEntry[] }) {
  return (
    <div className="flex flex-col gap-4">
      <button className="rounded-lg border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-medium py-2.5">
        + Add food item
      </button>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
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
      </div>
    </div>
  )
}
