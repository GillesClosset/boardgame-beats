'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Input,
  Button,
  VStack,
  Text,
  useToast,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from '../components/layout/MainLayout';

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to home if not authenticated
  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search query is empty',
        description: 'Please enter a board game name to search',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    // This will be implemented later to fetch board games
    // For now, just show a loading state and then a message
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Search functionality coming soon',
        description: 'The search feature is under development',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }, 1500);
  };

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">
            Find Your Board Game
          </Heading>
          <Text fontSize="lg">
            Search for a board game to generate a custom Spotify playlist that matches its atmosphere.
          </Text>

          <Flex gap={4}>
            <Input
              placeholder="Enter board game name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="lg"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <Button
              colorScheme="brand"
              size="lg"
              onClick={handleSearch}
              isLoading={isLoading}
              loadingText="Searching"
            >
              Search
            </Button>
          </Flex>

          {isLoading && (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="brand.500" />
              <Text mt={4}>Searching for board games...</Text>
            </Box>
          )}

          {/* Search results will be displayed here */}
          <Box py={6}>
            <Text textAlign="center" fontSize="lg" fontStyle="italic">
              {!isLoading && 'Search results will appear here'}
            </Text>
          </Box>
        </VStack>
      </Container>
    </MainLayout>
  );
} 