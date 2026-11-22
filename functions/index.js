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
    activite: "Salon de coiffure holistique, coloriste et bien-être capillaire",
    adresse: process.env.SALON_ADDRESS || "37 Rue Maubec, 64100 Bayonne",
    telephone: process.env.SALON_PHONE || "05 35 39 51 64",
    planityUrl: process.env.PLANITY_URL || "https://www.planity.com/koloreak-64100-bayonne",
    valeurs: [
        "Coloration 100% végétale et botanique respectueuse du cheveu et de la santé",
        "Balayages et blonds lumineux sur-mesure sans effet barre ni démarcation",
        "Soins capillaires, massages crâniens relaxants et bien-être.",
        "Diagnostic visagiste personnalisé et respect de la matière naturelle du cheveu",
        "Ancrage local au Pays Basque (Bayonne), esprit chaleureux et bienveillant"
    ]
};

const THEMES_MARKETING = [
    {
        id: "coloration_vegetale",
        nom: "Coloration Végétale & Botanique",
        description: "Mettre en avant les bienfaits des plantes tinctoriales : gainage de la fibre, brillance miroir, couverture des cheveux blancs sans abîmer, alternative saine aux colorations chimiques.",
        sujets: [
            "Pourquoi passer à la coloration végétale : la métamorphose de votre cheveu qui retrouve force et brillance naturelle.",
            "Couvrir ses cheveux blancs naturellement avec les poudres de plantes sans effet racine brutal ni oxydation.",
            "Coloration végétale vs chimique : comment la couleur végétale forme un bouclier protecteur au lieu de fragiliser le cheveu.",
            "La brillance incomparable d'une coloration 100% botanique sous la lumière du Pays Basque.",
            "Transition capillaire : comment préparer sa chevelure pour adopter la couleur végétale en toute sérénité."
        ],
        hashtags: [
            "#Koloreak", "#ColorationVegetale", "#CoiffureNaturelle", "#CheveuxSains",
            "#CoiffeurBayonne", "#Bayonne", "#PaysBasque", "#PlantesTinctoriales",
            "#BeauteHolistique", "#CoiffureVegetale", "#SlowBeauty"
        ],
        typeVisuel: "Gros plan sur une chevelure brillante aux reflets cuivrés ou chocolat en lumière naturelle, bol en bois avec préparation de poudres de plantes."
    },
    {
        id: "balayage_signature",
        nom: "Balayage & Éclaircissement Sur-Mesure",
        description: "Sublimer la chevelure avec un fondu ultra-naturel, un blond bébé, doré ou beige, une patine gloss sur-mesure pour un résultat lumineux sans entretien contraignant.",
        sujets: [
            "Le secret d'un balayage lumineux sans effet racine : un fondu subtil pensé sur-mesure pour votre coupe.",
            "Blond beige, miel ou doré : comment choisir la nuance parfaite selon votre carnation et la forme de votre visage.",
            "Le pouvoir de la patine / gloss : redonner un éclat éclatant et neutraliser les reflets indésirables en un instant.",
            "French balayage et mèches personnalisées : l'art de capturer la lumière sans abîmer votre fibre capillaire.",
            "Entretenir son balayage pour qu'il reste éclatant plusieurs mois après votre passage au salon."
        ],
        hashtags: [
            "#Koloreak", "#BalayageBayonne", "#BlondSurMesure", "#FrenchBalayage",
            "#CoiffeurBayonne", "#PaysBasque", "#BlondPolaire", "#GlossCapillaire",
            "#HairTransformation", "#ColoristeBayonne"
        ],
        typeVisuel: "Photo de dos et trois-quarts mettant en valeur un dégradé de balayage ondulé (wavy) avec une belle luminosité."
    },
    {
        id: "Soin bien_etre",
        nom: "Soin Capillaire Massage Crânien",
        description: "Vivre une véritable parenthèse de détente : rituels de soins profonds, massage relaxant du cuir chevelu, stimulation de la pousse, lâcher-prise total.",
        sujets: [
            "Offrez-vous une parenthèse hors du temps : l'expérience de notre massage crânien pour libérer toutes les tensions.",
            "Le cuir chevelu est le sol de vos cheveux : pourquoi un gommage et un soin profond changent absolument tout.",
            "Le rituel soin capillaire chez Koloreak : quand le soin des cheveux devient un moment de relaxation holistique.",
            "Fatigue, stress, changement de saison : le protocole idéal pour revitaliser vos racines et stimuler la vitalité.",
            "Prendre soin de soi au cœur de Bayonne : venez  vous détendre dans notre salon et laissez vos cheveux respirer.",

        ],
        hashtags: [
            "#Koloreak", "#SpaCapillaire", "#MassageCranien", "#BienEtreBayonne",
            "#DetenteAbsolue", "#SoinCheveux", "#CoiffureHolistique", "#BayonneMaubec",
            "#PrendreSoinDeSoi", "#PaysBasque"
        ],
        typeVisuel: "Atmosphère cocooning, serviette douce, vapeur de soin, mains prodiguant un massage au bac dans une ambiance apaisante."
    },
    {
        id: "avant_apres",
        nom: "Avant / Après & Métamorphoses",
        description: "Présenter des métamorphoses réelles de clientes : correction de couleur, transition réussie, nouvelle coupe fraîche et dynamique.",
        sujets: [
            "Transformation du jour : passer d'une couleur terne à un balayage éclatant plein de reflets vivants.",
            "Du long abîmé au carré structuré : oser la coupe qui valorise les traits du visage et redonne du volume.",
            "Retrouver des cheveux forts après des années de décolorations agressives : le parcours de cette cliente chez Koloreak.",
            "Lumière sur une métamorphose toute en subtilité : respecter la personnalité tout en révélant la beauté naturelle.",
            "Avant / Après : le pouvoir d'une coupe texturisée et d'un gloss rafraîchissant pour dynamiser l'allure."
        ],
        hashtags: [
            "#Koloreak", "#AvantApresCoiffure", "#BeforeAndAfterHair", "#HairMakeover",
            "#CoiffureBayonne", "#PaysBasque", "#TransformationCapillaire", "#CheveuxSains"
        ],
        typeVisuel: "Collage ou carrousel Avant / Après avec cadrage identique et éclairage professionnel mettant en avant la texture."
    },
    {
        id: "conseils_experte",
        nom: "Conseils d'Experte & Routine Maison",
        description: "Partager des astuces de pro faciles à appliquer chez soi : fréquence des shampoings, protection thermique, brossage doux, soins naturels.",
        sujets: [
            "Les 3 erreurs courantes sous la douche qui ternissent votre couleur plus vite que prévu.",
            "Comment bien sécher ses cheveux pour préserver leur hydratation sans frisottis indésirables.",
            "L'importance d'espacer ses shampoings et comment choisir une formule douce sans sulfates ni silicones occlusifs.",
            "Protéger ses cheveux du vent, du sel de l'océan et des UV : le rituel indispensable au Pays Basque.",
            "À quelle fréquence faut-il vraiment couper ses pointes pour garder une longueur dense et saine ?"
        ],
        hashtags: [
            "#Koloreak", "#AstucesCoiffure", "#ConseilsCapillaires", "#RoutineCheveux",
            "#CoiffeurBayonne", "#Bayonne", "#CheveuxNaturels", "#ProduitsSains"
        ],
        typeVisuel: "Photo soignée de flacons de soins bio, brosse en bois naturelle, ou geste de coiffage appliqué sur une mèche."
    },
    {
        id: "agenda_dispos",
        nom: "Disponibilités & Rendez-vous",
        description: "Créer l'urgence bienveillante pour les réservations de fin de semaine, créneaux libres de dernière minute et fêtes.",
        sujets: [
            "Quelques créneaux disponibles cette semaine chez Koloreak pour vous chouchouter avant le week-end !",
            "Envie d'un coup d'éclat avant un événement ou tout simplement pour vous faire plaisir ? Réservez votre créneau en 1 clic.",
            "L'anticipation est la clé : pensez à bloquer votre rendez-vous balayage ou couleur pour briller toute la saison.",
            "Une place s'est libérée jeudi après-midi au salon : premier arrivé, premier sublimé !",
            "Votre moment de pause vous attend au 37 Rue Maubec à Bayonne. Prenez rendez-vous en ligne 24h/24."
        ],
        hashtags: [
            "#Koloreak", "#CoiffeurBayonne", "#Planity", "#RendezVousCoiffure",
            "#Bayonne", "#BayonneCentre", "#PaysBasque", "#SalonDeCoiffure"
        ],
        typeVisuel: "Vue chaleureuse de l'intérieur du salon Koloreak (miroirs, fauteuils confortables, plantes vertes, ambiance lumineuse)."
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
Tu es la gérante et coloriste passionnée du salon de coiffure holistique "${SALON_INFOS.nom}", situé au ${SALON_INFOS.adresse}.
Ton salon est réputé pour sa bienveillance, son expertise en coloration végétale, ses balayages lumineux personnalisés et ses rituels spa du cheveu.

Rédige une publication Instagram percutante et chaleureuse pour le compte du salon.

Thème du post : "${themeChoisi.nom}"
Sujet précis : "${sujetDuJour}"
${noteInstruction}
Lien de réservation en ligne : ${SALON_INFOS.planityUrl}

RÈGLES STRICTES DE RÉDACTION INSTAGRAM :
1. TON : Chaleureux, solaire, expert, bienveillant et authentique. Parle directement à la cliente ("vous"), crée de l'émotion et de l'envie sans jamais être agressif commercialement.
2. ACCROCHE (Première ligne) : Une phrase forte et captivante qui interpelle la lectrice dans son fil d'actualité, accompagnée d'un emoji élégant.
3. CORPS DU POST (2 à 3 paragraphes courts et aérés) :
   - Explique concrètement le bienfait (toucher du cheveu, éclat, respect de la santé, moment de détente).
   - Donne un conseil ou une explication d'experte facile à comprendre.
4. APPEL À L'ACTION (CTA) :
   - Invite chaleureusement à réserver son créneau sur Planity (lien en bio) ou à envoyer un message privé (DM) pour un conseil personnalisé.
   - Mentionne subtilement l'adresse ou le quartier (Rue Maubec, Bayonne).
5. HASHTAGS : Termine impérativement par une liste de 10 à 15 hashtags pertinents, intégrant : ${hashtagsStr} #KoloreakCoiffure #BayonneMaubec
6. NE METS AUCUN GUILLEMET autour du texte final.
7. Ne génère pas de balises markdown de titre (pas de # Titre), utilise des sauts de ligne naturels et des emojis adaptés au monde de la coiffure (✨, 🌿, 💆‍♀️, 🌸, ☀️, ✂️).
8. LONGUEUR STRICTE : Reste impérativement entre 1 200 et 1 700 caractères au total. Instagram INTERDIT et BLOQUE toute légende dépassant 2 200 caractères. Sois concis, élégant et aéré.
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
