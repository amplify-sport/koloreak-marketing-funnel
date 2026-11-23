/**
 * Test local de la génération de posts Instagram via l'IA Gemini
 * 
 * Usage :
 *   node scripts/test-gemini-prompt.js
 *   node scripts/test-gemini-prompt.js --theme balayage_signature
 *   node scripts/test-gemini-prompt.js --theme coloration_vegetale
 */

const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Charger l'environnement
const envPath = path.resolve(__dirname, "../functions/.env");
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split(/\r?\n/).forEach(line => {
        const parts = line.split("=");
        if (parts.length >= 2 && !line.trim().startsWith("#")) {
            const key = parts[0].trim();
            const val = parts.slice(1).join("=").trim();
            process.env[key] = val;
        }
    });
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ Erreur : GEMINI_API_KEY introuvable dans functions/.env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const THEMES = [
    {
        id: "coloration_vegetale",
        nom: "Coloration Végétale & Chimie Douce",
        sujet: "Couvrir ses cheveux blancs naturellement avec les poudres de plantes sans aucun produit chimique, ou opter pour une chimie douce raisonnée afin de préserver sa santé.",
        hashtags: ["#Koloreak", "#ColorationVegetale", "#ChimieDouce", "#CheveuxSains", "#CoiffeurBayonne", "#Bayonne", "#QuartierSaintEsprit", "#PaysBasque"]
    },
    {
        id: "balayage_signature",
        nom: "Balayage & Éclaircissement Sur-Mesure",
        sujet: "Le secret d'un balayage lumineux sans effet racine : fondu subtil, dépollution de la fibre capillaire et patine gloss.",
        hashtags: ["#Koloreak", "#BalayageBayonne", "#BlondSurMesure", "#DepollutionCapillaire", "#GlossCapillaire", "#CoiffeurBayonne", "#PaysBasque"]
    },
    {
        id: "spa_bien_etre",
        nom: "Soin Capillaire & Massage Crânien Détente",
        sujet: "Offrez-vous une parenthèse détente au salon : soin lumière ou argile sous apport thermique (chaleur douce) et massage crânien relaxant au bac.",
        hashtags: ["#Koloreak", "#SoinCapillaire", "#MassageCranien", "#BienEtreBayonne", "#DetenteAbsolue", "#SoinArgile", "#GreenBotox", "#PaysBasque"]
    },
    {
        id: "salon_ambiance",
        nom: "Salon, Décoration Terracotta & Ambiance Bois",
        sujet: "Bienvenue au 37 Rue Maubec : des murs peints en terracotta rappelant les pigments naturels, du mobilier en bois et une atmosphère apaisante pour votre bien-être.",
        hashtags: ["#Koloreak", "#SalonDeCoiffureBayonne", "#Terracotta", "#MatieresNaturelles", "#CoiffeurBayonne", "#BayonneMaubec", "#PaysBasque"]
    }
];

