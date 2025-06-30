"use client";

import { Box, Flex, Heading } from "@chakra-ui/react";
import { Sidebar } from "#components/dashboard/Sidebar";
import { PageTransition } from "#components/motion/page-transition";
import { BackgroundGradient } from "#components/gradients/background-gradient";
import ProtectedRoute from "#components/auth/protected-route";

export default function HistoryPage() {
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
                  Question History
                </Heading>
              </Box>
            </PageTransition>
          </Box>
        </Flex>
      </Box>
    </ProtectedRoute>
  );
}
