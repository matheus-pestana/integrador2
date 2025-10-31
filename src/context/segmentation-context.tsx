'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { type MarketSegmentationInsightsOutput } from '@/types/ai-types';

type SegmentationContextType = {
  analysis: MarketSegmentationInsightsOutput | null;
  setAnalysis: (analysis: MarketSegmentationInsightsOutput | null) => void;
};

const SegmentationContext = createContext<SegmentationContextType | undefined>(undefined);

export function SegmentationProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<MarketSegmentationInsightsOutput | null>(null);

  return (
    <SegmentationContext.Provider value={{ analysis, setAnalysis }}>
      {children}
    </SegmentationContext.Provider>
  );
}

export function useSegmentation() {
  const context = useContext(SegmentationContext);
  if (context === undefined) {
    throw new Error('useSegmentation must be used within a SegmentationProvider');
  }
  return context;
}
