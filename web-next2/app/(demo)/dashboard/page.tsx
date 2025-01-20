"use client";
import { Box, Heading, Center, Spinner } from '@chakra-ui/react'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { Section } from '#components/section'
import { PageTransition } from '#components/motion/page-transition'
import { Header } from '#components/layout/header'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from 'utils/supabase'

const Dashboard = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth in dashboard...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session check:', session)
        
        if (!session) {
          if (retryCount < 3) {
            console.log('No session, retrying...', retryCount)
            setRetryCount(prev => prev + 1)
            setTimeout(checkAuth, 1000)
            return
          }
          console.log('No session after retries, redirecting to login')
          window.location.replace('/login')
          return
        }

        console.log('User authenticated:', session.user.email)
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        window.location.replace('/login')
      }
    }
    checkAuth()
  }, [retryCount])

  if (isLoading) {
    return (
      <Center height="100vh" flexDirection="column" gap={4}>
        <Spinner size="xl" />
        <Heading size="md">Loading...</Heading>
      </Center>
    )
  }

  return (
    <>
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
    </>
  )
}

export default Dashboard
