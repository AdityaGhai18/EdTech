// StatCard.tsx

import {
  Box,
  Card,
  CardBody,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
} from "@chakra-ui/react";
import { IconType } from "react-icons";

interface StatCardProps {
  title: string;
  value: string | number;
  iconType?: IconType;   // for Fi icons
  iconEmoji?: string;    // for emojis/flags
  percentage?: number;
  isIncrease?: boolean;
  iconColor?: string;
  isEmptyState?: boolean;
  onClick?: () => void;
}

export const StatCard = ({
  title,
  value,
  iconType,
  iconEmoji,
  percentage,
  isIncrease = true,
  iconColor = "purple.500",
  isEmptyState,
  onClick,
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
                  <StatArrow type={isIncrease ? "increase" : "decrease"} />
                  {percentage}%
                </StatHelpText>
              )}
            </Box>

            {/* Conditionally render an emoji or the normal icon */}
            {iconEmoji ? (
              <Box fontSize="4xl" lineHeight="1.2" paddingRight="2">
                {iconEmoji}
              </Box>
            ) : iconType ? (
              <Icon as={iconType} boxSize={10} color={iconColor} />
            ) : null}
          </Flex>
        </Stat>
      </CardBody>
    </Card>
  );
};
