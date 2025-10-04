# 📋 Cahier des Charges - Chat Business Intégré

## 🎯 Objectif Global

Intégrer un système de messagerie contextuelle dans les profils business permettant des conversations privées et isolées entre un utilisateur et une entreprise, ou entre deux entreprises.

---

## 📊 Analyse de Faisabilité

### ✅ Infrastructure Existante (Points Forts)

#### 1. Base de Données
- ✅ Table `conversations` avec système d'origin (origin_type, origin_id)
- ✅ Table `messages` avec support multi-types (text, image, file, location, audio, action)
- ✅ Table `participants` pour gérer les membres
- ✅ Support des métadonnées JSON pour extensibilité
- ✅ Timestamps et statuts de lecture

#### 2. Edge Functions Supabase
- ✅ `create-conversation` : Création avec validation et participants
- ✅ `send-message` : Envoi avec validation Zod et actions
- ✅ Authentification JWT intégrée
- ✅ Gestion des erreurs robuste

#### 3. Frontend Architecture
- ✅ `MimoChatContext` : État global des conversations
- ✅ `MessageComposer` : Interface d'envoi avec médias
- ✅ `MessageBubble` : Affichage des messages
- ✅ Real-time subscriptions configurées
- ✅ Hooks optimisés (pagination, likes, favoris)

#### 4. Design System
- ✅ Tokens sémantiques HSL définis
- ✅ Composants UI réutilisables (Card, Tabs, ScrollArea)
- ✅ Mode sombre/clair supporté
- ✅ Animations et transitions cohérentes

### ⚠️ Adaptations Nécessaires

#### 1. Isolation des Conversations par Business
**Problème** : Actuellement, toutes les conversations sont mélangées
**Solution** :
- Filtrer par `origin_type = 'business'` AND `origin_id = businessId`
- Créer un hook `useBusinessConversation(businessId)`
- Assurer un participant unique par business pour éviter duplications

#### 2. Interface WhatsApp-Like
**Problème** : Design MIMO actuel différent
**Solution** :
- Créer `BusinessChatView.tsx` dédié
- Adapter couleurs (bulles vertes consommateur, grises business)
- Header personnalisé avec logo business
- Input bar avec toutes les options (attachements, emoji, micro)

#### 3. Support B2B
**Problème** : Logique actuelle orientée B2C
**Solution** :
- Détecter si l'utilisateur est en mode business (`user_current_mode`)
- Adapter les permissions (RLS policies)
- Interface adaptée pour professionnels

#### 4. Bouton WhatsApp Externe
**Problème** : Non implémenté
**Solution** :
- Récupérer le numéro WhatsApp du business profile
- Bouton avec deep link `https://wa.me/{number}`
- Fallback si numéro absent

---

## 📐 Architecture Technique

### 1. Structure des Données

#### Conversations Business
```typescript
interface BusinessConversation {
  id: string;
  origin_type: 'business'; // Toujours 'business'
  origin_id: string; // business_id
  title: string; // Nom du business
  type: 'private' | 'group'; // Toujours 'private' pour B2C/B2B direct
  last_activity: string;
  participants: [
    { user_id: string; role: 'consumer' | 'business' },
    { user_id: string; role: 'business' }
  ];
}
```

#### Messages Multi-Formats
```typescript
interface BusinessMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location';
  content: string;
  attachment_url?: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
}
```

### 2. Composants à Créer

#### `/src/components/business-chat/`
```
business-chat/
├── BusinessChatView.tsx        # Conteneur principal
├── BusinessChatHeader.tsx      # Header avec logo et infos business
├── BusinessChatMessages.tsx    # Liste des messages scrollable
├── BusinessChatInput.tsx       # Input avec médias et emoji
├── BusinessMessageBubble.tsx   # Bulle de message stylisée
├── MediaUploadButton.tsx       # Bouton upload universel
├── VoiceRecorder.tsx          # Enregistreur audio
└── WhatsAppRedirectButton.tsx # Bouton externe WhatsApp
```

