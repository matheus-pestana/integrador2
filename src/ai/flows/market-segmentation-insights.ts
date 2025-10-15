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
      'A sample of customer data from a CSV file. It includes the header row and a few sample rows to show the data structure.'
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

  Analyze the characteristics of the customer data sample provided. Based on this sample data, identify potential market segments. For each segment, suggest key attributes and needs. Structure the response in a human-readable format. The output should be well-formatted and easy to understand.

  Customer Data Sample (CSV format):
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
