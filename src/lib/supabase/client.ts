import { createClient, SupabaseClient } from '@supabase/supabase-js'

let instance: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient {
  if (!instance) {
    instance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'
    )
  }
  return instance
}