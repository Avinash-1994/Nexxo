import { BuildConfig } from '../config/index.js';
import { BuildPipeline } from '../core/pipeline.js';
import {
  ResolverStep,
  TransformerStep,
  BundlerStep,
  OptimizerStep,
  OutputterStep
} from '../core/steps.js';

export async function build(cfg: BuildConfig) {
  console.log('🏗️  Starting Build Pipeline...');
  console.log('📁 Root:', cfg.root);
  console.log('📦 Entry:', cfg.entry);
  console.log('📂 Output:', cfg.outDir);

  const pipeline = new BuildPipeline(cfg);

  pipeline
    .addStep(new ResolverStep())
    .addStep(new TransformerStep())
    .addStep(new BundlerStep())
    .addStep(new OptimizerStep())
    .addStep(new OutputterStep());

  // Add timeout to prevent hanging
  const buildPromise = pipeline.execute();
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Build timeout after 60 seconds')), 60000);
  });

  try {
    await Promise.race([buildPromise, timeoutPromise]);
    console.log('✅ Build completed successfully!');
  } catch (error: any) {
    console.error('❌ Build failed:', error.message);
    throw error;
  }
}
