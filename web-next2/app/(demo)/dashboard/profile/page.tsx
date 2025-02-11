"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  useToast,
  Center,
  Spinner,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Progress,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { Sidebar } from "#components/dashboard/Sidebar";
import { PageTransition } from "#components/motion/page-transition";
import { BackgroundGradient } from "#components/gradients/background-gradient";
import ProtectedRoute from "#components/auth/protected-route";
import { supabase } from "utils/supabase";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  country?: string; // e.g. 'US','PE'
  kyc_level: "unverified" | "basic" | "verified";
  created_at?: string;
  updated_at?: string;
  email?: string; // from session
}

interface BankAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_holder?: string;
  bank_name?: string;
  iban?: string;
  country?: string; // e.g. 'US','PE'
  created_at?: string;
  updated_at?: string;
}

interface CountryRow {
  code: string;    // e.g. 'US','PE'
  name: string;    // e.g. 'United States','Peru'
  iso3?: string;   // e.g. 'USA','PER'
  currency_code?: string;
  is_active: boolean;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Local form state for editing personal info (still stored but disabled in UI)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [kycLevel, setKycLevel] = useState<Profile["kyc_level"]>("unverified");

  // Local state for new bank account form
  const [newBankName, setNewBankName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newIban, setNewIban] = useState("");

  // Countries list from supabase (used for the bank accounts part)
  const [countries, setCountries] = useState<CountryRow[]>([]);

  const toast = useToast();

  useEffect(() => {
    const fetchProfileData = async () => {
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
          return;
        }

        // 2) Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;

        // 3) Attach user email from session
        const fullProfile: Profile = {
          ...profileData,
          email: session.user.email,
        };
        setProfile(fullProfile);

        // Set local form states
        setFirstName(fullProfile.first_name || "");
        setLastName(fullProfile.last_name || "");
        setPhoneNumber(fullProfile.phone_number || "");
        setCountry(fullProfile.country || "");
        setKycLevel(fullProfile.kyc_level || "unverified");

        // 4) Fetch bank accounts
        const { data: bankData, error: bankError } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("user_id", session.user.id);

        if (bankError) throw bankError;
        setBankAccounts(bankData || []);

        // 5) Fetch countries (is_active = true)
        const { data: cData, error: cError } = await supabase
          .from("countries")
          .select("*")
          .eq("is_active", true)
          .order("name");

        if (cError) throw cError;
        setCountries(cData || []);
      } catch (error: any) {
        console.error("Error fetching profile or bank accounts:", error);
        toast({
          title: "Error loading profile",
          description: error.message || "Something went wrong",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [toast]);

  // We keep this method if you still want to update or do other logic,
  // but currently, the fields are disabled, so the user can't change them anyway.
  const handleUpdateProfile = async () => {
    if (!profile) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // If we wanted to allow updates, we'd pass the new values here.
      // But the fields are disabled, so effectively no changes would happen.
      const updates = {
        id: session.user.id,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        country,
        kyc_level: kycLevel,
        updated_at: new Date().toISOString(),
      };
      // No Changes Allowed
      // const { error } = await supabase.from("profiles").upsert(updates);
      // if (error) throw error;

      // toast({
      //   title: "Profile updated",
      //   description: "Your profile has been updated successfully",
      //   status: "success",
      //   duration: 3000,
      // });

      setProfile((prev) =>
        prev ? { ...prev, ...updates } : (updates as Profile)
      );
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 3000,
      });
    }
  };

  // KYC progress bar calculation
  const getKycProgress = () => {
    switch (kycLevel) {
      case "unverified":
        return 33;
      case "basic":
        return 66;
      case "verified":
        return 100;
      default:
        return 0;
    }
  };

