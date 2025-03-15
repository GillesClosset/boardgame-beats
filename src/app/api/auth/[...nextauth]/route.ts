import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { JWT } from 'next-auth/jwt';

const SPOTIFY_REFRESH_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-top-read',
  'user-read-recently-played',
].join(' ');

/**
 * Refresh an expired access token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    console.log('Refreshing access token...');
    
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(SPOTIFY_REFRESH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error('Error refreshing token:', refreshedTokens);
      throw refreshedTokens;
    }

    console.log('Token refreshed successfully');

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      // Fall back to old refresh token if a new one wasn't provided
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const handler = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: SPOTIFY_SCOPES,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        console.log('Initial sign in, setting token');
        return {
          id: user.id,
          accessToken: account.access_token as string,
          refreshToken: account.refresh_token as string,
          username: account.providerAccountId,
          accessTokenExpires: (account.expires_at as number) * 1000, // Convert to milliseconds
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      console.log('Token expired, refreshing...');
      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
          username: token.username as string,
        };
        session.error = token.error;
        
        // Add token expiry to session for debugging
        session.expires = new Date(token.accessTokenExpires as number).toISOString();
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see what's happening
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.log(code, metadata);
    },
  },
});

export { handler as GET, handler as POST }; 