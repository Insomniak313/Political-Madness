# Plan d'implémentation - Basculer la génération de questions sur l'agent IA

## Contexte actuel
- L'application utilise actuellement des questions codées en dur dans `NewGameWizard.tsx`
- Le service `DebateIdeaService` existe déjà et fournit une interface propre pour générer des questions
- L'écran "Question & Position" est implémenté dans `StepStance.tsx`
- De nombreux logs de test `console.*` sont présents dans le code

## Objectifs
1. Remplacer les questions codées en dur par des appels à l'agent IA
2. Supprimer tous les logs de test
3. Implémenter un système de logging structuré activable par namespace
4. Modifier le bouton aléatoire pour régénérer les questions
5. Assurer la gestion d'abort et timeout

## Plan d'exécution détaillé

### 1. Créer le système de logging structuré
**Fichier:** `src/services/logger.ts` (nouveau)
- Interface simple sans dépendances externes
- Activation par namespace via localStorage (`debug_namespaces`)
- Niveaux: debug/info/warn/error
- Namespaces requis: `agent:question`, `ui:phase0:question`

### 2. Nettoyer tous les logs de test
**Fichiers à modifier:**
- `src/main.ts` - Supprimer tous les console.log
- `src/ui/HomeMenu.ts` - Supprimer console.log
- `src/services/prefsService.ts` - Supprimer console.warn
- `src/services/audioService.ts` - Supprimer console.warn
- `src/langchain-config.ts` - Supprimer console.log/error
- `src/game-logic.ts` - Supprimer console.warn/error
- `src/features/newgame/NewGameWizard.tsx` - Supprimer console.log/error
- `src/agents/debateIdea.service.ts` - Remplacer console.warn par logging structuré

### 3. Modifier la génération de questions
**Fichier:** `src/features/newgame/NewGameWizard.tsx`
- Remplacer la méthode `generateQuestion()` pour utiliser `DebateIdeaService`
- Supprimer les questions codées en dur
- Générer UNE question au lieu de plusieurs
- Ajouter gestion d'abort et timeout

### 4. Modifier StepStance pour l'intégration complète
**Fichier:** `src/features/newgame/steps/StepStance.tsx`
- Intégrer le logging structuré pour les interactions UI
- Modifier le bouton "🎲 Aléatoire" pour régénérer la question avec seed
- Assurer la gestion d'abort lors des changements d'étape

### 5. Ajuster le flux de l'assistant
**Fichier:** `src/features/newgame/NewGameWizard.tsx`
- Simplifier le flux: difficulté → thème → position (avec génération de question)
- Supprimer l'étape de choix multiple de questions
- L'étape 3 devient directement l'étape de position

### 6. Mettre à jour l'état et les actions
**Fichier:** `src/features/newgame/state.ts`
- Simplifier l'état pour une seule question
- Supprimer `questions` array, garder seulement `question`
- Ajuster les actions si nécessaire

## Spécifications techniques

### Logging structuré
```typescript
// Activation: localStorage.setItem('debug_namespaces', 'agent:question,ui:phase0:question')

logger.info('agent:question', 'request', { theme, difficulty, seed })
logger.info('agent:question', 'success', { ms: 1250, questionPreview: 'L\'UE devrait...' })
logger.error('agent:question', 'failure', { ms: 8000, errType: 'timeout', message: '...' })

logger.debug('ui:phase0:question', 'enter', { theme, difficulty })
logger.debug('ui:phase0:question', 'reroll', { newSeed: 12345 })
logger.debug('ui:phase0:question', 'stance', { value: 'pour' })
```

### Génération de questions
- Utiliser `DebateIdeaService.generateDebateIdeaWrapped()`
- Timeout: 8 secondes
- Gestion d'abort via AbortController
- Nettoyage automatique des réponses
- Seed aléatoire pour le bouton "🎲"

### États UI
1. **Chargement**: Animation avec message "Génération de la question..."
2. **Succès**: Question affichée avec possibilité de changer de position
3. **Erreur**: Message d'erreur avec bouton "Réessayer"

## Critères d'acceptation
- ✅ Aucune question codée en dur
- ✅ Questions générées par l'agent IA
- ✅ Bouton "🎲" régénère la question
- ✅ Logs de test supprimés partout
- ✅ Logging structuré activable par `debug_namespaces`
- ✅ Gestion d'abort fonctionnelle
- ✅ Timeout de 8 secondes
- ✅ Interface réactive aux états de chargement/erreur

## Tests à effectuer
1. Chemin nominal: génération réussie
2. Régénération avec bouton "🎲"
3. Gestion d'erreur et retry
4. Navigation arrière/avant avec abort
5. Activation/désactivation des logs
6. Mesure des temps de génération

## Livrable
- Code modifié selon les spécifications
- Commentaire dans le code expliquant l'activation des namespaces de logs
- Fonctionnalité complète et testée