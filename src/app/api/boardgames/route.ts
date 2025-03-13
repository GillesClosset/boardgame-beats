import { NextRequest, NextResponse } from 'next/server';
import { searchBoardGames, getBoardGameDetails, getHotBoardGames } from '@/app/lib/boardgames';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const id = searchParams.get('id');
  const hot = searchParams.get('hot');

  try {
    // Search for board games
    if (query) {
      const results = await searchBoardGames(query);
      return NextResponse.json({ results });
    }
    
    // Get board game details
    if (id) {
      const game = await getBoardGameDetails(id);
      return NextResponse.json({ game });
    }
    
    // Get hot board games
    if (hot === 'true') {
      const hotGames = await getHotBoardGames();
      return NextResponse.json({ hotGames });
    }
    
    // No valid parameters provided
    return NextResponse.json(
      { error: 'Missing required parameters. Use "query", "id", or "hot=true".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('BoardGameGeek API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board game data' },
      { status: 500 }
    );
  }
} 