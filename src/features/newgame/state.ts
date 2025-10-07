// State management for the NewGameWizard
// Local reducer-based state management for the wizard flow

import type { Difficulty, Theme } from '../../types';

export type Stance = 'pour' | 'contre' | null;

export interface Phase0State {
  step: 1 | 2 | 3 | 4 | 5;
  playerName: string; // from Options, fallback "Joueur"
  difficulty: Difficulty; // default 'moyen'
  theme: Theme; // default null
  questions: string[] | null; // set by agent at step 3
  question: string | null; // chosen by user at step 3
  stance: Stance; // default null
  loadingQuestion: boolean;
  errorQuestion: string | null;
}

export type Phase0Action =
  | { type: 'SET_STEP'; payload: 1 | 2 | 3 | 4 | 5 }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_QUESTIONS'; payload: string[] | null }
  | { type: 'SET_QUESTION'; payload: string }
  | { type: 'SET_STANCE'; payload: Stance }
  | { type: 'SET_LOADING_QUESTION'; payload: boolean }
  | { type: 'SET_ERROR_QUESTION'; payload: string | null }
  | { type: 'RANDOMIZE_DIFFICULTY' }
  | { type: 'RANDOMIZE_THEME' }
  | { type: 'RANDOMIZE_QUESTION' }
  | { type: 'RANDOMIZE_STANCE' }
  | { type: 'RESET_WIZARD' }
  | { type: 'GO_TO_PREVIOUS_STEP' }
  | { type: 'GO_TO_NEXT_STEP' };

const initialState: Phase0State = {
  step: 1,
  playerName: 'Joueur', // Will be set from Options service
  difficulty: 'moyen', // Default but will be overridden by user selection
  theme: null, // No default theme
  questions: null,
  question: null,
  stance: null, // No default stance
  loadingQuestion: false,
  errorQuestion: null,
};

/**
 * Reducer for the Phase 0 wizard state
 */
export function phase0Reducer(state: Phase0State, action: Phase0Action): Phase0State {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };

    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };

    case 'SET_QUESTION':
      return {
        ...state,
        question: action.payload,
        loadingQuestion: false,
        errorQuestion: null
      };

    case 'SET_STANCE':
      return { ...state, stance: action.payload };

    case 'SET_LOADING_QUESTION':
      return { ...state, loadingQuestion: action.payload };

    case 'SET_ERROR_QUESTION':
      return {
        ...state,
        errorQuestion: action.payload,
        loadingQuestion: false
      };

    case 'RANDOMIZE_DIFFICULTY': {
      const difficulties: Difficulty[] = ['facile', 'moyen', 'difficile', 'tres-difficile'];
      const currentIndex = difficulties.indexOf(state.difficulty);
      let newIndex = currentIndex;

      // Ensure we get a different difficulty
      do {
        newIndex = Math.floor(Math.random() * difficulties.length);
      } while (newIndex === currentIndex && difficulties.length > 1);

      return { ...state, difficulty: difficulties[newIndex] };
    }

    case 'RANDOMIZE_THEME': {
      const themes: Theme[] = ['geopolitique', 'societe', 'economie', 'ecologie', 'culture'];
      const currentIndex = themes.indexOf(state.theme);
      let newIndex = currentIndex;

      // Ensure we get a different theme
      do {
        newIndex = Math.floor(Math.random() * themes.length);
      } while (newIndex === currentIndex && themes.length > 1);

      return { ...state, theme: themes[newIndex] };
    }

    case 'RANDOMIZE_QUESTION':
      // Keep the same theme, just regenerate the question
      return {
        ...state,
        question: null,
        stance: null,
        loadingQuestion: true,
        errorQuestion: null
      };

    case 'RANDOMIZE_STANCE':
      // Randomly choose between 'pour' and 'contre' if question exists
      if (state.question) {
        const newStance = Math.random() < 0.5 ? 'pour' : 'contre';
        return { ...state, stance: newStance };
      }
      return state;

    case 'RESET_WIZARD':
      return { ...initialState, playerName: state.playerName };

    case 'GO_TO_PREVIOUS_STEP':
      if (state.step > 1) {
        return { ...state, step: (state.step - 1) as 1 | 2 | 3 | 4 };
      }
      return state;

    case 'GO_TO_NEXT_STEP':
      if (state.step < 5) {
        return { ...state, step: (state.step + 1) as 1 | 2 | 3 | 4 | 5 };
      }
      return state;

    default:
      return state;
  }
}

/**
 * Custom hook for wizard state management
 */
export class Phase0StateManager {
  private state: Phase0State;
  private listeners: Set<(state: Phase0State) => void> = new Set();

  constructor(initialPlayerName: string = 'Joueur') {
    this.state = { ...initialState, playerName: initialPlayerName };
  }

  getState(): Phase0State {
    return { ...this.state };
  }

  dispatch(action: Phase0Action): void {
    this.state = phase0Reducer(this.state, action);
    this.notifyListeners();
  }

  subscribe(listener: (state: Phase0State) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Convenience methods for common actions
  setPlayerName(name: string): void {
    this.state.playerName = name;
    this.notifyListeners();
  }

  canProceedToNextStep(): boolean {
    switch (this.state.step) {
      case 1:
        return true; // Difficulty is always set
      case 2:
        return this.state.theme !== null; // Theme must be selected
      case 3:
        return this.state.question !== null;
      case 4:
        return this.state.stance !== null;
      case 5:
        return true; // Recap step, can always proceed
      default:
        return false;
    }
  }

  canGoToPreviousStep(): boolean {
    return this.state.step > 1;
  }

  isFirstStep(): boolean {
    return this.state.step === 1;
  }

  isLastStep(): boolean {
    return this.state.step === 5;
  }
}

// Export singleton instance
export const phase0StateManager = new Phase0StateManager();