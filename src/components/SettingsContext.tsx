import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, Language } from '../lib/translations';

type TempUnit = 'celsius' | 'fahrenheit';
type DistanceUnit = 'metric' | 'imperial';

interface Settings {
  notifications: {
    push: boolean;
    email: boolean;
    updates: boolean;
  };
  units: {
    temp: TempUnit;
    distance: DistanceUnit;
  };
  language: Language;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  t: (key: string) => string;
}

const defaultSettings: Settings = {
  notifications: {
    push: true,
    email: false,
    updates: true,
  },
  units: {
    temp: 'celsius',
    distance: 'metric',
  },
  language: 'english',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  const t = (key: string) => {
    const lang = settings.language || 'english';
    return translations[lang]?.[key] || translations['english'][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
