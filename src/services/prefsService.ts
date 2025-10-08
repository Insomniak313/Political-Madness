// Preferences service for Political-Madness
// Manages localStorage for player name and audio settings

export interface AudioPrefs {
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

const STORAGE_KEYS = {
  PLAYER_NAME: 'pm_playerName',
  AUDIO_PREFS: 'pm_audio'
} as const;

const DEFAULT_AUDIO_PREFS: AudioPrefs = {
  musicEnabled: true,
  sfxEnabled: true
};

export class PrefsService {
  // Player Name Management
  static getPlayerName(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
      return stored ? stored.trim() : '';
    } catch (error) {
      console.warn('Failed to read player name from localStorage:', error);
      return '';
    }
  }

  static setPlayerName(name: string): void {
    try {
      const trimmedName = name.trim();
      if (trimmedName) {
        localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, trimmedName);
      } else {
        localStorage.removeItem(STORAGE_KEYS.PLAYER_NAME);
      }
    } catch (error) {
      console.warn('Failed to save player name to localStorage:', error);
    }
  }

  // Audio Preferences Management
  static getAudioPrefs(): AudioPrefs {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIO_PREFS);
      if (stored) {
        const parsed = JSON.parse(stored) as AudioPrefs;
        // Validate the parsed object has required properties
        if (typeof parsed.musicEnabled === 'boolean' && typeof parsed.sfxEnabled === 'boolean') {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to read audio preferences from localStorage:', error);
    }
    return { ...DEFAULT_AUDIO_PREFS };
  }

  static setAudioPrefs(prefs: AudioPrefs): void {
    try {
      // Validate the prefs object
      const validatedPrefs: AudioPrefs = {
        musicEnabled: Boolean(prefs.musicEnabled),
        sfxEnabled: Boolean(prefs.sfxEnabled)
      };
      localStorage.setItem(STORAGE_KEYS.AUDIO_PREFS, JSON.stringify(validatedPrefs));
    } catch (error) {
      console.warn('Failed to save audio preferences to localStorage:', error);
    }
  }

  static setMusicEnabled(enabled: boolean): void {
    const currentPrefs = this.getAudioPrefs();
    this.setAudioPrefs({ ...currentPrefs, musicEnabled: enabled });
  }

  static setSfxEnabled(enabled: boolean): void {
    const currentPrefs = this.getAudioPrefs();
    this.setAudioPrefs({ ...currentPrefs, sfxEnabled: enabled });
  }

  // Utility method to clear all preferences (useful for testing)
  static clearAllPrefs(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear preferences from localStorage:', error);
    }
  }
}