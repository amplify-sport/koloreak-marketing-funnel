const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const nodemailer = require("nodemailer");
const { getPortalHtml, SALON_PIN_DEFAULT, BUCKET_NAME } = require("./portal");

// ============================================================================
// 1. INITIALISATIONS GLOBALES
// ============================================================================
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket(BUCKET_NAME);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_EMAIL || "",
        pass: process.env.GMAIL_PASSWORD || ""
    }
});

// ============================================================================
// 2. STRATÉGIE MARKETING SALON DE COIFFURE "KOLOREAK" (Bayonne / Pays Basque)
// ============================================================================
const SALON_INFOS = {
    nom: "Koloreak",
    activite: "Salon de coiffure bien-être, coloriste végétal et chimie douce",
    adresse: process.env.SALON_ADDRESS || "37 Rue Maubec, 64100 Bayonne",
    telephone: process.env.SALON_PHONE || "06 14 73 53 28",
    planityUrl: process.env.PLANITY_URL || "https://www.planity.com/koloreak-64100-bayonne",
    decoration: "Murs peints en terracotta (terre cuite), rappelant directement les pigments naturels utilisés dans les colorations du salon, et mobilier en matières naturelles comme le bois chaleureux.",
    philosophie: "Priorité absolue aux produits naturels et au respect de la santé des clientes et clients : colorations 100% végétales aux plantes tinctoriales sans produits chimiques, et couleurs raisonnées en chimie douce afin de limiter au maximum l'impact des substances chimiques sur la santé.",
    valeurs: [
        "Coloration 100% végétale et botanique sans aucun produit chimique",
        "Couleur raisonnée en chimie douce pour préserver la santé des clients",
        "Balayages et blonds lumineux sur-mesure avec dépollution de la fibre capillaire",
        "Rituels de soins capillaires bien-être (argile sous apport thermique doux, massage crânien relaxant, Green Botox)",
        "Ambiance chaleureuse et apaisante (murs terracotta & mobilier bois au 37 Rue Maubec à Bayonne)",
        "Diagnostic personnalisé et respect absolu de la matière naturelle du cheveu"
    ]
};

