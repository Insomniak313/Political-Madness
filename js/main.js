// Fichier principal pour gérer les interactions utilisateur
document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const splashScreen = document.getElementById('splashScreen');
    const gameScreen = document.getElementById('gameScreen');
    const gameConfig = document.getElementById('gameConfig');
    const playerInput = document.getElementById('playerInput');
    const sendResponse = document.getElementById('sendResponse');
    const charCount = document.getElementById('charCount');
    const summaryModal = document.getElementById('summaryModal');
    const nextDuel = document.getElementById('nextDuel');
    const gameOverModal = document.getElementById('gameOverModal');
    const playAgain = document.getElementById('playAgain');
    const resetApiKey = document.getElementById('resetApiKey');

    // Variables globales
    let isWaitingForAI = false;

    // Initialisation
    initializeEventListeners();
    initializeCharacterCounter();

    function initializeEventListeners() {
        // Configuration du jeu
        gameConfig.addEventListener('submit', handleGameStart);
        
        // Envoi de réponse
        sendResponse.addEventListener('click', handleSendResponse);
        playerInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                handleSendResponse();
            }
        });

        // Navigation des modales
        nextDuel.addEventListener('click', hideSummaryModal);
        playAgain.addEventListener('click', handlePlayAgain);
        resetApiKey.addEventListener('click', handleResetApiKey);

        // Fermeture des modales en cliquant à l'extérieur
        summaryModal.addEventListener('click', function(e) {
            if (e.target === summaryModal) {
                hideSummaryModal();
            }
        });

        gameOverModal.addEventListener('click', function(e) {
            if (e.target === gameOverModal) {
                hideGameOverModal();
            }
        });
    }

    function initializeCharacterCounter() {
        playerInput.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            // Changer la couleur selon la limite
            if (count > 450) {
                charCount.className = 'text-red-500 font-semibold';
            } else if (count > 400) {
                charCount.className = 'text-yellow-500 font-semibold';
            } else {
                charCount.className = 'text-gray-500';
            }
        });
    }

    async function handleGameStart(e) {
        e.preventDefault();
        
        // Récupérer la configuration
        const config = {
            playerName: document.getElementById('playerName').value,
            difficulty: document.getElementById('difficulty').value,
            theme: document.getElementById('theme').value,
            aiOpponent: document.getElementById('aiOpponent').value,
            playerPosition: document.querySelector('input[name="position"]:checked').value
        };

        // Validation
        if (!config.playerName.trim()) {
            showNotification('Veuillez entrer votre nom', 'error');
            return;
        }

        // Demander la clé API si nécessaire
        if (!langChainConfig.isInitialized) {
            // Vérifier si une clé est déjà sauvegardée
            let apiKey = localStorage.getItem('gemini_api_key');
            
            if (!apiKey) {
                apiKey = await promptForAPIKey();
                if (!apiKey) {
                    showNotification('Clé API requise pour jouer', 'error');
                    return;
                }
                // Sauvegarder la clé pour la prochaine fois
                localStorage.setItem('gemini_api_key', apiKey);
            }
            
            const initialized = await langChainConfig.initialize(apiKey);
            if (!initialized) {
                showNotification('Erreur lors de l\'initialisation de l\'IA', 'error');
                // Supprimer la clé invalide
                localStorage.removeItem('gemini_api_key');
                return;
            }
        }

        // Démarrer le jeu
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

    async function handleSendResponse() {
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
            
            // Vider le champ de saisie
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

    function handlePlayAgain() {
        hideGameOverModal();
        showSplashScreen();
        game.resetGame();
    }

    function handleResetApiKey() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser votre clé API ? Vous devrez la ressaisir au prochain lancement.')) {
            localStorage.removeItem('gemini_api_key');
            langChainConfig.isInitialized = false;
            showNotification('Clé API réinitialisée', 'success');
        }
    }

    function showSplashScreen() {
        splashScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
    }

    function showGameScreen() {
        splashScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
    }

    function hideSummaryModal() {
        summaryModal.classList.add('hidden');
    }

    function hideGameOverModal() {
        gameOverModal.classList.add('hidden');
    }

    function showLoadingState() {
        sendResponse.disabled = true;
        sendResponse.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi...';
        playerInput.disabled = true;
        
        // Ajouter un indicateur visuel sur la réponse IA
        const aiResponseElement = document.getElementById('aiResponse');
        if (aiResponseElement) {
            aiResponseElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>L\'IA réfléchit...';
        }
    }

    function hideLoadingState() {
        sendResponse.disabled = false;
        sendResponse.innerHTML = 'Envoyer';
        playerInput.disabled = false;
        
        // Réinitialiser l'état de la réponse IA
        const aiResponseElement = document.getElementById('aiResponse');
        if (aiResponseElement && !aiResponseElement.textContent.includes('L\'IA réfléchit')) {
            // Ne pas écraser si une vraie réponse est déjà affichée
        }
    }

    async function promptForAPIKey() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl p-6 max-w-md w-full card-shadow">
                    <div class="text-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Clé API Google</h3>
                        <p class="text-gray-600 text-sm">Entrez votre clé API Google pour utiliser l'IA avancée</p>
                    </div>
                    <div class="mb-4">
                        <input type="password" id="apiKeyInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Votre clé API Google">
                    </div>
                    <div class="flex space-x-3">
                        <button id="cancelApiKey" class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                            Annuler
                        </button>
                        <button id="confirmApiKey" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                            Confirmer
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const apiKeyInput = modal.querySelector('#apiKeyInput');
            const cancelBtn = modal.querySelector('#cancelApiKey');
            const confirmBtn = modal.querySelector('#confirmApiKey');

            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(null);
            });

            confirmBtn.addEventListener('click', () => {
                const apiKey = apiKeyInput.value.trim();
                if (apiKey) {
                    document.body.removeChild(modal);
                    resolve(apiKey);
                } else {
                    showNotification('Veuillez entrer une clé API valide', 'warning');
                }
            });

            // Fermer avec Escape
            document.addEventListener('keydown', function escapeHandler(e) {
                if (e.key === 'Escape') {
                    document.body.removeChild(modal);
                    document.removeEventListener('keydown', escapeHandler);
                    resolve(null);
                }
            });

            apiKeyInput.focus();
        });
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Supprimer après 3 secondes
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    // Fonctions utilitaires pour le jeu
    window.gameUtils = {
        showNotification,
        showLoadingState,
        hideLoadingState
    };
});