### 3. Hooks Personnalisés

#### `useBusinessConversation.ts`
```typescript
export const useBusinessConversation = (businessId: string) => {
  // Récupérer ou créer la conversation unique avec ce business
  // Filtrer les messages par conversation_id
  // Gérer le real-time
  // Retourner { conversation, messages, sendMessage, isLoading }
}
```

#### `useMediaUpload.ts`
```typescript
export const useMediaUpload = () => {
  // Upload vers Supabase Storage
  // Support: images, audio, video, PDF, TXT
  // Compression automatique des images
  // Progress tracking
  // Retourner { uploadFile, progress, error }
}
```

### 4. Modifications des Pages

#### `BusinessDetailPage.tsx`
- Ajouter `<TabsTrigger value="chat">Chat</TabsTrigger>`
- Ajouter `<TabsContent value="chat"><BusinessChatView businessId={businessId} /></TabsContent>`

#### `BusinessProfilePage.tsx`
- Même modification pour le mode propriétaire
- Badge notification si nouveaux messages

---

## 🎨 Design et UX

### Inspiration WhatsApp (Capture Fournie)

#### 1. Header
- **Gauche** : Bouton retour + Logo business (cercle 40px)
- **Centre** : Nom business + Statut ("En ligne", "Hors ligne")
- **Droite** : Actions (appel, vidéo, menu)

#### 2. Zone de Messages
- **Background** : Motif subtil ou couleur unie (comme WhatsApp)
- **Bulles Consommateur** : Vert primary, alignées à droite
- **Bulles Business** : Gris clair, alignées à gauche
- **Timestamp** : Petit, gris, sous chaque bulle
- **Groupage** : Messages rapprochés (<5min) sans avatar répété
- **Médias** : Thumbnail cliquable, preview en modal
- **Statuts** : Checkmarks (✓ envoyé, ✓✓ lu)

#### 3. Input Bar
- **Placeholder** : "Message"
- **Boutons** :
  - 📎 Pièce jointe (ouvre menu : 📷 Photo, 🎥 Vidéo, 📄 Document, 📍 Position)
  - 😀 Emoji picker
  - 🎤 Enregistrement vocal (appui long)
  - ➤ Envoyer (apparaît quand texte non vide)

