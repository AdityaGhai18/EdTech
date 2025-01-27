'use client'

import {
  Box,
  ButtonGroup,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Stack,
  Tag,
  Text,
  VStack,
  Wrap,
  useClipboard,
} from '@chakra-ui/react'
import { Br, Link } from '@saas-ui/react'
import type { Metadata, NextPage } from 'next'
import Image from 'next/image'
import {
  FiArrowRight,
  FiBox,
  FiCheck,
  FiCode,
  FiCopy,
  FiFlag,
  FiGrid,
  FiLock,
  FiSearch,
  FiSliders,
  FiSmile,
  FiTerminal,
  FiThumbsUp,
  FiToggleLeft,
  FiTrendingUp,
  FiUserPlus,
} from 'react-icons/fi'

import * as React from 'react'

import { ButtonLink } from '#components/button-link/button-link'
import { Faq } from '#components/faq'
import { Features } from '#components/features'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { Hero } from '#components/hero'
import {
  Highlights,
  HighlightsItem,
  HighlightsTestimonialItem,
} from '#components/highlights'
import { FallInPlace } from '#components/motion/fall-in-place'
import { Pricing } from '#components/pricing/pricing'
import { Testimonial, Testimonials } from '#components/testimonials'
import { Em } from '#components/typography'
import faq from '#data/faq'
import pricing from '#data/pricing'
import testimonials from '#data/testimonials'

// If you use Next.js 13 with app router, you can export metadata normally
// export const metadata: Metadata = { ... }

const Home: NextPage = () => {
  return (
    <Box>
      <HeroSection />
      <HighlightsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
    </Box>
  )
}

const HeroSection: React.FC = () => {
  return (
    <Box position="relative" overflow="hidden">
      <BackgroundGradient height="100%" zIndex="-1" />
      <Container maxW="container.xl" pt={{ base: 40, lg: 60 }} pb="40">
        {/** 
         * 1) Use a Stack to position hero text and image side-by-side on large
         *    screens. On mobile, they stack vertically by default.
         */}
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          alignItems="center"
          spacing={{ base: 10, lg: 24 }}
        >
          {/** 2) Hero text container */}
          <Box flex="1">
            <Hero
              id="home"
              justifyContent="flex-start"
              px="0"
              title={
                <FallInPlace>
                  Send Money Across Borders
                  <Br /> at Near-Zero Cost
                </FallInPlace>
              }
              description={
                <FallInPlace delay={0.4} fontWeight="medium">
                  Kipu is an <Em>AI-powered, blockchain-based platform</Em> that
                  empowers you to transfer funds internationally without hidden
                  fees or delays. Our <Em>USDU stablecoin network</Em> is backed
                  1:1 by USD reserves, ensuring trust and instant liquidity for
                  all your cross-border transactions.
                </FallInPlace>
              }
            >
              <FallInPlace delay={0.8}>
                <ButtonGroup spacing={4} alignItems="center" mt={6}>
                  <ButtonLink colorScheme="primary" size="lg" href="/signup">
                    Sign Up Now
                  </ButtonLink>
                  <ButtonLink
                    size="lg"
                    href="#features"
                    variant="outline"
                    rightIcon={
                      <Icon
                        as={FiArrowRight}
                        sx={{
                          transitionProperty: 'common',
                          transitionDuration: 'normal',
                          '.chakra-button:hover &': {
                            transform: 'translate(5px)',
                          },
                        }}
                      />
                    }
                  >
                    Learn More
                  </ButtonLink>
                </ButtonGroup>
              </FallInPlace>
            </Hero>
          </Box>

          {/** 3) Image container, no absolute positioning; let it flex */}
          <Box flex="1">
            <FallInPlace delay={1}>
              {/**
               * 4) Constrain the image height on mobile (e.g., 300px).
               *    On larger screens, it can scale to 500 or 600px.
               */}
              <Box
                position="relative"
                width="100%"
                height={{ base: '300px', md: '400px', lg: '500px' }}
                overflow="hidden"
              >
                <Image
                  src="/static/images/banner-kipu.png"
                  alt="Screenshot of Kipu's dashboard"
                  fill
                  style={{
                    objectFit: 'contain',
                  }}
                  quality={100}
                  priority
                />
              </Box>
            </FallInPlace>
          </Box>
        </Stack>
      </Container>

      <Features
        id="benefits"
        columns={[1, 2, 4]}
        iconSize={4}
        innerWidth="container.xl"
        pt="20"
        features={[
          {
            title: 'Near-Zero Fees',
            icon: FiSmile,
            description:
              'Stop wasting money on high wire transfers. Kipu leverages AI-based liquidity to cut transaction fees to almost zero.',
            iconPosition: 'left',
            delay: 0.6,
          },
          {
            title: 'Instant Liquidity',
            icon: FiSliders,
            description:
              'No more waiting days for funds. USDU stablecoins settle instantly, so recipients have immediate access to cash.',
            iconPosition: 'left',
            delay: 0.8,
          },
          {
            title: 'Trusted & Stable',
            icon: FiGrid,
            description:
              'USDU is backed 1:1 by USD reserves in each region, ensuring security and local on/off ramps wherever you go.',
            iconPosition: 'left',
            delay: 1,
          },
          {
            title: 'Easy Transfers',
            icon: FiThumbsUp,
            description:
              'Send funds directly to friends, family, or yourself in another country with just a few clicks.',
            iconPosition: 'left',
            delay: 1.1,
          },
        ]}
        reveal={FallInPlace}
      />
    </Box>
  )
}

