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

const SegmentSchema = z.object({
  name: z.string().describe('A descriptive name for the customer segment (e.g., "High-Value Frequent Buyers").'),
  size: z.number().describe('The number of customers in this segment.'),
  avg_purchase_value: z.number().describe('The average purchase value for this segment.'),
  purchase_frequency: z.number().describe('The average purchase frequency for this segment (e.g., purchases per month/year).'),
  description: z.string().describe('A brief, human-readable summary of the key attributes and needs of this segment.'),
});

const MarketSegmentationInsightsOutputSchema = z.object({
  textualInsights: z
    .string()
    .describe(
      'A human-readable summary of the key attributes and needs of the different customer groups found in the data.'
    ),
  segments: z.array(SegmentSchema).describe('An array of identified market segments with their structured data.'),
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

  Analyze the characteristics of the customer data sample provided. Based on this sample data, identify between 3 and 5 potential market segments.

  For each segment, you must:
  1.  Provide a descriptive name (e.g., "High-Value Frequent Buyers", "New Shoppers", "Budget Spenders").
  2.  Estimate the segment size (number of customers).
  3.  Estimate the average purchase value.
  4.  Estimate the purchase frequency.
  5.  Write a brief summary of the segment's key attributes and needs.

  Finally, provide a single, combined textual summary of all the segments.

  The estimates should be derived logically from the sample data provided. Ensure the output is structured as valid JSON according to the provided schema.

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
