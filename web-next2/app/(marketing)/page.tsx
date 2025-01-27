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

// Custom components (import your local ones)
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

// If using the app router in Next.js 13, you can export metadata normally:
// export const metadata: Metadata = { ... }

const Home: NextPage = () => {
  return (
    <Box className="kipu-home-page">
      <HeroSection />
      <HighlightsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
    </Box>
  )
}

/* ----------------------------------------------------------------------------
 * Hero Section
 * ------------------------------------------------------------------------- */
const HeroSection: React.FC = () => {
  return (
    <Box position="relative" overflow="hidden" className="hero-section">
      <BackgroundGradient height="100%" zIndex="-1" />
      <Container maxW="container.xl" pt={{ base: 40, lg: 60 }} pb="40">
        {/* 
         * Use a responsive Stack to position Hero text and image side by side. 
         * On smaller screens, they stack vertically. 
         */}
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          alignItems="center"
          spacing={{ base: 10, lg: 24 }}
        >
          {/* Hero Text Container */}
          <Box flex="1" className="hero-text-container">
            <Hero
              id="home"
              justifyContent="flex-start"
              px="0"
              title={
                <FallInPlace>
                  <Heading as="h1" size="2xl" lineHeight="short" mb={4}>
                    Seamless Global Payments <Br /> at Near-Zero Cost
                  </Heading>
                </FallInPlace>
              }
              description={
                <FallInPlace delay={0.4} fontWeight="medium">
                  Kipu is an <Em>AI-driven, blockchain-based</Em> platform that
                  enables rapid, low-cost international money transfers. Our{' '}
                  <Em>USDU stablecoin</Em> is always backed by real USD reserves,
                  guaranteeing trust, liquidity, and security for all your
                  cross-border transactions.
                </FallInPlace>
              }
            >
              <FallInPlace delay={0.8}>
                <ButtonGroup spacing={4} alignItems="center" mt={6}>
                  <ButtonLink
                    colorScheme="primary"
                    size="lg"
                    href="/signup"
                    className="cta-signup-button"
                  >
                    Get Started
                  </ButtonLink>
                  <ButtonLink
                    size="lg"
                    variant="outline"
                    href="#features"
                    className="cta-learnmore-button"
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

          {/* Hero Image Container */}
          <Box flex="1" className="hero-image-container">
            <FallInPlace delay={1}>
              <Box
                position="relative"
                width="100%"
                height={{ base: '300px', md: '400px', lg: '500px' }}
                overflow="hidden"
              >
                <Image
                  src="/static/images/banner-kipu.png"
                  alt="Kipu dashboard screenshot"
                  fill
                  style={{ objectFit: 'contain' }}
                  quality={100}
                  priority
                />
              </Box>
            </FallInPlace>
          </Box>
        </Stack>
      </Container>

      {/* Hero Bottom Features */}
      <Features
        id="benefits"
        columns={[1, 2, 4]}
        iconSize={4}
        innerWidth="container.xl"
        pt="20"
        className="hero-bottom-features"
        features={[
          {
            title: 'Minimal Fees',
            icon: FiSmile,
            description:
              'Stop overpaying for wire transfers. Our AI-optimized liquidity slashes transfer costs dramatically.',
            iconPosition: 'left',
            delay: 0.6,
          },
          {
            title: 'Instant Access',
            icon: FiSliders,
            description:
              'Don’t wait days for funds to settle. With USDU stablecoins, recipients withdraw cash immediately.',
            iconPosition: 'left',
            delay: 0.8,
          },
          {
            title: 'Transparent & Stable',
            icon: FiGrid,
            description:
              'USDU’s 1:1 USD backing builds trust. Our local reserves ensure consistent liquidity and stability.',
            iconPosition: 'left',
            delay: 1,
          },
          {
            title: 'Effortless Transfers',
            icon: FiThumbsUp,
            description:
              'Whether paying tuition or supporting family, send cross-border funds with just a few taps.',
            iconPosition: 'left',
            delay: 1.1,
          },
        ]}
        reveal={FallInPlace}
      />
    </Box>
  )
}

