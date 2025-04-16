'use server';
/**
 * @fileOverview Detects diseases from an image of a plant leaf.
 *
 * - detectDisease - A function that handles the disease detection process.
 * - DetectDiseaseInput - The input type for the detectDisease function.
 * - DetectDiseaseOutput - The return type for the detectDisease function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DetectDiseaseInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the plant leaf photo.'),
});
export type DetectDiseaseInput = z.infer<typeof DetectDiseaseInputSchema>;

const DetectDiseaseOutputSchema = z.object({
  diseaseDetected: z.boolean().describe('Whether a disease was detected or not.'),
  diseaseName: z.string().optional().describe('The name of the detected disease, if any.'),
  confidenceLevel: z.number().optional().describe('The confidence level of the disease detection (0-1), if a disease is detected.'),
});
export type DetectDiseaseOutput = z.infer<typeof DetectDiseaseOutputSchema>;

export async function detectDisease(input: DetectDiseaseInput): Promise<DetectDiseaseOutput> {
  return detectDiseaseFlow(input);
}

const diseaseDetectionPrompt = ai.definePrompt({
  name: 'diseaseDetectionPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the plant leaf photo.'),
    }),
  },
  output: {
    schema: z.object({
      diseaseDetected: z.boolean().describe('Whether a disease was detected or not.'),
      diseaseName: z.string().optional().describe('The name of the detected disease, if any.'),
      confidenceLevel: z.number().optional().describe('The confidence level of the disease detection (0-1), if a disease is detected.'),
    }),
  },
  prompt: `You are an AI model specializing in plant leaf disease detection.

You will analyze the provided image of a plant leaf and determine if any disease is present.

Based on your analysis, you will:
- Set 'diseaseDetected' to true if a disease is identified, and provide the 'diseaseName' and 'confidenceLevel'.
- Set 'diseaseDetected' to false if no disease is detected.

Analyze the following plant leaf image:
{{media url=photoUrl}}
`,
});

const detectDiseaseFlow = ai.defineFlow<
  typeof DetectDiseaseInputSchema,
  typeof DetectDiseaseOutputSchema
>(
  {
    name: 'detectDiseaseFlow',
    inputSchema: DetectDiseaseInputSchema,
    outputSchema: DetectDiseaseOutputSchema,
  },
  async input => {
    const {output} = await diseaseDetectionPrompt(input);
    return output!;
  }
);
