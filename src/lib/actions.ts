'use server';

import { z } from 'zod';
// Mantenha as definições de tipo ou importe de um local compartilhado se necessário
import type { MarketSegmentationInsightsOutput } from '@/types/ai-outputs'; // Crie este arquivo se necessário
import type { MarketingStrategiesInput } from '@/types/ai-inputs'; // Crie este arquivo se necessário

// Defina a URL base da sua API Python
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000/api';

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
    message: 'success' | 'error' | 'loading'; // Adicionado 'loading' opcionalmente
    analysis?: MarketSegmentationInsightsOutput;
    errorMessage?: string; // Para mensagens de erro mais detalhadas
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

        const response = await fetch(`${PYTHON_API_URL}/marketing-strategies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido na API Python.' }));
            console.error("Erro da API Python:", errorData);
            return { message: `Erro da API: ${errorData.detail || response.statusText}` };
        }

        const result = await response.json();

        // Validação opcional da resposta (pode usar Zod aqui também se quiser)
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

// --- Tipos para Segmentation (adapte se criou /types/ai-inputs.ts) ---
interface DataTreatmentInput {
    normalize: boolean;
    excludeNulls: boolean;
    groupCategories: boolean;
}
interface MarketSegmentationInsightsInputApi {
    clusterData: string;
    dataTreatment: DataTreatmentInput;
    numberOfClusters: number;
}

// --- Função Atualizada para Segmentação ---
export async function getSegmentationInsights(
    clusterData: string,
    dataTreatment: DataTreatmentInput, // Use a interface definida
    numberOfClusters: number
): Promise<SegmentationState> {
    if (!clusterData) {
        return { message: 'error', errorMessage: 'Dados CSV não fornecidos.' };
    }

    try {
        const inputData: MarketSegmentationInsightsInputApi = { clusterData, dataTreatment, numberOfClusters };

        const response = await fetch(`${PYTHON_API_URL}/segmentation-insights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData),
        });

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido na API Python.' }));
             console.error("Erro da API Python:", errorData);
             return { message: 'error', errorMessage: `Erro da API (${response.status}): ${errorData.detail || response.statusText}` };
        }

        const result: MarketSegmentationInsightsOutput = await response.json();

         // Validação opcional da resposta (pode usar Zod aqui também se quiser)
         if (!result || !result.textualInsights || !Array.isArray(result.segments)) {
            return { message: 'error', errorMessage: 'Resposta inválida da API Python.' };
       }

        return { message: 'success', analysis: result };

    } catch (error) {
        console.error("Erro ao chamar getSegmentationInsights:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { message: 'error', errorMessage: `Falha na comunicação com a API: ${errorMessage}` };
    }
}