"use client";
import { Box, Button, Center, FormControl, FormLabel, Input, Stack, Text, useToast } from '@chakra-ui/react'
import { Link } from '@saas-ui/react'
import NextLink from 'next/link'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { PageTransition } from '#components/motion/page-transition'
import { Section } from '#components/section'
import { Features } from '#components/features'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from 'utils/supabase'
import siteConfig from '#data/config'

const providers = {
  google: {
    name: 'Google',
    icon: FaGoogle,
  },
  github: {
    name: 'Github',
    icon: FaGithub,
    variant: 'solid',
  },
}

const Signup = () => {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        toast({
          title: 'Already logged in',
          description: 'Redirecting to dashboard...',
          status: 'info',
          duration: 2000,
          isClosable: true,
        })
        await new Promise(resolve => setTimeout(resolve, 2000))
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // 2. Create profile record
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              created_at: new Date(),
              updated_at: new Date(),
            }
          ])

        if (profileError) throw profileError
      }

      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to verify your account.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      router.push('/login')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section height="100vh" innerWidth="container.xl">
      <BackgroundGradient
        zIndex="-1"
        width={{ base: 'full', lg: '50%' }}
        left="auto"
        right="0"
        borderLeftWidth="1px"
        borderColor="gray.200"
        _dark={{
          borderColor: 'gray.700',
        }}
      />
      <PageTransition height="100%" display="flex" alignItems="center">
        <Stack
          width="100%"
          alignItems={{ base: 'center', lg: 'flex-start' }}
          spacing="20"
          flexDirection={{ base: 'column', lg: 'row' }}
        >
          <Box pe="20">
            <NextLink href="/">
              <Box
                as={siteConfig.logo}
                width="160px"
                ms="4"
                mb={{ base: 0, lg: 16 }}
              />
            </NextLink>
            <Features
              display={{ base: 'none', lg: 'flex' }}
              columns={1}
              iconSize={4}
              flex="1"
              py="0"
              ps="0"
              maxW={{ base: '100%', xl: '80%' }}
              features={siteConfig.signup.features.map((feature) => ({
                iconPosition: 'left',
                variant: 'left-icon',
                ...feature,
              }))}
            />
          </Box>
          <Center height="100%" flex="1">
            <Box width="container.sm" pt="8" px="8">
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    colorScheme="purple"
                    size="lg"
                    fontSize="md"
                    isLoading={loading}
                  >
                    Sign up
                  </Button>
                  
                  <Stack spacing={4}>
                    <Button
                      leftIcon={<FaGoogle />}
                      width="100%"
                      variant="outline"
                      onClick={() => {}} // Disabled for now
                    >
                      Continue with Google
                    </Button>
                    {/* <Button
                      leftIcon={<FaGithub />}
                      width="100%"
                      variant="outline"
                      onClick={() => {}} // Disabled for now
                    >
                      Continue with Github
                    </Button> */}
                  </Stack>
                  
                  <Center>
                    <Link href="/login">Already have an account? Log in</Link>
                  </Center>
                  
                  <Text color="muted" fontSize="sm" textAlign="center">
                    By signing up you agree to our{' '}
                    <Link href={siteConfig.termsUrl} color="primary.500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href={siteConfig.privacyUrl} color="primary.500">
                      Privacy Policy
                    </Link>
                  </Text>
                </Stack>
              </form>
            </Box>
          </Center>
        </Stack>
      </PageTransition>
    </Section>
  )
}

export default Signup