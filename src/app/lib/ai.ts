import axios from 'axios';
import { AIPrompt, AIResponse, BoardGame, AtmosphereSettings } from '../types';

const AI_ENDPOINT_URL = process.env.OVHCLOUD_AI_ENDPOINT_URL || '';
const API_KEY = process.env.OVHCLOUD_API_KEY || '';

/**
 * Generate music recommendations based on board game
 */
export const generateMusicRecommendations = async (
  boardGame: BoardGame,
  atmosphereSettings: AtmosphereSettings
) => {
  try {
    // Call our internal API route instead of the AI service directly
    const response = await axios.post('/api/ai', {
      boardGame,
      atmosphereSettings
    });
    
    // Return the response data directly
    return response.data;
  } catch (error) {
    console.error('Error generating music recommendations:', error);
    
    // Return fallback response in case of error
    return {
      genres: ['instrumental', 'soundtrack', 'ambient', 'electronic', 'classical'],
      explanation: "Failed to generate recommendations. These genres provide a balanced soundtrack suitable for most board games."
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

Please provide:
1. The best 5 Spotify music genres that would match this board game's theme and gameplay
2. Recommended Spotify audio feature values (0.0 to 1.0 scale for most, except tempo):
   - acousticness: how acoustic the music should be
   - danceability: how suitable for dancing
   - energy: perceptual measure of intensity and activity
   - instrumentalness: predicts whether a track contains no vocals
   - liveness: detects presence of audience in the recording
   - speechiness: presence of spoken words
   - tempo: estimated tempo in BPM (typically 50-150)
   - valence: musical positiveness conveyed by the track

Format your response as JSON with the following structure:
{
  "genres": ["genre1", "genre2", "genre3", "genre4", "genre5"],
  "audioFeatures": {
    "acousticness": 0.5,
    "danceability": 0.5,
    "energy": 0.5,
    "instrumentalness": 0.5,
    "liveness": 0.5,
    "speechiness": 0.5,
    "tempo": 120,
    "valence": 0.5
  }
}
`;
}

/**
 * Parse the AI response into a structured format
 */
function parseAIResponse(responseText: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
    
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0]);
      
      return {
        genres: jsonData.genres || [],
        explanation: extractExplanation(responseText, jsonMatch[0]) || "Generated based on the board game's theme and mechanics."
      };
    }
    
    // Fallback if JSON parsing fails
    return {
      genres: extractGenres(responseText),
      explanation: extractExplanation(responseText, "") || "Generated based on the board game's theme and mechanics."
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    return {
      genres: [],
      explanation: "Error parsing AI response."
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
      .filter(Boolean)
      .slice(0, 5); // Limit to 5 genres
  }
  
  return ['instrumental', 'soundtrack', 'ambient', 'electronic', 'classical'];
}

/**
 * Extract explanation from text after the JSON
 */
function extractExplanation(text: string, jsonString: string): string | null {
  try {
    // If we have a jsonString, extract everything after it for the explanation
    if (jsonString) {
      const explanationText = text.substring(text.indexOf(jsonString) + jsonString.length).trim();
      return explanationText || null;
    }
    
    // Try to extract explanation looking for common patterns
    const explanationMatches = text.match(/explanation:?\s*([^.]*(?:\.[^.]*){1,3})/i) ||
                              text.match(/chosen\s*([^.]*(?:\.[^.]*){1,3})/i) ||
                              text.match(/selected\s*([^.]*(?:\.[^.]*){1,3})/i);
    
    if (explanationMatches && explanationMatches[1]) {
      return explanationMatches[1].trim();
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting explanation:', error);
    return null;
  }
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