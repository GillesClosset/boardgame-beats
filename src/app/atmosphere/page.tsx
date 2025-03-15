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
  Center,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useAtmosphere } from '@/app/context/atmosphere-context';
import GenreSelector from '@/app/components/atmosphere/GenreSelector';
import KeywordSelector from '@/app/components/atmosphere/KeywordSelector';
import TrackCount from '@/app/components/atmosphere/TrackCount';
import { SpotifyTrack } from '../types';
import { FaSpotify } from 'react-icons/fa';

export default function AtmospherePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
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

  // Check authentication status when component mounts
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in with Spotify to create playlists',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [status, toast]);

  // Handle Spotify sign in
  const handleSignIn = useCallback(async () => {
    try {
      await signIn('spotify', { callbackUrl: window.location.href });
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Authentication Failed',
        description: 'Failed to sign in with Spotify. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Memoize the handlers to prevent unnecessary re-renders
  const handleSearchByGenres = useCallback(async (genres: string[]) => {
    console.log('handleSearchByGenres called with genres:', genres);
    
    // Prevent duplicate calls if already searching
    if (isSearching) {
      console.warn('Search already in progress, ignoring duplicate call');
      return;
    }
    
    if (!session?.user?.accessToken) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in with Spotify to search for music',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      handleSignIn();
      return;
    }

    // Safety check for empty genres array
    if (!genres || genres.length === 0) {
      console.warn('No genres provided to search function');
      toast({
        title: 'No genres selected',
        description: 'Please select at least one genre to search',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSearching(true);
    setActiveSearchType('genres');
    clearSpotifyTracks();

    try {
      console.log('Starting genre search for', genres.length, 'genres');
      let foundTracks = false;
      
      // Create a local copy of the genres to avoid any potential issues
      const genresToSearch = [...genres];
      
      for (const genre of genresToSearch) {
        console.log('Searching for genre:', genre);
        const response = await fetch(`/api/spotify?action=search&query=${encodeURIComponent(genre)}&limit=5`);
        const data = await response.json();
        
        if (response.ok && data.tracks && data.tracks.length > 0) {
          // Add these tracks to our results
          console.log(`Found ${data.tracks.length} tracks for genre: ${genre}`);
          addSpotifyTracks(data.tracks);
          foundTracks = true;
        } else {
          console.warn(`No results found for genre: ${genre}`);
        }
      }
      
      // Check if we found any tracks at all
      if (!foundTracks) {
        toast({
          title: 'No tracks found',
          description: 'Try different genres or use keywords instead',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Search completed',
          description: `Found tracks for your selected genres`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
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
      console.log('Genre search completed');
    }
  }, [session?.user?.accessToken, toast, setActiveSearchType, clearSpotifyTracks, addSpotifyTracks, handleSignIn, isSearching]);

  const handleAiSuggestions = useCallback((genres: string[], keywords: string[], explanation?: string) => {
    setAiSuggestions(genres, keywords, explanation);
    
    // Clear previous search results
    clearSpotifyTracks();
    
    // Search for tracks based on the suggested genres by default
    if (genres.length > 0 && session?.user?.accessToken) {
      handleSearchByGenres(genres);
    } else if (genres.length > 0 && !session?.user?.accessToken) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in with Spotify to search for music',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [setAiSuggestions, clearSpotifyTracks, session?.user?.accessToken, handleSearchByGenres, toast]);

  const handleSearchByKeywords = useCallback(async (keywords: string[]) => {
    console.log('handleSearchByKeywords called with keywords:', keywords);
    
    // Prevent duplicate calls if already searching
    if (isSearching) {
      console.warn('Search already in progress, ignoring duplicate call');
      return;
    }
    
    if (!session?.user?.accessToken) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in with Spotify to search for music',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      handleSignIn();
      return;
    }

    // Safety check for empty keywords array
    if (!keywords || keywords.length === 0) {
      console.warn('No keywords provided to search function');
      toast({
        title: 'No keywords selected',
        description: 'Please select at least one keyword to search',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSearching(true);
    setActiveSearchType('keywords');
    clearSpotifyTracks();

    try {
      console.log('Starting keyword search for', keywords.length, 'keywords');
      let foundTracks = false;
      
      // Create a local copy of the keywords to avoid any potential issues
      const keywordsToSearch = [...keywords];
      
      for (const keyword of keywordsToSearch) {
        console.log('Searching for keyword:', keyword);
        const response = await fetch(`/api/spotify?action=search&query=${encodeURIComponent(keyword)}&limit=5`);
        const data = await response.json();
        
        if (response.ok && data.tracks && data.tracks.length > 0) {
          // Add these tracks to our results
          console.log(`Found ${data.tracks.length} tracks for keyword: ${keyword}`);
          addSpotifyTracks(data.tracks);
          foundTracks = true;
        } else {
          console.warn(`No results found for keyword: ${keyword}`);
          toast({
            title: 'Limited results',
            description: `No tracks found for "${keyword}"`,
            status: 'info',
            duration: 2000,
            isClosable: true,
          });
        }
      }

      // Check if we found any tracks at all
      if (!foundTracks) {
        toast({
          title: 'No tracks found',
          description: 'Try different keywords or use genres instead',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Search completed',
          description: `Found tracks for your selected keywords`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
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
      console.log('Keyword search completed');
    }
  }, [session?.user?.accessToken, toast, setActiveSearchType, clearSpotifyTracks, addSpotifyTracks, handleSignIn, isSearching]);
  
  // Auto-search when arriving at the page with AI suggestions but no tracks
  useEffect(() => {
    // If we have genres but no tracks yet, trigger a search automatically
    if (selectedGame && 
        selectedGenres.length > 0 && 
        spotifyTracks.length === 0 && 
        session?.user?.accessToken && 
        !isSearching) {
      // Default to searching by genres
      console.log('Auto-searching by genres on page load');
      handleSearchByGenres(selectedGenres);
    }
  }, [selectedGame, selectedGenres, spotifyTracks.length, session?.user?.accessToken, handleSearchByGenres, isSearching]);

  const handleContinue = useCallback(async () => {
    if (!session?.user?.accessToken) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in with Spotify to create a playlist',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      handleSignIn();
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
      const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const playlistName = `${selectedGame.name} by BoardGame Beats - ${currentDate}`;
      
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
  }, [selectedGame, selectedGenres, spotifyTracks, aiExplanation, session?.user?.accessToken, toast, handleSignIn]);

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
          {status === 'unauthenticated' && (
            <Alert 
              status="warning" 
              variant="solid" 
              borderRadius="md"
              flexDirection={{ base: 'column', sm: 'row' }}
              alignItems="center"
              justifyContent="space-between"
              py={4}
            >
              <Flex alignItems="center">
                <AlertIcon />
                <Box>
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    Sign in with Spotify to search for music and create playlists
                  </AlertDescription>
                </Box>
              </Flex>
              <Button 
                colorScheme="green" 
                onClick={handleSignIn} 
                mt={{ base: 3, sm: 0 }}
                leftIcon={<Icon as={FaSpotify} />}
              >
                Connect with Spotify
              </Button>
            </Alert>
          )}

          <Box textAlign="center" mb={4}>
            <Heading as="h1" size="2xl" mb={4} color={textColor}>
              Customize Atmosphere
            </Heading>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
              Tailor the musical atmosphere for {selectedGame.name}
            </Text>
          </Box>

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
                  onClick={() => {
                    // Prevent duplicate calls by checking if already searching
                    if (isSearching) {
                      return;
                    }
                    handleSearchByGenres(selectedGenres);
                  }}
                  isDisabled={selectedGenres.length === 0 || isSearching}
                  width="full"
                  isLoading={isSearching && activeSearchType === 'genres'}
                  loadingText="Searching..."
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
                  onClick={() => {
                    // Prevent duplicate calls by checking if already searching
                    if (isSearching) {
                      return;
                    }
                    
                    console.log('Keyword search button clicked, selected keywords:', selectedKeywords);
                    if (selectedKeywords.length > 0) {
                      console.log('Calling handleSearchByKeywords with:', selectedKeywords);
                      // Create a copy of the array to avoid reference issues
                      const keywordsToSearch = [...selectedKeywords];
                      handleSearchByKeywords(keywordsToSearch);
                    } else {
                      toast({
                        title: 'No keywords selected',
                        description: 'Please select at least one keyword to search',
                        status: 'warning',
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  }}
                  isDisabled={selectedKeywords.length === 0 || isSearching}
                  width="full"
                  isLoading={isSearching && activeSearchType === 'keywords'}
                  loadingText="Searching..."
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
                Music suggestions have been generated based on {selectedGame.name}. 
                Click "Search by Genres" or "Search by Keywords" to find matching tracks.
              </Text>
            )}
          </Box>

          <Divider my={4} />

          <Flex justify="center" mt={4} direction="column" align="center" gap={4}>
            {status === 'authenticated' ? (
              <>
                <Button 
                  colorScheme="blue" 
                  size="lg" 
                  onClick={handleContinue}
                  px={8}
                  isLoading={isCreatingPlaylist}
                  loadingText="Creating Playlist"
                  isDisabled={spotifyTracks.length === 0}
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
              </>
            ) : (
              <Button 
                colorScheme="green" 
                size="lg" 
                onClick={handleSignIn}
                px={8}
                leftIcon={<Icon as={FaSpotify} />}
              >
                Connect with Spotify to Continue
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