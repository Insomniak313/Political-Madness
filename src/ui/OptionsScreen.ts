// OptionsScreen component for Political-Madness
// Simple screen for player name configuration

import { screenManager, Screen } from '../services/screenManager';
import { audioService } from '../services/audioService';
import { PrefsService } from '../services/prefsService';

export class OptionsScreen {
  private optionsScreen: HTMLElement;
  private playerNameInput!: HTMLInputElement;
  private saveButton!: HTMLButtonElement;
  private backButton!: HTMLButtonElement;
  private helperText!: HTMLElement;

  constructor() {
    this.optionsScreen = this.createOptionsScreen();
    this.initializeElements();
    this.attachEventListeners();
    this.loadCurrentSettings();
  }

  private createOptionsScreen(): HTMLElement {
    const screen = document.createElement('div');
    screen.id = 'optionsScreen';
    screen.className = 'fixed inset-0 gradient-bg flex items-center justify-center p-4 z-50';

    screen.innerHTML = `
      <div class="glass-panel max-w-md w-full">
        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-2">Options</h2>
          <p class="text-white/80">Configurez votre profil</p>
        </div>

        <!-- Player Name Section -->
        <div class="mb-8">
          <label for="playerNameInput" class="block text-white text-sm font-medium mb-2">
            Nom du joueur
          </label>
          <input
            type="text"
            id="playerNameInput"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            placeholder="Entrez votre nom"
            maxlength="24"
          >
          <div id="helperText" class="text-white/60 text-sm mt-2"></div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button id="saveButton" class="game-button primary w-full" aria-label="Sauvegarder les paramètres">
            <span class="button-text">Sauvegarder</span>
          </button>
          <button id="backButton" class="game-button secondary w-full" aria-label="Retourner au menu principal">
            <span class="button-text">Retour</span>
          </button>
        </div>
      </div>
    `;

    return screen;
  }

  private initializeElements(): void {
    this.playerNameInput = this.optionsScreen.querySelector('#playerNameInput') as HTMLInputElement;
    this.saveButton = this.optionsScreen.querySelector('#saveButton') as HTMLButtonElement;
    this.backButton = this.optionsScreen.querySelector('#backButton') as HTMLButtonElement;
    this.helperText = this.optionsScreen.querySelector('#helperText') as HTMLElement;
  }

  private attachEventListeners(): void {
    // Player name input validation
    this.playerNameInput.addEventListener('input', () => {
      this.validatePlayerName();
    });

    // Save button
    this.saveButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.handleSave();
    });

    this.saveButton.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
    });

    // Back button
    this.backButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.handleBack();
    });

    this.backButton.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
    });

    // Enter key to save
    this.playerNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleSave();
      }
    });
  }

  private loadCurrentSettings(): void {
    const currentName = PrefsService.getPlayerName();
    this.playerNameInput.value = currentName;
    this.validatePlayerName();
  }

  private validatePlayerName(): void {
    const name = this.playerNameInput.value.trim();
    const isValid = name.length > 0 && name.length <= 24;

    // Update helper text
    if (name.length === 0) {
      this.helperText.textContent = 'Le nom ne peut pas être vide';
      this.helperText.className = 'text-white/60 text-sm mt-2';
    } else if (name.length > 24) {
      this.helperText.textContent = `Nom trop long (${name.length}/24 caractères)`;
      this.helperText.className = 'text-yellow-300 text-sm mt-2';
    } else {
      this.helperText.textContent = 'Nom valide ✓';
      this.helperText.className = 'text-green-300 text-sm mt-2';
    }

    // Update save button state
    this.saveButton.disabled = !isValid;
    this.saveButton.classList.toggle('opacity-50', !isValid);
    this.saveButton.classList.toggle('cursor-not-allowed', !isValid);
  }

  private handleSave(): void {
    const name = this.playerNameInput.value.trim();

    if (name && name.length <= 24) {
      PrefsService.setPlayerName(name);
      // Show success feedback
      this.showSuccessMessage();

      // Auto-return to home after a short delay
      setTimeout(() => {
        this.handleBack();
      }, 1500);
    }
  }

  private showSuccessMessage(): void {
    const name = PrefsService.getPlayerName();
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[60] fade-in';
    notification.textContent = `Nom sauvegardé: ${name}`;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 2000);
  }

  private handleBack(): void {
    // Return to home screen
    screenManager.showScreen(Screen.HOME);
  }

  // Public method to show the options screen
  show(): void {
    screenManager.showScreen(Screen.OPTIONS);
    // Focus the input for better UX
    setTimeout(() => {
      this.playerNameInput.focus();
    }, 100);
  }

  // Public method to get the options screen element
  getElement(): HTMLElement {
    return this.optionsScreen;
  }
}

// Create and export singleton instance
export const optionsScreen = new OptionsScreen();