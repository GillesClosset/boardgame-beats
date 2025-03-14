'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Text,
  VStack,
  Code,
  Card,
  CardBody,
  Image,
  Stack,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { SpotifyTrack } from '../types';
import AuthDebug from '../components/debug/AuthDebug';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';

// Example queries
const EXAMPLE_QUERIES = [
  {
    name: 'Miles Davis - Doxy',
    query: 'remaster track:Doxy artist:Miles Davis',
  },
  {
    name: 'Rock Genre',
    query: 'genre:rock',
  },
  {
    name: 'Jazz Genre',
    query: 'genre:jazz',
  },
];

export default function SpotifyTestPage() {
  const { data: session, status, update } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const toast = useToast();

  // Function to test the API connection
  const testApiConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      const response = await fetch('/api/spotify?action=profile');
      const data = await response.json();
      
      if (response.ok) {
        setConnectionStatus('success');
        toast({
          title: 'Connection successful',
          description: 'Successfully connected to Spotify API',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        console.log('API Connection test result:', data);
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Connection failed',
          description: data.error || 'Failed to connect to Spotify API',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        console.error('API Connection test error:', data);
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: 'Connection failed',
        description: 'An error occurred while testing the connection',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('API Connection test error:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search query is required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!session?.user?.accessToken) {
      toast({
        title: 'Authentication required',
        description: 'Please make sure you are signed in with Spotify',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setApiResponse(null);

    try {
      const response = await fetch(
        `/api/spotify?action=search&query=${encodeURIComponent(searchQuery)}&limit=20`
      );
      const data = await response.json();
      
      setApiResponse(data);
      
      if (response.ok) {
        setSearchResults(data.tracks || []);
        if (data.tracks?.length === 0) {
          toast({
            title: 'No results found',
            description: 'Try a different search query',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        setApiError(data.error || 'Failed to search tracks');
        toast({
          title: 'Search failed',
          description: data.error || 'Failed to search tracks',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        
        // If authentication error, try to refresh the session
        if (data.error?.includes('Authentication required')) {
          toast({
            title: 'Trying to refresh session',
            description: 'Please wait...',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
          await update();
        }
      }
    } catch (error) {
      console.error('Error searching tracks:', error);
      setApiError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: 'Search failed',
        description: 'An error occurred while searching',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleQuery = (query: string) => {
    setSearchQuery(query);
  };

  if (status === 'loading') {
    return (
      <Container maxW="container.xl" py={10}>
        <Flex justify="center" align="center" h="50vh">
          <Spinner size="xl" />
        </Flex>
      </Container>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={6}>
          <Heading>Spotify API Test</Heading>
          <Text mb={4}>Please sign in with Spotify to use this feature</Text>
          <Button 
            colorScheme="green" 
            size="lg"
            onClick={() => signIn('spotify')}
          >
            Sign in with Spotify
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading>Spotify API Test</Heading>
        
        <AuthDebug />
        
        <Box>
          <Button
            onClick={testApiConnection}
            colorScheme="purple"
            isLoading={isTestingConnection}
            loadingText="Testing"
            mb={4}
            leftIcon={
              connectionStatus === 'success' ? <CheckIcon /> : 
              connectionStatus === 'error' ? <WarningIcon /> : 
              undefined
            }
          >
            Test API Connection
          </Button>
          
          <Text mb={2}>Search for tracks on Spotify:</Text>
          <Flex gap={4}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search query"
              size="md"
              flex={1}
            />
            <Button
              onClick={handleSearch}
              colorScheme="green"
              isLoading={isLoading}
              loadingText="Searching"
            >
              Search
            </Button>
          </Flex>
        </Box>

        <Box>
          <Text mb={2}>Example queries:</Text>
          <Flex gap={2} wrap="wrap">
            {EXAMPLE_QUERIES.map((example, index) => (
              <Button
                key={index}
                size="sm"
                onClick={() => handleExampleQuery(example.query)}
                variant="outline"
              >
                {example.name}
              </Button>
            ))}
          </Flex>
        </Box>

        <Divider />

        {apiError && (
          <Box p={4} bg="red.50" color="red.800" borderRadius="md">
            <Heading size="md" mb={2}>
              Error
            </Heading>
            <Text>{apiError}</Text>
          </Box>
        )}

        {searchResults.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>
              Search Results ({searchResults.length})
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {searchResults.map((track) => (
                <Card key={track.id} overflow="hidden" variant="outline">
                  <CardBody>
                    <Flex gap={4}>
                      <Image
                        src={track.album.images[0]?.url || '/images/no-album-art.png'}
                        alt={track.album.name}
                        borderRadius="md"
                        boxSize="80px"
                        objectFit="cover"
                      />
                      <Stack>
                        <Heading size="sm">{track.name}</Heading>
                        <Text fontSize="sm" color="gray.600">
                          {track.artists.map((a) => a.name).join(', ')}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {track.album.name}
                        </Text>
                      </Stack>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Divider />

        <Box>
          <Heading size="md" mb={4}>
            API Debug Information
          </Heading>
          {apiResponse ? (
            <Box
              p={4}
              bg="gray.50"
              borderRadius="md"
              overflowX="auto"
              maxHeight="400px"
              overflowY="auto"
            >
              <Code display="block" whiteSpace="pre" p={4}>
                {JSON.stringify(apiResponse, null, 2)}
              </Code>
            </Box>
          ) : (
            <Text color="gray.500">No API response yet. Try searching for tracks.</Text>
          )}
        </Box>
      </VStack>
    </Container>
  );
}