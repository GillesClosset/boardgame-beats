/**
 * ARCHIVED FILE - DO NOT DELETE
 * 
 * This file contains the original atmosphere context provider designed for the Spotify Recommender API.
 * It is kept for reference and potential future use.
 * 
 * The context provides state management for atmosphere settings including:
 * - Audio features (acousticness, danceability, energy, etc.)
 * - Genre selection
 * - Track count
 * - AI suggestions and explanations
 */

'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AtmosphereSettings, BoardGame, SearchResult } from '../types';

interface AudioFeatures {
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  tempo: number;
  valence: number;
}

interface AtmosphereContextType {
  // Game data
  selectedGame: BoardGame | null;
  searchResult: SearchResult | null;
  setSelectedGame: (game: BoardGame | null) => void;
  setSearchResult: (result: SearchResult | null) => void;
  
  // Audio features
  audioFeatures: AudioFeatures;
  updateAudioFeature: (name: string, value: number) => void;
  resetAudioFeature: (name: string) => void;
  resetAllAudioFeatures: () => void;
  
  // Genres
  selectedGenres: string[];
  updateSelectedGenres: (genres: string[]) => void;
  
  // Track count
  trackCount: number;
  updateTrackCount: (count: number) => void;
  
  // AI suggestions tracking
  aiSuggestedGenres: string[];
  aiModifiedFeatures: string[];
  setAiSuggestions: (genres: string[], features: Partial<AudioFeatures>, explanation?: string) => void;
  
  // AI explanation
  aiExplanation: string | null;
  
  // User modifications tracking
  userModifiedFeatures: string[];
  
  // Mood
  mood: string;
  updateMood: (mood: string) => void;
  
  // Reset all
  resetAtmosphere: () => void;
}

const defaultAudioFeatures: AudioFeatures = {
  acousticness: 0.5,
  danceability: 0.5,
  energy: 0.5,
  instrumentalness: 0.5,
  liveness: 0.5,
  loudness: -30,
  speechiness: 0.5,
  tempo: 120,
  valence: 0.5,
};

const AtmosphereContext = createContext<AtmosphereContextType | undefined>(undefined);

export function AtmosphereProvider({ children }: { children: ReactNode }) {
  // Game data
  const [selectedGame, setSelectedGame] = useState<BoardGame | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  
  // Audio features
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures>(defaultAudioFeatures);
  
  // Genres
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  // Track count
  const [trackCount, setTrackCount] = useState<number>(10);
  
  // AI suggestions tracking
  const [aiSuggestedGenres, setAiSuggestedGenres] = useState<string[]>([]);
  const [aiModifiedFeatures, setAiModifiedFeatures] = useState<string[]>([]);
  
  // AI explanation
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  
  // User modifications tracking
  const [userModifiedFeatures, setUserModifiedFeatures] = useState<string[]>([]);
  
  // Mood
  const [mood, setMood] = useState<string>('neutral');

  // Update a single audio feature
  const updateAudioFeature = useCallback((name: string, value: number) => {
    setAudioFeatures(prev => ({ ...prev, [name]: value }));
    
    // Track that this feature was modified by the user
    if (!userModifiedFeatures.includes(name)) {
      setUserModifiedFeatures(prev => [...prev, name]);
    }
  }, [userModifiedFeatures]);

  // Reset a single audio feature to default
  const resetAudioFeature = useCallback((name: string) => {
    setAudioFeatures(prev => ({ 
      ...prev, 
      [name]: defaultAudioFeatures[name as keyof AudioFeatures] 
    }));
    
    // Remove from user modified list
    setUserModifiedFeatures(prev => prev.filter(feature => feature !== name));
    
    // Remove from AI modified list
    setAiModifiedFeatures(prev => prev.filter(feature => feature !== name));
  }, []);

  // Reset all audio features
  const resetAllAudioFeatures = useCallback(() => {
    setAudioFeatures(defaultAudioFeatures);
    setUserModifiedFeatures([]);
    setAiModifiedFeatures([]);
  }, []);

  // Update selected genres
  const updateSelectedGenres = useCallback((genres: string[]) => {
    setSelectedGenres(genres);
  }, []);

  // Update track count
  const updateTrackCount = useCallback((count: number) => {
    setTrackCount(count);
  }, []);

  // Set AI suggestions
  const setAiSuggestions = useCallback((genres: string[], features: Partial<AudioFeatures>, explanation?: string) => {
    // Update AI suggested genres
    setAiSuggestedGenres(genres);
    
    // Update AI explanation if provided
    if (explanation) {
      setAiExplanation(explanation);
    }
    
    // If no genres are selected yet, use the AI suggestions
    if (selectedGenres.length === 0) {
      setSelectedGenres(genres.slice(0, 5)); // Limit to 5 genres
    }
    
    // Update audio features that haven't been modified by the user
    // Use functional updates to avoid stale closures
    setAudioFeatures(prevFeatures => {
      const newFeatures = { ...prevFeatures };
      const modifiedFeaturesList: string[] = [];
      
      Object.entries(features).forEach(([name, value]) => {
        if (value !== undefined && !userModifiedFeatures.includes(name)) {
          newFeatures[name as keyof AudioFeatures] = value as number;
          modifiedFeaturesList.push(name);
        }
      });
      
      // Update the list of AI modified features
      setAiModifiedFeatures(modifiedFeaturesList);
      
      return newFeatures;
    });
  }, [selectedGenres, userModifiedFeatures]);

  // Update mood
  const updateMood = useCallback((newMood: string) => {
    setMood(newMood);
  }, []);

  // Reset everything
  const resetAtmosphere = useCallback(() => {
    setAudioFeatures(defaultAudioFeatures);
    setSelectedGenres([]);
    setTrackCount(10);
    setAiSuggestedGenres([]);
    setAiModifiedFeatures([]);
    setAiExplanation(null);
    setUserModifiedFeatures([]);
    setMood('neutral');
  }, []);

  return (
    <AtmosphereContext.Provider
      value={{
        selectedGame,
        searchResult,
        setSelectedGame,
        setSearchResult,
        audioFeatures,
        updateAudioFeature,
        resetAudioFeature,
        resetAllAudioFeatures,
        selectedGenres,
        updateSelectedGenres,
        trackCount,
        updateTrackCount,
        aiSuggestedGenres,
        aiModifiedFeatures,
        setAiSuggestions,
        aiExplanation,
        userModifiedFeatures,
        mood,
        updateMood,
        resetAtmosphere,
      }}
    >
      {children}
    </AtmosphereContext.Provider>
  );
}

export function useAtmosphere() {
  const context = useContext(AtmosphereContext);
  if (context === undefined) {
    throw new Error('useAtmosphere must be used within an AtmosphereProvider');
  }
  return context;
}