/* ----------------------------------------------------------------------------
 * Highlights Section
 * ------------------------------------------------------------------------- */
const HighlightsSection = () => {
  const { value, onCopy, hasCopied } = useClipboard('https://mykipu.com')

  return (
    <Highlights className="highlights-section">
      <HighlightsItem
        colSpan={[1, null, 2]}
        title="Global Transfers, Simplified"
        className="highlight-item"
      >
        <Text color="muted" fontSize="xl" mb={4}>
          Kipu eliminates the hurdles of sending money abroad. Deposit your fiat,
          receive USDU instantly, and cash out in another country’s currency
          without inflated fees or endless delays. Whether you’re supporting
          family or paying for studies, Kipu’s streamlined process is fast,
          transparent, and hassle-free.
        </Text>
      </HighlightsItem>

      <HighlightsItem title="Why Choose Kipu?" className="highlight-item">
        <Text color="muted" fontSize="lg">
          Traditional remittance services are slow, pricey, and lack transparency.
          With Kipu, you get:
        </Text>
        <Text mt={2} color="muted" fontSize="lg">
          • AI-optimized liquidity for minimal fees <Br />
          • 1:1 USD-backed stablecoin for confidence <Br />
          • Local reserves to ensure quick, hassle-free payouts
        </Text>
      </HighlightsItem>

      <HighlightsTestimonialItem
        name="Daniela G."
        description="International Student, Peru"
        avatar="/static/images/avatar.jpg"
        gradient={['pink.200', 'purple.500']}
        className="highlight-testimonial"
      >
        “Kipu has saved me time, money, and headaches! My parents send dollars
        from the U.S. and I can instantly withdraw in soles back home. No more
        hidden fees or endless waits.”
      </HighlightsTestimonialItem>

      <HighlightsItem
        colSpan={[1, null, 2]}
        title="Built for Global Impact"
        className="highlight-item"
      >
        <Text color="muted" fontSize="lg" mb={4}>
          Whether you’re sending money to loved ones or covering education
          expenses, Kipu’s near-instant settlement and stablecoin-powered
          transfers provide true peace of mind. Say goodbye to hefty wire fees
          and unpredictable exchange rates—start experiencing a smarter, faster,
          and fairer way to send funds.
        </Text>
        <Wrap mt={8}>
          {[
            'AI-driven liquidity',
            '1:1 USD reserves',
            'Instant cross-border payouts',
            'Regulated partners',
            'Easy-to-use app',
            'No hidden charges',
            'Multi-currency support',
            'Compliance-ready',
            'Real-time notifications',
            'Loved by students abroad',
          ].map((tagItem) => (
            <Tag
              key={tagItem}
              variant="subtle"
              colorScheme="purple"
              rounded="full"
              px={3}
              className="highlight-tag"
            >
              {tagItem}
            </Tag>
          ))}
        </Wrap>
      </HighlightsItem>
    </Highlights>
  )
}

