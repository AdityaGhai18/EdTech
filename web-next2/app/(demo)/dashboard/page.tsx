"use client";

import { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Heading,
  Center,
  Spinner,
  Flex,
  Alert,
  AlertIcon,
  Button,
  IconButton,
  VStack,
  Text,
  HStack,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiActivity,
  FiGlobe,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiRefreshCw,
  FiFileText,
  FiUser,
} from "react-icons/fi";
import { supabase } from "utils/supabase";
import ProtectedRoute from "#components/auth/protected-route";
import { StatCard } from "#components/dashboard/StatCard";
import { TransactionList } from "#components/dashboard/TransactionList";
import { PageTransition } from "#components/motion/page-transition";
import { BackgroundGradient } from "#components/gradients/background-gradient";
import { Sidebar } from "#components/dashboard/Sidebar";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  country_from: string;
  country_to: string;
  status: "pending" | "completed" | "failed" | "canceled";
  stablecoin_curr: string;
  created_at: string;
  updated_at: string;
}

interface CryptoWallet {
  id: string;
  user_id: string;
  all_sc?: { [key: string]: number };
}

interface DashboardStats {
  totalTransfers: number;
  activeCorridors: number;
  totalVolume: number;
  userCount: number;
}

interface Profile {
  first_name: string;
  last_name: string;
  kyc_level?: string;
}

interface CountryRow {
  code: string;   // 'PE'
  name: string;   // 'Peru'
  is_active: boolean;
}

