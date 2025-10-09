// HomeMenu component for Political-Madness
// Main gamified home screen with navigation and audio controls

import { screenManager, Screen } from '../services/screenManager';
import { audioService } from '../services/audioService';

export class HomeMenu {
  private homeScreen: HTMLElement;
  private newGameButton!: HTMLButtonElement;
  private optionsButton!: HTMLButtonElement;

  constructor() {
    this.homeScreen = this.createHomeScreen();
    this.initializeElements();
    this.attachEventListeners();
  }

  private createHomeScreen(): HTMLElement {

    const screen = document.createElement('div');
    screen.id = 'homeMenuContent';
    screen.className = 'home-menu-content';
    screen.style.cssText = `
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 50;
    `;

    // Create the content
    const content = document.createElement('div');
    content.className = 'glass-panel';
    content.style.cssText = `
      max-width: 680px;
      width: 92vw;
      text-align: center;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;

    // Brand Area
    const brandDiv = document.createElement('div');
    brandDiv.style.marginBottom = '2rem';

    const title = document.createElement('h1');
    title.textContent = '🗳️ Débat National';
    title.style.cssText = `
      font-size: 2.5rem;
      font-weight: bold;
      color: white;
      margin-bottom: 0.5rem;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    `;

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Affrontez l\'IA dans l\'arène politique';
    subtitle.style.cssText = `
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.125rem;
    `;

    brandDiv.appendChild(title);
    brandDiv.appendChild(subtitle);

    // Buttons container
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    `;

    // New Game Button
    const newGameButton = document.createElement('button');
    newGameButton.id = 'newGameButton';
    newGameButton.textContent = 'Nouvelle partie';
    newGameButton.setAttribute('aria-label', 'Commencer une nouvelle partie');
    newGameButton.style.cssText = `
      width: 100%;
      padding: 1rem 2rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      background: linear-gradient(135deg, #ec4899 0%, #f97316 100%);
      border: none;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 60px;
    `;

    // Options Button
    const optionsButton = document.createElement('button');
    optionsButton.id = 'optionsButton';
    optionsButton.textContent = 'Options';
    optionsButton.setAttribute('aria-label', 'Accéder aux options');
    optionsButton.style.cssText = `
      width: 100%;
      padding: 1rem 2rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 60px;
    `;

    buttonsDiv.appendChild(newGameButton);
    buttonsDiv.appendChild(optionsButton);

    // Footer with version
    const footerDiv = document.createElement('div');
    footerDiv.style.cssText = `
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    `;

    const version = document.createElement('span');
    version.textContent = 'v1.0';
    version.style.cssText = `
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
    `;

    footerDiv.appendChild(version);

    // Assemble everything
    content.appendChild(brandDiv);
    content.appendChild(buttonsDiv);
    content.appendChild(footerDiv);
    screen.appendChild(content);

    return screen;
  }

  private initializeElements(): void {
    this.newGameButton = this.homeScreen.querySelector('#newGameButton') as HTMLButtonElement;
    this.optionsButton = this.homeScreen.querySelector('#optionsButton') as HTMLButtonElement;
  }

  private attachEventListeners(): void {
    // New Game Button
    this.newGameButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.handleNewGame();
    });

    this.newGameButton.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
    });

    // Options Button
    this.optionsButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.handleOptions();
    });

    this.optionsButton.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
    });
  }

  private handleNewGame(): void {
    // Navigate to the new game wizard
    screenManager.showScreen(Screen.NEW_GAME);
  }

  private handleOptions(): void {
    // Navigate to options screen
    screenManager.showScreen(Screen.OPTIONS);
  }

  // Public method to show the home menu
  show(): void {
    screenManager.showScreen(Screen.HOME);
    // Start playing background music if enabled
    if (audioService.getMusicEnabled()) {
      audioService.playBgm();
    }
  }

  // Public method to get the home screen element
  getElement(): HTMLElement {
    return this.homeScreen;
  }
}

// Create and export singleton instance
export const homeMenu = new HomeMenu();