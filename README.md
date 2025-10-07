# 🗳️ Political Madness

Un jeu de débat politique interactif où vous affrontez une IA sur des sujets clivants. Développé avec TypeScript, Vite et l'API Google Generative AI (Gemini).

## 🚀 Fonctionnalités

- **Débats intelligents** : Débattez avec une IA personnalisée sur des sujets controversés
- **4 personnages IA** : Chaque adversaire a sa propre personnalité et style de communication
  - Alex (Conservateur) - Traditionnel et prudent
  - Marie (Libérale) - Progressiste et ouverte d'esprit
  - Thomas (Centriste) - Équilibré et pragmatique
  - Luna (Radicale) - Passionnée et idéaliste
- **Plusieurs thèmes** : Politique, Société, Économie, Environnement, Santé, Éducation
- **Système de persuasion** : Vos arguments influencent une jauge de persuasion
- **3 niveaux de difficulté** : Facile, Moyen, Difficile
- **5 duels par partie** : Chaque duel comprend 3 échanges

## 🛠️ Technologies utilisées

- **TypeScript** : Typage statique pour une meilleure maintenabilité
- **Vite** : Build tool moderne et rapide
- **Tailwind CSS** : Framework CSS utilitaire
- **Google Generative AI** : API Gemini pour les réponses intelligentes de l'IA
- **Font Awesome** : Icônes

## 📋 Prérequis

- Node.js 18+ et npm/yarn
- Une connexion internet (pour l'API Google Generative AI)

## 🔧 Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd Political-Madness
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

## 🎮 Démarrage

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Build de production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

### Prévisualisation de production

```bash
npm run preview
```

### Vérification des types

```bash
npm run type-check
```

## 📁 Structure du projet

```
Political-Madness/
├── src/
│   ├── types/
│   │   └── index.ts          # Types et interfaces TypeScript
│   ├── ai-characters.ts      # Gestion des personnages IA
│   ├── game-logic.ts         # Logique du jeu
│   ├── langchain-config.ts   # Configuration de l'API Gemini
│   ├── main.ts              # Point d'entrée principal
│   └── styles.css           # Styles personnalisés
├── index.html               # Page HTML principale
├── vite.config.ts          # Configuration Vite
├── tsconfig.json           # Configuration TypeScript
├── package.json            # Dépendances et scripts
└── README.md               # Ce fichier
```

## 🎯 Comment jouer

1. **Configurez votre partie** :
   - Entrez votre nom
   - Choisissez la difficulté
   - Sélectionnez un thème
   - Choisissez votre adversaire IA
   - Prenez position (pour ou contre)

2. **Débattez** :
   - Lisez l'idée clivante proposée par le journaliste
   - Répondez à l'argument de l'IA
   - Construisez vos arguments sur 3 échanges

3. **Gagnez** :
   - Vos arguments influencent la jauge de persuasion
   - Plus vous êtes convaincant, plus la jauge penche en votre faveur
   - Complétez 5 duels pour terminer la partie

## 🎨 Personnalisation

### Modifier les thèmes

Les thèmes sont définis dans `src/game-logic.ts` dans l'objet `themes`. Vous pouvez ajouter ou modifier les idées clivantes.

### Ajouter un personnage IA

Dans `src/ai-characters.ts`, ajoutez un nouveau personnage dans le constructeur de `AICharacterManager`.

### Modifier les paramètres de l'IA

Dans `src/langchain-config.ts`, vous pouvez ajuster les paramètres de génération :
- `temperature` : Créativité des réponses (0-1)
- `topP` : Diversité des réponses (0-1)
- `topK` : Nombre de tokens considérés
- `maxOutputTokens` : Longueur maximale des réponses

## 🔐 Sécurité

⚠️ **Important** : La clé API est actuellement hardcodée dans le code (`src/main.ts`). Pour une application en production, il est recommandé de :
- Utiliser des variables d'environnement
- Implémenter un backend qui gère l'API
- Ne jamais exposer les clés API côté client

## 🐛 Dépannage

### L'IA ne répond pas
- Vérifiez votre connexion internet
- Vérifiez que la clé API Google est valide
- Consultez la console du navigateur pour les erreurs

### Erreurs de build
```bash
# Nettoyer les dépendances
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache Vite
rm -rf dist .vite
npm run build
```

## 📝 License

Ce projet est sous licence privée. Tous droits réservés.

## 👤 Auteur

Développé pour Fun par Adrien FOURNIE EI

## 🤝 Contribution

Ce projet est actuellement privé. Pour toute suggestion ou rapport de bug, contactez le développeur.

## 📚 Ressources

- [Documentation Vite](https://vitejs.dev/)
- [Documentation TypeScript](https://www.typescriptlang.org/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [Google Generative AI](https://ai.google.dev/)
