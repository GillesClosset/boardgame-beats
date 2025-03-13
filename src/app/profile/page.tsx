'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Avatar,
  Flex,
  Button,
  Divider,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaSpotify } from 'react-icons/fa';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from '../components/layout/MainLayout';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');

  // Loading state
  if (status === 'loading') {
    return (
      <MainLayout>
        <Container maxW="container.xl" py={8}>
          <Flex justify="center" align="center" minH="50vh" direction="column">
            <Spinner size="xl" color="brand.500" mb={4} />
            <Text>Loading your profile...</Text>
          </Flex>
        </Container>
      </MainLayout>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <MainLayout>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="center" justify="center" minH="50vh">
            <Heading as="h1" size="xl">
              Sign In Required
            </Heading>
            <Text fontSize="lg" textAlign="center">
              Please sign in with your Spotify account to view your profile.
            </Text>
            <Button
              size="lg"
              colorScheme="brand"
              leftIcon={<FaSpotify />}
              onClick={() => signIn('spotify', { callbackUrl: '/profile' })}
            >
              Sign in with Spotify
            </Button>
          </VStack>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">
            Your Profile
          </Heading>

          <Box bg={bgColor} p={6} borderRadius="lg" shadow="md">
            <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
              <Avatar
                size="2xl"
                name={session?.user?.name || 'User'}
                src={session?.user?.image || undefined}
              />
              <VStack align="flex-start" spacing={3}>
                <Heading as="h2" size="lg">
                  {session?.user?.name || 'Spotify User'}
                </Heading>
                <Text>{session?.user?.email || 'No email available'}</Text>
                <Text color="brand.500" fontWeight="bold">
                  Spotify Account Connected
                </Text>
              </VStack>
            </Flex>

            <Divider my={6} />

            <VStack align="stretch" spacing={4}>
              <Heading as="h3" size="md">
                Account Information
              </Heading>
              <Text>
                You've successfully connected your Spotify account to BoardGame Beats.
              </Text>
              <Text>
                You can now create custom playlists for your board game sessions.
              </Text>

              <Flex gap={4} mt={4}>
                <Button
                  colorScheme="brand"
                  onClick={() => router.push('/search')}
                >
                  Find Board Games
                </Button>
                <Button
                  variant="outline"
                  colorScheme="boardgame"
                  onClick={() => router.push('/playlists')}
                >
                  View Your Playlists
                </Button>
              </Flex>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </MainLayout>
  );
} 