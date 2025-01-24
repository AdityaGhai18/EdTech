import { Card, CardBody, CardHeader, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@chakra-ui/react'

interface Transaction {
  id: string
  user_id: string
  amount: number
  transaction_type: string
  country_from: string
  country_to: string
  status: 'pending' | 'completed' | 'failed'
  stablecoin_curr: string
  created_at: string
}

export const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green'
      case 'pending': return 'yellow'
      case 'failed': return 'red'
      default: return 'gray'
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
              <Th>Date</Th>
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
                <Td>{new Date(tx.created_at).toLocaleDateString()}</Td>
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