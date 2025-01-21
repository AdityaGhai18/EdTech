"use client";
import { Box, Heading, Center, Spinner } from '@chakra-ui/react'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { Section } from '#components/section'
import { PageTransition } from '#components/motion/page-transition'
import { Header } from '#components/layout/header'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from 'utils/supabase'
import ProtectedRoute from '#components/auth/protected-route'

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
      }
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <Center height="100vh" flexDirection="column" gap={4}>
        <Spinner size="xl" />
        <Heading size="md">Loading...</Heading>
      </Center>
    )
  }

  return (
    <ProtectedRoute>
      <Header />
      <Section height="100vh">
        <BackgroundGradient 
          zIndex="-1"
          width="full"
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
        />
        <PageTransition>
          <Center height="full">
            <Heading size="2xl">Dashboard</Heading>
          </Center>
        </PageTransition>
      </Section>
    </ProtectedRoute>
  )
}

export default Dashboard
