'use client';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import theme from './theme';
import { AtmosphereProvider } from './context/atmosphere-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <SessionProvider>
        <ChakraProvider theme={theme}>
          <AtmosphereProvider>
            {children}
          </AtmosphereProvider>
        </ChakraProvider>
      </SessionProvider>
    </>
  );
} 