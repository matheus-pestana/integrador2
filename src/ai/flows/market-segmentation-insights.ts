'use server';

/**
 * @fileOverview A flow that analyzes customer clusters and suggests insights about each market segment.
 *
 * - marketSegmentationInsights - A function that handles the market segmentation insights generation process.
 * - MarketSegmentationInsightsInput - The input type for the marketSegmentationInsights function.
 * - MarketSegmentationInsightsOutput - The return type for the marketSegmentationInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketSegmentationInsightsInputSchema = z.object({
  clusterData: z
    .string()
    .describe(
      'The data of customer clusters, as a JSON string.  Each cluster should include data elements associated with the identified market segment, such as average purchase value, frequency of purchases, demographics, etc.'
    ),
});
export type MarketSegmentationInsightsInput = z.infer<typeof MarketSegmentationInsightsInputSchema>;

const MarketSegmentationInsightsOutputSchema = z.object({
  segmentInsights: z
    .string()
    .describe(
      'Insights about each market segment, including key attributes and needs of different customer groups, in a human-readable format.'
    ),
});
export type MarketSegmentationInsightsOutput = z.infer<typeof MarketSegmentationInsightsOutputSchema>;

export async function marketSegmentationInsights(
  input: MarketSegmentationInsightsInput
): Promise<MarketSegmentationInsightsOutput> {
  return marketSegmentationInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketSegmentationInsightsPrompt',
  input: {schema: MarketSegmentationInsightsInputSchema},
  output: {schema: MarketSegmentationInsightsOutputSchema},
  prompt: `You are an expert marketing analyst.

  Analyze the characteristics of each customer cluster provided in the cluster data. Based on the data, suggest insights about each market segment, so the user can quickly understand the key attributes and needs of different customer groups.  Structure the response in a human-readable format. The output should be well-formatted and easy to understand.

  Cluster Data:
  {{clusterData}}`,
});

const marketSegmentationInsightsFlow = ai.defineFlow(
  {
    name: 'marketSegmentationInsightsFlow',
    inputSchema: MarketSegmentationInsightsInputSchema,
    outputSchema: MarketSegmentationInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