const HighlightsSection = () => {
  const { value, onCopy, hasCopied } = useClipboard('https://mykipu.com')

  return (
    <Highlights>
      <HighlightsItem
        colSpan={[1, null, 2]}
        title="Simplify Global Money Transfers"
      >
        {/* <VStack alignItems="flex-start" spacing="8"> */}
          <Text color="muted" fontSize="xl">
            With Kipu, you can deposit local fiat, instantly receive stablecoins
            (USDU), and withdraw them in another country’s currency—all while
            skipping the typical wire fees. Whether you’re a student or sending
            money to family back home, Kipu makes cross-border payments fast,
            transparent, and hassle-free.
          </Text>
          {/* <Flex
            rounded="full"
            borderWidth="1px"
            flexDirection="row"
            alignItems="center"
            py="1"
            ps="8"
            pe="2"
            bg="primary.900"
            _dark={{ bg: 'gray.900' }}
          >
            <Box>
              <Text color="yellow.400" display="inline">
                Visit:
              </Text>{' '}
              <Text color="cyan.300" display="inline">
                {value}
              </Text>
            </Box>
            <IconButton
              icon={hasCopied ? <FiCheck /> : <FiCopy />}
              aria-label="Copy URL"
              onClick={onCopy}
              variant="ghost"
              ms="4"
              isRound
              color="white"
            />
          </Flex> */}
        {/* </VStack> */}
      </HighlightsItem>

      <HighlightsItem title="Why Kipu?">
        <Text color="muted" fontSize="lg">
          Traditional remittance services are slow, expensive, and often lack
          transparency. Kipu solves these issues with:
        </Text>
        <Text mt="2" color="muted" fontSize="lg">
          • AI-powered matching to cut fees <Br />
          • 1:1 USD-backed stablecoins to ensure value <Br />
          • Local reserves for immediate liquidity and payout
        </Text>
      </HighlightsItem>

      <HighlightsTestimonialItem
        name="Daniela G."
        description="International Student, Peru"
        avatar="/static/images/avatar.jpg"
        gradient={['pink.200', 'purple.500']}
      >
        “Kipu has saved me so much time and money! My parents can send dollars
        from the US and I withdraw in soles the same day—no crazy fees. It’s
        truly seamless.”
      </HighlightsTestimonialItem>

      <HighlightsItem
        colSpan={[1, null, 2]}
        title="Engineered for Maximum Impact"
      >
        <Text color="muted" fontSize="lg">
          Whether you’re supporting a loved one abroad or managing tuition
          payments, Kipu’s near-instant settlement and stablecoin technology
          guarantee peace of mind. Say goodbye to cumbersome wire fees and
          unpredictable exchange rates—start sending smarter, faster, and
          cheaper.
        </Text>
        <Wrap mt="8">
          {[
            'AI-driven liquidity',
            '1:1 stablecoin reserves',
            'Instant cross-border payouts',
            'Regulated banking partners',
            'User-friendly app',
            'No hidden fees',
            'Supports multiple currencies',
            'Secure & compliant',
            'Real-time notifications',
            'Trusted by students abroad',
          ].map((value) => (
            <Tag
              key={value}
              variant="subtle"
              colorScheme="purple"
              rounded="full"
              px="3"
            >
              {value}
            </Tag>
          ))}
        </Wrap>
      </HighlightsItem>
    </Highlights>
  )
}

