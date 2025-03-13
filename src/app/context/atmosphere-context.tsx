'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AtmosphereSettings } from '../types';

interface AtmosphereContextType {
  atmosphereSettings: AtmosphereSettings;
  updateAtmosphereSettings: (settings: Partial<AtmosphereSettings>) => void;
  resetAtmosphereSettings: () => void;
}

const defaultAtmosphereSettings: AtmosphereSettings = {
  tempo: 50,
  energy: 50,
  complexity: 50,
  mood: 'neutral',
  genres: [],
  era: 'modern',
};

const AtmosphereContext = createContext<AtmosphereContextType | undefined>(undefined);

export function AtmosphereProvider({ children }: { children: ReactNode }) {
  const [atmosphereSettings, setAtmosphereSettings] = useState<AtmosphereSettings>(defaultAtmosphereSettings);

  const updateAtmosphereSettings = (settings: Partial<AtmosphereSettings>) => {
    setAtmosphereSettings((prevSettings) => ({
      ...prevSettings,
      ...settings,
    }));
  };

  const resetAtmosphereSettings = () => {
    setAtmosphereSettings(defaultAtmosphereSettings);
  };

  return (
    <AtmosphereContext.Provider
      value={{
        atmosphereSettings,
        updateAtmosphereSettings,
        resetAtmosphereSettings,
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