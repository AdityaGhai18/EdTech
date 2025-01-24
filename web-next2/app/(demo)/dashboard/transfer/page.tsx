"use client";
import { useState, useEffect } from 'react'
import { Box, Flex, Heading, Input, Button, VStack, FormControl, FormLabel, useToast, Select, Text } from '@chakra-ui/react'
import { Sidebar } from '#components/dashboard/Sidebar'
import { PageTransition } from '#components/motion/page-transition'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { updateWalletBalance } from 'utils/wallet'
import { supabase } from 'utils/supabase'
import { useRouter } from 'next/navigation'
import { TransferTabs } from '#components/dashboard/TransferTabs'
import { MatchingTransactionList } from '#components/dashboard/MatchingTransactionList'

interface CryptoWallet {
  id: string;
  user_id: string;
  all_sc: { [key: string]: number };
  country: string;
}

interface MatchingTransaction {
  id: string
  user_id: string
  amount: number
  country_from: string
  country_to: string
  status: string
  stablecoin_curr: string
  profiles: {
    first_name: string
    last_name: string
  }
}

const TransferPage = () => {
  const router = useRouter()
  const [stablecoin, setStablecoin] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [wallet, setWallet] = useState<CryptoWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast()
  const [countryFrom, setCountryFrom] = useState('')
  const [countryTo, setCountryTo] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [matchingTransactions, setMatchingTransactions] = useState<MatchingTransaction[]>([])

    useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) return

        const walletResponse = await supabase
            .from('cryptowallets')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

        if (walletResponse.error) throw walletResponse.error
        
        setWallet(walletResponse.data)
      } catch (error) {
        console.error('Error fetching wallet:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWallet()
  }, [])

  const handleTransfer = async () => {
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
      if (!stablecoin || !amount || !recipient || !countryFrom || !countryTo) {
        toast({
          title: 'Missing fields',
          description: 'Please fill in all fields',
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

      if (!wallet?.all_sc || !wallet.all_sc[stablecoin.toUpperCase()] || wallet.all_sc[stablecoin.toUpperCase()] < numAmount) {
          toast({
            title: 'Insufficient funds',
            description: `You do not have enough ${stablecoin} to transfer`,
            status: 'error',
            duration: 3000,
          });
          return;
      }

      // Log the user's input
      console.log('User request:', {
        countryFrom,
        countryTo,
        amount,
        stablecoin
      });

      setCurrentStep(2)
      
      // Debug: First get ALL pending transactions
      const { data: allPending } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending');
      console.log('All pending transactions:', allPending);

      // Then try just the country match
      const { data: countryMatch } = await supabase
        .from('transactions')
        .select('*')
        .eq('country_from', 'USA')
        .eq('country_to', 'MEX');
      console.log('Country matching transactions:', countryMatch);

      // Then our actual query
      const { data: matches, error: matchError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('country_from', countryTo)
        .eq('country_to', countryFrom)
        .eq('status', 'pending')
        .neq('user_id', session.user.id)

      // Log raw response
      console.log('Raw Supabase response:', matches);

      if (matchError) throw matchError
      setMatchingTransactions(matches)

    } catch (error: any) {
      console.error('Error in handleTransfer:', error)
      toast({
        title: 'Error making transfer',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleMatch = async (matchId: string) => {
    // Handle matching logic here
  }

  const handleCreateTransaction = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: session.user.id,
          amount: parseFloat(amount),
          transaction_type: 'transfer',
          country_from: countryFrom,
          country_to: countryTo,
          status: 'pending',
          stablecoin_curr: stablecoin.toUpperCase(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (transactionError) throw transactionError

      toast({
        title: 'Transfer request created',
        description: 'Your transfer request is now pending for matching',
        status: 'success',
        duration: 3000,
      })
      
      router.push('/dashboard')
    } catch (error: any) {
      // ... error handling ...
    }
  }

  return (
    <Box minH="100vh" bg="gray.900">
      <Flex h="full">
        <Sidebar />
        <Box as="main" ml="240px" w="calc(100% - 240px)" minH="100vh" bg="gray.900" position="relative">
          <BackgroundGradient zIndex="0" width="full" position="absolute" top="0" left="0" right="0" bottom="0" />
          <PageTransition>
            <Box maxW="container.xl" mx="auto" px={8} py={8}>
              <TransferTabs 
                currentStep={currentStep} 
                onStepChange={setCurrentStep} 
              />

              {currentStep === 1 ? (
                <>
                  <Heading size="lg" mb={8} color="white">
                    Transfer Request
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
                      <FormLabel color="white">Sending Country</FormLabel>
                      <Select
                        placeholder="Select sending country"
                        value={countryFrom}
                        onChange={(e) => setCountryFrom(e.target.value)}
                        bg="whiteAlpha.100"
                        color="white"
                      >
                        <option value="USA">United States</option>
                        <option value="MEX">Mexico</option>
                        <option value="CAN">Canada</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="white">Recipient Country</FormLabel>
                      <Select
                        placeholder="Select recipient country"
                        value={countryTo}
                        onChange={(e) => setCountryTo(e.target.value)}
                        bg="whiteAlpha.100"
                        color="white"
                      >
                        <option value="USA">United States</option>
                        <option value="MEX">Mexico</option>
                        <option value="CAN">Canada</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="white">Recipient</FormLabel>
                      <Input
                        placeholder="Enter recipient's email or ID"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        bg="whiteAlpha.100"
                        color="white"
                      />
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
                      onClick={handleTransfer}
                    >
                      Transfer Stablecoin
                    </Button>
                  </VStack>
                </>
              ) : (
                <>
                  <Heading size="lg" mb={8} color="white">
                    Transfer Match
                  </Heading>
                  <MatchingTransactionList 
                    transactions={matchingTransactions}
                    onMatch={handleMatch}
                    onCreateRequest={handleCreateTransaction}
                  />
                </>
              )}
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  )
}

export default TransferPage
