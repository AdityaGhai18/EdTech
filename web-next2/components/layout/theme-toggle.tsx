import { IconButton, useColorMode } from '@chakra-ui/react'
import { FiMoon, FiSun } from 'react-icons/fi'

const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  // Return null to hide the button while preserving the theme functionality
  return null
}

export default ThemeToggle
