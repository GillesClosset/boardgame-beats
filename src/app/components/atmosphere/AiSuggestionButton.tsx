'use client';

import React, { useState } from 'react';
import {
  Button,
  Tooltip,
  useToast,
  Flex,
  Text,
  Spinner,
  Badge,
  useColorModeValue,
  Alert,
  AlertIcon,
  Box,
} from '@chakra-ui/react';
import { FaMagic } from 'react-icons/fa';
import { generateMusicRecommendations } from '@/app/lib/ai';
import { BoardGame } from '@/app/types';

interface AiSuggestionButtonProps {
  game: BoardGame | null;
  onSuggestionsGenerated: (genres: string[], audioFeatures: Record<string, number>, explanation?: string) => void;
  isDisabled?: boolean;
}

const AiSuggestionButton: React.FC<AiSuggestionButtonProps> = ({
  game,
  onSuggestionsGenerated,
  isDisabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  
  const buttonBg = useColorModeValue('purple.500', 'purple.300');
  const buttonHoverBg = useColorModeValue('purple.600', 'purple.400');

  const handleGenerateSuggestions = async () => {
    if (!game) {
      toast({
        title: 'No game selected',
        description: 'Please select a board game first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a simple atmosphere settings object for the AI
      const atmosphereSettings = {
        tempo: 50,
        energy: 50,
        complexity: 50,
        mood: 'neutral',
        genres: [],
        era: 'modern',
      };

      // Call the AI service
      const aiResponse = await generateMusicRecommendations(game, atmosphereSettings);

      // Check if we got a valid response
      if (!aiResponse.genres || aiResponse.genres.length === 0) {
        setError('AI service returned an empty response. Using default suggestions.');
      }

      // Pass the suggestions to the parent component
      onSuggestionsGenerated(
        aiResponse.genres || [], 
        aiResponse.audioFeatures || {
          acousticness: 0.5,
          danceability: 0.5,
          energy: 0.5,
          instrumentalness: 0.5,
          liveness: 0.3,
          speechiness: 0.1,
          tempo: 120,
          valence: 0.5
        },
        aiResponse.explanation || "Generated based on the board game's theme and mechanics."
      );

      if (!error) {
        toast({
          title: 'AI Suggestions Generated',
          description: 'Music recommendations have been generated based on the game theme and mechanics.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error generating AI suggestions:', error);
      setError('Failed to generate AI suggestions. Using default recommendations instead.');
      toast({
        title: 'Error',
        description: 'Failed to generate AI suggestions. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex direction="column" align="center" my={4}>
      {error && (
        <Alert status="warning" borderRadius="md" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <Tooltip
        label={
          !game
            ? 'Select a board game first'
            : 'Generate AI-powered music recommendations based on this game'
        }
        placement="top"
        hasArrow
      >
        <Button
          leftIcon={isLoading ? <Spinner size="sm" /> : <FaMagic />}
          onClick={handleGenerateSuggestions}
          isLoading={isLoading}
          isDisabled={isDisabled || !game || isLoading}
          size="lg"
          bg={buttonBg}
          color="white"
          _hover={{ bg: buttonHoverBg }}
          _active={{ bg: buttonHoverBg }}
          px={8}
          py={6}
          borderRadius="full"
        >
          Get AI Suggestions
        </Button>
      </Tooltip>
      
      <Flex align="center" mt={2}>
        <Badge colorScheme="purple" mr={2}>AI</Badge>
        <Text fontSize="sm" color="gray.500">
          Analyzes game theme, mechanics, and playing time
        </Text>
      </Flex>
    </Flex>
  );
};

export default AiSuggestionButton; 