import { supabase } from './supabaseClient'
import type { FoodDbEntry } from '../types'

type FoodDbRow = {
  id: string
  name: string
  carbs: number | null
  typical_dose: number | null
  notes: string | null
}

function rowToItem(row: FoodDbRow): FoodDbEntry {
  return {
    id: row.id,
    name: row.name,
    carbs: row.carbs ?? undefined,
    typicalDose: row.typical_dose ?? undefined,
    notes: row.notes ?? undefined,
  }
}

function itemToRow(item: FoodDbEntry) {
  return {
    name: item.name,
    carbs: item.carbs ?? null,
    typical_dose: item.typicalDose ?? null,
    notes: item.notes ?? null,
  }
}

export async function listFoodDb(): Promise<FoodDbEntry[]> {
  const { data, error } = await supabase.from('food_db').select('*').order('name', { ascending: true })
  if (error) throw error
  return (data as FoodDbRow[]).map(rowToItem)
}

export async function createFoodDbItem(item: FoodDbEntry): Promise<FoodDbEntry> {
  const { data, error } = await supabase.from('food_db').insert(itemToRow(item)).select().single()
  if (error) throw error
  return rowToItem(data as FoodDbRow)
}

export async function updateFoodDbItem(item: FoodDbEntry): Promise<FoodDbEntry> {
  const { data, error } = await supabase
    .from('food_db')
    .update(itemToRow(item))
    .eq('id', item.id)
    .select()
    .single()
  if (error) throw error
  return rowToItem(data as FoodDbRow)
}

export async function deleteFoodDbItem(id: string): Promise<void> {
  const { error } = await supabase.from('food_db').delete().eq('id', id)
  if (error) throw error
}
