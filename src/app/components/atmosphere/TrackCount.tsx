'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Tooltip,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

interface TrackCountProps {
  playingTime: number;
  value: number;
  onChange: (value: number) => void;
}

const TrackCount: React.FC<TrackCountProps> = ({
  playingTime,
  value,
  onChange,
}) => {
  const [isAutoCalculated, setIsAutoCalculated] = useState(true);
  const [calculatedCount, setCalculatedCount] = useState(10);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Calculate track count based on playing time
  useEffect(() => {
    if (!playingTime) return;
    
    // Formula: 1 track per 3-5 minutes of gameplay
    // Minimum 5 tracks, maximum 100 tracks
    const avgTrackDuration = 3.5; // minutes
    const calculatedTracks = Math.round(playingTime / avgTrackDuration);
    
    const boundedCount = Math.min(Math.max(calculatedTracks, 5), 100);
    setCalculatedCount(boundedCount);
    
    if (isAutoCalculated) {
      onChange(boundedCount);
    }
  }, [playingTime, isAutoCalculated, onChange]);

  const handleManualChange = (valueAsString: string, valueAsNumber: number) => {
    // Ensure value is between 1 and 100
    const boundedValue = Math.min(Math.max(valueAsNumber || 1, 1), 100);
    onChange(boundedValue);
  };

  const handleToggleAutoCalculate = () => {
    setIsAutoCalculated(!isAutoCalculated);
    
    // If switching to auto, update with calculated value
    if (!isAutoCalculated) {
      onChange(calculatedCount);
    }
  };

  return (
    <Box p={4} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      <Heading size="md" mb={4}>Track Count</Heading>
      
      <Flex direction="column" gap={4}>
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <FormLabel htmlFor="auto-calculate" mb="0" display="flex" alignItems="center">
            Auto-calculate based on game length
            <Tooltip 
              label="Automatically calculates the number of tracks based on the board game's playing time" 
              placement="top"
              hasArrow
            >
              <InfoIcon ml={2} color="gray.500" />
            </Tooltip>
          </FormLabel>
          <Switch 
            id="auto-calculate" 
            isChecked={isAutoCalculated}
            onChange={handleToggleAutoCalculate}
            colorScheme="blue"
          />
        </FormControl>
        
        <Box>
          {isAutoCalculated ? (
            <Flex direction="column">
              <Text mb={2}>
                Calculated tracks: <strong>{calculatedCount}</strong>
              </Text>
              <Text fontSize="sm" color="gray.500">
                Based on {playingTime} minutes of gameplay
              </Text>
            </Flex>
          ) : (
            <NumberInput
              min={1}
              max={100}
              value={value}
              onChange={handleManualChange}
              size="md"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          )}
        </Box>
        
        <Text fontSize="sm" color="gray.500">
          {isAutoCalculated 
            ? "Automatically adjusts as you change the game's playing time" 
            : "Manual mode: Choose between 1-100 tracks"}
        </Text>
      </Flex>
    </Box>
  );
};

export default TrackCount; 