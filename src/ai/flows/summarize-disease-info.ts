'use server';
/**
 * @fileOverview Summarizes information about a plant disease.
 *
 * - summarizeDiseaseInfo - A function that summarizes disease information.
 * - SummarizeDiseaseInfoInput - The input type for the summarizeDiseaseInfo function.
 * - SummarizeDiseaseInfoOutput - The return type for the summarizeDiseaseInfo function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeDiseaseInfoInputSchema = z.object({
  diseaseName: z.string().describe('The name of the plant disease.'),
});
export type SummarizeDiseaseInfoInput = z.infer<typeof SummarizeDiseaseInfoInputSchema>;

const SummarizeDiseaseInfoOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the disease, including common symptoms and potential treatments.'),
});
export type SummarizeDiseaseInfoOutput = z.infer<typeof SummarizeDiseaseInfoOutputSchema>;

export async function summarizeDiseaseInfo(input: SummarizeDiseaseInfoInput): Promise<SummarizeDiseaseInfoOutput> {
  return summarizeDiseaseInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDiseaseInfoPrompt',
  input: {
    schema: z.object({
      diseaseName: z.string().describe('The name of the plant disease.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A brief summary of the disease, including common symptoms and potential treatments.'),
    }),
  },
  prompt: `You are an expert in plant diseases. Please provide a brief summary of the following disease, including common symptoms and potential treatments.\n\nDisease Name: {{{diseaseName}}}`,
});

const summarizeDiseaseInfoFlow = ai.defineFlow<
  typeof SummarizeDiseaseInfoInputSchema,
  typeof SummarizeDiseaseInfoOutputSchema
>(
  {
    name: 'summarizeDiseaseInfoFlow',
    inputSchema: SummarizeDiseaseInfoInputSchema,
    outputSchema: SummarizeDiseaseInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
