// Main wizard component for Phase 0 game configuration
// Mobile-first responsive design with gamified styling

import { audioService } from '../../services/audioService';
import { PrefsService } from '../../services/prefsService';
import { phase0StateManager, Phase0State } from './state';
import { debateIdeaService } from '../../agents/debateIdea.service';

export class NewGameWizard {
  private container: HTMLElement;
  private stateManager = phase0StateManager;
  private unsubscribeState: (() => void) | null = null;
  private isGeneratingQuestion = false; // Flag to prevent duplicate calls

  constructor() {
    this.container = this.createContainer();
    this.initializeState();
    this.attachEventListeners();
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'newGameWizard';
    container.className = 'new-game-wizard';
    container.style.cssText = `
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      display: flex;
      flex-direction: column;
      position: fixed;
      inset: 0;
      z-index: 100;
      overflow: hidden;
    `;

    return container;
  }

  private initializeState(): void {
    // Get player name from preferences
    const playerName = PrefsService.getPlayerName() || 'Joueur';
    this.stateManager.setPlayerName(playerName);

    // Subscribe to state changes
    this.unsubscribeState = this.stateManager.subscribe(() => {
      this.render();
    });

    // Initial render
    this.render();
  }

  private attachEventListeners(): void {
    // Global escape key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleQuit();
      }
    });
  }

  private render(): void {
    const state = this.stateManager.getState();

    this.container.innerHTML = '';

    // Create header
    const header = this.createHeader();
    this.container.appendChild(header);

    // Create main content area
    const mainContent = this.createMainContent(state);
    this.container.appendChild(mainContent);
  }

  private createHeader(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'wizard-header';
    header.style.cssText = `
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1rem 1.5rem;
    `;

    const headerContent = document.createElement('div');
    headerContent.style.cssText = `
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    `;

    // Back button (arrow only)
    const backButton = document.createElement('button');
    backButton.innerHTML = '←';
    backButton.setAttribute('aria-label', 'Retour');
    backButton.style.cssText = `
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0.5rem;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    backButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.handleBack();
    });
    backButton.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
      backButton.style.color = 'rgba(255, 255, 255, 1)';
    });
    backButton.addEventListener('mouseleave', () => {
      backButton.style.color = 'rgba(255, 255, 255, 0.7)';
    });

    // Title
    const titleSection = document.createElement('div');
    titleSection.innerHTML = `
      <h1 style="
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
        margin: 0;
      ">
        Configuration
      </h1>
    `;

    // Quit button
    const quitButton = document.createElement('button');
    quitButton.innerHTML = 'Quitter';
    quitButton.setAttribute('aria-label', 'Quitter la configuration');
    quitButton.style.cssText = `
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 44px;
    `;

    quitButton.addEventListener('click', () => this.handleQuit());
    quitButton.addEventListener('mouseenter', () => audioService.playSfx('hover'));

    headerContent.appendChild(backButton);
    headerContent.appendChild(titleSection);
    headerContent.appendChild(quitButton);
    header.appendChild(headerContent);

    return header;
  }

  private createMainContent(state: Phase0State): HTMLElement {
    const main = document.createElement('main');
    main.className = 'wizard-main';
    main.style.cssText = `
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      overflow-y: auto;
    `;

    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
      max-width: 1400px;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      margin: 0 auto;
    `;

    // Render current step
    const currentStepComponent = this.renderCurrentStep(state);
    contentWrapper.appendChild(currentStepComponent);

    main.appendChild(contentWrapper);
    return main;
  }

  private renderCurrentStep(state: Phase0State): HTMLElement {
    switch (state.step) {
      case 1:
        return this.createDifficultyStep();

      case 2:
        return this.createThemeStep();

      case 3:
        // Trigger question generation when entering step 3 (only if not already generating)
        if (!state.questions && !state.loadingQuestion && !state.errorQuestion && !this.isGeneratingQuestion) {
          this.generateQuestion();
        }
        return this.createQuestionChoiceStep();

      case 4:
        return this.createStanceSelectionStep();

      case 5:
        return this.createStartStep();

      default:
        return this.createFallbackStep('Configuration', 'Préparation du jeu...');
    }
  }

  private createFallbackStep(title: string, description: string): HTMLElement {
    const stepContent = document.createElement('div');
    stepContent.style.cssText = `
      text-align: center;
      padding: 2rem;
    `;

    stepContent.innerHTML = `
      <h2 style="color: white; font-size: 1.5rem; margin-bottom: 1rem;">${title}</h2>
      <p style="color: rgba(255, 255, 255, 0.7);">${description}</p>
    `;

    return stepContent;
  }

  private createDifficultyStep(): HTMLElement {
    const step = document.createElement('div');
    step.style.cssText = `
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    `;

    step.innerHTML = `
      <h2 style="color: white; font-size: 2rem; margin-bottom: 0.5rem;">
        🎯 Choisissez votre difficulté
      </h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem; margin-bottom: 2rem;">
        Plus la difficulté est élevée, plus les débats seront complexes
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; padding: 1rem;">
        <button class="difficulty-btn" data-difficulty="facile" style="
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        ">
          <div style="font-size: 2rem;">🌟</div>
          <div style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem; font-weight: 700;">Facile</div>
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Idées simples</div>
        </button>

        <button class="difficulty-btn" data-difficulty="moyen" style="
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        ">
          <div style="font-size: 2rem;">⚖️</div>
          <div style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem; font-weight: 700;">Moyen</div>
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Équilibré</div>
        </button>

        <button class="difficulty-btn" data-difficulty="difficile" style="
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        ">
          <div style="font-size: 2rem;">🔥</div>
          <div style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem; font-weight: 700;">Difficile</div>
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Complexe</div>
        </button>

        <button class="difficulty-btn" data-difficulty="tres-difficile" style="
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        ">
          <div style="font-size: 2rem;">💎</div>
          <div style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem; font-weight: 700;">Très Difficile</div>
          <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">Expert</div>
        </button>
      </div>

      <button class="random-btn" style="
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
        margin: 1rem auto;
      ">
        <span>🎲</span>
        Choisir aléatoirement
      </button>
    `;

    // Add event listeners with auto-advance
    step.querySelectorAll('.difficulty-btn').forEach((btn: Element) => {
      const button = btn as HTMLButtonElement;
      button.addEventListener('click', () => {
        audioService.playSfx('click');
        const difficulty = button.getAttribute('data-difficulty') as any;

        // Update state
        this.stateManager.dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });

        // Visual feedback - highlight selected button
        step.querySelectorAll('.difficulty-btn').forEach((b: Element) => {
          const otherBtn = b as HTMLButtonElement;
          otherBtn.style.background = 'rgba(255, 255, 255, 0.05)';
          otherBtn.style.border = '2px solid rgba(255, 255, 255, 0.1)';
          const textDivs = otherBtn.querySelectorAll('div');
          textDivs.forEach((div: Element) => {
            (div as HTMLElement).style.color = 'rgba(255, 255, 255, 0.9)';
          });
        });

        // Highlight selected button
        button.style.background = 'linear-gradient(135deg, rgb(59, 130, 246), rgb(29, 78, 216))';
        button.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        const selectedTextDivs = button.querySelectorAll('div');
        selectedTextDivs.forEach((div: Element) => {
          (div as HTMLElement).style.color = 'white';
        });

        // Auto-advance
        this.stateManager.dispatch({ type: 'GO_TO_NEXT_STEP' });
      });
    });

    step.querySelector('.random-btn')?.addEventListener('click', () => {
      audioService.playSfx('click');
      this.stateManager.dispatch({ type: 'RANDOMIZE_DIFFICULTY' });

      // Auto-advance
      this.stateManager.dispatch({ type: 'GO_TO_NEXT_STEP' });
    });

    // Add hover SFX to all buttons
    step.querySelectorAll('.difficulty-btn, .random-btn').forEach((btn: Element) => {
      btn.addEventListener('mouseenter', () => audioService.playSfx('hover'));
    });

    return step;
  }

  private createThemeStep(): HTMLElement {
    const step = document.createElement('div');
    step.style.cssText = `
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    `;

    step.innerHTML = `
      <h2 style="color: white; font-size: 2rem; margin-bottom: 0.5rem;">
        📝 Sélectionnez un thème
      </h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem; margin-bottom: 2rem;">
        Choisissez le domaine qui vous intéresse pour le débat
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; padding: 1rem;">
        <button class="theme-btn" data-theme="geopolitique" style="
          background: ${this.stateManager.getState().theme === 'geopolitique' ? 'linear-gradient(135deg, rgb(59, 130, 246), rgb(99, 102, 241))' : 'rgba(255, 255, 255, 0.05)'};
          border: 2px solid ${this.stateManager.getState().theme === 'geopolitique' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        ">
          <div style="font-size: 2rem;">🌍</div>
          <div style="color: ${this.stateManager.getState().theme === 'geopolitique' ? 'white' : 'rgba(255, 255, 255, 0.9)'}; font-size: 1.125rem; font-weight: 700;">Géopolitique</div>
          <div style="color: ${this.stateManager.getState().theme === 'geopolitique' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'}; font-size: 0.875rem;">International</div>
        </button>

        <button class="theme-btn" data-theme="societe" style="
          background: ${this.stateManager.getState().theme === 'societe' ? 'linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))' : 'rgba(255, 255, 255, 0.05)'};
          border: 2px solid ${this.stateManager.getState().theme === 'societe' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        ">
          <div style="font-size: 2rem;">👥</div>
          <div style="color: ${this.stateManager.getState().theme === 'societe' ? 'white' : 'rgba(255, 255, 255, 0.9)'}; font-size: 1.125rem; font-weight: 700;">Société</div>
          <div style="color: ${this.stateManager.getState().theme === 'societe' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'}; font-size: 0.875rem;">Social</div>
        </button>

        <button class="theme-btn" data-theme="economie" style="
          background: ${this.stateManager.getState().theme === 'economie' ? 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))' : 'rgba(255, 255, 255, 0.05)'};
          border: 2px solid ${this.stateManager.getState().theme === 'economie' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        ">
          <div style="font-size: 2rem;">💰</div>
          <div style="color: ${this.stateManager.getState().theme === 'economie' ? 'white' : 'rgba(255, 255, 255, 0.9)'}; font-size: 1.125rem; font-weight: 700;">Économie</div>
          <div style="color: ${this.stateManager.getState().theme === 'economie' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'}; font-size: 0.875rem;">Financier</div>
        </button>

        <button class="theme-btn" data-theme="ecologie" style="
          background: ${this.stateManager.getState().theme === 'ecologie' ? 'linear-gradient(135deg, rgb(34, 197, 94), rgb(21, 128, 61))' : 'rgba(255, 255, 255, 0.05)'};
          border: 2px solid ${this.stateManager.getState().theme === 'ecologie' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        ">
          <div style="font-size: 2rem;">🌱</div>
          <div style="color: ${this.stateManager.getState().theme === 'ecologie' ? 'white' : 'rgba(255, 255, 255, 0.9)'}; font-size: 1.125rem; font-weight: 700;">Écologie</div>
          <div style="color: ${this.stateManager.getState().theme === 'ecologie' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'}; font-size: 0.875rem;">Environnement</div>
        </button>

        <button class="theme-btn" data-theme="culture" style="
          background: ${this.stateManager.getState().theme === 'culture' ? 'linear-gradient(135deg, rgb(168, 85, 247), rgb(217, 70, 239))' : 'rgba(255, 255, 255, 0.05)'};
          border: 2px solid ${this.stateManager.getState().theme === 'culture' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 16px;
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        ">
          <div style="font-size: 2rem;">🎭</div>
          <div style="color: ${this.stateManager.getState().theme === 'culture' ? 'white' : 'rgba(255, 255, 255, 0.9)'}; font-size: 1.125rem; font-weight: 700;">Culture</div>
          <div style="color: ${this.stateManager.getState().theme === 'culture' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'}; font-size: 0.875rem;">Arts & médias</div>
        </button>
      </div>

      <button class="random-btn" style="
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
        margin: 1rem auto;
      ">
        <span>🎲</span>
        Choisir aléatoirement
      </button>
    `;

    // Add event listeners with auto-advance
    step.querySelectorAll('.theme-btn').forEach((btn: Element) => {
      const button = btn as HTMLButtonElement;
      button.addEventListener('click', () => {
        audioService.playSfx('click');
        const theme = button.getAttribute('data-theme') as any;

        // Update state
        this.stateManager.dispatch({ type: 'SET_THEME', payload: theme });

        // Visual feedback - highlight selected button
        step.querySelectorAll('.theme-btn').forEach((b: Element) => {
          const otherBtn = b as HTMLButtonElement;
          otherBtn.style.background = 'rgba(255, 255, 255, 0.05)';
          otherBtn.style.border = '2px solid rgba(255, 255, 255, 0.1)';
          const textDivs = otherBtn.querySelectorAll('div');
          textDivs.forEach((div: Element) => {
            (div as HTMLElement).style.color = 'rgba(255, 255, 255, 0.9)';
          });
        });

        // Highlight selected button with appropriate gradient
        const gradients: Record<string, string> = {
          'geopolitique': 'linear-gradient(135deg, rgb(59, 130, 246), rgb(99, 102, 241))',
          'societe': 'linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))',
          'economie': 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))',
          'ecologie': 'linear-gradient(135deg, rgb(34, 197, 94), rgb(21, 128, 61))',
          'culture': 'linear-gradient(135deg, rgb(168, 85, 247), rgb(217, 70, 239))'
        };

        button.style.background = gradients[theme] || gradients['geopolitique'];
        button.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        const selectedTextDivs = button.querySelectorAll('div');
        selectedTextDivs.forEach((div: Element) => {
          (div as HTMLElement).style.color = 'white';
        });

        // Auto-advance
        this.stateManager.dispatch({ type: 'GO_TO_NEXT_STEP' });
      });
    });

    step.querySelector('.random-btn')?.addEventListener('click', () => {
      audioService.playSfx('click');
      this.stateManager.dispatch({ type: 'RANDOMIZE_THEME' });

      // Auto-advance
      this.stateManager.dispatch({ type: 'GO_TO_NEXT_STEP' });
    });

    // Add hover SFX to all buttons
    step.querySelectorAll('.theme-btn, .random-btn').forEach((btn: Element) => {
      btn.addEventListener('mouseenter', () => audioService.playSfx('hover'));
    });

    return step;
  }

  private createQuestionChoiceStep(): HTMLElement {
    const step = document.createElement('div');
    step.style.cssText = `
      text-align: center;
      max-width: 1400px;
      margin: 0 auto;
    `;

    const state = this.stateManager.getState();

    step.innerHTML = `
      <h2 style="color: white; font-size: 2rem; margin-bottom: 0.5rem;">
        ❓ Choisissez votre question
      </h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem; margin-bottom: 2rem;">
        Sélectionnez une question parmi celles proposées
      </p>

      <div style="margin: 2rem 0; min-height: 200px; display: flex; align-items: center; justify-content: center;">
        ${state.loadingQuestion ? `
          <div style="background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 2rem; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">🤖</div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem; margin-bottom: 0.5rem;">Génération des questions...</div>
            <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">L'IA réfléchit à des idées clivantes</div>
          </div>
        ` : state.errorQuestion ? `
          <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 2rem; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
            <div style="color: rgb(239, 68, 68); font-size: 1.125rem; margin-bottom: 1rem;">Erreur de génération</div>
            <div style="color: rgba(239, 68, 68, 0.8); font-size: 0.875rem; margin-bottom: 1.5rem;">${state.errorQuestion}</div>
            <button id="retryButton" style="background: rgb(239, 68, 68); border: none; border-radius: 8px; color: white; padding: 0.75rem 1.5rem; font-size: 0.875rem; font-weight: 600; cursor: pointer;">Réessayer</button>
          </div>
        ` : state.questions && state.questions.length > 0 ? `
          <div style="width: 100%; max-width: 800px;">
            <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
              ${state.questions.map((question, index) => `
                <button class="question-btn" data-question-index="${index}" style="
                  background: rgba(255, 255, 255, 0.05);
                  border: 2px solid rgba(255, 255, 255, 0.1);
                  border-radius: 16px;
                  padding: 1.5rem;
                  text-align: left;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  width: 100%;
                ">
                  <div style="font-size: 1.25rem; font-weight: 600; line-height: 1.4; color: white; margin-bottom: 0.5rem;">${question}</div>
                  <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">Question ${index + 1}</div>
                </button>
              `).join('')}
            </div>
          </div>
        ` : `
          <div style="background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 2rem; text-align: center;">
            <div style="color: rgba(255, 255, 255, 0.7);">Aucune question générée</div>
          </div>
        `}
      </div>
    `;

    // Add event listeners
    if (state.questions && state.questions.length > 0 && !state.errorQuestion) {
      step.querySelectorAll('.question-btn').forEach((btn: Element) => {
        const button = btn as HTMLButtonElement;
        button.addEventListener('click', () => {
          audioService.playSfx('click');
          const index = parseInt(button.getAttribute('data-question-index') || '0');
          const selectedQuestion = state.questions![index];

          // Update state
          this.stateManager.dispatch({ type: 'SET_QUESTION', payload: selectedQuestion });
          this.stateManager.dispatch({ type: 'SET_QUESTIONS', payload: null });

          // Go to next step
          this.stateManager.dispatch({ type: 'GO_TO_NEXT_STEP' });
        });

        button.addEventListener('mouseenter', () => {
          audioService.playSfx('hover');
          button.style.background = 'rgba(255, 255, 255, 0.1)';
          button.style.border = '2px solid rgba(255, 255, 255, 0.2)';
        });

        button.addEventListener('mouseleave', () => {
          button.style.background = 'rgba(255, 255, 255, 0.05)';
          button.style.border = '2px solid rgba(255, 255, 255, 0.1)';
        });
      });

      const retryButton = step.querySelector('#retryButton') as HTMLButtonElement;
      retryButton?.addEventListener('click', () => {
        if (!this.isGeneratingQuestion) {
          this.generateQuestion();
        }
      });
      retryButton?.addEventListener('mouseenter', () => audioService.playSfx('hover'));
    }

    return step;
  }

  private createStanceSelectionStep(): HTMLElement {
    const step = document.createElement('div');
    step.style.cssText = `
      text-align: center;
      max-width: 1400px;
      margin: 0 auto;
    `;

    const state = this.stateManager.getState();

    step.innerHTML = `
      <h2 style="color: white; font-size: 2rem; margin-bottom: 0.5rem;">
        🛡️ Choisissez votre position
      </h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem; margin-bottom: 2rem;">
        Défendez-vous cette idée ou allez-vous la contester ?
      </p>

      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)); border: 2px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 2rem; text-align: center; margin-bottom: 2rem;">
        <div style="font-size: 1.25rem; font-weight: 600; line-height: 1.4; color: white;">${state.question}</div>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1rem;">
        <button class="stance-btn" data-stance="pour" style="
          background: ${state.stance === 'pour' ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.05)'};
          border: 2px solid ${state.stance === 'pour' ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 12px;
          color: ${state.stance === 'pour' ? 'white' : 'rgba(255, 255, 255, 0.9)'};
          padding: 1rem 1.5rem;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          max-width: 200px;
        ">
          <span>👍</span>
          <span>Pour</span>
        </button>

        <button class="stance-btn" data-stance="contre" style="
          background: ${state.stance === 'contre' ? 'rgb(239, 68, 68)' : 'rgba(255, 255, 255, 0.05)'};
          border: 2px solid ${state.stance === 'contre' ? 'rgb(239, 68, 68)' : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 12px;
          color: ${state.stance === 'contre' ? 'white' : 'rgba(255, 255, 255, 0.9)'};
          padding: 1rem 1.5rem;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          max-width: 200px;
        ">
          <span>👎</span>
          <span>Contre</span>
        </button>
      </div>

      <button class="random-stance-btn" style="
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
        margin: 0 auto;
      ">
        <span>🎲</span>
        Choisir aléatoirement
      </button>
    `;

    // Add event listeners
    step.querySelectorAll('.stance-btn').forEach((btn: Element) => {
      const button = btn as HTMLButtonElement;
      button.addEventListener('click', () => {
        audioService.playSfx('click');
        const stance = button.getAttribute('data-stance') as any;

        // Update state
        this.stateManager.dispatch({ type: 'SET_STANCE', payload: stance });

        // Visual feedback - highlight selected button
        step.querySelectorAll('.stance-btn').forEach((b: Element) => {
          const otherBtn = b as HTMLButtonElement;
          otherBtn.style.background = 'rgba(255, 255, 255, 0.05)';
          otherBtn.style.border = '2px solid rgba(255, 255, 255, 0.1)';
          const textDivs = otherBtn.querySelectorAll('div, span');
          textDivs.forEach((div: Element) => {
            (div as HTMLElement).style.color = 'rgba(255, 255, 255, 0.9)';
          });
        });

        // Highlight selected button
        const colors: Record<string, string> = {
          'pour': 'rgb(34, 197, 94)',
          'contre': 'rgb(239, 68, 68)'
        };

        button.style.background = colors[stance] || colors['pour'];
        button.style.border = `2px solid ${colors[stance]}`;
        const selectedTextDivs = button.querySelectorAll('div, span');
        selectedTextDivs.forEach((div: Element) => {
          (div as HTMLElement).style.color = 'white';
        });

        // Go to next step
        this.stateManager.dispatch({ type: 'GO_TO_NEXT_STEP' });
      });
    });

    step.querySelector('.random-stance-btn')?.addEventListener('click', () => {
      audioService.playSfx('click');
      this.stateManager.dispatch({ type: 'RANDOMIZE_STANCE' });

      // Go to next step
      this.stateManager.dispatch({ type: 'GO_TO_NEXT_STEP' });
    });

    // Add hover SFX to all buttons
    step.querySelectorAll('.stance-btn, .random-stance-btn').forEach((btn: Element) => {
      btn.addEventListener('mouseenter', () => audioService.playSfx('hover'));
    });

    return step;
  }

  private createStartStep(): HTMLElement {
    const step = document.createElement('div');
    step.style.cssText = `
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    `;

    const state = this.stateManager.getState();
    step.innerHTML = `
      <h2 style="color: white; font-size: 2rem; margin-bottom: 0.5rem;">
        🚀 Récapitulatif & Lancement
      </h2>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem; margin-bottom: 2rem;">
        Vérifiez vos choix avant de commencer le débat
      </p>

      <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1)); border: 2px solid rgba(34, 197, 94, 0.3); border-radius: 16px; padding: 2rem; text-align: left; margin-bottom: 2rem;">
        <div style="margin-bottom: 1.5rem;">
          <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 0.5rem;">👤 Joueur</div>
          <div style="color: white; font-size: 1.125rem; font-weight: 600;">${state.playerName}</div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 0.5rem;">🎯 Difficulté</div>
          <div style="color: white; font-size: 1.125rem; font-weight: 600;">${this.getDifficultyLabel(state.difficulty)}</div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 0.5rem;">📝 Thème</div>
          <div style="color: white; font-size: 1.125rem; font-weight: 600;">${this.getThemeLabel(state.theme)}</div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 0.5rem;">💭 Question à débattre</div>
          <div style="color: white; font-size: 1rem; font-weight: 500; line-height: 1.4; background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 8px; border-left: 4px solid rgb(59, 130, 246);">${state.question}</div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <div style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 0.5rem;">🛡️ Votre position</div>
          <div style="color: white; font-size: 1.125rem; font-weight: 600;">${this.getStanceLabel(state.stance)}</div>
        </div>
      </div>

      <button class="start-btn" style="
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
        margin: 0 auto;
        box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3);
      ">
        <span style="font-size: 1.5rem;">🚀</span>
        <span>Lancer la partie</span>
      </button>
    `;

    step.querySelector('.start-btn')?.addEventListener('click', () => {
      audioService.playSfx('click');
      this.handleStartGame();
    });

    // Add hover SFX to start button
    step.querySelector('.start-btn')?.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
    });

    return step;
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

  private getThemeLabel(theme: string | null): string {
    if (theme === null) return 'Non choisi';
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



  public getElement(): HTMLElement {
    return this.container;
  }

  public destroy(): void {
    if (this.unsubscribeState) {
      this.unsubscribeState();
    }
  }

  private handleQuit(): void {
    audioService.playSfx('click');
    // Reset wizard state before quitting
    this.stateManager.dispatch({ type: 'RESET_WIZARD' });
    // Navigate back to home
    const homeEvent = new CustomEvent('navigate-to-home');
    document.dispatchEvent(homeEvent);
  }

  private handleBack(): void {
    audioService.playSfx('click');
    this.stateManager.dispatch({ type: 'GO_TO_PREVIOUS_STEP' });
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

  private async generateQuestion(): Promise<void> {
    // Prevent duplicate calls
    if (this.isGeneratingQuestion) {
      return;
    }

    const state = this.stateManager.getState();

    this.isGeneratingQuestion = true;
    this.stateManager.dispatch({ type: 'SET_LOADING_QUESTION', payload: true });
    this.stateManager.dispatch({ type: 'SET_ERROR_QUESTION', payload: null });

    try {
      console.log('Wizard: Starting question generation (3 questions)');

      // Generate 3 questions
      const questions: string[] = [];
      for (let i = 0; i < 3; i++) {
        console.log(`Wizard: Generating question ${i + 1}/3`);
        const result = await debateIdeaService.generateDebateIdeaWrapped({
          theme: state.theme!,
          difficulty: state.difficulty,
          playerName: state.playerName,
          signal: undefined, // No abort signal for now
          timeoutMs: 8000
        });
        questions.push(result.question);
      }

      console.log('Wizard: All questions generated successfully:', questions);
      this.stateManager.dispatch({ type: 'SET_QUESTIONS', payload: questions });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la génération';
      this.stateManager.dispatch({ type: 'SET_ERROR_QUESTION', payload: errorMessage });
    } finally {
      this.isGeneratingQuestion = false;
    }
  }
}