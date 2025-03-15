'use client';

import React, { useEffect, useCallback, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  Button,
  useColorModeValue,
  Flex,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Stack,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAtmosphere } from '@/app/context/atmosphere-context';
import GenreSelector from '@/app/components/atmosphere/GenreSelector';
import TrackCount from '@/app/components/atmosphere/TrackCount';
import AiSuggestionButton from '@/app/components/atmosphere/AiSuggestionButton';
import { SpotifyTrack } from '../types';

export default function AtmospherePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    selectedGame,
    selectedGenres,
    updateSelectedGenres,
    trackCount,
    updateTrackCount,
    aiSuggestedGenres,
    setAiSuggestions,
    aiExplanation,
    spotifyTracks,
    updateSpotifyTracks,
    addSpotifyTracks,
    clearSpotifyTracks,
  } = useAtmosphere();

  const [isSearching, setIsSearching] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Redirect to search if no game is selected
  useEffect(() => {
    if (!selectedGame) {
      router.push('/search');
    }
  }, [selectedGame, router]);

  // Memoize the handlers to prevent unnecessary re-renders
  const handleAiSuggestions = useCallback((genres: string[], explanation?: string) => {
    setAiSuggestions(genres, explanation);
    
    // Clear previous search results
    clearSpotifyTracks();
    
    // Search for tracks based on the suggested genres
    if (genres.length > 0 && session?.user?.accessToken) {
      handleSearchByGenres(genres);
    }
  }, [setAiSuggestions, clearSpotifyTracks, session?.user?.accessToken]);

  const handleSearchByGenres = async (genres: string[]) => {
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

    setIsSearching(true);

    try {
      for (const genre of genres) {
        const response = await fetch(`/api/spotify?action=search&query=${encodeURIComponent(genre)}&limit=5`);
        const data = await response.json();
        
        if (response.ok && data.tracks && data.tracks.length > 0) {
          // Add these tracks to our results
          addSpotifyTracks(data.tracks);
        } else {
          console.warn(`No results found for genre: ${genre}`);
        }
      }
    } catch (error) {
      console.error('Error searching tracks:', error);
      toast({
        title: 'Search failed',
        description: 'An error occurred while searching',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleContinue = useCallback(() => {
    router.push('/playlist');
  }, [router]);

  if (!selectedGame) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertTitle>No game selected!</AlertTitle>
            <AlertDescription>
              Please select a board game first to customize its atmosphere.
            </AlertDescription>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={4}>
            <Heading as="h1" size="2xl" mb={4} color={textColor}>
              Customize Atmosphere
            </Heading>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
              Tailor the musical atmosphere for {selectedGame.name}
            </Text>
          </Box>

          <AiSuggestionButton 
            game={selectedGame}
            onSuggestionsGenerated={handleAiSuggestions}
          />

          {aiExplanation && (
            <Box 
              p={6} 
              bg={cardBg} 
              borderRadius="lg" 
              borderWidth="1px" 
              borderColor={borderColor}
              shadow="md"
            >
              <Heading as="h3" size="md" mb={3} color={textColor}>
                AI Recommendation Explanation
              </Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                {aiExplanation}
              </Text>
            </Box>
          )}

          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
            <GridItem>
              <Box 
                p={6} 
                bg={cardBg} 
                borderRadius="lg" 
                borderWidth="1px" 
                borderColor={borderColor}
                shadow="md"
              >
                <GenreSelector 
                  selectedGenres={selectedGenres}
                  onChange={updateSelectedGenres}
                  aiSuggestedGenres={aiSuggestedGenres}
                />
              </Box>
            </GridItem>

            <GridItem>
              <Box 
                p={6} 
                bg={cardBg} 
                borderRadius="lg" 
                borderWidth="1px" 
                borderColor={borderColor}
                shadow="md"
              >
                <TrackCount 
                  playingTime={selectedGame.playingTime}
                  value={trackCount}
                  onChange={updateTrackCount}
                />
              </Box>
            </GridItem>
          </Grid>

          {/* Search Results Section */}
          <Box 
            p={6} 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor}
            shadow="md"
          >
            <Heading as="h3" size="md" mb={4} color={textColor}>
              Search Results
            </Heading>
            
            {isSearching ? (
              <Flex justify="center" py={10}>
                <Spinner size="xl" />
              </Flex>
            ) : spotifyTracks.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 5 }} spacing={4}>
                {spotifyTracks.map((track: SpotifyTrack) => (
                  <Card key={track.id} overflow="hidden" variant="outline">
                    <CardBody p={3}>
                      <Image
                        src={track.album.images[0]?.url || '/images/music-placeholder.png'}
                        alt={track.name}
                        borderRadius="md"
                        objectFit="cover"
                        width="100%"
                        height="160px"
                      />
                      <Stack mt={2} spacing={1}>
                        <Heading size="sm" noOfLines={1} title={track.name}>
                          {track.name}
                        </Heading>
                        <Text fontSize="sm" color="gray.500" noOfLines={1}>
                          {track.artists.map(artist => artist.name).join(', ')}
                        </Text>
                        <Text fontSize="xs" color="gray.400" noOfLines={1}>
                          {track.album.name}
                        </Text>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Text textAlign="center" color="gray.500" py={10}>
                No search results available. Click "Get AI Suggestions" to generate recommendations.
              </Text>
            )}
          </Box>

          <Divider my={4} />

          <Flex justify="center" mt={4}>
            <Button 
              colorScheme="blue" 
              size="lg" 
              onClick={handleContinue}
              px={8}
              isDisabled={selectedGenres.length === 0}
            >
              Generate Playlist
            </Button>
          </Flex>

          {selectedGenres.length === 0 && (
            <Text textAlign="center" color="red.500">
              Please select at least one genre to continue
            </Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
} 