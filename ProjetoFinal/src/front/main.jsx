import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App'

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
    },
  },
  fonts: {
    body: "'Inter', system-ui, sans-serif",
    heading: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
  styles: {
    global: {
      body: {
        bg: '#F8FAFC',
        color: '#1E293B',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
        transition: 'all 0.2s ease',
        _hover: {
          transform: 'translateY(-1px)',
        },
        _active: {
          transform: 'translateY(0)',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          bg: 'white',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.04)',
          transition: 'all 0.25s ease',
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '700',
        letterSpacing: '-0.025em',
        color: '#0F172A',
      },
    },
    Input: {
      defaultProps: { focusBorderColor: 'brand.500' },
    },
    Select: {
      defaultProps: { focusBorderColor: 'brand.500' },
    },
    Textarea: {
      defaultProps: { focusBorderColor: 'brand.500' },
    },
  },
  shadows: {
    card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.04)',
    cardHover: '0 10px 25px -5px rgba(99,102,241,0.18), 0 4px 6px -4px rgba(99,102,241,0.12)',
    glow: '0 0 20px rgba(99,102,241,0.4)',
    glowLg: '0 0 40px rgba(99,102,241,0.5)',
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
