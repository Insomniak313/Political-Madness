import { langChainConfig } from './langchain-config';
import { aiCharacterManager } from './ai-characters';
import type { GameConfig, GameState, ThemeIdeas, OpponentType } from './types';

// Logique principale du jeu Political Madness
class PoliticalMadnessGame {
  public gameState: GameState;
  private themes: ThemeIdeas;

  constructor() {
    this.gameState = {
      playerName: '',
      difficulty: 'moyen',
      theme: 'geopolitique',
      aiOpponent: 'centriste',
      playerPosition: 'pour',
      currentDuel: 1,
      currentExchange: 1,
      maxDuels: 5,
      maxExchanges: 3,
      persuasionScore: 50,
      currentIdea: '',
      exchanges: [],
      isGameActive: false,
      currentAICharacter: null
    };
    
    this.themes = {
      geopolitique: [
        "L'OTAN devrait se dissoudre pour laisser place à une défense européenne autonome",
        "Les sanctions économiques contre la Russie devraient être levées immédiatement",
        "L'Union Européenne devrait accueillir la Turquie comme membre à part entière"
      ],
      societe: [
        "La PMA devrait être interdite",
        "Le port du voile devrait être interdit dans l'espace public",
        "L'immigration devrait être drastiquement réduite"
      ],
      economie: [
        "Le revenu universel devrait être instauré",
        "Les entreprises privées devraient être nationalisées",
        "L'impôt sur le revenu devrait être supprimé"
      ],
      ecologie: [
        "La voiture individuelle devrait être interdite en ville",
        "La viande devrait être taxée comme un produit de luxe",
        "Les vols en avion devraient être limités à 2 par personne et par an"
      ],
      culture: [
        "Les réseaux sociaux devraient être interdits aux mineurs",
        "L'intelligence artificielle devrait remplacer les artistes humains",
        "Les langues régionales devraient être obligatoires à l'école"
      ]
    };
  }

  async initializeGame(config: GameConfig): Promise<void> {
    this.gameState = { ...this.gameState, ...config };
    this.gameState.currentAICharacter = aiCharacterManager.getCharacter(config.aiOpponent);
    this.gameState.isGameActive = true;
    
    await this.generateNewIdea();
    
    // L'utilisateur parle en premier, pas besoin de générer une réponse IA immédiatement
    this.updateUI();
  }

