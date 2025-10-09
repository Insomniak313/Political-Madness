export function buildIdeaPrompt(theme: string, difficulty: 'facile'|'moyen'|'difficile'): string {
  const difficultyPrompts: Record<string, string> = {
    facile: "Créez une idée clivante simple et accessible sur le thème",
    moyen: "Créez une idée clivante modérée sur le thème",
    difficile: "Créez une idée clivante complexe et nuancée sur le thème",
  };

  return `
En tant que journaliste politique, ${difficultyPrompts[difficulty]} "${theme}".

L'idée doit être :
- Clivante et controversée
- Propice au débat
- Formulée comme une déclaration claire
- Adaptée au niveau ${difficulty}

Répondez uniquement avec l'idée clivante, sans explication supplémentaire.
`;
}
