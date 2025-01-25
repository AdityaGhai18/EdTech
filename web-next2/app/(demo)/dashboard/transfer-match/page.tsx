"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Spinner,
  useToast,
  SimpleGrid,
  Button,
  Text,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Sidebar } from "#components/dashboard/Sidebar";
import { PageTransition } from "#components/motion/page-transition";
import { BackgroundGradient } from "#components/gradients/background-gradient";
import { supabase } from "utils/supabase";
import { useRouter, useSearchParams } from "next/navigation";

// Minimal type for a transfer request
interface TransferRequest {
  id: string;
  user_id: string;
  amount: number;
  stablecoin_curr: string;
  country_from: string;
  country_to: string;
  status: string; // 'open','matched','completed','expired'
  matched_request_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  first_name: string;
  last_name: string;
}

// We'll show each matching request in a simple card
const MatchCard = ({
  match,
  onConfirmMatch,
}: {
  match: {
    id: string;
    amount: number;
    stablecoin_curr: string;
    country_from: string;
    country_to: string;
    user_id: string;
    profiles: UserProfile;
  };
  onConfirmMatch: (matchId: string) => void;
}) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      p={4}
      bg="whiteAlpha.50"
      shadow="md"
      color="white"
    >
      <Text mb={2} fontWeight="bold">
        {match.country_from} → {match.country_to}
      </Text>
      <Text mb={2}>
        Amount: {match.amount} {match.stablecoin_curr}
      </Text>
      <Text mb={2}>
        Counterparty: {match.profiles?.first_name} {match.profiles?.last_name}
      </Text>
      <Button
        colorScheme="purple"
        onClick={() => onConfirmMatch(match.id)}
        size="sm"
      >
        Match This
      </Button>
    </Box>
  );
};

const TransferMatchPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // The newly created request
  const [myRequest, setMyRequest] = useState<TransferRequest | null>(null);

  // Potential matches (reverse corridor, open, not me)
  const [matches, setMatches] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequestAndMatches = async () => {
      try {
        // 1) Check session
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

        // 2) Read requestId from URL
        const requestId = searchParams.get("requestId");
        if (!requestId) {
          toast({
            title: "No request ID found",
            description: "Redirecting to Dashboard...",
            status: "error",
            duration: 3000,
          });
          router.push("/dashboard");
          return;
        }

        // 3) Fetch the user's newly created request
        const { data: reqData, error: reqError } = await supabase
          .from("transfer_requests")
          .select("*")
          .eq("id", requestId)
          .single();

        if (reqError || !reqData) {
          throw reqError || new Error("Request not found");
        }

        setMyRequest(reqData);

        // 4) Fetch complementary matches: (country_from=your country_to) & (country_to=your country_from)
        const { data: matchData, error: matchError } = await supabase
          .from("transfer_requests")
          .select(
            `
              *,
              profiles:user_id (
                first_name,
                last_name
              )
            `
          )
          .eq("country_from", reqData.country_to)
          .eq("country_to", reqData.country_from)
          .eq("status", "open")
          .neq("user_id", reqData.user_id); // not me

        if (matchError) throw matchError;

        setMatches(matchData || []);
      } catch (error: any) {
        console.error("Error loading matches:", error);
        toast({
          title: "Error",
          description: error.message || "Could not load matches",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadRequestAndMatches();
  }, [router, toast, searchParams]);

  // Confirm a match
  const handleConfirmMatch = async (matchId: string) => {
    if (!myRequest) return;

    try {
      setLoading(true);

      // 1) We'll do a naive approach: just update both requests to matched.
      // In production, do a transaction or FOR UPDATE to avoid race conditions.
      // 2) We also set each other's matched_request_id.
      const { error: matchErr } = await supabase.rpc("match_transfer_requests", {
        request_a: myRequest.id,
        request_b: matchId,
      });

      // If you don't have a custom RPC, you can do something like:
    //   const { error: updateErr1 } = await supabase
    //     .from("transfer_requests")
    //     .update({ status: "matched", matched_request_id: matchId })
    //     .eq("id", myRequest.id)
    //     .eq("status", "open");
    //   if (updateErr1) throw updateErr1;
      
    //   const { error: updateErr2 } = await supabase
    //     .from("transfer_requests")
    //     .update({ status: "matched", matched_request_id: myRequest.id })
    //     .eq("id", matchId)
    //     .eq("status", "open");
    //   if (updateErr2) throw updateErr2;

      if (matchErr) throw matchErr;

      // 3) Optionally, create a transaction record for 'transfer_match'
      //    You might do one record or two, depending on your design.
      //    For example:
      // await supabase.from("transactions").insert({
      //   user_id: myRequest.user_id,
      //   amount: myRequest.amount,
      //   transaction_type: "transfer_match",
      //   country_from: myRequest.country_from,
      //   country_to: myRequest.country_to,
      //   status: "completed",
      //   stablecoin_curr: myRequest.stablecoin_curr,
      //   reference_id: matchId,
      // });

      toast({
        title: "Matched!",
        description: "Both requests have been matched successfully.",
        status: "success",
        duration: 3000,
      });

      // 4) Redirect user anywhere, e.g. to Dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error confirming match:", error);
      toast({
        title: "Error",
        description: error.message || "Could not confirm match",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
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
                TransferMatch Center
              </Heading>

              {!myRequest && (
                <Alert status="warning" mb={6} borderRadius="md">
                  <AlertIcon />
                  We could not find your request. Please create a new transfer.
                </Alert>
              )}

              {myRequest && (
                <Box mb={6} color="whiteAlpha.900">
                  <Text fontSize="md" mb={2}>
                    Your Request: <strong>{myRequest.country_from} → {myRequest.country_to}</strong>, 
                    Amount: <strong>{myRequest.amount} {myRequest.stablecoin_curr}</strong>
                  </Text>
                </Box>
              )}

              {matches.length === 0 ? (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  No matching requests found at this time. You can wait or check back later.
                </Alert>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {matches.map((m) => (
                    <MatchCard key={m.id} match={m} onConfirmMatch={handleConfirmMatch} />
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </PageTransition>
        </Box>
      </Flex>
    </Box>
  );
};

export default TransferMatchPage;
