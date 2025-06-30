import { MarketingLayout } from '#components/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EdTech – Your new math learning companion',
  description:
    'EdTech is a platform that helps you learn math in a fun and engaging way allowing your learning to be more personalized, efficient, and competitive',
}

export default function Layout(props: { children: React.ReactNode }) {
  return <MarketingLayout>{props.children}</MarketingLayout>
}
