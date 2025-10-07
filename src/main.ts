import { langChainConfig } from './langchain-config';
import { game } from './game-logic';
import type { GameConfig, NotificationType } from './types';

// Import new Home Menu system
import { screenManager, Screen } from './services/screenManager';
import { audioService } from './services/audioService';
import { PrefsService } from './services/prefsService';
import { homeMenu } from './ui/HomeMenu';
import { optionsScreen } from './ui/OptionsScreen';
import { NewGameWizard } from './features/newgame/NewGameWizard.tsx';

// Clé API fixe
const FIXED_API_KEY = 'AIzaSyAsO9BeU21akr3ABkWUjEJH2rnaNPPz2ng';

// Fichier principal pour gérer les interactions utilisateur
document.addEventListener('DOMContentLoaded', async () => {
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

  // Initialize the new Home Menu system
  await initializeApp();

  // Initialisation de la nouvelle application
  async function initializeApp(): Promise<void> {
    try {
      // Initialize audio service first
      await audioService.initialize();

      // Set up new screen containers in DOM
      setupScreenContainers();

      // Initialize event listeners for the new system
      initializeNewEventListeners();

      // Initialize character counter for the game screen (still needed)
      initializeCharacterCounter();

      console.log('🚀 Nouvelle interface Home Menu initialisée avec succès');
      console.log('📍 Vérification: homeScreen element:', document.getElementById('homeScreen'));
      console.log('📍 Vérification: splashScreen element:', document.getElementById('splashScreen'));

      // Force display check
      const homeScreen = document.getElementById('homeScreen');
      if (homeScreen) {
        console.log('🎨 HomeScreen computed styles:', window.getComputedStyle(homeScreen));
        console.log('👀 HomeScreen is visible:', homeScreen.offsetWidth > 0 && homeScreen.offsetHeight > 0);
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la nouvelle interface:', error);
      // Fallback: show the old screen if new system fails completely
      showSplashScreen();
    }
  }

  function hideSplashScreen(): void {
    splashScreen.classList.add('hidden');
  }

  function setupScreenContainers(): void {
    try {
      console.log('🔧 Setting up screen containers...');

      // Inject HomeMenu into the homeScreen container
      const homeContainer = document.getElementById('homeScreen');
      if (homeContainer) {
        console.log('✅ Found homeScreen container');

        // Create the HomeMenu element
        const homeMenuElement = homeMenu.getElement();
        console.log('🏗️ HomeMenu element:', homeMenuElement);
        console.log('🏗️ HomeMenu element HTML:', homeMenuElement.innerHTML);

        // Clear container and inject
        homeContainer.innerHTML = '';
        const injected = homeContainer.appendChild(homeMenuElement);

        console.log('✅ Injected HomeMenu into DOM:', injected);
        console.log('📋 Final homeContainer HTML:', homeContainer.innerHTML);

        // Force restyle to ensure visibility
        homeContainer.style.display = 'flex';
        homeContainer.style.visibility = 'visible';

      } else {
        console.error('❌ homeScreen container not found!');
        console.log('🔍 Available elements:', document.querySelectorAll('*').length, 'total elements');
      }

      // Inject OptionsScreen into the optionsScreen container
      const optionsContainer = document.getElementById('optionsScreen');
      if (optionsContainer) {
        console.log('✅ Found optionsScreen container');

        // Create the OptionsScreen element
        const optionsScreenElement = optionsScreen.getElement();
        console.log('🏗️ OptionsScreen element:', optionsScreenElement);

        // Clear container and inject
        optionsContainer.innerHTML = '';
        const injectedOptions = optionsContainer.appendChild(optionsScreenElement);

        console.log('✅ Injected OptionsScreen into DOM:', injectedOptions);

        // Ensure it's initially hidden (it should be hidden by default)
        optionsContainer.classList.add('hidden');

      } else {
        console.error('❌ optionsScreen container not found!');
      }

      // Inject NewGameWizard into the newGameScreen container
      const newGameContainer = document.getElementById('newGameScreen');
      if (newGameContainer) {
        console.log('✅ Found newGameScreen container');

        // Create the NewGameWizard element
        const newGameWizard = new NewGameWizard();
        const newGameWizardElement = newGameWizard.getElement();
        console.log('🏗️ NewGameWizard element:', newGameWizardElement);

        // Clear container and inject
        newGameContainer.innerHTML = '';
        const injectedWizard = newGameContainer.appendChild(newGameWizardElement);

        console.log('✅ Injected NewGameWizard into DOM:', injectedWizard);

        // Ensure it's initially hidden (it should be hidden by default)
        newGameContainer.classList.add('hidden');

      } else {
        console.error('❌ newGameScreen container not found!');
      }

      console.log('🎯 Screen containers setup complete');
    } catch (error) {
      console.error('💥 Error setting up screen containers:', error);
      console.error('💥 Error stack:', (error as Error).stack);
    }
  }

  function initializeNewEventListeners(): void {
    // The new components handle their own events, but we need to handle
    // the transition from game config to game screen
    const gameConfig = document.getElementById('gameConfig') as HTMLFormElement;
    if (gameConfig) {
      gameConfig.addEventListener('submit', handleGameStart);
    }

    // Handle wizard events
    document.addEventListener('navigate-to-home', () => {
      homeMenu.show();
    });

    document.addEventListener('start-game-from-wizard', (event: any) => {
      const gameConfig = event.detail;
      handleGameStartFromWizard(gameConfig);
    });
  }

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

  async function handleGameStartFromWizard(gameConfig: GameConfig): Promise<void> {
    if (!gameConfig.playerName.trim()) {
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
      await game.initializeGame(gameConfig);
      hideLoadingState();
      showGameScreen();
      showNotification(`Bienvenue ${gameConfig.playerName} ! Le débat commence.`, 'success');
    } catch (error) {
      console.error('Erreur lors du démarrage du jeu:', error);
      showNotification('Erreur lors du démarrage du jeu', 'error');
      hideLoadingState();
    }
  }

  async function handleGameStart(e: Event): Promise<void> {
    e.preventDefault();

    const playerNameInput = document.getElementById('playerName') as HTMLInputElement;

    // Pre-populate with saved name if available and field is empty
    if (playerNameInput && !playerNameInput.value.trim()) {
      const savedName = PrefsService.getPlayerName();
      if (savedName) {
        playerNameInput.value = savedName;
      }
    }
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
      hideLoadingState();
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
    // Return to new Home Menu instead of old splash screen
    homeMenu.show();
    game.resetGame();
  }

  function showSplashScreen(): void {
    splashScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
  }

  function showGameScreen(): void {
    // Hide all screens using the screen manager
    screenManager.hideAllScreens();
    gameScreen.classList.remove('hidden');
    // S'assurer que le textarea est activé quand le jeu commence
    playerInput.disabled = false;
    sendResponse.disabled = false;
  }

  function hideSummaryModal(): void {
    summaryModal.classList.add('hidden');
    // Réactiver le textarea après la fermeture du modal
    playerInput.disabled = false;
    sendResponse.disabled = false;
    playerInput.focus();
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
    
    // S'assurer que le textarea est focusable
    playerInput.focus();
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

