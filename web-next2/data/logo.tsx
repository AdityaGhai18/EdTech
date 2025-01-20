import { chakra, HTMLChakraProps, useColorModeValue } from '@chakra-ui/react'

export const Logo: React.FC<HTMLChakraProps<'svg'>> = (props) => {
  const color = useColorModeValue('#231f20', '#fff')
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <chakra.img
        src="/static/logo/logo.png"
        alt="Logo"
        {...props}
      />
      <chakra.text fontFamily="Poppins" fontSize="3xl" fontWeight="bold" ml={2}>Kipu</chakra.text>
    </div>
  )
}
