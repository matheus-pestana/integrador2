
'use server';

import { z } from 'zod';
import { marketSegmentationInsights, type MarketSegmentationInsightsInput, type MarketSegmentationInsightsOutput } from '@/ai/flows/market-segmentation-insights';
import { generateMarketingStrategies, type MarketingStrategiesInput } from '@/ai/flows/personalized-marketing-strategy-generation';

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
        const input: MarketingStrategiesInput = validatedFields.data;
        const result = await generateMarketingStrategies(input);
        return { message: 'success', strategies: result.marketingStrategies };
    } catch (error) {
        console.error(error);
        return { message: 'Ocorreu um erro ao gerar as estratégias.' };
    }
}


export type SegmentationState = {
    message: 'success' | 'error';
    analysis?: MarketSegmentationInsightsOutput;
}

export async function getSegmentationInsights(
    clusterData: string, 
    dataTreatment: MarketSegmentationInsightsInput['dataTreatment'],
    numberOfClusters: number
): Promise<SegmentationState> {
    if (!clusterData) {
        return { message: 'error' };
    }

    try {
        const input: MarketSegmentationInsightsInput = { clusterData, dataTreatment, numberOfClusters };
        const result = await marketSegmentationInsights(input);
        return { message: 'success', analysis: result };
    } catch (error) {
        console.error(error);
        return { message: 'error' };
    }
}
