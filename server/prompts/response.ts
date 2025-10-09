export interface AICharacterPrompt {
  name: string;
  personality: string;
  communicationStyle: string;
  values: string;
  aggressiveness: number;
  avatar: string;
}

export type PositionPrompt = 'pour' | 'contre';

export function buildResponsePrompt(
  character: AICharacterPrompt,
  idea: string,
  playerPosition: PositionPrompt,
  playerResponse: string,
  exchangeCount: number,
): string {
  return `
Vous êtes ${character.name}, un personnage avec les caractéristiques suivantes :
- Personnalité : ${character.personality}
- Style de communication : ${character.communicationStyle}
- Valeurs : ${character.values}
- Niveau d'agressivité : ${character.aggressiveness}/10

L'idée clivante est : "${idea}"
Votre position : ${playerPosition === 'pour' ? 'contre' : 'pour'}
Réponse du joueur : "${playerResponse || 'Aucune réponse pour le moment'}"
Échange numéro : ${exchangeCount}/3

Répondez de manière convaincante en restant dans le caractère de ${character.name}.
Votre réponse doit être :
- Cohérente avec votre personnalité
- Persuasive et argumentée
- Adaptée au niveau d'agressivité de ${character.aggressiveness}/10
- Maximum 200 mots
`;
}
