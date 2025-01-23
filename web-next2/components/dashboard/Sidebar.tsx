"use client";
import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react'
import {
  FiGrid,
  FiDollarSign,
  FiSend,
  FiDownload,
  FiClock,
  FiLogOut,
} from 'react-icons/fi'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from 'utils/supabase'
import { Logo } from '#components/layout/logo'

interface SidebarItemProps {
  icon: any
  label: string
  href: string
  isActive?: boolean
}

const SidebarItem = ({ icon, label, href, isActive }: SidebarItemProps) => {
  return (
    <Link href={href} passHref>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'whiteAlpha.200' : 'transparent'}
        _hover={{
          bg: 'whiteAlpha.100',
        }}
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
          color={isActive ? 'white' : 'gray.400'}
        />
        <Text color={isActive ? 'white' : 'gray.400'}>
          {label}
        </Text>
      </Flex>
    </Link>
  )
}

export const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuItems = [
    { icon: FiGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: FiDollarSign, label: 'Deposit', href: '/dashboard/deposit' },
    { icon: FiSend, label: 'Transfer', href: '/dashboard/transfer' },
    { icon: FiDownload, label: 'Withdraw', href: '/dashboard/withdraw' },
    { icon: FiClock, label: 'History', href: '/dashboard/history' },
  ]

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      h="100vh"
      pb="10"
      overflowX="hidden"
      overflowY="auto"
      bg="gray.900"
      w="240px"
      borderRight="1px"
      borderRightColor="gray.800"
    >
      <Flex px="4" pt="8" pb="4" align="center">
        <Logo
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault()
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
          }}
        />
      </Flex>

      <VStack spacing={1} align="stretch" mt="6">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={pathname === item.href}
          />
        ))}
      </VStack>

      <Flex
        position="absolute"
        bottom="5"
        left="0"
        right="0"
        px="4"
        onClick={handleLogout}
        cursor="pointer"
        _hover={{
          bg: 'whiteAlpha.100',
        }}
      >
        <Icon
          mr="4"
          fontSize="16"
          as={FiLogOut}
          color="gray.400"
        />
        <Text color="gray.400">Logout</Text>
      </Flex>
    </Box>
  )
}