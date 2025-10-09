// AudioSettings component for Political-Madness
// Overlay/modal for audio settings with volume sliders and toggles

import { audioService } from '../services/audioService';

export class AudioSettings {
  private overlay: HTMLElement;
  private modal: HTMLElement;
  private musicSlider!: HTMLInputElement;
  private sfxSlider!: HTMLInputElement;
  private musicToggle!: HTMLInputElement;
  private sfxToggle!: HTMLInputElement;
  private nextTrackButton!: HTMLButtonElement;
  private currentTrackDisplay!: HTMLElement;
  private isVisible = false;

  constructor() {
    this.overlay = this.createOverlay();
    this.modal = this.overlay.querySelector('#audioSettingsModal') as HTMLElement;
    this.initializeElements();
    this.attachEventListeners();
    this.updateUI();
  }

  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'audioSettingsOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      z-index: 2000;
      display: none;
      align-items: center;
      justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.id = 'audioSettingsModal';
    modal.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 2rem;
      max-width: 400px;
      width: 90vw;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      transform: scale(0.9);
      opacity: 0;
      transition: all 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">Paramètres Audio</h2>
        <p style="color: #6b7280;">Contrôlez la musique et les effets sonores</p>
      </div>

      <div style="space-y: 1.5rem;">
        <!-- Music Section -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label style="font-weight: 600; color: #374151;">Musique</label>
            <label style="flex items-center cursor-pointer;">
              <input type="checkbox" id="musicToggle" style="margin-right: 0.5rem;">
              <span style="font-size: 0.875rem; color: #6b7280;">Activé</span>
            </label>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <input type="range" id="musicSlider" min="0" max="100" step="1" style="flex: 1;">
            <span id="musicVolumeText" style="font-size: 0.875rem; color: #6b7280; min-width: 2rem;">40%</span>
          </div>
          <div style="margin-top: 0.5rem; text-align: center;">
            <span id="currentTrackDisplay" style="font-size: 0.75rem; color: #9ca3af;">Track 1</span>
            <button id="nextTrackButton" style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: #e5e7eb; border-radius: 4px; font-size: 0.75rem;">Suivant</button>
          </div>
        </div>

        <!-- SFX Section -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label style="font-weight: 600; color: #374151;">Effets sonores</label>
            <label style="flex items-center cursor-pointer;">
              <input type="checkbox" id="sfxToggle" style="margin-right: 0.5rem;">
              <span style="font-size: 0.875rem; color: #6b7280;">Activé</span>
            </label>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <input type="range" id="sfxSlider" min="0" max="100" step="1" style="flex: 1;">
            <span id="sfxVolumeText" style="font-size: 0.875rem; color: #6b7280; min-width: 2rem;">60%</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 2rem; text-align: center;">
        <button id="closeAudioSettings" style="padding: 0.75rem 2rem; background: #3b82f6; color: white; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.3s ease;">Fermer</button>
      </div>
    `;

    overlay.appendChild(modal);
    return overlay;
  }

  private initializeElements(): void {
    this.musicSlider = this.modal.querySelector('#musicSlider') as HTMLInputElement;
    this.sfxSlider = this.modal.querySelector('#sfxSlider') as HTMLInputElement;
    this.musicToggle = this.modal.querySelector('#musicToggle') as HTMLInputElement;
    this.sfxToggle = this.modal.querySelector('#sfxToggle') as HTMLInputElement;
    this.nextTrackButton = this.modal.querySelector('#nextTrackButton') as HTMLButtonElement;
    this.currentTrackDisplay = this.modal.querySelector('#currentTrackDisplay') as HTMLElement;
  }

  private attachEventListeners(): void {
    // Close modal
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });

    const closeButton = this.modal.querySelector('#closeAudioSettings') as HTMLButtonElement;
    closeButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.hide();
    });

    // Music controls
    this.musicSlider.addEventListener('input', (e) => {
      const volume = parseInt((e.target as HTMLInputElement).value) / 100;
      audioService.setMusicVolume(volume);
      this.updateUI();
    });

    this.musicToggle.addEventListener('change', (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      audioService.setMusicEnabled(enabled);
      this.updateUI();
      document.dispatchEvent(new CustomEvent('audio-settings-changed'));
    });

    // SFX controls
    this.sfxSlider.addEventListener('input', (e) => {
      const volume = parseInt((e.target as HTMLInputElement).value) / 100;
      audioService.setSfxVolume(volume);
      this.updateUI();
    });

    this.sfxToggle.addEventListener('change', (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      audioService.setSfxEnabled(enabled);
      this.updateUI();
    });

    // Next track
    this.nextTrackButton.addEventListener('click', () => {
      audioService.playSfx('click');
      audioService.skipToNextTrack();
      this.updateUI();
    });
  }

  private updateUI(): void {
    // Update sliders
    this.musicSlider.value = (audioService.getMusicEnabled() ? audioService.getMusicVolume() * 100 : 0).toString();
    this.sfxSlider.value = (audioService.getSfxEnabled() ? audioService.getSfxVolume() * 100 : 0).toString();

    // Update toggles
    this.musicToggle.checked = audioService.getMusicEnabled();
    this.sfxToggle.checked = audioService.getSfxEnabled();

    // Update volume texts
    const musicVolumeText = this.modal.querySelector('#musicVolumeText') as HTMLElement;
    const sfxVolumeText = this.modal.querySelector('#sfxVolumeText') as HTMLElement;
    musicVolumeText.textContent = Math.round(audioService.getMusicVolume() * 100) + '%';
    sfxVolumeText.textContent = Math.round(audioService.getSfxVolume() * 100) + '%';

    // Update current track
    const trackIndex = audioService.getCurrentTrackIndex();
    this.currentTrackDisplay.textContent = `Track ${trackIndex + 1}`;

    // Disable sliders when toggles are off
    this.musicSlider.disabled = !audioService.getMusicEnabled();
    this.sfxSlider.disabled = !audioService.getSfxEnabled();
    this.musicSlider.style.opacity = audioService.getMusicEnabled() ? '1' : '0.5';
    this.sfxSlider.style.opacity = audioService.getSfxEnabled() ? '1' : '0.5';
  }

  // Public method to show the settings
  show(): void {
    if (this.isVisible) return;
    this.isVisible = true;
    this.overlay.style.display = 'flex';
    document.body.appendChild(this.overlay);

    // Animate in
    setTimeout(() => {
      this.modal.style.transform = 'scale(1)';
      this.modal.style.opacity = '1';
    }, 10);

    this.updateUI();
  }

  // Public method to hide the settings
  hide(): void {
    if (!this.isVisible) return;
    this.isVisible = false;

    // Animate out
    this.modal.style.transform = 'scale(0.9)';
    this.modal.style.opacity = '0';

    setTimeout(() => {
      this.overlay.style.display = 'none';
      if (this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
    }, 300);
  }
}