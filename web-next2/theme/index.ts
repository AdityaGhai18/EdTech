import { extendTheme } from '@chakra-ui/react'
import '@fontsource-variable/inter'
import { theme as baseTheme } from '@saas-ui/react'

import components from './components'
import { fontSizes } from './foundations/typography'

export const theme = extendTheme(
  {
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: false,
    },
    styles: {
      global: (props: any) => ({
        body: {
          color: 'gray.900',
          bg: 'white',
          fontSize: 'lg',
          _dark: {
            color: 'white',
            bg: 'gray.900',
          },
        },
      }),
    },
    fonts: {
      heading: 'Inter Variable, Inter, sans-serif',
      body: 'Inter Variable, Inter, sans-serif',
    },
    fontSizes,
    components,
    colors: {
      primary: {
        50: '#e3eafc',
        100: '#c3d4fa',
        200: '#a3bff7',
        300: '#7fa6f3',
        400: '#4f83eb', // main
        500: '#2563eb', // main
        600: '#1d4fd7',
        700: '#1e40af',
        800: '#1e3a8a',
        900: '#172554',
      },
      secondary: {
        50: '#fff8e1',
        100: '#ffecb3',
        200: '#ffe082',
        300: '#ffd54f',
        400: '#fbbf24', // main
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
      accent: {
        50: '#e6f9f2',
        100: '#b8f2de',
        200: '#8aebca',
        300: '#5ce4b6',
        400: '#10b981', // main
        500: '#059669',
        600: '#047857',
        700: '#065f46',
        800: '#064e3b',
        900: '#022c22',
      },
      background: {
        50: '#f9fafb', // off-white
        900: '#1e293b', // slate
      },
      text: {
        900: '#1e293b', // slate
        50: '#f9fafb', // off-white
      },
      navy: {
        800: '#1a1f37',
        900: '#0f1535',
      },
    },
  },
  baseTheme,
)
