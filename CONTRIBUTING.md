# 🤝 Guide de Contribution - ConsoGab / Mimo Chat

Bienvenue ! Ce document décrit les standards de code et les processus à suivre pour contribuer au projet.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration de développement](#configuration-de-développement)
3. [Standards de code](#standards-de-code)
4. [Process de développement](#process-de-développement)
5. [Tests et validation](#tests-et-validation)
6. [Architecture du projet](#architecture-du-projet)

---

## ✅ Prérequis

- **Node.js** : v18+ recommandé
- **Gestionnaire de paquets** : npm, yarn ou bun
- **IDE** : VS Code (recommandé) avec les extensions :
  - ESLint
  - Prettier ESLint
  - TypeScript and JavaScript Language Features

---

## 🔧 Configuration de développement

### 1. Installation initiale

```bash
# Cloner le repository
git clone <repository-url>
cd <project-directory>

# Installer les dépendances
npm install

# Configurer les hooks Git (Husky)
npm run prepare

# Lancer le serveur de développement
npm run dev
```

### 2. Configuration de l'éditeur

Le projet inclut une configuration VS Code (`.vscode/settings.json`) qui active automatiquement :
- ✅ Auto-fix ESLint à la sauvegarde
- ✅ Formatage automatique
- ✅ Validation TypeScript en temps réel

---

## 📐 Standards de code

### ESLint : Configuration ultra robuste

Ce projet utilise une **configuration ESLint stricte et automatisée** :

#### Règles principales :
- ❌ **Erreurs bloquantes** :
  - `no-undef` : Variables non déclarées
  - `eqeqeq` : Comparaisons strictes obligatoires (`===` au lieu de `==`)
  - `@typescript-eslint/no-non-null-assertion` : Pas d'assertion `!` non nulle
  - `react-hooks/rules-of-hooks` : Respecter les règles des hooks React

- ⚠️ **Avertissements** :
  - `no-console` : Console.log autorisé uniquement pour `warn` et `error`
  - `@typescript-eslint/no-explicit-any` : Éviter `any`, utiliser `unknown`
  - `react-hooks/exhaustive-deps` : Dépendances complètes dans les hooks

- 🔧 **Auto-correction** :
  - `unused-imports/no-unused-imports` : Suppression automatique des imports inutilisés
  - `indent`, `quotes`, `semi`, `comma-dangle` : Style uniforme

#### Scripts disponibles :

```bash
# Vérifier le code
npm run lint

# Corriger automatiquement les erreurs
npm run lint:fix
```

### TypeScript

- ✅ **Types stricts** : Pas de `any` sans justification (utiliser `unknown`)
- ✅ **Interfaces claires** : Définir des interfaces pour toutes les structures de données
- ✅ **Pas de `!` (non-null assertion)** : Gérer explicitement les `null`/`undefined`

Exemple :
```typescript
// ❌ Mauvais
function processData(data: any) {
  return data.value!;
}

// ✅ Bon
interface DataStructure {
  value?: string;
}

function processData(data: DataStructure): string {
  return data.value ?? 'default';
}
```

### React

- ✅ **Hooks** : Respecter les règles (pas de conditions, ordre stable)
- ✅ **Props typées** : Toujours typer les props des composants
- ✅ **Pas de `console.log`** : Utiliser le système de logging (`src/lib/logger.ts`)

Exemple :
```tsx
import { createDomainLogger } from '@/lib/logger';

const logger = createDomainLogger('MyComponent');

export function MyComponent({ userId }: { userId: string }) {
  logger.info('Component mounted', { userId });
  // ...
}
```

---

## 🔄 Process de développement

### 1. Créer une branche

```bash
git checkout -b feature/nom-de-la-fonctionnalite
# ou
git checkout -b fix/nom-du-bug
```

### 2. Développement

- 🔨 **Écrire du code propre** respectant les standards ESLint
- 📝 **Commiter régulièrement** avec des messages clairs
- ✅ **Tester manuellement** les changements

### 3. Pre-commit automatique

**Husky + lint-staged** vérifie automatiquement votre code avant chaque commit :

```bash
git add .
git commit -m "feat: ajout de la fonctionnalité X"
```

✅ Si le code passe ESLint → commit accepté  
❌ Si erreurs ESLint → commit bloqué, corriger d'abord

### 4. Pull Request

Avant de soumettre une PR :

```bash
# Vérifier le linting complet
npm run lint

# Corriger automatiquement si possible
npm run lint:fix

# Builder le projet
npm run build
```

**Checklist PR** :
- [ ] Code respecte ESLint (zéro erreur)
- [ ] Pas de `console.log` en dehors de `console.warn`/`console.error`
- [ ] Types TypeScript corrects (pas de `any`)
- [ ] Fonctionnalité testée manuellement
- [ ] Documentation mise à jour si nécessaire

---

## 🧪 Tests et validation

### Validation locale (avant push)

```bash
# Linting complet
npm run lint

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

### CI/CD (automatique)

Le pipeline CI vérifie automatiquement :
- ✅ ESLint sans erreur
- ✅ Build réussie
- ✅ Types TypeScript valides

---

## 🏗️ Architecture du projet

### Structure des dossiers

```
src/
├── components/        # Composants React réutilisables
│   ├── auth/         # Authentification
│   ├── business/     # Gestion des entreprises
│   ├── messaging/    # Système de messagerie
│   └── ui/           # Composants UI de base (shadcn/ui)
├── contexts/         # Contextes React (state global)
├── hooks/            # Custom hooks
├── lib/              # Utilitaires et helpers
│   └── logger.ts     # Système de logging centralisé
├── pages/            # Pages de l'application
└── integrations/     # Intégrations externes (Supabase, etc.)
```

### Conventions de nommage

- **Composants** : `PascalCase` (`MyComponent.tsx`)
- **Hooks** : `camelCase` avec préfixe `use` (`useMyHook.ts`)
- **Utilitaires** : `kebab-case` (`my-util.ts`)
- **Types/Interfaces** : `PascalCase` (`MyInterface`)

---

## 📚 Ressources supplémentaires

- [Guide TypeScript](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifier les logs ESLint : `npm run lint`
2. Consulter la documentation dans `/docs`
3. Ouvrir une issue sur GitHub avec :
   - Description du problème
   - Logs d'erreur
   - Étapes pour reproduire

---

**Merci de contribuer au projet ConsoGab / Mimo Chat ! 🚀**
