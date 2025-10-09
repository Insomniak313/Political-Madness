// Wrapper service for generateDebateIdea() agent integration
// Provides timeout, abort, validation, and error handling

import { langChainConfig } from '../langchain-config';
import { logger } from '../services/logger';
import type { Difficulty, Theme } from '../types';


export interface DebateTopicsParams {
  language: string;
  difficulty: Difficulty;
  theme: Theme;
  context: string;
  seed?: string | number;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface DebateTopicsResult {
  sujets: string[];
}

export class DebateIdeaService {
  private static readonly DEFAULT_TIMEOUT = 8000; // 8 seconds
  private static readonly MAX_RETRIES = 1;


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
   * Validate input parameters for topics generation
   */
  private static validateTopicsParams(params: { language: string; difficulty: Difficulty; theme: Theme }): void {
    if (!params.language || params.language !== 'français') {
      throw new Error('La langue doit être "français"');
    }

    if (!params.theme) {
      throw new Error('Le thème est obligatoire');
    }

    const validDifficulties: Difficulty[] = ['facile', 'moyen', 'difficile', 'tres-difficile'];
    if (!validDifficulties.includes(params.difficulty)) {
      throw new Error(`Difficulté invalide: ${params.difficulty}`);
    }
  }


  /**
   * Call the DebatePicker agent with retry logic for topic generation (wizard)
   */
  private static async callTopicsAgentWithRetry(params: {
    language: string;
    difficulty: Difficulty;
    theme: Theme;
    context: string;
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

        const prompt = `
Tu es DebatePicker, un agent IA chargé de créer trois questions de débat formulées pour être répondue par “pour” ou “contre”.
Tu dois parler comme si tu préparais un jeu télé grand public.

- langue = ${params.language}
- thème = ${params.theme}
- difficulté = ${params.difficulty}
- contexte = ${params.context}

🎯 Mission :
À partir des informations suivantes :
- langue = ${params.language}
- thème = ${params.theme}
- difficulté = ${params.difficulty}
- contexte = ${params.context}

Génère **exactement trois questions de débat** en une seule phrase chacune.

⚙️ Structure de créativité :
1️⃣ **Accessible et simple** — question réaliste et sérieuse, compréhensible par tout le monde.  
2️⃣ **Inattendu et provocatrice** — question inattendu, crédible et provocatrice. Des questions légèrement dystopiques mais qui sont tout à fait possible
3️⃣ **Absurde et drôle** — question humoristique, mais plausible. Elle doit être légèrement absurde.

🧠 Règles :
- Chaque question doit pouvoir être répondue par “pour” ou “contre”.  
- Évite les termes trop techniques, politiques ou juridiques.  
- Utilise un langage du quotidien, clair, direct, amusant.  
- Pas de texte explicatif, pas de numérotation, pas de commentaire.  
- Le 3e sujet doit faire sourire, surprendre, voire être absurde, mais rester grammaticalement correct.

📦 **FORMAT DE SORTIE UNIQUE ET STRICT :**
Réponds uniquement avec ce JSON valide :
{
  "sujets": [
    "question1",
    "question2",
    "question3"
  ]
}
        `;

        const response = await langChainConfig.generateResponse(prompt);

        return response;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on abort or validation errors
        if (lastError.name === 'AbortError' || lastError.message.includes('invalide')) {
          throw lastError;
        }

        // Log retry attempt
        logger.warn('agent:topics', 'retry', {
          attempt: attempt + 1,
          error: lastError.message
        });

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
   * Parse and validate the topics JSON response
   */
  private static parseAndValidateTopicsJson(jsonString: string): DebateTopicsResult {
    try {
      // Extract JSON from the response if there's extra text
      let jsonToParse = jsonString.trim();

      // Try to find JSON object in the response
      const jsonMatch = jsonToParse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonToParse = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonToParse);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('La réponse n\'est pas un objet JSON valide');
      }

      if (!parsed.sujets || !Array.isArray(parsed.sujets)) {
        throw new Error('La clé "sujets" est manquante ou n\'est pas un tableau');
      }

      if (parsed.sujets.length !== 3) {
        throw new Error(`Le nombre de sujets doit être exactement 3, reçu: ${parsed.sujets.length}`);
      }

      // Validate each topic
      for (let i = 0; i < parsed.sujets.length; i++) {
        const topic = parsed.sujets[i];
        if (typeof topic !== 'string' || topic.trim().length === 0) {
          throw new Error(`Le sujet ${i + 1} n'est pas une chaîne valide`);
        }
        if (topic.length > 200) {
          throw new Error(`Le sujet ${i + 1} est trop long (max 200 caractères)`);
        }
      }

      return {
        sujets: parsed.sujets.map((s: string) => s.trim())
      };

    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('La réponse JSON n\'est pas valide');
      }
      throw error;
    }
  }

  /**
   * Generate debate topics with enhanced error handling and validation
   */
  static async generateDebateTopicsWrapped(params: DebateTopicsParams): Promise<DebateTopicsResult> {
    const {
      language,
      difficulty,
      theme,
      context,
      seed,
      signal,
      timeoutMs = this.DEFAULT_TIMEOUT
    } = params;

    const startTime = Date.now();

    // Log request
    logger.info('agent:topics', 'request', {
      language,
      difficulty,
      theme,
      seed,
      timeoutMs
    });

    // Create abort controller for timeout if not provided
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Combine user signal with timeout signal
    const combinedSignal = signal
      ? this.createCombinedSignal(signal, controller.signal)
      : controller.signal;

    try {
      // Validate inputs
      this.validateTopicsParams({ language, difficulty, theme });

      // Generate the topics
      const topicsJson = await this.callTopicsAgentWithRetry({
        language,
        difficulty,
        theme,
        context,
        seed,
        signal: combinedSignal
      });

      // Parse and validate the result
      const parsedResult = this.parseAndValidateTopicsJson(topicsJson);

      // Log success
      const duration = Date.now() - startTime;
      logger.info('agent:topics', 'success', {
        ms: duration,
        topicsCount: parsedResult.sujets.length
      });

      return parsedResult;

    } catch (error) {
      // Log failure
      const duration = Date.now() - startTime;
      const errType = error instanceof Error ? (error.name === 'AbortError' ? 'timeout' : 'error') : 'unknown';
      const message = error instanceof Error ? error.message : String(error);

      logger.error('agent:topics', 'failure', {
        ms: duration,
        errType,
        message
      });

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('La génération des sujets a pris trop de temps. Veuillez réessayer.');
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
   * Create an abort controller for external cancellation
   */
  static createAbortController(): AbortController {
    return new AbortController();
  }
}

// Export a singleton instance for convenience
export const debateIdeaService = DebateIdeaService;