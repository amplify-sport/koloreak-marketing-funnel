/**
 * Script de publication manuelle immédiate sur Instagram
 * 
 * Usage :
 *   node scripts/upload-instagram-post.js --image "https://mon-image.jpg" --caption "Mon texte..."
 *   node scripts/upload-instagram-post.js --test
 */

const path = require("path");
const fs = require("fs");

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

const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
const token = process.env.INSTAGRAM_ACCESS_TOKEN;

async function uploadPost(imageUrl, caption) {
    if (!accountId || !token) {
        console.error("❌ Erreur : INSTAGRAM_ACCOUNT_ID et INSTAGRAM_ACCESS_TOKEN doivent être définis dans functions/.env");
        process.exit(1);
    }

    console.log(`🚀 Publication d'un post Instagram pour le compte ${accountId}...`);
    console.log(`🖼️ URL de l'image : ${imageUrl}`);
    console.log(`📝 Légende :\n${caption}\n`);

    try {
        // 1. Créer le conteneur
        const containerUrl = new URL(`https://graph.facebook.com/v20.0/${accountId}/media`);
        containerUrl.searchParams.append("image_url", imageUrl);
        containerUrl.searchParams.append("caption", caption);
        containerUrl.searchParams.append("access_token", token);

        const containerRes = await fetch(containerUrl.toString(), { method: "POST" });
        const containerData = await containerRes.json();

        if (!containerRes.ok || !containerData.id) {
            console.error("❌ Erreur création conteneur :", containerData);
            return;
        }

        const creationId = containerData.id;
        console.log(`✅ Conteneur créé (ID: ${creationId}). Attente 3 secondes...`);
        await new Promise(r => setTimeout(r, 3000));

        // 2. Publier le conteneur
        const publishUrl = new URL(`https://graph.facebook.com/v20.0/${accountId}/media_publish`);
        publishUrl.searchParams.append("creation_id", creationId);
        publishUrl.searchParams.append("access_token", token);

        const publishRes = await fetch(publishUrl.toString(), { method: "POST" });
        const publishData = await publishRes.json();

        if (!publishRes.ok || !publishData.id) {
            console.error("❌ Erreur publication :", publishData);
            return;
        }

        console.log(`🎉 SUCCÈS ! Post publié sur Instagram ! ID Média : ${publishData.id}`);
    } catch (e) {
        console.error("❌ Exception :", e.message);
    }
}

function getArg(flag) {
    const idx = process.argv.indexOf(flag);
    return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
}

const isTest = process.argv.includes("--test");
const imgArg = getArg("--image") || process.env.DEFAULT_MEDIA_URL || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80";
const captionArg = getArg("--caption") || `✨ Nouvelle semaine, nouvel éclat chez Koloreak ! 🌿\n\nOffrez à votre chevelure le soin et la lumière qu'elle mérite au cœur de Bayonne.\n\n👉 Réservations en ligne sur Planity (lien en bio)\n📍 37 Rue Maubec, Bayonne\n\n#Koloreak #CoiffureBayonne #ColorationVegetale #PaysBasque`;

if (isTest) {
    console.log("Mode test sélectionné :");
    uploadPost(imgArg, captionArg);
} else {
    uploadPost(imgArg, captionArg);
}
