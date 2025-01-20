import { HStack, Text } from '@chakra-ui/react'

export default {
  title: 'Flexible Pricing for Every Need',
  description:
    'Kipu is free during our beta, with optional advanced features and near-zero fees. Scale your cross-border transfers on your own terms.',
  plans: [
    {
      id: 'beta',
      title: 'Beta Access',
      description:
        'Perfect for individuals and early adopters who want to experience Kipu at no cost.',
      price: 'Free',
      features: [
        {
          title: 'Near-zero fees on personal transfers',
        },
        {
          title: 'Instant remittances via USDU stablecoin',
        },
        {
          title: 'AI-driven liquidity matching',
        },
        {
          title: 'Basic support & community access',
        },
        {
          title: 'Easy on/off ramps for local fiat',
        },
        {
          title: 'Deposit & withdraw in one corridor (e.g., US ↔ LATAM)',
        },
        {
          title: 'Early feedback opportunity',
        },
      ],
      action: {
        href: '#', // Adjust to your signup link or beta waitlist page
      },
    },
    {
      id: 'personal',
      title: 'Personal',
      description:
        'Ideal for frequent senders who want expanded features and broader corridor options.',
      price: 'Near-zero fees',
      isRecommended: true,
      features: [
        {
          title: 'Multiple corridors (US ↔ LATAM, US ↔ Mexico, etc.)',
        },
        {
          title: 'Higher transaction limits',
        },
        {
          title: 'Advanced stablecoin & P2P features',
        },
        {
          title: 'Priority in AI liquidity matching',
        },
        {
          title: 'Enhanced KYC support',
        },
        {
          title: '1 year of updates & feature expansions',
        },
        null,
        {
          title: 'Dedicated customer support',
          iconColor: 'green.500',
        },
      ],
      action: {
        href: '#', // Replace with your pricing or upgrade link
      },
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      description:
        'Unlimited volume and tailored solutions for businesses, remittance providers, and high-volume users.',
      price: (
        <HStack>
          <Text textDecoration="line-through" fontSize="sm" color="gray.400">
            0.25% / Tx
          </Text>
          <Text>Custom Pricing</Text>
        </HStack>
      ),
      features: [
        {
          title: 'Unlimited transaction volume',
        },
        {
          title: 'Custom corridor expansions & local partnerships',
        },
        {
          title: 'Advanced compliance & regulatory support',
        },
        {
          title: 'Dedicated account manager & SLA',
        },
        {
          title: 'Priority liquidity provisioning',
        },
        null,
        {
          title: 'Tailored AI matching & integrations',
          iconColor: 'green.500',
        },
      ],
      action: {
        href: '#', // Replace with your Enterprise contact form or CTA
      },
    },
  ],
}
