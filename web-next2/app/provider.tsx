'use client'

import { AuthProvider } from '@saas-ui/auth'
import { SaasProvider } from '@saas-ui/react'
import { theme } from '#theme'

export function Provider(props: { children: React.ReactNode }) {
  return (
    <SaasProvider 
      theme={theme}
      colorModeManager={{
        get: () => 'dark',
        set: () => {},
        type: 'cookie'
      }}
    >
      <AuthProvider>{props.children}</AuthProvider>
    </SaasProvider>
  )
}