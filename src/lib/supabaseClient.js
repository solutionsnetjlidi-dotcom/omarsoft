import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '⚠️  Supabase: Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquantes.\n' +
    'Copiez .env.example → .env.local et remplissez vos clés Supabase.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Helper : upload d'un fichier dans Supabase Storage
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}

// Helper : supprimer un fichier de Storage
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

// Helper : extraire le path depuis une URL publique
export function extractStoragePath(publicUrl, bucket) {
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = publicUrl.indexOf(marker)
  return idx !== -1 ? publicUrl.substring(idx + marker.length) : null
}
