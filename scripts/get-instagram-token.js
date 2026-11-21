/**
 * Guide et vérificateur interactif pour les identifiants Instagram Graph API (Meta).
 * 
 * Ce script vérifie :
 * 1. La validité du Token d'accès Meta (User ou Page Token)
 * 2. La détection des comptes Instagram Business ou Creator liés à vos pages Facebook
 * 3. Les permissions accordées (instagram_basic, instagram_content_publish)
 * 
 * Usage :
 *   node scripts/get-instagram-token.js
 */

const readline = require("readline");
const path = require("path");
const fs = require("fs");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(q) {
    return new Promise(resolve => rl.question(q, resolve));
}

async function verifyToken(token) {
    console.log("\n🔍 Vérification du token auprès de Meta Graph API...");
    try {
        // 1. Récupérer les pages Facebook du compte
        const res = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${token}`);
        const data = await res.json();

        if (data.error) {
            console.error("❌ Erreur retournée par Meta :", data.error.message);
            return;
        }

        if (!data.data || data.data.length === 0) {
            console.log("⚠️ Aucune page Facebook trouvée pour ce token.");
            console.log("Rappel : Votre compte Instagram 'Koloreak' doit être lié à une Page Facebook (compte Pro ou Créateur).");
            return;
        }

        console.log(`✅ ${data.data.length} Page(s) Facebook trouvée(s) :`);

        for (const page of data.data) {
            console.log(`\n📌 Page : "${page.name}" (ID: ${page.id})`);
            
            // Chercher le compte Instagram lié à cette page
            const igRes = await fetch(`https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account&access_token=${token}`);
            const igData = await igRes.json();

            if (igData.instagram_business_account && igData.instagram_business_account.id) {
                const igId = igData.instagram_business_account.id;
                console.log(`   🎉 Compte Instagram Business détecté !`);
                console.log(`   👉 INSTAGRAM_ACCOUNT_ID = ${igId}`);

                // Récupérer le nom d'utilisateur Instagram
                const igProfileRes = await fetch(`https://graph.facebook.com/v20.0/${igId}?fields=username,name&access_token=${token}`);
                const igProfile = await igProfileRes.json();
                if (igProfile.username) {
                    console.log(`   👉 Compte Instagram : @${igProfile.username} (${igProfile.name || ""})`);
                }

                console.log("\n💡 Copiez ces valeurs dans votre fichier 'functions/.env' :");
                console.log(`INSTAGRAM_ACCOUNT_ID=${igId}`);
                console.log(`INSTAGRAM_ACCESS_TOKEN=${token}`);
            } else {
                console.log("   ℹ️ Aucun compte Instagram Business n'est encore associé à cette page.");
                console.log("   👉 Associez votre compte Instagram dans les paramètres de la page Facebook (Meta Business Suite).");
            }
        }
    } catch (e) {
        console.error("❌ Exception :", e.message);
    }
}

async function main() {
    console.log("================================================================================");
    console.log("🌿 ASSISTANT CONFIGURATION INSTAGRAM GRAPH API - SALON KOLOREAK");
    console.log("================================================================================\n");
    console.log("Pour publier automatiquement sur Instagram, Meta requiert :");
    console.log("1. Un compte Instagram 'Professionnel' (Business) ou 'Créateur'.");
    console.log("2. Une Page Facebook associée à ce compte Instagram.");
    console.log("3. Une application créée sur https://developers.facebook.com/");
    console.log("   (avec les permissions : 'instagram_basic', 'instagram_content_publish', 'pages_show_list')");
    console.log("4. Un Access Token généré depuis le Graph API Explorer ou votre app.\n");

    const envPath = path.resolve(__dirname, "../functions/.env");
    let existingToken = "";
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        const match = content.match(/INSTAGRAM_ACCESS_TOKEN=([^\r\n]+)/);
        if (match && match[1].trim()) existingToken = match[1].trim();
    }

    if (existingToken) {
        console.log("🔑 Un token existant a été trouvé dans 'functions/.env'.");
        const useExisting = await ask("Voulez-vous vérifier ce token existant ? (o/n) : ");
        if (useExisting.toLowerCase().startsWith("o") || useExisting === "") {
            await verifyToken(existingToken);
            rl.close();
            return;
        }
    }

    const inputToken = await ask("Collez votre Access Token Meta (ou appuyez sur Entrée pour quitter) : ");
    if (inputToken.trim()) {
        await verifyToken(inputToken.trim());
    }

    rl.close();
}

main();
