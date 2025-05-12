// Direct Ollama service for frontend

const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3';

class OllamaService {
  constructor(baseUrl = OLLAMA_BASE_URL, model = DEFAULT_MODEL) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.apiEndpoint = `${this.baseUrl}/api/generate`;
  }

  async generate(prompt, systemPrompt = "", temperature = 0.7, maxTokens = 500) {
    const payload = {
      model: this.model,
      prompt: prompt,
      temperature: temperature,
      max_tokens: maxTokens,
    };
    
    if (systemPrompt) {
      payload.system = systemPrompt;
    }
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      throw error;
    }
  }

  // Helper method to check if Ollama is available
  async isAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama service not available:', error);
      return false;
    }
  }
}

export default new OllamaService();
