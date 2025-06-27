// StatCard.tsx

import { Card, CardBody } from "@chakra-ui/react";
import React from "react";

interface StatCardProps {
  value: React.ReactNode;
  h?: string | number;
  w?: string | number;
  onClick?: () => void;
}

export const StatCard = ({
  value,
  h, 
  w,
  onClick,
}: StatCardProps) => {
  return (
    <Card
      cursor={onClick ? "pointer" : "default"}
      onClick={onClick}
      _hover={onClick ? { transform: "translateY(-2px)", transition: "all 0.2s" } : {}}
      h={h} 
      w={w}
      position="relative"
    >
      <CardBody h="100%" w="100%" position="relative" p={0}>
        {value}
      </CardBody>
    </Card>
  );
};
