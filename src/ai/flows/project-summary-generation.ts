
'use server';
/**
 * @fileOverview A Genkit flow to generate concise, engaging, and professional summaries for showcased projects.
 *
 * - generateProjectSummary - A function that handles the project summary generation process.
 * - ProjectSummaryGenerationInput - The input type for the generateProjectSummary function.
 * - ProjectSummaryGenerationOutput - The return type for the generateProjectSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectSummaryGenerationInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z
    .string()
    .describe('A detailed description of the project, including its features and goals.'),
  technologiesUsed: z
    .array(z.string())
    .describe('A list of technologies and tools used in the project.'),
  demoLink: z.string().optional().describe('An optional link to a live demo of the project.'),
  sourceCodeLink: z
    .string()
    .optional()
    .describe('An optional link to the project\'s source code repository.'),
});
export type ProjectSummaryGenerationInput = z.infer<typeof ProjectSummaryGenerationInputSchema>;

const ProjectSummaryGenerationOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise, engaging, and professional summary of the project, highlighting its key features and impact.'
    ),
});
export type ProjectSummaryGenerationOutput = z.infer<typeof ProjectSummaryGenerationOutputSchema>;

const projectSummaryPrompt = ai.definePrompt({
  name: 'projectSummaryPrompt',
  input: {schema: ProjectSummaryGenerationInputSchema},
  output: {schema: ProjectSummaryGenerationOutputSchema},
  prompt: `You are an expert technical writer and marketer, specializing in creating engaging and professional project summaries for developer portfolios.

Generate a concise, engaging, and professional summary for the following project, suitable for a web developer's portfolio. The summary should be approximately 2-3 sentences long and highlight the project's key features, purpose, and impact.

Project Name: {{{projectName}}}
Project Description: {{{projectDescription}}}
Technologies Used: {{#each technologiesUsed}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

{{#if demoLink}}Demo Link: {{{demoLink}}}{{/if}}
{{#if sourceCodeLink}}Source Code Link: {{{sourceCodeLink}}}{{/if}}

Generate the summary:
`,
});

const projectSummaryGenerationFlow = ai.defineFlow(
  {
    name: 'projectSummaryGenerationFlow',
    inputSchema: ProjectSummaryGenerationInputSchema,
    outputSchema: ProjectSummaryGenerationOutputSchema,
  },
  async input => {
    try {
      const {output} = await projectSummaryPrompt(input);
      if (!output) {
        throw new Error('AI failed to produce a valid output summary.');
      }
      return output;
    } catch (error) {
      console.error('Flow execution error:', error);
      throw error;
    }
  }
);

export async function generateProjectSummary(
  input: ProjectSummaryGenerationInput
): Promise<ProjectSummaryGenerationOutput> {
  return projectSummaryGenerationFlow(input);
}
