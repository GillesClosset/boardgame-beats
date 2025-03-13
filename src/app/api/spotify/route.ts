import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { GET as authOptions } from '../auth/[...nextauth]/route';
import * as spotifyApi from '@/app/lib/spotify';
import { AtmosphereSettings } from '@/app/types';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.accessToken) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  try {
    // Set the access token for all Spotify API calls
    spotifyApi.setAccessToken(session.user.accessToken);
    
    // Get user profile
    if (action === 'profile') {
      const profile = await spotifyApi.getCurrentUser();
      return NextResponse.json({ profile });
    }
    
    // Search for tracks
    if (action === 'search') {
      const query = searchParams.get('query');
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 20;
      
      if (!query) {
        return NextResponse.json(
          { error: 'Query parameter is required for search' },
          { status: 400 }
        );
      }
      
      const tracks = await spotifyApi.searchTracks(query, limit);
      return NextResponse.json({ tracks });
    }
    
    // Get available genres
    if (action === 'genres') {
      const genres = await spotifyApi.getAvailableGenres();
      return NextResponse.json({ genres });
    }
    
    // Get user's playlists
    if (action === 'playlists') {
      const playlists = await spotifyApi.getUserPlaylists(session.user.id);
      return NextResponse.json({ playlists });
    }
    
    // Get a specific playlist
    if (action === 'playlist') {
      const playlistId = searchParams.get('id');
      
      if (!playlistId) {
        return NextResponse.json(
          { error: 'Playlist ID is required' },
          { status: 400 }
        );
      }
      
      const playlist = await spotifyApi.getPlaylist(playlistId);
      return NextResponse.json({ playlist });
    }
    
    // No valid action provided
    return NextResponse.json(
      { error: 'Invalid action. Use "profile", "search", "genres", "playlists", or "playlist".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Spotify' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.accessToken) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Set the access token for all Spotify API calls
    spotifyApi.setAccessToken(session.user.accessToken);
    
    const body = await request.json();
    const { action } = body;
    
    // Create a new playlist
    if (action === 'create-playlist') {
      const { name, description, isPublic = true } = body;
      
      if (!name) {
        return NextResponse.json(
          { error: 'Playlist name is required' },
          { status: 400 }
        );
      }
      
      const playlist = await spotifyApi.createPlaylist(
        session.user.id,
        name,
        description || '',
        isPublic
      );
      
      return NextResponse.json({ playlist });
    }
    
    // Add tracks to a playlist
    if (action === 'add-tracks') {
      const { playlistId, trackUris } = body;
      
      if (!playlistId || !trackUris || !Array.isArray(trackUris)) {
        return NextResponse.json(
          { error: 'Playlist ID and track URIs array are required' },
          { status: 400 }
        );
      }
      
      const result = await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
      return NextResponse.json({ result });
    }
    
    // Get recommendations based on atmosphere settings
    if (action === 'recommendations') {
      const { seedTracks, seedArtists, seedGenres, atmosphereSettings } = body;
      
      if (!atmosphereSettings) {
        return NextResponse.json(
          { error: 'Atmosphere settings are required' },
          { status: 400 }
        );
      }
      
      // Convert atmosphere settings to Spotify API parameters
      const recommendationParams = spotifyApi.atmosphereToRecommendationParams(
        atmosphereSettings as AtmosphereSettings
      );
      
      // Get recommendations
      const tracks = await spotifyApi.getRecommendations(
        seedTracks || [],
        seedArtists || [],
        seedGenres || [],
        {
          limit: 30,
          ...recommendationParams,
        }
      );
      
      return NextResponse.json({ tracks });
    }
    
    // No valid action provided
    return NextResponse.json(
      { error: 'Invalid action. Use "create-playlist", "add-tracks", or "recommendations".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action with Spotify' },
      { status: 500 }
    );
  }
} 