const FeaturesSection = () => {
  return (
    <Features
      id="features"
      title={
        <Heading
          lineHeight="short"
          fontSize={['2xl', null, '4xl']}
          textAlign="left"
          as="p"
        >
          Discover Kipu’s Core Advantages
        </Heading>
      }
      description={
        <>
          We go beyond traditional remittances by leveraging stablecoins,
          blockchain tech, and AI-based liquidity. Kipu offers everything you
          need for secure, frictionless, and cost-effective money transfers.
        </>
      }
      align="left"
      columns={[1, 2, 3]}
      iconSize={4}
      features={[
        {
          title: 'Zero-Cost Transfers',
          icon: FiBox,
          description:
            'Our AI-driven engine matches currency flows in real-time, letting you send money with negligible or zero fees.',
          variant: 'inline',
        },
        {
          title: 'AI Liquidity Matching',
          icon: FiLock,
          description:
            'Eliminates the need for large reserve pools by automatically pairing user transactions across borders.',
          variant: 'inline',
        },
        {
          title: 'Backed 1:1 by USD',
          icon: FiSearch,
          description:
            'Our USDU stablecoins are pegged to the dollar, guaranteeing stable value and smooth on/off ramps.',
          variant: 'inline',
        },
        {
          title: 'Instant Settlement',
          icon: FiUserPlus,
          description:
            'No more waiting days for funds to clear. Recipients can withdraw in local fiat almost immediately.',
          variant: 'inline',
        },
        {
          title: 'Multi-Region Expansion',
          icon: FiFlag,
          description:
            'We start with the U.S.–LATAM corridor, then expand to other high-volume remittance channels (Mexico, India, Australia).',
          variant: 'inline',
        },
        {
          title: 'Smartphone-Friendly',
          icon: FiTrendingUp,
          description:
            'Kipu’s mobile-first approach means anyone can transact on the go, track funds, and manage stablecoins with ease.',
          variant: 'inline',
        },
        {
          title: 'Compliance Built-In',
          icon: FiToggleLeft,
          description:
            'Robust KYC and AML checks ensure trust and meet regulatory requirements in all supported regions.',
          variant: 'inline',
        },
        {
          title: 'Advanced Security',
          icon: FiTerminal,
          description:
            'End-to-end encryption, secure bank integrations, and audited smart contracts keep your data and funds protected.',
          variant: 'inline',
        },
        {
          title: 'Simple, Transparent UX',
          icon: FiCode,
          description:
            'No jargon or hidden steps. Our interface is designed for anyone to send, hold, or withdraw money with minimal clicks.',
          variant: 'inline',
        },
      ]}
    />
  )
}

const TestimonialsSection = () => {
  // existing testimonial logic
  const columns = React.useMemo(() => {
    return testimonials.items.reduce<Array<typeof testimonials.items>>(
      (columns, t, i) => {
        columns[i % 3].push(t)
        return columns
      },
      [[], [], []],
    )
  }, [])

  return (
    <Testimonials
      title="What Our Early Adopters Say"
      columns={[1, 2, 3]}
      innerWidth="container.xl"
    >
      <>
        {columns.map((column, i) => (
          <Stack key={i} spacing="8">
            {column.map((t, i) => (
              <Testimonial key={i} {...t} />
            ))}
          </Stack>
        ))}
      </>
    </Testimonials>
  )
}

const PricingSection = () => {
  return (
    <Pricing
      title="Early Access & Future Plans"
      description="Kipu is free while in beta. Experience zero-cost money transfers now. Eventually, micro-fees may apply, but our mission remains: make remittances near-free for everyone."
      plans={pricing.plans}
      features={pricing.features}
    >
      <Text p="8" textAlign="center" color="muted">
        Sign up during beta to lock in zero-fee transfers and help us shape the
        future of global remittances.
      </Text>
    </Pricing>
  )
}

const FaqSection = () => {
  return (
    <Faq
      title="Frequently Asked Questions"
      items={[
        {
          q: 'How does Kipu offer near-zero fees?',
          a:
            'Our AI matching engine pairs users who want to exchange currencies in opposite directions. This “netting” effect drastically reduces liquidity requirements and fees.',
        },
        {
          q: 'Is Kipu’s stablecoin (USDU) really backed 1:1 by USD?',
          a:
            'Yes. We hold reserves in segregated, highly liquid local assets and USD. Each USDU token is redeemable 1:1 for USD in supported regions.',
        },
        {
          q: 'Which countries do you support first?',
          a:
            'We’re starting with the US–LATAM corridor (focus on Peru), followed by expansions to Mexico, India, and Australia.',
        },
        {
          q: 'Are there any minimum or maximum transfer limits?',
          a:
            'During our beta, transfer limits may apply based on user KYC level and local regulatory guidelines. Check your dashboard for the latest details.',
        },
      ]}
    />
  )
}

export default Home
