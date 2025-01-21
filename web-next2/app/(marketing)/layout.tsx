import { MarketingLayout } from '#components/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kipu – AI-Powered Global Remittances',
  description:
    'Send money across borders at near-zero cost with Kipu. Instant stablecoin transfers that eliminate hidden fees and wait times.',
}

export default function Layout(props: { children: React.ReactNode }) {
  return <MarketingLayout>{props.children}</MarketingLayout>
}
