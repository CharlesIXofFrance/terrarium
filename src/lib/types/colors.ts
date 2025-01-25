import { z } from 'zod';

export const ColorAnalysisSchema = z.object({
  jobId: z.string(),
  companyName: z.string(),
  logoUrl: z.string().url(),
  dominantColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  palette: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)),
  contrast: z.object({
    light: z.number(),
    dark: z.number(),
  }),
  timestamp: z.string().datetime(),
});

export type ColorAnalysis = z.infer<typeof ColorAnalysisSchema>;

export interface ColorCache {
  [logoUrl: string]: ColorAnalysis;
}
