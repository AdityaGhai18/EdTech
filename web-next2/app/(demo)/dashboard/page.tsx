"use client";
import { Box, Heading, Center, Spinner, Text } from '@chakra-ui/react'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { Section } from '#components/section'
import { PageTransition } from '#components/motion/page-transition'
import { Header } from '#components/layout/header'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from 'utils/supabase'
import ProtectedRoute from '#components/auth/protected-route'

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) throw error
          setProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

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
          <Center flexDirection="column" pt={8}>
            <Heading size="lg" mb={8}>Dashboard</Heading>
            {loading ? (
              <Spinner size="xl" />
            ) : (
              <Heading size="2xl">
                Welcome, {profile?.first_name} {profile?.last_name}!
              </Heading>
            )}
          </Center>
        </PageTransition>
      </Section>
    </ProtectedRoute>
  )
}

export default Dashboard
