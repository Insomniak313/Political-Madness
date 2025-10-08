// Breadcrumb component for the NewGameWizard
// Shows current step and completed steps with icons and labels

import type { Phase0State } from '../state';

export class Breadcrumb {
  private state: Phase0State;
  private container: HTMLElement;

  constructor(state: Phase0State) {
    this.state = state;
    this.container = this.createBreadcrumb();
  }

  private createBreadcrumb(): HTMLElement {
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'wizard-breadcrumb';
    breadcrumb.setAttribute('aria-label', 'Progression des étapes');
    breadcrumb.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
      min-height: 44px;
    `;

    // Define steps with their configuration
    const steps = [
      { id: 1, label: 'Difficulté', icon: '🎯' },
      { id: 2, label: 'Thème', icon: '📝' },
      { id: 3, label: 'Question', icon: '❓' },
      { id: 4, label: 'Lancer', icon: '🚀' }
    ];

    steps.forEach((step, index) => {
      const stepElement = this.createStepElement(step);
      breadcrumb.appendChild(stepElement);

      // Add separator if not the last step
      if (index < steps.length - 1) {
        const separator = this.createSeparator();
        breadcrumb.appendChild(separator);
      }
    });

    return breadcrumb;
  }

  private createStepElement(step: { id: number; label: string; icon: string }): HTMLElement {
    const stepElement = document.createElement('div');
    stepElement.className = 'breadcrumb-step';
    stepElement.setAttribute('aria-label', `Étape ${step.id}: ${step.label}`);
    stepElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      transition: all 0.3s ease;
      cursor: default;
    `;

    // Determine step state
    const isCompleted = step.id < this.state.step;
    const isCurrent = step.id === this.state.step;
    const isPending = step.id > this.state.step;

    // Apply styling based on state
    if (isCompleted) {
      stepElement.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
      stepElement.style.color = 'rgb(34, 197, 94)';
      stepElement.style.border = '1px solid rgba(34, 197, 94, 0.3)';
    } else if (isCurrent) {
      stepElement.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
      stepElement.style.color = 'rgb(59, 130, 246)';
      stepElement.style.border = '1px solid rgba(59, 130, 246, 0.3)';
      stepElement.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
    } else {
      stepElement.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      stepElement.style.color = 'rgba(255, 255, 255, 0.4)';
      stepElement.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    }

    // Icon
    const icon = document.createElement('span');
    icon.textContent = step.icon;
    icon.style.cssText = `
      font-size: 1rem;
      filter: ${isPending ? 'grayscale(100%)' : 'none'};
    `;

    // Label
    const label = document.createElement('span');
    label.textContent = step.label;
    label.style.cssText = `
      font-size: 0.875rem;
      font-weight: ${isCurrent ? '600' : '500'};
      white-space: nowrap;
    `;

    // Mobile responsiveness - hide labels on small screens except for current step
    if (isPending && !isCurrent) {
      label.style.display = 'none';

      // Show label on hover for accessibility
      stepElement.addEventListener('mouseenter', () => {
        if (window.innerWidth < 640) {
          label.style.display = 'inline';
          setTimeout(() => {
            label.style.display = 'none';
          }, 2000);
        }
      });
    }

    stepElement.appendChild(icon);
    stepElement.appendChild(label);

    return stepElement;
  }

  private createSeparator(): HTMLElement {
    const separator = document.createElement('div');
    separator.setAttribute('aria-hidden', 'true');
    separator.style.cssText = `
      width: 20px;
      height: 2px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 1px;
    `;

    return separator;
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(state: Phase0State): void {
    this.state = state;
    const newBreadcrumb = new Breadcrumb(state);
    const parent = this.container.parentElement;
    if (parent) {
      parent.replaceChild(newBreadcrumb.getElement(), this.container);
      this.container = newBreadcrumb.getElement();
    }
  }
}