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
        nom: "Coloration Végétale & Botanique",
        sujet: "Couvrir ses cheveux blancs naturellement avec les poudres de plantes sans effet racine brutal ni oxydation.",
        hashtags: ["#Koloreak", "#ColorationVegetale", "#CoiffureNaturelle", "#CheveuxSains", "#CoiffeurBayonne", "#Bayonne", "#PaysBasque"]
    },
    {
        id: "balayage_signature",
        nom: "Balayage & Éclaircissement Sur-Mesure",
        sujet: "Le secret d'un balayage lumineux sans effet racine : un fondu subtil pensé sur-mesure pour votre coupe.",
        hashtags: ["#Koloreak", "#BalayageBayonne", "#BlondSurMesure", "#FrenchBalayage", "#CoiffeurBayonne", "#PaysBasque"]
    },
    {
        id: "spa_bien_etre",
        nom: "Spa Capillaire & Massage Crânien",
        sujet: "Offrez-vous une parenthèse hors du temps : l'expérience de notre massage crânien pour libérer toutes les tensions.",
        hashtags: ["#Koloreak", "#SpaCapillaire", "#MassageCranien", "#BienEtreBayonne", "#DetenteAbsolue", "#CoiffureHolistique"]
    }
];

async function run() {
    const args = process.argv.slice(2);
    const themeArgIdx = args.indexOf("--theme");
    const themeTarget = themeArgIdx !== -1 ? args[themeArgIdx + 1] : null;

    const selectedTheme = THEMES.find(t => t.id === themeTarget) || THEMES[0];

    console.log(`🌿 Simulation de génération pour Koloreak (Thème: ${selectedTheme.nom})...\n`);

    const prompt = `
Tu es la gérante et coloriste passionnée du salon de coiffure holistique "Koloreak", situé au 37 Rue Maubec à Bayonne.
Ton salon est réputé pour sa bienveillance, son expertise en coloration végétale, ses balayages lumineux personnalisés et ses rituels spa du cheveu.

Rédige une publication Instagram percutante et chaleureuse pour le compte du salon.

Thème du post : "${selectedTheme.nom}"
Sujet précis : "${selectedTheme.sujet}"
Lien de réservation : https://www.planity.com/koloreak-64100-bayonne

RÈGLES STRICTES DE RÉDACTION INSTAGRAM :
1. TON : Chaleureux, solaire, expert, bienveillant et authentique. Parle directement à la cliente ("vous"), crée de l'émotion et de l'envie sans jamais être agressif commercialement.
2. ACCROCHE (Première ligne) : Une phrase forte et captivante qui interpelle la lectrice dans son fil d'actualité, accompagnée d'un emoji élégant.
3. CORPS DU POST (2 à 3 paragraphes courts et aérés) :
   - Explique concrètement le bienfait (toucher du cheveu, éclat, respect de la santé, moment de détente).
   - Donne un conseil ou une explication d'experte facile à comprendre.
4. APPEL À L'ACTION (CTA) :
   - Invite chaleureusement à réserver son créneau sur Planity (lien en bio) ou à envoyer un message privé (DM) pour un conseil personnalisé.
   - Mentionne le salon au 37 Rue Maubec à Bayonne.
5. HASHTAGS : Termine impérativement par une sélection de 10 hashtags dont : ${selectedTheme.hashtags.join(" ")} #KoloreakCoiffure #BayonneMaubec
6. NE METS AUCUN GUILLEMET autour du texte.
7. Ne génère pas de titre markdown, utilise des sauts de ligne naturels et de superbes emojis.
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
