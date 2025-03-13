'use client';

import { Box, Container } from '@chakra-ui/react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Navbar />
      <Box as="main" pt="16" minH="100vh">
        <Container maxW="container.xl" py={8}>
          {children}
        </Container>
      </Box>
    </>
  );
} 