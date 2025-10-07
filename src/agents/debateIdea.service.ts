// Wrapper service for generateDebateIdea() agent integration
// Provides timeout, abort, validation, and error handling

import { langChainConfig } from '../langchain-config';
import type { Difficulty, Theme } from '../types';

export interface DebateIdeaParams {
  theme: Theme;
  difficulty?: Difficulty;
  playerName?: string;
  seed?: string | number;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface DebateIdeaResult {
  question: string;
}

export class DebateIdeaService {
  private static readonly DEFAULT_TIMEOUT = 8000; // 8 seconds
  private static readonly MAX_RETRIES = 1;

  /**
   * Generate a debate idea with enhanced error handling and validation
   */
  static async generateDebateIdeaWrapped(params: DebateIdeaParams): Promise<DebateIdeaResult> {
    const {
      theme,
      difficulty = 'moyen',
      playerName,
      seed,
      signal,
      timeoutMs = this.DEFAULT_TIMEOUT
    } = params;

    // Create abort controller for timeout if not provided
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Combine user signal with timeout signal
    const combinedSignal = signal
      ? this.createCombinedSignal(signal, controller.signal)
      : controller.signal;

    try {
      // Validate inputs
      this.validateParams({ theme, difficulty, playerName });

      // Generate the idea
      const question = await this.callAgentWithRetry({
        theme,
        difficulty,
        playerName,
        seed,
        signal: combinedSignal
      });

      // Validate and clean the result
      const cleanedQuestion = this.validateAndCleanQuestion(question);

      return { question: cleanedQuestion };

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('La génération de l\'idée a pris trop de temps. Veuillez réessayer.');
        }
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Clé API invalide. Vérifiez la configuration.');
        }
        if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Quota API dépassé. Réessayez plus tard.');
        }
        if (error.message.includes('NETWORK_ERROR')) {
          throw new Error('Erreur de réseau. Vérifiez votre connexion.');
        }
      }

      // Re-throw the original error if it's already formatted
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Create a combined abort signal from multiple sources
   */
  private static createCombinedSignal(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    const onAbort = () => controller.abort();
    signals.forEach(signal => {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener('abort', onAbort);
    });

    return controller.signal;
  }

  /**
   * Validate input parameters
   */
  private static validateParams(params: { theme: Theme; difficulty: Difficulty; playerName?: string }): void {
    if (!params.theme) {
      throw new Error('Le thème est obligatoire');
    }

    const validDifficulties: Difficulty[] = ['facile', 'moyen', 'difficile', 'tres-difficile'];
    if (!validDifficulties.includes(params.difficulty)) {
      throw new Error(`Difficulté invalide: ${params.difficulty}`);
    }

    if (params.playerName && params.playerName.length > 50) {
      throw new Error('Le nom du joueur ne peut pas dépasser 50 caractères');
    }
  }

  /**
   * Call the agent with retry logic
   */
  private static async callAgentWithRetry(params: {
    theme: Theme;
    difficulty: Difficulty;
    playerName?: string;
    seed?: string | number;
    signal?: AbortSignal;
  }): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= DebateIdeaService.MAX_RETRIES; attempt++) {
      try {
        // Check if aborted before calling
        if (params.signal?.aborted) {
          throw new Error('Opération annulée');
        }

        const question = await langChainConfig.generateDebateIdea(
          params.theme,
          params.difficulty
        );

        return question;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on abort or validation errors
        if (lastError.name === 'AbortError' || lastError.message.includes('invalide')) {
          throw lastError;
        }

        // Log retry attempt
        console.warn(`Tentative ${attempt + 1} échouée:`, lastError.message);

        // Wait before retry (except on last attempt)
        if (attempt < DebateIdeaService.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // All retries failed
    throw new Error(`Échec après ${DebateIdeaService.MAX_RETRIES + 1} tentatives: ${lastError?.message}`);
  }

  /**
   * Validate and clean the generated question
   */
  private static validateAndCleanQuestion(question: string): string {
    if (!question || typeof question !== 'string') {
      throw new Error('La question générée n\'est pas valide');
    }

    // Clean up the question
    let cleaned = question.trim();

    // Remove extra quotes at start/end
    cleaned = cleaned.replace(/^["']|["']$/g, '');

    // Ensure it's not too long (max 200 characters for UI)
    if (cleaned.length > 200) {
      // Try to cut at a sentence boundary
      const sentences = cleaned.split(/[.!?]+/);
      cleaned = sentences[0];
      if (cleaned.length > 200) {
        cleaned = cleaned.substring(0, 197) + '...';
      }
    }

    // Ensure it's not too short
    if (cleaned.length < 10) {
      throw new Error('La question générée est trop courte');
    }

    // Ensure it ends with proper punctuation
    if (!cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }

    return cleaned;
  }

  /**
   * Create an abort controller for external cancellation
   */
  static createAbortController(): AbortController {
    return new AbortController();
  }
}

// Export a singleton instance for convenience
export const debateIdeaService = DebateIdeaService;