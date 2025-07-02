import { Box, Button, Collapse } from "@chakra-ui/react";
import React from "react";

interface MathKeyboardProps {
  onInsert: (latex: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const symbols = [
  { latex: "^", label: "^" },
  { latex: "_", label: "_" },
  { latex: "\\frac{}{}", label: "Fraction" },
  { latex: "\\sqrt{}", label: "√" },
  { latex: "\\pi", label: "π" },
  { latex: "\\theta", label: "θ" },
  { latex: "\\int", label: "∫" },
  { latex: "\\sum", label: "∑" },
  { latex: "\\sin", label: "sin" },
  { latex: "\\cos", label: "cos" },
  { latex: "\\tan", label: "tan" },
  { latex: "\\log", label: "log" },
  { latex: "\\ln", label: "ln" },
  { latex: "\\leq", label: "≤" },
  { latex: "\\geq", label: "≥" },
  { latex: "\\neq", label: "≠" },
  { latex: "\\infty", label: "∞" },
  { latex: "\\left(  \right)", label: "( )" },
  { latex: "\\left[  \right]", label: "[ ]" },
  { latex: "\\left|  \right|", label: "| |" },
  { latex: "\\cdot", label: "·" },
  { latex: "+", label: "+" },
  { latex: "-", label: "-" },
  { latex: "*", label: "×" },
  { latex: "/", label: "÷" },
  { latex: "=", label: "=" },
];

export const MathKeyboard: React.FC<MathKeyboardProps> = ({ onInsert, isOpen, onClose }) => {
  return (
    <Collapse in={isOpen} animateOpacity style={{ width: '100%' }}>
      <Box
        bg="gray.800"
        borderRadius="md"
        p={3}
        mb={2}
        boxShadow="lg"
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        zIndex={20}
        position="relative"
      >
        {symbols.map((sym) => (
          <Button
            key={sym.label}
            size="sm"
            m={1}
            colorScheme="purple"
            variant="outline"
            onClick={() => onInsert(sym.latex)}
          >
            {sym.label}
          </Button>
        ))}
        <Button size="sm" colorScheme="gray" ml={2} onClick={onClose}>
          Close
        </Button>
      </Box>
    </Collapse>
  );
}; 