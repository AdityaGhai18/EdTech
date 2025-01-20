import { Button } from '@chakra-ui/react'
import { Link } from '@saas-ui/react'
import { NextSeoProps } from 'next-seo'
import { FaGithub, FaTwitter } from 'react-icons/fa'
import { FiCheck } from 'react-icons/fi'
import { Logo } from './logo'

const siteConfig = {
  // Replace this Logo import with Kipu’s actual logo component or image
  logo: Logo,

  // Updated SEO metadata for Kipu
  seo: {
    title: 'Kipu – Near-Zero Fee Cross-Border Transfers',
    description:
      'Send and receive money across borders instantly with AI-powered stablecoin technology. Enjoy near-zero fees, immediate access to funds, and reliable local fiat on/off ramps.',
  } as NextSeoProps,

  // Placeholder links for Terms & Privacy, update if you have real URLs
  termsUrl: '#',
  privacyUrl: '#',

  // Header navigation updated with Kipu’s pages
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

  // Footer updated to reflect Kipu’s ownership
  footer: {
    copyright: (
      <>
        Built by{' '}
        <Link href="mailto:socratesj.osorio at berkeley.edu">Kipu Labs LLC</Link>
      </>
    ),
    links: [
      {
        href: 'mailto:socratesj.osorio at berkeley.edu',
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

  // Sign Up section now highlights Kipu’s key benefits
  signup: {
    title: 'Start Sending Money with Kipu',
    features: [
      {
        icon: FiCheck,
        title: 'Near-Zero Fees',
        description:
          'Enjoy minimal or zero cost on cross-border transfers with our AI-based liquidity matching.',
      },
      {
        icon: FiCheck,
        title: 'Stable & Secure',
        description:
          'USDU is backed 1:1 by USD reserves, ensuring trust and instant redemption for local fiat.',
      },
      {
        icon: FiCheck,
        title: 'Instant Settlement',
        description:
          'Skip the delays. Access funds in seconds with real-time payouts to local bank accounts.',
      },
      {
        icon: FiCheck,
        title: 'Simple & Transparent',
        description:
          'No hidden fees or complicated procedures. Our interface is designed for quick, seamless transfers.',
      },
    ],
  },
}

export default siteConfig
