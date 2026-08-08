import { supabase } from './supabaseClient'

const BUCKET = 'meal-images'

export async function uploadMealImage(
  entryId: string,
  file: File,
  kind: 'food' | 'dexcom',
): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw userError ?? new Error('Not authenticated')

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userData.user.id}/${entryId}/${kind}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) throw error
  return path
}

// Signed URLs are minted fresh on every call, never cached - see Technical Design
// for why (avoids tracking/refreshing expiry for a single-user app at this scale).
export async function getSignedImageUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}
