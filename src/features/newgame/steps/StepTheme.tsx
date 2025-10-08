// Step 2: Theme selection component
// Grid layout with theme options and random button

import { audioService } from '../../../services/audioService';
import { phase0StateManager } from '../state';
import type { Theme } from '../../../types';

export class StepTheme {
  private container: HTMLElement;
  private stateManager = phase0StateManager;

  constructor() {
    this.container = this.createStep();
  }

  private createStep(): HTMLElement {
    const step = document.createElement('div');
    step.className = 'step-theme';
    step.style.cssText = `
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    `;

    // Title
    const title = document.createElement('h2');
    title.innerHTML = `
      <span style="color: white; font-size: 2rem; margin-bottom: 0.5rem; display: block;">
        📝 Sélectionnez un thème
      </span>
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem; margin: 0;">
        Choisissez le domaine qui vous intéresse pour le débat
      </p>
    `;

    // Theme grid
    const grid = this.createThemeGrid();
    grid.style.marginTop = '2rem';
    grid.style.marginBottom = '2rem';

    // Random button
    const randomButton = this.createRandomButton();

    step.appendChild(title);
    step.appendChild(grid);
    step.appendChild(randomButton);

    return step;
  }

  private createThemeGrid(): HTMLElement {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      padding: 1rem;
    `;

    const themes: Array<{
      key: Theme;
      label: string;
      icon: string;
      description: string;
      color: string;
    }> = [
      {
        key: 'geopolitique',
        label: 'Géopolitique',
        icon: '🌍',
        description: 'Relations internationales et diplomatie',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        key: 'societe',
        label: 'Société',
        icon: '👥',
        description: 'Questions sociales et sociétales',
        color: 'from-green-600 to-teal-600'
      },
      {
        key: 'economie',
        label: 'Économie',
        icon: '💰',
        description: 'Politiques économiques et financières',
        color: 'from-yellow-600 to-orange-600'
      },
      {
        key: 'ecologie',
        label: 'Écologie',
        icon: '🌱',
        description: 'Environnement et développement durable',
        color: 'from-green-500 to-emerald-600'
      },
      {
        key: 'culture',
        label: 'Culture',
        icon: '🎭',
        description: 'Arts, médias et patrimoine culturel',
        color: 'from-purple-600 to-pink-600'
      }
    ];

    themes.forEach(theme => {
      const card = this.createThemeCard(theme);
      grid.appendChild(card);
    });

    return grid;
  }

  private createThemeCard(theme: {
    key: Theme;
    label: string;
    icon: string;
    description: string;
    color: string;
  }): HTMLElement {
    const card = document.createElement('button');
    card.className = 'theme-card';
    card.setAttribute('aria-label', `Sélectionner le thème ${theme.label}`);
    card.setAttribute('data-theme', theme.key as string);

    const isSelected = this.stateManager.getState().theme === theme.key;

    card.style.cssText = `
      background: ${isSelected
        ? `linear-gradient(135deg, ${theme.color.replace('from-', '').replace(' to-', ', ')})`
        : 'rgba(255, 255, 255, 0.05)'
      };
      border: 2px solid ${isSelected
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(255, 255, 255, 0.1)'
      };
      border-radius: 16px;
      padding: 1.5rem 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 140px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    `;

    // Icon
    const icon = document.createElement('div');
    icon.textContent = theme.icon;
    icon.style.cssText = `
      font-size: 2rem;
      margin-bottom: 0.5rem;
    `;

    // Label
    const label = document.createElement('div');
    label.textContent = theme.label;
    label.style.cssText = `
      color: ${isSelected ? 'white' : 'rgba(255, 255, 255, 0.9)'};
      font-size: 1.125rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    `;

    // Description
    const description = document.createElement('div');
    description.textContent = theme.description;
    description.style.cssText = `
      color: ${isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'};
      font-size: 0.875rem;
      line-height: 1.3;
    `;

    card.appendChild(icon);
    card.appendChild(label);
    card.appendChild(description);

    // Event listeners
    card.addEventListener('click', () => {
      audioService.playSfx('click');
      this.stateManager.dispatch({ type: 'SET_THEME', payload: theme.key });
    });

    card.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
      if (!isSelected) {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (!isSelected) {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
      }
    });

    return card;
  }

  private createRandomButton(): HTMLElement {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    `;

    const randomButton = document.createElement('button');
    randomButton.innerHTML = `
      <span style="margin-right: 0.5rem;">🎲</span>
      Choisir aléatoirement
    `;
    randomButton.setAttribute('aria-label', 'Choisir un thème aléatoire');
    randomButton.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.9);
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 44px;
    `;

    randomButton.addEventListener('click', () => {
      audioService.playSfx('click');
      this.stateManager.dispatch({ type: 'RANDOMIZE_THEME' });
    });

    randomButton.addEventListener('mouseenter', () => {
      audioService.playSfx('hover');
      randomButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    });

    randomButton.addEventListener('mouseleave', () => {
      randomButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });

    buttonContainer.appendChild(randomButton);
    return buttonContainer;
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}