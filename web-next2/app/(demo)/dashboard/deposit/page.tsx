"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  FormControl,
  FormLabel,
  useToast,
  Select,
  Input,
  Spinner,
  Alert,
  AlertIcon,
  Text,
} from "@chakra-ui/react";
import { Sidebar } from "#components/dashboard/Sidebar";
import { PageTransition } from "#components/motion/page-transition";
import { BackgroundGradient } from "#components/gradients/background-gradient";
import { supabase } from "utils/supabase";
import { useRouter } from "next/navigation";

// Example function or mock for localFiat -> USDU conversion
// In production, replace with real exchange rate logic or external API
function getConversionRate(localCurrency: string) {
  const mockRates: Record<string, number> = {
    USD: 1,    // 1 USD => 1 USDU
    PEN: 0.27, // 1 PEN => 0.27 USDU
    EUR: 1.1,  // 1 EUR => 1.1 USDU
  };
  return mockRates[localCurrency] ?? 1;
}

// Minimal shape of a country row from the 'countries' table
interface CountryRow {
  code: string;       // e.g., 'US', 'PE'
  name: string;       // e.g., 'United States', 'Peru'
  iso3?: string;
  currency_code?: string;
  is_active: boolean;
}

// Minimal shape of a bank account row
interface BankAccountRow {
  id: string;
  user_id: string;
  account_number: string;
  bank_name?: string;
  country?: string; // The country code, e.g. 'US', 'PE', etc.
}

