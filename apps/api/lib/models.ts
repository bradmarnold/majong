/**
 * Provider abstraction for AI text models
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatProvider {
  chatTip(messages: ChatMessage[]): Promise<string>;
}

class GitHubModelsProvider implements ChatProvider {
  private token: string;
  private baseUrl = 'https://models.inference.ai.azure.com';

  constructor(token: string) {
    this.token = token;
  }

  async chatTip(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using GitHub Models
          messages,
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`GitHub Models API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('GitHub Models error:', error);
      throw error;
    }
  }
}

class OpenAIProvider implements ChatProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chatTip(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI error:', error);
      throw error;
    }
  }
}

class StaticProvider implements ChatProvider {
  private tips = [
    "Focus on completing simple sets first. Look for pungs (3 identical tiles) and chis (3 consecutive tiles of the same suit).",
    "Pay attention to what other players discard. Their discards tell you what they don't need for their hands.",
    "Keep your hand organized by suit. This helps you spot potential melds and missing tiles more easily.",
    "Don't be greedy with complex hands. Sometimes a simple winning hand is better than waiting for high-scoring combinations.",
    "Watch the number of tiles left in the wall. As it gets low, consider whether to push for a win or play defensively.",
    "Dragons and winds can be valuable. Collect them for pungs, especially your seat wind and the round wind.",
    "If you're new, aim for 'All Simples' hands (no 1s, 9s, winds, or dragons). They're easier to complete.",
    "Consider what you discard carefully. Don't give opponents tiles that might complete their hands.",
  ];

  async chatTip(_messages: ChatMessage[]): Promise<string> {
    const randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
    return randomTip;
  }
}

/**
 * Get an AI chat provider based on available environment variables
 */
export function getChatProvider(): ChatProvider {
  const ghToken = process.env.GH_MODELS_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (ghToken) {
    return new GitHubModelsProvider(ghToken);
  }

  if (openaiKey) {
    return new OpenAIProvider(openaiKey);
  }

  // Fallback to static tips
  return new StaticProvider();
}

/**
 * Generate a teaching tip based on game context
 */
export async function generateTeachingTip(gameContext: string): Promise<string> {
  const provider = getChatProvider();

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a helpful Mahjong teacher. Give concise, practical advice in 80 words or less. 
Focus on Hong Kong Mahjong rules with 13-tile hands, chi/pon/kong mechanics, and fan scoring.
Be encouraging and specific to the current game situation.`,
    },
    {
      role: 'user',
      content: `Current game situation: ${gameContext}. What advice would you give to improve my play?`,
    },
  ];

  try {
    const tip = await provider.chatTip(messages);
    
    // Ensure tip is not too long
    if (tip.length > 400) {
      return tip.substring(0, 400) + '...';
    }
    
    return tip;
  } catch (error) {
    console.error('Failed to generate teaching tip:', error);
    
    // Fallback to static provider
    const staticProvider = new StaticProvider();
    return staticProvider.chatTip(messages);
  }
}