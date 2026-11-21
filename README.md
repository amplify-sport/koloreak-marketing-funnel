# 🌿 Koloreak - Funnel Marketing & Automatisation Instagram

Système d'acquisition, de fidélisation et de publication automatique sur Instagram conçu pour le salon de coiffure holistique **Koloreak** (Bayonne, Pays Basque), propulsé par **Google Gemini AI**, **Firebase Cloud Functions (v2)** et **Meta Graph API**.

Ce projet adapte et sublime la stratégie d'automatisation marketing de VibeCoder pour l'univers de la coiffure, du bien-être et de la coloration végétale.

---

## 🚀 Fonctionnalités Clés

1. **Génération de Contenu IA Spécialisé Coiffure & Beauté** :
   - Rédigé avec la voix et le ton de Koloreak : bienveillant, solaire, expert, chaleureux.
   - Piliers de contenu stratégiques :
     - 🌿 **Coloration Végétale & Botanique** (gainage du cheveu, brillance, couverture naturelle des cheveux blancs sans oxydation).
     - ✨ **Balayage & Éclaircissement Sur-Mesure** (blonds lumineux, French balayage, patine gloss sans effet racine).
     - 💆‍♀️ **Spa Capillaire & Massage Crânien** (détente, soins profonds, cuir chevelu sain).
     - ✂️ **Avant / Après & Métamorphoses** (mises en valeur des coupes et des textures).
     - 💡 **Conseils d'Experte & Routine Maison** (astuces soins, protection sel/soleil, espacement des shampoings).
     - 📅 **Créneaux Disponibles & Réservations** (appels à l'action vers la page Planity du salon).
   - Suggestions de visuels pour chaque post (types de photos ou vidéos à privilégier).
   - Sélection automatique de hashtags locaux et spécialisés (#Koloreak, #CoiffeurBayonne, #ColorationVegetale, #PaysBasque...).

2. **Publication Automatique sur Instagram (Meta Graph API)** :
   - Publication programmée 3 fois par semaine (mardis, jeudis et dimanches à 12h00) ou sur demande.
   - Création de conteneurs médias Instagram puis publication directe via les APIs officielles Meta.
   - Enregistrement immédiat dans Firestore (`instagram_posts`) sous statut `brouillon` ou `publie`.

3. **Déclencheurs HTTP & Gestion des Brouillons** :
   - Générer et tester immédiatement un post via URL HTTP (`/testerPublicationInstagram?theme=balayage_signature`).
   - Approuver et publier un brouillon existant en 1 clic (`/publierBrouillonExistant?id=...`).

4. **Module CRM & Relance Clientèle (Fidélisation)** :
   - Importation en lot des fiches clientes depuis un fichier CSV (`injecteur-clients.js`).
   - Génération de messages personnalisés de suivi post-coloration / post-soin (6-8 semaines après le dernier passage).

---

## 📁 Architecture du Projet

```text
Koloreak marketing funnel/
├── firestore.rules                  # Règles de sécurité Firestore production (accès restreint & typé)
├── firebase.json                    # Configuration Firebase Functions & Firestore
├── .firebaserc                      # Configuration du projet Firebase par défaut
├── package.json                     # Dépendances et scripts utilitaires
├── clients.example.csv              # Exemple de fichier CSV pour l'import de clientes
├── injecteur-clients.js             # Script d'importation et de relance CRM
├── scripts/
│   ├── test-gemini-prompt.js        # Test local immédiat de génération avec Gemini
│   ├── get-instagram-token.js       # Assistant interactif pour configurer Instagram Graph API
│   └── upload-instagram-post.js     # Script de publication manuelle sur Instagram
└── functions/
    ├── package.json                 # Dépendances Cloud Functions (Node 20+)
    ├── .env                         # Clés secrètes (non versionnées)
    ├── .env.example                 # Modèle de variables d'environnement
    └── index.js                     # Cœur Cloud Functions v2 (Gemini, Instagram, Schedulers)
```

---

## ⚙️ Configuration & Installation

### 1. Variables d'Environnement (`functions/.env`)

Le fichier `functions/.env` contient la configuration nécessaire :

```env
# Clé Gemini AI (déjà configurée)
GEMINI_API_KEY=AIzaSy...

# Instagram Graph API (Meta for Developers)
INSTAGRAM_ACCOUNT_ID=178414...
INSTAGRAM_ACCESS_TOKEN=EAAG...
AUTO_PUBLISH_INSTAGRAM=false   # Mettre à true dès que vos clés Instagram sont prêtes

# Paramètres du salon
DEFAULT_MEDIA_URL=https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80
PLANITY_URL=https://www.planity.com/koloreak-64100-bayonne
SALON_PHONE=0535395164
SALON_ADDRESS=37 Rue Maubec, 64100 Bayonne
```

### 2. Comment Obtenir les Accès Instagram Graph API ?

1. Assurez-vous que le compte Instagram **Koloreak** est un compte **Professionnel** ou **Créateur**.
2. Liez ce compte Instagram à une **Page Facebook** (via les paramètres de la page ou Meta Business Suite).
3. Rendez-vous sur le portail [Meta for Developers](https://developers.facebook.com/) et créez une application (type *Business*).
4. Ajoutez le produit **Instagram Graph API**.
5. Générez un Token d'accès utilisateur ou de page avec les permissions :
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
6. Lancez l'assistant interactif pour vérifier votre token et récupérer automatiquement votre ID de compte :
   ```bash
   npm run test:instagram
   ```

---

## 🛠️ Commandes Disponibles

| Commande | Action |
| :--- | :--- |
| `npm run test:prompt` | Teste instantanément la génération d'un post Instagram avec Gemini dans votre terminal. |
| `npm run test:instagram` | Vérifie votre token Meta et affiche les pages et comptes Instagram connectés. |
| `npm run post:manual` | Publie manuellement une image et une légende sur le compte Instagram. |
| `node injecteur-clients.js --dry-run` | Simule l'import du fichier `clients.csv` sans écrire dans la base. |
| `npm run inject:clients` | Injecte les clientes dans Firestore pour déclencher les rappels automatiques. |
| `npm run deploy:functions` | Déploie les Cloud Functions sur votre compte Firebase. |
| `npm run deploy:firestore` | Déploie les règles de sécurité Firestore. |
| `npm run deploy:all` | Déploie l'ensemble du projet sur Firebase. |

---

## ☁️ Déploiement sur Firebase

1. Associez votre projet Firebase (ou créez-en un nouveau) :
   ```bash
   firebase use --add
   ```
2. Déployez les fonctions et les règles :
   ```bash
   firebase deploy
   ```
3. Une fois déployée, vous disposerez d'une URL de test HTTP :
   - `https://<region>-<projet>.cloudfunctions.net/testerPublicationInstagram?theme=coloration_vegetale`
   - Ajoutez `&publish=true` pour publier directement sur le compte Instagram.

---

## 🔗 Dépôt GitHub

Le projet est configuré sur le dépôt GitHub :
👉 **https://github.com/amplify-sport/koloreak-marketing-funnel**
