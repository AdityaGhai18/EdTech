"use client";

import { Suspense, useState, useEffect } from "react";
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link as ChakraLink,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Link } from "@saas-ui/react";
import { BackgroundGradient } from "#components/gradients/background-gradient";
import { PageTransition } from "#components/motion/page-transition";
import { Section } from "#components/section";
import { Footer } from "#components/layout/footer";
import { supabase } from "utils/supabase";
import { Header } from "#components/layout/header";
import { useRouter } from "next/navigation";

function UpdatePasswordContent() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Optional: you can check if a valid "type=recovery" param is present
  // or rely on Supabase ephemeral session. 
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Invalid or Expired Link",
          description: "Please request a new password reset link.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push("/login");
      }
    };
    checkSession();
  }, [router, toast]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic checks
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Enter and confirm your new password.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Mismatch",
        description: "New password and confirm password do not match.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Update password
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been updated. You can now log in.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      // Redirect user to login or dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Update password error:", error);
      toast({
        title: "Error",
        description: error.message || "Unable to update password",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />

      <Section
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <BackgroundGradient zIndex="-1" />
        <PageTransition>
          <Box width="100%" maxW="480px" mx="auto" px={4} pt={10}>
            <Stack spacing={8}>
              <Heading size="lg" textAlign="center">
                Update Your Password
              </Heading>

              <Text color="gray.500" fontSize="sm" textAlign="center" px={2}>
                Enter your new password below. Once updated, you’ll be able to log in with your new credentials.
              </Text>

              <form onSubmit={handleUpdatePassword}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      height="50px"
                      fontSize="md"
                      bg="whiteAlpha.50"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      _hover={{
                        borderColor: "whiteAlpha.200",
                      }}
                      _focus={{
                        borderColor: "primary.500",
                        boxShadow: "none",
                      }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      height="50px"
                      fontSize="md"
                      bg="whiteAlpha.50"
                      border="1px solid"
                      borderColor="whiteAlpha.100"
                      _hover={{
                        borderColor: "whiteAlpha.200",
                      }}
                      _focus={{
                        borderColor: "primary.500",
                        boxShadow: "none",
                      }}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="primary"
                    isLoading={loading}
                    width="100%"
                    height="50px"
                    fontSize="md"
                    mt={2}
                  >
                    Update Password
                  </Button>
                </Stack>
              </form>

              <Center pt={2}>
                <Text fontSize="sm" color="gray.500">
                  Changed your mind?{" "}
                  <ChakraLink href="/login" color="primary.500">
                    Log In
                  </ChakraLink>
                </Text>
              </Center>
            </Stack>
          </Box>
        </PageTransition>
      </Section>

      <Footer />
    </Box>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePasswordContent />
    </Suspense>
  );
}
