export interface AIConfig {
    enabled: boolean;
    provider: 'local' | 'openai' | 'anthropic' | 'ollama';
    apiKey?: string;
    endpoint?: string;    // Special for Ollama
    modelName?: string;   // Special for Ollama
    maxTokens: number;
    privacy: {
        sendSourceSnippets: boolean; // If false, only send AST/Metrics
        allowRemoteTelemetry: boolean;
    };
    localModelPath?: string; // For local provider
}

export const DEFAULT_AI_CONFIG: AIConfig = {
    enabled: true,
    provider: 'local',
    maxTokens: 50000, // Daily limit
    privacy: {
        sendSourceSnippets: false,
        allowRemoteTelemetry: false
    }
};
