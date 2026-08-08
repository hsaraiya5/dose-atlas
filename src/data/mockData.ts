import type { MealEntry, FoodDbEntry } from '../types'

export const mockMealEntries: MealEntry[] = [
  {
    id: '1',
    date: '2026-08-01',
    description: 'Chicken tikka, rice, side salad',
    place: ['Ambar'],
    mealTags: ['chicken', 'rice'],
    insulinDose: 7,
    preBolusMinutes: 15,
    notes: 'Trended slightly high after ~2hr',
  },
  {
    id: '2',
    date: '2026-07-18',
    description: 'Chicken kebab plate, naan',
    place: ['Ambar'],
    mealTags: ['chicken', 'naan'],
    insulinDose: 8,
    preBolusMinutes: 10,
    notes: 'Stable all evening',
  },
  {
    id: '3',
    date: '2026-07-02',
    description: 'Chicken tikka, rice',
    place: ['Ambar'],
    mealTags: ['chicken', 'rice'],
    insulinDose: 6,
    preBolusMinutes: 0,
    notes: 'Went low ~2hr later, had to correct with juice',
  },
  {
    id: '4',
    date: '2026-06-20',
    description: 'Daal bhaat rotli shaak',
    place: ["Parents' house"],
    mealTags: ['daal', 'rotli', 'rice'],
    insulinDose: 9,
    preBolusMinutes: 20,
    notes: 'Went for a 30 min walk after, stayed stable',
  },
]

export const mockFoodDb: FoodDbEntry[] = [
  { id: '1', name: 'Poha', carbs: 40, typicalDose: 4, notes: 'Bolused well the last few times' },
  { id: '2', name: 'Thepla (2)', carbs: 30, typicalDose: 3 },
  { id: '3', name: 'Idli (3)', carbs: 35, typicalDose: 3.5 },
]
