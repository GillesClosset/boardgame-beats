'use client';

import { useSession, signIn } from 'next-auth/react';
import { Box, Heading, Code, Button, VStack, Text, Divider, Badge } from '@chakra-ui/react';
import { useState } from 'react';

export default function AuthDebug() {
  const { data: session, status, update } = useSession();
  const [showDetails, setShowDetails] = useState(false);

  // Function to refresh the session
  const refreshSession = async () => {
    await update();
  };

  return (
    <Box p={4} bg="gray.50" borderRadius="md" my={4}>
      <Heading size="md" mb={2}>Authentication Debug</Heading>
      <Text>Status: <Code>{status}</Code></Text>
      
      {status === 'authenticated' && (
        <>
          <Text>User: {session?.user?.name || 'Unknown'}</Text>
          <Text>Email: {session?.user?.email || 'Unknown'}</Text>
          <Text>
            Has Access Token: {session?.user?.accessToken ? 
              <Badge colorScheme="green">Yes</Badge> : 
              <Badge colorScheme="red">No</Badge>
            }
          </Text>
          <Text>
            Token Expires: {session?.expires ? new Date(session.expires).toLocaleString() : 'Unknown'}
          </Text>
          
          <Button 
            size="sm" 
            mt={2} 
            onClick={() => setShowDetails(!showDetails)}
            colorScheme="blue"
            mr={2}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          
          <Button
            size="sm"
            mt={2}
            onClick={refreshSession}
            colorScheme="green"
          >
            Refresh Session
          </Button>
          
          {showDetails && (
            <Box mt={2} p={2} bg="gray.100" borderRadius="md" overflowX="auto">
              <Text fontWeight="bold" mb={2}>Session Structure:</Text>
              <Code display="block" whiteSpace="pre" p={2} fontSize="xs">
                {JSON.stringify(session, null, 2)}
              </Code>
            </Box>
          )}
        </>
      )}
      
      {status === 'unauthenticated' && (
        <>
          <Text color="red.500" mb={2}>Not authenticated</Text>
          <Button
            colorScheme="green"
            size="sm"
            onClick={() => signIn('spotify')}
          >
            Sign in with Spotify
          </Button>
        </>
      )}
      
      {status === 'loading' && (
        <Text color="blue.500">Loading authentication state...</Text>
      )}
    </Box>
  );
} 