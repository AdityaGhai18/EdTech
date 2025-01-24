"use client";
import { useState } from 'react'
import { Box, Flex, Heading, Input, Button, VStack, FormControl, FormLabel, useToast, Select } from '@chakra-ui/react'
import { Sidebar } from '#components/dashboard/Sidebar'
import { PageTransition } from '#components/motion/page-transition'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { updateWalletBalance } from 'utils/wallet'
import { supabase } from 'utils/supabase'
import { useRouter } from 'next/navigation'

const WithdrawPage = () => {
  const router = useRouter()
  const [stablecoin, setStablecoin] = useState('')
  const [amount, setAmount] = useState('')
  const toast = useToast()

  const handleWithdraw = async () => {
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

      // Validate inputs
      if (!stablecoin || !amount) {
        toast({
          title: 'Missing fields',
          description: 'Please fill in both stablecoin and amount',
          status: 'error',
          duration: 3000,
        })
        return
      }

      const numAmount = parseFloat(amount)
      
      if (isNaN(numAmount) || numAmount <= 0) {
        toast({
          title: 'Invalid amount',
          description: 'Please enter a valid positive number',
          status: 'error',
          duration: 3000,
        })
        return
      }

      await updateWalletBalance(session.user.id, stablecoin.toUpperCase(), -numAmount)

      toast({
        title: 'Withdrawal successful',
        status: 'success',
        duration: 3000,
      })

      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Error withdrawing:', error)
      toast({
        title: 'Error making withdrawal',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      })
    }
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
                Withdraw Stablecoins
              </Heading>

              <VStack spacing={6} maxW="md" align="stretch">
                <FormControl>
                  <FormLabel color="white">Stablecoin</FormLabel>
                  <Select
                    placeholder="Select stablecoin"
                    value={stablecoin}
                    onChange={(e) => setStablecoin(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    <option value="USDU">USDU</option>
                    <option value="EURC">EURC</option>
                    {/* Add more stablecoin options here */}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="white">Amount</FormLabel>
                  <Input
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    bg="whiteAlpha.100"
                    color="white"
                  />
                </FormControl>

                <Button 
                  colorScheme="purple" 
                  size="lg"
                  onClick={handleWithdraw}
                >
                  Withdraw Stablecoin
                </Button>
              </VStack>
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  )
}

export default WithdrawPage
