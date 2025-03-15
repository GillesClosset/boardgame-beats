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
  Tag,
  TagLabel,
  TagCloseButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { SpotifyTrack } from '../../types';
import AuthDebug from '../../components/debug/AuthDebug';

// Mock atmosphere settings for testing
const MOCK_ATMOSPHERES = [
  {
    name: 'Strategy Game',
    settings: {
      tempo: 60,
      energy: 40,
      complexity: 80,
      mood: 'mysterious',
      genres: ['classical', 'ambient'],
      era: 'modern',
    },
  },
  {
    name: 'Party Game',
    settings: {
      tempo: 90,
      energy: 85,
      complexity: 30,
      mood: 'happy',
      genres: ['pop', 'dance'],
      era: 'modern',
    },
  },
  {
    name: 'Horror Game',
    settings: {
      tempo: 40,
      energy: 60,
      complexity: 70,
      mood: 'tense',
      genres: ['ambient', 'soundtrack'],
      era: 'modern',
    },
  },
];

export default function PlaylistGeneratorTest() {
  const { data: session, status, update } = useSession();
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [trackCount, setTrackCount] = useState(20);
  const [energy, setEnergy] = useState(50);
  const [tempo, setTempo] = useState(50);
  const [valence, setValence] = useState(50);
  const [instrumentalness, setInstrumentalness] = useState(50);
  
  const [generatedTracks, setGeneratedTracks] = useState<SpotifyTrack[]>([]);
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

  const addGenre = () => {
    if (genreInput && !selectedGenres.includes(genreInput)) {
      setSelectedGenres([...selectedGenres, genreInput]);
      setGenreInput('');
    }
  };

  const removeGenre = (genre: string) => {
    setSelectedGenres(selectedGenres.filter(g => g !== genre));
  };

  const applyMockAtmosphere = (index: number) => {
    const atmosphere = MOCK_ATMOSPHERES[index];
    setSelectedGenres(atmosphere.settings.genres);
    setEnergy(atmosphere.settings.energy);
    setTempo(atmosphere.settings.tempo);
    setValence(atmosphere.settings.mood === 'happy' ? 80 : atmosphere.settings.mood === 'tense' ? 20 : 50);
    setInstrumentalness(atmosphere.settings.complexity / 2);
  };

  const generatePlaylist = async () => {
    if (selectedGenres.length === 0) {
      toast({
        title: 'No genres selected',
        description: 'Please select at least one genre',
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
      // Convert UI values to Spotify API parameters
      const atmosphereSettings = {
        tempo: tempo,
        energy: energy,
        complexity: instrumentalness * 2,
        mood: valence > 70 ? 'happy' : valence < 30 ? 'sad' : 'neutral',
        genres: selectedGenres,
        era: 'modern',
      };

      const response = await fetch('/api/spotify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'recommendations',
          seedGenres: selectedGenres.slice(0, 5), // Spotify allows max 5 seed genres
          atmosphereSettings,
        }),
      });

      const data = await response.json();
      setApiResponse(data);
      
      if (response.ok) {
        setGeneratedTracks(data.tracks || []);
        toast({
          title: 'Playlist generated',
          description: `Generated ${data.tracks?.length || 0} tracks`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setApiError(data.error || 'Failed to generate playlist');
        toast({
          title: 'Generation failed',
          description: data.error || 'Failed to generate playlist',
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
      console.error('Error generating playlist:', error);
      setApiError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: 'Generation failed',
        description: 'An error occurred while generating playlist',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
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
          <Heading>Spotify Playlist Generator Test</Heading>
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
        <Heading>Spotify Playlist Generator Test</Heading>
        
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
          <Heading size="md" mb={4}>Mock Atmospheres</Heading>
          <Flex gap={4} wrap="wrap">
            {MOCK_ATMOSPHERES.map((atmosphere, index) => (
              <Button
                key={index}
                onClick={() => applyMockAtmosphere(index)}
                colorScheme="blue"
                variant="outline"
              >
                {atmosphere.name}
              </Button>
            ))}
          </Flex>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>Genre Selection</Heading>
          <Flex gap={4} mb={4}>
            <Select
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              placeholder="Select a genre"
              flex={1}
            >
              {availableGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </Select>
            <Button onClick={addGenre} colorScheme="green">
              Add Genre
            </Button>
          </Flex>
          
          <Flex wrap="wrap" gap={2} mb={4}>
            {selectedGenres.map((genre) => (
              <Tag key={genre} size="md" borderRadius="full" variant="solid" colorScheme="green">
                <TagLabel>{genre}</TagLabel>
                <TagCloseButton onClick={() => removeGenre(genre)} />
              </Tag>
            ))}
            {selectedGenres.length === 0 && (
              <Text color="gray.500">No genres selected</Text>
            )}
          </Flex>
        </Box>
        
        <Box>
          <Heading size="md" mb={4}>Audio Features</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl>
              <FormLabel>Energy ({energy})</FormLabel>
              <Slider
                value={energy}
                onChange={setEnergy}
                min={0}
                max={100}
                step={1}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            
            <FormControl>
              <FormLabel>Tempo ({tempo})</FormLabel>
              <Slider
                value={tempo}
                onChange={setTempo}
                min={0}
                max={100}
                step={1}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            
            <FormControl>
              <FormLabel>Mood/Valence ({valence})</FormLabel>
              <Slider
                value={valence}
                onChange={setValence}
                min={0}
                max={100}
                step={1}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            
            <FormControl>
              <FormLabel>Instrumentalness ({instrumentalness})</FormLabel>
              <Slider
                value={instrumentalness}
                onChange={setInstrumentalness}
                min={0}
                max={100}
                step={1}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
          </SimpleGrid>
        </Box>
        
        <Box>
          <Heading size="md" mb={4}>Track Count</Heading>
          <NumberInput
            value={trackCount}
            onChange={(_, value) => setTrackCount(value)}
            min={1}
            max={100}
            maxW="100px"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Box>
        
        <Box>
          <Button
            onClick={generatePlaylist}
            colorScheme="green"
            size="lg"
            isLoading={isLoading}
            loadingText="Generating"
          >
            Generate Playlist
          </Button>
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
        
        {generatedTracks.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>
              Generated Playlist ({generatedTracks.length} tracks)
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {generatedTracks.map((track) => (
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
            <Text color="gray.500">No API response yet. Try generating a playlist.</Text>
          )}
        </Box>
      </VStack>
    </Container>
  );
} 