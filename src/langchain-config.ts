import { AICharacter, Difficulty, Exchange, Position } from './types';

class BackendAIClient {
  public isInitialized = true;

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Erreur API (${response.status})`);
    }
    return (await response.json()) as T;
  }

  async initialize(): Promise<boolean> {
    // côté front, rien à initialiser pour l'API proxy
    this.isInitialized = true;
    return true;
  }

  async generateDebateIdea(theme: string, difficulty: Difficulty): Promise<string> {
    const data = await this.post<{ idea: string }>('/idea', { theme, difficulty });
    return data.idea;
  }

  async generateAIResponse(
    character: AICharacter,
    idea: string,
    playerPosition: Position,
    playerResponse: string,
    exchangeCount: number
  ): Promise<string> {
    const data = await this.post<{ text: string }>('/respond', {
      character,
      idea,
      playerPosition,
      playerResponse,
      exchangeCount,
    });
    return data.text;
  }

  async generateSummary(idea: string, exchanges: Exchange[], finalScore: number): Promise<string> {
    const data = await this.post<{ summary: string }>('/summary', { idea, exchanges, finalScore });
    return data.summary;
  }

  async generateGameOverMessage(finalScore: number, playerName: string): Promise<string> {
    const data = await this.post<{ text: string }>('/game-over', { finalScore, playerName });
    return data.text;
  }
}

export const langChainConfig = new BackendAIClient();

