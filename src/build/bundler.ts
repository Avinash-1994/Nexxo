import { BuildConfig } from '../config/index.js';


export async function build(cfg: BuildConfig) {
  console.log('🏗️  Starting Build Pipeline...');
  console.log('📁 Root:', cfg.root);
  console.log('📦 Entry:', cfg.entry);
  console.log('📂 Output:', cfg.outDir);

  const { FrameworkPipeline } = await import('../core/pipeline/framework-pipeline.js');
  const pipeline = await FrameworkPipeline.auto(cfg);

  try {
    const result = await pipeline.build();
    if (!result.success) {
      const errorMsg = (result as any).error?.message || 'Unknown build error';
      throw new Error(errorMsg);
    }
    console.log('✅ Build completed successfully!');
  } catch (error: any) {
    console.error('❌ Build failed:', error.message);
    throw error;
  } finally {
    await pipeline.close();
  }
}
