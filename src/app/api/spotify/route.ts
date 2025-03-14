import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import { GET as authOptions } from '../auth/[...nextauth]/route';
import * as spotifyApiLib from '@/app/lib/spotify';
import { AtmosphereSettings } from '@/app/types';
import { Session } from 'next-auth';
import SpotifyWebApi from 'spotify-web-api-node';

// Define the session type with user property
interface SpotifySession extends Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    accessToken?: string;
    refreshToken?: string;
    username?: string;
  };
  error?: string;
}

// Define the structure of the JWT token
interface SpotifyJWT {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  accessTokenExpires?: number;
  error?: string;
}

// Initialize Spotify API client
const spotifyClient = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Helper function to log detailed error information
const logError = (context: string, error: any) => {
  console.error(`[Spotify API Error] ${context}:`, {
    message: error.message || 'Unknown error',
    status: error.statusCode,
    body: error.body,
  });
};

// Helper function to validate token and set up Spotify API
const setupSpotifyApi = async (req: NextRequest) => {
  // Get the token from the request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  console.log('[Spotify API] Token received:', {
    hasToken: !!token,
    hasAccessToken: !!(token as SpotifyJWT)?.accessToken,
    accessTokenExpires: (token as SpotifyJWT)?.accessTokenExpires,
    currentTime: Date.now(),
  });
  
  if (!token) {
    throw new Error('Authentication required - No token found');
  }
  
  const { accessToken } = token as SpotifyJWT;
  
  if (!accessToken) {
    throw new Error('Authentication required - No access token');
  }
  
  // Set the access token
  spotifyClient.setAccessToken(accessToken);
  
  return token as SpotifyJWT;
};

// GET handler for Spotify API requests
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    console.log(`[Spotify API] Processing GET request with action: ${action}`);
    
    // Set up Spotify API with token
    const token = await setupSpotifyApi(req);
    
    // Handle different actions
    switch (action) {
      case 'profile': {
        try {
          const data = await spotifyClient.getMe();
          return NextResponse.json(data.body);
        } catch (error: any) {
          logError('Failed to get user profile', error);
          return NextResponse.json(
            { error: `Failed to get user profile: ${error.message}` },
            { status: error.statusCode || 500 }
          );
        }
      }
      
      case 'search': {
        const query = url.searchParams.get('query');
        const limit = url.searchParams.get('limit') || '20';
        
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter is required' },
            { status: 400 }
          );
        }
        
        try {
          const data = await spotifyClient.searchTracks(query, { limit: parseInt(limit) });
          return NextResponse.json({ tracks: data.body.tracks?.items || [] });
        } catch (error: any) {
          logError(`Failed to search tracks with query: ${query}`, error);
          return NextResponse.json(
            { error: `Failed to search tracks: ${error.message}` },
            { status: error.statusCode || 500 }
          );
        }
      }
      
      case 'genres': {
        try {
          const data = await spotifyClient.getAvailableGenreSeeds();
          return NextResponse.json({ genres: data.body.genres || [] });
        } catch (error: any) {
          logError('Failed to get available genres', error);
          return NextResponse.json(
            { error: `Failed to get available genres: ${error.message}` },
            { status: error.statusCode || 500 }
          );
        }
      }
      
      case 'playlists': {
        try {
          const data = await spotifyClient.getUserPlaylists();
          return NextResponse.json({ playlists: data.body.items || [] });
        } catch (error: any) {
          logError('Failed to get user playlists', error);
          return NextResponse.json(
            { error: `Failed to get user playlists: ${error.message}` },
            { status: error.statusCode || 500 }
          );
        }
      }
      
      case 'playlist': {
        const playlistId = url.searchParams.get('id');
        
        if (!playlistId) {
          return NextResponse.json(
            { error: 'Playlist ID is required' },
            { status: 400 }
          );
        }
        
        try {
          const data = await spotifyClient.getPlaylist(playlistId);
          return NextResponse.json(data.body);
        } catch (error: any) {
          logError(`Failed to get playlist with ID: ${playlistId}`, error);
          return NextResponse.json(
            { error: `Failed to get playlist: ${error.message}` },
            { status: error.statusCode || 500 }
          );
        }
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[Spotify API] Error in GET handler:', error);
    
    // Handle authentication errors specifically
    if (error.message?.includes('Authentication required')) {
      return NextResponse.json(
        { error: error.message, authError: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST handler for Spotify API requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    
    console.log(`[Spotify API] Processing POST request with action: ${action}`);
    
    // Set up Spotify API with token
    const token = await setupSpotifyApi(req);
    
    // Handle different actions
    switch (action) {
      case 'recommendations': {
        const { seedGenres, atmosphereSettings } = body;
        
        if (!seedGenres || !seedGenres.length) {
          return NextResponse.json(
            { error: 'Seed genres are required' },
            { status: 400 }
          );
        }
        
        try {
          // Map UI parameters to Spotify API parameters
          const options = {
            seed_genres: seedGenres,
            limit: body.limit || 20,
            target_energy: atmosphereSettings?.energy ? atmosphereSettings.energy / 100 : undefined,
            target_tempo: atmosphereSettings?.tempo ? 60 + (atmosphereSettings.tempo * 1.4) : undefined,
            target_valence: atmosphereSettings?.mood === 'happy' ? 0.8 : 
                           atmosphereSettings?.mood === 'sad' ? 0.2 : 0.5,
            target_instrumentalness: atmosphereSettings?.complexity ? atmosphereSettings.complexity / 100 : undefined,
          };
          
          console.log('[Spotify API] Recommendations options:', options);
          
          const data = await spotifyClient.getRecommendations(options);
          return NextResponse.json({ tracks: data.body.tracks || [] });
        } catch (error: any) {
          logError('Failed to get recommendations', error);
          return NextResponse.json(
            { error: `Failed to get recommendations: ${error.message}` },
            { status: error.statusCode || 500 }
          );
        }
      }
      
      case 'create-playlist': {
        const { name, description, tracks } = body;
        
        if (!name) {
          return NextResponse.json(
            { error: 'Playlist name is required' },
            { status: 400 }
          );
        }
        
        if (!tracks || !tracks.length) {
          return NextResponse.json(
            { error: 'Tracks are required' },
            { status: 400 }
          );
        }
        
        try {
          // Get user ID
          const user = await spotifyClient.getMe();
          const userId = user.body.id;
          
          // Create a simple playlist with just the name
          const playlistResponse = await spotifyClient.createPlaylist(userId, name);
          
          if (!playlistResponse || !playlistResponse.body) {
            throw new Error('Failed to create playlist - no response from Spotify API');
          }
          
          const playlist = playlistResponse.body;
          
          // Update the playlist with description if provided
          if (description) {
            await spotifyClient.changePlaylistDetails(playlist.id, {
              description: description,
              public: false
            });
          }
          
          // Add tracks to playlist
          if (tracks.length > 0) {
            const trackUris = tracks.map((track: any) => track.uri);
            await spotifyClient.addTracksToPlaylist(playlist.id, trackUris);
          }
          
          return NextResponse.json({ 
            success: true, 
            playlist: playlist
          });
        } catch (error: any) {
          logError('Failed to create playlist', error);
          return NextResponse.json(
            { error: `Failed to create playlist: ${error.message}` },
            { status: error.statusCode || 500 }
          );
        }
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[Spotify API] Error in POST handler:', error);
    
    // Handle authentication errors specifically
    if (error.message?.includes('Authentication required')) {
      return NextResponse.json(
        { error: error.message, authError: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}