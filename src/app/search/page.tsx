'use client';

import React, { useState, useCallback } from 'react';
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
} from '@chakra-ui/react';
import SearchBar from '@/app/components/search/SearchBar';
import SearchResults from '@/app/components/search/SearchResults';
import GameDetails from '@/app/components/search/GameDetails';
import { SearchResult, BoardGame } from '@/app/types';
import { useAtmosphere } from '@/app/context/atmosphere-context';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const { setSelectedGame, setSearchResult } = useAtmosphere();
  const router = useRouter();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const handleSearch = useCallback((results: SearchResult[]) => {
    setSearchResults(results);
    setIsLoading(false);
    setSelectedGameId(null);
  }, []);

  const handleSelectGame = useCallback((game: SearchResult) => {
    setSelectedGameId(game.id);
    setSearchResult(game);
  }, [setSearchResult]);

  const handleGameLoaded = useCallback((game: BoardGame) => {
    setSelectedGame(game);
  }, [setSelectedGame]);

  const handleContinue = useCallback(() => {
    router.push('/atmosphere');
  }, [router]);

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={8}>
            <Heading as="h1" size="2xl" mb={4} color={textColor}>
              Find Your Board Game
            </Heading>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
              Search for a board game to create a matching playlist
            </Text>
          </Box>

          <SearchBar 
            onSelectGame={handleSelectGame}
          />

          {searchResults.length > 0 && !selectedGameId && (
            <>
              <Divider my={6} />
              <Heading as="h2" size="lg" mb={4}>
                Search Results
              </Heading>
              <SearchResults 
                results={searchResults}
                isLoading={isLoading}
                onSelectGame={handleSelectGame}
              />
            </>
          )}

          {selectedGameId && (
            <>
              <Divider my={6} />
              <Heading as="h2" size="lg" mb={4}>
                Game Details
              </Heading>
              <GameDetails 
                gameId={selectedGameId}
                onGameLoaded={handleGameLoaded}
              />
              <Flex justify="center" mt={8}>
                <Button 
                  colorScheme="blue" 
                  size="lg" 
                  onClick={handleContinue}
                  px={8}
                >
                  Continue to Atmosphere Settings
                </Button>
              </Flex>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
} 