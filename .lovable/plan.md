# Réparer la connexion et l'écran blanc

## Ce que l'analyse a trouvé (vérifié)
- **Cause principale : le serveur de comptes de l'application n'existe plus.** L'adresse de votre projet Supabase (`yqtkmjjjdjfnwhtxmhdn.supabase.co`) ne répond plus du tout (adresse introuvable). Toute connexion, inscription et chargement de données échoue donc, quel que soit le code. Cela arrive quand un projet Supabase gratuit est mis en pause longtemps ou supprimé.
- Le bouton « Continuer sans compte » existe et ouvre bien l'accueil, mais il est petit et en bas de l'écran ; les pages restent ensuite vides car aucune donnée ne peut être chargée.
- Quand une requête échoue, certaines pages plantent et affichent un écran blanc au lieu d'un message.

## Ce que vous devez faire (indispensable)
Dans votre tableau de bord Supabase, réactivez (« Restore ») le projet. S'il a été supprimé, il faudra connecter un nouveau projet ; je referai alors la structure des données.

## Ce que je corrigerai dans l'application
1. **Bouton « Entrer sans compte » bien visible** sur l'écran de connexion et sur le formulaire de connexion, qui ouvre toute l'application sans restriction, même si le serveur est injoignable.
2. **Plus d'écran blanc** : un filet de sécurité global affiche « Une erreur est survenue » avec un bouton « Recharger » et « Retour à l'accueil » au lieu d'une page vide.
3. **Message clair si le serveur est injoignable** : à la connexion/inscription, afficher « Service momentanément indisponible » au lieu d'un échec silencieux, et proposer d'entrer sans compte.
4. **Pages tolérantes aux pannes** : l'accueil, le profil et la messagerie affichent un état vide propre au lieu de planter ou charger sans fin.
5. Vérification dans le navigateur : connexion, mode sans compte, navigation entre les onglets, sans écran blanc.

## Détails techniques
- `ErrorBoundary` global autour des routes dans `App.tsx`.
- `AuthService` : détecter `TypeError: Failed to fetch` et renvoyer une erreur « service indisponible ».
- `RoleBasedRouter` : le drapeau `gb_prototype_access` contourne aussi les vérifications de rôle/profil (pas d'appel serveur bloquant).
- `AuthContext`/hooks de profil : timeouts et `try/catch` pour que `loading` passe toujours à `false`.
