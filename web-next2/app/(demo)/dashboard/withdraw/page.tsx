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

interface TransactionRow {
  amount: number;
}

export default function WithdrawPage() {
  const router = useRouter();
  const toast = useToast();

  // Page state
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Data from Supabase
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  // The net deposit balance we calculate from transactions
  const [netDepositBalance, setNetDepositBalance] = useState(0);

  // Withdraw form fields
  const [stablecoin, setStablecoin] = useState("USDU"); // default stablecoin
  const [destinationCountry, setDestinationCountry] = useState("");
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [amountStablecoin, setAmountStablecoin] = useState("");

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

        // 1) Load user’s bank accounts
        const { data: bankData, error: bankError } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("user_id", session.user.id);

        if (bankError) throw bankError;
        setBankAccounts(bankData || []);

        if (bankData && bankData.length > 0) {
          setSelectedBankAccount(bankData[0].id);
          setDestinationCountry(bankData[0].country || "");
        }

        // 2) Calculate net deposit:
        //    sum of completed deposits - sum of withdrawals (pending or completed)

        // --- Summation of completed deposits ---
        const { data: depositRows, error: depositError } = await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", session.user.id)
          .eq("transaction_type", "deposit")
          .eq("status", "completed");

        if (depositError) throw depositError;

        const totalDeposits = (depositRows || []).reduce(
          (acc: number, row: TransactionRow) => acc + row.amount,
          0
        );

        // --- Summation of withdrawals that are pending or completed ---
        const { data: withdrawRows, error: withdrawError } = await supabase
          .from("transactions")
          .select("amount,status")
          .eq("user_id", session.user.id)
          .eq("transaction_type", "withdraw")
          .in("status", ["pending", "completed"]); // only these statuses count

        if (withdrawError) throw withdrawError;

        const totalWithdraws = (withdrawRows || []).reduce(
          (acc: number, row: TransactionRow) => acc + row.amount,
          0
        );

        // net deposit the user can withdraw from
        const netBalance = totalDeposits - totalWithdraws;
        setNetDepositBalance(netBalance);
      } catch (err: any) {
        console.error("Error loading data for withdraw:", err);
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

  const handleWithdraw = async () => {
    setProcessing(true);

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

      // Validate fields
      if (!stablecoin || !destinationCountry || !selectedBankAccount || !amountStablecoin) {
        toast({
          title: "Missing fields",
          description: "Please fill in all fields",
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

      // Check net deposit limit
      if (amtNum > netDepositBalance) {
        toast({
          title: "Insufficient Net Deposits",
          description: `You only have ${netDepositBalance.toFixed(2)} USDU in net deposits available`,
          status: "error",
          duration: 4000,
        });
        return;
      }

      // Insert new transaction with status='pending'
      const { data: insertTx, error: insertError } = await supabase
        .from("transactions")
        .insert({
          user_id: session.user.id,
          amount: amtNum,
          transaction_type: "withdraw",
          country_from: "STABLECOIN",
          country_to: destinationCountry,
          stablecoin_curr: stablecoin.toUpperCase(),
          status: "pending", // or 'completed' if you auto-confirm
          reference_id: selectedBankAccount,
        })
        .select("*")
        .single();

      if (insertError) throw insertError;

      // Optional: Mark immediately as 'completed' or let it remain 'pending'
      // For MVP, let's just set it to 'completed' to simulate an instant withdrawal
      const { error: updateTxError } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", insertTx.id);

      if (updateTxError) throw updateTxError;

      // Recalculate net deposit to reflect new withdrawal
      const newNetDeposit = netDepositBalance - amtNum;
      setNetDepositBalance(newNetDeposit);

      toast({
        title: "Withdrawal successful",
        description: `You withdrew ${amtNum} USDU. Your new net deposit is ${newNetDeposit.toFixed(
          2
        )} USDU`,
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
                {/* Show net deposit available */}
                <Box>
                  <Text color="white">
                    Net Balance Available: {" "}
                    <Text as="span" fontWeight="bold">
                      {netDepositBalance.toFixed(2)} USDU
                    </Text>
                  </Text>
                </Box>

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
                    {/* add more stablecoin options here */}
                  </Select>
                </FormControl>

                {/* Destination Country */}
                <FormControl isRequired>
                  <FormLabel color="white">Destination Country</FormLabel>
                  <Select
                    placeholder="Select a country"
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                  >
                    <option value="US">United States</option>
                    <option value="PE">Peru</option>
                    <option value="MX">Mexico</option>
                    <option value="BR">Brazil</option>
                    {/* etc. */}
                  </Select>
                </FormControl>

                {/* Bank Account */}
                <FormControl isRequired>
                  <FormLabel color="white">Linked Bank Account</FormLabel>
                  <Select
                    value={selectedBankAccount}
                    onChange={(e) => setSelectedBankAccount(e.target.value)}
                    bg="whiteAlpha.100"
                    color="white"
                    disabled={bankAccounts.length === 0}
                  >
                    {bankAccounts.map((acct) => (
                      <option key={acct.id} value={acct.id}>
                        {acct.bank_name
                          ? `${acct.bank_name} - ${acct.account_number}`
                          : `Account: ${acct.account_number}`}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Amount (stablecoin) */}
                <FormControl isRequired>
                  <FormLabel color="white">Amount (Stablecoin)</FormLabel>
                  <Input
                    placeholder="Enter amount in stablecoin"
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
                  isDisabled={bankAccounts.length === 0}
                >
                  Withdraw Now
                </Button>
              </VStack>
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  );
}
