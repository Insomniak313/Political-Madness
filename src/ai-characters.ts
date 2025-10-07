import type { AICharacter, ResponseModifier, OpponentType, Position } from './types';

// Classe de personnage IA avec caractéristiques émotionnelles
class AICharacterClass implements AICharacter {
  constructor(
    public name: string,
    public personality: string,
    public communicationStyle: string,
    public values: string,
    public aggressiveness: number,
    public avatar: string
  ) {}

  getResponseModifier(): ResponseModifier {
    const modifiers: Record<number, ResponseModifier> = {
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

interface CharacterWithKey extends AICharacter {
  key: string;
}

class AICharacterManager {
  private characters: Record<OpponentType, AICharacterClass>;

  constructor() {
    this.characters = {
      conservateur: new AICharacterClass(
        "Alex",
        "Traditionnel, respectueux des institutions, prudent face au changement",
        "Formel, utilise des références historiques et des citations d'autorités",
        "Ordre, stabilité, famille traditionnelle, sécurité nationale",
        6,
        "👔"
      ),
      liberal: new AICharacterClass(
        "Marie",
        "Progressiste, ouverte d'esprit, optimiste sur le changement",
        "Chaleureuse, utilise des exemples concrets et des témoignages",
        "Liberté individuelle, égalité, justice sociale, innovation",
        4,
        "🌱"
      ),
      centriste: new AICharacterClass(
        "Thomas",
        "Équilibré, pragmatique, cherche le consensus",
        "Analytique, présente les deux côtés avant de conclure",
        "Compromis, efficacité, réforme graduelle, dialogue",
        3,
        "⚖️"
      ),
      radical: new AICharacterClass(
        "Luna",
        "Passionnée, idéaliste, prête à tout pour ses convictions",
        "Émotionnelle, utilise des métaphores et des appels à l'action",
        "Révolution, justice absolue, changement radical, authenticité",
        9,
        "🔥"
      )
    };
  }

  getCharacter(characterType: OpponentType): AICharacterClass {
    return this.characters[characterType] || this.characters.centriste;
  }

  getAllCharacters(): CharacterWithKey[] {
    return Object.keys(this.characters).map((key) => ({
      key,
      ...this.characters[key as OpponentType]
    }));
  }

  calculatePersuasionImpact(character: AICharacter, response: string, _playerResponse: string): number {
    const baseImpact = 5;
    const aggressivenessModifier = character.aggressiveness * 0.5;
    const responseLength = response.length;
    const lengthModifier = Math.min(responseLength / 100, 2);
    
    const emotionalWords = this.countEmotionalWords(response);
    const emotionalModifier = emotionalWords * 0.3;
    
    const persuasiveElements = this.countPersuasiveElements(response);
    const persuasiveModifier = persuasiveElements * 0.4;
    
    const totalImpact = baseImpact + aggressivenessModifier + lengthModifier + emotionalModifier + persuasiveModifier;
    
    return Math.min(Math.max(totalImpact, 1), 15);
  }

  private countEmotionalWords(text: string): number {
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

  private countPersuasiveElements(text: string): number {
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

  generateContextualResponse(
    character: AICharacter,
    _idea: string,
    playerPosition: Position,
    _playerResponse: string,
    exchangeCount: number
  ): string {
    if (!(character instanceof AICharacterClass)) {
      return "";
    }
    
    let responseTemplate = "";
    
    if (exchangeCount === 1) {
      responseTemplate = `En tant que ${character.personality.toLowerCase()}, je dois dire que je suis ${playerPosition === 'pour' ? 'contre' : 'pour'} cette idée. ${character.communicationStyle}...`;
    } else if (exchangeCount === 2) {
      responseTemplate = `Votre point de vue est intéressant, mais ${character.communicationStyle}...`;
    } else {
      responseTemplate = `Pour conclure, ${character.communicationStyle}...`;
    }
    
    return responseTemplate;
  }
}

// Instance globale
export const aiCharacterManager = new AICharacterManager();
export { AICharacterClass };

