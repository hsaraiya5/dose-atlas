export type MealEntry = {
  id: string
  date: string // ISO date
  description: string
  place: string[]
  mealTags: string[]
  insulinDose: number
  preBolusMinutes: number // 0 means not pre-bolused
  foodPhotoUrl?: string
  dexcomScreenshotUrl?: string
  notes?: string
}

export type FoodDbEntry = {
  id: string
  name: string
  carbs?: number
  typicalDose?: number
  notes?: string
}
