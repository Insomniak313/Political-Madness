// UnifiedHeader component for Political-Madness
// Provides a unified header with navigation, audio controls, and context title

import { screenManager, Screen } from '../services/screenManager';
import { audioService } from '../services/audioService';
import { AudioSettings } from './AudioSettings';
import { game } from '../game-logic';

export class UnifiedHeader {
  private header: HTMLElement;
  private backButton!: HTMLButtonElement;
  private quitButton!: HTMLButtonElement;
  private titleElement!: HTMLElement;
  private audioButton!: HTMLButtonElement;
  private audioSettings!: AudioSettings;

  constructor() {
    this.header = this.createHeader();
    this.audioSettings = new AudioSettings();
    this.initializeElements();
    this.attachEventListeners();
    this.updateHeaderForScreen(screenManager.getCurrentScreen());
  }

  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.id = 'unifiedHeader';
    header.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    // Left side - Navigation buttons
    const leftSide = document.createElement('div');
    leftSide.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';

    const backButton = document.createElement('button');
    backButton.id = 'headerBackButton';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
    backButton.setAttribute('aria-label', 'Retour');
    backButton.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    `;

    const quitButton = document.createElement('button');
    quitButton.id = 'headerQuitButton';
    quitButton.innerHTML = '<i class="fas fa-home"></i>';
    quitButton.setAttribute('aria-label', 'Retour au menu principal');
    quitButton.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    `;

    leftSide.appendChild(backButton);
    leftSide.appendChild(quitButton);

    // Center - Title
    const titleElement = document.createElement('h1');
    titleElement.id = 'headerTitle';
    titleElement.style.cssText = `
      color: white;
      font-size: 1.25rem;
      font-weight: 600;
      text-align: center;
      flex: 1;
      margin: 0 1rem;
    `;

    // Right side - Audio button
    const rightSide = document.createElement('div');
    rightSide.style.cssText = 'display: flex; align-items: center;';

    const audioButton = document.createElement('button');
    audioButton.id = 'headerAudioButton';
    audioButton.innerHTML = '<i class="fas fa-music"></i>';
    audioButton.setAttribute('aria-label', 'Paramètres audio');
    audioButton.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1.1rem;
    `;

    rightSide.appendChild(audioButton);

    header.appendChild(leftSide);
    header.appendChild(titleElement);
    header.appendChild(rightSide);

    return header;
  }

  private initializeElements(): void {
    this.backButton = this.header.querySelector('#headerBackButton') as HTMLButtonElement;
    this.quitButton = this.header.querySelector('#headerQuitButton') as HTMLButtonElement;
    this.titleElement = this.header.querySelector('#headerTitle') as HTMLElement;
    this.audioButton = this.header.querySelector('#headerAudioButton') as HTMLButtonElement;
  }

  private attachEventListeners(): void {
    this.backButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.handleBack();
    });

    this.backButton.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
    });

    this.quitButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.handleQuit();
    });

    this.quitButton.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
    });

    this.audioButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.audioSettings.show();
    });

    this.audioButton.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
    });

    // Listen for screen changes
    document.addEventListener('screen-changed', (e: any) => {
      this.updateHeaderForScreen(e.detail.screen);
    });

    // Listen for audio settings changes to update button
    document.addEventListener('audio-settings-changed', () => {
      this.updateAudioButton();
    });

    // Listen for game state changes
    document.addEventListener('game-state-changed', () => {
      if (screenManager.getCurrentScreen() === Screen.GAME) {
        this.updateHeaderForScreen(Screen.GAME);
      }
    });
  }

  private handleBack(): void {
    const currentScreen = screenManager.getCurrentScreen();

    switch (currentScreen) {
      case Screen.OPTIONS:
        screenManager.showScreen(Screen.HOME);
        break;
      case Screen.NEW_GAME:
        screenManager.showScreen(Screen.HOME);
        break;
      case Screen.GAME:
        // For game screen, back could go to home or pause - let's go to home for now
        screenManager.showScreen(Screen.HOME);
        break;
      default:
        screenManager.showScreen(Screen.HOME);
    }
  }

  private handleQuit(): void {
    screenManager.showScreen(Screen.HOME);
  }

  private updateHeaderForScreen(screen: Screen): void {
    switch (screen) {
      case Screen.HOME:
        this.titleElement.textContent = '🗳️ Débat National';
        this.backButton.style.display = 'none';
        this.quitButton.style.display = 'none';
        break;

      case Screen.OPTIONS:
        this.titleElement.textContent = 'Options';
        this.backButton.style.display = 'grid';
        this.quitButton.style.display = 'grid';
        break;

      case Screen.NEW_GAME:
        this.titleElement.textContent = 'Nouvelle Partie';
        this.backButton.style.display = 'grid';
        this.quitButton.style.display = 'grid';
        break;

      case Screen.GAME:
        // Show game context information
        const gameState = this.getGameState();
        if (gameState) {
          const theme = gameState.theme ? gameState.theme.charAt(0).toUpperCase() + gameState.theme.slice(1) : 'Thème';
          const position = `Position: ${gameState.playerPosition}`;
          const duelInfo = `Duel ${gameState.currentDuel}/${gameState.maxDuels}`;
          const exchangeInfo = `Échange ${gameState.currentExchange}/${gameState.maxExchanges}`;

          this.titleElement.innerHTML = `
            <div style="font-size: 0.9rem; opacity: 0.9;">${theme} • ${position}</div>
            <div style="font-size: 0.8rem; opacity: 0.7;">${duelInfo} • ${exchangeInfo}</div>
          `;
        } else {
          this.titleElement.textContent = 'Débat en Cours';
        }
        this.backButton.style.display = 'grid';
        this.quitButton.style.display = 'grid';
        break;

      default:
        this.titleElement.textContent = '🗳️ Débat National';
        this.backButton.style.display = 'none';
        this.quitButton.style.display = 'none';
    }

    this.updateAudioButton();
  }

  private updateAudioButton(): void {
    const icon = this.audioButton.querySelector('i');
    if (icon) {
      const isEnabled = audioService.getMusicEnabled();
      const isPlaying = audioService.getIsMusicPlaying();
      if (!isEnabled) {
        icon.className = 'fas fa-music-slash';
        this.audioButton.style.opacity = '0.5';
      } else if (isPlaying) {
        icon.className = 'fas fa-music';
        this.audioButton.style.opacity = '1';
      } else {
        icon.className = 'fas fa-music';
        this.audioButton.style.opacity = '0.7';
      }
    }
  }

  // Public method to get the header element
  getElement(): HTMLElement {
    return this.header;
  }

  // Public method to show the header
  show(): void {
    this.header.style.display = 'flex';
  }

  // Public method to hide the header
  hide(): void {
    this.header.style.display = 'none';
  }

  // Public method to update for current screen
  updateForCurrentScreen(): void {
    this.updateHeaderForScreen(screenManager.getCurrentScreen());
  }

  // Get current game state
  private getGameState(): any {
    return game.gameState || null;
  }
}

// Create and export singleton instance
export const unifiedHeader = new UnifiedHeader();