'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Image,
  Flex,
  IconButton,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface GameImageGalleryProps {
  gameId: string;
  mainImage: string;
}

// This would typically come from an API call to get additional images
// For now, we'll simulate this with a mock function
const fetchGameImages = async (gameId: string, mainImage: string): Promise<string[]> => {
  // In a real implementation, you would fetch additional images from the API
  // For now, we'll just return the main image to demonstrate the carousel functionality
  return [mainImage];
};

const GameImageGallery: React.FC<GameImageGalleryProps> = ({ gameId, mainImage }) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const buttonBg = useColorModeValue('white', 'gray.700');

  // Placeholder image for games without images
  const placeholderImage = 'https://via.placeholder.com/400x400?text=No+Image';

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      try {
        if (mainImage) {
          const allImages = await fetchGameImages(gameId, mainImage);
          setImages(allImages);
        } else {
          setImages([placeholderImage]);
        }
      } catch (error) {
        console.error('Error loading game images:', error);
        setImages([mainImage || placeholderImage]);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [gameId, mainImage]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (isLoading) {
    return (
      <Box 
        height="400px" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg={bgColor}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      bg={bgColor}
      borderRadius="md"
      overflow="hidden"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Image
        src={images[currentImageIndex] || placeholderImage}
        alt={`Game image ${currentImageIndex + 1}`}
        width="100%"
        height="400px"
        objectFit="contain"
        fallbackSrc={placeholderImage}
        loading="lazy"
      />

      {images.length > 1 && (
        <>
          <IconButton
            aria-label="Previous image"
            icon={<ChevronLeftIcon boxSize={6} />}
            position="absolute"
            left={2}
            top="50%"
            transform="translateY(-50%)"
            borderRadius="full"
            bg={buttonBg}
            opacity={0.8}
            _hover={{ opacity: 1 }}
            onClick={handlePrevImage}
            size="md"
          />
          
          <IconButton
            aria-label="Next image"
            icon={<ChevronRightIcon boxSize={6} />}
            position="absolute"
            right={2}
            top="50%"
            transform="translateY(-50%)"
            borderRadius="full"
            bg={buttonBg}
            opacity={0.8}
            _hover={{ opacity: 1 }}
            onClick={handleNextImage}
            size="md"
          />
          
          <Flex 
            position="absolute" 
            bottom={2} 
            left="50%" 
            transform="translateX(-50%)"
            gap={2}
          >
            {images.map((_, index) => (
              <Box
                key={index}
                w={2}
                h={2}
                borderRadius="full"
                bg={index === currentImageIndex ? "blue.500" : "gray.300"}
                cursor="pointer"
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default GameImageGallery; 