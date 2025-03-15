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
  FormControl,
  FormLabel,
  Tag,
  TagLabel,
  TagCloseButton,
  Checkbox,
  HStack,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { SpotifyTrack } from '../../types';
import AuthDebug from '../../components/debug/AuthDebug';

// Example advanced queries
const EXAMPLE_QUERIES = [
  {
    name: 'Classical Piano',
    artist: '',
    track: '',
    album: '',
    year: '',
    genre: 'classical',
    additional: 'piano',
  },
  {
    name: 'Rock from 1970s',
    artist: '',
    track: '',
    album: '',
    year: '1970-1979',
    genre: 'rock',
    additional: '',
  },
  {
    name: 'Jazz Saxophone',
    artist: '',
    track: '',
    album: '',
    year: '',
    genre: 'jazz',
    additional: 'saxophone',
  },
];

export default function AdvancedSearchPage() {
  const { data: session, status, update } = useSession();
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState({
    artist: '',
    track: '',
    album: '',
    year: '',
    genre: '',
    additional: '',
  });
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showRawQuery, setShowRawQuery] = useState(false);
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
        
        // If connection is successful, fetch genres
        fetchAvailableGenres();
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
        
        // If error is authentication related, try to refresh the session
        if (data.error?.includes('Authentication required') || data.error?.includes('access token')) {
          await handleSessionRefresh();
        }
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

  // Handle session refresh
  const handleSessionRefresh = async () => {
    toast({
      title: 'Refreshing session',
      description: 'Attempting to refresh your authentication session',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    try {
      await update();
      toast({
        title: 'Session refreshed',
        description: 'Your session has been refreshed. Please try again.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast({
        title: 'Session refresh failed',
        description: 'Failed to refresh your session. Please sign in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch available genres on component mount
  useEffect(() => {
    if (session) {
      fetchAvailableGenres();
    }
  }, [session]);

  const fetchAvailableGenres = async () => {
    try {
      const response = await fetch('/api/spotify?action=genres');
      const data = await response.json();
      
      if (response.ok && data.genres) {
        setAvailableGenres(data.genres);
      } else {
        console.error('Failed to fetch genres:', data.error);
        
        // If error is authentication related, try to refresh the session
        if (data.error?.includes('Authentication required') || data.error?.includes('access token')) {
          await handleSessionRefresh();
        }
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
  };

  const buildSearchQuery = () => {
    let query = '';
    
    if (searchParams.artist) {
      query += `artist:${searchParams.artist} `;
    }
    
    if (searchParams.track) {
      query += `track:${searchParams.track} `;
    }
    
    if (searchParams.album) {
      query += `album:${searchParams.album} `;
    }
    
    if (searchParams.year) {
      query += `year:${searchParams.year} `;
    }
    
    if (searchParams.genre) {
      query += `genre:${searchParams.genre} `;
    }
    
    if (searchParams.additional) {
      query += searchParams.additional;
    }
    
    return query.trim();
  };

  const handleSearch = async () => {
    const query = buildSearchQuery();
    
    if (!query) {
      toast({
        title: 'Search query is required',
        description: 'Please enter at least one search parameter',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setApiResponse(null);

    try {
      const response = await fetch(
        `/api/spotify?action=search&query=${encodeURIComponent(query)}&limit=20`
      );
      const data = await response.json();
      
      setApiResponse(data);
      
      if (response.ok) {
        setSearchResults(data.tracks || []);
        toast({
          title: 'Search completed',
          description: `Found ${data.tracks?.length || 0} tracks`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setApiError(data.error || 'Failed to search tracks');
        toast({
          title: 'Search failed',
          description: data.error || 'Failed to search tracks',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        
        // If error is authentication related, try to refresh the session
        if (data.error?.includes('Authentication required') || data.error?.includes('access token')) {
          await handleSessionRefresh();
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

  const clearForm = () => {
    setSearchParams({
      artist: '',
      track: '',
      album: '',
      year: '',
      genre: '',
      additional: '',
    });
  };

  const applyExampleQuery = (example: typeof EXAMPLE_QUERIES[0]) => {
    setSearchParams(example);
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
          <Heading>Advanced Spotify Search</Heading>
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
        <Heading>Advanced Spotify Search</Heading>
        
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
          
          <Button
            onClick={handleSessionRefresh}
            colorScheme="blue"
            ml={4}
            mb={4}
          >
            Refresh Session
          </Button>
        </Box>
        
        <Box>
          <Heading size="md" mb={4}>Example Queries</Heading>
          <Flex gap={4} wrap="wrap">
            {EXAMPLE_QUERIES.map((example, index) => (
              <Button
                key={index}
                onClick={() => applyExampleQuery(example)}
                colorScheme="blue"
                variant="outline"
              >
                {example.name}
              </Button>
            ))}
          </Flex>
        </Box>
        
        <Divider />
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel>Artist</FormLabel>
            <Input
              name="artist"
              value={searchParams.artist}
              onChange={handleInputChange}
              placeholder="e.g. Miles Davis"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Track</FormLabel>
            <Input
              name="track"
              value={searchParams.track}
              onChange={handleInputChange}
              placeholder="e.g. So What"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Album</FormLabel>
            <Input
              name="album"
              value={searchParams.album}
              onChange={handleInputChange}
              placeholder="e.g. Kind of Blue"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Year/Year Range</FormLabel>
            <Input
              name="year"
              value={searchParams.year}
              onChange={handleInputChange}
              placeholder="e.g. 1959 or 1950-1959"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Genre</FormLabel>
            <Select
              name="genre"
              value={searchParams.genre}
              onChange={handleInputChange}
              placeholder="Select a genre"
            >
              {availableGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Additional Keywords</FormLabel>
            <Input
              name="additional"
              value={searchParams.additional}
              onChange={handleInputChange}
              placeholder="e.g. live, acoustic, remix"
            />
          </FormControl>
        </SimpleGrid>
        
        <HStack>
          <Checkbox
            isChecked={showRawQuery}
            onChange={(e) => setShowRawQuery(e.target.checked)}
          >
            Show raw query
          </Checkbox>
        </HStack>
        
        {showRawQuery && (
          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontWeight="bold" mb={2}>Raw Query:</Text>
            <Code p={2}>{buildSearchQuery()}</Code>
          </Box>
        )}
        
        <Flex gap={4}>
          <Button
            onClick={handleSearch}
            colorScheme="green"
            size="lg"
            isLoading={isLoading}
            loadingText="Searching"
          >
            Search
          </Button>
          
          <Button
            onClick={clearForm}
            variant="outline"
            size="lg"
          >
            Clear Form
          </Button>
        </Flex>
        
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