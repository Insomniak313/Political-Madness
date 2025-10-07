import { langChainConfig } from './langchain-config';
import { game } from './game-logic';
import type { GameConfig, NotificationType } from './types';

// Clé API fixe
const FIXED_API_KEY = 'AIzaSyAsO9BeU21akr3ABkWUjEJH2rnaNPPz2ng';

// Fichier principal pour gérer les interactions utilisateur
document.addEventListener('DOMContentLoaded', () => {
  // Éléments du DOM
  const splashScreen = document.getElementById('splashScreen') as HTMLElement;
  const gameScreen = document.getElementById('gameScreen') as HTMLElement;
  const gameConfig = document.getElementById('gameConfig') as HTMLFormElement;
  const playerInput = document.getElementById('playerInput') as HTMLTextAreaElement;
  const sendResponse = document.getElementById('sendResponse') as HTMLButtonElement;
  const charCount = document.getElementById('charCount') as HTMLElement;
  const summaryModal = document.getElementById('summaryModal') as HTMLElement;
  const nextDuel = document.getElementById('nextDuel') as HTMLButtonElement;
  const gameOverModal = document.getElementById('gameOverModal') as HTMLElement;
  const playAgain = document.getElementById('playAgain') as HTMLButtonElement;

  // Variables globales
  let isWaitingForAI = false;

  // Initialisation
  initializeEventListeners();
  initializeCharacterCounter();

  function initializeEventListeners(): void {
    gameConfig.addEventListener('submit', handleGameStart);
    
    sendResponse.addEventListener('click', handleSendResponse);
    playerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleSendResponse();
      }
    });

    nextDuel.addEventListener('click', hideSummaryModal);
    playAgain.addEventListener('click', handlePlayAgain);

    summaryModal.addEventListener('click', (e) => {
      if (e.target === summaryModal) {
        hideSummaryModal();
      }
    });

    gameOverModal.addEventListener('click', (e) => {
      if (e.target === gameOverModal) {
        hideGameOverModal();
      }
    });
  }

  function initializeCharacterCounter(): void {
    playerInput.addEventListener('input', function() {
      const count = this.value.length;
      charCount.textContent = count.toString();
      
      if (count > 450) {
        charCount.className = 'text-red-500 font-semibold';
      } else if (count > 400) {
        charCount.className = 'text-yellow-500 font-semibold';
      } else {
        charCount.className = 'text-gray-500';
      }
    });
  }

  async function handleGameStart(e: Event): Promise<void> {
    e.preventDefault();
    
    const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
    const difficultyInput = document.getElementById('difficulty') as HTMLSelectElement;
    const themeInput = document.getElementById('theme') as HTMLSelectElement;
    const aiOpponentInput = document.getElementById('aiOpponent') as HTMLSelectElement;
    const positionInput = document.querySelector('input[name="position"]:checked') as HTMLInputElement;
    
    const config: GameConfig = {
      playerName: playerNameInput.value,
      difficulty: difficultyInput.value as 'facile' | 'moyen' | 'difficile',
      theme: themeInput.value as GameConfig['theme'],
      aiOpponent: aiOpponentInput.value as GameConfig['aiOpponent'],
      playerPosition: positionInput.value as 'pour' | 'contre'
    };

    if (!config.playerName.trim()) {
      showNotification('Veuillez entrer votre nom', 'error');
      return;
    }

    if (!langChainConfig.isInitialized) {
      const initialized = await langChainConfig.initialize(FIXED_API_KEY);
      if (!initialized) {
        showNotification('Erreur lors de l\'initialisation de l\'IA', 'error');
        return;
      }
    }

    try {
      showLoadingState();
      await game.initializeGame(config);
      showGameScreen();
      showNotification(`Bienvenue ${config.playerName} ! Le débat commence.`, 'success');
    } catch (error) {
      console.error('Erreur lors du démarrage du jeu:', error);
      showNotification('Erreur lors du démarrage du jeu', 'error');
      hideLoadingState();
    }
  }

  async function handleSendResponse(): Promise<void> {
    if (isWaitingForAI) {
      showNotification('Veuillez attendre la réponse de l\'IA', 'warning');
      return;
    }

    const response = playerInput.value.trim();
    if (!response) {
      showNotification('Veuillez entrer une réponse', 'warning');
      return;
    }

    if (response.length > 500) {
      showNotification('Votre réponse est trop longue (max 500 caractères)', 'warning');
      return;
    }

    try {
      isWaitingForAI = true;
      showLoadingState();
      
      await game.processPlayerResponse(response);
      
      playerInput.value = '';
      charCount.textContent = '0';
      charCount.className = 'text-gray-500';
      
    } catch (error) {
      console.error('Erreur lors du traitement de la réponse:', error);
      showNotification('Erreur lors du traitement de votre réponse', 'error');
    } finally {
      isWaitingForAI = false;
      hideLoadingState();
    }
  }

  function handlePlayAgain(): void {
    hideGameOverModal();
    showSplashScreen();
    game.resetGame();
  }

  function showSplashScreen(): void {
    splashScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
  }

  function showGameScreen(): void {
    splashScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  }

  function hideSummaryModal(): void {
    summaryModal.classList.add('hidden');
  }

  function hideGameOverModal(): void {
    gameOverModal.classList.add('hidden');
  }

  function showLoadingState(): void {
    sendResponse.disabled = true;
    sendResponse.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi...';
    playerInput.disabled = true;
    
    const aiResponseElement = document.getElementById('aiResponse');
    if (aiResponseElement) {
      aiResponseElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>L\'IA réfléchit...';
    }
  }

  function hideLoadingState(): void {
    sendResponse.disabled = false;
    sendResponse.innerHTML = 'Envoyer';
    playerInput.disabled = false;
  }

  function showNotification(message: string, type: NotificationType = 'info'): void {
    const notification = document.createElement('div');
    const colors: Record<NotificationType, string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in notification`;
    notification.textContent = message;

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
    }, 3000);
  }
});

