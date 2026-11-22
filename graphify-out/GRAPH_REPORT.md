# Graph Report - Koloreak marketing funnel  (2026-11-22)

## Corpus Check
- 14 files · ~13,652 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .csv 1, .rules 1)

## Summary
- 142 nodes · 166 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ea4890fd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.js
- package.json
- functions/package.json
- sync-photos.js
- injecteur-clients.js
- 🌿 Koloreak - Funnel Marketing & Automatisation Instagram
- get-instagram-token.js
- test-gemini-prompt.js
- scripts
- 📸 Dossier des Photos Réelles du Salon Koloreak

## God Nodes (most connected - your core abstractions)
1. `scripts` - 9 edges
2. `🌿 Koloreak - Funnel Marketing & Automatisation Instagram` - 7 edges
3. `scripts` - 6 edges
4. `executerGenerationInstagram()` - 5 edges
5. `publierSurInstagram()` - 4 edges
6. `appSalon()` - 4 edges
7. `@google/generative-ai` - 4 edges
8. `loadClientsFromCsv()` - 4 edges
9. `firebase-functions` - 3 edges
10. `nodemailer` - 3 edges

## Surprising Connections (you probably didn't know these)
- `appSalon()` --calls--> `getPortalHtml()`  [EXTRACTED]
  functions/index.js → functions/portal.js

## Import Cycles
- None detected.

## Communities (11 total, 1 thin omitted)

### Community 0 - "index.js"
Cohesion: 0.09
Nodes (21): admin, appSalon(), bucket, db, executerGenerationInstagram(), genAI, getPhotoForTheme(), { GoogleGenerativeAI } (+13 more)

### Community 1 - "package.json"
Cohesion: 0.09
Nodes (22): author, dependencies, firebase-admin@^13.10.0, description, devDependencies, dotenv@^16.4.7, firebase-admin, keywords (+14 more)

### Community 2 - "functions/package.json"
Cohesion: 0.13
Nodes (18): dependencies, firebase-admin@^13.10.0, firebase-functions@^7.4.0, @google/generative-ai@^0.24.1, nodemailer@^10.6.0, description, devDependencies, firebase-functions-test@^3.4.1 (+10 more)

### Community 3 - "sync-photos.js"
Cohesion: 0.12
Nodes (12): fs, path, catalog, categories, fs, outputPath, path, photosDir (+4 more)

### Community 4 - "injecteur-clients.js"
Cohesion: 0.16
Nodes (12): admin, args, csvFileArg, csvPath, detectDelimiter(), fs, isDryRun, loadClientsFromCsv() (+4 more)

### Community 5 - "🌿 Koloreak - Funnel Marketing & Automatisation Instagram"
Cohesion: 0.20
Nodes (9): 1. Variables d'Environnement (`functions/.env`), 2. Comment Obtenir les Accès Instagram Graph API ?, 📁 Architecture du Projet, 🛠️ Commandes Disponibles, ⚙️ Configuration & Installation, ☁️ Déploiement sur Firebase, 🔗 Dépôt GitHub, 🚀 Fonctionnalités Clés (+1 more)

### Community 6 - "get-instagram-token.js"
Cohesion: 0.28
Nodes (7): ask(), fs, main(), path, readline, rl, verifyToken()

### Community 7 - "test-gemini-prompt.js"
Cohesion: 0.25
Nodes (6): envPath, fs, genAI, { GoogleGenerativeAI }, path, THEMES

### Community 8 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, deploy, logs, serve, shell, start

### Community 9 - "📸 Dossier des Photos Réelles du Salon Koloreak"
Cohesion: 0.50
Nodes (3): 🚀 Comment ça marche ?, 📸 Dossier des Photos Réelles du Salon Koloreak, 📁 Organisation par thématiques :

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@google/generative-ai` connect `functions/package.json` to `index.js`, `test-gemini-prompt.js`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Should `index.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09401709401709402 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `functions/package.json`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09486166007905138 - nodes in this community are weakly interconnected._
- **Why does `firebase-functions` connect `functions/package.json` to `index.js`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `functions/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.13450292397660818 - nodes in this community are weakly interconnected._
- **Should `sync-photos.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11695906432748537 - nodes in this community are weakly interconnected._