const THEMES_MARKETING = [
    {
        id: "coloration_vegetale",
        nom: "Coloration Végétale & Chimie Douce",
        description: "Mettre en avant les produits naturels : coloration 100% végétale sans produits chimiques (poudres de plantes) et couleur raisonnée en chimie douce pour limiter au maximum l'impact des produits chimiques sur la santé.",
        sujets: [
            "Pourquoi choisir la coloration végétale : la métamorphose d'un cheveu respecté, gainé et éclatant sans aucun produit chimique.",
            "Couvrir 100% de ses cheveux blancs naturellement avec nos protocoles en simple ou double application végétale.",
            "Coloration raisonnée et chimie douce : comment nous limitons au maximum l'exposition aux produits chimiques pour préserver votre santé.",
            "La brillance incomparable des poudres de plantes tinctoriales sous la belle lumière de Bayonne.",
            "Préparer ses cheveux au végétal : diagnostic personnalisé et soin préparateur à l'argile."
        ],
        hashtags: [
            "#Koloreak", "#ColorationVegetale", "#ChimieDouce", "#CouleurRaisonnee",
            "#CoiffeurBayonne", "#Bayonne", "#QuartierSaintEsprit", "#PaysBasque", "#PlantesTinctoriales",
            "#CoiffureNaturelle", "#CheveuxSains", "#SanteDuCheveu"
        ],
        typeVisuel: "Gros plan sur une chevelure brillante aux reflets chauds en lumière naturelle, bol avec préparation de poudres de plantes et bois naturel."
    },
    {
        id: "balayage_signature",
        nom: "Balayage & Éclaircissement Sur-Mesure",
        description: "Sublimer la chevelure avec un fondu ultra-naturel, dépollution de la fibre capillaire, soin réparateur et patine gloss pour un résultat lumineux sans démarcation.",
        sujets: [
            "Le secret d'un balayage lumineux sans effet racine : un fondu subtil pensé sur-mesure pour votre coupe.",
            "L'étape clé de la dépollution de la fibre capillaire lors de notre forfait éclaircissement pour un blond sain et pur.",
            "Le pouvoir de la patine / gloss : redonner un éclat miroir et neutraliser les reflets indésirables tout en douceur.",
            "Balayage sur-mesure et soin réparateur : capter la lumière sans altérer la vitalité de vos longueurs.",
            "Entretenir son balayage pour qu'il reste éclatant plusieurs mois après votre passage au 37 Rue Maubec."
        ],
        hashtags: [
            "#Koloreak", "#BalayageBayonne", "#BlondSurMesure", "#DepollutionCapillaire",
            "#CoiffeurBayonne", "#PaysBasque", "#GlossCapillaire", "#PatineCheveux",
            "#HairTransformation", "#ColoristeBayonne"
        ],
        typeVisuel: "Photo de dos et trois-quarts mettant en valeur un dégradé de balayage ondulé (wavy) avec une belle luminosité."
    },
    {
        id: "spa_bien_etre",
        nom: "Soin Capillaire & Massage Crânien Détente",
        description: "Vivre une véritable parenthèse de détente et de bien-être : soins à l'argile sous apport thermique (chaleur douce), massage crânien relaxant au bac, soin Green Botox réparateur.",
        sujets: [
            "Offrez-vous une parenthèse détente au salon : l'expérience de notre massage crânien pour dénouer toutes les tensions.",
            "Soin lumière ou argile sous chaleur douce : purifier le cuir chevelu et réhydrater intensément les longueurs.",
            "Soin Green Botox & Détox végétale : une cure de jouvence capillaire naturelle pour réparer et fortifier la fibre.",
            "Fatigue, changement de saison ou stress : le protocole bien-être pour revitaliser vos racines en toute sérénité.",
            "Prendre soin de soi au cœur de Bayonne : venez vous détendre dans notre salon aux teintes terracotta et laissez vos cheveux respirer."
        ],
        hashtags: [
            "#Koloreak", "#SoinCapillaire", "#MassageCranien", "#BienEtreBayonne",
            "#DetenteAbsolue", "#SoinArgile", "#GreenBotox", "#BayonneMaubec",
            "#PrendreSoinDeSoi", "#PaysBasque"
        ],
        typeVisuel: "Atmosphère cocooning, serviette douce, vapeur de soin, mains prodiguant un massage au bac dans une ambiance apaisante."
    },
    {
        id: "avant_apres",
        nom: "Avant / Après & Coupes Transformation",
        description: "Présenter des métamorphoses réelles de clientes : coupe transformation, passage au végétal, nouvelle fraîcheur coupe et brushing wavy.",
        sujets: [
            "Transformation du jour : passer d'une couleur terne à un balayage éclatant plein de reflets vivants.",
            "Du long abîmé au carré structuré : oser la coupe qui valorise les traits du visage et redonne du volume.",
            "Retrouver des cheveux sains et denses grâce à la couleur végétale et aux soins bien-être.",
            "Lumière sur une métamorphose tout en subtilité : respecter la personnalité tout en révélant la beauté naturelle.",
            "Avant / Après : le pouvoir d'une coupe personnalisée et d'un gloss rafraîchissant pour dynamiser l'allure."
        ],
        hashtags: [
            "#Koloreak", "#AvantApresCoiffure", "#BeforeAndAfterHair", "#TransformationCapillaire",
            "#CoiffureBayonne", "#PaysBasque", "#CheveuxSains", "#CoupeFemme"
        ],
        typeVisuel: "Collage ou carrousel Avant / Après avec cadrage identique et éclairage professionnel mettant en avant la texture."
    },
    {
        id: "salon_ambiance",
        nom: "Salon, Décoration Terracotta & Ambiance Bois",
        description: "Partager l'atmosphère authentique et chaleureuse du salon : les murs terracotta rappelant les pigments naturels, le mobilier en bois et l'accueil bienveillant.",
        sujets: [
            "Bienvenue au 37 Rue Maubec : des murs terracotta chaleureux qui font écho aux pigments naturels de nos colorations végétales.",
            "Matières naturelles et mobilier en bois : notre écrin de détente pensé pour votre confort à Bayonne.",
            "Une pause douceur et bien-être : poussez la porte de Koloreak pour un moment rien que pour vous.",
            "L'harmonie des teintes terre cuite et des plantes : l'ambiance apaisante de notre salon au cœur du quartier Saint-Esprit."
        ],
        hashtags: [
            "#Koloreak", "#SalonDeCoiffureBayonne", "#Terracotta", "#MatieresNaturelles",
            "#CoiffeurBayonne", "#BayonneMaubec", "#QuartierSaintEsprit", "#PaysBasque", "#AmbianceCocooning"
        ],
        typeVisuel: "Vue chaleureuse de l'intérieur du salon : murs terracotta, mobilier en bois, miroirs et plantes vertes."
    },
    {
        id: "conseils_experte",
        nom: "Conseils d'Experte & Santé du Cheveu",
        description: "Partager des astuces professionnelles faciles pour entretenir la santé du cheveu : soins doux, espacement des lavages, protection.",
        sujets: [
            "Les 3 erreurs courantes sous la douche qui fragilisent la fibre et ternissent votre éclat.",
            "Pourquoi et comment espacer ses lavages avec des shampoings doux sans sulfates agressifs.",
            "Protéger ses cheveux du vent marin, du soleil et du sel : nos conseils bien-être au Pays Basque.",
            "À quelle fréquence rafraîchir sa coupe ou sa frange pour conserver une matière vigoureuse ?"
        ],
        hashtags: [
            "#Koloreak", "#ConseilsCapillaires", "#SanteDuCheveu", "#RoutineCheveux",
            "#CoiffeurBayonne", "#Bayonne", "#CheveuxNaturels", "#ProduitsSains"
        ],
        typeVisuel: "Photo soignée de soins capillaires naturels, brosse en bois ou geste de coiffage précis."
    },
    {
        id: "agenda_dispos",
        nom: "Disponibilités & Rendez-vous Planity",
        description: "Créer l'envie et faciliter la prise de rendez-vous en ligne sur Planity pour des moments de détente et mise en beauté.",
        sujets: [
            "Envie d'un moment de détente et d'un coup d'éclat cette semaine ? Réservez votre créneau en 1 clic sur Planity.",
            "Quelques créneaux disponibles pour votre coloration végétale, balayage ou soin massage au salon.",
            "Votre parenthèse bien-être vous attend au 37 Rue Maubec à Bayonne. Rendez-vous en ligne 24h/24."
        ],
        hashtags: [
            "#Koloreak", "#CoiffeurBayonne", "#Planity", "#RendezVousCoiffure",
            "#Bayonne", "#BayonneMaubec", "#PaysBasque", "#SalonDeCoiffure"
        ],
        typeVisuel: "Fauteuil confortable du salon, miroir baigné de lumière douce et espace coiffage soigné."
    }
];

