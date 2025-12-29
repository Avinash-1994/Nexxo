// src/ai/analyzer.ts
async function generateSuggestions(analysis, metafile) {
  const suggestions = [];
  if (analysis.fileCount > 100) {
    suggestions.push({
      type: "performance",
      icon: "\u26A1",
      title: "Enable Code Splitting",
      description: "Your project has " + analysis.fileCount + " files. Code splitting can reduce initial bundle size by up to 40%.",
      action: "Enable",
      priority: 9
    });
  }
  if (analysis.fileCount > 50) {
    suggestions.push({
      type: "performance",
      icon: "\u{1F680}",
      title: "Use Native Worker",
      description: "Switch to Rust native worker for ~20x faster plugin execution. Recommended for projects with 50+ files.",
      action: "Enable",
      priority: 8
    });
  }
  if (metafile) {
    const outputs = metafile.outputs || {};
    let largeChunks = 0;
    let totalSize = 0;
    for (const file in outputs) {
      const size = outputs[file].bytes;
      totalSize += size;
      if (file.endsWith(".js") && size > 500 * 1024) {
        largeChunks++;
      }
    }
    if (largeChunks > 0) {
      suggestions.push({
        type: "performance",
        icon: "\u{1F4E6}",
        title: "Large Chunks Detected",
        description: `Found ${largeChunks} chunks larger than 500KB. Consider using dynamic imports to split your code.`,
        action: "Optimize",
        priority: 10
      });
    }
    if (totalSize > 2 * 1024 * 1024) {
      suggestions.push({
        type: "performance",
        icon: "\u{1F4C9}",
        title: "High Bundle Size",
        description: `Total bundle size is ${(totalSize / 1024 / 1024).toFixed(2)}MB. Review dependencies and assets.`,
        action: "Analyze",
        priority: 9
      });
    }
  }
  if (analysis.framework === "react") {
    suggestions.push({
      type: "dx",
      icon: "\u269B\uFE0F",
      title: "React Fast Refresh",
      description: "Enable React Fast Refresh for instant component updates without losing state.",
      action: "Enable",
      priority: 7
    });
  }
  if (analysis.framework === "vue") {
    suggestions.push({
      type: "dx",
      icon: "\u{1F49A}",
      title: "Vue SFC Plugin",
      description: "Install Vue Single File Component plugin for better development experience.",
      action: "Install",
      priority: 7
    });
  }
  if (analysis.typescript) {
    suggestions.push({
      type: "best-practice",
      icon: "\u{1F4D8}",
      title: "TypeScript Config",
      description: "Use urja.build.ts instead of JSON for type-safe configuration with IntelliSense.",
      action: "Convert",
      priority: 6
    });
  }
  suggestions.push({
    type: "best-practice",
    icon: "\u{1F5FA}\uFE0F",
    title: "Source Maps",
    description: "Enable source maps in development mode for better debugging experience.",
    action: "Enable",
    priority: 5
  });
  suggestions.push({
    type: "dx",
    icon: "\u{1F525}",
    title: "Hot Module Replacement",
    description: "HMR allows you to see changes instantly without full page reload.",
    action: "Enable",
    priority: 7
  });
  suggestions.push({
    type: "security",
    icon: "\u{1F512}",
    title: "Plugin Verification",
    description: "Ensure all plugins are signed and verified before production deployment.",
    action: "Review",
    priority: 8
  });
  return suggestions.sort((a, b) => b.priority - a.priority);
}

// tests/ai_test.ts
import assert from "assert";
async function testAI() {
  console.log("Testing AI Analyzer...");
  const mockAnalysis = {
    framework: "react",
    typescript: true,
    packageManager: "npm",
    dependencies: ["react", "typescript"],
    fileCount: 20,
    totalSize: 1e3,
    entryPoints: ["src/main.tsx"]
  };
  console.log("Test 1: Basic Suggestions");
  const basicSuggestions = await generateSuggestions(mockAnalysis);
  assert(basicSuggestions.some((s) => s.title === "React Fast Refresh"), "Should suggest React Fast Refresh");
  assert(basicSuggestions.some((s) => s.title === "TypeScript Config"), "Should suggest TypeScript Config");
  console.log("\u2713 Basic suggestions passed");
  console.log("Test 2: Large Chunk Detection");
  const mockMetafile = {
    outputs: {
      "dist/large.js": { bytes: 600 * 1024 },
      // 600KB
      "dist/small.js": { bytes: 10 * 1024 }
    }
  };
  const chunkSuggestions = await generateSuggestions(mockAnalysis, mockMetafile);
  assert(chunkSuggestions.some((s) => s.title === "Large Chunks Detected"), "Should detect large chunks");
  console.log("\u2713 Large chunk detection passed");
  console.log("Test 3: High Bundle Size");
  const mockHugeMetafile = {
    outputs: {
      "dist/huge.js": { bytes: 3 * 1024 * 1024 }
      // 3MB
    }
  };
  const sizeSuggestions = await generateSuggestions(mockAnalysis, mockHugeMetafile);
  assert(sizeSuggestions.some((s) => s.title === "High Bundle Size"), "Should detect high bundle size");
  console.log("\u2713 High bundle size detection passed");
  console.log("All AI tests passed!");
}
testAI().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
