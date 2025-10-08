// Step 3: Question & Position selection component
// Integrates with agent to generate debate ideas and allows stance selection

import { audioService } from '../../../services/audioService';
import { phase0StateManager } from '../state';
import { debateIdeaService } from '../../../agents/debateIdea.service';
import { logger } from '../../../services/logger';
import type { Stance } from '../state';

export class StepStance {
  private container: HTMLElement;
  private stateManager = phase0StateManager;
  private abortController: AbortController | null = null;

  constructor() {
    this.container = this.createStep();
    this.initializeAgentCall();

    // Log entering the screen
    const state = this.stateManager.getState();
    logger.debug('ui:phase0:question', 'enter', {
      theme: state.theme,
      difficulty: state.difficulty
    });
  }

  private createStep(): HTMLElement {
    const step = document.createElement('div');
    step.className = 'step-stance';
    step.style.cssText = `
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    `;

    // Title
    const title = document.createElement('h2');
    title.innerHTML = `
      <span style="color: white; font-size: 2rem; margin-bottom: 0.5rem; display: block;">
        ❓ Question & Position
      </span>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem; margin: 0;">
        L'IA génère une question clivante, choisissez votre position
      </p>
    `;

    // Question card container
    const questionContainer = document.createElement('div');
    questionContainer.style.cssText = `
      margin: 2rem 0;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Stance buttons container
    const stanceContainer = document.createElement('div');
    stanceContainer.style.cssText = `
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 2rem;
    `;

    step.appendChild(title);
    step.appendChild(questionContainer);
    step.appendChild(stanceContainer);

    // Store references for dynamic updates
    (step as any).questionContainer = questionContainer;
    (step as any).stanceContainer = stanceContainer;

    this.updateQuestionDisplay(step);
    this.updateStanceButtons(step);

    return step;
  }

  private async initializeAgentCall(): Promise<void> {
    const state = this.stateManager.getState();

    // If we don't have a question yet, generate one
    if (!state.question) {
      await this.generateQuestion();
    }
  }

  private async generateQuestion(seed?: string | number): Promise<void> {
    const state = this.stateManager.getState();

    // Cancel any ongoing request
    if (this.abortController) {
      this.abortController.abort();
    }

    // Create new abort controller
    this.abortController = debateIdeaService.createAbortController();

    this.stateManager.dispatch({ type: 'SET_LOADING_QUESTION', payload: true });
    this.stateManager.dispatch({ type: 'SET_ERROR_QUESTION', payload: null });

    try {
      const result = await debateIdeaService.generateDebateIdeaWrapped({
        theme: state.theme,
        difficulty: state.difficulty,
        playerName: state.playerName,
        seed: seed,
        signal: this.abortController?.signal,
        timeoutMs: 8000
      });

      this.stateManager.dispatch({ type: 'SET_QUESTION', payload: result.question });

      // If stance is null, randomly assign one
      if (!state.stance) {
        const randomStance = Math.random() < 0.5 ? 'pour' : 'contre';
        this.stateManager.dispatch({ type: 'SET_STANCE', payload: randomStance });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la génération';
      this.stateManager.dispatch({ type: 'SET_ERROR_QUESTION', payload: errorMessage });
    }
  }

  private updateQuestionDisplay(stepElement: HTMLElement): void {
    const state = this.stateManager.getState();
    const questionContainer = (stepElement as any).questionContainer;

    questionContainer.innerHTML = '';

    if (state.loadingQuestion) {
      questionContainer.innerHTML = `
        <div style="
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          animation: pulse 2s infinite;
        ">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🤖</div>
          <div style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem; margin-bottom: 0.5rem;">
            Génération de la question...
          </div>
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">
            L'IA réfléchit à une idée clivante
          </div>
        </div>
      `;
    } else if (state.errorQuestion) {
      questionContainer.innerHTML = `
        <div style="
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
        ">
          <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
          <div style="color: rgb(239, 68, 68); font-size: 1.125rem; margin-bottom: 1rem;">
            Erreur de génération
          </div>
          <div style="color: rgba(239, 68, 68, 0.8); font-size: 0.875rem; margin-bottom: 1.5rem;">
            ${state.errorQuestion}
          </div>
          <button id="retryButton" style="
            background: rgb(239, 68, 68);
            border: none;
            border-radius: 8px;
            color: white;
            padding: 0.75rem 1.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            Réessayer
          </button>
        </div>
      `;

      // Add retry button listener
      const retryButton = questionContainer.querySelector('#retryButton');
      retryButton?.addEventListener('click', () => {
        audioService.playSfx('click');
        this.generateQuestion();
      });

    } else if (state.question) {
      questionContainer.innerHTML = `
        <div style="
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        ">
          <div style="
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
            animation: shimmer 3s infinite;
          "></div>
          <div style="position: relative; z-index: 1;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">💭</div>
            <div style="color: white; font-size: 1.25rem; font-weight: 600; line-height: 1.4; margin-bottom: 1rem;">
              ${state.question}
            </div>
            <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
              Question générée par l'IA
            </div>
          </div>
        </div>
      `;
    }
  }

  private updateStanceButtons(stepElement: HTMLElement): void {
    const state = this.stateManager.getState();
    const stanceContainer = (stepElement as any).stanceContainer;

    stanceContainer.innerHTML = '';

    // Only show stance buttons if we have a question and no error
    if (state.question && !state.errorQuestion) {
      const stanceButtons = this.createStanceButtons();
      stanceContainer.appendChild(stanceButtons);

      const randomButton = this.createRandomStanceButton();
      stanceContainer.appendChild(randomButton);
    }
  }

  private createStanceButtons(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1rem;
    `;

    const pourButton = this.createStanceButton('pour', 'Pour', '👍', 'rgb(34, 197, 94)');
    const contreButton = this.createStanceButton('contre', 'Contre', '👎', 'rgb(239, 68, 68)');

    container.appendChild(pourButton);
    container.appendChild(contreButton);

    return container;
  }

