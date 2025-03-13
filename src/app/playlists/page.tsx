'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Stack,
  Divider,
  CardFooter,
  Button,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { FaSpotify, FaPlay } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from '../components/layout/MainLayout';

export default function PlaylistsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to home if not authenticated
  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  // Loading state
  if (status === 'loading') {
    return (
      <MainLayout>
        <Container maxW="container.xl" py={8}>
          <Flex justify="center" align="center" minH="50vh" direction="column">
            <Spinner size="xl" color="brand.500" mb={4} />
            <Text>Loading your playlists...</Text>
          </Flex>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">
            Your Board Game Playlists
          </Heading>
          <Text fontSize="lg">
            View and manage your custom Spotify playlists created for board games.
          </Text>

          {/* Placeholder for when no playlists exist */}
          <Box py={10} textAlign="center">
            <Text fontSize="lg" mb={6}>
              You haven't created any board game playlists yet.
            </Text>
            <Button
              colorScheme="brand"
              size="lg"
              leftIcon={<FaSpotify />}
              onClick={() => router.push('/search')}
            >
              Create Your First Playlist
            </Button>
          </Box>

          {/* This will be populated with actual playlists later */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} display="none">
            {/* Example playlist card */}
            <Card maxW="sm">
              <CardBody>
                <Image
                  src="https://via.placeholder.com/300x300?text=Playlist+Cover"
                  alt="Playlist cover"
                  borderRadius="lg"
                />
                <Stack mt="6" spacing="3">
                  <Heading size="md">Catan Vibes</Heading>
                  <Text>A relaxing soundtrack for your Settlers of Catan sessions.</Text>
                  <Text color="brand.600" fontSize="sm">
                    15 tracks • 45 minutes
                  </Text>
                </Stack>
              </CardBody>
              <Divider />
              <CardFooter>
                <Button variant="solid" colorScheme="brand" leftIcon={<FaPlay />} flex="1">
                  Play on Spotify
                </Button>
              </CardFooter>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
    </MainLayout>
  );
} 