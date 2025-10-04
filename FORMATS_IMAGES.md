# 📐 Formats d'images de la plateforme

## Formats officiels utilisés

### 1. Images carrées (1:1)
**Dimensions : 1300×1300 px**

#### Utilisations :
- ✅ Logo d'entreprise
- ✅ Image de couverture de profil business
- ✅ Photo de profil utilisateur
- ✅ Image de couverture utilisateur
- ✅ Images de catalogues
- ✅ Photos de produits

#### Spécifications techniques :
- **Résolution** : 1300×1300 pixels (format carré strict)
- **Ratio** : 1:1
- **Taille max** : 5 MB (avant compression)
- **Formats acceptés** : JPEG, PNG, WEBP
- **Compression automatique** : OUI
- **Format de sortie** : WEBP (si < 2MB) ou JPEG (si > 2MB)
- **Qualité** : 92% (ajustée automatiquement si nécessaire)

---

### 2. Images panoramiques (16:9)
**Dimensions : 1920×1080 px**

#### Utilisations :
- ✅ Bannières multi-images
- ✅ Images de héros de page
- ✅ Visuels promotionnels larges

#### Spécifications techniques :
- **Résolution** : 1920×1080 pixels
- **Ratio** : 16:9
- **Taille max** : 5 MB
- **Formats acceptés** : JPEG, PNG, WEBP
- **Compression automatique** : OUI

---

## Règles de validation

### Dimensions minimales
- **Minimum absolu** : 800 pixels sur la plus petite dimension
- Si l'image fait moins de 800px, elle sera rejetée avec un message d'erreur

### Processus de traitement automatique
1. **Upload** de l'image par l'utilisateur
2. **Validation** des dimensions minimales (800px)
3. **Recadrage** automatique au centre si nécessaire
4. **Redimensionnement** aux dimensions cibles exactes (1300×1300 ou 1920×1080)
5. **Compression** progressive jusqu'à atteindre la taille maximale autorisée
6. **Conversion** au format optimal (WEBP ou JPEG)
7. **Upload** vers Supabase Storage avec cache de 1 an

### Qualité de compression
L'application essaie plusieurs niveaux de qualité dans cet ordre :
1. 92% (par défaut)
2. 90%
3. 85%
4. 80%
5. 75%
6. 70%

Le système s'arrête dès qu'une compression atteint la taille cible.

---

## Recommandations pour les utilisateurs

### Pour les logos et photos de profil
- ✅ Utilisez des images carrées de préférence
- ✅ Minimum 1300×1300 px recommandé
- ✅ Fond simple pour faciliter la compression
- ✅ Format PNG avec transparence supporté

### Pour les images de couverture
- ✅ Images carrées 1300×1300 px
- ✅ Évitez les images trop détaillées (compression difficile)
- ✅ Privilégiez les aplats de couleur pour un poids optimal

### Pour les bannières panoramiques
- ✅ Format 16:9 strict (1920×1080 px)
- ✅ Texte lisible même après compression
- ✅ Contrastes marqués

---

## Optimisation des performances

### Cache
- **Durée** : 1 an (31 536 000 secondes)
- **CDN** : Supabase Storage avec distribution globale
- **Chargement** : Lazy loading automatique

### Format de sortie
- **WEBP** : Pour les images < 2 MB (meilleure compression)
- **JPEG** : Pour les images > 2 MB (compatibilité maximale)

---

## Messages d'erreur courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| "L'image doit être au moins 800px sur sa plus petite dimension" | Image trop petite | Utilisez une image de meilleure résolution |
| "Votre image dépasse 2 MB après optimisation" | Image trop complexe | Simplifiez l'image ou réduisez les détails |
| "Le fichier doit être une image" | Format non supporté | Utilisez JPEG, PNG ou WEBP uniquement |

---

## Exemples de bonnes pratiques

### ✅ BON
- Logo simple sur fond uni : 150 KB après compression
- Photo de produit bien éclairée : 200 KB
- Bannière avec 2-3 couleurs : 180 KB

### ❌ MAUVAIS
- Photo ultra-détaillée avec texture complexe : 2.5 MB (rejetée)
- Image avec beaucoup de texte superposé : difficile à compresser
- Photo floue ou pixelisée : mauvaise qualité visuelle

---

## Intégration technique

### Composants concernés
- `ProfileImageUploader.tsx` - Photos de profil carrées 1300×1300
- `CoverImageUploader.tsx` - Images de couverture carrées 1300×1300  
- `ImageEnforcer.tsx` - Catalogues et produits 1300×1300
- `MultiImageEnforcer.tsx` - Bannières 1920×1080

### Hook principal
- `useEnhancedImageUpload.ts` - Gère tout le traitement automatique

---

**Dernière mise à jour** : 2025-10-04
