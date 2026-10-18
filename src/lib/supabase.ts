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
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null

export const isSupabaseConfigured = supabase !== null