async function run() {
    const args = process.argv.slice(2);
    const themeArgIdx = args.indexOf("--theme");
    const themeTarget = themeArgIdx !== -1 ? args[themeArgIdx + 1] : null;

    const selectedTheme = THEMES.find(t => t.id === themeTarget) || THEMES[0];

    console.log(`🌿 Simulation de génération pour Koloreak (Thème: ${selectedTheme.nom})...\n`);

    const prompt = `
Tu es la gérante et coloriste passionnée du salon de coiffure "Koloreak", situé au 37 Rue Maubec à Bayonne (Quartier Saint-Esprit, Pays Basque).

CADRE ET DÉCORATION DU SALON :
Le salon est conçu comme un véritable cocon de douceur et d'authenticité. Les peintures des murs sont terracotta / terre cuite, un choix chaleureux qui fait directement écho aux pigments naturels utilisés dans les colorations du salon. Le mobilier fait la part belle aux matières naturelles comme le bois, pour une atmosphère lumineuse, bienveillante et reposante.

LE POINT LE PLUS IMPORTANT (PHILOSOPHIE PRODUITS & RESPECT DE LA SANTÉ) :
Le salon Koloreak travaille avec des PRODUITS NATURELS :
1. Colorations 100% végétales aux poudres de plantes tinctoriales, SANS AUCUN PRODUIT CHIMIQUE (soin gainant, brillance pure, respect de la fibre).
2. Couleurs raisonnées en chimie douce : pour les clientes et clients souhaitant une alternative douce, formulée pour LIMITER AU MAXIMUM L'IMPACT DES PRODUITS CHIMIQUES SUR LA SANTÉ.
Notre mission : préserver la santé des clientes et clients, respecter la nature du cuir chevelu et sublimer la matière sans jamais l'agresser.

CARTE OFFICIELLE DES PRESTATIONS DU SALON (SEULES TECHNIQUES ET PRESTATIONS EXISTANTES) :
Ne promouvoir et ne parler QUE des prestations réelles proposées au salon :
• COLORATION CHIMIE DOUCE OU VÉGÉTALE :
  - Coloration végétale 100% plantes sans chimie (application racines, double application pour couverture 100% des cheveux blancs, forfait végétale express à emporter sous son bonnet chaud sans rinçage ni coiffage, diagnostic personnalisé offert si prestation).
  - Coloration chimie douce / couleur raisonnée en racines ou tête entière avec soin profond et brushing.
  - Suppléments : coupe associée, allongement des longueurs.
• ÉCLAIRCISSEMENT & BALAYAGE SUR-MESURE :
  - Éclaircissement sur mesure avec dépollution de la fibre capillaire, soin réparateur profond et brushing (courts, mi-longs, longs).
  - Suppléments : allongement, supplément ombré, coupe associée.
• GLOSS / PATINE / BAIN DE PLANTES :
  - Bain de brillance et patine neutralisante avec soin traitant (courts à mi-longs, longs), coupe associée.
• SOINS BIEN-ÊTRE CAPILLAIRE ("CHACUN SON SOIN") :
  - Soin lumière ou argile sous apport thermique (chaleur douce) + shampoing + massage crânien relaxant au bac + soin hydratant + brushing.
  - Soin argile express préparateur avant coloration végétale (détoxifie la fibre et ouvre les écailles).
  - Soin Green Botox ou Green Détox (cure de jouvence capillaire végétale reconstructrice & réparatrice).
• COUPE & MISE EN FORME FEMME :
  - Forfaits complets : shampoing, soin, coupe et brushing (courts, mi-longs, longs ou coupe transformation).
  - Coupe dame très courte, entretien ou création de frange.
  - Mise en forme : brushing lisse ou wavy, supplément cheveux très épais / longs, attache ou chignon événementiel sur devis.
  - Retouche racines instantanée express (part au prochain lavage).
• HOMME :
  - Shampoing relaxant, soin cuir chevelu, coupe et coiffage.
  - Taille de barbe soignée et traçage des contours.
  - Soin détoxifiant spécifique aux plantes ou argiles + massage crânien relaxant + coupe.
  - Coloration homme ciblée (camoufler les tempes et zone frontale) ou tête entière en chimie douce/végétale raisonnée.
• ENFANT / ADO :
  - Coupes tout-petits (0 à 5 ans), juniors (5 à 12 ans) et forfaits ados (12 à 18 ans).

INTERDICTIONS STRICTES ET FORMELLES (RÈGLES D'OR DU SALON) :
1. STRICTEMENT INTERDIT DE PROMOUVOIR D'AUTRES TECHNIQUES OU PRODUITS NON PROPOSÉS AU SALON :
   - Ne JAMAIS mentionner de lissages brésiliens ou chimiques conventionnels,
   - Ne JAMAIS parler de permanentes chimiques traditionnelles,
   - Ne JAMAIS évoquer d'extensions capillaires,
   - Ne JAMAIS citer de marques de la pétrochimie ou produits décapants agressifs non utilisés au salon.
   - Rester STRICTEMENT dans le cadre de ce qui est proposé à la carte de Koloreak.
2. ÉVITER TOUT MESSAGE DE TYPE "HOLLISTIQUE" OU TROP SPIRITUEL :
   - Ne JAMAIS utiliser le mot "holistique".
   - Bannir toute dérive ésotérique, astrologique, New Age, énergies mystiques ou croyances perchées.
   - Ne JAMAIS tomber dans le "rituel chamanique" !
   - En revanche, METTRE EN AVANT LE BIEN-ÊTRE, LA DÉTENTE, LA RELAXATION, LE LÂCHER-PRISE et le confort d'un moment pour soi dans un cadre bienveillant.

Rédige une publication Instagram percutante, chaleureuse et élégante pour le compte du salon.

Thème du post : "${selectedTheme.nom}"
Sujet précis : "${selectedTheme.sujet}"
Lien de réservation : https://www.planity.com/koloreak-64100-bayonne

RÈGLES STRICTES DE RÉDACTION INSTAGRAM :
1. TON : Chaleureux, solaire, expert, bienveillant, orienté bien-être et santé du cheveu. Parle directement à la lectrice ("vous"), crée de l'émotion et de l'envie sans jamais être agressif commercialement.
2. ACCROCHE (Première ligne) : Une phrase forte et captivante qui interpelle la lectrice dans son fil d'actualité, accompagnée d'un emoji élégant (🌿, ✨, 💆‍♀️, 🤎, ☀️, ✂️).
3. CORPS DU POST (2 à 3 paragraphes courts et aérés) :
   - Explique concrètement le bienfait (respect de la santé, produits naturels, coloration végétale sans chimie ou chimie douce, toucher soyeux, éclat, détente).
   - Évoque le cadre si approprié (murs terracotta rappelant les pigments naturels, mobilier bois, massage relaxant au bac).
   - Donne un conseil d'experte facile à comprendre.
4. APPEL À L'ACTION (CTA) :
   - Invite chaleureusement à réserver son créneau sur Planity (lien en bio) ou à envoyer un message privé (DM) pour un conseil personnalisé.
   - Mentionne le salon au 37 Rue Maubec à Bayonne (Quartier Saint-Esprit).
5. HASHTAGS : Termine impérativement par une sélection de 10 à 15 hashtags dont : ${selectedTheme.hashtags.join(" ")} #KoloreakCoiffure #BayonneMaubec #QuartierSaintEsprit
6. NE METS AUCUN GUILLEMET autour du texte.
7. Ne génère pas de titre markdown (# Titre), utilise des sauts de ligne naturels et de superbes emojis.
8. LONGUEUR STRICTE : Reste impérativement entre 1 100 et 1 650 caractères au total (Instagram bloque les légendes > 2 200 caractères).
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("================================================================================");
        console.log("✨ POST INSTAGRAM GÉNÉRÉ AVEC SUCCÈS :");
        console.log("================================================================================\n");
        console.log(text);
        console.log("\n================================================================================");
    } catch (e) {
        console.error("❌ Erreur lors de la génération :", e.message);
    }
}

run();
