import { langChainConfig } from './langchain-config';
import { game } from './game-logic';
import type { GameConfig, NotificationType } from './types';

// Import new Home Menu system
import { screenManager } from './services/screenManager';
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
  const playerInput = document.getElementById('playerInput') as HTMLTextAreaElement;
  const sendResponse = document.getElementById('sendResponse') as HTMLButtonElement;
  const charCount = document.getElementById('charCount') as HTMLElement;

  // Initialize the new Home Menu system
  await initializeApp();

  // Initialisation de la nouvelle application
  async function initializeApp(): Promise<void> {
    console.log('App: Starting initialization');
    try {
      // Initialize audio service first
      await audioService.initialize();

      // Initialize LangChain
      console.log('App: Initializing LangChain');
      const langChainInitialized = await langChainConfig.initialize(FIXED_API_KEY);
      if (!langChainInitialized) {
        console.warn('App: LangChain initialization failed, but continuing');
      }

      // Set up new screen containers in DOM
      setupScreenContainers();

      // Initialize event listeners for the new system
      initializeNewEventListeners();

      // Initialize character counter for the game screen (still needed)
      initializeCharacterCounter();

      // Force display check
      const homeScreen = document.getElementById('homeScreen');
      if (homeScreen) {
        // Visibility check completed
      }

      console.log('App: Initialization completed successfully');

    } catch (error) {
      console.log('App: Initialization failed', error);
      // Fallback: show the old screen if new system fails completely
      showSplashScreen();
    }
  }


  function setupScreenContainers(): void {
    try {
      // Inject HomeMenu into the homeScreen container
      const homeContainer = document.getElementById('homeScreen');
      if (homeContainer) {
        // Create the HomeMenu element
        const homeMenuElement = homeMenu.getElement();

        // Clear container and inject
        homeContainer.innerHTML = '';
        homeContainer.appendChild(homeMenuElement);

        // Force restyle to ensure visibility
        homeContainer.style.display = 'flex';
        homeContainer.style.visibility = 'visible';

      } else {
        // homeScreen container not found
      }

      // Inject OptionsScreen into the optionsScreen container
      const optionsContainer = document.getElementById('optionsScreen');
      if (optionsContainer) {
        // Create the OptionsScreen element
        const optionsScreenElement = optionsScreen.getElement();

        // Clear container and inject
        optionsContainer.innerHTML = '';
        optionsContainer.appendChild(optionsScreenElement);

        // Ensure it's initially hidden (it should be hidden by default)
        optionsContainer.classList.add('hidden');

      } else {
        // optionsScreen container not found
      }

      // Inject NewGameWizard into the newGameScreen container
      const newGameContainer = document.getElementById('newGameScreen');
      if (newGameContainer) {
        // Create the NewGameWizard element
        const newGameWizard = new NewGameWizard();
        const newGameWizardElement = newGameWizard.getElement();

        // Clear container and inject
        newGameContainer.innerHTML = '';
        newGameContainer.appendChild(newGameWizardElement);

        // Ensure it's initially hidden (it should be hidden by default)
        newGameContainer.classList.add('hidden');

      } else {
        // newGameScreen container not found
      }
    } catch (error) {
      // Error setting up screen containers
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

    // LangChain is now initialized at app startup, but check just in case
    // LangChain is now initialized at app startup, but check just in case
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
      showNotification('Erreur lors du démarrage du jeu', 'error');
      hideLoadingState();
    }
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