/* ----------------------------------------------------------------------------
 * Features Section
 * ------------------------------------------------------------------------- */
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
          className="features-title"
        >
          Dive Into Kipu’s Key Advantages
        </Heading>
      }
      description={
        <>
          We go beyond ordinary remittances by harnessing stablecoin tech,
          blockchain efficiency, and AI-driven liquidity. Experience fast,
          secure, and cost-effective cross-border money transfers like never
          before.
        </>
      }
      align="left"
      columns={[1, 2, 3]}
      iconSize={4}
      className="features-section"
      features={[
        {
          title: 'Near-Zero Fees',
          icon: FiBox,
          description:
            'Our AI engine expertly pairs currency flows, drastically reducing transaction costs.',
          variant: 'inline',
        },
        {
          title: 'AI Liquidity',
          icon: FiLock,
          description:
            'Forget large reserve pools. Kipu’s engine automatically balances user transactions in real time.',
          variant: 'inline',
        },
        {
          title: 'USD-Backed Stablecoin',
          icon: FiSearch,
          description:
            'Each USDU token is redeemable 1:1 for USD, making every transaction transparent and dependable.',
          variant: 'inline',
        },
        {
          title: 'Instant Settlement',
          icon: FiUserPlus,
          description:
            'Funds clear in near real-time, allowing recipients to withdraw in local currencies almost immediately.',
          variant: 'inline',
        },
        {
          title: 'Global Expansion',
          icon: FiFlag,
          description:
            'Our initial focus is the U.S.–LATAM corridor, followed by other high-volume remittance markets.',
          variant: 'inline',
        },
        {
          title: 'Mobile-First Design',
          icon: FiTrendingUp,
          description:
            'Manage transfers, track balances, and stay updated on the go with our intuitive mobile app.',
          variant: 'inline',
        },
        {
          title: 'Inherent Compliance',
          icon: FiToggleLeft,
          description:
            'Robust KYC and AML checks ensure we meet regulatory guidelines across supported regions.',
          variant: 'inline',
        },
        {
          title: 'Industry-Leading Security',
          icon: FiTerminal,
          description:
            'Advanced encryption, trusted banking integrations, and audited smart contracts protect your funds and data.',
          variant: 'inline',
        },
        {
          title: 'User-Centric Interface',
          icon: FiCode,
          description:
            'No complex jargon or hidden steps. Send, receive, and convert money in just a few clicks.',
          variant: 'inline',
        },
      ]}
    />
  )
}

/* ----------------------------------------------------------------------------
 * Testimonials Section
 * ------------------------------------------------------------------------- */
const TestimonialsSection = () => {
  // Example of distributing testimonials into columns
  const columns = React.useMemo(() => {
    return testimonials.items.reduce<Array<typeof testimonials.items>>(
      (acc, testimonial, i) => {
        acc[i % 3].push(testimonial)
        return acc
      },
      [[], [], []]
    )
  }, [])

  return (
    <Testimonials
      title="What Our Early Adopters Are Saying"
      columns={[1, 2, 3]}
      innerWidth="container.xl"
      className="testimonials-section"
    >
      {columns.map((column, columnIndex) => (
        <Stack key={columnIndex} spacing={8}>
          {column.map((item, itemIndex) => (
            <Testimonial key={itemIndex} {...item} />
          ))}
        </Stack>
      ))}
    </Testimonials>
  )
}

/* ----------------------------------------------------------------------------
 * Pricing Section
 * ------------------------------------------------------------------------- */
const PricingSection = () => {
  return (
    <Pricing
      title="Early Access & Beyond"
      description="While Kipu is in beta, transfers are free. Enjoy the simplicity of near-zero cost remittances today. In the future, small micro-fees may be introduced, but our goal remains the same: deliver affordable, accessible cross-border payments."
      plans={pricing.plans}
      features={pricing.features}
      className="pricing-section"
    >
      <Text p={8} textAlign="center" color="muted">
        Join our beta to secure zero-fee transfers and help shape a more
        transparent, borderless financial future.
      </Text>
    </Pricing>
  )
}

/* ----------------------------------------------------------------------------
 * FAQ Section
 * ------------------------------------------------------------------------- */
const FaqSection = () => {
  return (
    <Faq
      title="Your Questions, Answered"
      items={[
        {
          q: 'How can Kipu offer near-zero fees?',
          a:
            'Our AI-driven engine smartly matches users who need opposite currency flows, significantly reducing liquidity overhead and fees.',
        },
        {
          q: 'Is USDU truly backed 1:1 by USD?',
          a:
            'Absolutely. We maintain segregated, highly liquid reserves so each USDU token can always be redeemed for USD in supported regions.',
        },
        {
          q: 'Which countries are first in line?',
          a:
            'We’re rolling out initially for the U.S.–Peru corridor in LATAM, with Mexico, India, and Australia next in our expansion roadmap.',
        },
        {
          q: 'Do you have transfer limits?',
          a:
            'During our beta phase, user-specific KYC levels and local regulations may impose certain caps. Keep an eye on your dashboard for the latest info.',
        },
      ]}
      className="faq-section"
    />
  )
}

export default Home
