import { Flex, Button } from '@chakra-ui/react'

interface TransferTabsProps {
  currentStep: number
  onStepChange: (step: number) => void
}

export const TransferTabs = ({ currentStep, onStepChange }: TransferTabsProps) => {
  return (
    <Flex 
      justify="center" 
      w="full"
    >
      <Flex 
        maxW="500px"  // Control the width of the bar
        bg="whiteAlpha.100" 
        p={4} 
        mb={8} 
        borderRadius="md"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex gap={4}>
          <Button
            variant={currentStep === 1 ? "solid" : "ghost"}
            colorScheme="purple"
            onClick={() => onStepChange(1)}
          >
            Transfer Request
          </Button>
          <Button
            variant={currentStep === 2 ? "solid" : "ghost"}
            colorScheme="purple"
            onClick={() => onStepChange(2)}
            isDisabled={currentStep === 1}
          >
            TransferMatch Center
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
} 