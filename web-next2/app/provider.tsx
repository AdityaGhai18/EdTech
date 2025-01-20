'use client'

import { AuthProvider } from '@saas-ui/auth'
import { SaasProvider } from '@saas-ui/react'
import { AuthProvider as SupabaseAuthProvider } from '../contexts/AuthContext'
import { theme } from '#theme'

export function Provider(props: { children: React.ReactNode }) {
  return (
    <SaasProvider theme={theme}>
      <SupabaseAuthProvider>
        <AuthProvider>{props.children}</AuthProvider>
      </SupabaseAuthProvider>
    </SaasProvider>
  )
}