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
  SimpleGrid,
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
  FiBook,
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


const Home: NextPage = () => {
  return (
    <Box className="edTech-home-page">
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
    <Box position="relative" overflow="hidden" className="hero-section">
      <BackgroundGradient height="100%" zIndex="-1" />
      <Container maxW="container.xl" pt={{ base: 40, lg: 60 }} pb="40">
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          alignItems="center"
          spacing={{ base: 10, lg: 24 }}
        >
          <Box flex="1" className="hero-text-container">
            <Hero
              id="home"
              justifyContent="flex-start"
              px="0"
              title={
                <FallInPlace>
                  <Heading as="h1" size="2xl" lineHeight="short" mb={4}>
                    MathChamp: Gamified Math Mastery for QCE
                  </Heading>
                </FallInPlace>
              }
              description={
                <FallInPlace delay={0.4} fontWeight="medium">
                  Level up your QCE Math Methods skills with our gamified platform! Take a fundamentals test, get your ELO, and solve questions tailored to your level. Compete, improve, and master math the fun way. In-depth lessons and explanations coming soon!
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
                  alt="Math learning dashboard screenshot"
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
      <Features
        id="benefits"
        columns={[1, 2, 4]}
        iconSize={4}
        innerWidth="container.xl"
        pt="20"
        className="hero-bottom-features"
        features={[
          {
            title: 'Personalized ELO System',
            icon: FiTrendingUp,
            description:
              'Start with a fundamentals test and get matched to questions at your level. Watch your ELO grow as you improve!',
            iconPosition: 'left',
            delay: 0.6,
          },
          {
            title: 'QCE Math Methods Focus',
            icon: FiGrid,
            description:
              'All questions and lessons are tailored for Grade 11 & 12 QCE Math Methods. More subjects coming soon!',
            iconPosition: 'left',
            delay: 0.8,
          },
          {
            title: 'Gamified Learning',
            icon: FiSmile,
            description:
              'Earn points, climb the leaderboard, and challenge yourself with increasingly difficult questions.',
            iconPosition: 'left',
            delay: 1,
          },
          {
            title: 'Future: In-Depth Lessons',
            icon: FiBook,
            description:
              'We are working on detailed lessons and explanations for every topic. Stay tuned!',
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
  return (
    <Highlights className="highlights-section" pt={8} pb={8}>
      <HighlightsItem
        colSpan={[1, null, 2]}
        title="Why Choose EdTech?"
        className="highlight-item"
      >
        <Text color="muted" fontSize="xl" mb={2}>
          EdTech is your companion for QCE Math Methods. Whether you're preparing for exams, need extra practice, or want to challenge yourself, our platform adapts to your needs and helps you grow.           From teachers, to tutors, to students, the platform is designed to be used by everyone.

        </Text>
        <Text color="muted" fontSize="xl" mb={2}>
          Start your journey with EdTech today and see how engaging, effective, and enjoyable math learning can be!

        </Text>
      </HighlightsItem>
      <HighlightsItem title="How It Works" className="highlight-item">
        <Text color="muted" fontSize="lg">
          1. Take a fundamentals test to get your starting ELO.<Br />
          2. Solve questions matched to your skill level.<Br />
          3. Track your progress and climb the leaderboard.<Br />
          4. Get ready for in-depth lessons and topic explanations soon!
        </Text>
      </HighlightsItem>
      <HighlightsTestimonialItem
        name="Alex J."
        description="Grade 12 Student, QLD"
        avatar="/static/images/avatar.jpg"
        gradient={['primary.900', 'primary.700']}
        className="highlight-testimonial"
        bg="gray.800"
        _dark={{ bg: 'gray.900', borderColor: 'whiteAlpha.100' }}
      >
        <span>EdTech made practicing for QCE so much more fun. The ELO system keeps me motivated and I can see my progress every week!</span>
      </HighlightsTestimonialItem>
      <HighlightsItem
        colSpan={[1, null, 2]}
        title="Features at a Glance"
        className="highlight-item"
      >
        <Text color="muted" fontSize="lg" mb={4}>
          - Gamified ELO-based question environment<Br />
          - Topic tags and progress tracking<Br />
          - Designed for QCE Math Methods<Br />
          - More subjects and lessons coming soon!
        </Text>
        <Wrap mt={8}>
          {[
            'Personalized ELO',
            'Leaderboard',
            'Topic Tags',
            'Progress Tracking',
            'QCE Focused',
            'Future Lessons',
            'Friendly for Tutors',
            'Student Community',
          ].map((tagItem) => (
            <Tag
              key={tagItem}
              variant="subtle"
              colorScheme="primary"
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
          Why Students Love EdTech
        </Heading>
      }
      description={
        <>
          Our platform is built for students, by students. We make math practice engaging, competitive, and effective. Get instant feedback, track your growth, and never run out of questions!
        </>
      }
      align="left"
      columns={[1, 2, 3]}
      iconSize={4}
      className="features-section"
      features={[
        {
          title: 'Adaptive Questioning',
          icon: FiSliders,
          description:
            'Questions adapt to your ELO, so you are always challenged at the right level.',
          variant: 'inline',
        },
        {
          title: 'Progress Tracking',
          icon: FiTrendingUp,
          description:
            'See your stats, streaks, and improvements over time.',
          variant: 'inline',
        },
        {
          title: 'Topic Mastery',
          icon: FiCheck,
          description:
            'Earn badges for mastering different QCE Math Methods topics.',
          variant: 'inline',
        },
        {
          title: 'Tutor Friendly',
          icon: FiUserPlus,
          description:
            'Tutors can use EdTech to assign practice and monitor student progress.',
          variant: 'inline',
        },
        {
          title: 'Community Support',
          icon: FiSmile,
          description:
            'Join a community of learners, share tips, and celebrate wins together.',
          variant: 'inline',
        },
        {
          title: 'Mobile Ready',
          icon: FiFlag,
          description:
            'Practice math anywhere, anytime on any device.',
          variant: 'inline',
        },
        {
          title: 'Future: In-Depth Lessons',
          icon: FiBook,
          description:
            'We are building detailed lessons and explanations for every topic. Stay tuned!',
          variant: 'inline',
        },
        {
          title: 'Leaderboard',
          icon: FiTrendingUp,
          description:
            'Climb the ranks and see how you stack up against other students.',
          variant: 'inline',
        },
        {
          title: 'Always More Questions',
          icon: FiBox,
          description:
            'Never run out of practice. Our database is always growing.',
          variant: 'inline',
        },
      ]}
    />
  )
}

const TestimonialsSection = () => {
  return (
    <Box as="section" py={10} bg="transparent">
      <Box textAlign="center" mb={8}>
        <Heading as="h2" size="xl">
          What Students Are Saying
        </Heading>
      </Box>
      <Box maxW="1200px" mx="auto">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} justifyItems="center">
          <Box minW="300px" maxW="350px" mx="auto">
            <Testimonial
              name="Sam K."
              description="Grade 11 Student, QLD"
              avatar="/static/images/avatar2.jpg"
            >
              "I used to hate practice questions, but now I actually look forward to them. I have fun trying to get a higher ELO!"
            </Testimonial>
          </Box>
          <Box minW="300px" maxW="350px" mx="auto">
            <Testimonial
              name="Emily R."
              description="Grade 12 Student, QLD"
              avatar="/static/images/avatar2.jpg"
            >
              "I love how the questions get harder as I improve. It keeps me challenged and motivated."
            </Testimonial>
          </Box>
          <Box minW="300px" maxW="350px" mx="auto">
            <Testimonial
              name="Priya S."
              description="Grade 12 Student, QLD"
              avatar="/static/images/avatar3.jpg"
            >
              "EdTech helped me boost my confidence before exams. I love seeing my progress!"
            </Testimonial>
          </Box>
          <Box minW="300px" maxW="350px" mx="auto">
            <Testimonial
              name="Noah W."
              description="Grade 11 Student, QLD"
              avatar="/static/images/avatar3.jpg"
            >
              "The ELO system is so cool. I can see exactly how much I am improving every week."
            </Testimonial>
          </Box>
          <Box minW="300px" maxW="350px" mx="auto">
            <Testimonial
              name="Liam T."
              description="Grade 11 Student, QLD"
              avatar="/static/images/avatar.jpg"
            >
              "The leaderboard makes it so much more fun to practice. I always try to beat my friends!"
            </Testimonial>
          </Box>
          <Box minW="300px" maxW="350px" mx="auto">
            <Testimonial
              name="Sophie M."
              description="Grade 12 Student, QLD"
              avatar="/static/images/avatar.jpg"
            >
              "EdTech is the best way to prepare for QCE Math Methods. The explanations are super helpful!"
            </Testimonial>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  )
}


const PricingSection = () => {
  return (
    <Pricing
      title="Free for Early Users!"
      description="Sign up now and get full access to all features for free during our beta. Help us shape the future of math learning."
      plans={[]}
      className="pricing-section"
    >
      <Text p={6} textAlign="center" color="muted">
        Join now and be part of the EdTech journey. Your feedback helps us build the best math platform for QCE and beyond!
      </Text>
    </Pricing>
  )
}

const FaqSection = () => {
  const faqItems = [
    {
      q: 'What is EdTech?',
      a: 'EdTech is a gamified math learning platform focused on QCE Math Methods for grades 11 and 12. We use an ELO system to personalize your learning journey.',
    },
    {
      q: 'How does the ELO system work?',
      a: 'You start with a fundamentals test to get your initial ELO. As you solve questions, your ELO adjusts to match your skill level, ensuring you are always challenged appropriately.',
    },
    {
      q: 'Is EdTech free?',
      a: 'Yes! During our beta, all features are free for early users.',
    },
    {
      q: 'Will there be more subjects?',
      a: 'Absolutely. We plan to add more subjects, lessons, and features based on your feedback.',
    },
  ];
  return (
    <Box as="section" py={10}>
      <Box textAlign="center" mb={8}>
        <Heading as="h2" size="xl">
          Frequently Asked Questions
        </Heading>
      </Box>
      <Box maxW="1000px" mx="auto">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {faqItems.map((item, idx) => (
            <Box
              key={idx}
              bg="whiteAlpha.50"
              borderRadius="lg"
              p={6}
              boxShadow="md"
              color="white"
            >
              <Text fontWeight="bold" fontSize="lg" mb={2}>{item.q}</Text>
              <Text fontSize="md" color="gray.200">{item.a}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

export default Home
