"use client";

import { Suspense, useState } from "react";
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
import { supabase } from "utils/supabase"; // your Supabase client
import { Header } from "#components/layout/header";

function ForgotPasswordContent() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Handler for the "Send Reset Link" button
  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      /*
        Supabase Reset Password Flow:

        resetPasswordForEmail() sends the user a magic link to reset the password.
        Optionally pass { redirectTo: 'https://yourapp.com/new-password' } if you have a custom route for handling the password update.
      */
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // redirectTo: "https://yourapp.com/update-password", // optional
      });
      if (error) throw error;

      toast({
        title: "Reset Link Sent",
        description:
          "Check your inbox for a password reset link. It may take a few minutes to arrive.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
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

      <Section flex="1" display="flex" alignItems="center" justifyContent="center">
        <BackgroundGradient zIndex="-1" />
        <PageTransition>
          <Box width="100%" maxW="480px" mx="auto" px={4} pt={10}>
            <Stack spacing={8}>
              <Heading size="lg" textAlign="center">
                Forgot Password
              </Heading>

              <Text color="gray.500" fontSize="sm" textAlign="center" px={2}>
                Enter your email address below, and we’ll send you a link to reset
                your password.
              </Text>

              <form onSubmit={handleSendResetLink}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    Send Reset Link
                  </Button>
                </Stack>
              </form>

              <Center pt={2}>
                <Text fontSize="sm" color="gray.500">
                  Remember your password?{" "}
                  <Link href="/login" color="primary.500">
                    Log In
                  </Link>
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
