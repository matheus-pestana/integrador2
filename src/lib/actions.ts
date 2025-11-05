'use server';

import { z } from 'zod';
// Importar dos novos tipos
import type { 
    MarketSegmentationInsightsOutput, 
    MarketingStrategiesInput,
    DataTreatmentInput,
    AnalysisMetadata // Importar o novo tipo
} from '@/types/ai-types'; // Certifique-se que você criou este arquivo

// URLs separados para cada microsserviço
const SEGMENTATION_API_URL = process.env.NEXT_PUBLIC_SEGMENTATION_API_URL || 'http://localhost:8001/api';
const STRATEGY_API_URL = process.env.NEXT_PUBLIC_STRATEGY_API_URL || 'http://localhost:8002/api';

// --- Tipos de Estado (mantidos como antes) ---
const strategiesSchema = z.object({
    customerSegmentAttributes: z.string().min(10, { message: 'Por favor, forneça mais detalhes sobre o segmento de clientes.' }),
    campaignObjectives: z.string().min(10, { message: 'Por favor, forneça mais detalhes sobre os objetivos da campanha.' }),
});

export type StrategiesState = {
    message?: string;
    strategies?: string[];
    errors?: {
        customerSegmentAttributes?: string[];
        campaignObjectives?: string[];
    }
}

export type SegmentationState = {
    message: 'success' | 'error' | 'loading';
    analysis?: MarketSegmentationInsightsOutput;
    errorMessage?: string;
    analysisId?: number; // Opcional: para sabermos se é uma análise salva
}

// --- Função Atualizada para Estratégias ---
export async function getMarketingStrategies(prevState: StrategiesState, formData: FormData): Promise<StrategiesState> {
    const validatedFields = strategiesSchema.safeParse({
        customerSegmentAttributes: formData.get('customerSegmentAttributes'),
        campaignObjectives: formData.get('campaignObjectives'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Dados do formulário inválidos.',
        };
    }

    try {
        const inputData: MarketingStrategiesInput = validatedFields.data;

        // URL do serviço de estratégias
        const response = await fetch(`${STRATEGY_API_URL}/marketing-strategies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido na API Python.' }));
            console.error("Erro da API Python (Estratégias):", errorData);
            return { message: `Erro da API: ${errorData.detail || response.statusText}` };
        }

        const result = await response.json();

        if (!result || !Array.isArray(result.marketingStrategies)) {
             return { message: 'Resposta inválida da API Python.' };
        }

        return { message: 'success', strategies: result.marketingStrategies };

    } catch (error) {
        console.error("Erro ao chamar getMarketingStrategies:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { message: `Falha na comunicação com a API: ${errorMessage}` };
    }
}

// --- Tipos para Segmentation (usando os tipos importados) ---
interface MarketSegmentationInsightsInputApi {
    clusterData: string;
    dataTreatment: DataTreatmentInput;
    numberOfClusters: number;
}

// --- Função Atualizada para Segmentação ---
export async function getSegmentationInsights(
    clusterData: string,
    dataTreatment: DataTreatmentInput,
    numberOfClusters: number
): Promise<SegmentationState> {
    if (!clusterData) {
        return { message: 'error', errorMessage: 'Dados CSV não fornecidos.' };
    }

    try {
        const inputData: MarketSegmentationInsightsInputApi = { clusterData, dataTreatment, numberOfClusters };

        // URL do serviço de segmentação
        const response = await fetch(`${SEGMENTATION_API_URL}/segmentation-insights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData),
        });

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido na API Python.' }));
             console.error("Erro da API Python (Segmentação):", errorData);
             return { message: 'error', errorMessage: `Erro da API (${response.status}): ${errorData.detail || response.statusText}` };
        }

        const result: MarketSegmentationInsightsOutput = await response.json();

         if (!result || !result.textualInsights || !Array.isArray(result.segments)) {
            return { message: 'error', errorMessage: 'Resposta inválida da API Python.' };
       }

        return { message: 'success', analysis: result };

    } catch (error) { // <--- CORREÇÃO: Chave { adicionada aqui
        console.error("Erro ao chamar getSegmentationInsights:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { message: 'error', errorMessage: `Falha na comunicação com a API: ${errorMessage}` };
    } // <--- CORREÇÃO: Chave } adicionada aqui
}

// --- NOVAS ACTIONS PARA HISTÓRICO ---

export type HistoryListState = {
  message: 'success' | 'error';
  analyses?: AnalysisMetadata[];
  errorMessage?: string;
}

/**
 * Busca os metadados de todas as análises salvas.
 */
export async function getSavedAnalyses(): Promise<HistoryListState> {
    try {
        const response = await fetch(`${SEGMENTATION_API_URL}/segmentation-analyses`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store', // Sempre buscar dados novos do histórico
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Erro ao buscar histórico.' }));
            return { message: 'error', errorMessage: `Erro da API: ${errorData.detail || response.statusText}` };
        }

        const analyses: AnalysisMetadata[] = await response.json();
        return { message: 'success', analyses };

    } catch (error) {
        console.error("Erro ao chamar getSavedAnalyses:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { message: 'error', errorMessage: `Falha na comunicação com a API: ${errorMessage}` };
    }
}

/**
 * Busca uma análise salva completa pelo seu ID.
 */
export async function getSavedAnalysisById(id: number): Promise<SegmentationState> {
     if (!id) {
        return { message: 'error', errorMessage: 'ID da análise não fornecido.' };
    }
    
    try {
        const response = await fetch(`${SEGMENTATION_API_URL}/segmentation-analyses/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido na API.' }));
             if (response.status === 404) {
                 return { message: 'error', errorMessage: 'Análise não encontrada.' };
             }
             return { message: 'error', errorMessage: `Erro da API (${response.status}): ${errorData.detail || response.statusText}` };
        }

        const result: MarketSegmentationInsightsOutput = await response.json();
        // Retorna o mesmo formato do SegmentationState
        return { message: 'success', analysis: result, analysisId: id };

    } catch (error) {
        console.error("Erro ao chamar getSavedAnalysisById:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { message: 'error', errorMessage: `Falha na comunicação com a API: ${errorMessage}` };
    }
}