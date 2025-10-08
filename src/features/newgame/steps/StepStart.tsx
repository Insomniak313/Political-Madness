// Step 4: Start game component
// Shows recap of choices and launches the game

import { audioService } from '../../../services/audioService';
import { phase0StateManager } from '../state';

export class StepStart {
  private container: HTMLElement;
  private stateManager = phase0StateManager;

  constructor() {
    this.container = this.createStep();
  }

  private createStep(): HTMLElement {
    const step = document.createElement('div');
    step.className = 'step-start';
    step.style.cssText = `
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    `;

    // Title
    const title = document.createElement('h2');
    title.innerHTML = `
      <span style="color: white; font-size: 2rem; margin-bottom: 0.5rem; display: block;">
        🚀 Récapitulatif & Lancement
      </span>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem; margin: 0;">
        Vérifiez vos choix avant de commencer le débat
      </p>
    `;

    // Recap card
    const recapCard = this.createRecapCard();
    recapCard.style.marginTop = '2rem';
    recapCard.style.marginBottom = '2rem';

    // Start button
    const startButton = this.createStartButton();

    step.appendChild(title);
    step.appendChild(recapCard);
    step.appendChild(startButton);

    return step;
  }

  private createRecapCard(): HTMLElement {
    const state = this.stateManager.getState();

    const card = document.createElement('div');
    card.style.cssText = `
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1));
      border: 2px solid rgba(34, 197, 94, 0.3);
      border-radius: 16px;
      padding: 2rem;
      text-align: left;
      position: relative;
      overflow: hidden;
    `;

    // Shimmer effect
    const shimmer = document.createElement('div');
    shimmer.style.cssText = `
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
      animation: shimmer 3s infinite;
    `;

    // Content
    const content = document.createElement('div');
    content.style.cssText = `
      position: relative;
      z-index: 1;
    `;

    content.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 0.5rem;">
          👤 Joueur
        </div>
        <div style="color: white; font-size: 1.125rem; font-weight: 600;">
          ${state.playerName}
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 0.5rem;">
          🎯 Difficulté
        </div>
        <div style="color: white; font-size: 1.125rem; font-weight: 600;">
          ${this.getDifficultyLabel(state.difficulty)}
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 0.5rem;">
          📝 Thème
        </div>
        <div style="color: white; font-size: 1.125rem; font-weight: 600;">
          ${this.getThemeLabel(state.theme as string)}
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 0.5rem;">
          💭 Question à débattre
        </div>
        <div style="color: white; font-size: 1rem; font-weight: 500; line-height: 1.4; background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; border-left: 4px solid rgb(59, 130, 246);">
          ${state.question}
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 0.5rem;">
          🛡️ Votre position
        </div>
        <div style="color: white; font-size: 1.125rem; font-weight: 600;">
          ${this.getStanceLabel(state.stance)}
        </div>
      </div>
    `;

    card.appendChild(shimmer);
    card.appendChild(content);

    return card;
  }

  private getDifficultyLabel(difficulty: string): string {
    const labels: Record<string, string> = {
      'facile': '🌟 Facile',
      'moyen': '⚖️ Moyen',
      'difficile': '🔥 Difficile',
      'tres-difficile': '💎 Très Difficile'
    };
    return labels[difficulty] || difficulty;
  }

  private getThemeLabel(theme: string): string {
    const labels: Record<string, string> = {
      'geopolitique': '🌍 Géopolitique',
      'societe': '👥 Société',
      'economie': '💰 Économie',
      'ecologie': '🌱 Écologie',
      'culture': '🎭 Culture'
    };
    return labels[theme] || theme;
  }

  private getStanceLabel(stance: string | null): string {
    if (stance === 'pour') return '👍 Pour';
    if (stance === 'contre') return '👎 Contre';
    return '❓ Non choisi';
  }

  private createStartButton(): HTMLElement {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    `;

    const startButton = document.createElement('button');
    startButton.textContent = 'Lancer la partie';
    startButton.setAttribute('aria-label', 'Commencer le débat avec ces paramètres');
    startButton.style.cssText = `
      background: linear-gradient(135deg, #ec4899 0%, #f97316 100%);
      border: none;
      border-radius: 16px;
      color: white;
      padding: 1rem 2rem;
      font-size: 1.25rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 60px;
      box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3);
      animation: pulse 2s infinite;
    `;

    startButton.innerHTML = `
      <span style="font-size: 1.5rem;">🚀</span>
      <span>Lancer la partie</span>
    `;

    startButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.handleStartGame();
    });

    startButton.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
      startButton.style.transform = 'scale(1.05)';
      startButton.style.boxShadow = '0 15px 35px rgba(236, 72, 153, 0.4)';
    });

    startButton.addEventListener('mouseleave', () => {
      startButton.style.transform = 'scale(1)';
      startButton.style.boxShadow = '0 10px 25px rgba(236, 72, 153, 0.3)';
    });

    buttonContainer.appendChild(startButton);
    return buttonContainer;
  }

  private handleStartGame(): void {
    const state = this.stateManager.getState();

    // Create game config from wizard state
    const gameConfig = {
      playerName: state.playerName,
      difficulty: state.difficulty,
      theme: state.theme,
      aiOpponent: 'centriste' as const, // Default for now
      playerPosition: state.stance!
    };

    // Dispatch event to start the game
    const startGameEvent = new CustomEvent('start-game-from-wizard', {
      detail: gameConfig
    });
    document.dispatchEvent(startGameEvent);
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}