const DepositPage = () => {
  const router = useRouter();
  const toast = useToast();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [processingDeposit, setProcessingDeposit] = useState(false);

  // Page data
  const [userId, setUserId] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountRow[]>([]);

  // Selected options
  const [sourceCountry, setSourceCountry] = useState("");
  const [selectedBankAccount, setSelectedBankAccount] = useState("");

  // Deposit form state
  const [localCurrency, setLocalCurrency] = useState("USD"); // default
  const [amountFiat, setAmountFiat] = useState<string>("");
  const [estimatedStablecoin, setEstimatedStablecoin] = useState(0);

  // 1) Load session, countries, user’s bank accounts
  useEffect(() => {
    const fetchData = async () => {
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
          router.push("/login");
          return;
        }

        setUserId(session.user.id);

        // 1) Fetch active countries
        const { data: countryData, error: countryError } = await supabase
          .from("countries")
          .select("*")
          .eq("is_active", true)
          .order("name");

        if (countryError) throw countryError;
        setCountries(countryData || []);

        // 2) Fetch user’s bank accounts
        const bankRes = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("user_id", session.user.id);

        if (bankRes.error) {
          throw bankRes.error;
        }

        const userBankAccounts = bankRes.data as BankAccountRow[];
        setBankAccounts(userBankAccounts);

        // 3) Auto-select if user has at least one bank account
        if (userBankAccounts.length > 0) {
          // We'll pick the first bank account
          setSelectedBankAccount(userBankAccounts[0].id);

          // Also sync country with that account's country, if present
          if (userBankAccounts[0].country) {
            setSourceCountry(userBankAccounts[0].country);
          }
        }
      } catch (error: any) {
        console.error("Error fetching deposit page data:", error);
        toast({
          title: "Error",
          description: error.message || "Could not load deposit data",
          status: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, toast]);

  // 2) Recompute stablecoin estimate whenever localCurrency or amountFiat changes
  useEffect(() => {
    const rate = getConversionRate(localCurrency);
    const fiatNum = parseFloat(amountFiat || "0");
    const estimate = fiatNum > 0 ? fiatNum * rate : 0;
    setEstimatedStablecoin(estimate);
  }, [localCurrency, amountFiat]);

  // Utility: Get friendly name for the currently selected country code
  // e.g. if sourceCountry='PE' -> 'Peru'
  // If not found, fallback to empty string
  const getSelectedCountryName = (): string => {
    const c = countries.find((c) => c.code === sourceCountry);
    return c ? c.name : "";
  };

  // If user picks a country => filter bank accounts that match that country
  // If the current selected account doesn't match, we clear or auto-select first
  const handleChangeCountry = (newCountry: string) => {
    setSourceCountry(newCountry);

    // Find all accounts for this country
    const matchingAccounts = bankAccounts.filter(
      (acct) => acct.country === newCountry
    );

    // If the current selected account is not in that list, pick the first or set none
    const currentSelected = bankAccounts.find(
      (acct) => acct.id === selectedBankAccount
    );
    if (!currentSelected || currentSelected.country !== newCountry) {
      if (matchingAccounts.length > 0) {
        setSelectedBankAccount(matchingAccounts[0].id);
      } else {
        setSelectedBankAccount("");
      }
    }
  };

  // If user picks a bank account => set the sourceCountry to that account's country
  const handleChangeBankAccount = (acctId: string) => {
    setSelectedBankAccount(acctId);
    // find the matching bank account
    const acct = bankAccounts.find((a) => a.id === acctId);
    if (acct && acct.country) {
      setSourceCountry(acct.country);
    }
  };

  const handleDeposit = async () => {
    if (!userId) {
      toast({
        title: "Not authenticated",
        description: "Please login first",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!sourceCountry) {
      toast({
        title: "No source country selected",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!selectedBankAccount) {
      toast({
        title: "No bank account selected",
        description: "Please select a bank account",
        status: "error",
        duration: 3000,
      });
      return;
    }

    const fiatNum = parseFloat(amountFiat || "0");
    if (!amountFiat || fiatNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setProcessingDeposit(true);

    try {
      // Build the stablecoin name e.g. "USDU (Peru)" if sourceCountry="PE"
      const friendlyCountryName = getSelectedCountryName(); // e.g. 'Peru'
      const stablecoinName = friendlyCountryName
        ? `USDU (${friendlyCountryName})`
        : "USDU"; // fallback

      // 1) Insert a deposit transaction
      const insertTxRes = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          amount: estimatedStablecoin, // final stablecoin amount
          transaction_type: "deposit",
          country_from: sourceCountry,
          country_to: "STABLECOIN", // or "Kipu Account"
          stablecoin_curr: stablecoinName, // e.g. "USDU (Peru)"
          status: "pending", // or 'completed'
          reference_id: selectedBankAccount,
        })
        .select()
        .single();

      if (insertTxRes.error) {
        throw insertTxRes.error;
      }

      // 2) Update user's wallet (increment the "sourceCountry" key in all_sc)
      const { data: walletData, error: walletError } = await supabase
        .from("cryptowallets")
        .select("all_sc")
        .eq("user_id", userId)
        .single();

      if (walletError) throw walletError;

      let all_sc = walletData?.all_sc || {};
      // if it's not numeric or missing, fallback to 0
      const currentBalance = parseFloat(all_sc[sourceCountry] || 0);
      const newBalance = currentBalance + estimatedStablecoin;
      all_sc[sourceCountry] = newBalance;

      // Update cryptowallet
      const updateWalletRes = await supabase
        .from("cryptowallets")
        .update({ all_sc })
        .eq("user_id", userId);

      if (updateWalletRes.error) {
        throw updateWalletRes.error;
      }

      // 3) Mark transaction as completed (optional)
      const updateTxRes = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", insertTxRes.data.id);

      if (updateTxRes.error) {
        throw updateTxRes.error;
      }

      toast({
        title: "Deposit successful",
        description: `Successfully deposited ${fiatNum} ${localCurrency} ≈ ${estimatedStablecoin.toFixed(
          2
        )} ${stablecoinName}`,
        status: "success",
        duration: 4000,
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast({
        title: "Error making deposit",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 4000,
      });
    } finally {
      setProcessingDeposit(false);
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

  // Filter the bank accounts to only those that match the selected sourceCountry
  const filteredBankAccounts = bankAccounts.filter(
    (acct) => acct.country === sourceCountry
  );

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
              <Heading size="lg" mb={8} color="white">
                Deposit (Local Fiat → Stablecoin)
              </Heading>

              {bankAccounts.length === 0 && (
                <Alert status="warning" mb={6} borderRadius="md">
                  <AlertIcon />
                  You have no linked bank accounts. Please add one in your Profile.
                </Alert>
              )}

              <VStack spacing={6} align="stretch">
                {/* Source Country */}
                <FormControl isRequired>
                  <FormLabel color="white">Source Country</FormLabel>
                  <Select
                    placeholder="Select your country"
                    value={sourceCountry}
                    onChange={(e) => handleChangeCountry(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Bank Account Select */}
                <FormControl isRequired>
                  <FormLabel color="white">Linked Bank Account</FormLabel>
                  <Select
                    placeholder="Select a bank account"
                    value={selectedBankAccount}
                    onChange={(e) => handleChangeBankAccount(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                    disabled={bankAccounts.length === 0}
                  >
                    {filteredBankAccounts.map((acct) => (
                      <option key={acct.id} value={acct.id}>
                        {acct.bank_name
                          ? `${acct.bank_name} - ${acct.account_number}`
                          : `Account: ${acct.account_number}`}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Local Currency */}
                <FormControl>
                  <FormLabel color="white">Fiat Currency</FormLabel>
                  <Select
                    value={localCurrency}
                    onChange={(e) => setLocalCurrency(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    <option value="USD">USD</option>
                    {/* Add more local currencies as needed */}
                    <option value="PEN">PEN</option>
                    <option value="EUR">EUR</option>
                  </Select>
                </FormControl>

                {/* Amount in local fiat */}
                <FormControl isRequired>
                  <FormLabel color="white">Amount to Deposit</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter local fiat amount"
                    value={amountFiat}
                    onChange={(e) => setAmountFiat(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  />
                </FormControl>

                {/* Estimated Stablecoin Conversion */}
                <Box>
                  <Text color="white">
                    Estimated USDU:
                    <Text as="span" fontWeight="bold" ml={1}>
                      {estimatedStablecoin.toFixed(2)}
                    </Text>
                  </Text>
                </Box>

                {/* Deposit Button */}
                <Button
                  colorScheme="purple"
                  size="lg"
                  onClick={handleDeposit}
                  isLoading={processingDeposit}
                >
                  Deposit Now
                </Button>
              </VStack>
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  );
};

export default DepositPage;
