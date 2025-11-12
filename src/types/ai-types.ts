// --- NOVOS TIPOS DE USUÁRIO ---
export interface User {
  id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

// --- Tipos existentes ---

// Tipos de saída para Segmentação
export interface Segment {
// ... (código existente, sem alterações)
  name: string;
  size: number;
  avg_purchase_value: number;
  purchase_frequency: number;
  description: string;
}

export interface MarketSegmentationInsightsOutput {
// ... (código existente, sem alterações)
  textualInsights: string;
  segments: Segment[];
}

// Tipos de entrada para Estratégias
export interface MarketingStrategiesInput {
// ... (código existente, sem alterações)
  customerSegmentAttributes: string;
  campaignObjectives: string;
}

// Tipos de entrada para Segmentação
export interface DataTreatmentInput {
// ... (código existente, sem alterações)
    normalize: boolean;
    excludeNulls: boolean;
    groupCategories: boolean;
}
export interface AnalysisMetadata {
// ... (código existente, sem alterações)
  id: number;
  timestamp: string;
  number_of_clusters: number;
  original_data_snippet: string;
}