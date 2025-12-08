# Analyse du Système de Création de Catalogue

## Résumé
L'analyse approfondie du système de création de catalogue a révélé plusieurs problèmes critiques, allant de la perte de données silencieuse à des fonctionnalités incomplètes (mockups) présentées comme fonctionnelles.

## Bugs Corrigés (Immédiat)

### 1. Perte de Données Critique dans `use-create-catalog.ts`
**Sévérité : CRITIQUE 🔴**
- **Problème :** Le hook `useCreateCatalog` recevait un objet complet contenant toutes les informations du formulaire (catégorie, prix, images, contact, etc.) mais ne transmettait À LA BASE DE DONNÉES que le `nom` et la `description`. Toutes les autres données étaient ignorées silencieusement lors de l'insertion Supabase.
- **Correction :** Le hook a été réécrit pour mapper correctement tous les champs du formulaire vers les colonnes de la table `catalogs` (incluant `category`, `price_details`, `images` (JSONB), `delivery_zones`, etc.).

### 2. Logique de Navigation Défaillante dans `CatalogCreationWizard.tsx`
**Sévérité : MAJEURE 🟠**
- **Problème :** À l'étape 9 (Produits), le bouton "Terminer" était activé par défaut. Un utilisateur pouvait cliquer sur "Terminer" sans avoir cliqué sur le bouton central "Créer le catalogue". Cela fermait le wizard sans rien créer, ou retournait un ID `null`.
- **Correction :** La logique du bouton "Terminer" a été modifiée pour être désactivée tant que le catalogue n'a pas été explicitement créé via la fonction `handleCreateCatalog`.

## Bugs et Problèmes Identifiés (Restant à traiter)

### 3. Système de Création de Produits Incomplet
**Sévérité : MAJEURE 🟠**
- **Problème :** L'étape 9 affiche un composant `ProductManager`.
    - Ce composant est une coquille vide ("placeholder").
    - Le bouton "Ajouter un produit" change un état local `showCreateForm` mais aucune logique n'est implémentée pour afficher un formulaire.
- **Confusion des composants :** Il existe deux composants wizards pour les produits :
    1. `ProductCreationWizard.tsx` : Un mockup qui utilise `setTimeout` pour simuler une création (ne sauvegarde rien en base).
    2. `RealProductCreationWizard.tsx` : Un formulaire fonctionnel mais qui n'est connecté nulle part.
- **Incompatibilité de données :** `RealProductCreationWizard` utilise des champs en camelCase (`stockQuantity`, `isActive`) alors que la table `products` semble attendre du snake_case (`stock_quantity`, `is_available` - à vérifier selon le schéma exact).

### 4. Gestion des Images
**Sévérité : MOYENNE 🟡**
- **Suggéré :** Le hook `useCreateCatalog` reçoit maintenant les objets images bruts du wizard. Il est recommandé de vérifier que la colonne `images` de la table `catalogs` est bien de type `JSONB` pour stocker les métadonnées des images (url, path, id), et non un simple tableau de chaînes, pour assurer la compatibilité avec le composant `MultiImageEnforcer`.

## Recommandations Techniques Prioritaires

1.  **Intégration des Produits :**
    - Dans `ProductManager.tsx`, importer `RealProductCreationWizard`.
    - Afficher ce wizard dans un `Dialog` quand `showCreateForm` est vrai.
    - Créer une fonction d'adaptation pour transformer les données de `RealProductCreationWizard` (camelCase) vers le format attendu par `useProductManagement` (snake_case).
    - Supprimer le fichier `ProductCreationWizard.tsx` (mock) pour éviter la confusion.

2.  **Nettoyage du Code :**
    - Vérifier l'usage de `CreateCatalogPage.tsx` (formulaire manuel) vs `CatalogCreationWizard.tsx`. Si le Wizard est la méthode officielle, rediriger ou supprimer l'ancienne page.

## État Actuel
Le système de création de **Catalogue** est maintenant fonctionnel (création en base de données et navigation sécurisée). L'ajout de **Produits** dans ce catalogue reste à connecter.