  async generateNewIdea(): Promise<void> {
    try {
      // Use predifined ideas as fallback, but prefer LangChain if available
      if (this.gameState.theme) {
        const themeIdeas = this.themes[this.gameState.theme];
        if (themeIdeas && themeIdeas.length > 0) {
          this.gameState.currentIdea = themeIdeas[Math.floor(Math.random() * themeIdeas.length)];
        }

        if (langChainConfig.isInitialized) {
          try {
            const generatedIdea = await langChainConfig.generateDebateIdea(
              this.gameState.theme,
              this.gameState.difficulty
            );
            this.gameState.currentIdea = generatedIdea;
          } catch (error) {
            console.warn('Erreur LangChain, utilisation de l\'idée prédéfinie:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération de l\'idée:', error);
    }
  }

  async generateAIResponse(playerResponse: string): Promise<void> {
    try {
      let aiResponse = '';
      
      if (langChainConfig.isInitialized && this.gameState.currentAICharacter) {
        try {
          aiResponse = await langChainConfig.generateAIResponse(
            this.gameState.currentAICharacter,
            this.gameState.currentIdea,
            this.gameState.playerPosition,
            playerResponse,
            this.gameState.currentExchange
          );
        } catch (error) {
          console.warn('Erreur LangChain, utilisation de la réponse générique:', error);
          aiResponse = this.generateFallbackResponse();
        }
      } else {
        aiResponse = this.generateFallbackResponse();
      }
      
      this.gameState.exchanges.push({
        exchangeNumber: this.gameState.currentExchange,
        aiResponse: aiResponse,
        playerResponse: playerResponse,
        timestamp: new Date()
      });
      
      this.updatePersuasionScore(aiResponse, playerResponse);
      
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse IA:', error);
    }
  }

  private generateFallbackResponse(): string {
    const responses: Record<OpponentType, string[]> = {
      conservateur: [
        "Je dois respectueusement désapprouver cette proposition. Les traditions et l'ordre établi ont fait leurs preuves.",
        "Cette idée va à l'encontre des valeurs fondamentales de notre société. Nous devons préserver ce qui fonctionne.",
        "Je comprends votre point de vue, mais l'expérience nous enseigne que le changement radical est dangereux."
      ],
      liberal: [
        "Je suis en désaccord avec cette approche. Nous devons embrasser le progrès et l'innovation.",
        "Cette proposition ne correspond pas à mes valeurs de liberté et d'égalité. Nous pouvons faire mieux.",
        "Je respecte votre opinion, mais je crois fermement en un avenir plus ouvert et inclusif."
      ],
      centriste: [
        "Je vois les mérites des deux côtés, mais je pense qu'il faut une approche plus équilibrée.",
        "Cette question est complexe et mérite une analyse nuancée. Ni l'extrême ni l'immobilisme ne sont la solution.",
        "Je comprends votre position, mais peut-être qu'un compromis serait plus constructif."
      ],
      radical: [
        "Cette idée est complètement inacceptable ! Nous devons lutter contre cette injustice !",
        "Je refuse catégoriquement cette proposition. C'est un affront à tout ce en quoi je crois !",
        "Non, non et non ! Nous ne pouvons pas accepter cela ! Il faut agir maintenant !"
      ]
    };
    
    const characterResponses = responses[this.gameState.aiOpponent] || responses.centriste;
    return characterResponses[Math.floor(Math.random() * characterResponses.length)];
  }

  async processPlayerResponse(playerResponse: string): Promise<void> {
    if (!this.gameState.isGameActive) return;
    
    // Générer la réponse de l'IA avec la réponse du joueur
    await this.generateAIResponse(playerResponse);
    
    // Vérifier si c'est le dernier échange du duel
    if (this.gameState.currentExchange >= this.gameState.maxExchanges) {
      await this.endDuel();
    } else {
      // Passer à l'échange suivant
      this.gameState.currentExchange++;
    }
    
    this.updateUI();
  }

  private async endDuel(): Promise<void> {
    await this.generateDuelSummary();
    
    if (this.gameState.currentDuel >= this.gameState.maxDuels) {
      await this.endGame();
    } else {
      this.gameState.currentDuel++;
      this.gameState.currentExchange = 1;
      this.gameState.exchanges = [];
      await this.generateNewIdea();
      // L'utilisateur parle en premier au nouveau duel
    }
  }

  private async generateDuelSummary(): Promise<void> {
    try {
      let summary = '';
      
      if (langChainConfig.isInitialized) {
        try {
          summary = await langChainConfig.generateSummary(
            this.gameState.currentIdea,
            this.gameState.exchanges,
            this.gameState.persuasionScore
          );
        } catch (error) {
          console.warn('Erreur LangChain, utilisation du résumé générique:', error);
          summary = this.generateFallbackSummary();
        }
      } else {
        summary = this.generateFallbackSummary();
      }
      
      this.showSummaryModal(summary);
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
    }
  }

  private generateFallbackSummary(): string {
    const score = this.gameState.persuasionScore;
    let summary = `Duel ${this.gameState.currentDuel} terminé !\n\n`;
    
    if (score > 60) {
      summary += "Vous avez été très convaincant dans ce débat. Vos arguments ont marqué des points face à votre adversaire.";
    } else if (score > 40) {
      summary += "Le débat a été équilibré. Vous avez tenu votre position face à un adversaire compétent.";
    } else {
      summary += "Votre adversaire a été plus persuasif cette fois. Analysez ses arguments pour vous améliorer.";
    }
    
    summary += `\n\nScore de persuasion actuel : ${score}%`;
    return summary;
  }

  private async endGame(): Promise<void> {
    this.gameState.isGameActive = false;
    await this.showGameOverModal();
  }

  private updatePersuasionScore(aiResponse: string, playerResponse: string): void {
    if (!this.gameState.currentAICharacter) return;
    
    const aiImpact = aiCharacterManager.calculatePersuasionImpact(
      this.gameState.currentAICharacter, 
      aiResponse, 
      playerResponse
    );
    
    const scoreChange = aiImpact - 5;
    this.gameState.persuasionScore = Math.max(0, Math.min(100, this.gameState.persuasionScore - scoreChange));
  }

  private updateUI(): void {
    const currentThemeElement = document.getElementById('currentTheme');
    if (currentThemeElement && this.gameState.theme) {
      currentThemeElement.textContent = this.gameState.theme.charAt(0).toUpperCase() + this.gameState.theme.slice(1);
    }
    
    const playerPositionElement = document.getElementById('playerPosition');
    if (playerPositionElement) {
      playerPositionElement.textContent = `Position : ${this.gameState.playerPosition}`;
    }
    
    const currentDuelElement = document.getElementById('currentDuel');
    if (currentDuelElement) {
      currentDuelElement.textContent = this.gameState.currentDuel.toString();
    }
    
    const currentExchangeElement = document.getElementById('currentExchange');
    if (currentExchangeElement) {
      currentExchangeElement.textContent = this.gameState.currentExchange.toString();
    }
    
    const journalistStatementElement = document.getElementById('journalistStatement');
    if (journalistStatementElement) {
      journalistStatementElement.textContent = this.gameState.currentIdea;
    }
    
    const aiOpponentNameElement = document.getElementById('aiOpponentName');
    if (aiOpponentNameElement && this.gameState.currentAICharacter) {
      aiOpponentNameElement.textContent = `${this.gameState.currentAICharacter.avatar} ${this.gameState.currentAICharacter.name}`;
    }
    
    const aiResponseElement = document.getElementById('aiResponse');
    if (this.gameState.exchanges.length > 0) {
      const lastExchange = this.gameState.exchanges[this.gameState.exchanges.length - 1];
      if (aiResponseElement) {
        aiResponseElement.textContent = lastExchange.aiResponse;
      }
    } else {
      // Au début, l'IA attend que l'utilisateur parle
      if (aiResponseElement) {
        aiResponseElement.textContent = "J'attends votre position sur ce sujet...";
      }
    }
    
    this.updatePersuasionGauge();
  }

  private updatePersuasionGauge(): void {
    const score = this.gameState.persuasionScore;
    const bar = document.getElementById('persuasionBar');
    const scoreText = document.getElementById('persuasionScore');
    
    if (bar) {
      bar.style.width = `${score}%`;
      
      if (score < 30) {
        bar.className = 'persuasion-bar bg-gradient-to-r from-red-500 to-red-600 h-4 rounded-full transition-all duration-700 ease-out';
      } else if (score < 70) {
        bar.className = 'persuasion-bar bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-700 ease-out';
      } else {
        bar.className = 'persuasion-bar bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-700 ease-out';
      }
      
      if (score < 20 || score > 80) {
        bar.classList.add('pulse-animation');
      } else {
        bar.classList.remove('pulse-animation');
      }
    }
    
    if (scoreText) {
      scoreText.textContent = `${Math.round(score)}%`;
    }
  }

  private showSummaryModal(summary: string): void {
    const summaryContent = document.getElementById('summaryContent');
    if (summaryContent) {
      summaryContent.textContent = summary;
    }
    
    const summaryModal = document.getElementById('summaryModal');
    if (summaryModal) {
      summaryModal.classList.remove('hidden');
    }
  }

  async showGameOverModal(): Promise<void> {
    const finalScore = this.gameState.persuasionScore;
    let message = '';
    
    if (langChainConfig.isInitialized) {
      try {
        message = await langChainConfig.generateGameOverMessage(finalScore, this.gameState.playerName);
      } catch (error) {
        console.warn('Erreur LangChain, utilisation du message générique:', error);
        message = this.generateFallbackGameOverMessage(finalScore);
      }
    } else {
      message = this.generateFallbackGameOverMessage(finalScore);
    }
    
    const finalScoreElement = document.getElementById('finalScore');
    if (finalScoreElement) {
      finalScoreElement.textContent = message;
    }
    
    const gameOverModal = document.getElementById('gameOverModal');
    if (gameOverModal) {
      gameOverModal.classList.remove('hidden');
    }
  }

  private generateFallbackGameOverMessage(score: number): string {
    if (score >= 80) {
      return `Félicitations ${this.gameState.playerName} ! Vous êtes un expert en persuasion avec ${Math.round(score)}% !`;
    } else if (score >= 60) {
      return `Bien joué ${this.gameState.playerName} ! Vous êtes avancé avec ${Math.round(score)}% !`;
    } else if (score >= 40) {
      return `Pas mal ${this.gameState.playerName} ! Vous êtes intermédiaire avec ${Math.round(score)}% !`;
    } else {
      return `Continuez à vous entraîner ${this.gameState.playerName} ! Vous êtes débutant avec ${Math.round(score)}% !`;
    }
  }

  resetGame(): void {
    this.gameState = {
      playerName: '',
      difficulty: 'moyen',
      theme: 'geopolitique',
      aiOpponent: 'centriste',
      playerPosition: 'pour',
      currentDuel: 1,
      currentExchange: 1,
      maxDuels: 5,
      maxExchanges: 3,
      persuasionScore: 50,
      currentIdea: '',
      exchanges: [],
      isGameActive: false,
      currentAICharacter: null
    };
  }
}

// Instance globale
export const game = new PoliticalMadnessGame();

