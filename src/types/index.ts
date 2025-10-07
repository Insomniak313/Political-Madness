// Types et interfaces pour Political Madness

export interface GameConfig {
  playerName: string;
  difficulty: Difficulty;
  theme: Theme;
  aiOpponent: OpponentType;
  playerPosition: Position;
}

export interface GameState {
  playerName: string;
  difficulty: Difficulty;
  theme: Theme;
  aiOpponent: OpponentType;
  playerPosition: Position;
  currentDuel: number;
  currentExchange: number;
  maxDuels: number;
  maxExchanges: number;
  persuasionScore: number;
  currentIdea: string;
  exchanges: Exchange[];
  isGameActive: boolean;
  currentAICharacter: AICharacter | null;
}

export interface Exchange {
  exchangeNumber: number;
  aiResponse: string;
  playerResponse: string;
  timestamp: Date;
}

export interface AICharacter {
  name: string;
  personality: string;
  communicationStyle: string;
  values: string;
  aggressiveness: number;
  avatar: string;
}

export interface ResponseModifier {
  tone: string;
  intensity: string;
}

export interface GenerationConfig {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
}

export interface ThemeIdeas {
  [key: string]: string[];
}

export type Difficulty = 'facile' | 'moyen' | 'difficile';
export type Theme = 'politique' | 'societe' | 'economie' | 'environnement' | 'sante' | 'education' | 'random';
export type Position = 'pour' | 'contre';
export type OpponentType = 'conservateur' | 'liberal' | 'centriste' | 'radical';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

