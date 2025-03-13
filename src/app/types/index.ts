// Spotify related types
export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  product: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  duration_ms: number;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string; height: number; width: number }[];
  tracks: {
    total: number;
    items: {
      track: SpotifyTrack;
    }[];
  };
  external_urls: {
    spotify: string;
  };
  uri: string;
}

// BoardGame related types
export interface BoardGame {
  id: string;
  name: string;
  description: string;
  image: string;
  year: number;
  minPlayers: number;
  maxPlayers: number;
  playingTime: number;
  categories: string[];
  mechanics: string[];
  designer: string;
  publisher: string;
  rating: number;
}

// Atmosphere related types
export interface AtmosphereSettings {
  tempo: number; // 0-100 (slow to fast)
  energy: number; // 0-100 (calm to energetic)
  complexity: number; // 0-100 (simple to complex)
  mood: string; // 'happy', 'tense', 'mysterious', 'epic', etc.
  genres: string[]; // Array of music genres
  era: string; // 'classical', '80s', 'modern', etc.
}

// AI related types
export interface AIPrompt {
  boardGame: BoardGame;
  atmosphere: AtmosphereSettings;
  additionalContext?: string;
}

export interface AIResponse {
  suggestedTracks: string[]; // Track IDs
  suggestedGenres: string[];
  suggestedArtists: string[];
  explanation: string;
}

// Session and auth types
export interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
}

// Extended next-auth session type
declare module "next-auth" {
  interface Session {
    user: SessionUser;
    error?: string;
  }
  
  interface User {
    id: string;
    accessToken: string;
    refreshToken: string;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    username: string;
    accessTokenExpires: number;
    error?: string;
  }
} 