// Screen management system for Political-Madness
// Simple navigation system for the vanilla JS architecture

export enum Screen {
  HOME = 'home',
  OPTIONS = 'options',
  NEW_GAME = 'newGame',
  GAME_CONFIG = 'gameConfig',
  GAME = 'game'
}

export class ScreenManager {
  private currentScreen: Screen = Screen.HOME;
  private screenElements: Map<Screen, HTMLElement> = new Map();

  constructor() {
    this.initializeScreens();
  }

  private initializeScreens(): void {
    // Map screen enum values to DOM elements
    this.screenElements.set(Screen.HOME, this.getElement('homeScreen'));
    this.screenElements.set(Screen.OPTIONS, this.getElement('optionsScreen'));
    this.screenElements.set(Screen.NEW_GAME, this.getElement('newGameScreen'));
    this.screenElements.set(Screen.GAME_CONFIG, this.getElement('splashScreen'));
    this.screenElements.set(Screen.GAME, this.getElement('gameScreen'));
  }

  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Screen element with id '${id}' not found`);
    }
    return element;
  }

  showScreen(screen: Screen): void {
    // Hide all screens first
    this.screenElements.forEach((element) => {
      element.classList.add('hidden');
    });

    // Show the requested screen
    const targetScreen = this.screenElements.get(screen);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
      this.currentScreen = screen;
    }
  }

  hideScreen(screen: Screen): void {
    const element = this.screenElements.get(screen);
    if (element) {
      element.classList.add('hidden');
    }
  }

  getCurrentScreen(): Screen {
    return this.currentScreen;
  }

  hideAllScreens(): void {
    this.screenElements.forEach((element) => {
      element.classList.add('hidden');
    });
  }

  // Utility method to check if a screen is currently visible
  isScreenVisible(screen: Screen): boolean {
    const element = this.screenElements.get(screen);
    return element ? !element.classList.contains('hidden') : false;
  }
}

// Export a singleton instance
export const screenManager = new ScreenManager();