  private createStanceButton(stance: Stance, label: string, icon: string, color: string): HTMLElement {
    if (stance === null) return document.createElement('div');

    const button = document.createElement('button');
    button.className = 'stance-button';
    button.setAttribute('aria-label', `Choisir la position ${label}`);

    const isSelected = this.stateManager.getState().stance === stance;

    button.style.cssText = `
      background: ${isSelected ? color : 'rgba(255, 255, 255, 0.05)'};
      border: 2px solid ${isSelected ? color : 'rgba(255, 255, 255, 0.1)'};
      border-radius: 12px;
      color: ${isSelected ? 'white' : 'rgba(255, 255, 255, 0.9)'};
      padding: 1rem 1.5rem;
      font-size: 1.125rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 60px;
      flex: 1;
      max-width: 200px;
    `;

    button.innerHTML = `
      <span>${icon}</span>
      <span>${label}</span>
    `;

    button.addEventListener('click', () => {
      audioService.playSfx('click');
      this.stateManager.dispatch({ type: 'SET_STANCE', payload: stance });

      // Log stance selection
      logger.debug('ui:phase0:question', 'stance', { value: stance });
    });

    button.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
      if (!isSelected) {
        button.style.transform = 'translateY(-2px)';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (!isSelected) {
        button.style.transform = 'translateY(0)';
      }
    });

    return button;
  }

  private createRandomStanceButton(): HTMLElement {
    const button = document.createElement('button');
    button.innerHTML = `
      <span style="margin-right: 0.5rem;">🎲</span>
      Régénérer la question
    `;
    button.setAttribute('aria-label', 'Régénérer la question');
    button.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.9);
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 44px;
    `;

    button.addEventListener('click', () => {
      audioService.playSfx('click');

      // Generate a random seed for question regeneration
      const newSeed = Math.floor(Math.random() * 1000000);

      // Log reroll action
      logger.debug('ui:phase0:question', 'reroll', { newSeed });

      // Regenerate question with seed
      this.generateQuestion(newSeed);
    });

    button.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });

    return button;
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public destroy(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}