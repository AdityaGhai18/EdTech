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
  Text,
} from "@chakra-ui/react";
import { Sidebar } from "#components/dashboard/Sidebar";
import { PageTransition } from "#components/motion/page-transition";
import { BackgroundGradient } from "#components/gradients/background-gradient";
import { supabase } from "utils/supabase";
import { useRouter } from "next/navigation";

interface BankAccount {
  id: string;
  user_id: string;
  account_number: string;
  bank_name?: string;
  iban?: string;
  country?: string; // e.g. 'US', 'PE'
}

interface CryptoWallet {
  id: string;
  user_id: string;
  all_sc?: {
    [region: string]: number | string; // Could be string or number
  };
}

interface CountryRow {
  code: string;  // 'PE'
  name: string;  // 'Peru'
  is_active: boolean;
}

export default function WithdrawPage() {
  const router = useRouter();
  const toast = useToast();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Data
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [wallet, setWallet] = useState<CryptoWallet | null>(null);

  // For friendly country names
  const [countryMap, setCountryMap] = useState<Record<string, string>>({});

  // For region-based withdrawal
  const [regionBalances, setRegionBalances] = useState<{ region: string; balance: number }[]>([]);

  // Selected form fields
  const [selectedRegion, setSelectedRegion] = useState(""); // e.g. 'PE'
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [amountStablecoin, setAmountStablecoin] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Check user session
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

        // 2) Load bank accounts
        const { data: bankData, error: bankError } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("user_id", session.user.id);

        if (bankError) throw bankError;
        const userBankAccounts = bankData as BankAccount[];
        setBankAccounts(userBankAccounts);

        // 3) Load cryptowallet
        const { data: walletData, error: walletError } = await supabase
          .from("cryptowallets")
          .select("id, user_id, all_sc")
          .eq("user_id", session.user.id)
          .single();

        if (walletError) throw walletError;
        setWallet(walletData);

        // 4) Build region balances (only nonzero).
        //    Convert each balance to a number in case it's stored as string:
        const all_sc = walletData?.all_sc || {};
        const regionList = Object.entries(all_sc)
          .filter(([_, bal]) => {
            // Convert bal to number:
            const numericBal = typeof bal === "string" ? parseFloat(bal) : bal;
            return numericBal > 0;
          })
          .map(([region, bal]) => {
            const numericBal = typeof bal === "string" ? parseFloat(bal) : bal;
            return {
              region,
              balance: numericBal,
            };
          });
        setRegionBalances(regionList);

        // Auto-select first region if available
        if (regionList.length > 0) {
          setSelectedRegion(regionList[0].region);
          // auto-select bank account in that region
          const firstAcct = userBankAccounts.find(
            (acct) => acct.country === regionList[0].region
          );
          if (firstAcct) setSelectedBankAccount(firstAcct.id);
        }

        // 5) Load countries for friendly names
        const { data: countryData, error: cErr } = await supabase
          .from<CountryRow>("countries")
          .select("code,name")
          .eq("is_active", true);

        if (cErr) throw cErr;
        const map: Record<string, string> = {};
        countryData?.forEach((c) => {
          map[c.code] = c.name;
        });
        setCountryMap(map);

      } catch (err: any) {
        console.error("Error loading withdraw data:", err);
        toast({
          title: "Error",
          description: err.message || "Could not load data for withdrawal",
          status: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, router]);

  // Convert region code -> friendly name, e.g. "PE" -> "Peru"
  const getFriendlyName = (regionCode: string) => {
    const countryName = countryMap[regionCode];
    return countryName ? `USDU (${countryName})` : `USDU (${regionCode})`;
  };

  // If user picks a region, reset the bank account if it doesn't match
  const handleChangeRegion = (newRegion: string) => {
    setSelectedRegion(newRegion);
    // find a bank account in that region
    const firstAcct = bankAccounts.find((acct) => acct.country === newRegion);
    if (firstAcct) {
      setSelectedBankAccount(firstAcct.id);
    } else {
      setSelectedBankAccount("");
    }
  };

  // If user picks a bank account => ensure region matches
  const handleChangeBankAccount = (acctId: string) => {
    setSelectedBankAccount(acctId);
    const acct = bankAccounts.find((a) => a.id === acctId);
    if (acct && acct.country) {
      setSelectedRegion(acct.country);
    }
  };

  const handleWithdraw = async () => {
    try {
      setProcessing(true);

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

      if (!selectedRegion || !selectedBankAccount || !amountStablecoin) {
        toast({
          title: "Missing fields",
          description: "Please select region, bank account, and amount",
          status: "error",
          duration: 3000,
        });
        return;
      }

      const amtNum = parseFloat(amountStablecoin);
      if (isNaN(amtNum) || amtNum <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid positive number",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Check region's current balance
      const regionBalObj = regionBalances.find((r) => r.region === selectedRegion);
      const regionBal = regionBalObj?.balance ?? 0;
      if (amtNum > regionBal) {
        toast({
          title: "Insufficient Balance",
          // Use `.toLocaleString` with 2 decimals
          description: `Your ${getFriendlyName(selectedRegion)} balance is only ${regionBal
            .toFixed(2)
            .toLocaleString()}.`,
          status: "error",
          duration: 4000,
        });
        return;
      }

      // Insert a withdrawal transaction
      const friendly = getFriendlyName(selectedRegion);
      const { data: insertTx, error: insertError } = await supabase
        .from("transactions")
        .insert({
          user_id: session.user.id,
          amount: amtNum,
          transaction_type: "withdraw",
          country_from: selectedRegion,
          country_to: selectedRegion, // same region => local bank
          stablecoin_curr: friendly,  // e.g. "USDU (Peru)"
          status: "pending",
          reference_id: selectedBankAccount,
        })
        .select("*")
        .single();

      if (insertError) throw insertError;

      if (!wallet) throw new Error("No wallet data loaded");

      // Subtract from all_sc[selectedRegion]
      const updatedAllSc = { ...(wallet.all_sc || {}) };
      const currentBalRaw = updatedAllSc[selectedRegion] ?? 0;
      // Convert to number
      const currentBal = typeof currentBalRaw === "string" ? parseFloat(currentBalRaw) : currentBalRaw;
      let newBal = currentBal - amtNum;
      if (newBal < 0) newBal = 0;
      updatedAllSc[selectedRegion] = newBal;

      // Update cryptowallet
      const { error: walletErr } = await supabase
        .from("cryptowallets")
        .update({ all_sc: updatedAllSc })
        .eq("id", wallet.id);

      if (walletErr) throw walletErr;

      // Optionally mark transaction as 'completed'
      const { error: txUpdateErr } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", insertTx.id);
      if (txUpdateErr) throw txUpdateErr;

      // Update regionBalances in local state
      const newBalances = regionBalances.map((r) => {
        if (r.region === selectedRegion) {
          return { ...r, balance: r.balance - amtNum };
        }
        return r;
      });
      setRegionBalances(newBalances);

      toast({
        title: "Withdrawal successful",
        description: `You withdrew ${amtNum.toFixed(2)} from ${friendly} balance.`,
        status: "success",
        duration: 4000,
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Error making withdrawal",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 3000,
      });
    } finally {
      setProcessing(false);
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

  // Filter bank accounts to the selected region
  const filteredBankAccounts = bankAccounts.filter(
    (acct) => acct.country === selectedRegion
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
                Withdraw Stablecoins
              </Heading>

              {bankAccounts.length === 0 && (
                <Alert status="warning" borderRadius="md" mb={6}>
                  <AlertIcon />
                  No bank accounts found. Please add a bank account in your Profile before withdrawing.
                </Alert>
              )}

              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel color="white">Select a Region</FormLabel>
                  <Select
                    placeholder="Pick region balance"
                    value={selectedRegion}
                    onChange={(e) => handleChangeRegion(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    {regionBalances.map(({ region, balance }) => {
                      // If balance might be a string, parse it
                      const numericBal = typeof balance === "string" ? parseFloat(balance) : balance;
                      // Show exactly 2 decimals:
                      const displayedBal = numericBal.toFixed(2);

                      return (
                        <option key={region} value={region}>
                          {getFriendlyName(region)} - {displayedBal}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="white">Bank Account</FormLabel>
                  <Select
                    value={selectedBankAccount}
                    onChange={(e) => handleChangeBankAccount(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                    disabled={bankAccounts.length === 0 || !selectedRegion}
                  >
                    {filteredBankAccounts.length === 0 ? (
                      <option value="">No bank account in this region</option>
                    ) : (
                      filteredBankAccounts.map((acct) => (
                        <option key={acct.id} value={acct.id}>
                          {acct.bank_name
                            ? `${acct.bank_name} - ${acct.account_number}`
                            : `Account: ${acct.account_number}`}
                        </option>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="white">Amount to Withdraw</FormLabel>
                  <Input
                    placeholder="Enter amount"
                    value={amountStablecoin}
                    onChange={(e) => setAmountStablecoin(e.target.value)}
                    type="number"
                    bg="whiteAlpha.100"
                    color="white"
                  />
                </FormControl>

                <Button
                  colorScheme="purple"
                  size="lg"
                  onClick={handleWithdraw}
                  isLoading={processing}
                  isDisabled={bankAccounts.length === 0 || regionBalances.length === 0}
                >
                  Withdraw
                </Button>
              </VStack>
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  );
}