// ============================================================================
// 3. HELPER : PUBLICATION SUR INSTAGRAM (Meta Graph API)
// ============================================================================
/**
 * Publie une photo avec légende sur un compte Instagram Professionnel via l'API Graph Meta.
 * Nécessite : INSTAGRAM_ACCOUNT_ID et INSTAGRAM_ACCESS_TOKEN.
 * @param {string} imageUrl - URL publique de l'image (accessible par les serveurs Meta)
 * @param {string} caption - Légende complète avec emojis et hashtags
 * @returns {Promise<{ success: boolean, mediaId?: string, error?: string }>}
 */
async function publierSurInstagram(imageInput, caption) {
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accountId || !token) {
        const msg = "Identifiants Instagram manquants (INSTAGRAM_ACCOUNT_ID ou INSTAGRAM_ACCESS_TOKEN dans .env).";
        console.warn("⚠️ " + msg);
        return { success: false, error: msg };
    }

    const images = Array.isArray(imageInput) ? imageInput : [imageInput];

    try {
        if (images.length > 1) {
            console.log(`📸 Création d'un Carrousel Instagram avec ${images.length} photos...`);
            
            // 1. Créer chaque item individuel du carrousel
            const itemIds = [];
            for (let i = 0; i < images.length; i++) {
                const itemUrl = new URL(`https://graph.facebook.com/v20.0/${accountId}/media`);
                itemUrl.searchParams.append("image_url", images[i]);
                itemUrl.searchParams.append("is_carousel_item", "true");
                itemUrl.searchParams.append("access_token", token);

                const itemRes = await fetch(itemUrl.toString(), { method: "POST" });
                const itemData = await itemRes.json();

                if (!itemRes.ok || !itemData.id) {
                    const errStr = JSON.stringify(itemData.error || itemData);
                    console.error(`❌ Erreur création item carrousel #${i + 1} :`, errStr);
                    return { success: false, error: `Item carrousel #${i + 1}: ${errStr}` };
                }
                itemIds.push(itemData.id);
            }

            console.log(`✅ ${itemIds.length} items créés. Création du conteneur carrousel...`);

            // 2. Créer le conteneur carrousel principal
            const carouselUrl = new URL(`https://graph.facebook.com/v20.0/${accountId}/media`);
            carouselUrl.searchParams.append("media_type", "CAROUSEL");
            carouselUrl.searchParams.append("children", itemIds.join(","));
            carouselUrl.searchParams.append("caption", caption);
            carouselUrl.searchParams.append("access_token", token);

            const carouselRes = await fetch(carouselUrl.toString(), { method: "POST" });
            const carouselData = await carouselRes.json();

            if (!carouselRes.ok || !carouselData.id) {
                const errStr = JSON.stringify(carouselData.error || carouselData);
                console.error("❌ Erreur création conteneur carrousel :", errStr);
                return { success: false, error: `Conteneur carrousel: ${errStr}` };
            }

            const creationId = carouselData.id;
            console.log(`✅ Conteneur carrousel créé (ID: ${creationId}). Attente 4s...`);
            await new Promise(r => setTimeout(r, 4000));

            // 3. Publier le carrousel
            const publishUrl = new URL(`https://graph.facebook.com/v20.0/${accountId}/media_publish`);
            publishUrl.searchParams.append("creation_id", creationId);
            publishUrl.searchParams.append("access_token", token);

            const publishRes = await fetch(publishUrl.toString(), { method: "POST" });
            const publishData = await publishRes.json();

            if (!publishRes.ok || !publishData.id) {
                const errStr = JSON.stringify(publishData.error || publishData);
                console.error("❌ Erreur publication carrousel :", errStr);
                return { success: false, error: `Publication carrousel: ${errStr}` };
            }

            console.log(`🎉 Carrousel Instagram publié avec succès ! ID Média : ${publishData.id}`);
            return { success: true, mediaId: publishData.id };

        } else {
            // Publication photo unique classique
            const singleImageUrl = images[0];
            console.log(`📸 Étape 1 : Création du conteneur média unique pour le compte ${accountId}...`);
            
            const containerUrl = new URL(`https://graph.facebook.com/v20.0/${accountId}/media`);
            containerUrl.searchParams.append("image_url", singleImageUrl);
            containerUrl.searchParams.append("caption", caption);
            containerUrl.searchParams.append("access_token", token);

            const containerRes = await fetch(containerUrl.toString(), { method: "POST" });
            const containerData = await containerRes.json();

            if (!containerRes.ok || !containerData.id) {
                const errStr = JSON.stringify(containerData.error || containerData);
                console.error("❌ Erreur création conteneur Instagram :", errStr);
                return { success: false, error: `Création conteneur: ${errStr}` };
            }

            const creationId = containerData.id;
            console.log(`✅ Conteneur créé avec succès (ID: ${creationId}). Attente 3s...`);
            await new Promise(r => setTimeout(r, 3000));

            const publishUrl = new URL(`https://graph.facebook.com/v20.0/${accountId}/media_publish`);
            publishUrl.searchParams.append("creation_id", creationId);
            publishUrl.searchParams.append("access_token", token);

            const publishRes = await fetch(publishUrl.toString(), { method: "POST" });
            const publishData = await publishRes.json();

            if (!publishRes.ok || !publishData.id) {
                const errStr = JSON.stringify(publishData.error || publishData);
                console.error("❌ Erreur publication finale Instagram :", errStr);
                return { success: false, error: `Publication: ${errStr}` };
            }

            console.log(`🎉 Post Instagram publié avec succès ! ID Média : ${publishData.id}`);
            return { success: true, mediaId: publishData.id };
        }
    } catch (err) {
        console.error("❌ Exception lors de l'appel Instagram Graph API :", err);
        return { success: false, error: err.message || String(err) };
    }
}

