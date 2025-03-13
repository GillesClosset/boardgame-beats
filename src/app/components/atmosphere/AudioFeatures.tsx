'use client';

import React, { useState } from 'react';
import {
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  Text,
  Grid,
  GridItem,
  Flex,
  IconButton,
  Heading,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { RepeatIcon, InfoIcon } from '@chakra-ui/icons';

interface AudioFeature {
  name: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description: string;
  color: string;
}

interface AudioFeaturesProps {
  features: {
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    liveness: number;
    loudness: number;
    speechiness: number;
    tempo: number;
    valence: number;
  };
  onChange: (name: string, value: number) => void;
  onReset: (name: string) => void;
  aiModified?: string[];
}

const AudioFeatures: React.FC<AudioFeaturesProps> = ({
  features,
  onChange,
  onReset,
  aiModified = [],
}) => {
  const [showTooltip, setShowTooltip] = useState<{ [key: string]: boolean }>({});
  const [showDescription, setShowDescription] = useState<{ [key: string]: boolean }>({});

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Define audio features with their ranges and descriptions
  const audioFeatures: AudioFeature[] = [
    {
      name: 'acousticness',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.',
      color: 'green',
    },
    {
      name: 'danceability',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity.',
      color: 'pink',
    },
    {
      name: 'energy',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'Energy represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy.',
      color: 'red',
    },
    {
      name: 'instrumentalness',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'Predicts whether a track contains no vocals. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content.',
      color: 'blue',
    },
    {
      name: 'liveness',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live.',
      color: 'purple',
    },
    {
      name: 'speechiness',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book), the closer to 1.0 the value.',
      color: 'yellow',
    },
    {
      name: 'tempo',
      min: 0,
      max: 250,
      step: 1,
      defaultValue: 120,
      description: 'The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece.',
      color: 'cyan',
    },
    {
      name: 'valence',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (happy, cheerful, euphoric).',
      color: 'teal',
    },
  ];

  const handleShowTooltip = (name: string, value: boolean) => {
    setShowTooltip(prev => ({ ...prev, [name]: value }));
  };

  const toggleDescription = (name: string) => {
    setShowDescription(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const formatValue = (feature: AudioFeature, value: number) => {
    if (feature.name === 'tempo') {
      return `${Math.round(value)} BPM`;
    }
    if (feature.name === 'loudness') {
      return `${Math.round(value)} dB`;
    }
    return value.toFixed(2);
  };

  return (
    <Box p={4} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      <Heading size="md" mb={4}>Audio Features</Heading>
      
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        {audioFeatures.map(feature => (
          <GridItem key={feature.name}>
            <Box mb={6}>
              <Flex justify="space-between" align="center" mb={2}>
                <Flex align="center">
                  <Text fontWeight="medium" textTransform="capitalize">
                    {feature.name}
                  </Text>
                  {aiModified.includes(feature.name) && (
                    <Badge ml={2} colorScheme="purple">AI</Badge>
                  )}
                  <IconButton
                    aria-label={`Info about ${feature.name}`}
                    icon={<InfoIcon />}
                    size="xs"
                    variant="ghost"
                    ml={1}
                    onClick={() => toggleDescription(feature.name)}
                  />
                </Flex>
                <Flex align="center">
                  <Text fontWeight="medium" mr={2}>
                    {formatValue(feature, features[feature.name as keyof typeof features])}
                  </Text>
                  <IconButton
                    aria-label={`Reset ${feature.name}`}
                    icon={<RepeatIcon />}
                    size="xs"
                    onClick={() => onReset(feature.name)}
                  />
                </Flex>
              </Flex>
              
              {showDescription[feature.name] && (
                <Text fontSize="sm" color="gray.500" mb={2}>
                  {feature.description}
                </Text>
              )}
              
              <Slider
                aria-label={feature.name}
                min={feature.min}
                max={feature.max}
                step={feature.step}
                value={features[feature.name as keyof typeof features]}
                onChange={(val) => onChange(feature.name, val)}
                onMouseEnter={() => handleShowTooltip(feature.name, true)}
                onMouseLeave={() => handleShowTooltip(feature.name, false)}
                colorScheme={feature.color}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <Tooltip
                  hasArrow
                  bg={`${feature.color}.500`}
                  color="white"
                  placement="top"
                  isOpen={showTooltip[feature.name]}
                  label={formatValue(feature, features[feature.name as keyof typeof features])}
                >
                  <SliderThumb boxSize={6} />
                </Tooltip>
                
                {/* Add marks for min, middle, and max values */}
                <SliderMark value={feature.min} mt={2} ml={-2.5} fontSize="xs">
                  {feature.min}
                </SliderMark>
                <SliderMark 
                  value={(feature.max + feature.min) / 2} 
                  mt={2} 
                  ml={-2.5} 
                  fontSize="xs"
                >
                  {((feature.max + feature.min) / 2).toFixed(1)}
                </SliderMark>
                <SliderMark value={feature.max} mt={2} ml={-2.5} fontSize="xs">
                  {feature.max}
                </SliderMark>
              </Slider>
            </Box>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default AudioFeatures; 