'use client';

import { Box, Container, Flex, Heading, Link, Divider } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

export default function SpotifyTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <Container maxW="container.xl" py={6}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={4}>
          Spotify API Testing
        </Heading>
        <Divider mb={4} />
        <Flex gap={6} mb={6} wrap="wrap">
          <Link
            as={NextLink}
            href="/spotify-test"
            fontWeight={isActive('/spotify-test') ? 'bold' : 'normal'}
            color={isActive('/spotify-test') ? 'green.500' : 'inherit'}
            _hover={{ textDecoration: 'none', color: 'green.500' }}
          >
            Basic Search
          </Link>
          <Link
            as={NextLink}
            href="/spotify-test/advanced-search"
            fontWeight={isActive('/spotify-test/advanced-search') ? 'bold' : 'normal'}
            color={isActive('/spotify-test/advanced-search') ? 'green.500' : 'inherit'}
            _hover={{ textDecoration: 'none', color: 'green.500' }}
          >
            Advanced Search
          </Link>
          <Link
            as={NextLink}
            href="/spotify-test/playlist-generator"
            fontWeight={isActive('/spotify-test/playlist-generator') ? 'bold' : 'normal'}
            color={isActive('/spotify-test/playlist-generator') ? 'green.500' : 'inherit'}
            _hover={{ textDecoration: 'none', color: 'green.500' }}
          >
            Playlist Generator
          </Link>
          <Link
            as={NextLink}
            href="/"
            _hover={{ textDecoration: 'none', color: 'green.500' }}
          >
            Back to Home
          </Link>
        </Flex>
        <Divider mb={4} />
      </Box>
      {children}
    </Container>
  );
} 