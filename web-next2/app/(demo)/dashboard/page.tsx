"use client";
import { useEffect, useState } from 'react'
import { Box, SimpleGrid, Heading, Center, Spinner, Flex } from '@chakra-ui/react'
import { FiDollarSign, FiUsers, FiActivity, FiGlobe } from 'react-icons/fi'
import { supabase } from 'utils/supabase'
import ProtectedRoute from '#components/auth/protected-route'
import { StatCard } from '#components/dashboard/StatCard'
import { TransactionList } from '#components/dashboard/TransactionList'
import { Section } from '#components/section'
import { PageTransition } from '#components/motion/page-transition'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { Sidebar } from '#components/dashboard/Sidebar'
import { useRouter } from 'next/navigation'

// Define interfaces for our data types
interface Transaction {
  id: string
  user_id: string
  amount: number
  transaction_type: string
  country_from: string
  country_to: string
  status: 'pending' | 'completed' | 'failed'
  stablecoin_curr: string
  created_at: string
  updated_at: string
}

interface StablecoinBalance {
  [key: string]: number;  // e.g. { "USDU": 100, "EURC": 50 }
}

interface CryptoWallet {
  id: string;
  user_id: string;
  all_sc: { [key: string]: number };
  country: string;
}

interface DashboardStats {
  totalTransfers: number;
  activeCorridors: number;
  totalVolume: number;
  userCount: number;
  wallet?: CryptoWallet;
}

const Dashboard = () => {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [wallet, setWallet] = useState<CryptoWallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalTransfers: 0,
    activeCorridors: 0,
    totalVolume: 0,
    userCount: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) return

        const [profileResponse, walletResponse, transactionsResponse, statsResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single(),
          supabase
            .from('cryptowallets')
            .select('*')
            .eq('user_id', session.user.id)
            .single(),
          supabase
            .from('transactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .rpc('get_dashboard_stats')
        ])

        if (profileResponse.error) throw profileResponse.error
        
        setProfile(profileResponse.data)
        setWallet(walletResponse.data)
        setTransactions(transactionsResponse.data || [])
        setStats(statsResponse.data || {
          totalTransfers: 0,
          activeCorridors: 0,
          totalVolume: 0,
          userCount: 0
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (!profile) {
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

  const renderStablecoinCards = () => {
    if (!wallet?.all_sc || Object.keys(wallet.all_sc).length === 0) {
      return (
        <StatCard
          title="No Stablecoins"
          value="Get Started"
          icon={FiDollarSign}
          iconColor="gray.400"
          isEmptyState
          onClick={() => router.push('/dashboard/deposit')}
        />
      );
    }

    return (
      <>
        {Object.entries(wallet.all_sc).map(([coin, balance]) => (
          <StatCard
            key={coin}
            title={`${coin} Balance`}
            value={`$${balance.toLocaleString()}`}
            icon={FiDollarSign}
            iconColor="green.500"
          />
        ))}
        <StatCard
          title="Buy More"
          value="Different Regions"
          icon={FiDollarSign}
          iconColor="purple.500"
          isEmptyState
          onClick={() => router.push('/dashboard/deposit')}
        />
      </>
    );
  };

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
                Welcome, {profile.first_name} {profile.last_name}!
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
                {renderStablecoinCards()}
              </SimpleGrid>

              <TransactionList transactions={transactions} />
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  )
}

export default Dashboard
