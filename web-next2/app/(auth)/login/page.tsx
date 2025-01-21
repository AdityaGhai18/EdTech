"use client";
import { useEffect } from 'react'
import { Box, Button, Center, FormControl, FormLabel, Heading, Input, Stack, Text, useToast } from '@chakra-ui/react'
import { Link } from '@saas-ui/react'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { PageTransition } from '#components/motion/page-transition'
import { Section } from '#components/section'
import { Footer } from '#components/layout/footer'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from 'utils/supabase'
import { Header } from '#components/layout/header'

const Login = () => {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      console.log('Starting login process...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error

      // Wait for session to be stored
      await new Promise(resolve => setTimeout(resolve, 1000))

      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session after login:', session)

      if (session) {
        toast({
          title: 'Success',
          description: 'Logged in successfully!',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })

        // Use router instead of window.location
        router.push('/dashboard')
      } else {
        throw new Error('Failed to establish session')
      }

    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to log in',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Section flex="1" display="flex" alignItems="center" justifyContent="center">
        <BackgroundGradient zIndex="-1" />
        <PageTransition>
          <Box width="100%" maxW="480px" mx="auto" px={4} pt={10}>
            <Stack spacing={8}>
              <Heading size="lg" textAlign="center">Log in</Heading>
              
              <Stack spacing={4}>
                <Button
                  leftIcon={<FaGoogle />}
                  width="100%"
                  height="50px"
                  fontSize="md"
                  variant="outline"
                  onClick={() => {}}
                  _hover={{
                    bg: 'whiteAlpha.100'
                  }}
                >
                  Continue with Google
                </Button>
                {/* <Button
                  leftIcon={<FaGithub />}
                  width="100%"
                  height="50px"
                  fontSize="md"
                  variant="outline"
                  onClick={() => {}}
                  _hover={{
                    bg: 'whiteAlpha.100'
                  }}
                >
                  Continue with Github
                </Button> */}
              </Stack>

              <Stack spacing={1} align="center">
                <Text color="gray.500" fontSize="sm">or continue with</Text>
                <Box h={2} />
              </Stack>

              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      height="50px"
                      fontSize="md"
                      bg="whiteAlpha.50"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      _hover={{
                        borderColor: "whiteAlpha.200"
                      }}
                      _focus={{
                        borderColor: "primary.500",
                        boxShadow: "none"
                      }}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      height="50px"
                      fontSize="md"
                      bg="whiteAlpha.50"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      _hover={{
                        borderColor: "whiteAlpha.200"
                      }}
                      _focus={{
                        borderColor: "primary.500",
                        boxShadow: "none"
                      }}
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    colorScheme="primary"
                    isLoading={loading}
                    width="100%"
                    height="50px"
                    fontSize="md"
                    mt={2}
                  >
                    Log In
                  </Button>
                </Stack>
              </form>

              <Center pt={2}>
                <Text fontSize="sm" color="gray.500">
                  No account yet?{' '}
                  <Link href="/signup" color="primary.500">
                    Sign up
                  </Link>
                </Text>
              </Center>
            </Stack>
          </Box>
        </PageTransition>
      </Section>
      <Footer />
    </Box>
  )
}

export default Login