"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  VStack,
  FormControl,
  FormLabel,
  useToast,
  Select,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Sidebar } from "#components/dashboard/Sidebar";
import { PageTransition } from "#components/motion/page-transition";
import { BackgroundGradient } from "#components/gradients/background-gradient";
import { supabase } from "utils/supabase";
import { useRouter } from "next/navigation";

// Minimal shape for cryptowallet
interface CryptoWallet {
  id: string;
  user_id: string;
  country: string;
  all_sc?: { [key: string]: number }; // e.g. { USDU: 100, EURC: 50 }
}

const TransferPage = () => {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<CryptoWallet | null>(null);

  // Form fields
  const [stablecoin, setStablecoin] = useState("USDU");
  const [countryFrom, setCountryFrom] = useState("");
  const [countryTo, setCountryTo] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check session
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
          router.push("/login");
          return;
        }

        // Fetch user’s wallet
        const { data: walletData, error: walletError } = await supabase
          .from("cryptowallets")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (walletError) throw walletError;
        setWallet(walletData);
      } catch (error: any) {
        console.error("Error loading wallet data:", error);
        toast({
          title: "Error",
          description: error.message || "Could not load wallet data",
          status: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, toast]);

  const handleCreateTransferRequest = async () => {
    try {
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

      // 1) Validation
      if (!stablecoin || !countryFrom || !countryTo || !amount) {
        toast({
          title: "Missing fields",
          description: "Please fill in all fields",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid positive number",
          status: "error",
          duration: 3000,
        });
        return;
      }

      if (!wallet?.all_sc) {
        toast({
          title: "No stablecoin wallet",
          description: "Your cryptowallet has no balances. Please deposit first.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // 2) Check user’s stablecoin balance
      const coin = stablecoin.toUpperCase();
      const currentBalance = wallet.all_sc[coin] || 0;
      if (currentBalance < numericAmount) {
        toast({
          title: "Insufficient Balance",
          description: `Your ${coin} balance is only ${currentBalance}. Please deposit or reduce the transfer amount.`,
          status: "error",
          duration: 4000,
        });
        return;
      }

      // 3) Insert new request in `transfer_requests`
      const { data, error } = await supabase
        .from("transfer_requests")
        .insert({
          user_id: session.user.id,
          amount: numericAmount,
          stablecoin_curr: coin,
          country_from: countryFrom,
          country_to: countryTo,
          status: "open",
        })
        .select("id") // Return the ID of the newly inserted request
        .single();

      if (error) throw error;

      // 4) [Optional] Lock funds (subtract from user’s wallet).
      // For the MVP, we skip immediate deduction. If you want to do so:
      // wallet.all_sc[coin] = currentBalance - numericAmount;
      // await supabase
      //   .from("cryptowallets")
      //   .update({ all_sc: wallet.all_sc })
      //   .eq("id", wallet.id);

      toast({
        title: "Transfer request created",
        description: "Searching for matches now...",
        status: "success",
        duration: 2500,
      });

      // 5) Redirect user to the transfer-match page, passing the new request ID
      router.push(`/dashboard/transfer-match?requestId=${data.id}`);
    } catch (error: any) {
      console.error("Error creating transfer request:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 4000,
      });
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.900">
        <Flex h="100vh">
          <Sidebar />
          <Flex ml={{ base: 0, md: "240px" }} flex="1" align="center" justify="center">
            <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
          </Flex>
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
            <Box maxW="container.md" mx="auto" px={8} py={8}>
              <Heading size="lg" mb={6} color="white">
                Initiate a New Transfer
              </Heading>

              <VStack spacing={6} align="stretch">
                {/* Stablecoin */}
                <FormControl isRequired>
                  <FormLabel color="white">Stablecoin</FormLabel>
                  <Select
                    value={stablecoin}
                    onChange={(e) => setStablecoin(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    <option value="USDU">USDU</option>
                    {/* <option value="EURC">EURC</option> */}
                    {/* Add more stablecoin options here */}
                  </Select>
                </FormControl>

                {/* Country From */}
                <FormControl isRequired>
                  <FormLabel color="white">From Country</FormLabel>
                  <Select
                    placeholder="Select origin country"
                    value={countryFrom}
                    onChange={(e) => setCountryFrom(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    <option value="US">United States</option>
                    <option value="PE">Peru</option>
                    <option value="MX">Mexico</option>
                    <option value="BR">Brazil</option>
                    {/* add more as needed */}
                  </Select>
                </FormControl>

                {/* Country To */}
                <FormControl isRequired>
                  <FormLabel color="white">Destination Country</FormLabel>
                  <Select
                    placeholder="Select destination country"
                    value={countryTo}
                    onChange={(e) => setCountryTo(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    <option value="US">United States</option>
                    <option value="PE">Peru</option>
                    <option value="MX">Mexico</option>
                    <option value="BR">Brazil</option>
                    {/* add more as needed */}
                  </Select>
                </FormControl>

                {/* Amount */}
                <FormControl isRequired>
                  <FormLabel color="white">Amount</FormLabel>
                  <Input
                    placeholder="Enter stablecoin amount to send"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    bg="whiteAlpha.100"
                    color="white"
                  />
                </FormControl>

                <Button colorScheme="purple" size="lg" onClick={handleCreateTransferRequest}>
                  Create Transfer Request
                </Button>
              </VStack>
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  );
};

export default TransferPage;
