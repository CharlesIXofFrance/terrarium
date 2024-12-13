import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { MOCK_JOBS } from '../src/data/mockJobs';
import { analyzeImageColors } from '../src/lib/utils/colorAnalysis';
import { ColorAnalysis, ColorAnalysisSchema } from '../src/lib/types/colors';

const CACHE_FILE = resolve(process.cwd(), 'src/data/logoColors.json');

async function main() {
  // Load existing cache if available
  let cache: Record<string, ColorAnalysis> = {};
  if (existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
    } catch (error) {
      console.error('Error reading cache file:', error);
    }
  }

  const results: ColorAnalysis[] = [];

  for (const job of MOCK_JOBS) {
    if (!job.companyLogo) {
      console.warn(`No logo URL for ${job.company}, skipping...`);
      continue;
    }

    try {
      // Check cache first
      if (cache[job.companyLogo]) {
        console.log(`Using cached results for ${job.company}`);
        results.push(cache[job.companyLogo]);
        continue;
      }

      console.log(`Analyzing logo for ${job.company}...`);
      
      // Add CORS proxy for SVG logos
      const logoUrl = job.companyLogo.endsWith('.svg') 
        ? `https://cors-anywhere.herokuapp.com/${job.companyLogo}`
        : job.companyLogo;

      const analysis = await analyzeImageColors(logoUrl);

      const colorAnalysis: ColorAnalysis = {
        jobId: job.id,
        companyName: job.company,
        logoUrl: job.companyLogo,
        dominantColor: analysis.dominantColor,
        palette: analysis.palette,
        contrast: analysis.contrast,
        timestamp: new Date().toISOString()
      };

      // Validate data
      ColorAnalysisSchema.parse(colorAnalysis);

      results.push(colorAnalysis);
      cache[job.companyLogo] = colorAnalysis;

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${job.company}:`, error);
    }
  }

  // Save results and update cache
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`\nResults saved to ${CACHE_FILE}`);
    console.log(`\nProcessed ${results.length} logos`);
  } catch (error) {
    console.error('Error saving results:', error);
  }
}

main().catch(console.error);