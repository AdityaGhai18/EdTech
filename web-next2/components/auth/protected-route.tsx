'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from 'utils/supabase'
import { Center, Spinner, Heading } from '@chakra-ui/react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login?return_to=/dashboard')
      }
    }
    checkAuth()
  }, [router])

  return children
}