  // Bank Accounts CRUD
  const handleAddBankAccount = async () => {
    if (!profile) return;
    if (!newAccountNumber) {
      toast({
        title: "Account number is required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const { data: newAccount, error } = await supabase
        .from("bank_accounts")
        .insert({
          user_id: profile.id,
          bank_name: newBankName,
          account_number: newAccountNumber,
          iban: newIban,
          country: newCountry,
        })
        .select("*")
        .single();

      if (error) throw error;

      setBankAccounts([...bankAccounts, newAccount]);
      setNewBankName("");
      setNewAccountNumber("");
      setNewIban("");
      setNewCountry("");

      toast({
        title: "Bank account added",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error adding bank account:", error);
      toast({
        title: "Error adding bank account",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setBankAccounts(bankAccounts.filter((acct) => acct.id !== id));
      toast({
        title: "Bank account deleted",
        status: "info",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error deleting bank account:", error);
      toast({
        title: "Error deleting bank account",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Example placeholder for changing password / 2FA
  const handleChangePassword = async () => {
    toast({
      title: "Password change is not yet implemented",
      status: "warning",
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Flex h="100vh">
          <Sidebar />
          <Center ml="240px" w="calc(100% - 240px)" bg="gray.900">
            <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
          </Center>
        </Flex>
      </ProtectedRoute>
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
                <Heading size="lg" mb={8} color="white">
                  Your Profile
                </Heading>

                {!profile && (
                  <Alert status="error" mb={6} borderRadius="md">
                    <AlertIcon />
                    Unable to load profile data.
                  </Alert>
                )}

                <Tabs variant="soft-rounded" colorScheme="purple">
                  <TabList mb={4}>
                    <Tab>Personal Info</Tab>
                    <Tab ml={4}>Bank Accounts</Tab>
                    <Tab ml={4}>Security</Tab>
                    <Tab ml={4}>Notifications</Tab>
                  </TabList>

                  <TabPanels>
                    {/* PERSONAL INFO TAB */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch" maxW="lg">
                        {/* KYC Level & Progress */}
                        <Box>
                          <Text color="gray.100" mb={2}>
                            KYC Status: <strong>{kycLevel}</strong>
                          </Text>
                          <Progress
                            value={getKycProgress()}
                            colorScheme={
                              kycLevel === "verified"
                                ? "green"
                                : kycLevel === "basic"
                                ? "yellow"
                                : "red"
                            }
                            borderRadius="md"
                            size="sm"
                          />
                        </Box>

                        <FormControl>
                          <FormLabel color="white">First Name</FormLabel>
                          <Input
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            bg="whiteAlpha.100"
                            color="white"
                            isDisabled  // <-- disable editing
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color="white">Last Name</FormLabel>
                          <Input
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            bg="whiteAlpha.100"
                            color="white"
                            isDisabled  // <-- disable editing
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color="white">Email</FormLabel>
                          <Input
                            value={profile?.email || ""}
                            isReadOnly
                            bg="whiteAlpha.100"
                            color="white"
                            isDisabled  // <-- disable editing
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color="white">Phone Number</FormLabel>
                          <Input
                            placeholder="+1 555 123 4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            bg="whiteAlpha.100"
                            color="white"
                            isDisabled  // <-- disable editing
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color="white">Country</FormLabel>
                          <Select
                            placeholder="Select your country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            bg="whiteAlpha.100"
                            color="white"
                            isDisabled  // <-- disable editing
                          >
                            {countries.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        {/* 
                          Since fields are disabled, 
                          this button won't actually change anything.
                        */}
                        <Button
                          colorScheme="purple"
                          size="md"
                          onClick={handleUpdateProfile}
                          alignSelf="flex-start"
                          disabled
                        >
                          Update Profile
                        </Button>
                      </VStack>
                    </TabPanel>

                    {/* BANK ACCOUNTS TAB */}
                    <TabPanel>
                      <Heading size="md" color="white" mb={4}>
                        Linked Bank Accounts
                      </Heading>

                      {bankAccounts.length === 0 ? (
                        <Text color="whiteAlpha.700" mb={4}>
                          No bank accounts found.
                        </Text>
                      ) : (
                        <Table variant="simple" mb={6}>
                          <Thead>
                            <Tr>
                              <Th color="gray.200">Bank</Th>
                              <Th color="gray.200">Account Number</Th>
                              <Th color="gray.200">IBAN</Th>
                              <Th color="gray.200">Country</Th>
                              <Th />
                            </Tr>
                          </Thead>
                          <Tbody>
                            {bankAccounts.map((acct) => (
                              <Tr key={acct.id}>
                                <Td color="white">{acct.bank_name || "-"}</Td>
                                <Td color="white">{acct.account_number}</Td>
                                <Td color="white">{acct.iban || "-"}</Td>
                                <Td color="white">{acct.country || "-"}</Td>
                                <Td>
                                  <IconButton
                                    aria-label="Delete account"
                                    icon={<DeleteIcon />}
                                    colorScheme="red"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteBankAccount(acct.id)
                                    }
                                  />
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      )}

                      <Heading size="sm" color="white" mb={2}>
                        Add a New Bank Account
                      </Heading>
                      <VStack spacing={4} align="stretch" maxW="md">
                        <FormControl>
                          <FormLabel color="white">Bank Name</FormLabel>
                          <Input
                            placeholder="Bank name (optional)"
                            value={newBankName}
                            onChange={(e) => setNewBankName(e.target.value)}
                            bg="whiteAlpha.100"
                            color="white"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel color="white">Account Number</FormLabel>
                          <Input
                            placeholder="Account number"
                            value={newAccountNumber}
                            onChange={(e) => setNewAccountNumber(e.target.value)}
                            bg="whiteAlpha.100"
                            color="white"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel color="white">IBAN</FormLabel>
                          <Input
                            placeholder="IBAN (optional)"
                            value={newIban}
                            onChange={(e) => setNewIban(e.target.value)}
                            bg="whiteAlpha.100"
                            color="white"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color="white">Country</FormLabel>
                          <Select
                            placeholder="Select country for this account"
                            value={newCountry}
                            onChange={(e) => setNewCountry(e.target.value)}
                            bg="whiteAlpha.100"
                            color="white"
                          >
                            {countries.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <Button
                          colorScheme="purple"
                          onClick={handleAddBankAccount}
                          alignSelf="flex-start"
                        >
                          Add Bank Account
                        </Button>
                      </VStack>
                    </TabPanel>

                    {/* SECURITY TAB */}
                    <TabPanel>
                      <Heading size="md" color="white" mb={4}>
                        Security Settings
                      </Heading>
                      <Text color="whiteAlpha.800" mb={4}>
                        Password changes, 2FA, and more.
                      </Text>
                      <Button colorScheme="purple" onClick={handleChangePassword}>
                        Change Password
                      </Button>
                    </TabPanel>

                    {/* NOTIFICATIONS TAB */}
                    <TabPanel>
                      <Heading size="md" color="white" mb={4}>
                        Notifications
                      </Heading>
                      <Text color="whiteAlpha.800" mb={4}>
                        Toggle email/SMS notifications, etc.
                      </Text>
                      <Alert status="info">
                        <AlertIcon />
                        Notification settings not yet implemented.
                      </Alert>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </PageTransition>
          </Box>
        </Flex>
      </Box>
    </ProtectedRoute>
  );
};

// TODO: IMPLEMENT REAL KYC
export default ProfilePage;