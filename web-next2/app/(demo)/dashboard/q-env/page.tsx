"use client";

import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Sidebar } from "#components/dashboard/Sidebar";
import { BackgroundGradient } from "#components/gradients/background-gradient";

const QEnvPage = () => {
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
          <Heading color="white" mb={6} position="relative" zIndex={1}>Q-Env</Heading>
          <Text color="gray.300" position="relative" zIndex={1}>This is the Q-Env page. Content coming soon!</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default QEnvPage; 