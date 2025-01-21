import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'supabase.auth.token',
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: {
        getItem: (key) => {
          if (typeof window !== 'undefined') {
            // Check for website_opened flag in sessionStorage
            // sessionStorage clears when browser is closed
            if (!sessionStorage.getItem('website_opened')) {
              console.log('Fresh website visit - clearing auth')
              localStorage.clear()
              sessionStorage.setItem('website_opened', 'true')
              return null
            }
            return localStorage.getItem(key)
          }
          return null
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, value)
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(key)
          }
        },
      },
    },
  }
)