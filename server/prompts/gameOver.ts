export function buildGameOverPrompt(finalScore: number, playerName: string): string {
  return `
Créez un message de fin de jeu pour "${playerName}" qui a obtenu un score de ${finalScore}%.

Le message doit :
- Être encourageant et positif
- Mentionner le niveau de persuasion atteint
- Être adapté au score (0-30% : débutant, 31-60% : intermédiaire, 61-80% : avancé, 81-100% : expert)
- Faire maximum 50 mots
`;
}
