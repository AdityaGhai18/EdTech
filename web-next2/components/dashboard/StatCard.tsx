import { Box, Card, CardBody, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Icon } from '@chakra-ui/react'
import { IconType } from 'react-icons'

interface StatCardProps {
  title: string
  value: string | number
  icon: IconType
  percentage?: number
  isIncrease?: boolean
  iconColor?: string
  isEmptyState?: boolean
  onClick?: () => void
}

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  percentage, 
  isIncrease = true, 
  iconColor = "purple.500",
  isEmptyState,
  onClick 
}: StatCardProps) => {
  return (
    <Card
      cursor={onClick ? "pointer" : "default"}
      onClick={onClick}
      _hover={onClick ? { transform: "translateY(-2px)", transition: "all 0.2s" } : {}}
    >
      <CardBody>
        <Stat>
          <Flex justify="space-between" align="center">
            <Box>
              <StatLabel>{title}</StatLabel>
              <StatNumber>{value}</StatNumber>
              {percentage && !isEmptyState && (
                <StatHelpText>
                  <StatArrow type={isIncrease ? 'increase' : 'decrease'} />
                  {percentage}%
                </StatHelpText>
              )}
            </Box>
            <Icon as={icon} boxSize={10} color={iconColor} />
          </Flex>
        </Stat>
      </CardBody>
    </Card>
  )
}