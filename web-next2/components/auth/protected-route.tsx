'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from 'utils/supabase'
import { Center, Spinner } from '@chakra-ui/react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  //checks if the user has a valid session and then only renders children for that page if authenticated
  //so basically it guards any protected pages from unauth access

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login?return_to=/dashboard')
      } else {
        setIsAuthenticated(true)
      }
    }
    checkAuth()
  }, [router])

  if (!isAuthenticated) {
    return (
      <Center height="100vh">
        <Spinner 
          size="xl" 
          thickness="4px"
          speed="0.65s"
          color="purple.500"
        />
      </Center>
    )
  }

  return children
}