#### 4. Bouton WhatsApp
- **Position** : En haut du chat, badge distinct
- **Style** : Vert WhatsApp (#25D366), icône officielle
- **Texte** : "Continuer sur WhatsApp"
- **Action** : Ouvre WhatsApp avec numéro du business

### Adaptation au Design System Gaboma

```css
/* Couleurs à utiliser */
--chat-bubble-consumer: hsl(var(--primary)); /* Vert Gaboma */
--chat-bubble-business: hsl(var(--muted));
--chat-background: hsl(var(--background));
--chat-input-bg: hsl(var(--card));
--chat-input-border: hsl(var(--border));

/* Typographie */
--chat-message-font: var(--font-sans);
--chat-message-size: 0.875rem; /* 14px */
--chat-timestamp-size: 0.75rem; /* 12px */
```

---

## 🔒 Sécurité et Permissions

### RLS Policies à Vérifier

#### 1. Table `conversations`
```sql
-- Lecture : Utilisateur doit être participant
CREATE POLICY "Users can view their business conversations"
ON conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM participants 
    WHERE conversation_id = conversations.id 
    AND user_id = auth.uid()
  )
  AND origin_type = 'business'
);
```

#### 2. Table `messages`
```sql
-- Lecture : Utilisateur doit être dans la conversation
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM participants 
    WHERE conversation_id = messages.conversation_id 
    AND user_id = auth.uid()
  )
);

-- Insertion : Uniquement si participant
CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM participants 
    WHERE conversation_id = messages.conversation_id 
    AND user_id = auth.uid()
  )
  AND sender_id = auth.uid()
);
```

#### 3. Storage Policies (Médias)
```sql
-- Bucket 'chat-media'
CREATE POLICY "Users can upload chat media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view chat media in their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-media'
  -- Validation via métadonnées ou conversation_id dans path
);
```

---

## 📱 Fonctionnalités Détaillées

### 1. Envoi de Messages Texte
- [x] Champ textarea auto-redimensionnable
- [x] Bouton envoi désactivé si vide
- [x] Validation longueur (1-10000 caractères)
- [x] Support emojis natifs
- [x] Indication "en train d'écrire..."

### 2. Envoi d'Images
- [ ] Upload depuis galerie
- [ ] Capture photo directe (caméra)
- [ ] Compression automatique (max 2MB)
- [ ] Preview avant envoi
- [ ] Support formats : JPG, PNG, WebP
- [ ] Affichage thumbnail dans bulle
- [ ] Clic pour plein écran

### 3. Envoi de Fichiers
- [ ] Support : PDF, TXT, DOC, DOCX, XLS, XLSX
- [ ] Taille max : 10MB
- [ ] Icône selon type de fichier
- [ ] Nom et taille affichés
- [ ] Bouton téléchargement

### 4. Envoi Audio/Vidéo
- [ ] Enregistrement vocal : appui long sur 🎤
- [ ] Visualisation forme d'onde
- [ ] Durée max : 2 minutes
- [ ] Support vidéo : MP4, max 50MB
- [ ] Player intégré dans bulle

### 5. Localisation
- [ ] Partage position actuelle (GPS)
- [ ] Sélection sur carte (MapLibre)
- [ ] Affichage carte miniature dans bulle
- [ ] Clic ouvre Google Maps/itinéraire

### 6. Notifications
- [ ] Badge sur onglet "Chat" si nouveaux messages
- [ ] Notification push (si implémenté globalement)
- [ ] Marquage lu/non lu automatique

### 7. WhatsApp Integration
- [ ] Bouton visible si numéro renseigné
- [ ] Deep link avec message pré-rempli optionnel
- [ ] Fallback élégant si numéro absent

---

## 🚀 Plan d'Implémentation (6 Phases)

### Phase 1 : Infrastructure (1-2h)
1. Créer dossier `/src/components/business-chat/`
2. Créer hook `useBusinessConversation.ts`
3. Créer hook `useMediaUpload.ts`
4. Vérifier/ajuster RLS policies
5. Créer bucket Storage `chat-media` si nécessaire

### Phase 2 : Composants de Base (2-3h)
1. `BusinessChatView.tsx` : Conteneur principal
2. `BusinessChatHeader.tsx` : Header personnalisé
3. `BusinessChatMessages.tsx` : Zone de scroll
4. `BusinessMessageBubble.tsx` : Bulles stylisées
5. Tests isolation conversations

### Phase 3 : Input et Médias (3-4h)
1. `BusinessChatInput.tsx` : Barre de saisie complète
2. `MediaUploadButton.tsx` : Menu upload
3. `VoiceRecorder.tsx` : Enregistreur audio
4. Intégration emoji picker (library externe ou natif)
5. Tests upload/affichage médias

### Phase 4 : WhatsApp et UX (1-2h)
1. `WhatsAppRedirectButton.tsx`
2. Indicateur "en train d'écrire"
3. Statuts de lecture (checkmarks)
4. Animations et transitions
5. Mode sombre/clair

### Phase 5 : Intégration Pages (1h)
1. Ajouter onglet "Chat" dans `BusinessDetailPage`
2. Ajouter onglet "Chat" dans `BusinessProfilePage`
3. Badge notifications
4. Navigation fluide

### Phase 6 : Tests et Polish (1-2h)
1. Tests B2C (consommateur → business)
2. Tests B2B (business → business)
3. Tests médias (tous formats)
4. Tests real-time (2 utilisateurs simultanés)
5. Vérification responsive
6. Documentation utilisateur

**Durée Totale Estimée** : 10-14 heures de développement

---

## 📊 Métriques de Succès

### Fonctionnelles
- [ ] Conversation isolée par business (0 fuite entre business)
- [ ] Support 100% des formats médias annoncés
- [ ] Real-time opérationnel (<2s latence)
- [ ] Bouton WhatsApp fonctionnel

### Techniques
- [ ] RLS policies validées (aucune faille)
- [ ] Chargement initial <1s
- [ ] Upload médias <5s (2MB image)
- [ ] 0 régression sur pages existantes

### UX
- [ ] Design cohérent avec l'app
- [ ] Navigation intuitive
- [ ] Responsive parfait (mobile first)
- [ ] Accessibilité (ARIA labels, keyboard nav)

---

## ⚠️ Risques et Mitigation

### Risque 1 : Conversations Dupliquées
**Probabilité** : Moyenne
**Impact** : Élevé
**Mitigation** :
- Contrainte unique sur (origin_id, participant1, participant2)
- Vérification avant création dans edge function
- Hook qui recherche conversation existante d'abord

### Risque 2 : Upload Médias Lourds
**Probabilité** : Élevée
**Impact** : Moyen
**Mitigation** :
- Limites strictes (images 2MB, vidéos 50MB)
- Compression côté client avant upload
- Progress bar pour feedback utilisateur
- Timeout après 30s avec retry

### Risque 3 : Performance Real-Time
**Probabilité** : Faible
**Impact** : Moyen
**Mitigation** :
- Pagination messages (20 par requête)
- Unsubscribe au unmount
- Debounce sur "typing indicator"
- Indexation DB (conversation_id, created_at)

### Risque 4 : Sécurité (Fuite de Données)
**Probabilité** : Faible
**Impact** : Critique
**Mitigation** :
- Tests exhaustifs RLS policies
- Validation serveur (edge functions)
- Audit logs sur actions sensibles
- Review security scan Supabase

---

## 📚 Dépendances Techniques

### NPM Packages (À Ajouter)
```json
{
  "emoji-picker-react": "^4.x", // Optionnel, ou utiliser natif
  "react-audio-voice-recorder": "^2.x", // Pour enregistrement
  "compressorjs": "^1.x" // Compression images
}
```

### Supabase Features (Déjà OK)
- ✅ Realtime Subscriptions
- ✅ Storage (besoin bucket `chat-media`)
- ✅ Edge Functions (déjà 2 créées)
- ✅ RLS Policies (à ajuster)

---

## 🎓 Recommandations Finales

### Priorités de Développement
1. **🔥 Priorité 1** : Infrastructure + Composants base (Phases 1-2)
2. **⚡ Priorité 2** : Médias texte/image (Phase 3 partiel)
3. **📌 Priorité 3** : WhatsApp + UX polish (Phase 4)
4. **✨ Nice-to-have** : Audio/Vidéo, Localisation (Phase 3 avancé)

### Évolutions Futures (Post-MVP)
- Réactions aux messages (❤️, 👍, etc.)
- Répondre à un message spécifique (citation)
- Messages vocaux avec transcription
- Appels audio/vidéo intégrés (WebRTC)
- Archivage/recherche dans l'historique
- Export conversation PDF
- Chatbot automatique (réponses pré-définies)

---

## ✅ Validation et Approbation

Ce cahier des charges doit être validé avant implémentation pour s'assurer :
- ✅ Compréhension complète du besoin
- ✅ Faisabilité technique confirmée
- ✅ Estimation temps/ressources acceptée
- ✅ Priorisation des fonctionnalités validée
- ✅ Plan de tests défini

---

**Date de création** : 2025-10-04
**Auteur** : Lovable AI
**Version** : 1.0
**Statut** : ✅ Prêt pour validation client
