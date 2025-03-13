import axios from 'axios';
import { AIPrompt, AIResponse, BoardGame, AtmosphereSettings } from '../types';

const AI_ENDPOINT_URL = process.env.OVHCLOUD_AI_ENDPOINT_URL || '';
const API_KEY = process.env.OVHCLOUD_API_KEY || '';

/**
 * Generate music recommendations based on board game and atmosphere settings
 */
export const generateMusicRecommendations = async (
  boardGame: BoardGame,
  atmosphereSettings: AtmosphereSettings,
  additionalContext?: string
): Promise<AIResponse> => {
  try {
    // Prepare the prompt for the AI
    const prompt = createAIPrompt(boardGame, atmosphereSettings, additionalContext);
    
    // Call the AI endpoint
    const response = await axios.post(
      AI_ENDPOINT_URL,
      {
        prompt,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );
    
    // Parse the AI response
    return parseAIResponse(response.data.choices[0].text);
  } catch (error) {
    console.error('Error generating music recommendations:', error);
    
    // Return fallback response in case of error
    return {
      suggestedTracks: [],
      suggestedGenres: getDefaultGenres(boardGame, atmosphereSettings),
      suggestedArtists: [],
      explanation: 'Unable to generate AI recommendations. Using default suggestions based on game type.',
    };
  }
};

/**
 * Create a prompt for the AI based on board game and atmosphere settings
 */
function createAIPrompt(
  boardGame: BoardGame,
  atmosphereSettings: AtmosphereSettings,
  additionalContext?: string
): string {
  return `
Generate music recommendations for a board game playlist with the following details:

BOARD GAME:
- Name: ${boardGame.name}
- Description: ${boardGame.description.substring(0, 300)}...
- Categories: ${boardGame.categories.join(', ')}
- Mechanics: ${boardGame.mechanics.join(', ')}
- Player Count: ${boardGame.minPlayers}-${boardGame.maxPlayers}
- Playing Time: ${boardGame.playingTime} minutes

DESIRED ATMOSPHERE:
- Tempo: ${atmosphereSettings.tempo}/100 (higher = faster)
- Energy: ${atmosphereSettings.energy}/100 (higher = more energetic)
- Complexity: ${atmosphereSettings.complexity}/100 (higher = more complex)
- Mood: ${atmosphereSettings.mood}
- Preferred Genres: ${atmosphereSettings.genres.join(', ') || 'Any'}
- Era: ${atmosphereSettings.era}

${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ''}

Please provide:
1. 5-10 specific track suggestions (artist - track name)
2. 3-5 music genres that would fit this game's atmosphere
3. 3-5 artists whose music would complement this game
4. A brief explanation of why these recommendations fit the game's atmosphere

Format your response as JSON with the following structure:
{
  "tracks": ["artist1 - track1", "artist2 - track2", ...],
  "genres": ["genre1", "genre2", ...],
  "artists": ["artist1", "artist2", ...],
  "explanation": "Your explanation here"
}
`;
}

/**
 * Parse the AI response into a structured format
 */
function parseAIResponse(responseText: string): AIResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0]);
      
      return {
        suggestedTracks: jsonData.tracks || [],
        suggestedGenres: jsonData.genres || [],
        suggestedArtists: jsonData.artists || [],
        explanation: jsonData.explanation || 'No explanation provided.',
      };
    }
    
    // Fallback if JSON parsing fails
    return {
      suggestedTracks: [],
      suggestedGenres: extractGenres(responseText),
      suggestedArtists: [],
      explanation: 'Unable to parse AI response in expected format.',
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    return {
      suggestedTracks: [],
      suggestedGenres: [],
      suggestedArtists: [],
      explanation: 'Error parsing AI response.',
    };
  }
}

/**
 * Extract genres from text if JSON parsing fails
 */
function extractGenres(text: string): string[] {
  const genreMatches = text.match(/genres?:?\s*([^.]*)/i);
  
  if (genreMatches && genreMatches[1]) {
    return genreMatches[1]
      .split(/,|\n/)
      .map(genre => genre.trim())
      .filter(Boolean);
  }
  
  return [];
}

/**
 * Get default genres based on board game type and atmosphere
 * Used as fallback when AI recommendation fails
 */
function getDefaultGenres(boardGame: BoardGame, atmosphereSettings: AtmosphereSettings): string[] {
  const categories = boardGame.categories.map(c => c.toLowerCase());
  const mechanics = boardGame.mechanics.map(m => m.toLowerCase());
  
  // Default genres based on game categories
  if (categories.some(c => c.includes('fantasy') || c.includes('adventure'))) {
    return ['epic', 'soundtrack', 'folk', 'celtic'];
  }
  
  if (categories.some(c => c.includes('sci-fi') || c.includes('space'))) {
    return ['electronic', 'ambient', 'synthwave', 'space'];
  }
  
  if (categories.some(c => c.includes('horror') || c.includes('zombie'))) {
    return ['dark ambient', 'industrial', 'experimental'];
  }
  
  if (categories.some(c => c.includes('mystery') || c.includes('detective'))) {
    return ['jazz', 'noir', 'soundtrack'];
  }
  
  // Default genres based on game mechanics
  if (mechanics.some(m => m.includes('real-time') || m.includes('speed'))) {
    return ['electronic', 'drum and bass', 'techno'];
  }
  
  if (mechanics.some(m => m.includes('strategy') || m.includes('worker placement'))) {
    return ['classical', 'instrumental', 'post-rock'];
  }
  
  // Default genres based on atmosphere settings
  if (atmosphereSettings.tempo > 70) {
    return ['rock', 'electronic', 'pop'];
  } else if (atmosphereSettings.tempo < 30) {
    return ['ambient', 'classical', 'chillout'];
  }
  
  if (atmosphereSettings.mood === 'happy') {
    return ['pop', 'indie pop', 'funk'];
  } else if (atmosphereSettings.mood === 'tense') {
    return ['electronic', 'industrial', 'soundtrack'];
  } else if (atmosphereSettings.mood === 'mysterious') {
    return ['ambient', 'downtempo', 'trip-hop'];
  }
  
  // Generic fallback
  return ['instrumental', 'soundtrack', 'ambient', 'electronic'];
} 