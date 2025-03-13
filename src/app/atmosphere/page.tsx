'use client';

import React, { useEffect, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAtmosphere } from '@/app/context/atmosphere-context';
import GenreSelector from '@/app/components/atmosphere/GenreSelector';
import AudioFeatures from '@/app/components/atmosphere/AudioFeatures';
import TrackCount from '@/app/components/atmosphere/TrackCount';
import AiSuggestionButton from '@/app/components/atmosphere/AiSuggestionButton';

export default function AtmospherePage() {
  const router = useRouter();
  const {
    selectedGame,
    audioFeatures,
    updateAudioFeature,
    resetAudioFeature,
    selectedGenres,
    updateSelectedGenres,
    trackCount,
    updateTrackCount,
    aiSuggestedGenres,
    aiModifiedFeatures,
    setAiSuggestions,
    userModifiedFeatures,
    aiExplanation,
  } = useAtmosphere();

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
  const handleAiSuggestions = useCallback((genres: string[], features: Record<string, number>, explanation?: string) => {
    setAiSuggestions(genres, features, explanation);
  }, [setAiSuggestions]);

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

          <AudioFeatures 
            features={audioFeatures}
            onChange={updateAudioFeature}
            onReset={resetAudioFeature}
            aiModified={aiModifiedFeatures}
          />

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