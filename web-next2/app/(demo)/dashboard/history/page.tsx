"use client";
import { useState, useEffect } from 'react'
import { Box, Flex, Heading, Text, useToast, Center, Spinner } from '@chakra-ui/react'
import { Sidebar } from '#components/dashboard/Sidebar'
import { PageTransition } from '#components/motion/page-transition'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { supabase } from 'utils/supabase'
import { TransactionList } from '#components/dashboard/TransactionList'
import ProtectedRoute from '#components/auth/protected-route';

// Define interfaces for our data types
interface Transaction {
  id: string
  date: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  recipient?: string
  created_at: string
}

const HistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const fetchTransactions = async () => {
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

        const transactionsResponse = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })

        if (transactionsResponse.error) throw transactionsResponse.error
        
        setTransactions(transactionsResponse.data)
      } catch (error: any) {
        console.error('Error fetching transactions:', error)
        toast({
          title: 'Error fetching transactions',
          description: error.message || 'Something went wrong',
          status: 'error',
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

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
                Transaction History
              </Heading>
              {transactions.length === 0 ? (
                <Text color="white" fontSize="xl">No transactions yet.</Text>
              ) : (
                <TransactionList transactions={transactions} />
              )}
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  )
}

export default HistoryPage
