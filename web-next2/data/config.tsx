import { Button } from '@chakra-ui/react'
import { Link } from '@saas-ui/react'
import { NextSeoProps } from 'next-seo'
import { FaGithub, FaTwitter } from 'react-icons/fa'
import { FiCheck } from 'react-icons/fi'
import { Logo } from './logo'

const siteConfig = {
  // Replace this Logo import with Edtech's actual logo component or image
  logo: Logo,

  // Updated SEO metadata for Kipu
  seo: {
    title: 'math champ',
    description:
      'Send and receive money across borders instantly with AI-powered stablecoin technology. Enjoy near-zero fees, immediate access to funds, and reliable local fiat on/off ramps.',
  } as NextSeoProps,

  // Placeholder links for Terms & Privacy, update if you have real URLs
  termsUrl: '#',
  privacyUrl: '#',

  // Header navigation updated with edtechs's pages
  header: {
    links: [
      {
        id: 'features',
        label: 'Features',
      },
      {
        id: 'pricing',
        label: 'Pricing',
      },
      {
        id: 'faq',
        label: 'FAQ',
      },
      {
        label: 'Login',
        href: '/login',
      },
      {
        label: 'Sign Up',
        href: '/signup',
        variant: 'primary',
      },
    ],
  },

  footer: {
    copyright: (
      <>
        Built by{' '}
        <Link href="mailto:aditya_ghai@berkeley.edu">Mail us</Link>
      </>
    ),
    links: [
      {
        href: 'mailto:aditya_ghai@berkeley.edu',
        label: 'Contact',
      },
      {
        // Replace with your official Twitter handle if desired
        href: 'https://twitter.com/',
        label: <FaTwitter size="14" />,
      },
      {
        // Replace with your official GitHub repo if you have one
        href: 'https://github.com/',
        label: <FaGithub size="14" />,
      },
    ],
  },

  // Sign Up section now highlights Kipu's key benefits
  signup: {
    title: 'Join EdTech and Level Up Your Math Skills',
    features: [

      {
        icon: FiCheck,
        title: 'Personalized Recommendations',
        description:
          'Get question suggestions tailored to your strengths, weaknesses, and learning goals.',
      },
      {
        icon: FiCheck,
        title: 'Detailed Progress Tracking',
        description:
          'See your growth over time, topic-by-topic, and celebrate every milestone you achieve.',
      },
      {
        icon: FiCheck,
        title: 'QCE-Aligned Content',
        description:
          'Practice with questions designed for QCE Math Methods (Grade 11/12) and prepare with confidence.',
      },
      {
        icon: FiCheck,
        title: 'Build up your ELO',
        description:
          'Earn points, climb the leaderboard, and make math practice fun and competitive.',
      },

    ],
  },
}

export default siteConfig
