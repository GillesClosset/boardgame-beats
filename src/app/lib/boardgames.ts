import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { BoardGame } from '../types';

const BGG_API_BASE_URL = 'https://boardgamegeek.com/xmlapi2';
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

/**
 * Search for board games by name
 */
export const searchBoardGames = async (query: string): Promise<{ id: string; name: string; yearPublished: string }[]> => {
  try {
    const response = await axios.get(`${BGG_API_BASE_URL}/search`, {
      params: {
        query,
        type: 'boardgame',
      },
    });

    const parsedData = parser.parse(response.data);
    
    if (!parsedData.items || !parsedData.items.item) {
      return [];
    }

    // Handle single result vs multiple results
    const items = Array.isArray(parsedData.items.item)
      ? parsedData.items.item
      : [parsedData.items.item];

    return items.map((item: any) => ({
      id: item.id,
      name: item.name?.value || item.name,
      yearPublished: item.yearpublished?.value || 'N/A',
    }));
  } catch (error) {
    console.error('Error searching board games:', error);
    throw error;
  }
};

/**
 * Get detailed information about a board game by ID
 */
export const getBoardGameDetails = async (gameId: string): Promise<BoardGame> => {
  try {
    const response = await axios.get(`${BGG_API_BASE_URL}/thing`, {
      params: {
        id: gameId,
        stats: 1,
      },
    });

    const parsedData = parser.parse(response.data);
    
    if (!parsedData.items || !parsedData.items.item) {
      throw new Error('Board game not found');
    }

    const gameData = parsedData.items.item;
    
    // Extract name (handle multiple names by finding primary name)
    let name = '';
    if (Array.isArray(gameData.name)) {
      const primaryName = gameData.name.find((n: any) => n.type === 'primary');
      name = primaryName ? primaryName.value : gameData.name[0].value;
    } else {
      name = gameData.name?.value || 'Unknown';
    }

    // Extract description
    const description = gameData.description || '';

    // Extract image
    const image = gameData.image || '';

    // Extract year published
    const year = gameData.yearpublished?.value || 0;

    // Extract player counts
    const minPlayers = gameData.minplayers?.value || 0;
    const maxPlayers = gameData.maxplayers?.value || 0;

    // Extract playing time
    const playingTime = gameData.playingtime?.value || 0;

    // Extract categories and mechanics
    const categories: string[] = [];
    const mechanics: string[] = [];
    
    if (gameData.link) {
      const links = Array.isArray(gameData.link) ? gameData.link : [gameData.link];
      
      links.forEach((link: any) => {
        if (link.type === 'boardgamecategory') {
          categories.push(link.value);
        } else if (link.type === 'boardgamemechanic') {
          mechanics.push(link.value);
        }
      });
    }

    // Extract designer and publisher
    let designer = 'Unknown';
    let publisher = 'Unknown';
    
    if (gameData.link) {
      const links = Array.isArray(gameData.link) ? gameData.link : [gameData.link];
      
      const designerLink = links.find((link: any) => link.type === 'boardgamedesigner');
      const publisherLink = links.find((link: any) => link.type === 'boardgamepublisher');
      
      designer = designerLink ? designerLink.value : 'Unknown';
      publisher = publisherLink ? publisherLink.value : 'Unknown';
    }

    // Extract rating
    const rating = gameData.statistics?.ratings?.average?.value || 0;

    return {
      id: gameId,
      name,
      description,
      image,
      year: Number(year),
      minPlayers: Number(minPlayers),
      maxPlayers: Number(maxPlayers),
      playingTime: Number(playingTime),
      categories,
      mechanics,
      designer,
      publisher,
      rating: Number(rating),
    };
  } catch (error) {
    console.error(`Error getting board game details for ID ${gameId}:`, error);
    throw error;
  }
};

/**
 * Get hot board games (trending)
 */
export const getHotBoardGames = async (): Promise<{ id: string; name: string; thumbnail: string }[]> => {
  try {
    const response = await axios.get(`${BGG_API_BASE_URL}/hot`, {
      params: {
        type: 'boardgame',
      },
    });

    const parsedData = parser.parse(response.data);
    
    if (!parsedData.items || !parsedData.items.item) {
      return [];
    }

    const items = Array.isArray(parsedData.items.item)
      ? parsedData.items.item
      : [parsedData.items.item];

    return items.map((item: any) => ({
      id: item.id,
      name: item.name?.value || item.name,
      thumbnail: item.thumbnail || '',
    }));
  } catch (error) {
    console.error('Error getting hot board games:', error);
    throw error;
  }
};

/**
 * Get board game categories from a sample of popular games
 */
export const getBoardGameCategories = async (): Promise<string[]> => {
  try {
    // Get some popular games first
    const hotGames = await getHotBoardGames();
    const sampleGameIds = hotGames.slice(0, 5).map(game => game.id);
    
    // Get details for these games to extract categories
    const gameDetailsPromises = sampleGameIds.map(id => getBoardGameDetails(id));
    const gamesDetails = await Promise.all(gameDetailsPromises);
    
    // Collect all unique categories
    const allCategories = new Set<string>();
    gamesDetails.forEach(game => {
      game.categories.forEach(category => {
        allCategories.add(category);
      });
    });
    
    return Array.from(allCategories);
  } catch (error) {
    console.error('Error getting board game categories:', error);
    return []; // Return empty array instead of throwing
  }
};

/**
 * Get board game mechanics from a sample of popular games
 */
export const getBoardGameMechanics = async (): Promise<string[]> => {
  try {
    // Get some popular games first
    const hotGames = await getHotBoardGames();
    const sampleGameIds = hotGames.slice(0, 5).map(game => game.id);
    
    // Get details for these games to extract mechanics
    const gameDetailsPromises = sampleGameIds.map(id => getBoardGameDetails(id));
    const gamesDetails = await Promise.all(gameDetailsPromises);
    
    // Collect all unique mechanics
    const allMechanics = new Set<string>();
    gamesDetails.forEach(game => {
      game.mechanics.forEach(mechanic => {
        allMechanics.add(mechanic);
      });
    });
    
    return Array.from(allMechanics);
  } catch (error) {
    console.error('Error getting board game mechanics:', error);
    return []; // Return empty array instead of throwing
  }
}; 