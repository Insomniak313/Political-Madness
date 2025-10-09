import type { Exchange } from '../../src/types';

export function buildSummaryPrompt(idea: string, exchanges: Exchange[], finalScore: number): string {
  return `
En tant que journaliste politique, analysez ce débat et donnez un résumé professionnel.

Idée clivante : "${idea}"
Échanges : ${exchanges.length} échanges
Score final : ${finalScore}% (en faveur du joueur)

Le résumé doit :
- Analyser les arguments principaux des deux côtés
- Expliquer pourquoi le score a évolué ainsi
- Être objectif et professionnel
- Faire maximum 150 mots
`;
}
