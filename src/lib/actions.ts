'use server';

import { z } from 'zod';
import { marketSegmentationInsights, type MarketSegmentationInsightsInput } from '@/ai/flows/market-segmentation-insights';
import { generateMarketingStrategies, type MarketingStrategiesInput } from '@/ai/flows/personalized-marketing-strategy-generation';

const strategiesSchema = z.object({
    customerSegmentAttributes: z.string().min(10, { message: 'Please provide more detail about the customer segment.' }),
    campaignObjectives: z.string().min(10, { message: 'Please provide more detail about the campaign objectives.' }),
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
            message: 'Invalid form data.',
        };
    }

    try {
        const input: MarketingStrategiesInput = validatedFields.data;
        const result = await generateMarketingStrategies(input);
        return { message: 'success', strategies: result.marketingStrategies };
    } catch (error) {
        console.error(error);
        return { message: 'An error occurred while generating strategies.' };
    }
}


export type SegmentationState = {
    message?: string;
    insights?: string;
}

export async function getSegmentationInsights(clusterData: string): Promise<SegmentationState> {
    if (!clusterData) {
        return { message: 'Cluster data is required.' };
    }

    try {
        const input: MarketSegmentationInsightsInput = { clusterData };
        const result = await marketSegmentationInsights(input);
        return { message: 'success', insights: result.segmentInsights };
    } catch (error) {
        console.error(error);
        return { message: 'An error occurred while generating insights.' };
    }
}
