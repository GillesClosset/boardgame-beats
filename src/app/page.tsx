'use client';

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  Image,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FaSpotify, FaSearch, FaMusic, FaGamepad } from 'react-icons/fa';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from './components/layout/MainLayout';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const bgGradient = useColorModeValue(
    'linear(to-b, brand.50, gray.50)',
    'linear(to-b, gray.900, boardgame.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleSpotifySignIn = async () => {
    // Use explicit redirect: false to get the URL first
    const result = await signIn('spotify', { 
      callbackUrl: '/search',
      redirect: false
    });
    
    // If we have a URL, redirect manually to ensure proper handling
    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <MainLayout>
      <Box
        as="section"
        pt={{ base: 8, md: 12 }}
        pb={{ base: 12, md: 24 }}
        bgGradient={bgGradient}
        borderRadius="lg"
        mb={10}
      >
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align="center"
            justify="space-between"
            gap={8}
          >
            <VStack
              align={{ base: 'center', lg: 'flex-start' }}
              spacing={6}
              maxW={{ base: 'full', lg: '50%' }}
              textAlign={{ base: 'center', lg: 'left' }}
            >
              <Heading
                as="h1"
                size="3xl"
                fontWeight="bold"
                lineHeight="shorter"
                color="brand.600"
              >
                Perfect Soundtracks for Your Board Game Sessions
              </Heading>
              <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')}>
                BoardGame Beats uses AI to generate personalized Spotify playlists that match the atmosphere of your favorite board games.
              </Text>
              <HStack spacing={4}>
                <Button
                  size="lg"
                  colorScheme="brand"
                  onClick={() => {
                    if (session) {
                      router.push('/search');
                    } else {
                      handleSpotifySignIn();
                    }
                  }}
                  leftIcon={session ? <FaSearch /> : <FaSpotify />}
                >
                  {session ? 'Find a Board Game' : 'Sign in with Spotify'}
                </Button>
                {session && (
                  <Button
                    size="lg"
                    variant="outline"
                    colorScheme="boardgame"
                    onClick={() => router.push('/playlists')}
                    leftIcon={<FaMusic />}
                  >
                    My Playlists
                  </Button>
                )}
              </HStack>
            </VStack>
            <Box
              maxW={{ base: '80%', lg: '45%' }}
              rounded="lg"
              shadow="xl"
              overflow="hidden"
            >
              <Image
                src="/images/hero-image.jpg"
                alt="Board games with music"
                fallbackSrc="https://via.placeholder.com/600x400?text=BoardGame+Beats"
                objectFit="cover"
                w="full"
              />
            </Box>
          </Flex>
        </Container>
      </Box>

      <Box as="section" py={12}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading as="h2" size="xl" textAlign="center">
              How It Works
            </Heading>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={8}
              justify="center"
              w="full"
            >
              {[
                {
                  title: 'Find Your Game',
                  description: 'Search for your favorite board game from thousands of options.',
                  icon: FaSearch,
                },
                {
                  title: 'Set the Atmosphere',
                  description: 'Adjust tempo, energy, mood, and more to match your desired gaming experience.',
                  icon: FaGamepad,
                },
                {
                  title: 'Generate Playlist',
                  description: 'Our AI creates a custom Spotify playlist that perfectly complements your game.',
                  icon: FaMusic,
                },
              ].map((feature, index) => (
                <Box
                  key={index}
                  bg={cardBg}
                  p={6}
                  rounded="lg"
                  shadow="md"
                  flex="1"
                  textAlign="center"
                >
                  <Icon as={feature.icon} w={10} h={10} color="brand.500" mb={4} />
                  <Heading as="h3" size="md" mb={2}>
                    {feature.title}
                  </Heading>
                  <Text color={useColorModeValue('gray.600', 'gray.400')}>
                    {feature.description}
                  </Text>
                </Box>
              ))}
            </Stack>
          </VStack>
        </Container>
      </Box>
    </MainLayout>
  );
}
