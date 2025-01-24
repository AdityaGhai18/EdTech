import { Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Box } from '@chakra-ui/react'

interface MatchingTransaction {
  id: string
  user_id: string
  amount: number
  country_from: string
  country_to: string
  status: string
  stablecoin_curr: string
  profiles: {
    first_name: string
    last_name: string
  }
}

interface Props {
  transactions: MatchingTransaction[]
  onMatch: (transactionId: string) => void
  onCreateRequest: () => void
}

export const MatchingTransactionList = ({ transactions, onMatch, onCreateRequest }: Props) => {
  return (
    <Box>
      <Table variant="simple" mb={6}>
        <Thead>
          <Tr>
            <Th>User</Th>
            <Th>Amount</Th>
            <Th>From</Th>
            <Th>To</Th>
            <Th>Currency</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((tx) => (
            <Tr 
              key={tx.id}
              _hover={{ bg: 'whiteAlpha.100' }}
              cursor="pointer"
            >
              <Td>
                {tx.profiles 
                  ? `${tx.profiles.first_name} ${tx.profiles.last_name}`
                  : 'Loading...'}
              </Td>
              <Td>${tx.amount.toFixed(2)}</Td>
              <Td>{tx.country_from}</Td>
              <Td>{tx.country_to}</Td>
              <Td>{tx.stablecoin_curr}</Td>
              <Td>
                <Badge colorScheme={tx.status === 'pending' ? 'yellow' : 'green'}>
                  {tx.status}
                </Badge>
              </Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="purple"
                  onClick={() => onMatch(tx.id)}
                >
                  Match
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      
      {transactions.length === 0 ? (
        <Button
          colorScheme="purple"
          size="lg"
          onClick={onCreateRequest}
          w="full"
        >
          Create New Transfer Request
        </Button>
      ) : (
        <Button
          colorScheme="gray"
          size="lg"
          onClick={onCreateRequest}
          w="full"
          mt={4}
        >
          None of these match? Create New Request
        </Button>
      )}
    </Box>
  )
} 