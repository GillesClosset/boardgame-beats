import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Color mode config
const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

// Custom colors
const colors = {
  brand: {
    50: '#f5f0ff',
    100: '#e9dbff',
    200: '#d4b8ff',
    300: '#b992ff',
    400: '#9f6bff',
    500: '#8344ff',
    600: '#7a2dff',
    700: '#6b24e6',
    800: '#5a1ebd',
    900: '#4a1a99',
  },
  boardgame: {
    50: '#f2f7fc',
    100: '#e3eef9',
    200: '#c7ddf2',
    300: '#9bc2e6',
    400: '#6aa1d7',
    500: '#4682c5',
    600: '#3568a5',
    700: '#2c5487',
    800: '#274870',
    900: '#243c5e',
  },
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'md',
    },
    variants: {
      solid: (props: { colorMode: string }) => ({
        bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
        color: 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.700',
        },
      }),
      outline: (props: { colorMode: string }) => ({
        borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
        color: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
        _hover: {
          bg: props.colorMode === 'dark' ? 'rgba(131, 68, 255, 0.1)' : 'rgba(122, 45, 255, 0.1)',
        },
      }),
    },
  },
  Card: {
    baseStyle: (props: { colorMode: string }) => ({
      container: {
        backgroundColor: props.colorMode === 'dark' ? 'gray.800' : 'white',
        borderRadius: 'lg',
        boxShadow: 'md',
        overflow: 'hidden',
      },
    }),
  },
  Heading: {
    baseStyle: {
      fontFamily: 'heading',
      fontWeight: 'bold',
    },
  },
};

// Typography
const fonts = {
  heading: '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  body: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
};

// Styles for specific color modes
const styles = {
  global: (props: { colorMode: string }) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
  }),
};

// Create the theme
const theme = extendTheme({
  config,
  colors,
  components,
  fonts,
  styles,
});

export default theme; 