import { Card, CardBody, CardHeader, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@chakra-ui/react'

interface Transaction {
  id: string
  date: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  recipient?: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
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
              <Th>ID</Th>
              <Th>Date</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.map((tx) => (
              <Tr key={tx.id}>
                <Td>{tx.id}</Td>
                <Td>{new Date(tx.date).toLocaleDateString()}</Td>
                <Td>${tx.amount.toFixed(2)}</Td>
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