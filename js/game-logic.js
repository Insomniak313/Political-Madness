// Logique principale du jeu Political Madness
class PoliticalMadnessGame {
    constructor() {
        this.gameState = {
            playerName: '',
            difficulty: 'moyen',
            theme: 'politique',
            aiOpponent: 'centriste',
            playerPosition: 'pour',
            currentDuel: 1,
            currentExchange: 1,
            maxDuels: 5,
            maxExchanges: 3,
            persuasionScore: 50, // 0-100, 50 = égalité
            currentIdea: '',
            exchanges: [],
            isGameActive: false,
            currentAICharacter: null
        };
        
        this.themes = {
            politique: [
                "La démocratie directe devrait remplacer la démocratie représentative",
                "Le vote obligatoire devrait être instauré",
                "Les partis politiques devraient être financés uniquement par l'État"
            ],
            societe: [
                "La PMA devrait être interdite",
                "Le port du voile devrait être interdit dans l'espace public",
                "L'immigration devrait être drastiquement réduite"
            ],
            economie: [
                "Le revenu universel devrait être instauré",
                "Les entreprises privées devraient être nationalisées",
                "L'impôt sur le revenu devrait être supprimé"
            ],
            environnement: [
                "La voiture individuelle devrait être interdite en ville",
                "La viande devrait être taxée comme un produit de luxe",
                "Les vols en avion devraient être limités à 2 par personne et par an"
            ],
            sante: [
                "L'euthanasie devrait être légalisée",
                "Les soins de santé devraient être entièrement privatisés",
                "La vaccination devrait être obligatoire pour tous"
            ],
            education: [
                "L'école à la maison devrait être interdite",
                "L'université devrait être gratuite pour tous",
                "Les notes devraient être supprimées jusqu'à 16 ans"
            ]
        };
    }

    async initializeGame(config) {
        this.gameState = { ...this.gameState, ...config };
        this.gameState.currentAICharacter = aiCharacterManager.getCharacter(config.aiOpponent);
        this.gameState.isGameActive = true;
        
        // Générer la première idée clivante
        await this.generateNewIdea();
        
        // Générer la première réponse de l'IA
        await this.generateAIResponse();
        
        this.updateUI();
    }

