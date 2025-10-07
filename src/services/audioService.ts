// Audio service for Political-Madness
// Manages background music and sound effects

import { PrefsService } from './prefsService';

export class AudioService {
  private bgm: HTMLAudioElement | null = null;
  private sfxCache: Map<string, HTMLAudioElement> = new Map();
  private isInitialized = false;
  private hasUserInteracted = false;

  constructor() {
    this.setupAutoplayPolicy();
  }

  private setupAutoplayPolicy(): void {
    // Listen for first user interaction to enable autoplay
    const enableAutoplay = () => {
      this.hasUserInteracted = true;
      document.removeEventListener('click', enableAutoplay);
      document.removeEventListener('keydown', enableAutoplay);
      document.removeEventListener('touchstart', enableAutoplay);
    };

    document.addEventListener('click', enableAutoplay);
    document.addEventListener('keydown', enableAutoplay);
    document.addEventListener('touchstart', enableAutoplay);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadBgm();
      await this.preloadSfx();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio service:', error);
    }
  }

  private async loadBgm(): Promise<void> {
    if (!this.bgm) {
      this.bgm = new Audio('/audio/bgm_loop.mp3');
      this.bgm.loop = true;
      this.bgm.volume = 0.4;
      this.bgm.preload = 'auto';

      // Handle loading errors gracefully
      this.bgm.addEventListener('error', (e) => {
        console.warn('Failed to load background music:', e);
        this.bgm = null;
      });
    }
  }

  private async preloadSfx(): Promise<void> {
    const sfxFiles = [
      { key: 'hover', url: '/audio/ui_hover.wav' },
      { key: 'click', url: '/audio/ui_click.wav' }
    ];

    for (const { key, url } of sfxFiles) {
      try {
        const audio = new Audio(url);
        audio.volume = 0.6;
        audio.preload = 'auto';

        // Cache the audio element
        this.sfxCache.set(key, audio);
      } catch (error) {
        console.warn(`Failed to preload SFX ${key}:`, error);
      }
    }
  }

  playBgm(): void {
    if (!this.bgm || !PrefsService.getAudioPrefs().musicEnabled) return;

    if (this.hasUserInteracted) {
      this.bgm.play().catch(error => {
        console.warn('Failed to play background music:', error);
      });
    }
  }

  stopBgm(): void {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
  }

  playSfx(type: 'hover' | 'click'): void {
    if (!PrefsService.getAudioPrefs().sfxEnabled) return;

    const sfx = this.sfxCache.get(type);
    if (sfx) {
      // Create a new instance each time to allow overlapping sounds
      const sfxInstance = sfx.cloneNode() as HTMLAudioElement;
      sfxInstance.volume = sfx.volume;

      sfxInstance.play().catch(error => {
        console.warn(`Failed to play SFX ${type}:`, error);
      });
    }
  }

  setMusicEnabled(enabled: boolean): void {
    PrefsService.setMusicEnabled(enabled);

    if (enabled) {
      this.playBgm();
    } else {
      this.stopBgm();
    }
  }

  setSfxEnabled(enabled: boolean): void {
    PrefsService.setSfxEnabled(enabled);
  }

  getMusicEnabled(): boolean {
    return PrefsService.getAudioPrefs().musicEnabled;
  }

  getSfxEnabled(): boolean {
    return PrefsService.getAudioPrefs().sfxEnabled;
  }

  // Update volume for all audio elements
  setMasterVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));

    if (this.bgm) {
      this.bgm.volume = clampedVolume * 0.4; // BGM is always quieter
    }

    // Update SFX volumes
    this.sfxCache.forEach(sfx => {
      sfx.volume = clampedVolume * 0.6;
    });
  }

  // Cleanup method
  destroy(): void {
    this.stopBgm();
    this.sfxCache.clear();
    this.bgm = null;
  }
}

// Export singleton instance
export const audioService = new AudioService();