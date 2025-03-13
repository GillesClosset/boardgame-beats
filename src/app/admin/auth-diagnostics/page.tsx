'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import MainLayout from '../../components/layout/MainLayout';

export default function AuthDiagnosticsPage() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSignIn = async () => {
    try {
      setStatus('Attempting to sign in...');
      const result = await signIn('spotify', { 
        callbackUrl: '/profile',
        redirect: false 
      });
      
      if (result?.error) {
        setError(result.error);
        setStatus('Authentication failed');
      } else if (result?.url) {
        setStatus('Redirecting to Spotify...');
        window.location.href = result.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('Error occurred');
    }
  };

  return (
    <MainLayout>
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl">Spotify Authentication Diagnostics</Heading>
          
          <Text>
            This admin page helps diagnose Spotify authentication issues. Click the button below to test the authentication flow.
          </Text>
          
          <Box>
            <Button 
              colorScheme="green" 
              size="lg" 
              onClick={handleSignIn}
            >
              Test Spotify Sign In
            </Button>
          </Box>
          
          {status && (
            <Box p={4} borderWidth="1px" borderRadius="md">
              <Heading as="h3" size="md" mb={2}>Status</Heading>
              <Text>{status}</Text>
            </Box>
          )}
          
          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                <Code p={2} width="100%">{error}</Code>
              </AlertDescription>
            </Alert>
          )}
          
          <Box p={4} bg="gray.50" borderRadius="md">
            <Heading as="h3" size="md" mb={2}>Troubleshooting Tips</Heading>
            <VStack align="start" spacing={2}>
              <Text>1. Verify your Client ID and Client Secret in .env.local</Text>
              <Text>2. Check that your Redirect URI is set to http://localhost:3000/api/auth/callback/spotify in the Spotify Dashboard</Text>
              <Text>3. Ensure your Spotify app has the correct scopes enabled</Text>
              <Text>4. Try clearing your browser cookies and cache</Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </MainLayout>
  );
} 