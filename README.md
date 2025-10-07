# 🗳️ Political Madness
*Where Persuasion Meets Chaos*

Un jeu de débat politique interactif où vous affrontez des personnages IA avec différentes personnalités politiques. Testez vos compétences de persuasion et défendez vos positions sur des sujets clivants !

## 🎮 Fonctionnalités

- **4 Personnages IA uniques** : Alex (Conservateur), Marie (Libérale), Thomas (Centriste), Luna (Radicale)
- **6 Thèmes de débat** : Politique, Société, Économie, Environnement, Santé, Éducation
- **3 Niveaux de difficulté** : Facile, Moyen, Difficile
- **Système de persuasion** : Barre de progression en temps réel
- **IA avancée** : Réponses contextuelles et personnalisées avec Google Gemini
- **Interface moderne** : Design responsive avec Tailwind CSS

## 🚀 Installation et Utilisation

### 🌐 Prévisualisation en ligne
[![Prévisualiser le jeu](https://img.shields.io/badge/🎮%20Prévisualiser%20le%20jeu-htmlpreview.github.io-blue?style=for-the-badge)](https://htmlpreview.github.io/?https://github.com/Insomniak313/Political-Madness/blob/main/index.html)

### Méthode 1 : Serveur local
```bash
# Cloner le projet
git clone <repository-url>
cd political-madness

# Démarrer un serveur local
python3 -m http.server 8080
# ou
npx serve .

# Ouvrir dans le navigateur
http://localhost:8080
```

### Méthode 2 : Ouverture directe
Ouvrez simplement le fichier `index.html` dans votre navigateur web.

## 🔑 Configuration de l'IA

Pour utiliser les fonctionnalités avancées de l'IA, vous aurez besoin d'une clé API Google :

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créez une nouvelle clé API
3. Entrez-la dans le jeu quand demandé

*Note : Le jeu fonctionne aussi sans clé API avec des réponses prédéfinies.*

## 🎯 Comment jouer

1. **Configuration** : Choisissez votre nom, difficulté, thème et adversaire IA
2. **Position** : Définissez si vous êtes "Pour" ou "Contre" l'idée proposée
3. **Débat** : Répondez aux arguments de l'IA en 3 échanges maximum
4. **Persuasion** : Surveillez votre barre de persuasion (0-100%)
5. **Victoire** : Terminez 5 duels avec le meilleur score possible !

## 🧠 Personnages IA

### 👔 Alex - Le Conservateur
- **Personnalité** : Traditionnel, respectueux des institutions
- **Style** : Formel, références historiques
- **Agressivité** : 6/10
- **Valeurs** : Ordre, stabilité, famille traditionnelle

### 🌱 Marie - La Libérale  
- **Personnalité** : Progressiste, ouverte d'esprit
- **Style** : Chaleureuse, exemples concrets
- **Agressivité** : 4/10
- **Valeurs** : Liberté, égalité, justice sociale

### ⚖️ Thomas - Le Centriste
- **Personnalité** : Équilibré, pragmatique
- **Style** : Analytique, cherche le consensus
- **Agressivité** : 3/10
- **Valeurs** : Compromis, efficacité, dialogue

### 🔥 Luna - La Radicale
- **Personnalité** : Passionnée, idéaliste
- **Style** : Émotionnelle, appels à l'action
- **Agressivité** : 9/10
- **Valeurs** : Révolution, justice absolue, changement radical

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Styling** : Tailwind CSS
- **IA** : Google Gemini 1.5 Flash
- **Icons** : Font Awesome
- **Fonts** : Google Fonts (Inter)

## 📁 Structure du Projet

```
political-madness/
├── index.html              # Page principale
├── js/
│   ├── main.js            # Logique principale et interactions
│   ├── game-logic.js      # Mécaniques de jeu
│   ├── ai-characters.js   # Personnages IA
│   └── langchain-config.js # Configuration IA
└── README.md              # Documentation
```

## 🎨 Personnalisation

Vous pouvez facilement :
- Ajouter de nouveaux thèmes dans `game-logic.js`
- Créer de nouveaux personnages dans `ai-characters.js`
- Modifier l'interface dans `index.html`
- Ajuster les paramètres IA dans `langchain-config.js`

## 🐛 Dépannage

**Le jeu ne se charge pas ?**
- Vérifiez que vous utilisez un serveur local (pas d'ouverture directe du fichier)
- Vérifiez la console du navigateur pour les erreurs

**L'IA ne répond pas ?**
- Vérifiez votre clé API Google
- Vérifiez votre connexion internet
- Le jeu utilise des réponses de secours si l'IA échoue

**Problèmes de performance ?**
- Fermez les autres onglets du navigateur
- Vérifiez que JavaScript est activé

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation
- Ajouter de nouveaux personnages ou thèmes

---

*Amusez-vous bien et que le meilleur orateur gagne ! 🏆*
