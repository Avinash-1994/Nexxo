import { AIConfig } from '../config.js';
import { FixAction } from '../healer/fixer.js';
import { ParsedError } from '../healer/parser.js';

export class OllamaProvider {
    private endpoint: string;
    private model: string;

    constructor(config: AIConfig) {
        this.endpoint = config.endpoint || 'http://localhost:11434/api/generate';
        this.model = config.modelName || 'codellama';
    }

    async suggestFix(error: ParsedError): Promise<FixAction[]> {
        const prompt = this.generatePrompt(error);

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false,
                    format: 'json'
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.statusText}`);
            }

            const data: any = await response.json();
            const result = JSON.parse(data.response);

            return result.fixes.map((f: any) => ({
                ...f,
                confidence: f.confidence || 0.8
            }));
        } catch (e) {
            console.error('Failed to get fix from Ollama:', e);
            return [];
        }
    }

    private generatePrompt(error: ParsedError): string {
        return `You are an AI build engineer for the Urja build tool.
Analyze the following build error and suggest a fix in JSON format.

Error Message: ${error.message}
Error Type: ${error.type}
Context: ${JSON.stringify(error.context)}

The response MUST be a JSON object with a "fixes" array:
{
  "fixes": [
    {
      "type": "SHELL_COMMAND" | "FILE_EDIT" | "MANUAL_INSTRUCTION",
      "description": "Short explanation",
      "command": "terminal command to run",
      "confidence": 0.9
    }
  ]
}

Respond ONLY with valid JSON.`;
    }
}
