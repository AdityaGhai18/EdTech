"use client";
import { useEffect, useState } from "react";
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
  Spinner,
  Center,
} from "@chakra-ui/react";
import { supabase } from "utils/supabase"; // Adjust if needed

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string; // 'deposit','withdraw','transfer_match', etc.
  country_from: string;     // e.g. 'US' or 'STABLECOIN'
  country_to: string;       // e.g. 'PE' or 'STABLECOIN'
  status: "pending" | "completed" | "failed" | "canceled";
  stablecoin_curr: string;
  created_at: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

interface CountryRow {
  code: string;    // e.g. 'US'
  name: string;    // e.g. 'United States'
  iso3?: string;
  currency_code?: string;
  is_active: boolean;
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  // We'll store a code->name mapping for countries
  const [countryMap, setCountryMap] = useState<Record<string, string>>({});
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Fetch the countries from Supabase so we can map code -> name
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data, error } = await supabase
          .from<"countries", CountryRow>("countries")
          .select("code,name")
          .eq("is_active", true); // Only show active countries

        if (error) throw error;

        // Build a lookup map { 'US': 'United States', 'PE': 'Peru', ... }
        const map: Record<string, string> = {};
        data?.forEach((c) => {
          map[c.code] = c.name;
        });
        setCountryMap(map);
      } catch (err) {
        console.error("Error fetching countries:", err);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Determine color for transaction status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "pending":
        return "yellow";
      case "failed":
        return "red";
      case "canceled":
        return "gray";
      default:
        return "blue";
    }
  };

  // Convert code to country name or "Kipu Account"
  const getDisplayName = (code: string) => {
    if (code === "STABLECOIN") {
      return "Kipu Account";
    }
    // If code is in countryMap, show that name, else fallback to the raw code
    return countryMap[code] || code;
  };

  if (loadingCountries) {
    return (
      <Center mt={4}>
        <Spinner />
      </Center>
    );
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
                <Td>{new Date(tx.created_at).toLocaleDateString()}</Td>
                <Td>
                  {tx.transaction_type.charAt(0).toUpperCase() +
                    tx.transaction_type.slice(1).split("_")[0]}
                </Td>
                <Td>${tx.amount.toFixed(2)}</Td>
                <Td>{tx.stablecoin_curr}</Td>
                <Td>{getDisplayName(tx.country_from)}</Td>
                <Td>{getDisplayName(tx.country_to)}</Td>
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
  );
};
