import { GoogleGenerativeAI } from '@google/generative-ai';
import { AICharacter, Difficulty, Exchange, Position } from './types';

interface GenerativeModel {
  generateContent(prompt: string): Promise<{ response: { text: () => string } }>;
}

// Configuration LangChain avec Gemini Flash
class LangChainConfig {
  private model: GenerativeModel | null = null;
  public isInitialized = false;
  private genAI: GoogleGenerativeAI | null = null;

  async initialize(apiKey: string): Promise<boolean> {
    try {
      // Initialiser Google Generative AI
      this.genAI = new GoogleGenerativeAI(apiKey);

      // Configuration du modèle Gemini Flash
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      }) as GenerativeModel;

      this.isInitialized = true;
      return true;
    } catch (error) {
      return false;
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!this.isInitialized || !this.model) {
      throw new Error('LangChain n\'est pas initialisé');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {

      // Gestion spécifique des erreurs
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Clé API invalide. Veuillez la vérifier.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Quota API dépassé. Réessayez plus tard.');
        } else if (error.message.includes('NETWORK_ERROR')) {
          throw new Error('Erreur de réseau. Vérifiez votre connexion.');
        }
      }

      throw error;
    }
  }

  async generateDebateIdea(theme: string, difficulty: Difficulty): Promise<string> {
    const difficultyPrompts: Record<Difficulty, string> = {
      facile: "Créez une idée clivante simple et accessible sur le thème",
      moyen: "Créez une idée clivante modérée sur le thème",
      difficile: "Créez une idée clivante complexe et nuancée sur le thème",
      'tres-difficile': "Créez une idée clivante extrêmement complexe et sophistiquée sur le thème"
    };

    const prompt = `
    En tant que journaliste politique, ${difficultyPrompts[difficulty]} "${theme}".
    
    L'idée doit être :
    - Clivante et controversée
    - Propice au débat
    - Formulée comme une déclaration claire
    - Adaptée au niveau ${difficulty}
    
    Répondez uniquement avec l'idée clivante, sans explication supplémentaire.
    `;

    return await this.generateResponse(prompt);
  }

  async generateAIResponse(
    character: AICharacter,
    idea: string,
    playerPosition: Position,
    playerResponse: string,
    exchangeCount: number
  ): Promise<string> {
    const prompt = `
    Vous êtes ${character.name}, un personnage avec les caractéristiques suivantes :
    - Personnalité : ${character.personality}
    - Style de communication : ${character.communicationStyle}
    - Valeurs : ${character.values}
    - Niveau d'agressivité : ${character.aggressiveness}/10
    
    L'idée clivante est : "${idea}"
    Votre position : ${playerPosition === 'pour' ? 'contre' : 'pour'}
    Réponse du joueur : "${playerResponse || 'Aucune réponse pour le moment'}"
    Échange numéro : ${exchangeCount}/3
    
    Répondez de manière convaincante en restant dans le caractère de ${character.name}.
    Votre réponse doit être :
    - Cohérente avec votre personnalité
    - Persuasive et argumentée
    - Adaptée au niveau d'agressivité de ${character.aggressiveness}/10
    - Maximum 200 mots
    `;

    return await this.generateResponse(prompt);
  }

  async generateSummary(idea: string, exchanges: Exchange[], finalScore: number): Promise<string> {
    const prompt = `
    En tant que journaliste politique, analysez ce débat et donnez un résumé professionnel.
    
    Idée clivante : "${idea}"
    Échanges : ${exchanges.length} échanges
    Score final : ${finalScore}% (en faveur du joueur)
    
    Le résumé doit :
    - Analyser les arguments principaux des deux côtés
    - Expliquer pourquoi le score a évolué ainsi
    - Être objectif et professionnel
    - Faire maximum 150 mots
    `;

    return await this.generateResponse(prompt);
  }

  async generateGameOverMessage(finalScore: number, playerName: string): Promise<string> {
    const prompt = `
    Créez un message de fin de jeu pour "${playerName}" qui a obtenu un score de ${finalScore}%.
    
    Le message doit :
    - Être encourageant et positif
    - Mentionner le niveau de persuasion atteint
    - Être adapté au score (0-30% : débutant, 31-60% : intermédiaire, 61-80% : avancé, 81-100% : expert)
    - Faire maximum 50 mots
    `;

    return await this.generateResponse(prompt);
  }
}

// Instance globale
export const langChainConfig = new LangChainConfig();


