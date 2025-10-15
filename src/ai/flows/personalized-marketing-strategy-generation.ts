'use server';

/**
 * @fileOverview Generates personalized marketing strategies for customer segments.
 *
 * - generateMarketingStrategies - A function to generate marketing strategies based on customer segment attributes and campaign objectives.
 * - MarketingStrategiesInput - The input type for the generateMarketingStrategies function.
 * - MarketingStrategiesOutput - The return type for the generateMarketingStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketingStrategiesInputSchema = z.object({
  customerSegmentAttributes: z.string().describe('Description of customer segment attributes'),
  campaignObjectives: z.string().describe('Description of the marketing campaign objectives'),
});

export type MarketingStrategiesInput = z.infer<typeof MarketingStrategiesInputSchema>;

const MarketingStrategiesOutputSchema = z.object({
  marketingStrategies: z.array(z.string()).describe('Personalized marketing strategies for the customer segment'),
});

export type MarketingStrategiesOutput = z.infer<typeof MarketingStrategiesOutputSchema>;

export async function generateMarketingStrategies(input: MarketingStrategiesInput): Promise<MarketingStrategiesOutput> {
  return generateMarketingStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedMarketingStrategyPrompt',
  input: {schema: MarketingStrategiesInputSchema},
  output: {schema: MarketingStrategiesOutputSchema},
  prompt: `You are an expert marketing strategist. Based on the description of customer segments and campaign objectives, generate personalized marketing strategies. Return an array of marketing strategies.

Customer Segment Attributes: {{{customerSegmentAttributes}}}
Campaign Objectives: {{{campaignObjectives}}}`,
});

const generateMarketingStrategiesFlow = ai.defineFlow(
  {
    name: 'generateMarketingStrategiesFlow',
    inputSchema: MarketingStrategiesInputSchema,
    outputSchema: MarketingStrategiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
