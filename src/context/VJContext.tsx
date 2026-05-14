import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface VJConfig {
  text: string;
  weight: number;
  width: number; // For transform scale
  slant: number;
  spacing: number;
  fontSize: number;
  blur: number;
  glow: number;
  speed: number;
  color: string;
  background: string;
  chaos: number;
  slice: number;
  aberration: number;
  wave: number;
  mode: 'default' | 'liquid' | 'glitch' | 'tech' | 'particle' | 'industrial' | 'cosmic' | 'noise';
  animationMode: 'none' | 'wave' | 'spiral' | 'distort';
  strobe: boolean;
  trail: boolean;
  noise: boolean;
  lang: 'en' | 'zh';
}

const defaultConfig: VJConfig = {
  text: 'TYPE\nVJ',
  weight: 600,
  width: 1,
  slant: 0,
  spacing: -0.05,
  fontSize: 15, // vw
  blur: 0,
  glow: 0.5,
  speed: 1,
  color: '#FFFFFF',
  background: '#050505',
  chaos: 0.2,
  slice: 0.3,
  aberration: 0.2,
  wave: 0.5,
  mode: 'default',
  animationMode: 'none',
  strobe: false,
  trail: false,
  noise: true,
  lang: 'en',
};

interface VJContextType {
  config: VJConfig;
  setConfig: (config: Partial<VJConfig> | ((prev: VJConfig) => VJConfig)) => void;
}

const VJContext = createContext<VJContextType | undefined>(undefined);

export const VJProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfigState] = useState<VJConfig>(defaultConfig);

  const setConfig = (update: Partial<VJConfig> | ((prev: VJConfig) => VJConfig)) => {
    if (typeof update === 'function') {
      setConfigState(update);
    } else {
      setConfigState(prev => ({ ...prev, ...update }));
    }
  };

  return (
    <VJContext.Provider value={{ config, setConfig }}>
      {children}
    </VJContext.Provider>
  );
};

export const useVJ = () => {
  const context = useContext(VJContext);
  if (!context) throw new Error('useVJ must be used within VJProvider');
  return context;
};
