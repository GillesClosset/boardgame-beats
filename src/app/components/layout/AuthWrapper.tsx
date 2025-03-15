'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  Flex,
  Spinner,
  useToast,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Image,
  HStack
} from '@chakra-ui/react';
import { FaSpotify } from 'react-icons/fa';
import { usePathname, useRouter } from 'next/navigation';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { data: session, status, update } = useSession();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  
  // Paths that don't require authentication
  const publicPaths = ['/', '/about', '/privacy', '/terms'];
  const isPublicPath = publicPaths.includes(pathname);
  
  // Background colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Check if the user has a valid Spotify token
  const hasValidToken = session?.user?.accessToken && status === 'authenticated';
  
  // Handle authentication errors
  useEffect(() => {
    // Check for token refresh errors
    if (session?.error === 'RefreshAccessTokenError') {
      toast({
        title: 'Session Expired',
        description: 'Your Spotify session has expired. Please sign in again.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      // Sign out to clear the invalid session
      signOut({ redirect: false });
    }
  }, [session, toast]);
  
  // Handle authentication
  useEffect(() => {
    // Skip auth check on public paths
    if (isPublicPath) return;
    
    // If we're not on a public path and the user isn't authenticated, show a toast
    if (status === 'unauthenticated') {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in with Spotify to use this feature',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [status, isPublicPath, toast]);
  
  // Handle session refresh
  const handleSessionRefresh = async () => {
    try {
      await update();
      toast({
        title: 'Session Refreshed',
        description: 'Your Spotify session has been refreshed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast({
        title: 'Session Refresh Failed',
        description: 'Failed to refresh your session. Please sign in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle Spotify sign in
  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      await signIn('spotify', { callbackUrl: pathname });
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication Failed',
        description: 'There was an error signing in with Spotify',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // If we're on a public path, just render the children
  if (isPublicPath) {
    return <>{children}</>;
  }
  
  // If we're still loading the session, show a loading spinner
  if (status === 'loading') {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
        <Spinner size="xl" thickness="4px" color="green.500" speed="0.65s" />
        <Text ml={4} fontSize="lg">Loading your Spotify session...</Text>
      </Flex>
    );
  }
  
  // If the user isn't authenticated, show the sign-in page
  if (!hasValidToken) {
    return (
      <Box bg={bgColor} minH="100vh" py={10}>
        <Container maxW="container.md">
          <Box 
            bg={cardBg} 
            p={8} 
            borderRadius="lg" 
            boxShadow="xl"
            textAlign="center"
          >
            <VStack spacing={8}>
              <Image 
                src="/images/logo.png" 
                alt="BoardGame Beats Logo" 
                height="80px"
                fallback={<Icon as={FaSpotify} boxSize="60px" color="green.500" />}
              />
              
              <Heading as="h1" size="xl">
                Sign in to BoardGame Beats
              </Heading>
              
              <Text fontSize="lg">
                Connect your Spotify account to create custom playlists for your board games
              </Text>
              
              {session?.error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>
                    {session.error === 'RefreshAccessTokenError' 
                      ? 'Your session has expired. Please sign in again.' 
                      : 'There was an error with your Spotify authentication.'}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                leftIcon={<FaSpotify />}
                colorScheme="green"
                size="lg"
                onClick={handleSignIn}
                isLoading={isAuthenticating}
                loadingText="Connecting to Spotify"
                px={8}
                py={6}
                fontSize="lg"
                width="full"
                maxW="md"
              >
                Sign in with Spotify
              </Button>
              
              <HStack>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/')}
                  size="sm"
                >
                  Return to Home
                </Button>
                
                {session?.error === 'RefreshAccessTokenError' && (
                  <Button 
                    variant="outline" 
                    colorScheme="blue" 
                    onClick={handleSessionRefresh}
                    size="sm"
                  >
                    Try Refreshing Session
                  </Button>
                )}
              </HStack>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }
  
  // If the user is authenticated, render the children
  return <>{children}</>;
} 