const Dashboard = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<CryptoWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTransfers: 0,
    activeCorridors: 0,
    totalVolume: 0,
    userCount: 0,
  });
  const [countryMap, setCountryMap] = useState<Record<string, string>>({});

  // Hardcode flags for each region code you expect:
  const regionFlagMap: Record<string, string> = {
    US: "🇺🇸",
    PE: "🇵🇪",
    MX: "🇲🇽",
    CO: "🇨🇴",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        // 1) Fetch profile, wallet, transactions, stats in parallel
        const [profileRes, walletRes, txRes, statsRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single(),
          supabase
            .from("cryptowallets")
            .select("id, user_id, all_sc")
            .eq("user_id", session.user.id)
            .single(),
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase.rpc("get_dashboard_stats"),
        ]);

        if (profileRes.error) throw profileRes.error;
        setProfile(profileRes.data);

        if (!walletRes.error) {
          setWallet(walletRes.data);
        }
        if (!txRes.error && txRes.data) {
          setTransactions(txRes.data);
        }

        // statsRes often returns an array with 1 row
        if (!statsRes.error && statsRes.data && statsRes.data.length > 0) {
          setStats(statsRes.data[0]);
        }

        // 2) Fetch countries for friendly region names
        const { data: cData, error: cErr } = await supabase
          .from<"countries", CountryRow>("countries")
          .select("code,name")
          .eq("is_active", true);

        if (!cErr && cData) {
          const map: Record<string, string> = {};
          cData.forEach((c) => {
            map[c.code] = c.name;
          });
          setCountryMap(map);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Renders stablecoin balances from all_sc with friendly names, now with flags:
  const renderStablecoinCards = () => {
    if (!wallet?.all_sc) {
      return (
        <StatCard
          title="No Stablecoins"
          value="Get Started"
          iconType={undefined} // no icon
          iconColor="gray.400"
          isEmptyState
          onClick={() => router.push("/deposit")}
        />
      );
    }

    // Filter out zero balances
    const entries = Object.entries(wallet.all_sc)
      .filter(([_, bal]) => (bal as number) > 0)
      .map(([regionCode, bal]) => {
        const friendlyName = countryMap[regionCode] || regionCode;
        return {
          regionCode,
          friendlyName,
          balance: bal as number,
        };
      });

    if (entries.length === 0) {
      return (
        <StatCard
          title="No Stablecoins"
          value="Get Started"
          iconType={undefined}
          iconColor="gray.400"
          isEmptyState
          onClick={() => router.push("/dashboard/deposit")}
        />
      );
    }

    return entries.map(({ regionCode, friendlyName, balance }) => {
      const numericBalance =
        typeof balance === "string" ? parseFloat(balance) : balance;

      return (
        <StatCard
          key={regionCode}
          title={`USDU (${friendlyName})`}
          value={`$${numericBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          // Instead of FiDollarSign, we use an emoji:
          iconEmoji={regionFlagMap[regionCode] || "💲"}
          iconColor="green.500"
        />
      );
    });
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.900">
        <Flex h="100vh">
          <Sidebar />
          <Center ml={{ base: 0, md: "240px" }} flex="1">
            <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
          </Center>
        </Flex>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box minH="100vh" bg="gray.900">
        <Flex h="100vh" alignItems="center" justifyContent="center">
          <Text color="whiteAlpha.900">Unable to load profile data.</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.900">
      <Flex h="full">
        <Sidebar />
        <Box
          as="main"
          ml={{ base: 0, md: "240px" }}
          w={{ base: "100%", md: "calc(100% - 240px)" }}
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
              <Heading size="lg" mb={4} color="white">
                Welcome, {profile.first_name} {profile.last_name}!
              </Heading>

              {/* If user is not KYC verified, show alert */}
              {profile.kyc_level !== "verified" && (
                <Alert status="info" mb={6} borderRadius="md">
                  <AlertIcon />
                  Your account is not fully verified. Please complete KYC for higher limits.
                </Alert>
              )}

              {/* Quick Platform Stats */}
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={8}>
                <StatCard
                  title="Total Transfers"
                  value={stats.totalTransfers.toLocaleString()}
                  iconType={FiActivity}
                  iconColor="blue.400"
                />
                <StatCard
                  title="Active Corridors"
                  value={stats.activeCorridors.toLocaleString()}
                  iconType={FiGlobe}
                  iconColor="purple.400"
                />
                <StatCard
                  title="Total Volume"
                  value={`$${stats.totalVolume.toLocaleString()}`}
                  iconType={FiActivity} // or FiDollarSign if you'd like
                  iconColor="green.400"
                />
                <StatCard
                  title="User Count"
                  value={stats.userCount.toLocaleString()}
                  iconType={FiUsers}
                  iconColor="orange.400"
                />
              </SimpleGrid>

              {/* Quick Actions */}
              <HStack spacing={4} mb={8} wrap="wrap">
                <Button
                  leftIcon={<FiArrowDownCircle />}
                  colorScheme="purple"
                  variant="solid"
                  onClick={() => router.push("/dashboard/deposit")}
                >
                  Deposit
                </Button>
                <Button
                  leftIcon={<FiArrowUpCircle />}
                  colorScheme="purple"
                  variant="solid"
                  onClick={() => router.push("/dashboard/transfer")}
                >
                  Transfer
                </Button>
                <Button
                  leftIcon={<FiRefreshCw />}
                  colorScheme="purple"
                  variant="solid"
                  onClick={() => router.push("/dashboard/transfer-match")}
                >
                  Match Center
                </Button>
                <Button
                  leftIcon={<FiArrowDownCircle />}
                  colorScheme="purple"
                  variant="solid"
                  onClick={() => router.push("/dashboard/withdraw")}
                >
                  Withdraw
                </Button>
                <Button
                  leftIcon={<FiFileText />}
                  colorScheme="purple"
                  variant="solid"
                  onClick={() => router.push("/dashboard/history")}
                >
                  History
                </Button>
                <IconButton
                  aria-label="Profile"
                  icon={<FiUser />}
                  colorScheme="purple"
                  variant="solid"
                  onClick={() => router.push("/dashboard/profile")}
                  title="Profile Settings"
                />
              </HStack>

              {/* Stablecoin Balances */}
              <Heading size="md" color="white" mb={4}>
                Your Balances
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
                {renderStablecoinCards()}
              </SimpleGrid>

              {/* Recent Transactions */}
              <Heading size="md" color="white" mb={4}>
                Recent Transactions
              </Heading>
              <TransactionList transactions={transactions} />
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  );
};

export default Dashboard;
