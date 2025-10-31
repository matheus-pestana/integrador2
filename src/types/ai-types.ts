// Tipos de saída para Segmentação
export interface Segment {
  name: string;
  size: number;
  avg_purchase_value: number;
  purchase_frequency: number;
  description: string;
}

export interface MarketSegmentationInsightsOutput {
  textualInsights: string;
  segments: Segment[];
}

// Tipos de entrada para Estratégias
export interface MarketingStrategiesInput {
  customerSegmentAttributes: string;
  campaignObjectives: string;
}

// Tipos de entrada para Segmentação
export interface DataTreatmentInput {
    normalize: boolean;
    excludeNulls: boolean;
    groupCategories: boolean;
}