let photosCatalog = {};
try {
    photosCatalog = require("./photos-catalog.json");
} catch (e) {
    photosCatalog = {};
}

function getPhotoForTheme(themeId) {
    const list = photosCatalog[themeId] || [];
    if (list.length > 0) {
        return list[Math.floor(Math.random() * list.length)];
    }
    const allPhotos = Object.values(photosCatalog).flat();
    if (allPhotos.length > 0) {
        return allPhotos[Math.floor(Math.random() * allPhotos.length)];
    }
    return process.env.DEFAULT_MEDIA_URL || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80";
}

// ============================================================================
// 4. MOTEUR IA GEMINI : GÉNÉRATION DU POST & ENREGISTREMENT FIRESTORE
// ============================================================================
async function executerGenerationInstagram(options = {}) {
    let photosDocs = [];
    let imageUrls = [];
    let notesPhotos = [];
    let themeChoisi = null;

    // 1. Si des IDs précis de photos ont été sélectionnés
    if (Array.isArray(options.photoIds) && options.photoIds.length > 0) {
        for (const pid of options.photoIds) {
            try {
                const s = await db.collection("photos_salon").doc(pid).get();
                if (s.exists) {
                    photosDocs.push(s);
                    const d = s.data();
                    if (d.url) imageUrls.push(d.url);
                    if (d.note) notesPhotos.push(d.note);
                    if (!themeChoisi && d.themeId) {
                        themeChoisi = THEMES_MARKETING.find(t => t.id === d.themeId);
                    }
                }
            } catch (e) {
                console.warn("Erreur lecture photo doc :", e.message);
            }
        }
    } else if (options.imageUrl) {
        imageUrls.push(options.imageUrl);
        if (options.note) notesPhotos.push(options.note);
    }

    if (!themeChoisi) {
        themeChoisi = options.themeId
            ? (THEMES_MARKETING.find(t => t.id === options.themeId) || THEMES_MARKETING[0])
            : THEMES_MARKETING[Math.floor(Math.random() * THEMES_MARKETING.length)];
    }

    // 2. Si aucune image spécifiée, chercher en priorité une vraie photo du salon dans Firestore
    if (imageUrls.length === 0) {
        try {
            const snapTheme = await db.collection("photos_salon")
                .where("used", "==", false)
                .where("themeId", "==", themeChoisi.id)
                .orderBy("createdAt", "asc")
                .limit(1)
                .get();

            if (!snapTheme.empty) {
                const doc = snapTheme.docs[0];
                photosDocs.push(doc);
                imageUrls.push(doc.data().url);
                if (doc.data().note) notesPhotos.push(doc.data().note);
            } else {
                const snapAny = await db.collection("photos_salon")
                    .where("used", "==", false)
                    .orderBy("createdAt", "asc")
                    .limit(1)
                    .get();
                if (!snapAny.empty) {
                    const doc = snapAny.docs[0];
                    photosDocs.push(doc);
                    imageUrls.push(doc.data().url);
                    if (doc.data().note) notesPhotos.push(doc.data().note);
                }
            }
        } catch (e) {
            console.warn("⚠️ Recherche photo salon en réserve :", e.message);
        }
    }

    if (imageUrls.length === 0) {
        imageUrls.push(getPhotoForTheme(themeChoisi.id));
    }

    const isCarousel = imageUrls.length > 1;
    const sujetDuJour = options.sujet || themeChoisi.sujets[Math.floor(Math.random() * themeChoisi.sujets.length)];
    const hashtagsStr = themeChoisi.hashtags.join(" ");

    let noteInstruction = "";
    if (notesPhotos.length > 0) {
        noteInstruction = `
INDICATION PARTICULIÈRE DE LA COIFFEUSE SUR CETTE RÉALISATION :
"${notesPhotos.join(" • ")}"
Prends impérativement en compte cette précision dans ton texte pour décrire avec fidélité, élégance et enthousiasme le résultat obtenu en salon.
`;
    }

    if (options.customInstruction && options.customInstruction.trim()) {
        noteInstruction += `
CONSIGNE SPÉCIFIQUE DE LA COIFFEUSE POUR CE POST :
"${options.customInstruction.trim()}"
Prends impérativement en compte cette consigne dans ta rédaction.
`;
    }

    if (isCarousel) {
        noteInstruction += `
NOTE SPÉCIALE CARROUSEL : Cette publication est un CARROUSEL / ALBUM de ${imageUrls.length} photos présentant le travail du salon. Invite explicitement la lectrice à faire défiler vers la gauche pour découvrir la transformation complète et tous les détails de cette réalisation !
`;
    }

    const defaultPrompt = `
Tu es la gérante et coloriste passionnée du salon de coiffure "${SALON_INFOS.nom}", situé au ${SALON_INFOS.adresse} (Quartier Saint-Esprit, Bayonne, Pays Basque).

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

Thème du post : "${themeChoisi.nom}"
Sujet précis : "${sujetDuJour}"
${noteInstruction}
Lien de réservation en ligne : ${SALON_INFOS.planityUrl}

RÈGLES DE RÉDACTION INSTAGRAM :
1. TON : Chaleureux, solaire, expert, bienveillant, orienté bien-être et santé du cheveu. Parle directement à la lectrice ("vous"), suscite l'envie sans agressivité commerciale.
2. ACCROCHE (Première ligne) : Une phrase forte et captivante qui interpelle dans le fil d'actualité, accompagnée d'un emoji élégant (🌿, ✨, 💆‍♀️, 🤎, ☀️, ✂️).
3. CORPS DU POST (2 à 3 paragraphes courts et aérés) :
   - Mets l'accent sur les produits naturels, la coloration végétale sans chimie ou la couleur raisonnée pour protéger la santé.
   - Évoque si le sujet s'y prête l'ambiance chaleureuse terracotta et bois, le massage crânien relaxant au bac ou la dépollution du cheveu.
   - Partage une explication d'experte claire, concrète et accessible.
4. APPEL À L'ACTION (CTA) :
   - Invite à réserver sur Planity (lien en bio) ou à envoyer un message privé (DM) pour un conseil personnalisé.
   - Mentionne le salon au 37 Rue Maubec à Bayonne (Quartier Saint-Esprit).
5. HASHTAGS : Termine impérativement par une sélection de 10 à 15 hashtags pertinents, intégrant : ${hashtagsStr} #KoloreakCoiffure #BayonneMaubec #QuartierSaintEsprit
6. NE METS AUCUN GUILLEMET autour du texte final.
7. Ne génère aucune balise markdown de titre (pas de # Titre), utilise des sauts de ligne naturels et de jolis emojis.
8. LONGUEUR STRICTE : Reste impérativement entre 1 100 et 1 650 caractères au total (Instagram bloque les légendes > 2 200 caractères).
`;

    const prompt = (options.customPrompt && options.customPrompt.trim())
        ? options.customPrompt.trim()
        : defaultPrompt;

    let texteGenere = "";
    if (options.customCaption && options.customCaption.trim()) {
        texteGenere = options.customCaption.trim();
    } else {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            texteGenere = result.response.text().trim();
        } catch (errModele) {
            console.warn("⚠️ Modèle principal indisponible, tentative avec modèle alternatif...", errModele.message);
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await fallbackModel.generateContent(prompt);
            texteGenere = result.response.text().trim();
        }

        // Sécurité absolue Instagram : limite stricte à 2 150 caractères
        if (texteGenere.length > 2180) {
            texteGenere = texteGenere.slice(0, 2150).replace(/\s+[^\s]*$/, "");
        }
    }

    // 2. Enregistrement dans Firestore (collection 'instagram_posts')
    const postRef = db.collection("instagram_posts").doc();
    const docData = {
        caption: texteGenere,
        imageUrl: imageUrls[0],
        imageUrls: imageUrls,
        isCarousel: isCarousel,
        photoSalonIds: photosDocs.map(d => d.id),
        notePhoto: notesPhotos.join(" • ") || null,
        customInstruction: options.customInstruction || null,
        themeId: themeChoisi.id,
        themeNom: themeChoisi.nom,
        sujet: sujetDuJour,
        recommandationVisuel: themeChoisi.typeVisuel,
        hashtags: themeChoisi.hashtags,
        status: "brouillon",
        publicationDate: null,
        publishedAt: null,
        instagramMediaId: null,
        errorMessage: null,
        authorId: "system_gemini",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await postRef.set(docData);
    console.log(`📝 Brouillon créé dans Firestore (ID: ${postRef.id}, Carrousel: ${isCarousel})`);

    // 3. Publication automatique si configurée et demandée
    const shouldAutoPublish = options.forcePublish === true || 
        ((process.env.AUTO_PUBLISH_INSTAGRAM || "false").toLowerCase() === "true");

    const shouldMarkPhotosUsed = options.markPhotosUsed !== undefined 
        ? options.markPhotosUsed 
        : shouldAutoPublish;

    if (shouldMarkPhotosUsed) {
        // Marquer les photos du salon comme utilisées
        for (const pDoc of photosDocs) {
            try {
                await pDoc.ref.update({
                    used: true,
                    usedAt: admin.firestore.FieldValue.serverTimestamp(),
                    postId: postRef.id
                });
            } catch (e) {
                console.warn("Mise à jour photo salon :", e.message);
            }
        }
    }

    if (shouldAutoPublish) {
        console.log("🚀 Publication automatique activée, tentative d'envoi vers Instagram...");
        const pubResult = await publierSurInstagram(imageUrls, texteGenere);

        if (pubResult.success) {
            await postRef.update({
                status: "publie",
                instagramMediaId: pubResult.mediaId,
                publicationDate: admin.firestore.FieldValue.serverTimestamp(),
                publishedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return {
                success: true,
                docId: postRef.id,
                status: "publie",
                mediaId: pubResult.mediaId,
                isCarousel: isCarousel,
                theme: themeChoisi.nom,
                sujet: sujetDuJour,
                caption: texteGenere
            };
        } else {
            await postRef.update({
                status: "erreur_publication",
                errorMessage: pubResult.error,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return {
                success: false,
                docId: postRef.id,
                status: "erreur_publication",
                error: pubResult.error,
                theme: themeChoisi.nom,
                caption: texteGenere
            };
        }
    }

    return {
        success: true,
        docId: postRef.id,
        status: "brouillon",
        isCarousel: isCarousel,
        imageUrl: imageUrls[0],
        imageUrls: imageUrls,
        photoSalonIds: photosDocs.map(d => d.id),
        theme: themeChoisi.nom,
        sujet: sujetDuJour,
        caption: texteGenere,
        promptUsed: prompt,
        recommandationVisuel: themeChoisi.typeVisuel
    };
}

// ============================================================================
// 5. FONCTION PLANIFIÉE : CRÉATION & PUBLICATION PÉRIODIQUE (Mardis, Jeudis, Dimanches)
// ============================================================================
// ⏸️ EN PAUSE : Travail en cours avec Aude sur la charte éditoriale et le prompt initial
exports.genererPostInstagram = onSchedule({
    schedule: "0 12 * * 2,4,0", // Mardis, jeudis et dimanches à 12h00 (heure optimale salon)
    timeZone: "Europe/Paris"
}, async (event) => {
    console.log("⏸️ Publications automatiques en pause : en attente de la validation du prompt et des directives salon.");
    return null;
});

// ============================================================================
// 6. DÉCLENCHEUR HTTP : TESTER LA GÉNÉRATION & PUBLICATION MANUELLEMENT
// ============================================================================
exports.testerPublicationInstagram = onRequest(async (req, res) => {
    try {
        const { theme, publish, image } = req.query;
        console.log(`⚡ Déclencheur manuel reçu (Thème: ${theme || "auto"}, Publier: ${publish})`);

        const result = await executerGenerationInstagram({
            themeId: theme,
            forcePublish: publish === "true",
            imageUrl: image
        });

        return res.json(result);
    } catch (err) {
        console.error("❌ Erreur testerPublicationInstagram :", err);
        return res.status(500).json({ error: err.message || String(err) });
    }
});

// ============================================================================
// 7. DÉCLENCHEUR HTTP : PUBLIER UN BROUILLON FIRESTORE EXISTANT
// ============================================================================
exports.publierBrouillonInstagram = onRequest(async (req, res) => {
    try {
        const { id, force } = req.query;
        let postDoc;

        if (id) {
            postDoc = await db.collection("instagram_posts").doc(id).get();
        } else {
            // Prendre le dernier brouillon non encore publié
            const snap = await db.collection("instagram_posts")
                .where("status", "==", "brouillon")
                .orderBy("createdAt", "desc")
                .limit(1)
                .get();
            if (!snap.empty) postDoc = snap.docs[0];
        }

        if (!postDoc || !postDoc.exists) {
            return res.status(404).json({ error: "Aucun brouillon trouvé à publier." });
        }

        const data = postDoc.data();
        if (data.status === "publie" && force !== "true") {
            return res.status(400).json({ error: "Ce post a déjà été publié sur Instagram. Ajoutez &force=true pour forcer." });
        }

        const pubResult = await publierSurInstagram(data.imageUrl, data.caption);

        if (pubResult.success) {
            await postDoc.ref.update({
                status: "publie",
                instagramMediaId: pubResult.mediaId,
                publicationDate: admin.firestore.FieldValue.serverTimestamp(),
                publishedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return res.json({ success: true, docId: postDoc.id, mediaId: pubResult.mediaId });
        } else {
            await postDoc.ref.update({
                status: "erreur_publication",
                errorMessage: pubResult.error,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return res.status(500).json({ success: false, docId: postDoc.id, error: pubResult.error });
        }
    } catch (err) {
        console.error("❌ Erreur publierBrouillonExistant :", err);
        return res.status(500).json({ error: err.message || String(err) });
    }
});

// ============================================================================
// 8. CRM & RELANCE FIDÉLISATION (Optionnel : Relance soin & balayage après 6-8 semaines)
// ============================================================================
exports.relanceClientKoloreak = onDocumentCreated("clients/{clientId}", async (event) => {
    const snap = event.data;
    if (!snap) return;

    const client = snap.data();
    if (client.reminderStatus !== "en_attente") return null;

    try {
        console.log(`💌 Préparation d'une relance personnalisée pour ${client.name}...`);
        const prompt = `
Tu es l'équipe du salon Koloreak à Bayonne. Rédige un message court et bienveillant (SMS ou email, max 70 mots) pour notre cliente ${client.name}.
Contexte : Sa dernière visite au salon était pour "${client.serviceType || "un soin ou balayage"}".
Objectif : Prendre de ses nouvelles, lui demander comment évolue sa chevelure et lui proposer de passer pour un diagnostic ou un rituel de soin/gloss pour raviver l'éclat de ses cheveux.
Lien de réservation : ${SALON_INFOS.planityUrl}
Ton chaleureux, zéro pression commerciale, bienveillance absolue.
`;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const messageTexte = result.response.text().trim();

        await snap.ref.update({
            messageRelanceGenere: messageTexte,
            reminderStatus: "pret",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Envoi par email si adresse fournie et Gmail configuré
        if (client.email && process.env.GMAIL_EMAIL && process.env.GMAIL_PASSWORD) {
            await transporter.sendMail({
                from: `"Koloreak Coiffure" <${process.env.GMAIL_EMAIL}>`,
                to: client.email,
                subject: "Des nouvelles de votre chevelure ✨ - Koloreak Bayonne",
                text: messageTexte
            });
            await snap.ref.update({
                reminderStatus: "envoye",
                dateEnvoiRelance: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Email de relance envoyé à ${client.email}`);
        }

        return true;
    } catch (err) {
        console.error("❌ Erreur relanceClientSoin :", err);
        await snap.ref.update({
            reminderStatus: "erreur",
            errorMessage: err.message || String(err),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return false;
    }
});

// ============================================================================
// 9. APPLICATION WEB PRIVÉE DU SALON : PORTAIL PHOTOS SUR TABLETTE & SMARTPHONE
// ============================================================================
exports.appSalon = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
    const path = req.path || "/";
    const method = req.method;

    function isPinValid(providedPin) {
        const expected = process.env.SALON_PIN || SALON_PIN_DEFAULT;
        return providedPin && (String(providedPin).trim() === expected || String(providedPin).trim() === "koloreak");
    }

    // 1. ROUTE API : UPLOAD DE PHOTO DU SALON (Simple ou Multiple)
    if (path.includes("/api/upload") && method === "POST") {
        try {
            const { pin, themeId, photoBase64, note, photos } = req.body || {};
            if (!isPinValid(pin)) {
                return res.status(403).json({ success: false, error: "Code d'accès salon incorrect." });
            }

            const photosList = Array.isArray(photos) && photos.length > 0 
                ? photos 
                : (photoBase64 ? [{ photoBase64, themeId, note }] : []);

            if (photosList.length === 0) {
                return res.status(400).json({ success: false, error: "Aucune photo sélectionnée." });
            }

            const savedPhotos = [];
            for (const item of photosList) {
                if (!item.photoBase64) continue;
                const matches = item.photoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                const base64Data = matches ? matches[2] : item.photoBase64;
                const buffer = Buffer.from(base64Data, "base64");

                const safeTheme = item.themeId || themeId || "salon_ambiance";
                const fileName = `salon/${safeTheme}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                const file = bucket.file(fileName);

                await file.save(buffer, {
                    metadata: {
                        contentType: "image/jpeg",
                        metadata: {
                            themeId: safeTheme,
                            salon: "Koloreak",
                            uploadedAt: new Date().toISOString()
                        }
                    }
                });

                const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;

                const photoDoc = await db.collection("photos_salon").add({
                    themeId: safeTheme,
                    url: publicUrl,
                    gcsPath: fileName,
                    note: (item.note || note || "").trim(),
                    used: false,
                    usedAt: null,
                    postId: null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                savedPhotos.push({ id: photoDoc.id, url: publicUrl });
            }

            console.log(`📸 ${savedPhotos.length} photo(s) ajoutée(s) à la réserve Koloreak.`);
            return res.json({ success: true, count: savedPhotos.length, photos: savedPhotos });

        } catch (err) {
            console.error("❌ Erreur upload photo salon :", err);
            return res.status(500).json({ success: false, error: err.message || String(err) });
        }
    }

    // 2. ROUTE API : LISTE DES PHOTOS EN RÉSERVE
    if (path.includes("/api/photos") && method === "GET") {
        try {
            const pin = req.query.pin;
            if (!isPinValid(pin)) {
                return res.status(403).json({ success: false, error: "Code d'accès salon incorrect." });
            }

            const snap = await db.collection("photos_salon")
                .orderBy("createdAt", "desc")
                .limit(50)
                .get();

            const photos = snap.docs.map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    themeId: d.themeId,
                    url: d.url,
                    note: d.note || "",
                    used: !!d.used,
                    createdAt: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toISOString() : null
                };
            });

            return res.json({ success: true, photos });
        } catch (err) {
            console.error("❌ Erreur lecture photos salon :", err);
            return res.status(500).json({ success: false, error: err.message || String(err) });
        }
    }

    // 3. ROUTE API : SUPPRIMER UNE PHOTO
    if (path.includes("/api/delete") && method === "POST") {
        try {
            const { pin, photoId } = req.body || {};
            if (!isPinValid(pin)) {
                return res.status(403).json({ success: false, error: "Code d'accès salon incorrect." });
            }
            if (!photoId) {
                return res.status(400).json({ success: false, error: "ID de photo manquant." });
            }

            const docRef = db.collection("photos_salon").doc(photoId);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                const data = docSnap.data();
                if (data.gcsPath) {
                    try {
                        await bucket.file(data.gcsPath).delete();
                    } catch (e) {
                        console.warn("Fichier GCS non trouvé :", e.message);
                    }
                }
                await docRef.delete();
            }

            return res.json({ success: true });
        } catch (err) {
            console.error("❌ Erreur suppression photo :", err);
            return res.status(500).json({ success: false, error: err.message || String(err) });
        }
    }

    // 4. ROUTE API : GÉNÉRER L'APERÇU DU POST PAR GEMINI (SANS PUBLIER)
    if (path.includes("/api/generer-preview") && method === "POST") {
        try {
            const { pin, photoId, photoIds, themeId, customInstruction, customPrompt } = req.body || {};
            if (!isPinValid(pin)) {
                return res.status(403).json({ success: false, error: "Code d'accès salon incorrect." });
            }

            const ids = Array.isArray(photoIds) && photoIds.length > 0 
                ? photoIds 
                : (photoId ? [photoId] : []);

            if (ids.length === 0) {
                return res.status(400).json({ success: false, error: "Aucune photo sélectionnée." });
            }

            console.log(`✨ Génération aperçu demandée pour ${ids.length} photo(s)...`);
            const result = await executerGenerationInstagram({
                photoIds: ids,
                themeId: themeId,
                customInstruction: customInstruction,
                customPrompt: customPrompt,
                forcePublish: false,
                markPhotosUsed: false
            });

            return res.json(result);
        } catch (err) {
            console.error("❌ Erreur génération aperçu :", err);
            return res.status(500).json({ success: false, error: err.message || String(err) });
        }
    }

    // 5. ROUTE API : CONFIRMER ET PUBLIER SUR INSTAGRAM AVEC TEXTE VALIDÉ / RETOUCHÉ
    if (path.includes("/api/publier-valide") && method === "POST") {
        try {
            const { pin, docId, photoIds, caption, imageUrls } = req.body || {};
            if (!isPinValid(pin)) {
                return res.status(403).json({ success: false, error: "Code d'accès salon incorrect." });
            }

            let postRef = null;
            let finalCaption = caption;
            let finalImages = imageUrls;
            let finalPhotoIds = photoIds || [];

            if (docId) {
                postRef = db.collection("instagram_posts").doc(docId);
                const s = await postRef.get();
                if (s.exists) {
                    const data = s.data();
                    if (!finalCaption) finalCaption = data.caption;
                    if (!finalImages || finalImages.length === 0) {
                        finalImages = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
                    }
                    if (finalPhotoIds.length === 0 && data.photoSalonIds) {
                        finalPhotoIds = data.photoSalonIds;
                    }
                }
            }

            if (!finalImages || finalImages.length === 0) {
                return res.status(400).json({ success: false, error: "Aucune image spécifiée pour la publication." });
            }
            if (!finalCaption || !finalCaption.trim()) {
                return res.status(400).json({ success: false, error: "Le texte de publication ne peut pas être vide." });
            }

            console.log(`🚀 Publication confirmée pour ${finalImages.length} image(s)...`);
            const pubResult = await publierSurInstagram(finalImages, finalCaption);

            if (pubResult.success) {
                if (postRef) {
                    await postRef.update({
                        caption: finalCaption,
                        status: "publie",
                        instagramMediaId: pubResult.mediaId,
                        publicationDate: admin.firestore.FieldValue.serverTimestamp(),
                        publishedAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }

                // Marquer les photos comme utilisées dans la réserve
                for (const pid of finalPhotoIds) {
                    try {
                        await db.collection("photos_salon").doc(pid).update({
                            used: true,
                            usedAt: admin.firestore.FieldValue.serverTimestamp(),
                            postId: docId || null
                        });
                    } catch (e) {
                        console.warn("Mise à jour photo salon :", e.message);
                    }
                }

                return res.json({ success: true, mediaId: pubResult.mediaId, docId: docId });
            } else {
                if (postRef) {
                    await postRef.update({
                        caption: finalCaption,
                        status: "erreur_publication",
                        errorMessage: pubResult.error,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                return res.status(500).json({ success: false, error: pubResult.error, docId: docId });
            }
        } catch (err) {
            console.error("❌ Erreur publier valide :", err);
            return res.status(500).json({ success: false, error: err.message || String(err) });
        }
    }

    // 6. ROUTE API : PUBLIER DIRECT SUR INSTAGRAM (Photo Unique OU Carrousel Multi-Photos)
    if (path.includes("/api/publier-maintenant") && method === "POST") {
        try {
            const { pin, photoId, photoIds } = req.body || {};
            if (!isPinValid(pin)) {
                return res.status(403).json({ success: false, error: "Code d'accès salon incorrect." });
            }

            const idsToPublish = Array.isArray(photoIds) && photoIds.length > 0 
                ? photoIds 
                : (photoId ? [photoId] : []);

            if (idsToPublish.length === 0) {
                return res.status(400).json({ success: false, error: "Aucune photo sélectionnée." });
            }

            console.log(`🚀 Publication directe demandée pour ${idsToPublish.length} photo(s)...`);
            const result = await executerGenerationInstagram({
                photoIds: idsToPublish,
                forcePublish: true
            });

            return res.json(result);
        } catch (err) {
            console.error("❌ Erreur publication immédiate :", err);
            return res.status(500).json({ success: false, error: err.message || String(err) });
        }
    }

    // 7. PAGE D'ACCUEIL : SERVIR L'INTERFACE WEB HTML
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(getPortalHtml());
});

// ============================================================================
// 10. MAINTENANCE AUTOMATIQUE : PURGE DES PHOTOS PUBLIÉES (> 30 JOURS)
// ============================================================================
exports.nettoyagePhotosSalon = onSchedule({
    schedule: "0 3 * * 0", // Chaque dimanche à 03h00 (Europe/Paris)
    timeZone: "Europe/Paris"
}, async (event) => {
    try {
        console.log("🧹 Lancement du nettoyage automatique des anciennes photos du salon...");
        const ilYa30Jours = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // 1. Photos déjà publiées depuis plus de 30 jours (archivées chez Instagram)
        const snapPubliees = await db.collection("photos_salon")
            .where("used", "==", true)
            .where("usedAt", "<=", admin.firestore.Timestamp.fromDate(ilYa30Jours))
            .limit(100)
            .get();

        let countSupprimees = 0;
        for (const doc of snapPubliees.docs) {
            const data = doc.data();
            if (data.gcsPath) {
                try {
                    await bucket.file(data.gcsPath).delete();
                } catch (e) {
                    // Ignorer si déjà supprimé par le cycle de vie GCS
                }
            }
            await doc.ref.delete();
            countSupprimees++;
        }

        console.log(`✅ Nettoyage terminé : ${countSupprimees} anciennes photos purgées.`);
    } catch (err) {
        console.error("❌ Erreur nettoyage automatique :", err);
    }
});
