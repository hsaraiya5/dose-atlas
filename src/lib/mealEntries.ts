import { supabase } from './supabaseClient'
import type { MealEntry } from '../types'

type MealEntryRow = {
  id: string
  date: string
  description: string
  place: string[]
  meal_tags: string[]
  insulin_dose: number
  pre_bolus_minutes: number
  food_photo_path: string | null
  dexcom_screenshot_path: string | null
  notes: string | null
}

function rowToEntry(row: MealEntryRow): MealEntry {
  return {
    id: row.id,
    date: row.date,
    description: row.description,
    place: row.place,
    mealTags: row.meal_tags,
    insulinDose: row.insulin_dose,
    preBolusMinutes: row.pre_bolus_minutes,
    foodPhotoUrl: row.food_photo_path ?? undefined,
    dexcomScreenshotUrl: row.dexcom_screenshot_path ?? undefined,
    notes: row.notes ?? undefined,
  }
}

function entryToRow(entry: MealEntry) {
  return {
    date: entry.date,
    description: entry.description,
    place: entry.place,
    meal_tags: entry.mealTags,
    insulin_dose: entry.insulinDose,
    pre_bolus_minutes: entry.preBolusMinutes,
    notes: entry.notes ?? null,
  }
}

export async function listMealEntries(): Promise<MealEntry[]> {
  const { data, error } = await supabase
    .from('meal_entries')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data as MealEntryRow[]).map(rowToEntry)
}

export async function createMealEntry(entry: MealEntry): Promise<MealEntry> {
  const { data, error } = await supabase
    .from('meal_entries')
    .insert(entryToRow(entry))
    .select()
    .single()
  if (error) throw error
  return rowToEntry(data as MealEntryRow)
}

export async function updateMealEntry(entry: MealEntry): Promise<MealEntry> {
  const { data, error } = await supabase
    .from('meal_entries')
    .update(entryToRow(entry))
    .eq('id', entry.id)
    .select()
    .single()
  if (error) throw error
  return rowToEntry(data as MealEntryRow)
}

export async function deleteMealEntry(id: string): Promise<void> {
  const { error } = await supabase.from('meal_entries').delete().eq('id', id)
  if (error) throw error
}
