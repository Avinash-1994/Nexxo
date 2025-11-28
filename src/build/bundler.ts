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
  const pipeline = new BuildPipeline(cfg);

  pipeline
    .addStep(new ResolverStep())
    .addStep(new TransformerStep())
    .addStep(new BundlerStep())
    .addStep(new OptimizerStep())
    .addStep(new OutputterStep());

  await pipeline.execute();
}