    async generateNewIdea() {
        try {
            if (this.gameState.theme === 'random') {
                const themeKeys = Object.keys(this.themes);
                const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
                this.gameState.currentIdea = this.themes[randomTheme][Math.floor(Math.random() * this.themes[randomTheme].length)];
            } else {
                const themeIdeas = this.themes[this.gameState.theme];
                this.gameState.currentIdea = themeIdeas[Math.floor(Math.random() * themeIdeas.length)];
            }
            
            // Utiliser LangChain pour générer une idée personnalisée
            if (langChainConfig.isInitialized) {
                try {
                    const generatedIdea = await langChainConfig.generateDebateIdea(
                        this.gameState.theme, 
                        this.gameState.difficulty
                    );
                    this.gameState.currentIdea = generatedIdea;
                } catch (error) {
                    console.warn('Erreur LangChain, utilisation de l\'idée prédéfinie:', error);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la génération de l\'idée:', error);
        }
    }

    async generateAIResponse() {
        try {
            const lastPlayerResponse = this.gameState.exchanges.length > 0 
                ? this.gameState.exchanges[this.gameState.exchanges.length - 1].playerResponse 
                : '';
            
            let aiResponse = '';
            
            if (langChainConfig.isInitialized) {
                try {
                    aiResponse = await langChainConfig.generateAIResponse(
                        this.gameState.currentAICharacter,
                        this.gameState.currentIdea,
                        this.gameState.playerPosition,
                        lastPlayerResponse,
                        this.gameState.currentExchange
                    );
                } catch (error) {
                    console.warn('Erreur LangChain, utilisation de la réponse générique:', error);
                    aiResponse = this.generateFallbackResponse();
                }
            } else {
                aiResponse = this.generateFallbackResponse();
            }
            
            // Ajouter l'échange à l'historique
            this.gameState.exchanges.push({
                exchangeNumber: this.gameState.currentExchange,
                aiResponse: aiResponse,
                playerResponse: lastPlayerResponse,
                timestamp: new Date()
            });
            
            // Calculer l'impact sur la persuasion
            this.updatePersuasionScore(aiResponse, lastPlayerResponse);
            
        } catch (error) {
            console.error('Erreur lors de la génération de la réponse IA:', error);
        }
    }

    generateFallbackResponse() {
        const character = this.gameState.currentAICharacter;
        const responses = {
            conservateur: [
                "Je dois respectueusement désapprouver cette proposition. Les traditions et l'ordre établi ont fait leurs preuves.",
                "Cette idée va à l'encontre des valeurs fondamentales de notre société. Nous devons préserver ce qui fonctionne.",
                "Je comprends votre point de vue, mais l'expérience nous enseigne que le changement radical est dangereux."
            ],
            liberal: [
                "Je suis en désaccord avec cette approche. Nous devons embrasser le progrès et l'innovation.",
                "Cette proposition ne correspond pas à mes valeurs de liberté et d'égalité. Nous pouvons faire mieux.",
                "Je respecte votre opinion, mais je crois fermement en un avenir plus ouvert et inclusif."
            ],
            centriste: [
                "Je vois les mérites des deux côtés, mais je pense qu'il faut une approche plus équilibrée.",
                "Cette question est complexe et mérite une analyse nuancée. Ni l'extrême ni l'immobilisme ne sont la solution.",
                "Je comprends votre position, mais peut-être qu'un compromis serait plus constructif."
            ],
            radical: [
                "Cette idée est complètement inacceptable ! Nous devons lutter contre cette injustice !",
                "Je refuse catégoriquement cette proposition. C'est un affront à tout ce en quoi je crois !",
                "Non, non et non ! Nous ne pouvons pas accepter cela ! Il faut agir maintenant !"
            ]
        };
        
        const characterResponses = responses[this.gameState.aiOpponent] || responses.centriste;
        return characterResponses[Math.floor(Math.random() * characterResponses.length)];
    }

    async processPlayerResponse(playerResponse) {
        if (!this.gameState.isGameActive) return;
        
        // Ajouter la réponse du joueur à l'échange actuel
        if (this.gameState.exchanges.length > 0) {
            this.gameState.exchanges[this.gameState.exchanges.length - 1].playerResponse = playerResponse;
        }
        
        // Vérifier si c'est le dernier échange du duel
        if (this.gameState.currentExchange >= this.gameState.maxExchanges) {
            await this.endDuel();
        } else {
            // Passer à l'échange suivant
            this.gameState.currentExchange++;
            await this.generateAIResponse();
        }
        
        this.updateUI();
    }

    async endDuel() {
        // Générer le résumé du duel
        await this.generateDuelSummary();
        
        // Vérifier si c'est le dernier duel
        if (this.gameState.currentDuel >= this.gameState.maxDuels) {
            await this.endGame();
        } else {
            // Passer au duel suivant
            this.gameState.currentDuel++;
            this.gameState.currentExchange = 1;
            this.gameState.exchanges = [];
            await this.generateNewIdea();
            await this.generateAIResponse();
        }
    }

    async generateDuelSummary() {
        try {
            let summary = '';
            
            if (langChainConfig.isInitialized) {
                try {
                    summary = await langChainConfig.generateSummary(
                        this.gameState.currentIdea,
                        this.gameState.exchanges,
                        this.gameState.persuasionScore
                    );
                } catch (error) {
                    console.warn('Erreur LangChain, utilisation du résumé générique:', error);
                    summary = this.generateFallbackSummary();
                }
            } else {
                summary = this.generateFallbackSummary();
            }
            
            this.showSummaryModal(summary);
        } catch (error) {
            console.error('Erreur lors de la génération du résumé:', error);
        }
    }

    generateFallbackSummary() {
        const score = this.gameState.persuasionScore;
        let summary = `Duel ${this.gameState.currentDuel} terminé !\n\n`;
        
        if (score > 60) {
            summary += "Vous avez été très convaincant dans ce débat. Vos arguments ont marqué des points face à votre adversaire.";
        } else if (score > 40) {
            summary += "Le débat a été équilibré. Vous avez tenu votre position face à un adversaire compétent.";
        } else {
            summary += "Votre adversaire a été plus persuasif cette fois. Analysez ses arguments pour vous améliorer.";
        }
        
        summary += `\n\nScore de persuasion actuel : ${score}%`;
        return summary;
    }

    async endGame() {
        this.gameState.isGameActive = false;
        await this.showGameOverModal();
    }

    updatePersuasionScore(aiResponse, playerResponse) {
        const character = this.gameState.currentAICharacter;
        const aiImpact = aiCharacterManager.calculatePersuasionImpact(character, aiResponse, playerResponse);
        
        // L'IA gagne des points si elle est plus persuasive
        const scoreChange = aiImpact - 5; // 5 est la valeur neutre
        this.gameState.persuasionScore = Math.max(0, Math.min(100, this.gameState.persuasionScore - scoreChange));
    }

    updateUI() {
        // Mettre à jour l'interface utilisateur
        document.getElementById('currentTheme').textContent = this.gameState.theme.charAt(0).toUpperCase() + this.gameState.theme.slice(1);
        document.getElementById('playerPosition').textContent = `Position : ${this.gameState.playerPosition}`;
        document.getElementById('currentDuel').textContent = this.gameState.currentDuel;
        document.getElementById('currentExchange').textContent = this.gameState.currentExchange;
        document.getElementById('journalistStatement').textContent = this.gameState.currentIdea;
        document.getElementById('aiOpponentName').textContent = `${this.gameState.currentAICharacter.avatar} ${this.gameState.currentAICharacter.name}`;
        
        // Afficher la dernière réponse de l'IA
        if (this.gameState.exchanges.length > 0) {
            const lastExchange = this.gameState.exchanges[this.gameState.exchanges.length - 1];
            document.getElementById('aiResponse').textContent = lastExchange.aiResponse;
        }
        
        // Mettre à jour la jauge de persuasion
        this.updatePersuasionGauge();
    }

    updatePersuasionGauge() {
        const score = this.gameState.persuasionScore;
        const bar = document.getElementById('persuasionBar');
        const scoreText = document.getElementById('persuasionScore');
        
        bar.style.width = `${score}%`;
        scoreText.textContent = `${Math.round(score)}%`;
        
        // Changer la couleur selon le score
        if (score < 30) {
            bar.className = 'persuasion-bar bg-gradient-to-r from-red-500 to-red-600 h-4 rounded-full transition-all duration-500';
        } else if (score < 70) {
            bar.className = 'persuasion-bar bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-500';
        } else {
            bar.className = 'persuasion-bar bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500';
        }
    }

    showSummaryModal(summary) {
        document.getElementById('summaryContent').textContent = summary;
        document.getElementById('summaryModal').classList.remove('hidden');
    }

    hideSummaryModal() {
        document.getElementById('summaryModal').classList.add('hidden');
    }

    async showGameOverModal() {
        const finalScore = this.gameState.persuasionScore;
        let message = '';
        
        if (langChainConfig.isInitialized) {
            try {
                message = await langChainConfig.generateGameOverMessage(finalScore, this.gameState.playerName);
            } catch (error) {
                console.warn('Erreur LangChain, utilisation du message générique:', error);
                message = this.generateFallbackGameOverMessage(finalScore);
            }
        } else {
            message = this.generateFallbackGameOverMessage(finalScore);
        }
        
        document.getElementById('finalScore').textContent = message;
        document.getElementById('gameOverModal').classList.remove('hidden');
    }

    generateFallbackGameOverMessage(score) {
        if (score >= 80) {
            return `Félicitations ${this.gameState.playerName} ! Vous êtes un expert en persuasion avec ${Math.round(score)}% !`;
        } else if (score >= 60) {
            return `Bien joué ${this.gameState.playerName} ! Vous êtes avancé avec ${Math.round(score)}% !`;
        } else if (score >= 40) {
            return `Pas mal ${this.gameState.playerName} ! Vous êtes intermédiaire avec ${Math.round(score)}% !`;
        } else {
            return `Continuez à vous entraîner ${this.gameState.playerName} ! Vous êtes débutant avec ${Math.round(score)}% !`;
        }
    }

    resetGame() {
        this.gameState = {
            playerName: '',
            difficulty: 'moyen',
            theme: 'politique',
            aiOpponent: 'centriste',
            playerPosition: 'pour',
            currentDuel: 1,
            currentExchange: 1,
            maxDuels: 5,
            maxExchanges: 3,
            persuasionScore: 50,
            currentIdea: '',
            exchanges: [],
            isGameActive: false,
            currentAICharacter: null
        };
    }
}

// Instance globale
const game = new PoliticalMadnessGame();