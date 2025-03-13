import { NextRequest, NextResponse } from 'next/server';
import { generateMusicRecommendations } from '@/app/lib/ai';
import { BoardGame, AtmosphereSettings } from '@/app/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardGame, atmosphereSettings, additionalContext } = body;
    
    if (!boardGame || !atmosphereSettings) {
      return NextResponse.json(
        { error: 'Board game and atmosphere settings are required' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!boardGame.id || !boardGame.name) {
      return NextResponse.json(
        { error: 'Invalid board game data' },
        { status: 400 }
      );
    }
    
    // Generate music recommendations
    const recommendations = await generateMusicRecommendations(
      boardGame as BoardGame,
      atmosphereSettings as AtmosphereSettings,
      additionalContext
    );
    
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate music recommendations' },
      { status: 500 }
    );
  }
} 