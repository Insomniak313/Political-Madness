// Audio service for Political-Madness
// Manages background music and sound effects

import { PrefsService } from './prefsService';

export class AudioService {
  private playlist: string[] = ['/audio/bgm_loop.mp3', '/audio/bgm_loop-2.mp3'];
  private currentTrackIndex: number = -1;
  private bgm: HTMLAudioElement | null = null;
  private sfxCache: Map<string, HTMLAudioElement> = new Map();
  private isInitialized = false;
  private hasUserInteracted = false;
  private isMusicPlaying = false;

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
      await this.loadPlaylist();
      await this.preloadSfx();
      this.isInitialized = true;
    } catch (error) {
      // Ignore initialization errors
    }
  }

  private async loadPlaylist(): Promise<void> {
    // Get saved track index or choose random
    const savedIndex = PrefsService.getMusicTrackIndex();
    this.currentTrackIndex = savedIndex >= 0 ? savedIndex : Math.floor(Math.random() * this.playlist.length);

    // Load the initial track
    await this.loadTrack(this.currentTrackIndex);
  }

  private async loadTrack(index: number): Promise<void> {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.removeEventListener('ended', this.onTrackEnd);
    }

    const trackUrl = this.playlist[index];
    this.bgm = new Audio(trackUrl);
    this.bgm.loop = false; // We'll handle looping manually
    this.bgm.volume = PrefsService.getMusicVolume();
    this.bgm.preload = 'auto';

    // Handle track end
    this.bgm.addEventListener('ended', this.onTrackEnd);

    // Handle loading errors gracefully
    this.bgm.addEventListener('error', () => {
      this.bgm = null;
      // Try next track
      this.nextTrack();
    });
  }

  private onTrackEnd = (): void => {
    this.nextTrack();
  }

  private nextTrack(): void {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    PrefsService.setMusicTrackIndex(this.currentTrackIndex);
    this.loadTrack(this.currentTrackIndex).then(() => {
      if (this.hasUserInteracted && PrefsService.getAudioPrefs().musicEnabled) {
        this.playBgm();
      }
    });
  }

  private async preloadSfx(): Promise<void> {
    const sfxFiles = [
      { key: 'hover', url: '/audio/ui_hover.wav' },
      { key: 'click', url: '/audio/ui_click.wav' }
    ];

    for (const { key, url } of sfxFiles) {
      try {
        const audio = new Audio(url);
        audio.volume = PrefsService.getSfxVolume();
        audio.preload = 'auto';

        // Cache the audio element
        this.sfxCache.set(key, audio);
      } catch (error) {
        // Ignore preload errors
      }
    }
  }

  playBgm(): void {
    if (!this.bgm || !PrefsService.getAudioPrefs().musicEnabled) return;

    if (this.hasUserInteracted) {
      this.bgm.play().then(() => {
        this.isMusicPlaying = true;
      }).catch(() => {
        // Ignore play errors
      });
    }
  }

  stopBgm(): void {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
      this.isMusicPlaying = false;
    }
  }

  playSfx(type: 'hover' | 'click'): void {
    if (!PrefsService.getAudioPrefs().sfxEnabled) return;

    const sfx = this.sfxCache.get(type);
    if (sfx) {
      // Create a new instance each time to allow overlapping sounds
      const sfxInstance = sfx.cloneNode() as HTMLAudioElement;
      sfxInstance.volume = PrefsService.getSfxVolume();

      sfxInstance.play().catch(() => {
        // Ignore play errors
      });
    }
  }

  setMusicEnabled(enabled: boolean): void {
    PrefsService.setMusicEnabled(enabled);

    if (enabled) {
      if (this.hasUserInteracted) {
        this.playBgm();
      }
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

  // Set music volume
  setMusicVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    PrefsService.setMusicVolume(clampedVolume);

    if (this.bgm) {
      this.bgm.volume = clampedVolume;
    }
  }

  // Set SFX volume
  setSfxVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    PrefsService.setSfxVolume(clampedVolume);

    // Update all cached SFX
    this.sfxCache.forEach(sfx => {
      sfx.volume = clampedVolume;
    });
  }

  // Get current track index
  getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  // Get if music is playing
  getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  // Skip to next track
  skipToNextTrack(): void {
    this.nextTrack();
  }

  // Get music volume
  getMusicVolume(): number {
    return PrefsService.getMusicVolume();
  }

  // Get SFX volume
  getSfxVolume(): number {
    return PrefsService.getSfxVolume();
  }

  // Cleanup method
  destroy(): void {
    if (this.bgm) {
      this.bgm.removeEventListener('ended', this.onTrackEnd);
    }
    this.stopBgm();
    this.sfxCache.clear();
    this.bgm = null;
  }
}

// Export singleton instance
export const audioService = new AudioService();