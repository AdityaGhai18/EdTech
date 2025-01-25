"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  useToast,
  Center,
  Spinner,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  HStack,
} from "@chakra-ui/react";
import { Sidebar } from "#components/dashboard/Sidebar";
import { PageTransition } from "#components/motion/page-transition";
import { BackgroundGradient } from "#components/gradients/background-gradient";
import { supabase } from "utils/supabase";
import { TransactionList } from "#components/dashboard/TransactionList";
import ProtectedRoute from "#components/auth/protected-route";

// Define interfaces for our data types
interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string; // 'deposit','withdraw','transfer_match'
  country_from: string;
  country_to: string;
  status: "pending" | "completed" | "failed" | "canceled";
  stablecoin_curr: string;
  created_at: string;
  updated_at?: string;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // ---- Filter States ----
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTransactions(); // load all initially
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Not authenticated",
          description: "Please login first",
          status: "error",
          duration: 3000,
        });
        return;
      }

      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      // Apply filters if provided
      if (typeFilter) {
        query = query.eq("transaction_type", typeFilter);
      }
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      if (searchTerm) {
        // Searching by partial match in ID (or you can search by reference_id, etc.)
        query = query.ilike("id", `%${searchTerm}%`);
      }
      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }
      if (dateTo) {
        // Typically dateTo means the day should include the entire day, so we add +1 day or use 23:59:59
        // For simplicity, we just do a direct "less than dateTo"
        query = query.lte("created_at", dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) setTransactions(data);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error fetching transactions",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  // Simple CSV export
  // You could use a library like 'papaparse' for more robust CSV generation
  function handleExportCSV() {
    if (transactions.length === 0) {
      toast({
        title: "No data",
        description: "There are no transactions to export",
        status: "info",
        duration: 3000,
      });
      return;
    }

    // Build CSV header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "id,user_id,amount,transaction_type,country_from,country_to,status,stablecoin_curr,created_at\n";

    // Add each transaction as CSV row
    transactions.forEach((tx) => {
      const row = [
        tx.id,
        tx.user_id,
        tx.amount,
        tx.transaction_type,
        tx.country_from,
        tx.country_to,
        tx.status,
        tx.stablecoin_curr,
        tx.created_at,
      ].join(",");
      csvContent += row + "\n";
    });

    // Create a downloadable link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    // A simple filename: kipu_history.csv
    link.setAttribute("download", "kipu_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Re-fetch with new filters
  function handleSearch() {
    fetchTransactions();
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.900">
        <Flex h="100vh">
          <Sidebar />
          <Center ml="240px" w="calc(100% - 240px)" bg="gray.900">
            <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
          </Center>
        </Flex>
      </Box>
    );
  }

  return (
    <ProtectedRoute>
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
                <Heading size="lg" mb={4} color="white">
                  Transaction History
                </Heading>

                {/* Filters */}
                <Box mb={6} p={4} bg="whiteAlpha.100" borderRadius="md">
                  <VStack align="stretch" spacing={4}>
                    <FormControl>
                      <FormLabel color="white">Transaction Type</FormLabel>
                      <Select
                        placeholder="All"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        bg="whiteAlpha.200"
                        color="white"
                      >
                        <option value="deposit">Deposit</option>
                        <option value="withdraw">Withdraw</option>
                        <option value="transfer_match">Transfer Match</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="white">Status</FormLabel>
                      <Select
                        placeholder="All"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        bg="whiteAlpha.200"
                        color="white"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="canceled">Canceled</option>
                      </Select>
                    </FormControl>

                    <HStack spacing={4}>
                      <FormControl>
                        <FormLabel color="white">From (date)</FormLabel>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          bg="whiteAlpha.200"
                          color="white"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel color="white">To (date)</FormLabel>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          bg="whiteAlpha.200"
                          color="white"
                        />
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel color="white">Search by Transaction ID</FormLabel>
                      <Input
                        placeholder="e.g., partial ID match"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        bg="whiteAlpha.200"
                        color="white"
                      />
                    </FormControl>

                    <HStack spacing={4}>
                      <Button colorScheme="purple" onClick={handleSearch}>
                        Apply Filters
                      </Button>
                      <Button
                        variant="outline"
                        colorScheme="purple"
                        onClick={() => {
                          // Reset all filters
                          setTypeFilter("");
                          setStatusFilter("");
                          setDateFrom("");
                          setDateTo("");
                          setSearchTerm("");
                          // Then refetch
                          setTimeout(() => fetchTransactions(), 0);
                        }}
                      >
                        Clear Filters
                      </Button>
                      <Button variant="outline" colorScheme="purple" onClick={handleExportCSV}>
                        Export CSV
                      </Button>
                    </HStack>
                  </VStack>
                </Box>

                {transactions.length === 0 ? (
                  <Text color="white" fontSize="xl">
                    No transactions found.
                  </Text>
                ) : (
                  <TransactionList transactions={transactions} />
                )}
              </Box>
            </PageTransition>
          </Box>
        </Flex>
      </Box>
    </ProtectedRoute>
  );
}
