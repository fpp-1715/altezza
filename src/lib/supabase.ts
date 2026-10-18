import { createClient } from '@supabase/supabase-js'

function getSupabaseProjectUrl(configuredUrl: string | undefined) {
  if (!configuredUrl) return undefined
  const url = new URL(configuredUrl)
  const dashboardProject = url.pathname.match(/^\/dashboard\/project\/([a-z0-9]+)\/?$/i)
  if (url.hostname === 'supabase.com' && dashboardProject) {
    return `https://${dashboardProject[1]}.supabase.co`
  }
  return url.origin
}

const supabaseUrl = getSupabaseProjectUrl(import.meta.env.VITE_SUPABASE_URL)
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isSupabaseConfigured = supabase !== null
