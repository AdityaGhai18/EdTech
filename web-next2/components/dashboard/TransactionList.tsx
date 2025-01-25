import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react'

interface Transaction {
  id: string
  user_id: string
  amount: number
  transaction_type: string // 'deposit','withdraw','transfer_match', etc.
  country_from: string
  country_to: string
  status: 'pending' | 'completed' | 'failed' | 'canceled'
  stablecoin_curr: string
  created_at: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'pending':
        return 'yellow'
      case 'failed':
        return 'red'
      case 'canceled':
        return 'gray'
      default:
        return 'blue'
    }
  }

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Recent Transactions</Heading>
      </CardHeader>
      <CardBody>
        <Table variant="simple">
          <Thead>
            <Tr>
              {/* If you want to show the transaction ID, uncomment below:
              <Th>ID</Th> 
              */}
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Amount</Th>
              <Th>Currency</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.map((tx) => (
              <Tr key={tx.id}>
                {/* If showing ID:
                <Td>{tx.id}</Td>
                */}
                <Td>{new Date(tx.created_at).toLocaleDateString()}</Td>
                <Td>{tx.transaction_type}</Td>
                <Td>${tx.amount.toFixed(2)}</Td>
                <Td>{tx.stablecoin_curr}</Td>
                <Td>{tx.country_from}</Td>
                <Td>{tx.country_to}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(tx.status)}>
                    {tx.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  )
}
