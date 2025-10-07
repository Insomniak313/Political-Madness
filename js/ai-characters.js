// Personnages IA avec caractéristiques émotionnelles
class AICharacter {
    constructor(name, personality, communicationStyle, values, aggressiveness, avatar) {
        this.name = name;
        this.personality = personality;
        this.communicationStyle = communicationStyle;
        this.values = values;
        this.aggressiveness = aggressiveness; // 1-10
        this.avatar = avatar;
    }

    getResponseModifier() {
        // Modifie le style de réponse selon l'agressivité
        const modifiers = {
            1: { tone: "calme et posé", intensity: "faible" },
            2: { tone: "diplomatique", intensity: "faible" },
            3: { tone: "mesuré", intensity: "modérée" },
            4: { tone: "ferme", intensity: "modérée" },
            5: { tone: "déterminé", intensity: "modérée" },
            6: { tone: "passionné", intensity: "élevée" },
            7: { tone: "intense", intensity: "élevée" },
            8: { tone: "combatif", intensity: "élevée" },
            9: { tone: "agressif", intensity: "très élevée" },
            10: { tone: "extrême", intensity: "maximale" }
        };
        return modifiers[this.aggressiveness] || modifiers[5];
    }
}

class AICharacterManager {
    constructor() {
        this.characters = {
            conservateur: new AICharacter(
                "Alex",
                "Traditionnel, respectueux des institutions, prudent face au changement",
                "Formel, utilise des références historiques et des citations d'autorités",
                "Ordre, stabilité, famille traditionnelle, sécurité nationale",
                6,
                "👔"
            ),
            liberal: new AICharacter(
                "Marie",
                "Progressiste, ouverte d'esprit, optimiste sur le changement",
                "Chaleureuse, utilise des exemples concrets et des témoignages",
                "Liberté individuelle, égalité, justice sociale, innovation",
                4,
                "🌱"
            ),
            centriste: new AICharacter(
                "Thomas",
                "Équilibré, pragmatique, cherche le consensus",
                "Analytique, présente les deux côtés avant de conclure",
                "Compromis, efficacité, réforme graduelle, dialogue",
                3,
                "⚖️"
            ),
            radical: new AICharacter(
                "Luna",
                "Passionnée, idéaliste, prête à tout pour ses convictions",
                "Émotionnelle, utilise des métaphores et des appels à l'action",
                "Révolution, justice absolue, changement radical, authenticité",
                9,
                "🔥"
            )
        };
    }

    getCharacter(characterType) {
        return this.characters[characterType] || this.characters.centriste;
    }

    getAllCharacters() {
        return Object.keys(this.characters).map(key => ({
            key,
            ...this.characters[key]
        }));
    }

    // Calcule l'impact de la réponse sur la persuasion
    calculatePersuasionImpact(character, response, playerResponse) {
        const baseImpact = 5; // Impact de base
        const aggressivenessModifier = character.aggressiveness * 0.5;
        const responseLength = response.length;
        const lengthModifier = Math.min(responseLength / 100, 2); // Max 2x pour les réponses longues
        
        // Facteurs émotionnels
        const emotionalWords = this.countEmotionalWords(response);
        const emotionalModifier = emotionalWords * 0.3;
        
        // Facteurs de persuasion
        const persuasiveElements = this.countPersuasiveElements(response);
        const persuasiveModifier = persuasiveElements * 0.4;
        
        const totalImpact = baseImpact + aggressivenessModifier + lengthModifier + emotionalModifier + persuasiveModifier;
        
        // L'IA gagne des points si elle est plus persuasive
        return Math.min(Math.max(totalImpact, 1), 15);
    }

    countEmotionalWords(text) {
        const emotionalWords = [
            'absolument', 'incroyable', 'terrible', 'fantastique', 'horrible',
            'merveilleux', 'épouvantable', 'magnifique', 'désastreux',
            'urgent', 'critique', 'essentiel', 'vital', 'crucial'
        ];
        
        return emotionalWords.reduce((count, word) => {
            const regex = new RegExp(word, 'gi');
            const matches = text.match(regex);
            return count + (matches ? matches.length : 0);
        }, 0);
    }

    countPersuasiveElements(text) {
        const persuasiveElements = [
            'selon les études', 'les données montrent', 'il est prouvé',
            'les experts s\'accordent', 'la recherche démontre',
            'statistiquement', 'scientifiquement', 'objectivement',
            'logiquement', 'rationnellement', 'évidemment'
        ];
        
        return persuasiveElements.reduce((count, element) => {
            const regex = new RegExp(element, 'gi');
            const matches = text.match(regex);
            return count + (matches ? matches.length : 0);
        }, 0);
    }

    // Génère une réponse contextuelle basée sur le personnage
    generateContextualResponse(character, idea, playerPosition, playerResponse, exchangeCount) {
        const modifier = character.getResponseModifier();
        
        let responseTemplate = "";
        
        if (exchangeCount === 1) {
            // Première réponse - présentation de la position
            responseTemplate = `En tant que ${character.personality.toLowerCase()}, je dois dire que je suis ${playerPosition === 'pour' ? 'contre' : 'pour'} cette idée. ${character.communicationStyle}...`;
        } else if (exchangeCount === 2) {
            // Deuxième réponse - contre-argumentation
            responseTemplate = `Votre point de vue est intéressant, mais ${character.communicationStyle}...`;
        } else {
            // Troisième réponse - conclusion forte
            responseTemplate = `Pour conclure, ${character.communicationStyle}...`;
        }
        
        return responseTemplate;
    }
}

// Instance globale
const aiCharacterManager = new AICharacterManager();