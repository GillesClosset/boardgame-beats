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
  Icon,
  Badge,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAtmosphere } from '@/app/context/atmosphere-context';
import GenreSelector from '@/app/components/atmosphere/GenreSelector';
import KeywordSelector from '@/app/components/atmosphere/KeywordSelector';
import TrackCount from '@/app/components/atmosphere/TrackCount';
import AiSuggestionButton from '@/app/components/atmosphere/AiSuggestionButton';
import { SpotifyTrack } from '../types';
import { FaSpotify } from 'react-icons/fa';

export default function AtmospherePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    selectedGame,
    selectedGenres,
    updateSelectedGenres,
    aiKeywords,
    selectedKeywords,
    updateSelectedKeywords,
    trackCount,
    updateTrackCount,
    aiSuggestedGenres,
    setAiSuggestions,
    aiExplanation,
    spotifyTracks,
    updateSpotifyTracks,
    addSpotifyTracks,
    clearSpotifyTracks,
    activeSearchType,
    setActiveSearchType,
  } = useAtmosphere();

  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
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
  const handleAiSuggestions = useCallback((genres: string[], keywords: string[], explanation?: string) => {
    setAiSuggestions(genres, keywords, explanation);
    
    // Clear previous search results
    clearSpotifyTracks();
    
    // Search for tracks based on the suggested genres by default
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
    setActiveSearchType('genres');
    clearSpotifyTracks();

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

  const handleSearchByKeywords = async (keywords: string[]) => {
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
    setActiveSearchType('keywords');
    clearSpotifyTracks();

    try {
      for (const keyword of keywords) {
        const response = await fetch(`/api/spotify?action=search&query=${encodeURIComponent(keyword)}&limit=5`);
        const data = await response.json();
        
        if (response.ok && data.tracks && data.tracks.length > 0) {
          // Add these tracks to our results
          addSpotifyTracks(data.tracks);
        } else {
          console.warn(`No results found for keyword: ${keyword}`);
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

  const handleContinue = useCallback(async () => {
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

    if (!selectedGame) {
      toast({
        title: 'No game selected',
        description: 'Please select a board game first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (spotifyTracks.length === 0) {
      toast({
        title: 'No tracks found',
        description: 'Please get AI suggestions to find matching tracks',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCreatingPlaylist(true);

    try {
      // Get current user's ID
      const userResponse = await fetch('/api/spotify?action=profile');
      const userData = await userResponse.json();

      if (!userResponse.ok || !userData.id) {
        throw new Error('Failed to get user profile');
      }

      // Create a playlist
      const playlistName = `${selectedGame.name} Soundtrack - BoardGame Beats`;
      
      // Create a shorter description to avoid exceeding Spotify's limit (max 300 characters)
      let playlistDescription = `A soundtrack for the board game "${selectedGame.name}" with genres: ${selectedGenres.join(', ')}`;
      
      // Add explanation if there's room (keeping total under 300 characters)
      if (aiExplanation && (playlistDescription.length + aiExplanation.length) < 295) {
        playlistDescription += `. ${aiExplanation}`;
      } else if (aiExplanation) {
        // If too long, truncate the explanation
        const remainingChars = 295 - playlistDescription.length;
        if (remainingChars > 10) { // Only add if we can include something meaningful
          playlistDescription += `. ${aiExplanation.substring(0, remainingChars - 3)}...`;
        }
      }
      
      // Spotify has a description limit of 300 characters
      if (playlistDescription.length > 300) {
        playlistDescription = playlistDescription.substring(0, 297) + '...';
      }

      const createPlaylistResponse = await fetch(`/api/spotify?action=createPlaylist&userId=${userData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
          public: false,
        }),
      });

      const playlistData = await createPlaylistResponse.json();

      if (!createPlaylistResponse.ok || !playlistData.id) {
        throw new Error('Failed to create playlist');
      }

      // Add tracks to the playlist
      const trackUris = spotifyTracks.map(track => track.uri);
      
      const addTracksResponse = await fetch(`/api/spotify?action=addTracksToPlaylist&playlistId=${playlistData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: trackUris.slice(0, Math.min(trackUris.length, 100)), // Spotify has a limit of 100 tracks per request
        }),
      });

      if (!addTracksResponse.ok) {
        throw new Error('Failed to add tracks to playlist');
      }

      // Save the playlist URL for the user to open in Spotify
      setPlaylistUrl(playlistData.external_urls.spotify);

      toast({
        title: 'Playlist created',
        description: 'Your playlist has been created in Spotify',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: 'Failed to create playlist',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingPlaylist(false);
    }
  }, [selectedGame, selectedGenres, spotifyTracks, aiExplanation, session?.user?.accessToken, toast]);

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
                
                <Button 
                  mt={4} 
                  colorScheme="blue" 
                  onClick={() => handleSearchByGenres(selectedGenres)}
                  isDisabled={selectedGenres.length === 0}
                  width="full"
                >
                  Search by Genres
                </Button>
                <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                  {activeSearchType === 'genres' && 'Default'}
                </Text>
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
                <KeywordSelector 
                  selectedKeywords={selectedKeywords}
                  onChange={updateSelectedKeywords}
                  aiSuggestedKeywords={aiKeywords}
                />
                
                <Button 
                  mt={4} 
                  colorScheme="green" 
                  onClick={() => handleSearchByKeywords(selectedKeywords)}
                  isDisabled={selectedKeywords.length === 0}
                  width="full"
                >
                  Search by Keywords
                </Button>
                <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                  {activeSearchType === 'keywords' && 'Default'}
                </Text>
              </Box>
            </GridItem>
          </Grid>

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
              {activeSearchType && (
                <Badge ml={2} colorScheme={activeSearchType === 'genres' ? 'blue' : 'green'}>
                  {activeSearchType === 'genres' ? 'By Genres' : 'By Keywords'}
                </Badge>
              )}
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
                No search results available. Click "Get AI Suggestions" or use the search buttons to find music.
              </Text>
            )}
          </Box>

          <Divider my={4} />

          <Flex justify="center" mt={4} direction="column" align="center" gap={4}>
            <Button 
              colorScheme="blue" 
              size="lg" 
              onClick={handleContinue}
              px={8}
              isLoading={isCreatingPlaylist}
              loadingText="Creating Playlist"
              isDisabled={spotifyTracks.length === 0 || !session?.user?.accessToken}
            >
              Generate Playlist
            </Button>

            {playlistUrl && (
              <Button
                as="a"
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="green"
                leftIcon={<Icon as={FaSpotify} />}
                size="lg"
              >
                Play on Spotify
              </Button>
            )}

            {(selectedGenres.length === 0 && selectedKeywords.length === 0) && (
              <Text textAlign="center" color="red.500">
                Please select at least one genre or keyword to continue
              </Text>
            )}
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
} 