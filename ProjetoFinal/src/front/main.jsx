import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App'

// Tema personalizado do Chakra
const theme = extendTheme({
  colors: {
    brand: {
      500: '#646cff', // cor primária
      600: '#535bf2', // hover
    },
    secondary: '#f3f4ff',
  },
  fonts: {
    body: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    heading: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: '#213547',
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
