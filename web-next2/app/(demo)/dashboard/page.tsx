"use client";
import { Box, Heading, Center } from '@chakra-ui/react'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { Section } from '#components/section'
import { PageTransition } from '#components/motion/page-transition'
import { Header } from '#components/layout/header'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from 'utils/supabase'

const Dashboard = () => {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

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
