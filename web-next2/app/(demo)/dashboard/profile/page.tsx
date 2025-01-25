"use client";
import { useState, useEffect } from 'react'
import { Box, Flex, Heading, Text, useToast, Center, Spinner, VStack, FormControl, FormLabel, Input, Button } from '@chakra-ui/react'
import { Sidebar } from '#components/dashboard/Sidebar'
import { PageTransition } from '#components/motion/page-transition'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { supabase } from 'utils/supabase'
import ProtectedRoute from '#components/auth/protected-route';

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const toast = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          toast({
            title: 'Not authenticated',
            description: 'Please login first',
            status: 'error',
            duration: 3000,
          })
          return
        }

        const profileResponse = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileResponse.error) throw profileResponse.error

        setProfile(profileResponse.data)
        setFirstName(profileResponse.data?.first_name || '')
        setLastName(profileResponse.data?.last_name || '')
        if (session?.user?.email) {
          setProfile(prevProfile => ({ ...prevProfile, email: session.user.email }));
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error)
        toast({
          title: 'Error fetching profile',
          description: error.message || 'Something went wrong',
          status: 'error',
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleUpdateProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: 'Not authenticated',
          description: 'Please login first',
          status: 'error',
          duration: 3000,
        })
        return
      }

      const updates = {
        id: session.user.id,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date(),
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
      })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error updating profile',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      })
    }
  }


  if (loading) {
    return (
      <ProtectedRoute>
        <Flex h="100vh">
          <Sidebar />
          <Center
            ml="240px"
            w="calc(100% - 240px)"
            bg="gray.900"
          >
            <Spinner
              size="xl"
              thickness="4px"
              speed="0.65s"
              color="purple.500"
            />
          </Center>
        </Flex>
      </ProtectedRoute>
    )
  }

  return (
    <Box minH="100vh" bg="gray.900">
      <Flex h="full">
        <Sidebar />
        <Box
          as="main"
          ml="240px"
          w="calc(100% - 240px)"
          minH="100vh"
          bg="gray.900"
          position="relative"
        >
          <BackgroundGradient
            zIndex="0"
            width="full"
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
          />
          <PageTransition>
            <Box maxW="container.xl" mx="auto" px={8} py={8}>
              <Heading size="lg" mb={8} color="white">
                Your Profile
              </Heading>

              <VStack spacing={6} maxW="md" align="stretch">
                <FormControl>
                  <FormLabel color="white">First Name</FormLabel>
                  <Input
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                    isReadOnly
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="white">Last Name</FormLabel>
                  <Input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                    isReadOnly
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="white">Email</FormLabel>
                  <Input
                    value={profile?.email}
                    isReadOnly
                    bg="whiteAlpha.100"
                    color="white"
                  />
                </FormControl>

                <Button
                  colorScheme="purple"
                  size="lg"
                  onClick={handleUpdateProfile}
                >
                  Update Profile
                </Button>
              </VStack>
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  )
}

export default ProfilePage
