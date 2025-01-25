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
  Text,
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
  all_sc?: { [regionCode: string]: number | string }; // If it can be string or number
}

// Minimal shape for countries table
interface CountryRow {
  code: string; // e.g. 'PE'
  name: string; // e.g. 'Peru'
  is_active: boolean;
}

export default function TransferPage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<CryptoWallet | null>(null);

  // Countries from Supabase
  const [countries, setCountries] = useState<CountryRow[]>([]);

  // Form fields
  const [stablecoin, setStablecoin] = useState("USDU");
  const [countryFrom, setCountryFrom] = useState(""); // e.g. 'PE'
  const [countryTo, setCountryTo] = useState("");
  const [amount, setAmount] = useState("");

  // For UI display of the origin's numeric balance
  const [originBalance, setOriginBalance] = useState<number | string>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
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

        // 1) Fetch user’s wallet
        const { data: walletData, error: walletError } = await supabase
          .from("cryptowallets")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        if (walletError) throw walletError;

        setWallet(walletData);

        // 2) Fetch countries for friendly names
        const { data: cData, error: cErr } = await supabase
          .from<CountryRow>("countries")
          .select("code, name")
          .eq("is_active", true)
          .order("name", { ascending: true });
        if (cErr) throw cErr;

        setCountries(cData || []);
      } catch (error: any) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: error.message || "Could not load data",
          status: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, toast]);

  // Fired when user selects a new origin country
  const handleCountryFromChange = (code: string) => {
    setCountryFrom(code);

    // Recompute & display balance for that region
    if (!wallet?.all_sc) {
      setOriginBalance(0);
      return;
    }
    const rawBal = wallet.all_sc[code] ?? 0; // could be number or string
    setOriginBalance(rawBal);

    // If user had already selected the same country for 'countryTo', reset
    if (countryTo === code) {
      setCountryTo("");
    }
  };

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

      // Validate
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

      // Check user’s region balance
      if (!wallet?.all_sc) {
        toast({
          title: "No stablecoin wallet",
          description: "You have no balances. Please deposit first.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const availableBalRaw = wallet.all_sc[countryFrom] ?? 0;
      // Convert to number if needed
      const availableBal =
        typeof availableBalRaw === "string"
          ? parseFloat(availableBalRaw)
          : availableBalRaw;

      if (availableBal < numericAmount) {
        toast({
          title: "Insufficient Balance",
          description: `Your balance in ${countryFrom} is only ${availableBal}.`,
          status: "error",
          duration: 4000,
        });
        return;
      }

      // Insert new request
      const coin = stablecoin.toUpperCase();
      const { data: inserted, error } = await supabase
        .from("transfer_requests")
        .insert({
          user_id: session.user.id,
          amount: numericAmount,
          stablecoin_curr: coin,
          country_from: countryFrom,
          country_to: countryTo,
          status: "open",
        })
        .select("id")
        .single();

      if (error) throw error;

      toast({
        title: "Transfer request created",
        description: "Searching for matches now...",
        status: "success",
        duration: 2500,
      });

      router.push(`/dashboard/transfer-match?requestId=${inserted.id}`);
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
          <Flex
            ml={{ base: 0, md: "240px" }}
            flex="1"
            align="center"
            justify="center"
          >
            <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
          </Flex>
        </Flex>
      </Box>
    );
  }

  // originOptions = all countries from supabase
  const originOptions = countries;

  // Filter out chosen origin from the destination
  const destinationOptions = countries.filter((c) => c.code !== countryFrom);

  // Look up origin's "beautiful" name for the "Balance in ..."
  const originCountry = countries.find((c) => c.code === countryFrom);

  // Convert originBalance to a real number for consistent formatting
  const numericBalance =
    typeof originBalance === "string" ? parseFloat(originBalance) : originBalance;

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
                    {/* more stablecoins if needed */}
                  </Select>
                </FormControl>

                {/* Origin Country */}
                <FormControl isRequired>
                  <FormLabel color="white">From Country</FormLabel>
                  <Select
                    placeholder="Select origin country"
                    value={countryFrom}
                    onChange={(e) => handleCountryFromChange(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    {originOptions.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Show "Balance in Peru: 123.45 USDU" if user selected an origin */}
                {countryFrom && (
                  <Box>
                    <Text color="white" fontSize="sm">
                      Balance in {originCountry?.name ?? countryFrom}:
                      <Text as="span" fontWeight="bold" ml={1}>
                        {numericBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        USDU
                      </Text>
                    </Text>
                  </Box>
                )}

                {/* Destination Country */}
                <FormControl isRequired>
                  <FormLabel color="white">Destination Country</FormLabel>
                  <Select
                    placeholder="Select destination country"
                    value={countryTo}
                    onChange={(e) => setCountryTo(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                    disabled={!countryFrom} // can't pick until origin is chosen
                  >
                    {destinationOptions.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
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

                <Button
                  colorScheme="purple"
                  size="lg"
                  onClick={handleCreateTransferRequest}
                >
                  Create Transfer Request
                </Button>
              </VStack>
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  );
}
